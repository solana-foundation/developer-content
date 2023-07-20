/**
 * api route to generate a listing of records for a given `group`
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { SimpleRecordGroupName, SupportedDocTypes } from "@/types";
import {
  allDeveloperGuides,
  allDeveloperResources,
  allSolanaDocs,
} from "contentlayer/generated";
import { simplifyRecords } from "@/utils/parsers";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleNotFound | SupportedDocTypes[]>,
) {
  // get the content record group
  const group = req.query?.group?.toString() as SimpleRecordGroupName;
  if (!group) return res.status(404).json({ notFound: true });

  // retrieve the correct group's records by its simple group name
  let records: SupportedDocTypes[] = ((group: SimpleRecordGroupName) => {
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

  // compute the simplified listing of the records
  records = simplifyRecords(records);

  // todo: add pagination support?

  // finally, return the json formatted listing
  return res.status(200).json(records);
}
