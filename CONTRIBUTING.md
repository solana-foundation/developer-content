# Solana Developer Content Contributing Guide

We love your input! We want to make contributing to the
[Solana Developer](https://solana.com/developers) content as easy and
transparent as possible, whether it's:

- Reporting a bug
- Submitting a fix
- Discussing the current state of this repo
- Proposing new features

## Key points

- called the "developer content" repo or "developer content api"
- written in markdown with yaml frontmatter
- used yaml frontmatter, with structure enforced with Contentlayer
- all pages are grouped into "content types"
- supports some select custom components
- publicly displayed via the UI of [solana.com](https://solana.com) (located in
  a different repo)
- content translations are supported via Crowdin

## Content guidelines

Since this content within this repo is meant to be publicly displayed on
`solana.com`, we have very specific guidelines for the content that can be
merged into this repo (and eventually displayed on solana.com). If you would
like to submit changes to existing content or add new content, all of these
guidelines should be observed:

### Avoid official recommendations

Avoid any language around making "official recommendations" such as "I recommend
product X" or "product Y is the best". The content within this repo will be
publicly published on solana.com which is maintained by the
[Solana Foundation](https://solana.org). As such, any "product recommendations"
may appear as if coming directly the Solana Foundation. The Solana Foundation
does not make official recommendations for products, but rather help share what
options are available in the broader Solana ecosystem.

### Avoid "picking favorites"

Avoid language similar to "service X is my favorite". When talking about or
naming specific products within the Solana ecosystem, writers and maintainers
should make their best attempt to list multiple options that meet similar use
cases. As a general rule of thumb, try to share at least 3-4 options of similar
products or services, not just a single named one. For example, when talking
about wallet providers, a writer could list Phantom, Solflare, Backpack, and
Ultimate. When talking about RPC providers, a writer could list Triton, Helius,
and QuickNode.

### Use up-to-date code snippets

Write content that uses up-to-date code. Code bases change, functions get
deprecated, methods get removed. When submitting code snippets within content
here, use the most up-to-date code available for the given functionality being
used. Especially net new content, like adding a new guide.

## Style guidelines

To aid in keeping both consistent content and a high quality experience, all
code/content maintained within this repo shall use the style guidelines set
forth here.

Failure to adhere to these style guidelines will slow down the review process.

### Prettier

This repo uses prettier to help maintain the quality and consistency of the
content within. There is a master
[prettier configuration file](https://github.com/solana-foundation/developer-content/blob/main/.prettierrc)
(`.prettierrc`) in the root of this repo.

On all commits and PRs, their is a GitHub action that checks if your PR follows
the master prettier formatting. If your branch/code does NOT meet the prettier
formatting requirements, it will not be merged and it will delay its review.

If your editor is not configured to auto format on save using prettier, then you
can run the following command to auto format all files in your local repo/PR:

```shell
yarn prettier:fix
```

You can also run the prettier check command to see which files do not follow the
prettier formatting guidelines.

```shell
yarn prettier
```

## Content types

This repo contains multiple different types of developer content records. Each
grouping of records (called a "content type") serve a different purpose and are
handled differently when displayed in the UI of `solana.com`.

Below is a table describing each active content type group, including the
corresponding path within this repo and webpage for viewing on solana.com:

| Content Type | Repo Path                                   | Webpage URL                                               |
| ------------ | ------------------------------------------- | --------------------------------------------------------- |
| `docs`       | [`/docs`](/docs/)                           | [View Docs](https://solana.com/docs)                      |
| `guides`     | [`/content/guides`](/content/guides/)       | [View Guides](https://solana.com/developers/guides)       |
| `resources`  | [`/content/resources`](/content/resources/) | [View Resources](https://solana.com/developers/resources) |
| `cookbook`   | [`/content/cookbook`](/content/cookbook)    | [View Cookbook](https://solana.com/developers/cookbook)   |

## Written in markdown

Every piece of content within this repo is normally written in markdown with
yaml frontmatter. With some support for specific
[custom components](#components) using React and MDX.

We typically use GitHub flavor markdown (GFM) which you can
[learn more about here](https://github.github.com/gfm/).

## Frontmatter

The yaml frontmatter is used to provide additional metadata about a given piece
of content. Each content type has specifically supported frontmatter fields,
some required and some optional. All available frontmatter fields are enforced
via [Contentlayer](#why-contentlayer) (see more below).

### Why Contentlayer?

[Contentlayer](https://contentlayer.dev/) offers yaml frontmatter structure
enforcement and type safety for the frontmatter fields on every content record,
including generating TypeScript types for each content type's grouping.

Contentlayer does this code generation by enabling us to define a custom data
schema for the frontmatter. You can view the current Contentlayer schema here:
[`contentlayer.config.ts`](/contentlayer.config.ts)

If any content records contains unsupported or misspelled fields in the
frontmatter, Contentlayer will throw an error. Preventing misconfigured content
from being shipped to production.

### Default frontmatter fields

Each content type (i.e. `docs`, `guides`, `resources`, etc) has the ability to
support different custom metadata fields within the yaml frontmatter.

While each content group may support additional frontmatter fields, the
following are default supported by all content groups:

- [`title`](#title)
- [`description`](#description)
- [`tags`](#tags)
- [`date`](#date)

#### title

The primary title of the individual piece of content

- name: `title`
- type: `string`
- required: `true`

#### description

Brief description of the content (also used in the SEO metadata)

- name: `description`
- type: `string`
- required: `false`

> This field will be used when a short description is needed to be displayed,
> like in typical blog style "overview cards" and for SEO related metadata.

#### `tags`

List of filterable tags for content

- name: `tags`
- type: `string`
- required: `false`

#### date

The date this content was published.

- name: `date`
- type: `string`
- required: `false`

#### updatedDate

The date this content was last updated.

- name: `updatedDate`
- type: `date`
- required: `false`

### Frontmatter for Docs

At this time, the `docs` content type does not have any additional frontmatter
fields. They only support the shared default fields

> Note: While technically, the `docs` content type is separate than the `rpc`
> content type, these are effectively treated the same. Therefore, assume all
> mentions of `docs` also apply to the `rpc` type unless otherwise noted.

### Frontmatter for Guides

At this time, the `guides` content type does not have any additional frontmatter
fields. They only support the shared default fields.

### Frontmatter for Resources

In addition to the default frontmatter fields, `resources` support the following
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

In addition to the standard GitHub-flavored markdown text, the content records
within this repo support some extra functionality powered by custom React
components (or custom implementations of standard components). The following is
a list of available components

> Note: While markdown does normally support standard HTML tags being rendered
> with the rest of the markdown document's content, this should normally be
> avoided within this developer content repo. See more in the
> [Style Guidelines](#style) section.

- [code blocks](#code-blocks) - additional functionality on top of standard
  markdown code blocks
- [blockquote](#blockquote) - additional functionality on top of the standard
  HTML `blockquote` element
- [Callout](#callout) -
- [Embed](#embed) - embedding specific types of external content (i.e. YouTube
  videos)

### Code blocks

In addition to standard markdown
["fenced" code blocks](https://github.github.com/gfm/#fenced-code-blocks) (i.e.
using triple backticks), the developer content repo supports additional
functionality on top of code blocks.

> Code block syntax highlighting and some other features utilize
> [`rehype-pretty-code`](https://rehype-pretty.pages.dev/) and
> [`skiki`](https://github.com/shikijs/shiki) under the hood for some of the
> additional functionality supported.

#### Meta strings

#### Syntax highlighting

Each code block can have syntax highlighting for its specific language by noting
the language used immediately following the triple backticks.

Most code languages are supported including these commonly used ones: `rust`,
`ts` or `typescript`, `js` or `javascript`, `toml`, `shell`

The code block's language should be in all lower case and have no space between
the language name and the backticks.

Examples:

````md
```ts
const example: string = "this is typescript";
```
````

````md
```shell
solana airdrop 2
```
````

#### File names

Code blocks can be have an optional header displayed on top the code block
element itself. This is commonly used to display the "file name" in which a code
snippet comes from.

To display the file name header on a code block, in the same line of the triple
backticks and language add the `filename=` field and set your desired name.

Examples:

````md
```ts filename="index.ts"
const example: string = "this is typescript";
```
````

````md
```rust filename="lib.rs"
use anchor_lang::prelude::*;

declare_id!("Bims5KmWhFne1m1UT4bfSknBEoECeYfztoKrsR2jTnrA");
```
````

#### Highlight lines

Code block can highlight lines using the
[syntax provided via `rehype-pretty-code`](https://rehype-pretty.pages.dev/#highlight-lines).

In the meta string, place a numeric range inside `{}`.

Examples:

````md
```js {1}
// this will be highlighted
// this will NOT
```
````

````md
```rust filename="lib.rs" {1,3}
// this will be highlighted
// this will NOT
// this will be highlighted
```
````

#### Highlight characters

Code block can highlight characters using the
[syntax provided via `rehype-pretty-code`](https://rehype-pretty.pages.dev/#highlight-chars).

In the meta string, place character segments between two `/` symbols. You can
also highlight multiple segments of characters.

Examples:

````md
```js /word/
// this will be highlighted: word
// this will partially highlight: hello-word
```
````

````md
```js /word/ /partially/
// this will be highlighted: word
// this will partially highlight: hello-word
```
````

````md
```rust filename="lib.rs" /word/ {1,3}
// this will be highlighted: word
// nothing highlighted
// this will partially highlighted word and line: hello-word
```
````

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

### blockquote

Standard markdown quote blocks are rendered with our custom
[Callout component](#callout).

```md
> This will be the Callout component with it's default styles
```

### Callout

### Embed

The `Embed` component can be used to handle custom rendering of specifically
supported external content.

Currently supported external content:

- [YouTube videos](#youtube-video)
- [Whimsical diagram](#whimsical-diagram)

#### YouTube video

To embed a YouTube video:

```md
<Embed url="https://youtu.be/eudSSvyZF9o" />
```

Or

```md
<Embed url="https://www.youtube.com/watch?v=eudSSvyZF9o" />
```

#### Whimsical diagram

To embed a Whimsical diagram:

```mdx
<Embed url="https://whimsical.com/embed/PjBVAREV3DMyW5722tFKJ8" />
```

## Translations

Content translations are supported via the Crowdin platform.

All the markdown content committed to this repo is in the base language of
`English`. On each successful merge of content, all changes are uploaded to
Crowdin (via GitHub actions) for them to be translated into the supported
locales.

During production deployments of the developer content api, all the currently
translated content is downloaded from Crowdin and deployed for solana.com to
correctly render the user requested locale of content. Falling back to the base
language when no translated content was found.

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
