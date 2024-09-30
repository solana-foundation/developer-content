---
date: Mar 22, 2024
difficulty: intro
title: "Scaffolding your web and Anchor project on Solana"
seoTitle: "Scaffold web and Anchor Project"
description:
  "A quickstart guide to scaffolding projects using React/NextJS and Anchor -
  useful for hackathons!"
tags:
  - quickstart
  - scaffold
  - generate
  - nextjs
  - reactjs
  - anchor
  - web
keywords:
  - quickstart
  - scaffold
  - generate
  - boilerplate
  - anchor
  - nextjs
  - reactjs
  - solana reactjs
  - solana nextjs
  - hackathon starter
---

If you have an idea to build on Solana or you want to participate in a Solana
hackathon, this scaffolding guide can help you get a boilerplate codebase with
important things like the Solana wallet adapter, web3.js, and Anchor, saving
time and resources and providing a great foundation in further development.

This guide has four sections

1. Requirements
2. Scaffolding
3. Experience hands-on with scaffolds
4. Bonus Solana tools

## 1. Requirements

### NodeJS and npm

[Install NodeJS](https://nodejs.org/en/download), to get node (Javascript
runner), npm (package manager) and npx (node package executor) all at once.

### Code Editor

We recommend [installing VSCode](https://code.visualstudio.com/#alt-downloads),
but you're also welcome to use your preferred editor.

### Solana development environment

If you haven't installed Solana CLI, Rust, or Anchor before, you can easily do
so by
[following our helpful installation guide](https://solana.com/docs/intro/installation)

> This scaffolds only supports TypeScript for now, but don't worry, TypeScript
> simply extends on the JavaScript you already know to add helpful type
> definitions.

## 2. Scaffolding

To create your boilerplate, run:

```bash
npx create-solana-dapp@latest
```

### Project name

To create your boilerplate, run: I suggest you do this in the root folder where
you want to create your project. First, you will be asked to enter your awesome
project name. I am using hello_solana for now.

```
┌  create-solana-dapp 2.0.1
│
◆  Enter project name
│  - hello_solana
└
```

### Web preset

Then you will be asked for a preset to use, which could be Next.js or React +
React Router DOM

This document uses Next.js because Next.js has file-based routing and app
routing, but you can also use React + React Router DOM if you prefer that.

```
◆  Select a preset
│  ● Next.js
│  ○ React + React Router DOM
```

### UI library

After you pick a framework, you'll be prompted to select a styling library.

```
◆  Select a UI library
│  ○ None
│  ● Tailwind
└
```

We use Tailwind CSS and Daisy UI here, but you can choose none if you already
have your preferred one.

### Anchor Template

Next, this scaffold CLI asks which template for anchor you want to use. Anchor
is a framework for writing on-chain Solana programs.

```
◆  Select an Anchor template
│  ○ counter
│  ● hello-world
│  ○ none
└
```

Then make some popcorn to eat while the scaffolding installs - it should take ~3
minutes.

```
◓  Creating new workspace with npm...
```

When it's finished, change the directory into your project:

```
◇  Successfully installed preset @solana-developers/preset-next@2.0.1.
│
└  Run `cd ./hello_solana-app` to get started.
```

type `pwd` to check if your path is correct, then type `code .` to open VSCode
inside the scaffolded project.

In your scaffold, five scripts are waiting for you to execute whenever you like.
Type `npm run` to see all the scripts available.

```
Scripts available in @counter-app/source@0.0.0 via `npm run-script`:
  anchor
    nx run anchor:anchor
  anchor-build
    nx run anchor:anchor build
  anchor-localnet
    nx run anchor:anchor localnet
  anchor-test
    nx run anchor:anchor test
  build
    nx build web
  dev
    nx serve web
```

To run any of these scripts, type `npm run <SCRIPT>`, for example, `npm run dev`
to start the development server of your website or `npm run anchor-test` to run
tests on your scaffolded Solana program.

## 3. Experience hands-on with scaffolds

### Anchor Program

Before starting, please initiate your project with git init to track the changes
you make. Here is what our directory tree looks like at the root of our project.

```
    hello_solana
    |
    ├── anchor
    │   ├── migrations
    │   ├── programs
    |   |   └── hello_world
    │   └── tests
    ├── web
    │   ├── app
    │   ├── components
        └── public
```

Inside `anchor > programs > hello-world > src > lib.rs`, we can start writing
our instructions.

To build this program execute `npm run anchor-build`. Your Anchor project will
be built, and an IDL generated in the target folder. IDL is a spec that
describes the instruction handler in your program and their arguments. Copy the
address inside metadata from your `hello_world.json` to the `program_id` section
in your Anchor program's `lib.rs`.

You can now run Anchor tests and check if your program is running successfully.

![Anchor Hello World Code Screenshot](/assets/guides/scaffolds/scaffolds---1-anchor-view.png)

```
    hello_solana
    |
    ├── anchor
    │   ├── migrations
    │   ├── programs
		|   |   └── hello_world
    │   └── tests
		|   |   └── hello-world.spec.ts
    │   └── target
    │        └── idl
    │            └── hello_world.json
```

To test hello_world instruction, execute `npm run anchor-test`.

```

 PASS   anchor  tests/hello-world.spec.ts
  hello-world
    ✓ Is initialized! (686 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.207 s
Ran all test suites.

 ————————————————————————————————————————————————————————————————
 >  NX   Successfully ran target jest for project anchor (3s)
```

### NextJS app

![NextJS Starter view](/assets/guides/scaffolds/scaffolds---1-anchor-view.png)

Our NextJS Scaffold uses using App Router introduced in version 13, which
supports shared layouts, nested routing, loading states, and error handling.

```
    hello_solana
    |
    ├── anchor
    ├── web
    │   ├── app
    │   │   └── layout.tsx
    │   ├── components
    │       └──  solana
		|          └── solana-provider.tsx
    │       ├── ui
                └── ui-layout.tsx
```

The `solana-provider.tsx` already has all the wallet features you need, It
handles auto connects of Solana wallet easily, and you can move to multiple
components of your web application with the wallet states managed. This NextJS
app is using `[@tanstack/react-query](`https://tanstack.com/query/latest)` to
fetch, cache, synchronize, and update server state in your web applications
easily. React-Query here is used for all the data fetching needs, like a hook
for `useGetBalance` to get the balance of your wallet, `useTransferSol` to
transfer sol. Similarly, you can implement features you want to fetch from RPCs.
You can see react-query getting used here in the Account nav as well.

![NextJS web Accounts view](/assets/guides/scaffolds/scaffolds---3-web-accounts-view.png)

This app also uses `Jotai`, which is used for global React state management in
your NextJS app. Our component stores the cluster and RPC information, you can
fetch it anywhere in your app and manage where the transaction needs to be
submitted.

![NextJS web Clusters view](/assets/guides/scaffolds/scaffolds---4-web-cluster-view.png)

Copy your generated IDL file and/or Types from the target folder after the
`anchor build` and import it to use inside components to call instructions.

## 4. Bonus Solana tools

This is just a bonus section if you want to use more tools built by the Solana
community to ease your Solana development, just be careful those might not be
audited and/or maintained.
[Checkout Solana Tools Library](https://github.com/solana-developers/solana-tools)

Helpers by Solana Developers contains helper functions that can help you get an
airdrop for testnet devnet, making Error messages by Solana more readable and
[a lot more](https://github.com/solana-developers/helpers?tab=readme-ov-file#what-can-i-do-with-this-module).

[Solana Wallet Names by Portal Payments](https://github.com/portalpayments/solana-wallet-names)
can help you use Solana wallet names like `.sol`, `.backpack`, `.abc` etc.

[Amman [by Metaplex](https://github.com/metaplex-foundation/amman) is a set of
tools to help test Solana SDK libraries and apps on a locally running validator.

[Solita by Metaplex](https://github.com/metaplex-foundation/solita) Solita
generates a low-level TypeScript SDK for your Solana Rust programs from the IDL
extracted by Anchor or Shank.

---

Congratulations! You have reached the stage where you can finally bring your
project to life just the way you want it. We're excited to see what amazing
things you'll create! Have fun building on Solana.
