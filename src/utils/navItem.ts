import { NavItem, type SupportedDocTypes } from "@/types";
import { type SolanaDoc } from "contentlayer/generated";
import { ucFirst } from "./helpers";
import { I18N_INCLUDE_IN_PATHS, I18N_LOCALE_REGEX } from "./constants";

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

    let key = record._raw.sourceFileDir;

    // strip the i18n data, when desired
    if (!I18N_INCLUDE_IN_PATHS) {
      key = key.replace(I18N_LOCALE_REGEX, "");
    }

    // init the dir based category
    if (!grouping[key]) grouping[key] = { items: [] } as unknown as NavItem;

    // process the index file as the root of the NavItem
    if (
      record._raw.sourceFileName == "index.md" ||
      record._raw.sourceFileName == "index.mdx"
    ) {
      grouping[key] = Object.assign(
        grouping[key],
        // @ts-ignore
        computeNavItem(record),
      );
    } else {
      // @ts-ignore
      grouping[key].items.push(computeNavItem(record));
    }
  });

  // regroup all the items for multi-nested relationships
  for (const [key, data] of Object.entries(grouping)) {
    const currentItem = data as NavItem;

    // handle category items that do not have metadata pulled from a file (i.e. no `path`)
    if (!currentItem.path) {
      Object.assign(currentItem, computeDetailsFromKey(key));
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
): NavItem {
  // populate the base NavItem record from the provided `doc`
  const navItem: NavItem = {
    /** i18n locale */
    locale: doc.locale,
    /** unique identifier for each record, including any i18n info */
    id: doc._id.toLowerCase(),
    /** full file path, computed by contentlayer, and filtered to remove `i18n` as configured */
    path: doc._raw.flattenedPath.replaceAll("/", "-"),
    href: doc.href,
    label: doc?.sidebarLabel || doc?.title,
    sidebarSortOrder: doc?.sidebarSortOrder,
    metaOnly: doc?.metaOnly,
    altRoutes: doc.altRoutes,
  };

  // strip the i18n data, when desired
  if (!I18N_INCLUDE_IN_PATHS) {
    navItem.path = navItem.path!.replace(I18N_LOCALE_REGEX, "");
    navItem.id = navItem.path!.replaceAll("/", "-");
  }

  // compute a label based on the doc's file name
  if (!navItem.label)
    navItem.label = ucFirst(doc._raw.sourceFileName.split(".")[0]);

  /**
   * when the navItem record is only storing metadata, remove it as a linked item
   * ---
   * note: the `navItem.path` value should NOT be deleted
   * since it is used to determine the index of a category.
   *
   * note: deleting `navItem.metaOnly` prevents confusing
   * data in the generated nav item listing (especially for categories)
   */
  if (!!navItem.metaOnly) delete navItem.href;
  else delete navItem.metaOnly;

  return navItem;
}
