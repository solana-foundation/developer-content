/**
 * api route to generate a path listing for
 * each supported content record `group`
 */

import { notFound } from "next/navigation";
import { DEFAULT_LOCALE_EN, LOCALE_REGEX } from "@/utils/constants";
import { NavItem, SimpleRecordGroupName } from "@/types";
import { computeNavItem, shouldIgnoreRecord } from "@/utils/navItem";
import {
  allDeveloperGuides,
  allDeveloperResources,
  allSolanaDocs,
  allDeveloperWorkshops,
  allSolanaRPCDocs,
} from "contentlayer/generated";

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

  console.log("locale:", locale);

  // get the content record group name
  const groupName = group.toString() as SimpleRecordGroupName;
  if (!groupName) return notFound();

  // retrieve the correct group's records by its simple group name
  const records = ((groupName: SimpleRecordGroupName) => {
    switch (groupName) {
      case "rpc":
      case "docs,rpc":
        return allSolanaRPCDocs;
      case "docs":
        return allSolanaDocs;
      case "guides":
        return allDeveloperGuides;
      case "resources":
        return allDeveloperResources;
      case "workshops":
        return allDeveloperWorkshops;
    }
  })(groupName);

  if (!records) return notFound();

  // init the listing response
  let listing: Array<NavItem> = [];

  /**
   * todo: assorted things
   * - better support for external links
   */

  // compute the path data to return
  records.map(record => {
    if (shouldIgnoreRecord({ fileName: record._raw.sourceFileName })) return;

    // @ts-ignore
    const navItem = computeNavItem(record);

    if (!navItem.href || !!record.isExternal) return;

    listing.push(navItem);

    // handle adding each of the alternative routes into the path listing
    if (!!record?.altRoutes?.length) {
      record.altRoutes.forEach(route => {
        if (!!route?.trim()) {
          listing.push({
            ...navItem,
            href: route.trim(),
            altRoutes: undefined,
          });
        }
      });
    }
  });

  // remove the /docs/rpc from the `docs` grouping since it should be handled by the `rpc` grouping
  if (groupName == "docs") {
    listing = listing.filter(
      item => item.href != "/docs/rpc" && item.href != "/docs/rpc/",
    );
  }

  // finally, return the json formatted listing
  return Response.json(listing);
}
