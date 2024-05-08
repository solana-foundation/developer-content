/**
 * api route to generate a listing of records for a given `group`
 */

import { notFound } from "next/navigation";
import type { SupportedDocTypes } from "@/types";
import { simplifyRecords } from "@/utils/parsers";
import { getRecordsForGroup } from "@/utils/records";
import { computeDetailsFromSlug } from "@/utils/navItem";
import { CourseLessonRecord, CourseRecord } from "contentlayer/generated";

type RouteProps = {
  params: {
    slug: string[];
  };
};

export function GET(_req: Request, { params: { slug } }: RouteProps) {
  // dummy check on the url params
  if (!slug || !Array.isArray(slug) || slug.length <= 0) {
    return notFound();
  }

  let { group, locale, appendix } = computeDetailsFromSlug(slug);

  if (!group) return notFound();

  let course: CourseRecord | undefined = undefined;
  let courseCreator = "";

  if (group == "courses" && !!appendix) {
    group = "lesson";
    course =
      (
        getRecordsForGroup("courses", {
          locale,
        }) as CourseRecord[]
      ).find(
        item =>
          `${item._raw.sourceFileDir.match(/.*\/(.*)/)?.[1]}-${item._raw.sourceFileName.split(".")[0]}` ==
          appendix,
      ) || undefined;
    courseCreator = course?.slug.split("-").shift() || "";
  }

  // retrieve the correct group's records by its simple group name
  let records = getRecordsForGroup(group, {
    locale,
  });

  // handle the special case of a course becoming a record group
  if (group == "lesson" && !!appendix) {
    records = records.filter(item =>
      course?.lessons.includes(
        (item as CourseLessonRecord).slug.replace(`${courseCreator}-`, ""),
      ),
    );
  }

  /**
   * note: we intentionally only return a 404 if there was an error with `records`
   * not if there are no records for the given `simpleGroupName`
   */
  if (!records) return notFound();

  // todo: add pagination support?

  // compute the simplified listing of the records to send less data over the wire
  // finally, return the json formatted listing
  return Response.json(simplifyRecords(records as SupportedDocTypes[]));
}
