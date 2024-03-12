/**
 * api route to generate a path listing for
 * each supported content record `group`
 */

import { notFound } from "next/navigation";
import type { NavItem } from "@/types";
import {
  computeNavItem,
  shouldIgnoreRecord,
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
    return notFound();
  }

  const { group, locale } = computeDetailsFromSlug(slug);

  if (!group) return notFound();

  // retrieve the correct group's records by its simple group name
  const records = getRecordsForGroup(group, {
    locale,
  });

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
    // if (!!record?.altRoutes?.length) {
    //   record.altRoutes.forEach(route => {
    //     if (!!route?.trim()) {
    //       listing.push({
    //         ...navItem,
    //         href: route.trim(),
    //         altRoutes: undefined,
    //       });
    //     }
    //   });
    // }
  });

  // remove the /docs/rpc from the `docs` grouping since it should be handled by the `rpc` grouping
  if (group == "docs") {
    listing = listing.filter(
      item => item.href != "/docs/rpc" && item.href != "/docs/rpc/",
    );
  }

  // finally, return the json formatted listing
  return Response.json(listing);
}
