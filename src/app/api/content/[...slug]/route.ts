/**
 * api route to retrieve a single piece of content,
 * based on the provided url `slug`
 */

import { notFound } from "next/navigation";
import type { BreadcrumbItem, NavItem, SupportedDocTypes } from "@/types";
import { DEFAULT_LOCALE_EN, I18N_LOCALE_REGEX } from "@/utils/constants";
import {
  generateFlatNavItemListing,
  generateNavItemListing,
  computeDetailsFromSlug,
} from "@/utils/navItem";
import { getRecordsForGroup } from "@/utils/records";
import type { AuthorRecord, CourseRecord } from "contentlayer/generated";
import { preProcessContent } from "@/utils/parsers";

type RouteProps = {
  params: {
    slug: string[];
  };
};

export async function GET(req: Request, { params: { slug } }: RouteProps) {
  // dummy check on the url params
  if (!slug || !Array.isArray(slug) || slug.length <= 0) {
    return notFound();
  }

  try {
    let { group, locale, href, appendix } = computeDetailsFromSlug(slug);

    if (!group) return notFound();

    // `lessons` are nested under `courses`
    if (group === "courses" && appendix.split("/").length === 2) {
      group = "lessons";
    }

    // get the base locale's record to serve as the default content
    const baseLocalRecords = getRecordsForGroup(group, {
      locale: DEFAULT_LOCALE_EN,
    }) as SupportedDocTypes[];

    // create a flat listing of all the nav items to locate the next, current, and prev records
    let flatNavItems = generateFlatNavItemListing(
      generateNavItemListing(baseLocalRecords)
    );

    if (!flatNavItems || flatNavItems.length <= 0) return notFound();

    // initialize the NavItem record trackers
    let current: NavItem | null = null;
    let next: NavItem | null = null;
    let prev: NavItem | null = null;

    // Find the current item based on href
    for (let i = 0; i < flatNavItems.length; i++) {
      const item = flatNavItems[i];
      const matchesHref = [item.href, `/${item.href}`].includes(href.toLowerCase()) || item?.altRoutes?.some(route => route.toLowerCase() === href.toLowerCase());

      if (!matchesHref) continue;

      current = item;

      // get the "previous" record link to display (that is an actual link)
      if (i > 0) {
        prev = flatNavItems.slice(0, i).reverse().find(item => item?.href && !item.isSkippedInNav) || null;
      }

      // get the "next" record link to display (that is an actual link)
      if (i < flatNavItems.length - 1) {
        next = flatNavItems.slice(i + 1).find(item => item?.href && !item.isSkippedInNav) || null;
      }

      break; // Stop processing after finding the current record
    }

    if (!current) return notFound();

    // Handle lessons nested under courses
    let course: CourseRecord | null = null;
    if (group === "lessons" && current.slug) {
      const courseSlug = appendix.split("/")[0];
      course = (getRecordsForGroup("courses", { locale: DEFAULT_LOCALE_EN }) as CourseRecord[]).find(item => item.slug === courseSlug) || null;
      if (!course) throw new Error(`Course '${courseSlug}' not found`);

      if (!course.lessons) course.lessons = [];

      const lessonIndex = course.lessons.findIndex(item => item === current.slug);

      next = lessonIndex >= 0 && course.lessons.length > lessonIndex + 1 
        ? flatNavItems.find(item => item.path?.endsWith(course.lessons![lessonIndex + 1])) || null 
        : null;

      prev = lessonIndex > 0 
        ? flatNavItems.find(item => item.path?.endsWith(course.lessons![lessonIndex - 1])) || null 
        : null;
    }

    // Locate the base locale's record
    let record = baseLocalRecords.find(item => item.href.toLowerCase() === current?.href?.toLowerCase());
    if (!record) return notFound();

    // Attempt to find the desired locale's record
    if (locale !== DEFAULT_LOCALE_EN) {
      const localeRecords = getRecordsForGroup(group, { locale }) as SupportedDocTypes[];
      const localRecord = localeRecords.find(item => item.href.toLowerCase() === current?.href?.toLowerCase());

      if (localRecord) record = localRecord;

      flatNavItems = generateFlatNavItemListing(generateNavItemListing(localeRecords));
      next = next ? flatNavItems.find(item => item.id === next!.id) || next : null;
      prev = prev ? flatNavItems.find(item => item.id === prev!.id) || prev : null;
    }

    const breadcrumbs: BreadcrumbItem[] = [];
    let parentId = current.id.substring(0, current.id.lastIndexOf("-"));
    for (let i = 0; i <= parentId.split("-").length + 2; i++) {
      const item = flatNavItems.find(item => item.id === parentId);
      if (item) {
        breadcrumbs.unshift({ href: item.href, label: item.label });
      }
      parentId = parentId.substring(0, parentId.lastIndexOf("-"));
    }

    // Pre-process content if necessary
    if (record?.body?.raw) {
      record.body = preProcessContent(record.body.raw.trim());
    }

    // Remove i18n prefixes
    record._raw = {
      ...record._raw,
      sourceFilePath: record._raw.sourceFilePath.replace(I18N_LOCALE_REGEX, ""),
      sourceFileDir: record._raw.sourceFileDir.replace(I18N_LOCALE_REGEX, ""),
      flattenedPath: record._raw.flattenedPath.replace(I18N_LOCALE_REGEX, ""),
    };

    // Force course details into the lesson
    if (group === "lessons" && course) {
      (current as any).course = course;
    }

    // Get author information
    let author: AuthorRecord | null = null;
    if (record?.author) {
      const allAuthors = getRecordsForGroup("authors", { locale: DEFAULT_LOCALE_EN }) as AuthorRecord[];
      author = allAuthors.find(node => node.slug === record.author) || null;
      if (author && author.organization) {
        author.organization = allAuthors.find(node => node.slug === author.organization) || null;
      }
    }

    // Return the json response
    return Response.json({
      ...current,
      ...record,
      breadcrumbs,
      next,
      prev,
      author,
    });
  } catch (error) {
    console.error("Error processing the request:", error);
    return notFound();
  }
}
