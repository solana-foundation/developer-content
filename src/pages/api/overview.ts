/**
 * api route to generate an overview of all the developer content.
 * including generating a listing of all the featured content for
 * display on https://solana.com/developers)
 */

import type { NextApiRequest, NextApiResponse } from "next";
import {
  allDeveloperGuides,
  allDeveloperResources,
} from "contentlayer/generated";
import { extractFeaturedRecords, simplifyRecords } from "@/utils/parsers";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimpleNotFound | any>,
) {
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
  });
}
