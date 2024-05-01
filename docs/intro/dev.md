---
sidebarLabel: Intro to Development
title: "Getting Started with Solana Development"
description: "Learn how to get started building on Solana"
sidebarSortOrder: 9999
keywords:
  - solana basics
  - tutorial
  - intro to solana development
  - blockchain developer
  - web3 developer
---

Welcome to the Solana developer docs!

This page will include everything you need to know to get started with Solana
development. We'll cover basic requirements, give an overview of how Solana
development works, and provide the critical tools you'll need to get started.

## High Level Developer Overview

Development on Solana can be broken down into two main parts:

1. **On-chain Program Development**: This is where you create and deploy custom
   programs directly to the blockchain. Once deployed, anyone who knows how to
   communicate with them can use them. You can write these programs in Rust, C,
   or C++.
2. **Client Development**: This is where you write dApps that communicate with
   on-chain programs. Your apps can submit transactions to perform actions
   on-chain. Client development can be written in any programming language.

The "glue" between working on the client-side and the on-chain side is the
[JSON RPC API](https://solana.com/docs/rpc). Developers working on the
client-side send RPC requests to the Solana network to interact with on-chain
programs. This is very similar to normal development between a frontend and
backend. The major difference with working on Solana is that the backend is a
global permissionless blockchain. This means that anyone can interact with your
on-chain program without the need of issuing API keys or any other form of
permission.

![A view of how clients work with the Solana blockchain](/assets/docs/intro/developer_flow.png)

Solana development is a bit different from other blockchains because of its
highly composable on-chain programs. This means you can build on top of any
program already deployed, and often you can do so without needing to do any
custom on-chain program development. For example, if you wanted to work with
tokens, you could use the [Token Program](/docs/core/tokens.md) that is already
deployed on the network. All development on your application would be
client-side in your language of choice.

Developers looking to build on Solana will find that the development stack is
very similar to any other development stack. The main difference is that you'll
be working with a blockchain and have to think about how users potentially
interact with your application on-chain instead of just on the frontend.
Developing on Solana still has CICD pipelines, testing, debugging tools, a
frontend and backend, and anything you'd find in a normal development flow.

## What You'll Need Get Started

To get started with Solana development, you'll need different tools based on
whether you are developing for client-side, on-chain programs, or both.

### Client-side Development

If you're working on the client-side, you can work with any programming language
you're comfortable with. If you're working on the on-chain side, you'll need to
know Rust, C, or C++. Solana has community contributed SDKs in the majority of
languages to help developers interact with the Solana network. You can find your
favorite languages SDK here:

| Language   | SDK                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------- |
| RUST       | [solana_sdk](https://docs.rs/solana-sdk/latest/solana_sdk/)                                 |
| Typescript | [@solana/web3.js](https://github.com/solana-labs/solana-web3.js)                            |
| Python     | [solders](https://github.com/kevinheavey/solders)                                           |
| Java       | [solanaj](https://github.com/skynetcap/solanaj)                                             |
| C++        | [solcpp](https://github.com/mschneider/solcpp)                                              |
| GoLang     | [solana-go](https://github.com/gagliardetto/solana-go)                                      |
| Kotlin     | [solanaKT](https://github.com/metaplex-foundation/SolanaKT)                                 |
| Dart       | [solana](https://github.com/espresso-cash/espresso-cash-public/tree/master/packages/solana) |

You'll also need a connection with a RPC to interact with the network. You can
find either work with a [RPC infrastructure provider](https://solana.com/rpc) or
[run your own RPC node](https://docs.solanalabs.com/operations/setup-an-rpc-node).

To quickly get started with a front-end for your application, you can use the
Solana scaffold by typing the following into your CLI:

```bash
npx create-solana-dapp <project-name>
```

This will create a new project with all the necessary files to get started
building on Solana. The scaffold will include both an example frontend and an
on-chain program template. You can read the
[docs on create-solana-dapp](https://github.com/solana-developers/create-solana-dapp?tab=readme-ov-file#create-solana-dapp)
to learn more.

### On-chain Program Development

On-chain program development consists of either writing programs in Rust, C, or
C++. You'll need to have the
[Solana Toolsuite installed](https://docs.solanalabs.com/cli/install) to compile
and deploy your programs. You can install the Solana toolsuite by running the
following command:

```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

Using the Solana Toolsuite, it is recommended to run a local validator for
testing your program. To run a local validator after installing the Solana
Toolsuite, run the following command:

```bash
solana-test-validator
```

This will start a local validator on your machine that you can use to test your
programs. You can read more about
[local development](https://solana.com/developers/guides/getstarted/setup-local-development)
under the guides section.

When building on-chain programs, you have a choice to either build with Native
Rust or use the Anchor framework. Anchor is a framework that makes it easier to
build on Solana by providing a higher-level API for developers. Think of Anchor
like building with React for your websites instead of raw Typescript and HTML.
While Typescript and HTML give you more control over your website, React
accelerates your development and makes developing easy. You can read more about
[Anchor](https://www.anchor-lang.com/) on their website.

You'll need a way to test your program. There are a few different ways to test
your program based on your language preference:

- [solana-program-test](https://docs.rs/solana-program-test/latest/solana_program_test/) -
  Testing framework built in Rust
- [solana-bankrun](https://kevinheavey.github.io/solana-bankrun/) - Testing
  framework built in Python or Typescript

If you do not want to develop your programs locally, there's also the
[online IDE Solana Playground](https://beta.solpg.io). Solana Playground allows
you to write, deploy, and test programs on Solana. You can get started with
Solana Playground by
[following our guide](https://solana.com/developers/guides/getstarted/hello-world-in-your-browser).

### Developer Environments

Choosing the right environment based on your work is very important. On Solana,
there are a few different environments to facilitate mature testing and CICD
practices:

- **Mainnet Beta**: The production network where all the action happens.
  Transactions cost real money here.
- **Devnet**: The quality assurance network were you deploy your programs to
  test before deploying to production.
- **Local**: The local network that you run on your machine using
  `solana-test-validator` to test your programs. This should be your first
  choice when developing programs.

## Build by Example

While you get started building on Solana, there's a few more resources to
available to help accelerate your journey.

- [Solana Cookbook](https://solana.com/developers/cookbook): A collection of
  references and code snippets to help you build on Solana.
- [Solana Program Examples](https://github.com/solana-developers/program-examples):
  A repository of example programs providing building blocks for different
  actions on your programs.
- [Guides](https://solana.com/developers/guides): Tutorials and guides to walk
  you through building on Solana.

## Getting Support

The best support you can find is by asking your question on the
[Solana StackExchange](https://solana.stackexchange.com/).

## Next steps

You're now ready to get started building on Solana!

- [Deploy your first Solana program in the browser](/content/guides/getstarted/hello-world-in-your-browser.md)
- [Setup your local development environment](/content/guides/getstarted/setup-local-development.md)
- [Get started building programs locally with Rust](/content/guides/getstarted/local-rust-hello-world.md)
- [Overview of writing Solana programs](/docs/programs/index.md)
