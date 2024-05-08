import { DEFAULT_LOCALE_EN, I18N_LOCALE_REGEX } from "./src/utils/constants";
import {
  defineDocumentType,
  makeSource,
  type FieldDefs,
  type ComputedFields,
} from "contentlayer/source-files";
import { getAllContentFiles } from "./src/utils/helpers";
import path from "path";

/**
 * Standard content record fields
 */
const basicContentFields: FieldDefs = {
  title: {
    type: "string",
    description: "The primary title of the individual piece of content",
    required: true,
  },
  description: {
    type: "string",
    description:
      "Brief description of the content (also used in the SEO metadata)",
    required: false,
  },
  tags: {
    type: "list",
    of: { type: "string" },
    description: "List of filterable tags for content",
    required: false,
  },
  keywords: {
    type: "list",
    of: { type: "string" },
    description:
      "List of keywords for the content, primarily used for seo metadata",
    required: false,
  },
  date: {
    type: "date",
    description: "The date this content was published",
    required: false,
  },
  updatedDate: {
    type: "date",
    description: "The date this content was last updated",
    required: false,
  },
  difficulty: {
    type: "enum",
    description: "Difficulty level of the content",
    options: ["Intro", "Beginner", "Intermediate", "Expert"],
  },
  image: {
    type: "string",
    description:
      "The primary image of the content (also used in the SEO metadata)",
    required: false,
  },

  /**
   * URL, link, and route information
   */
  isExternal: {
    type: "boolean",
    description: "Is this content just a link to external content?",
    default: false,
  },
  href: {
    type: "string",
    description: "Page route or absolute URL for this document",
    required: false,
  },
  canonical: {
    type: "string",
    description: "Canonical url of the content",
    required: false,
  },
  altRoutes: {
    type: "list",
    of: { type: "string" },
    description:
      "List of alternate routes that should redirect to this same document",
    required: false,
  },

  /**
   * Assorted metadata flags used for display and formatting
   */
  featured: {
    type: "boolean",
    description: "Whether or not this content is featured",
    required: false,
  },
  featuredPriority: {
    type: "number",
    description: "Sort priority for featured content displays",
    default: 999,
  },
  metaOnly: {
    type: "boolean",
    description: "Whether or not this record is used for only metadata",
    required: false,
    default: false,
  },

  /**
   * Custom fields that are used for the generated `nav.json` sidebar data
   */
  sidebarLabel: {
    type: "string",
    description: "Custom sidebar label to use, instead of the document's title",
    required: false,
  },
  sidebarSortOrder: {
    type: "number",
    description: "Sort order of the doc, relative to its siblings",
    required: false,
  },
  hideTableOfContents: {
    type: "boolean",
    description: "Force hide the table of contents displayed on page",
    required: false,
  },

  /**
   * Custom SEO specific details
   */
  seoTitle: {
    type: "string",
    description: "Custom title to be used for SEO purposes",
    required: false,
  },
  seoDescription: {
    type: "string",
    description:
      "Custom description to be used for SEO purposes (recommended max of 155 characters)",
    required: false,
  },
};

/**
 * Standard computed fields for all records
 *
 * note: changing these may warrant an update the the hacky custom `ComputedFieldsTypeHack` type
 */
const standardComputedFields: ComputedFields = {
  locale: {
    description: "Locale for the content",
    type: "string",
    resolve: record =>
      I18N_LOCALE_REGEX.test(record._id)
        ? record._id.split(I18N_LOCALE_REGEX)[1]
        : DEFAULT_LOCALE_EN,
  },
  href: {
    description: "Computed href for the content",
    type: "string",
    resolve: record => {
      if (!!record.href) {
        return record.href.toString().toLowerCase();
      }

      const hrefBase = record._raw.flattenedPath.replace(I18N_LOCALE_REGEX, "");
      return hrefBase
        .replace(
          /^(content\/?)?(developers\/?)?/gm,
          // prepend the non-docs content
          hrefBase.startsWith("docs") ? "/" : "/developers/",
        )
        .toLowerCase();
    },
  },
};

/**
 *
 */

/**
 * Content record schema for Developer Resources
 */
