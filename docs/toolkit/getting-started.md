---
title: Getting Started
---

## Installation

To get started, install The Solana toolkit:

```shell
npx solana install
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

## Keypair generation

For a fresh installation of the [Solana CLI](https://docs.anza.xyz/cli/), you're
required to generate a new keypair.

```shell
solana-keygen new
```

The above command will both:

- print the pubkey generated
- store the your new keypair at the Solana CLI's default path
  (`~/.config/solana/id.json`) unless you already have a keypair saved there

Get the pubkey of your machine's newly generated keypair:

```shell
solana address
```

## Fund the CLI keypair

```shell
solana airdrop 10
```

## Network Configuration

Check your current configuration:

```shell
solana config get
```

You can configure your RPC to connect to either mainnet, testnet, devnet, or
your localhost.

When using this toolkit, most of the time you'll want to be connected to a local
node.

Update your Solana configuration to connect to localhost:

```shell
solana config set --url localhost
```

To test locally, you must also spin up a local node to run on your localhost:

```shell
solana-test-validator
```

To log the network run:

```shell
solana logs
```

For a more information, read this
[Solana Test Validator Guide](https://solana.com/developers/guides/getstarted/solana-test-validator).
