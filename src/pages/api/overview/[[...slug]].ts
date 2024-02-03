/**
 * api route to generate an overview of all the developer content.
 * including generating a listing of all the featured content for
 * display on https://solana.com/developers)
 */

import type { NextApiRequest, NextApiResponse } from "next";
import {
  allDeveloperGuides,
  allDeveloperResources,
  allDeveloperWorkshops,
} from "contentlayer/generated";
import { extractFeaturedRecords, simplifyRecords } from "@/utils/parsers";
import { DEFAULT_LOCALE_EN, LOCALE_REGEX } from "@/utils/constants";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleNotFound | any>,
) {
  // get the url params
  const slug = req.query?.slug || [];

  if (!slug || !Array.isArray(slug))
    return res.status(404).json({ notFound: true });

  // initialize and default the content locale to english
  let locale = DEFAULT_LOCALE_EN;

  // extract the requested locale from the url (when provided)
  if (new RegExp(LOCALE_REGEX).test(slug[0])) {
    locale = slug.shift() || DEFAULT_LOCALE_EN;
  }
  console.log("locale:", locale);

  return res.status(200).json({
    // featured guides
    guides: extractFeaturedRecords({
      records: allDeveloperGuides,
      limit: 6,
      callback: simplifyRecords,
    }),
    // featured resources
    resources: extractFeaturedRecords({
      records: allDeveloperResources,
      limit: 6,
      callback: simplifyRecords,
    }),
    // featured workshops
    workshops: extractFeaturedRecords({
      records: allDeveloperWorkshops,
      limit: 6,
      callback: simplifyRecords,
    }),
  });
}
