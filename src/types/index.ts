/**
 *
 */

import type { DocumentTypes, IgnoredRecord } from "contentlayer/generated";

/**
 * Short hand for removing any ignored documents
 */
export type SupportedDocTypes = Exclude<DocumentTypes, IgnoredRecord> &
  ComputedFieldsTypeHack;

/**
 * hack:
 * due to the way content layer generates the types, it does not deduplicate computed fields making them required
 * so we are manually overriding that
 *
 * todo: PR something to `contentlayer` to prevent needing this hack
 */
export type ComputedFieldsTypeHack = {
  locale: string;
  href: string;
};

/**
 * Simplified string names of each support content record group
 *
 * @dev when adding new group names, ensure the desired support is added in all
 * other places the type `SimpleRecordGroupName` is used (e.g. api routes)
 */
export type SimpleRecordGroupName =
  | "docs"
  | "rpc"
  | "docs,rpc" // note: this is to support stringify-ing the route via the url
  | "guides"
  | "lessons"
  | "courses"
  | "resources"
  | "workshops"
  | "cookbook";

type NavItemBase = {
  id: string;
  slug: string;
  label: string;
  locale?: string;
  path?: string;
  href?: string;
  sidebarSortOrder?: number;
  metaOnly?: boolean;
  /**
   *
   */
  items?: Array<any>;
  altRoutes?: string[] | undefined;
};

export type NavItem = NavItemBase & {
  items?: Array<NavItemBase>;
};

export type BreadcrumbItem = {
  href?: string;
  title?: string;
  label: string;
};
