/**
 * api route to retrieve a single piece of content,
 * based on the provided url `slug`
 */

import { SimpleRecordGroupName } from "@/types";
import { computeNavItem } from "@/utils/navItem";
import {
  allDeveloperGuides,
  allDeveloperResources,
  allSolanaDocs,
} from "contentlayer/generated";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleNotFound | any>,
) {
  // get the content record group
  const slug = req.query?.slug || [];

  if (!slug || !Array.isArray(slug) || slug.length <= 0)
    return res.status(404).json({ notFound: true });

  const group = slug[0] as SimpleRecordGroupName;

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

  // define the formatted href value to search for
  const href = slug.join("/");

  // init the record to be returned
  let record;

  // locate the correct record requested (via the url param)
  for (let i = 0; i < records.length; i++) {
    // @ts-ignore
    const navItem = computeNavItem(records[i]);

    // only care about the requested record
    if (navItem.href != href && navItem.href != `/${href}`) continue;

    // set the requested record's data (weaving in the computed nav item data)
    record = Object.assign(navItem, records[i]);

    /**
     * todo: support next/prev type records
     * note: this will likely require processing the nav records?
     */

    // break out of the loop and stop processing
    break;
  }

  if (!record) return res.status(404).json({ notFound: true });

  // remove the html formatted content (since it is undesired data to send over the wire)
  // @ts-ignore
  record.body = record.body.raw.trim();

  // todo: preprocess the body content? (if desired in the future)

  // todo: support sending related content records back to the client

  // finally, return the json formatted listing of NavItems
  return res.status(200).json(record);
}
