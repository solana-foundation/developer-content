---
title: Testing Basics
sidebarSortOrder: 0
sidebarLabel: Testing Basics
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

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
[Solana Test Validator Guide](https://solana.com/developers/guides/getstarted/solana-test-validator).