export const ResourceRecord = defineDocumentType(() => ({
  name: "ResourceRecord",
  filePathPattern:
    "{content/resources,/content/resources,i18n/**/content/resources}/**/*.{md,mdx}",
  computedFields: standardComputedFields,
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content
    repoUrl: {
      type: "string",
      description: "Repository URL for the developer resources",
      required: false,
    },
    category: {
      required: true,
      type: "enum",
      description: "General type of the resource (e.g. its broad category)",
      options: ["documentation", "framework", "sdk"],
    },
  },
}));

/**
 * Content record schema for Developer Guides
 */
export const GuideRecord = defineDocumentType(() => ({
  name: "GuideRecord",
  filePathPattern:
    "{content/guides,/content/guides,i18n/**/content/guides}/**/*.{md,mdx}",
  computedFields: standardComputedFields,
  fields: basicContentFields,
}));

/**
 * Content record schema for Developer Workshops
 */
export const WorkshopRecord = defineDocumentType(() => ({
  name: "WorkshopRecord",
  filePathPattern:
    "{content/workshops,/content/workshops,i18n/**/content/workshops}/**/*.{md,mdx}",
  computedFields: standardComputedFields,
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content
    repoUrl: {
      type: "string",
      description: "Repository URL for this developer workshop",
      required: true,
    },
    objectives: {
      type: "list",
      of: { type: "string" },
      description: "List of objectives for this workshop",
      required: true,
    },
    duration: {
      type: "string",
      description: "Estimated duration of this workshop",
      required: true,
    },
    video: {
      type: "string",
      description: "Video recording of the workshop (if Available)",
      required: false,
    },
    presentation: {
      type: "string",
      description: "Presentation for this workshop (if Available)",
      required: false,
    },

    /**
     * Author specific details
     */
    author: {
      type: "string",
      description: "The name of the original author of this content",
      required: false,
    },
    authorDescription: {
      type: "string",
      description: "Brief description of the original author of this content",
      required: false,
    },
    authorTwitterHandle: {
      type: "string",
      description: "Twitter handle of the original author of this content",
      required: false,
    },
    authorGithubUsername: {
      type: "string",
      description: "GitHub username of the original author of this content",
      required: false,
    },
  },
}));

/**
 * Content record schema for the Course metadata file
 *
 * File: `courses/{course-name}/metadata.json`
 */
export const CourseCreatorRecord = defineDocumentType(() => ({
  name: "CourseCreatorRecord",
  filePathPattern:
    "{content/courses,/content/courses,i18n/**/content/courses}/**/metadata.yml",
  computedFields: {
    ...standardComputedFields,
  },
  fields: {
    ...basicContentFields,
    title: {
      type: "string",
      description: "The primary title of the individual piece of content",
      required: true,
    },
    slug: {
      type: "string",
      description: "The primary title of the individual piece of content",
      required: true,
    },
    description: {
      type: "string",
      description: "Brief description of the course creator",
      required: true,
    },
    website: {
      type: "string",
      description: "Optional URL for the website of the course creator",
      required: false,
    },
  },
}));

/**
 * Content record schema for the Course metadata file
 *
 * File: `courses/{course-name}/metadata.json`
 */
export const CourseRecord = defineDocumentType(() => ({
  name: "CourseRecord",
  filePathPattern:
    "{content/courses,/content/courses,i18n/**/content/courses}/**/**.yml",
  computedFields: {
    ...standardComputedFields,

    // courses get a custom href
    href: {
      description: "Computed href for a course",
      type: "string",
      resolve: record => {
        const hrefBase = record._raw.flattenedPath.replace(
          I18N_LOCALE_REGEX,
          "",
        );

        return hrefBase
          .replace(
            /^(?:(?:content\/?)?(?:developers\/?)?(?:\/courses\/))(.*)\//gm,
            "/developers/courses/$1-",
          )
          .toLowerCase();
      },
    },

    // validate all lessons listed exist
    lessons: {
      description: "List of lesson 'slugs' for this course",
      type: "list",
      of: { type: "string" },
      resolve: record => {
        // get the course creator slug from the format: `content/courses/slug`
        const creatorSlug = record._raw.sourceFileDir.match(
          /^\/?((content|developers)\/courses)\/(.*)/i,
        )?.[3];

        if (!creatorSlug) throw Error("Unable to parse creator slug");

        const lessonsDir = path.join(
          path.resolve(),
          "content/courses",
          creatorSlug,
          "lessons",
        );

        const availableLessons: string[] = getAllContentFiles(
          lessonsDir, // base search directory
          false, // recursive search the directory
          ".md", // file extension
          true, // remove the extension from each returned item in the array
        );

        for (const lesson of record.lessons) {
          if (!availableLessons.includes(path.join(lessonsDir, lesson))) {
            throw Error(
              `Unable to locate lesson: '${lesson}' from '${creatorSlug}'`,
            );
          }
        }

        return record.lessons;
      },
    },
  },
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content
    objectives: {
      type: "list",
      of: { type: "string" },
      description: "List of objectives for the course",
      required: false,
    },
    lessons: {
      type: "list",
      of: { type: "string" },
      description: "List of lesson 'slugs' to be included in this course",
      required: true,
    },
  },
}));

