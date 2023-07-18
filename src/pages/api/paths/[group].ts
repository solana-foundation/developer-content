/**
 * api route to generate a path listing for
 * each supported content record `group`
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { NavItem, SimpleRecordGroupName } from "@/types";
import { computeNavItem, shouldIgnoreRecord } from "@/utils/navItem";
import {
  allDeveloperGuides,
  allDeveloperResources,
  allSolanaDocs,
} from "contentlayer/generated";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleNotFound | NavItem[]>,
) {
  // get the content record group
  const group = req.query?.group?.toString() as SimpleRecordGroupName;
  if (!group) return res.status(404).json({ notFound: true });

  // retrieve the correct group's records by its simple group name
  const records = ((group: SimpleRecordGroupName) => {
    switch (group) {
      case "docs":
        return allSolanaDocs;
      case "guides":
        return allDeveloperGuides;
      case "resources":
        return allDeveloperResources;
    }
  })(group);

  if (!records) return res.status(404).json({ notFound: true });

  // init the listing response
  const listing: Array<NavItem> = [];

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
  });

  // finally, return the json formatted listing
  return res.status(200).json(listing);
}
