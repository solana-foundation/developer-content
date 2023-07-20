import { SupportedDocTypes } from "@/types";
import { computeNavItem, shouldIgnoreRecord } from "./navItem";

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
