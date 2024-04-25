import type { SimpleRecordGroupName } from "@/types";
import { DEFAULT_LOCALE_EN } from "./constants";
import {
  allSolanaRPCDocs,
  allSolanaDocs,
  allDeveloperGuides,
  allDeveloperResources,
  allDeveloperWorkshops,
  allSolanaCookbooks,
} from "contentlayer/generated";

/**
 * Get a listing of all the records for the given group
 */
export function getRecordsForGroup(
  simpleGroupName: SimpleRecordGroupName,
  options: {
    locale: string;
  } = {
    locale: DEFAULT_LOCALE_EN,
    // todo: add pagination support here
    // todo: add the ability to auto sort based on a given field
  },
) {
  let records = [];

  switch (simpleGroupName) {
    case "rpc":
    case "docs,rpc": {
      simpleGroupName = "rpc";
      records = allSolanaRPCDocs;
      break;
    }
    case "docs": {
      records = allSolanaDocs;
      break;
    }
    case "guides": {
      records = allDeveloperGuides;
      break;
    }
    case "resources": {
      records = allDeveloperResources;
      break;
    }
    case "workshops": {
      records = allDeveloperWorkshops;
      break;
    }
    case "cookbook": {
      records = allSolanaCookbooks;
      break;
    }
  }

  /**
   * handle special cases of joining multiple groups together
   */
  if (simpleGroupName == "rpc") {
    /**
     * since "docs" and "docs/rpc" are handled as separate record types, we
     * need to manually located and add in the root docs page so it appears in
     * the correct places on the frontend (including in the navigation sidebar)
     */
    const docsIndex = allSolanaDocs.find(
      record => record.locale == options.locale && record.href == "/docs",
    );
    if (docsIndex) {
      records.push(Object.assign(docsIndex, { featuredPriority: 0 }) as any);
    }
  }

  return records.filter(record => record.locale == options.locale);
}
