---
sidebarSortOrder: 1
sidebarLabel: Getting Started
title: Getting Started with the Solana Toolkit
description: "How to set up the Solana Toolkit and install the Solana CLI"
seoTitle: "How to set up the Solana Toolkit and install the Solana CLI"
keywords:
  - solana toolkit
  - smart contract development
  - program development
  - program tools
  - solana tools
  - smart contract tools
  - solana foundry
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

The Solana Program development toolkit is published as the
[`mucho` npm package](https://www.npmjs.com/package/mucho). The `mucho` command
will be used to run most of the Solana program development tools within the
toolkit - _mucho tools, one cli_.

## Installation

To get started, install The Solana Toolkit:

```shell
npx -y mucho@latest install
mucho --version
```

This will install the latest versions of the following:

- [Solana CLI / Agave Tool Suite](https://docs.anza.xyz/cli/): A command line
  tool that allows developers to interact with the Solana blockchain, manage
  accounts, send transactions, and deploy programs.
- [Mucho CLI](https://github.com/solana-developers/mucho) - a superset of
  popular developer tools within the Solana ecosystem used to simplify the
  development and testing of Solana blockchain programs.
- [Rust](https://doc.rust-lang.org/book/): The programming language that Solana
  Smart Contracts are written in.
- [Anchor](https://www.anchor-lang.com/): A framework for writing Solana
  programs that abstracts many complexities to speed up smart contract
  development.
- [Fuzz Tester](https://ackee.xyz/trident/docs/latest/): Rust-based fuzzing
  framework for Solana programs to help you ship secure code.
- [Code Coverage Tool](https://github.com/LimeChain/zest?tab=readme-ov-file): A
  code coverage CLI tool for Solana programs.

After installation, all `mucho` commands can be run as follows:

```shell
mucho --help
```

## Generate a keypair

For a fresh installation of the [Solana CLI](https://docs.anza.xyz/cli/), you're
required to generate a new keypair.

```shell
solana-keygen new
```

_This will store the your new keypair at the Solana CLI's default path
(`~/.config/solana/id.json`) and print the pubkey that was generated._

## Get your keypair's public key

```shell
solana address
```

## Fund your keypair

```shell
solana airdrop 10 --url localhost
```

## Set your network configuration

Check your current config:

```shell
solana config get
```

To use this toolkit, update your config to connect to localhost:

```shell
solana config set --url localhost
```

To test locally, you must also spin up a local node to run on your localhost:

```shell
mucho validator
```

For a more information, read the
[Local Testing Guide](/docs/toolkit/local-validator.md).

## Next Steps

Now let's [Create a Solana Project](/docs/toolkit/projects/overview.md)!
