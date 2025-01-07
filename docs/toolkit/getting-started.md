---
title: Getting Started
sidebarSortOrder: 1
sidebarLabel: Getting Started
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

The Solana Program development toolkit is publish as the
[mucho npm package](https://www.npmjs.com/package/mucho). The `mucho` command
will be used to run all the solana program development tools - _mucho tools, one
cli_.

## Installation

To get started, install The Solana toolkit:

```shell
npx mucho install
```

This will install the latest versions of the following:

- [Solana CLI / Agave Tool Suite](https://docs.anza.xyz/cli/): A command line
  tool that allows developers to interact with the Solana blockchain, manage
  accounts, send transactions, and deploy programs.
- [Rust](https://doc.rust-lang.org/book/): The Programming language that Solana
  Smart Contracts are written in.
- [Anchor](https://www.anchor-lang.com/): A framework for writing Solana
  programs that abstracts many complexities to speed up smart contract
  development.
- [Fuzz Tester](https://ackee.xyz/trident/docs/latest/): Rust-based Fuzzing
  framework for Solana programs to help you ship secure code.
- [Code Coverage Tool](https://github.com/LimeChain/zest?tab=readme-ov-file): A
  code coverage CLI tool for Solana programs.

### Generate a keypair

For a fresh installation of the [Solana CLI](https://docs.anza.xyz/cli/), you're
required to generate a new keypair.

```shell
solana-keygen new
```

_This will store the your new keypair at the Solana CLI's default path
(`~/.config/solana/id.json`) and print the pubkey that was generated._

### Query your keypair's public key

```shell
solana address
```

### Fund your keypair

```shell
solana airdrop 10 --url localhost
```

### Set your network configuration

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
npx mucho validator
```

For a more information, read the [Local Testing Guide](local-testing.md).

### Next Steps

Now let's [Create a Solana Project](projects/overview.md)!
