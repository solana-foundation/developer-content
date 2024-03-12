/**
 * api route to generate an overview of all the developer content.
 * including generating a listing of all the featured content for
 * display on https://solana.com/developers)
 */

import { DEFAULT_LOCALE_EN, LOCALE_REGEX } from "@/utils/constants";
import { extractFeaturedRecords, simplifyRecords } from "@/utils/parsers";
import type { SupportedDocTypes } from "@/types";
import { getRecordsForGroup } from "@/utils/records";

type RouteProps = {
  params: {
    slug: string[];
  };
};

export function GET(_req: Request, { params: { slug = [] } }: RouteProps) {
  // initialize and default the content locale to english
  let locale = DEFAULT_LOCALE_EN;

  // extract the requested locale from the url (when provided)
  if (new RegExp(LOCALE_REGEX).test(slug[0])) {
    locale = slug.shift() || DEFAULT_LOCALE_EN;
  }

  return Response.json({
    // featured guides
    guides: extractFeaturedRecords({
      records: getRecordsForGroup("guides", {
        locale,
      }) as SupportedDocTypes[],
      limit: 6,
      callback: simplifyRecords,
    }),
    // featured resources
    resources: extractFeaturedRecords({
      records: getRecordsForGroup("resources", {
        locale,
      }) as SupportedDocTypes[],
      limit: 6,
      callback: simplifyRecords,
    }),
    // featured workshops
    workshops: extractFeaturedRecords({
      records: getRecordsForGroup("workshops", {
        locale,
      }) as SupportedDocTypes[],
      limit: 6,
      callback: simplifyRecords,
    }),
  });
}
