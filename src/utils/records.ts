import type { SimpleRecordGroupName } from "@/types";
import { DEFAULT_LOCALE_EN } from "./constants";
import {
  allSolanaRPCDocs,
  allSolanaDocs,
  allDeveloperGuides,
  allDeveloperResources,
  allDeveloperWorkshops,
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
  }

  return records.filter(record => record.locale == options.locale);
}
