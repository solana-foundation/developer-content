# Solana Developer Content

This repo is the open source home of content for developers looking to
[learn and develop](https://solana.com/developers) on the Solana blockchain.

These markdown based content posts are gathered from contributors from around
the Solana ecosystem and displayed on
[solana.com/developers](solana.com/developers) for all to learn from.

Currently, there are a few primary types of Solana Developer content within this
repo:

- [developer guides](#developer-guides) - tutorials on how to build dApps and
  programs on the Solana blockchain
- [developer resources](#developer-resources) - collection of the popular
  frameworks, sdks, documentation sites, and developer tools from around the
  ecosystem

### Developer Guides

The [Solana Developer guides](https://solana.com/developers/guides) teach new
and experienced developers how to build on Solana. They teach various
programming concepts on Solana and often dive into popular sdks and provide code
examples to build dApps.

### Developer Resources

Explore the top
[Solana Developer resources](https://solana.com/developers/resources) from
around the ecosystem. Including the most popular developer frameworks, sdks,
documentation websites, and general developer tooling.

### Developer Courses

Soon, tm.

## Developer Content Repo

This repo contains multiple different types of developer "content records". Each
type grouping of content records aims to sever a specific purpose.

### Available content types

Below is a table describing each currently active type of content, including the
corresponding repo path and webpage for viewing on Solana.com.

| Content Type | Repo Path                                     | Webpage URL                                               |
| ------------ | --------------------------------------------- | --------------------------------------------------------- |
| guides       | [`./content/guides`](./content/guides/)       | [View guides](https://solana.com/developers/guides)       |
| resources    | [`./content/resources`](./content/resources/) | [View resources](https://solana.com/developers/resources) |
| courses      | [`./content/courses`](./content/courses/)     | soon, tm.                                                 |

### Written in markdown

The various types of developer content records within this repo are written in
standard markdown files, with YAML frontmatter.

Each of the content records use the YAML frontmatter to store specific pieces of
metadata about the content. The specifically required YAML fields may be
slightly different between the content records groups (e.g. `guides`,
`resources`, `courses`, etc).

The specific list of required and optional frontmatter fields are viewable in
the [`contentlayer.config.ts`](./contentlayer.config.ts) file. And are enforced
via [Contentlayer](https://www.contentlayer.dev/) and GitHub actions.
