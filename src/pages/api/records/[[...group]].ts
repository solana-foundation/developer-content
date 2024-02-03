/**
 * api route to generate a listing of records for a given `group`
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { SimpleRecordGroupName, SupportedDocTypes } from "@/types";
import {
  allDeveloperGuides,
  allDeveloperResources,
  allSolanaDocs,
  allDeveloperWorkshops,
  allSolanaRPCDocs,
} from "contentlayer/generated";
import { simplifyRecords } from "@/utils/parsers";
import { DEFAULT_LOCALE_EN, LOCALE_REGEX } from "@/utils/constants";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleNotFound | SupportedDocTypes[]>,
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

  console.log("locale:", locale);

  // get the content record group name
  const groupName = group.toString() as SimpleRecordGroupName;
  if (!groupName) return res.status(404).json({ notFound: true });

  // retrieve the correct group's records by its simple group name
  let records: SupportedDocTypes[] = ((groupName: SimpleRecordGroupName) => {
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

  if (!records) return res.status(404).json({ notFound: true });

  // compute the simplified listing of the records
  records = simplifyRecords(records);

  // todo: add pagination support?

  // finally, return the json formatted listing
  return res.status(200).json(records);
}
