---
featured: true
date: Jun 26, 2023
difficulty: intro
title: "Install the Solana CLI for local development"
description:
  "Quickstart guide on how to install the Solana CLI and setup your local Solana
  development environment on Linux, Mac or Windows."
tags:
  - quickstart
  - linux
  - mac
  - windows
  - local
  - cli
keywords:
  - rust
  - cargo
  - toml
  - program
  - tutorial
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
---

This quickstart guide will demonstrate how to quickly install and setup your
local development environment, getting you ready to start developing and
deploying Solana programs to the blockchain.

## What you will learn

- how to install the Solana CLI locally
- how to setup a localhost Solana cluster/validator
- how to create a Solana wallet for developing
- how to airdrop SOL tokens for your wallet

## Windows users only

Users on Windows 10 or 11 should install:

- [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install),
  which provides a Linux environment that runs inside your existing Windows
  installation. You can then run regular Linux software, including the Linux
  versions of Solana CLI.
- [Windows Terminal](https://www.microsoft.com/store/productId/9N0DX20HK701), a
  modern terminal for Windows.

Once you've installed both Windows Subsystem for Linux and Windows Terminal,
open Windows Terminal and start a new tab for your Linux distribution (e.g.
'Ubuntu') using the `wsl` command.

Then continue with this guide, running each of the terminal commands within this
Linux terminal.

## Install the Solana CLI

To interact with the Solana clusters from your terminal, install the
[Solana CLI tool suite](https://docs.solana.com/cli/install-solana-cli-tools) on
your local system:

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

## Setup a localhost blockchain cluster

The Solana CLI comes with the
[test validator](https://docs.solana.com/developing/test-validator) built in.
This command line tool will allow you to run a full blockchain cluster on your
machine.

```bash
solana-test-validator
```

> **PRO TIP:** Run the Solana test validator in a new/separate terminal window
> that will remain open. The command line program must remain running for your
> localhost cluster to remain online and ready for action.

Configure your Solana CLI to use your localhost validator for all your future
terminal commands:

```bash
solana config set --url localhost
```

At any time, you can view your current Solana CLI configuration settings:

```bash
solana config get
```

## Create a file system wallet

To deploy a program with Solana CLI, you will need a Solana wallet with SOL
tokens to pay for the cost of transactions.

Let's create a simple file system wallet for testing:

```bash
solana-keygen new
```

By default, the `solana-keygen` command will create a new file system wallet
located at `~/.config/solana/id.json`. You can manually specify the output file
location using the `--outfile /path` option.

> **NOTE:** If you already have a file system wallet saved at the default
> location, this command will **NOT** override it (unless you explicitly force
> override using the `--force` flag).

### Set your new wallet as default

With your new file system wallet created, you must tell the Solana CLI to use
this wallet to deploy and take ownership of your on chain program:

```bash
solana config set -k ~/.config/solana/id.json
```

## Airdrop SOL tokens to your wallet

Once your new wallet is set as the default, you can request a free airdrop of
SOL tokens to it:

```bash
solana airdrop 2
```

> **NOTE:** The `solana airdrop` command has a limit of how many SOL tokens can
> be requested _per airdrop_ for each cluster (localhost, testnet, or devnet).
> If your airdrop transaction fails, lower your airdrop request quantity and try
> again.

You can check your current wallet's SOL balance any time:

```bash
solana balance
```

## Next steps

See the links below to learn more about writing Rust based Solana programs:

- [Create and deploy a Solana Rust program](./local-rust-hello-world.md)
- [Overview of writing Solana programs](https://docs.solana.com/developing/on-chain-programs/overview)
