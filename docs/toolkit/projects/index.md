---
title: Creating a Project
sidebarSortOrder: 2
sidebarLabel: Creating a Project
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

Choose from one of the below scaffolds to generate a new project workspace:

### Anchor

```shell
anchor init
```

This generates a basic workspace to be able to write an anchor rust smart
contracts, build, test, and deploy. For more information, read the
[anchor init doc](anchor-init.md).

### Create Solana Program

```shell
pnpm create-solana-program
```

This generates an in-depth workspace for either Anchor smart contract
development or Native smart contract development with either a Javascript
Client, a Rust Client, or both. For more information, read the
[create-solana-program doc](solana-program.md).

### Web App Template

```shell
npx create-solana-dapp
```

This initializes a new project that connects a Solana smart contract to a
typescript frontend with a wallet connector. For more information, read the
[web app template doc](web-app.md)

### Mobile App Template

```shell
yarn create expo-app --template @solana-mobile/solana-mobile-expo-template
```

This is initializing a new project using the Expo framework that is specifically
designed for creating mobile applications that interact with the Solana
blockchain.

### Update an Existing Project

```shell
pnpm create-solana-program
```

You can add the solana program scaffold to an existing project by following this
[guide](existing-project.md).

### Standard Project Layouts

For best practices on smart contract file structure, read this
[guide](project-layout.md)
