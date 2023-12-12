/**
 * api route to generate the nav item listing for
 * each supported content record `group`
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { NavItem, SimpleRecordGroupName } from "@/types";
import { generateNavItemListing } from "@/utils/navItem";
import {
  allDeveloperGuides,
  // allDeveloperResources,
  allSolanaDocs,
  allDeveloperWorkshops,
  allSolanaRPCDocs,
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
      case "rpc":
      case "docs,rpc":
        return allSolanaRPCDocs;
      case "docs":
        return allSolanaDocs;
      case "guides":
        return allDeveloperGuides;
      // case "resources":
      //   return allDeveloperResources;
      case "workshops":
        return allDeveloperWorkshops;
    }
  })(group);

  if (!records) return res.status(404).json({ notFound: true });

  const navItems = generateNavItemListing(records);

  // finally, return the json formatted listing of NavItems
  return res.status(200).json(navItems);
}
