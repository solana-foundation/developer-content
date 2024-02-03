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
import { DEFAULT_LOCALE_EN, LOCALE_REGEX } from "@/utils/constants";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleNotFound | NavItem[]>,
) {
  // get the content record group
  const group = req.query?.group || [];

  if (!group || !Array.isArray(group) || group.length <= 0)
    return res.status(404).json({ notFound: true });

  // initialize and default the content locale to english
  let locale = DEFAULT_LOCALE_EN;

  // extract the requested locale from the url (when provided)
  if (new RegExp(LOCALE_REGEX).test(group[0])) {
    locale = group.shift() || DEFAULT_LOCALE_EN;
  }

  // get the content record group name
  const groupName = group.toString() as SimpleRecordGroupName;
  if (!groupName) return res.status(404).json({ notFound: true });

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
      // case "resources":
      //   return allDeveloperResources;
      case "workshops":
        return allDeveloperWorkshops;
    }
  })(groupName);

  if (!records) return res.status(404).json({ notFound: true });

  const navItems = generateNavItemListing(records);

  // finally, return the json formatted listing of NavItems
  return res.status(200).json(navItems);
}
