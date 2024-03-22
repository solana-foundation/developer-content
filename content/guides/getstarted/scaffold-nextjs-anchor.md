---
date: Mar 22, 2024
difficulty: intro
title: "Scaffolding your Web and Anchor project on Solana"
seoTitle: "Scaffold Web and Anchor Project"
description:
  "Solana developer quickstart guide to scaffold, generate boilerplate, or
  hackathon starter for reactjs nextjs or anchor"
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
hackathon, this scaffolding guide can help you get a boilerplate codebase. So
you can get started faster with important things like the Solana wallet adapter,
web3.js, anchor etc., integrated and built-in, saving time and resources and
providing a great foundation in further development.

This guide has four sections

1. Requirements
2. Scaffolding
3. Experience hands-on with scaffolds
4. Bonus Solana tools

## 1. Requirements

### NodeJS and npm

NodeJS and NPM with npx can help you generate a scaffold for your development
environment. Install NodeJS to get node (Javascript runner), npm (package
manager) and npx (node package executor) all at once.
[Install NodeJS here.](https://nodejs.org/en/download)

### Code editor

We only use VSCode to open the scaffold-generated folder, but if you use a
different editor, know how to open the folder inside it.
[Here’s a link to Install VSCode](https://code.visualstudio.com/#alt-downloads).

### Solana development environment

If you haven't installed Solana CLI, Rust, or Anchor before, you can easily do
so by
[following our helpful installation guide](https://solana.com/developers/guides/getstarted/setup-local-development)

> Scaffolds only supports coding in typescript for now, but don’t worry, it’s
> more helpful and extends on the basic javascript you already know.

## 2. Scaffolding

The command to scaffold your boilerplate for your is simple as

```bash
npx create-solana-dapp@latest
```

### Project name

I suggest you do this in the root folder where you want to create your project.
First, you will be asked to enter your awesome project name. I am using
hello_solana for now.

```
┌  create-solana-dapp 2.0.1
│
◆  Enter project name
│  - hello_solana
└
```

### Web preset

Then you will be asked for a preset to use, could be Next.JS or React + React
Router DOM

I prefer nextJS as it has file based routing and app routing. You can go ahead
with React + React Router DOM if you prefer that.

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

We use tailwindCSS and Daisy UI here, but you can choose none if you already
have your preferred one.

### Anchor Template

Next this scaffold CLI asks which template for anchor you want to use. Anchor is
a sealevel framework for writing solana programs.

```
◆  Select an Anchor template
│  ○ counter
│  ● hello-world
│  ○ none
└
```

After waiting for some time, you can make some popcorn so that you can eat those
when the scaffolding is ready (Installing takes ~3 mins).

```
◓  Creating new workspace with npm...
```

When you are done you can change the terminal directory to your project.

```
◇  Successfully installed preset @solana-developers/preset-next@2.0.1.
│
└  Run `cd ./hello_solana-app` to get started.
```

type `pwd` to check if your path is correct, then type `code .` to open VSCode
inside the scaffolded project.

In your scaffold, five commands are waiting for you to execute whenever you
like. Type `npm run` to see all the commands available.

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

To run any of these commands, type `npm run <SCRIPT_COMMAND>` , for example,
`npm run dev` to start the development server of your website or
`npm run anchor-test` to run tests on your scaffolded solana program.

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

Inside `anchor > programs > hello-world > src > lib.rs` , we can start writing
our instructions.

To build this program execute `npm run anchor-build`; your IDL generated in the
target folder. IDL is a spec similar to ABI in EVM environments. It describes
how the JSON file will interact with a solana program. copy the address inside
metadata from your `hello_world.json` to your anchor program
`[lib.rs](http://lib.rs)` line 3 and paste your address there.

You can now run anchor tests and check if your program is running successfully.

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

Our NextJS Scaffold is using App Router introduced in version 13, which supports
shared layouts, nested routing, loading states, and error handling.

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
handles auto connects of solana wallet easily, you can move to multiple
components of your web application with the wallet states managed. This NextJS
app is using `[@tanstack/react-query](https://tanstack.com/query/latest)` for
fetch, cache, synchronize, and update server state in your web applications
easily. React-Query here is being used here for all the data fetching needs,
like hook for `useGetBalance` to get the balance of your wallet,
`useTransferSol` to transfer sol. Similarly, you can implement features you want
to fetch from RPCs. You can see react-query getting used here in the Account nav
as well.

![NextJS web Accounts view](/assets/guides/scaffolds/scaffolds---3-web-accounts-view.png)

This app also uses [`Jotai`](https://jotai.org), is used for global React state
management in your NextJS app. Our component stores the cluster and rpc
information, you can fetch it anywhere in your app and manage where the
transaction needs to be submitted.

![NextJS web Clusters view](/assets/guides/scaffolds/scaffolds---4-web-cluster-view.png)

Ideally, copy your generated IDL file or Types from the target folder after the
anchor build and import it to use inside components to call instructions.

## 4. Bonus Solana tools

This is just a bonus section if you want to use more tools built by the solana
community to ease your solana development, just be careful those might not be
audited and/or maintained.
[Checkout Solana Tools Library](https://github.com/solana-developers/solana-tools)

Helpers by Solana Developers contains helper functions that can help you get an
airdrop for testnet devnet, making Error messages by solana more readable and
[a lot more](https://github.com/solana-developers/helpers?tab=readme-ov-file#what-can-i-do-with-this-module).

[Solana Wallet Names by Portal Payments](https://github.com/portalpayments/solana-wallet-names)
can help you get solana wallet names liek .sol, .backpack and .abc etc.

[Amman by Metaplex](https://github.com/metaplex-foundation/amman) are a set of
tools to help test solana SDK libraries and apps on a locally running validator.

[Solita by Metaplex](https://github.com/metaplex-foundation/solita) Solita
generates a low level TypeScript SDK for your Solana Rust programs from the IDL
extracted by anchor or shank.

---

Congratulations! You have reached the stage where you can finally bring your
project to life just the way you want it. We're excited to see what amazing
things you'll create! Have fun building on solana.
