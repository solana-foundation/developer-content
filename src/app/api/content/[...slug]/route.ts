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
import type { CourseRecord } from "contentlayer/generated";

type RouteProps = {
  params: {
    slug: string[];
  };
};

export function GET(req: Request, { params: { slug } }: RouteProps) {
  // dummy check on the url params
  if (!slug || !Array.isArray(slug) || slug.length <= 0) {
    return notFound();
  }

  const { group, locale, href } = computeDetailsFromSlug(slug);

  if (!group) return notFound();

  // get the base locale's record to serve as the default content
  const baseLocalRecords = getRecordsForGroup(group, {
    locale: DEFAULT_LOCALE_EN,
  }) as SupportedDocTypes[];

  // create a flat listing of all the nav items in order to locate the next, current, and prev records
  let flatNavItems = generateFlatNavItemListing(
    generateNavItemListing(baseLocalRecords),
  );

  if (!flatNavItems || flatNavItems.length <= 0) return notFound();

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
        if (!!flatNavItems[j - 1]?.href) {
          prev = flatNavItems[j - 1];
          break;
        }
      }
    }

    // get the "next" record link to display (that is an actual link)
    if (flatNavItems.length >= i + 1) {
      for (let j = i; j < flatNavItems.length; j++) {
        if (!!flatNavItems[j + 1]?.href) {
          next = flatNavItems[j + 1];
          break;
        }
      }
    }

    // break out of the loop and stop processing
    break;
  }

  if (!current) return notFound();

  let course: CourseRecord | undefined = undefined;

  // handle the special cases for lessons
  if (group == "lesson") {
    try {
      const url = new URL(req.url);
      const courseSlug = url.searchParams.get("course");
      const lessonSlug = current.path!.match(/.*\/(.*)$/i)?.[1];
      if (!courseSlug || !lessonSlug) return notFound();

      // locate the course for all lessons
      course =
        group == "lesson"
          ? (getRecordsForGroup("courses", {
              locale: DEFAULT_LOCALE_EN,
            }).find(
              item => item.href!.match(/.*\/(.*)$/i)?.[1] == courseSlug,
            ) as CourseRecord)
          : undefined;

      if (!course) throw `Course '${courseSlug}' not found`;

      const lessonIndex = course.lessons.findIndex(item => item == lessonSlug);

      next =
        course.lessons.length > lessonIndex
          ? flatNavItems.find(item =>
              item.path?.endsWith(course!.lessons[lessonIndex + 1]),
            ) || null
          : null;

      prev =
        lessonIndex > 0
          ? flatNavItems.find(item =>
              item.path?.endsWith(course!.lessons[lessonIndex - 1]),
            ) || null
          : null;
    } catch (err) {
      console.warn(
        "[api content]",
        "an error occurred while getting the course details for a lesson",
      );
      return notFound();
    }
  }

  // locate full content record for the base locale
  let record = baseLocalRecords.find(
    (item: SupportedDocTypes) =>
      item.href.toLowerCase() == current?.href?.toLowerCase(),
  );

  if (!record) return notFound();

  /**
   * with the base locale record and data in hand, we can attempt to
   * locate the desired locale's record data
   */
  if (locale !== DEFAULT_LOCALE_EN) {
    const localeRecords = getRecordsForGroup(group, {
      locale,
    }) as SupportedDocTypes[];

    const localRecord = localeRecords.find(
      (item: SupportedDocTypes) =>
        item.href.toLowerCase() == current?.href?.toLowerCase(),
    );
    if (localRecord) {
      record = localRecord;
    }

    flatNavItems = generateFlatNavItemListing(
      generateNavItemListing(localeRecords),
    );

    // get the locale specific next/prev info
    if (!!next) next = flatNavItems.find(item => item.id == next!.id) || next;
    if (!!prev) prev = flatNavItems.find(item => item.id == prev!.id) || prev;
  }

  if (!record) return notFound();

  const breadcrumbs: BreadcrumbItem[] = [];
  let parentId = current.id.substring(0, current.id.lastIndexOf("-"));

  for (let i = 0; i <= parentId.split("-").length + 2; i++) {
    const item = flatNavItems.find(item => item.id == parentId);

    if (item) {
      breadcrumbs.unshift({
        href: item.href,
        label: item.label,
      });
    }

    parentId = parentId.substring(0, parentId.lastIndexOf("-"));
  }

  // remove the html formatted content (since it is undesired data to send over the wire)
  if (!!record?.body?.raw && typeof record.body.raw !== "undefined") {
    // @ts-ignore
    record.body = record.body.raw.trim();
  }

  // remove the i18n prefixes
  record._raw = {
    ...record._raw,
    sourceFilePath: record._raw.sourceFilePath.replace(I18N_LOCALE_REGEX, ""),
    sourceFileDir: record._raw.sourceFileDir.replace(I18N_LOCALE_REGEX, ""),
    flattenedPath: record._raw.flattenedPath.replace(I18N_LOCALE_REGEX, ""),
  };

  // force put the course details into the lesson
  if (group == "lesson") {
    // @ts-expect-error
    current.course = course;
  }

  // todo: preprocess the body content? (if desired in the future)

  // todo: support sending related content records back to the client

  // finally, return the json formatted listing of NavItems (with the next and prev records)
  return Response.json(
    Object.assign(current, record, { breadcrumbs, next, prev }),
  );
}
