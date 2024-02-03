/**
 * api route to retrieve a single piece of content,
 * based on the provided url `slug`
 */

import { NavItem, SimpleRecordGroupName } from "@/types";
import { DEFAULT_LOCALE_EN, LOCALE_REGEX } from "@/utils/constants";
import {
  generateFlatNavItemListing,
  generateNavItemListing,
} from "@/utils/navItem";
import {
  allDeveloperGuides,
  allDeveloperResources,
  allSolanaDocs,
  allDeveloperWorkshops,
  allSolanaRPCDocs,
  DocumentTypes,
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

  // initialize and default the content locale to english
  let locale = DEFAULT_LOCALE_EN;

  // extract the requested locale from the url (when provided)
  if (new RegExp(LOCALE_REGEX).test(slug[0])) {
    locale = slug.shift() || DEFAULT_LOCALE_EN;
  }

  // determine the correct group based on the route prefix
  const group = slug[0] as SimpleRecordGroupName;

  // retrieve the correct group's records by its simple group name
  const records = ((group: SimpleRecordGroupName) => {
    switch (group) {
      case "docs": {
        if (slug[1] == "rpc") return allSolanaRPCDocs;
        return allSolanaDocs;
      }
      case "guides":
        return allDeveloperGuides;
      case "resources":
        return allDeveloperResources;
      case "workshops":
        return allDeveloperWorkshops;
    }
  })(group);

  if (!records) return res.status(404).json({ notFound: true });

  // define the formatted href value to search for
  // note: this effectively enforces that only href's that start with "/developers" are supported
  const href = `${
    slug[0].toLocaleLowerCase() == "docs" ||
    slug[0].toLocaleLowerCase() == "rpc"
      ? ""
      : "/developers"
  }/${slug.join("/")}`
    .toLowerCase()
    .replaceAll(/\/index(.mdx?)?/gi, "");

  console.log("href:", href);

  // create a flat listing of all the nav items in order to locate the next, current, and prev records
  const flatNavItems = generateFlatNavItemListing(
    generateNavItemListing(records),
  );

  // initialize the NavItem record trackers
  let current: NavItem | null = null;
  let next: NavItem | null = null;
  let prev: NavItem | null = null;

  for (let i = 0; i < flatNavItems.length; i++) {
    // skip incorrect routes
    if (
      flatNavItems[i].href != href &&
      flatNavItems[i].href != `/${href}` &&
      !flatNavItems[i]?.altRoutes?.filter(
        route => route.toLocaleLowerCase() == href,
      ).length
    ) {
      continue;
    }

    // set the current requested record
    current = flatNavItems[i];

    // get the "previous" record link to display (that is an actual link)
    if (flatNavItems.length >= i - 1) {
      for (let j = i; j > 0; j--) {
        if (!flatNavItems[j - 1].metaOnly) {
          prev = flatNavItems[j - 1];
          break;
        }
      }
    }

    // get the "next" record link to display (that is an actual link)
    if (flatNavItems.length >= i + 1) {
      for (let j = i; j < flatNavItems.length; j++) {
        if (!flatNavItems[j + 1].metaOnly) {
          next = flatNavItems[j + 1];
          break;
        }
      }
    }

    // break out of the loop and stop processing
    break;
  }

  if (!current) return res.status(404).json({ notFound: true });

  // locate full content record

  let record = (records as DocumentTypes[]).filter(
    (item: DocumentTypes) =>
      item._raw.sourceFilePath.toLowerCase() == current?.path?.toLowerCase(),
  )?.[0];
  if (!record) return res.status(404).json({ notFound: true });

  // remove the html formatted content (since it is undesired data to send over the wire)
  if (typeof record.body.raw !== "undefined") {
    // @ts-ignore
    record.body = record.body.raw.trim();
  }

  // todo: preprocess the body content? (if desired in the future)

  // todo: support sending related content records back to the client

  // finally, return the json formatted listing of NavItems (with the next and prev records)
  return res.status(200).json(Object.assign(current, record, { next, prev }));
}
