/**
 * api route to generate a listing of records for a given `group`
 */

import { notFound } from "next/navigation";
import type { SupportedDocTypes } from "@/types";
import { simplifyRecords } from "@/utils/parsers";
import { getRecordsForGroup } from "@/utils/records";
import { computeDetailsFromSlug } from "@/utils/navItem";

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

  /**
   * note: we intentionally only return a 404 if there was an error with `records`
   * not if there are no records for the given `simpleGroupName`
   */
  if (!records) return notFound();

  // todo: add pagination support?

  // compute the simplified listing of the records to send less data over the wire
  // finally, return the json formatted listing
  return Response.json(simplifyRecords(records as SupportedDocTypes[]));
}
