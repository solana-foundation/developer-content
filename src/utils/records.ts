import type { SimpleRecordGroupName } from "@/types";
import { DEFAULT_LOCALE_EN } from "./constants";
import {
  allGuideRecords,
  allResourceRecords,
  allCookbookRecords,
  allWorkshopRecords,
  allCoreDocsRecords,
  allCoreRPCDocsRecords,
  allCourseLessonRecords,
  allCourseRecords,
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
      records = allCoreRPCDocsRecords;
      break;
    }
    case "docs": {
      records = allCoreDocsRecords;
      break;
    }
    case "guides": {
      records = allGuideRecords;
      break;
    }
    case "resources": {
      records = allResourceRecords;
      break;
    }
    case "workshops": {
      records = allWorkshopRecords;
      break;
    }
    case "cookbook": {
      records = allCookbookRecords;
      break;
    }
    case "lesson": {
      records = allCourseLessonRecords;
      break;
    }
    case "courses": {
      records = allCourseRecords;
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
    const docsIndex = allCoreDocsRecords.find(
      record => record.locale == options.locale && record.href == "/docs",
    );
    if (docsIndex) {
      records.push(Object.assign(docsIndex, { featuredPriority: 0 }) as any);
    }
  }

  return records.filter(record => record.locale == options.locale);
}
