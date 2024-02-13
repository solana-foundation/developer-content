/**
 * api route to generate the nav item listing for
 * each supported content record `group`
 */

import { notFound } from "next/navigation";
import { DEFAULT_LOCALE_EN, LOCALE_REGEX } from "@/utils/constants";
import { SimpleRecordGroupName, SupportedDocTypes } from "@/types";
import { generateNavItemListing } from "@/utils/navItem";
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

  // retrieve the correct group's records by its simple group name
  const records = getRecordsForGroup(simpleGroupName, {
    locale,
  });

  if (!records) return notFound();

  const navItems = generateNavItemListing(records as SupportedDocTypes[]);

  // finally, return the json formatted listing of NavItems
  return Response.json(navItems);
}
