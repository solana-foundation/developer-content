---
sidebarLabel: Testing Basics
title: Solana Testing Basics
sidebarSortOrder: 2
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

## Build

```shell
npx mucho build
```

## Start Localnet

```shell
npx mucho validator
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
npx solana deploy
```

For more information on local validator customization and commands, read the
[Solana Test Validator Guide](/content/guides/getstarted/solana-test-validator.md).
