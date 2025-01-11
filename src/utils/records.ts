import type { SimpleRecordGroupName } from "@/types";
import { DEFAULT_LOCALE_EN } from "./constants";
import type { Record } from "contentlayer/generated";
import {
  allGuideRecords,
  allResourceRecords,
  allCookbookRecords,
  allWorkshopRecords,
  allCoreDocsRecords,
  allCoreRPCDocsRecords,
  allCourseLessonRecords,
  allCourseRecords,
  allAuthorRecords,
} from "contentlayer/generated";

interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PaginatedResponse {
  records: Record[];
  pagination: PaginationMetadata;
}

/**
 * Get a listing of all the records for the given group
 */
export function getRecordsForGroup(
  simpleGroupName: SimpleRecordGroupName,
  options: {
    locale: string;
    page?: number;
    pageSize?: number;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
  } = {
    locale: DEFAULT_LOCALE_EN,
    page: 1,
    pageSize: 10,
  },
) {
  let records = [];
  const { page = 1, pageSize = 10, sortField, sortDirection = 'asc' } = options;

  switch (simpleGroupName) {
    case "authors": {
      records = allAuthorRecords;
      break;
    }
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
    case "lessons": {
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

  // default the records to the base language if no records for the provided locale were found
  if (records.findIndex(record => record.locale == options.locale) < 0) {
    options.locale = DEFAULT_LOCALE_EN;
  }

  // Filter by locale
  records = records.filter((record: Record) => record.locale == options.locale);

  // Sort if sortField is provided
  if (sortField && records.length > 0 && sortField in records[0]) {
    records.sort((a: Record, b: Record) => {
      const aValue = a[sortField as keyof Record];
      const bValue = b[sortField as keyof Record];
      const compareResult = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }

  // Calculate pagination
  const totalRecords = records.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Return paginated results with metadata
  return {
    records: records.slice(startIndex, endIndex),
    pagination: {
      page,
      pageSize,
      totalPages,
      totalRecords,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  };
}
