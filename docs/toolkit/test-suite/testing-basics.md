---
title: Testing Basics
sidebarSortOrder: 0
sidebarLabel: Testing Basics
---

Sync all the program's key. If you're using an Anchor program:

```shell
anchor keys sync
```

Build the smart contract:

```shell
npx solana build
```

Test the smart contract:

```shell
npx solana test
```

Deploy the smart contract:

```shell
npx solana deploy
```

If deploying to localnet, you must first start your local validator:

```shell
solana-test-validator
```

For more information on local validator customization and commands, read the
[Solana Test Validator Guide](https://solana.com/developers/guides/getstarted/solana-test-validator).
