/**
 * api route to retrieve a single piece of content,
 * based on the provided url `slug`
 */

import { notFound } from "next/navigation";
import type { NavItem, SupportedDocTypes } from "@/types";
import {
  generateFlatNavItemListing,
  generateNavItemListing,
  computeDetailsFromSlug,
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
    notFound();
  }

  const { group, locale, href } = computeDetailsFromSlug(slug);

  if (!group) return notFound();

  // retrieve the correct group's records by its simple group name
  const records = getRecordsForGroup(group, {
    locale,
  });

  if (!records) return notFound();

  // create a flat listing of all the nav items in order to locate the next, current, and prev records
  const flatNavItems = generateFlatNavItemListing(
    generateNavItemListing(records as SupportedDocTypes[]),
  );

  // initialize the NavItem record trackers
  let current: NavItem | null = null;
  let next: NavItem | null = null;
  let prev: NavItem | null = null;

  for (let i = 0; i < flatNavItems.length; i++) {
    // skip incorrect routes
    if (
      flatNavItems[i].href != href &&
      flatNavItems[i].href != `/${href}` &&
      !flatNavItems[i]?.altRoutes?.filter(
        route => route.toLocaleLowerCase() == href,
      ).length
    ) {
      continue;
    }

    // set the current requested record
    current = flatNavItems[i];

    // get the "previous" record link to display (that is an actual link)
    if (flatNavItems.length >= i - 1) {
      for (let j = i; j > 0; j--) {
        if (!flatNavItems[j - 1]?.metaOnly) {
          prev = flatNavItems[j - 1];
          break;
        }
      }
    }

    // get the "next" record link to display (that is an actual link)
    if (flatNavItems.length >= i + 1) {
      for (let j = i; j < flatNavItems.length; j++) {
        if (!flatNavItems[j + 1]?.metaOnly) {
          next = flatNavItems[j + 1];
          break;
        }
      }
    }

    // break out of the loop and stop processing
    break;
  }

  if (!current) return notFound();

  // locate full content record
  let record = (records as SupportedDocTypes[]).filter(
    (item: SupportedDocTypes) =>
      item.href.toLowerCase() == current?.href?.toLowerCase(),
  )?.[0];

  if (!record) notFound();

  // remove the html formatted content (since it is undesired data to send over the wire)
  if (typeof record.body.raw !== "undefined") {
    // @ts-ignore
    record.body = record.body.raw.trim();
  }

  // todo: preprocess the body content? (if desired in the future)

  // todo: support sending related content records back to the client

  // finally, return the json formatted listing of NavItems (with the next and prev records)
  return Response.json(Object.assign(current, record, { next, prev }));
}