/**
 * Content record schema a single Course Lesson
 */
export const CourseLessonRecord = defineDocumentType(() => ({
  name: "CourseLessonRecord",
  filePathPattern:
    "{content/courses/**/lessons,/content/courses/**/lessons,i18n/**/content/courses/**/lessons}/**/*.md",
  computedFields: {
    ...standardComputedFields,

    // lessons get a custom href
    href: {
      description: "Computed href for a lesson",
      type: "string",
      resolve: record => {
        const hrefBase = record._raw.flattenedPath.replace(
          I18N_LOCALE_REGEX,
          "",
        );

        return hrefBase
          .replace(
            /^(?:(?:content\/?)?(?:developers\/?)?(?:\/courses\/))(.*)\/lessons\//gm,
            "/developers/courses/lesson/$1-",
          )
          .toLowerCase();
      },
    },
  },
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content
    objectives: {
      type: "list",
      of: { type: "string" },
      description: "List of objectives for the Course Lesson",
      required: false,
    },
  },
}));

/**
 * Content record schema a single Solana documentation record
 */
export const CoreDocsRecord = defineDocumentType(() => ({
  name: "CoreDocsRecord",
  filePathPattern: "{docs,/docs,i18n/**/docs}/**/*.{md,mdx}",
  computedFields: standardComputedFields,
  fields: basicContentFields,
}));

/**
 * Content record schema a single Solana RPC documentation record
 */
export const CoreRPCDocsRecord = defineDocumentType(() => ({
  name: "CoreRPCDocsRecord",
  filePathPattern: "{docs,/docs,i18n/**/docs}/rpc/**/*.{md,mdx}",
  computedFields: standardComputedFields,
  fields: basicContentFields,
}));

/**
 * Content record schema a single Solana cookbook record
 */
export const CookbookRecord = defineDocumentType(() => ({
  name: "CookbookRecord",
  filePathPattern:
    "{content/cookbook,/content/cookbook,i18n/**/content/cookbook}/**/*.{md,mdx}",
  computedFields: standardComputedFields,
  fields: basicContentFields,
}));

/**
 * Simple record type to enable ignoring files in the contentlayer checks
 * Note: This should be used sparingly (and normally only for readme files)
 *
 * Auto ignored documents:
 *  - readme.md
 *  - README.md
 */
export const IgnoredRecord = defineDocumentType(() => ({
  name: "IgnoredRecord",
  filePathPattern: `**/+(README|readme).md`,
}));

/**
 * Export the contentlayer settings
 */
export default makeSource({
  // set the base content directories to search for content records
  contentDirPath: ".",
  contentDirInclude: [
    "i18n/**",
    "docs/**",
    "content/guides/**",
    "content/courses/**",
    "content/resources/**",
    "content/workshops/**",
    "content/cookbook/**",
  ],

  /**
   * Listing of all supported content record types
   *
   * @dev when new content record types are added, ensure
   * the `SimpleRecordGroupName` is updated accordingly
   */
  documentTypes: [
    IgnoredRecord,

    // core solana docs (including rpc docs)
    CoreRPCDocsRecord,
    // !note: rpc doc must be before regular docs
    CoreDocsRecord,

    // developer specific content
    GuideRecord,
    ResourceRecord,
    WorkshopRecord,

    // course specific content record types
    CourseCreatorRecord, // !note: course creator must be before course records
    CourseRecord,
    CourseLessonRecord,

    // Cookbook content
    CookbookRecord,
  ],

  // settings to force fail on bad data schema
  onUnknownDocuments: "fail",
  onMissingOrIncompatibleData: "fail",
  onExtraFieldData: "fail",
});
