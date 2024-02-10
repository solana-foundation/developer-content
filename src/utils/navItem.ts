import { NavItem, type SupportedDocTypes } from "@/types";
import { type SolanaDoc } from "contentlayer/generated";
import { ucFirst } from "./helpers";

/**
 * Generate a directory/category grouped `NavItem[]` listing by the provided flat
 * array of document `records`
 */
export function generateNavItemListing(
  records: Array<SupportedDocTypes>,
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
    if (
      record._raw.sourceFileName == "index.md" ||
      record._raw.sourceFileName == "index.mdx"
    ) {
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

  // regroup all the items for multi-nested relationships
  for (const [key, data] of Object.entries(grouping)) {
    const currentItem = data as NavItem;

    // handle category items that do not have metadata pulled from a file (i.e. no `path`)
    if (!currentItem.path) {
      Object.assign(currentItem, computeDetailsFromKey(key));
      // currentItem.label = ucFirst(key.split("/").reverse()[0]);
      // currentItem.id = key.replaceAll("/", "-");
    }

    const parentKey = key.slice(0, key.lastIndexOf("/"));
    if (
      key.lastIndexOf("/") > 0 &&
      key != parentKey &&
      parentKey != key.slice(0, key.indexOf("/"))
    ) {
      // handle the `parentKey` already existing
      if (Object.hasOwn(grouping, parentKey)) {
        //
        const parentItems: NavItem[] =
          (grouping[parentKey] as NavItem)?.items || [];

        const siblingIndex = parentItems.findIndex(s => s.id == currentItem.id);

        // update an existing sibling category if it already exists
        if (siblingIndex >= 0) {
          // join the existing items listing with the `currentItem` being manipulated
          if (Array.isArray(parentItems[siblingIndex]?.items)) {
            // the sibling already exists
            parentItems[siblingIndex].items?.push(...(currentItem.items as []));
          } else {
            // the sibling did not already exist
            parentItems[siblingIndex].items = currentItem.items;
          }
        } else {
          // add the new sibling record since it did not already exist
          parentItems.push(currentItem);
        }
      } else {
        (grouping[parentKey] as NavItem) = {
          ...computeDetailsFromKey(parentKey),
          items: [currentItem],
        };
      }

      // finally delete the `currentItem`'s data from the master grouping
      delete grouping[key];
    } else {
      grouping[key] = currentItem;
    }
  }

  // init the response NavItem listing
  const navItems: NavItem[] = [];

  // massage the dir based grouping into a valid NavItem[]
  for (const [_key, data] of Object.entries(grouping)) {
    navItems.push(data as NavItem);
  }

  // finally, return the NavItem array (sorted, of course)
  return sortNavItems(navItems);
}

/**
 * Create a flat listing of all nav items provided
 *
 * note: normally, the provided `navItems` should be preprocessed by `generateNavItemListing`
 */
export function generateFlatNavItemListing(
  navItems: Array<NavItem>,
): Array<NavItem> {
  return navItems.flatMap(({ items, ...node }: NavItem) => {
    if (typeof items !== "undefined") {
      return [node as NavItem]
        .concat(items)
        .flatMap(children => generateFlatNavItemListing([children]));
    }
    return node;
  });
}

/**
 *
 */
export function computeDetailsFromKey(key: string) {
  return {
    label: ucFirst(key.split("/").reverse()[0]),
    id: key.replaceAll("/", "-"),
  };
}

/**
 * Sort the listing of NavItems based on their `sidebarSortOrder`,
 * including recursively sorting all child items
 * ---
 * note on sorting: final sorting on the full navItems listing is different than category items
 * sort here will actually sort using the `sidebarSortOrder=0` value
 */
export function sortNavItems(navItems: NavItem[]) {
  return navItems
    .map(record => {
      // sort the child items
      if (Array.isArray(record.items)) {
        record.items = sortNavItems(record.items);
      }
      return record;
    })
    .sort(
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
  allowedExtensions = ["md", "mdx"],
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
  doc: SupportedDocTypes & Partial<SolanaDoc>,
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
    altRoutes: doc.altRoutes,
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
      // prepend the non-docs content
      doc._raw.sourceFileDir.startsWith("docs") ? "/" : "/developers/",
    );
  }

  // always lowercase certain specific values
  record.href = record.href.toLowerCase();
  record.id = record.id.toLowerCase();

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
