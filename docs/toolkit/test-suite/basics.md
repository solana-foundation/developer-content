---
sidebarLabel: Testing Basics
title: Solana Testing Basics
sidebarSortOrder: 2
seoTitle: "How to test Solana programs"
description: "How to run tests for Solana program development"
keywords:
  - solana development
  - solana testing
  - test basics
  - how to test programs
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

## Installation

Install the Solana Toolkit and mucho CLI by running the following command:

```shell
npx -y mucho@latest install
```

## Build

```shell
mucho build
```

## Start Localnet

```shell
mucho validator
```

## Run Tests

Anchor Programs:

```shell
anchor test
```

Native Programs:

```shell
cargo test
```

## Deploy

```shell
mucho deploy
```

For more information on local validator customization and commands, read the
[Solana Test Validator Guide](/content/guides/getstarted/solana-test-validator.md).
