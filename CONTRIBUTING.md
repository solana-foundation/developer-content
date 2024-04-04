# Solana Developer Content Contributing Guide

- written in markdown with yaml frontmatter
- used yaml frontmatter, with structure enforced with Contentlayer
- grouped into "content types"
- supports some select custom components
- publicly displayed via the UI of [solana.com](https://solana.com) (located in
  a different repo)
- content translations are supported via Crowdin

## Content guidelines

Since this content within this repo is meant to be publicly displayed on
solana.com, we have very specific guidelines for the content that can be merged
into this repo (and eventually displayed on solana.com). IF you would like to
submit changes to existing content or add new content, all of these guidelines
should be observed:

1. Avoid official recommendations. Avoid any language around making "official
   recommendations" such as "I recommend product X" or "product Y is the best".
   The content within this repo will be publicly published on solana.com which
   is maintained by the Solana Foundation. Any "product recommendations" may
   appear as if coming directly the Solana Foundation. The Solana Foundation
   does not make official recommendations for products, but rather help share
   what product options are available.

2. Avoid "picking favorites". Avoid language similar to "service X is my
   favorite". When talking about or naming specific products within the Solana
   ecosystem, writers should make their best attempt to list multiple options
   that meet similar use cases. For example, when talking about wallet
   providers, a writer can list Phantom, Solflare, Backpack, and Ultimate. When
   talking about RPC providers, a writer can list Triton, Helius, and QuickNode.
   As a general rule of thumb, try to share at least 3-4 options of similar
   products or services, not just a single named one.

3. Write content that uses up-to-date code. Code bases change, functions get
   deprecated, methods get removed. When submitting code snippets within
   content, use the most up-to-date code available for the given functionality
   being used. Especially net new content, like adding a new guide.

## Content types

This repo contains multiple different types of developer content records. Each
grouping of records (called a "content type") serves a different purpose and are
handled differently when displayed in the UI of solana.com

Below is a table describing each active grouping type, including the
corresponding repo path and webpage for viewing on solana.com:

| Content Type | Repo Path                                   | Webpage URL                                               |
| ------------ | ------------------------------------------- | --------------------------------------------------------- |
| `docs`       | [`/docs`](/docs/)                           | [View Docs](https://solana.com/docs)                      |
| `guides`     | [`/content/guides`](/content/guides/)       | [View Guides](https://solana.com/developers/guides)       |
| `resources`  | [`/content/resources`](/content/resources/) | [View Resources](https://solana.com/developers/resources) |

## Written in markdown

Every piece of content within this repo is normally written in markdown with
yaml frontmatter. With some support for specific
[custom components](#components) using React via MDX.

We typically use GitHub flavor markdown (GFM) which you can
[learn more about here](https://github.github.com/gfm/).

## Frontmatter

The yaml frontmatter is used to provide additional metadata about a given piece
of content. Each content type has specifically supported frontmatter fields,
some required and more optional. All available frontmatter fields are enforced
via Contentlayer (see more below).

### Why Contentlayer?

Contentlayer offers yaml frontmatter structure enforcement and type safety for
the frontmatter fields on every content record, including generating TypeScript
types for each content grouping.

Contentlayer does this code generation by allowing us to define a custom data
schema for the frontmatter. You can view the current Contentlayer schema here:
[`contentlayer.config.ts`](/contentlayer.config.ts)

If any content records contains unsupported or misspelled fields in the
frontmatter, Contentlayer will throw an error. Preventing misconfigured content
from being shipped to production.

### Default frontmatter fields

Each content type (i.e. `docs`, `guides`, `resources`, etc) support different
custom metadata fields within the yaml frontmatter. The specific fields

While each content group may support additional frontmatter fields, the
following are default supported by all content groups:

- [`title`](#title)
- [`description`](#description)

#### `title`

The primary title of the individual piece of content

- type: `string`
- required: `true`

#### `description`

Brief description of the content (also used in the SEO metadata)

- type: `string`
- required: `false`

### Frontmatter for Docs

At this time, `docs` do not have any additional frontmatter fields.

### Frontmatter for Guides

At this time, `guides` do not have any additional frontmatter fields.

### Frontmatter for Resources

In addition to the default frontmatter fields, `resources` have the following
fields:

- [`category`](#category)
- [`repoUrl`](#repourl)

#### `category`

General category of the resource

- type: `enum`
- required: `true`
- values:
  - `documentation`
  - `framework`
  - `sdk`

#### `repoUrl`

Repository URL for the developer resources

- type: `string`
- required: `false`

## Components

- [code blocks](#code-blocks) - additional functionality on top of standard
  markdown code blocks
- [`Callout`](#callout) -
- [`Embed`](#embed) -

todo: docs side by side components

### Code blocks

In addition to standard markdown
["fenced" code blocks](https://github.github.com/gfm/#fenced-code-blocks) (i.e.
using triple backticks), the developer content repo supports additional
functionality on top of code blocks.

> Code block syntax highlighting and some other features utilize
> [`rehype-pretty-code`](https://rehype-pretty.pages.dev/) and
> [`skiki`](https://github.com/shikijs/shiki) under the hood.

#### Syntax highlighting

Each code block can have syntax highlighting for its specific language by noting
the language used immediately following the triple backticks.

Most code languages are supported including these commonly used ones: `rust`,
`ts` or `typescript`, `js` or `javascript`, `toml`, `shell`

> Note: The code block's language should be in all lower case and have no space
> between the language name and the backticks. Also, some languages

Examples:

````md
```ts
const language = "this is javascript";
```
````

````md
```shell
solana airdrop 2
```
````

#### File names

Code blocks can be have an optional "file name" specified and displayed just
above the code block itself.

To display a file name on a code block, in the same line of the triple backticks
and language add the `filename=` field and set your desired name.

Examples:

````md
```ts filename=index.ts
const language = "this is javascript";
```
````

````md
```rust filename=lib.rs
use anchor_lang::prelude::*;

declare_id!("Bims5KmWhFne1m1UT4bfSknBEoECeYfztoKrsR2jTnrA");
```
````

#### Line highlighting

#### Word highlighting

#### Diff lines

Within a code block you can create a "diff" style line (i.e. a line was added or
a line was removed) using the

At the end of a line, add one of the following notations to the end of a line:

- to show a red "line removed" diff line: `// [!code --]`
- to show a green "line added" diff line: `// [!code ++]`

Example:

```ts
const keep = "line that stays";
const updated = "example that was should be removed"; // [!code --]
const updated = "example that was should be added"; // [!code ++]
const didNotChange = "this line did not change";
```

####

### `Callout`

### `Embed`

Examples:

To embed a Whimsical diagram:

```mdx
<Embed url="https://whimsical.com/embed/PjBVAREV3DMyW5722tFKJ8" />
```

To embed a YouTube video:

```md
<Embed url="https://youtu.be/eudSSvyZF9o" />

<!-- or -->

<Embed url="https://www.youtube.com/watch?v=eudSSvyZF9o" />
```

## Translations

## Submitting a Guide

## Submitting a Resource

## Local development

This developer content repo is a NextJS application that serves the markdown
based content as REST api for solana.com to consume. Think of it like a
microservice for content.

We call this microservice the "developer content api", or content api for short.

### Setup locally

To setup the developer content api:

1. Clone the repo to your local machine:

```shell
git clone https://github.com/solana-foundation/developer-content.git
cd developer-content
```

2. Install the dependencies via `yarn`:

```shell
yarn install
```

3. Run the developer content api locally:

```shell
yarn dev
```

> Note: The developer content api normally runs locally on port `3001`

```

```
