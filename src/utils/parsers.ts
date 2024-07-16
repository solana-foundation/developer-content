import { SupportedDocTypes } from "@/types";
import { computeNavItem, shouldIgnoreRecord } from "./navItem";
import { CONTENT_API_URL, REGEX_MARKDOWN_LINKS } from "./constants";

/**
 * Props for the `extractFeaturedRecords` function
 */
export type ExtractFeaturedRecordsProps = {
  /**
   * array listing of records to search for featured children
   */
  records: Array<SupportedDocTypes>;
  /**
   * max number of records to return
   */
  limit?: number;
  /**
   * Whether or not to add un-featured "filler" records into the response to
   * attempt to reach the goal `limit` count of records to be returned
   */
  addFillerRecords?: boolean;
  /**
   * When filler records are added, optionally randomize them in the response
   *
   * note: non-filler records are still sorted by their featured priority
   * and therefore not randomized
   */
  randomizeFillerRecords?: boolean;
  /**
   * Run a provided callback function on the returning records
   */
  callback?: Function;
};

/**
 * Extract a listing of featured records from a provided listing
 */
export function extractFeaturedRecords({
  records,
  limit = 3,
  addFillerRecords = false,
  randomizeFillerRecords = false,
  callback,
}: ExtractFeaturedRecordsProps) {
  // filter for the records marked as features, with sort by priority
  let featuredRecords = records
    .filter(item => item?.featured == true)
    .sort(
      (a, b) =>
        new Date(a.featuredPriority || 999).getTime() -
        new Date(b.featuredPriority || 999).getTime(),
    );

  // attempt to enforce the goal `limit` using filler records (when desired)
  if (addFillerRecords && featuredRecords.length < limit) {
    // random the filler records when filler records are used to reach the desired record `limit`
    if (randomizeFillerRecords)
      records = records.sort(() => 0.5 - Math.random());
    // add the filler records
    featuredRecords.push(...records.slice(0, limit));
  }
  // enforce the record `limit`
  featuredRecords = featuredRecords.slice(0, limit);

  // run the callback function, when desired
  if (typeof callback == "function") return callback(featuredRecords);

  return featuredRecords;
}

/**
 * Simplify the data stored within each record within a list, removing
 * ignored items (i.e. drafts) and delete attributes
 */
export function simplifyRecords(
  records: Array<SupportedDocTypes>,
  attributesToDelete = ["_id", "_raw", "body", "type"],
) {
  const listing: Array<SupportedDocTypes> = [];

  records.map(record => {
    if (shouldIgnoreRecord({ fileName: record._raw.sourceFileName })) return;

    // @ts-ignore
    const navItem = computeNavItem(record);

    if (!navItem.href) return;

    record = Object.assign(navItem, record);

    const attrList = [];

    if (!record.featured) attrList.push("featured", "featuredPriority");
    if (!record?.metaOnly) attrList.push("metaOnly");

    // remove the undesired attributes from the response
    // @ts-ignore
    attributesToDelete.concat(attrList).forEach(e => delete record[e]);

    listing.push(record);
  });

  return listing;
}

/**
 * Pre process the content of a record to fix any formatting issues that may cause the MDX renderer to fail
 */
export function preProcessContent(content: string = ""): string {
  if (!content) return "[err] no content provided";

  // manually correct some of the markdown formatting that `mdx.serialize` does not lik:
  content = content
    .trim()
    // convert `tsx` and `jsx` codeblocks to `typescript` for better syntax highlighting
    .replaceAll(/```(tsx|jsx)/gm, "```typescript")
    // some translators replace quotes with a different symbol `«`
    .replaceAll(/\«(.*)\»/gm, '"$1"');

  // process all markdown links (e.g. remove ".md" and handle relative links)
  content = processMarkdownLinks(content.trim());

  // process all text to not alter the internals of code blocks
  const parts = content.split(/(```[\s\S]*?```)/);
  for (let i = 0; i < parts.length; i++) {
    if (!parts[i].startsWith("```")) {
      parts[i] = parts[i]
        // remove html/markdown comments (since they break mdx-remote's serialize)
        .replaceAll(/<!--[^>]*-->/gm, "")
        // correct math symbols that break the mdx parser
        .replaceAll(/ <= /gm, " {'<='} ")
        .replaceAll(/ >= /gm, " {'>='} ")
        .replaceAll(/ > /gm, " {'>'} ")
        .replaceAll(/ < /gm, " {'>'} ")
        // fix formatting issues for mdx component ending tags
        // note: this seems to be common after content is processed by crowdin...
        .replaceAll(/\<\/(.*)\>$/gm, "\n</$1>")
        .replaceAll(/^\<(.*)\>/gm, "\n<$1>\n");
    }
  }

  // join the parts back together
  return parts.join("");
}

/**
 * Helper function to process all markdown links, including:
 * - converting all relative repo links to valid relative links for the site
 */
export function processMarkdownLinks(content: string): string {
  // locate and parse all links in the raw markdown
  return content?.replace(
    REGEX_MARKDOWN_LINKS,
    (fullMatched: string, label: string, url: string) => {
      // for errors in the regex, just return the original `fullMatched` string
      if (!label || !url) return fullMatched;

      url = processSingleLink(url);

      // process the internal links (i.e. those that start with "/" and ".")
      if (url.startsWith("/") || url.startsWith(".")) {
        // auto remove links for internal ignored files
        // (i.e. those with file names that start with `_`)
        if (url.toString().split("/_").length > 1) {
          return label;
        }
      }

      return `[${label}](${url})`;
    },
  );
}

/**
 * Link processors for standardizing links
 */
export function processSingleLink(url: string = ""): string {
  if (!url) return url;

  // convert `solana.com` links to internal links
  url = url.replace(/^https?:\/\/?solana.com\//gi, "/");

  // process the internal links (i.e. those that start with "/" and ".")
  if (url.startsWith("/") || url.startsWith(".")) {
    // prevent relative climbing
    url = url.replace(/^.*?\//gi, "/");

    // removed specific file extensions (".md", ".mdx", etc) and index.*
    url = url.replace(/((index)?.mdx?|.html?)/gi, "");

    // format urls to assets stored within the content repo
    url = url.replace(/^\/(public\/)?assets\//, `${CONTENT_API_URL}/assets/`);

    // format urls to developer "content" stored within the content repo
    url = url.replace(/^\/content\//, `/developers/`);

    // convert all "developer content" links to lower case
    if (/^\/(docs|developers)/gm.test(url)) url = url.toLowerCase();
  } else {
    // do nothing with other links
  }

  return url;
}
