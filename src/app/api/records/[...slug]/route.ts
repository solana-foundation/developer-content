/**
 * api route to generate a listing of records for a given `group`
 */

import { notFound } from "next/navigation";
import type { SupportedDocTypes } from "@/types";
import { simplifyRecords } from "@/utils/parsers";
import { getRecordsForGroup } from "@/utils/records";
import { computeDetailsFromSlug } from "@/utils/navItem";
import { CourseRecord } from "contentlayer/generated";

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

  // retrieve the correct group's records by its simple group name
  let records = getRecordsForGroup(group, {
    locale,
  });

  // handle the special case for lessons
  if (group == "lessons" && appendix) {
    const course = (
      getRecordsForGroup("courses", {
        locale,
      }) as CourseRecord[]
    ).find(item => item.slug == appendix);

    if (!course) return notFound();

    const unsortedLessons = records.filter(
      item => item._raw.sourceFileDir.match(/.*\/(.*)/)?.[1] == course.slug,
    );

    if (unsortedLessons.length !== course.lessons.length) return notFound();

    // presort the lessons in their desired order
    records = new Array(unsortedLessons.length);
    unsortedLessons.map(item => {
      const index = course.lessons.findIndex(el => el == item.slug);
      records[index] = item;
    });
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
