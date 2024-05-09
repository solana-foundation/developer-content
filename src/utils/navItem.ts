import type {
  NavItem,
  SimpleRecordGroupName,
  SupportedDocTypes,
} from "@/types";
import { type CoreDocsRecord } from "contentlayer/generated";
import { ucFirst } from "./helpers";
import {
  DEFAULT_LOCALE_EN,
  I18N_INCLUDE_IN_PATHS,
  I18N_LOCALE_REGEX,
  LOCALE_REGEX,
} from "./constants";

const GROUPING_KEY_SEPARATOR = "-";

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

    const { id: computedKey } = computeRecordPathAndId(
      record._raw.sourceFileDir,
    );

    // init the dir based category
    if (!grouping[computedKey]) {
      grouping[computedKey] = { items: [] } as unknown as NavItem;
    }

    // process the index file as the root of the NavItem
    if (
      record._raw.sourceFileName == "index.md" ||
      record._raw.sourceFileName == "index.mdx"
    ) {
      grouping[computedKey] = Object.assign(
        grouping[computedKey],
        // @ts-ignore
        computeNavItem(record),
      );
    } else {
      // @ts-ignore
      grouping[computedKey].items.push(computeNavItem(record));
    }
  });

  // regroup all the items for multi-nested relationships
  for (const [key, data] of Object.entries(grouping)) {
    const currentItem = data as NavItem;

    // handle category items that do not have metadata pulled from a file (i.e. no `path`)
    if (!currentItem.path) {
      Object.assign(currentItem, computeDetailsFromKey(key));
    }

    const parentKey = key.slice(
      0,
      currentItem?.path?.lastIndexOf("/") ||
        key.lastIndexOf(GROUPING_KEY_SEPARATOR),
    );

    if (
      key.lastIndexOf(GROUPING_KEY_SEPARATOR) > 0 &&
      key != parentKey &&
      parentKey != key.slice(0, key.indexOf(GROUPING_KEY_SEPARATOR))
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
    label: ucFirst(key.split(GROUPING_KEY_SEPARATOR).reverse()[0]),
    id: computeRecordPathAndId(key).id,
    slug: "",
  };
}

/**
 * Compute the path and id for a record, removing the i18n data as desired
 */
export function computeRecordPathAndId(path: string) {
  path = path.toLowerCase();

  if (!I18N_INCLUDE_IN_PATHS) {
    path = path.replace(I18N_LOCALE_REGEX, "");
  }

  return {
    path: path,
    id: path.replaceAll("/", GROUPING_KEY_SEPARATOR),
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
  allowedExtensions = ["md", "mdx", "yml"],
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
  doc: SupportedDocTypes & Partial<CoreDocsRecord>,
): NavItem {
  const computedPathAndId = computeRecordPathAndId(doc._raw.flattenedPath);

  // populate the base NavItem record from the provided `doc`
  const navItem: NavItem = {
    /** i18n locale */
    locale: doc.locale,
    slug: doc.slug,
    /** unique identifier for each record, including any i18n info */
    id: computedPathAndId.id,
    /** full file path, computed by contentlayer, and filtered to remove `i18n` as configured */
    path: computedPathAndId.path,
    href: doc.href,
    label: doc?.sidebarLabel || doc?.title,
    sidebarSortOrder: doc?.sidebarSortOrder,
    metaOnly: doc?.metaOnly,
    altRoutes: doc.altRoutes,
  };

  // compute a label based on the doc's file name
  if (!navItem.label) {
    if (navItem.label.includes("deprecated")) console.log(navItem);

    navItem.label = ucFirst(doc._raw.sourceFileName.split(".")[0]);
  }

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

/**
 * Compute and format standard details based on the url provided slug
 */
export function computeDetailsFromSlug(slug: string[]) {
  // initialize and default the content locale to english
  let locale = DEFAULT_LOCALE_EN;

  // extract the requested locale from the url (when provided)
  if (new RegExp(LOCALE_REGEX).test(slug[0])) {
    locale = slug.shift() || DEFAULT_LOCALE_EN;
  }

  // determine the correct group based on the route prefix
  let group = slug.shift() as SimpleRecordGroupName;

  // handle special sub groups like the rpc section
  if (group == "docs" && slug[0] == "rpc") {
    group = slug.shift() as SimpleRecordGroupName;
  }

  let appendix = slug.join("/");

  // formatted the `href` value to search for
  let href = slug
    .join("/")
    .toLowerCase()
    .replaceAll(/(\/?index)?(.mdx?)?$/gi, "")
    .trim();

  if (group == "docs") {
    href = `/docs/${href}`;
  } else if (group == "rpc" || group == "docs,rpc") {
    href = `/docs/rpc/${href}`;
  }
  //  else if (group == "courses") {
  //   href = `/developers/courses/lesson/${href}`;
  // }
  else {
    href = `/developers/${group}/${href}`;
  }

  // remove all trailing slashes
  while (href.endsWith("/")) {
    href = href.substring(0, href.length - 1);
  }

  return {
    locale,
    group,
    slug,
    href,
    appendix,
  };
}
