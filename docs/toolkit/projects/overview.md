---
title: Program Project Templates
sidebarSortOrder: 1
sidebarLabel: Overview
altRoutes:
  - /docs/toolkit/projects
seoTitle: "How to create a new Solana program or app"
description: "How to create a new project for Solana program development for beginners."
keywords:
  - anchor
  - anchor init
  - solana anchor development
  - create solana program
  - intro to solana development
  - projects on solana
  - solana program development
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

Choose from one of the below scaffolds to generate a new project workspace:

- [Anchor](#anchor) - A popular Rust-based framework for creating Solana
  programs.
- [`create-solana-program`](#create-solana-program) - In-depth workspace
  generator for either Anchor program development or Native programs, including
  JavaScript and Rust clients.
- [Web App Templates](#web-app-template) - Generator for new projects that
  connects a Solana programs to various frontend stacks, includes wallet
  connector setup.

## Anchor

```shell
anchor init
```

This generates a basic workspace to be able to write an Anchor rust programs,
build, test, and deploy. For more information, read the
[`anchor init` doc](/docs/toolkit/projects/anchor-init.md).

## Create Solana Program

```shell
npx create-solana-program
```

This generates an in-depth workspace for either Anchor program development or
Native program development with either a Javascript Client, Rust Client, or
both. For more information, read the
[`create-solana-program` doc](/docs/toolkit/projects/solana-program.md).

## Web App Template

```shell
npx create-solana-dapp
```

This initializes a new project that connects a Solana program to a typescript
frontend with a wallet connector. For more information, read the
[web app template doc](/docs/toolkit/projects/web-app.md).

## Mobile App Template

```shell
yarn create expo-app --template @solana-mobile/solana-mobile-expo-template
```

This is initializing a new project using the Expo framework that is specifically
designed for creating mobile applications that interact with the Solana
blockchain.

## Update an Existing Project

```shell
npx create-solana-program
```

You can add the Solana program scaffold to an existing project by following this
[guide](/docs/toolkit/projects/existing-project.md).

## Standard Project Layouts

For best practices on program file structure, read this
[guide](/docs/toolkit/projects/project-layout.md).
