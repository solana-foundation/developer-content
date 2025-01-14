---
title: Web App with a Program Connection
sidebarSortOrder: 5
sidebarLabel: Web App
description:
  "How to set up create a web app for solana program development with create solana dapp"
keywords:
  - solana web app development
  - create solana dapp
  - intro to solana development
  - projects on solana 
  - solana program development
  - create a solana project
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

```shell
npx create-solana-dapp
```

This command generates a new project that connects a Solana program to a
frontend with a wallet connector. It has options for multiple popular frontend
stacks and UI libraries, including: NextJS, React, Tailwind, and more.

## Build and Test

To test out this project before making any modifications, follow these steps:

<Steps>

### Build the smart contract

```shell
npm run anchor-build
```

### Start the local validator

```shell
npm run anchor-localnet
```

### Run tests

```shell
npm run anchor-test
```

### Deploy to the local validator

```shell
npm run anchor deploy --provider.cluster localnet
```

### Build the web app

```shell
npm run build
```

### Run the web app

```shell
npm run dev
```

</Steps>

## Additional Resources

- [`create-solana-dapp` README](https://github.com/solana-developers/create-solana-dapp)
- [CRUD App Example](/content/guides/dapps/journal.md)
- [Anchor book](https://www.anchor-lang.com/)
- [Getting Started with Anchor](/docs/programs/anchor/index.md)
- [Program Examples](https://github.com/solana-developers/program-examples)
