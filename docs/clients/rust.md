---
sidebarLabel: Rust
title: Rust Client for Solana
sidebarSortOrder: 1
description: Learn how to use Solana's Rust crates for development.
---

Solana's Rust crates are
[published to crates.io](https://crates.io/search?q=solana-) and can be found
[on docs.rs](https://docs.rs/releases/search?query=solana-) with the `solana-`
prefix.

<Callout title="Hello World: Get started with Solana development">

To quickly get started with Solana development and build your first Rust
program, take a look at these detailed quick start guides:

- [Build and deploy your first Solana program using only your browser](/content/guides/getstarted/hello-world-in-your-browser.md).
  No installation needed.
- [Setup your local environment](/docs/intro/installation) and use the local
  test validator.

</Callout>

## Rust Crates

The following are the most important and commonly used Rust crates for Solana
development:

- [`solana-program`] &mdash; Imported by programs running on Solana, compiled to
  SBF. This crate contains many fundamental data types and is re-exported from
  [`solana-sdk`], which cannot be imported from a Solana program.

- [`solana-sdk`] &mdash; The basic offchain SDK, it re-exports
  [`solana-program`] and adds more APIs on top of that. Most Solana programs
  that do not run on-chain will import this.

- [`solana-client`] &mdash; For interacting with a Solana node via the
  [JSON RPC API](/docs/rpc).

- [`solana-cli-config`] &mdash; Loading and saving the Solana CLI configuration
  file.

- [`solana-clap-utils`] &mdash; Routines for setting up a CLI, using [`clap`],
  as used by the main Solana CLI. Includes functions for loading all types of
  signers supported by the CLI.

[`solana-program`]: https://docs.rs/solana-program
[`solana-sdk`]: https://docs.rs/solana-sdk
[`solana-client`]: https://docs.rs/solana-client
[`solana-cli-config`]: https://docs.rs/solana-cli-config
[`solana-clap-utils`]: https://docs.rs/solana-clap-utils
[`clap`]: https://docs.rs/clap
