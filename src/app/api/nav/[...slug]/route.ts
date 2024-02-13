/**
 * api route to generate the nav item listing for
 * each supported content record `group`
 */

import { notFound } from "next/navigation";
import type { SupportedDocTypes } from "@/types";
import {
  computeDetailsFromSlug,
  generateNavItemListing,
} from "@/utils/navItem";
import { getRecordsForGroup } from "@/utils/records";

type RouteProps = {
  params: {
    slug: string[];
  };
};

export function GET(_req: Request, { params: { slug } }: RouteProps) {
  // dummy check on the url params
  if (!slug || !Array.isArray(slug) || slug.length <= 0) {
    return notFound();
  }

  const { group, locale } = computeDetailsFromSlug(slug);

  if (!group) return notFound();

  // retrieve the correct group's records by its simple group name
  const records = getRecordsForGroup(group, {
    locale,
  });

  if (!records) return notFound();

  const navItems = generateNavItemListing(records as SupportedDocTypes[]);

  // finally, return the json formatted listing of NavItems
  return Response.json(navItems);
}
