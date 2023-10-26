/**
 *
 */

import { DocumentTypes, IgnoredDoc } from "contentlayer/generated";

/**
 * Short hand for removing the IgnoredDoc
 */
export type SupportedDocTypes = Exclude<DocumentTypes, IgnoredDoc>;

/**
 * Simplified string names of each support content record group
 *
 * @dev when adding new group names, ensure the desired support is added in all
 * other places the type `SimpleRecordGroupName` is used (e.g. api routes)
 */
export type SimpleRecordGroupName =
  | "docs"
  | "guides"
  | "resources"
  | "workshops";

type NavItemBase = {
  id: String;
  label: String;
  path?: String;
  href?: String;
  sidebarSortOrder?: number;
  metaOnly?: boolean;
  /** List of alternate routes that should redirect to this same document */
  altRoutes?: string[] | undefined;
};

export type NavItem = NavItemBase & {
  items?: Array<NavItemBase>;
};
