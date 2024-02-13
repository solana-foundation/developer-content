/**
 * api route to generate a listing of records for a given `group`
 */

import { notFound } from "next/navigation";
import { DEFAULT_LOCALE_EN, LOCALE_REGEX } from "@/utils/constants";
import { SimpleRecordGroupName, SupportedDocTypes } from "@/types";
import { simplifyRecords } from "@/utils/parsers";
import { getRecordsForGroup } from "@/utils/records";

type RouteProps = {
  params: {
    group: string[];
  };
};

export function GET(_req: Request, { params: { group } }: RouteProps) {
  // dummy check on the url params
  if (!group || !Array.isArray(group) || group.length <= 0) {
    return notFound();
  }

  // initialize and default the content locale to english
  let locale = DEFAULT_LOCALE_EN;

  // extract the requested locale from the url (when provided)
  if (new RegExp(LOCALE_REGEX).test(group[0])) {
    locale = group.shift() || DEFAULT_LOCALE_EN;
  }

  // get the content record group name
  const simpleGroupName = group.toString() as SimpleRecordGroupName;
  if (!simpleGroupName) return notFound();

  const records = getRecordsForGroup(simpleGroupName, {
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
