import {
  defineDocumentType,
  makeSource,
  FieldDefs,
} from "contentlayer/source-files";

/**
 * Standard content record fields
 */
const basicContentFields: FieldDefs = {
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
  keywords: {
    type: "list",
    of: { type: "string" },
    description: "List of keywords for the content",
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

  canonical: {
    type: "string",
    description: "Canonical url of the content",
    required: false,
  },

  // todo: enable setting custom slugs via the metadata
  // slug: {
  //   type: "string",
  //   description: "Custom URL slug for the content",
  //   required: false,
  // },

  // todo: enable setting a featured flag via the metadata
  // featured: {
  //   type: "boolean",
  //   description: "Whether or not this content is featured",
  //   required: false,
  // },

  image: {
    type: "string",
    description:
      "The primary image of the content (also used in the SEO metadata)",
    required: false,
  },

  isExternal: {
    type: "boolean",
    description: "Is this content just a link to external content?",
    default: false,
  },
  href: {
    type: "string",
    description: "Absolute URL for external content",
  },

  tags: {
    type: "list",
    of: { type: "string" },
    description: "List of filterable tags for content",
    required: false,
  },
  featured: {
    type: "boolean",
    description: "Should this content featured?",
    default: false,
  },
  featuredPriority: {
    type: "number",
    description: "Sort priority for featured content displays",
    default: 999,
  },

  difficulty: {
    type: "enum",
    description: "Difficulty level of the content",
    options: ["Intro", "Beginner", "Intermediate", "Expert"],
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
  filePathPattern: `developers/resources/**/*.md`,
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
  filePathPattern: `developers/guides/**/*.md`,
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
 * Content record schema for the Course metadata file
 *
 * File: `courses/{course-name}/metadata.json`
 */
export const CourseMetadata = defineDocumentType(() => ({
  name: "CourseMetadata",
  filePathPattern: `developers/courses/**/metadata.json`,
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
  filePathPattern: `developers/courses/**/content/*.md`,
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
    id: {
      type: "string",
      description: "Manually defined unique id for this document",
      required: false,
    },
    href: {
      type: "string",
      description: "Manually defined href path for this document",
      required: false,
    },
    path: {
      type: "string",
      description:
        "Path location of the markdown file, located within the '/docs' directory",
      required: false,
    },

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
    "developers/guides/**",
    "developers/courses/**",
    "developers/resources/**",
  ],

  // include the content record types to support
  documentTypes: [
    IgnoredDoc,

    // developer specific content
    SolanaDoc,
    DeveloperGuide,
    DeveloperResource,

    // course specific content record types
    CourseMetadata,
    CourseLesson,
  ],

  // settings to force fail on bad data schema
  onUnknownDocuments: "fail",
  onMissingOrIncompatibleData: "fail",
  onExtraFieldData: "fail",
});
