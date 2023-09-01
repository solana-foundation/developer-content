import {
  defineDocumentType,
  makeSource,
  FieldDefs,
} from "contentlayer/source-files";

/**
 * Standard content record fields
 */
const basicContentFields: FieldDefs = {
  id: {
    type: "string",
    description: "Manually defined unique id for this document",
    required: false,
  },
  title: {
    type: "string",
    description: "The primary title of the post",
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
};

/**
 * Content record schema for Developer Resources
 */
export const DeveloperResource = defineDocumentType(() => ({
  name: "DeveloperResource",
  filePathPattern: `content/resources/**/*.md`,
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content...
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
export const DeveloperGuide = defineDocumentType(() => ({
  name: "DeveloperGuide",
  filePathPattern: `content/guides/**/*.md`,
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content...
    // category: {
    //   type: "string",
    //   description: "",
    //   required: false,
    // },
  },
}));

/**
 * Content record schema for Developer Workshops
 */
export const DeveloperWorkshop = defineDocumentType(() => ({
  name: "DeveloperWorkshop",
  filePathPattern: `content/workshops/*.md`,
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content...
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
export const CourseMetadata = defineDocumentType(() => ({
  name: "CourseMetadata",
  filePathPattern: `content/courses/**/metadata.json`,
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content...
    structure: {
      type: "list",
      of: { type: "json" },
      description: "",
      required: false,
    },

    lessons: {
      type: "number",
      description: "Number of lessons contained within this course",
    },
  },
}));

/**
 * Content record schema a single Course Lesson
 */
export const CourseLesson = defineDocumentType(() => ({
  name: "CourseLesson",
  filePathPattern: `content/courses/**/content/*.md`,
  fields: {
    // use the standard content fields
    ...basicContentFields,

    // define custom fields for this specific content...
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
export const SolanaDoc = defineDocumentType(() => ({
  name: "SolanaDoc",
  filePathPattern: "docs/**/*.md",
  fields: {
    // use the standard content fields
    ...basicContentFields,

    /**
     * Custom fields for this specific content record type
     */
    // none

    /**
     * Custom fields that are used for the generated `nav.json` sidebar data
     */
    sidebarLabel: {
      type: "string",
      description:
        "Custom sidebar label to use, instead of the document's title",
      required: false,
    },
    sidebarSortOrder: {
      type: "number",
      description: "Sort order of the doc, relative to its siblings",
      required: false,
    },
  },
}));

/**
 * Simple record type to enable ignoring files in the contentlayer checks
 * Note: This should be used sparingly (and normally only for readme files)
 *
 * Auto ignored documents:
 *  - readme.md
 *  - README.md
 */
export const IgnoredDoc = defineDocumentType(() => ({
  name: "IgnoredDoc",
  filePathPattern: `**/+(README|readme).md`,
}));

/**
 * Export the contentlayer settings
 */
export default makeSource({
  // set the base content directories to search for content records
  contentDirPath: ".",
  contentDirInclude: [
    "docs/**",
    "content/guides/**",
    "content/courses/**",
    "content/resources/**",
    "content/workshops/**",
  ],

  /**
   * Listing of all supported content record types
   *
   * @dev when new content record types are added, ensure
   * the `SimpleRecordGroupName` is updated accordingly
   */
  documentTypes: [
    IgnoredDoc,

    // developer specific content
    SolanaDoc,
    DeveloperGuide,
    DeveloperResource,
    DeveloperWorkshop,

    // course specific content record types
    CourseMetadata,
    CourseLesson,
  ],

  // settings to force fail on bad data schema
  onUnknownDocuments: "fail",
  onMissingOrIncompatibleData: "fail",
  onExtraFieldData: "fail",
});
