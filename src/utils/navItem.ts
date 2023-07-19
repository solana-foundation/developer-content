import { NavItem } from "@/types";
import { DocumentTypes, SolanaDoc } from "contentlayer/generated";
import { ucFirst } from "./helpers";

/**
 * Generate a directory/category grouped `NavItem[]` listing by the provided flat
 * array of document `records`
 */
export function generateNavItemListing(
  records: Array<DocumentTypes>,
): Array<NavItem> {
  // init a generic group tracker object
  const grouping: any = {};

  /**
   * format each of the `records` as a NavItem, grouping each of them inside
   * their file system directory for later generating the category based NavItem[]
   */
  records.forEach(record => {
    if (shouldIgnoreRecord({ fileName: record._raw.sourceFileName })) return;

    // init the dir based category
    if (!grouping[record._raw.sourceFileDir])
      grouping[record._raw.sourceFileDir] = { items: [] } as unknown as NavItem;

    // process the index file as the root of the NavItem
    if (record._raw.sourceFileName == "index.md") {
      grouping[record._raw.sourceFileDir] = Object.assign(
        grouping[record._raw.sourceFileDir],
        // @ts-ignore
        computeNavItem(record),
      );
    } else {
      // @ts-ignore
      grouping[record._raw.sourceFileDir].items.push(computeNavItem(record));
    }
  });

  // init the response NavItem listing
  const navItems: NavItem[] = [];

  // massage the dir based grouping into a valid NavItem[]
  for (const entry of Object.entries(grouping)) {
    const item = entry[1] as NavItem;

    // handle category items that do not have metadata pulled from a file (i.e. no `path`)
    if (!item.path) {
      item.label = ucFirst(entry[0].split("/").reverse()[0]);
      item.id = entry[0].replaceAll("/", "-");
    }

    navItems.push(item);
  }

  /**
   * finally, return the NavItem array (sorted, of course)
   * ---
   * note on sorting: final sorting on the full navItems listing is different than category items
   * sort here will actually sort using the `sidebarSortOrder=0` value
   */
  return navItems.sort(
    (a, b) =>
      (typeof a?.sidebarSortOrder == "undefined" ? 999 : a.sidebarSortOrder) -
      (typeof b?.sidebarSortOrder == "undefined" ? 999 : b.sidebarSortOrder),
  );
}

/**
 * Helper function to determine if a content record should be ignored when parsing
 */
export function shouldIgnoreRecord({
  fileName,
  allowedExtensions = ["md"],
}: {
  fileName: string;
  allowedExtensions?: Array<string>;
}) {
  // ignore draft files (i.e. file name starts with `_`)
  if (fileName.substring(0, 1) == "_") return true;

  // only allow the specific file extensions
  if (
    !allowedExtensions.includes(
      fileName.substring(fileName.lastIndexOf(".")).replace(/\./g, "") ??
        "[err]",
    )
  )
    return true;

  // finally,
  return false;
}

/**
 * Compute a standard NavItem record for use with site navigation
 */
export function computeNavItem(
  doc: DocumentTypes & Partial<SolanaDoc>,
  // BASE_DIR = "content/",
): NavItem {
  // populate the base NavItem record from the provided `doc`
  const record: NavItem = {
    path: doc._id, // this is the full file path, computed by contentlayer
    id: doc?.id || "",
    href: doc?.href,
    label: doc?.sidebarLabel || doc?.title,
    sidebarSortOrder: doc?.sidebarSortOrder,
    metaOnly: doc?.metaOnly,
  };

  // compute an id based on the doc's path
  if (!record.id) record.id = doc._raw.flattenedPath.replaceAll("/", "-");

  // compute a label based on the doc's file name
  if (!record.label)
    record.label = ucFirst(doc._raw.sourceFileName.split(".")[0]);

  // set the href based on the file's path
  if (!record.href) {
    record.href = doc._raw.flattenedPath.replace(
      /^(content\/?)?(developers\/?)?/gm,
      "/developers/",
    );
  }

  /**
   * when the record is only storing metadata, remove it as a linked item
   * ---
   * note: the `record.path` value should NOT be deleted
   * since it is ued to determine the index of a category.
   * also, deleting `record.metaOnly` prevents confusing
   * data in the generated nav item listing (especially for categories)
   */
  if (!!record.metaOnly) delete record.href;
  else delete record.metaOnly;

  return record;
}
