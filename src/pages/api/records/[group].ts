/**
 * api route to generate a listing of records for a given `group`
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

  const listing: Array<any> = [];

  // compute the listing data to return
  records.map(record => {
    if (shouldIgnoreRecord({ fileName: record._raw.sourceFileName })) return;

    // @ts-ignore
    const navItem = computeNavItem(record);

    if (!navItem.href) return;

    // @ts-ignore
    record = Object.assign(navItem, record);

    const attributesToDelete = ["_id", "_raw", "body", "type"];

    if (!record.featured)
      attributesToDelete.push("featured", "featuredPriority");

    // remove any undesired content from the response
    // @ts-ignore
    attributesToDelete.forEach(e => delete record[e]);

    listing.push(record);
  });

  // todo: add pagination support?

  // finally, return the json formatted listing
  return res.status(200).json(listing);
}
