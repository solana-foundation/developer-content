/**
 * Assorted helper functions
 */

import fs from "fs";
import path from "path";
import * as matter from "gray-matter";

export type NavItem = {
  id: String;
  label: String;
  path?: String;
  href?: String;
  items?: Array<any>;
  sidebarSortOrder?: number;
  metaOnly?: boolean;
};

/**
 * Helper function to recursively crawl a local directory path and generate a NavItem listing
 */
export function generateNavItemListing({
  searchPath,
  allowedExtensions = ["md"],
  BASE_DIR,
}: {
  searchPath: string;
  allowedExtensions: string[];
  BASE_DIR: string;
}): NavItem[] {
  // init the item listing
  let navItems: NavItem[] = [];

  try {
    // read in the desired directory
    const listing = fs.readdirSync(searchPath, { withFileTypes: true });

    // crawl the search directory for more files
    listing.forEach(item => {
      const itemPath = path.join(searchPath, item.name);

      // ignore files that start with `_`
      if (item.name.substring(0, 1) == "_") return;

      if (item.isFile()) {
        // only allow the specific file extensions
        if (
          !allowedExtensions.includes(
            item.name
              .substring(item.name.lastIndexOf("."))
              .replace(/\./g, "") ?? "[err]",
          )
        )
          return;

        // read and parse the markdown file
        const record = matter.read(itemPath);

        // auto force to a "meta only" record when it has no actual content
        if (record.content.trim() == "") record.data.metaOnly = true;

        /**
         * construct a NavItem from the markdown file's frontmatter
         */
        const navItem: NavItem = computeNavItem({
          BASE_DIR,
          filePath: itemPath,
          frontmatter: record.data,
        });

        // add the current working item into the final listing
        navItems.push(navItem);
      }

      // recursively crawl child directories and process as categories
      else if (item.isDirectory()) {
        let dirItems = generateNavItemListing({
          searchPath: itemPath,
          allowedExtensions,
          BASE_DIR,
        });

        // only store the directory if actual records were found
        if (dirItems.length <= 0) return;

        /**
         * attempt to locate the category's index file
         * (for setting the categories metadata)
         */
        const searchFileIndex = dirItems.findIndex(
          item => !!item.path?.endsWith("index.md"),
        );

        /**
         * create a new category item, using the located indexFile
         * (and preventing a circular reference)
         */
        const categoryItem: NavItem =
          searchFileIndex >= 0
            ? dirItems.splice(searchFileIndex, 1)?.[0]
            : computeNavItem({
                BASE_DIR,
                filePath: itemPath,
              });

        /**
         * add the category's sorted items
         * sort note: when sidebarSortOrder is `0`, it will always sort above unordered siblings, and below sorted siblings
         */
        categoryItem.items = dirItems.sort(
          (a, b) => (a?.sidebarSortOrder || 999) - (b?.sidebarSortOrder || 999),
        );

        // store the formatted record
        navItems.push(categoryItem);
      }
    });
  } catch (err) {
    console.warn("[error]", "generateNavItemListing:", err);
  }

  /**
   * finally, return the located NavItems (sorted, of course)
   * ---
   * note or sorting: final sorting on the full navItems listing is different than category items
   * sort here will actually sort using the `sidebarSortOrder=0` value
   */
  return navItems.sort(
    (a, b) =>
      (typeof a?.sidebarSortOrder == "undefined" ? 999 : a.sidebarSortOrder) -
      (typeof b?.sidebarSortOrder == "undefined" ? 999 : b.sidebarSortOrder),
  );
}

/**
 * Compute a standard NavItem record for use with site navigation
 */
export function computeNavItem({
  filePath,
  frontmatter,
  BASE_DIR,
}: {
  filePath: string;
  frontmatter?: any;
  BASE_DIR: string;
}): NavItem {
  const record: NavItem = {
    id: frontmatter?.id,
    href: frontmatter?.href,
    label: frontmatter?.sidebarLabel || frontmatter?.title,
    path: frontmatter && filePath.replace(BASE_DIR, ""),
    sidebarSortOrder: frontmatter?.sidebarSortOrder,
    metaOnly: frontmatter?.metaOnly,
  };

  const recordWithPath = filePath.replace(BASE_DIR, "").split(".")[0];

  // compute an id based on the record path
  if (!record.id) record.id = `docs-${recordWithPath.replaceAll("/", "-")}`;

  // compute a label based on the record path
  if (!record.label) {
    record.label = recordWithPath.substring(recordWithPath.indexOf("/") - 1);

    // uppercase the first character only
    record.label =
      record.label.charAt(0).toLocaleUpperCase() + record.label.slice(1);
  }

  // only compute the href for viewable records (i.e. not index-less categories)
  if (record.path) {
    // set the href based on the file's path
    if (!record.href) record.href = `/docs/${recordWithPath}`;

    // remove the `/index` href value for category roots
    if (!!record.href && record.path?.endsWith("index.md"))
      record.href = record.href.split("/index")[0];
  }

  /**
   * when the record is only storing metadata, remove it as a linked item
   * ---
   * note: the `record.path` value should NOT be deleted
   * since it is ued to determine the index of a category.
   * also, deleting `record.metaOnly` prevents confusing
   * data in the generated nav item listing (especially for categories)
   */
  if (!!record.metaOnly) {
    delete record.href;
    delete record.metaOnly;
  }

  return record;
}
