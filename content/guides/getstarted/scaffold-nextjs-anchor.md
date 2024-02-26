---
date: Jan 18, 2023
difficulty: intro
title: "Scaffolding your Web and Anchor project on Solana"
seoTitle: "Scaffold Web and Anchor Project"
description:
  "Solana developer quickstart guide to scaffold, generate boilerplate, or hackathon starter for reactjs nextjs or anchor"
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
If you have an Idea to build on Solana or you just want to participate in a Solana hackathon, this guide is the best place to get started. Scaffolding guide can give you a boilerplate of codebase so you can get started faster with most of the things like the Solana wallet adapter etc. Built-in.

This guide has 3 sections

1. Requirements
  a. NodeJS and npm 
  b. Code Editor of your choice
  c. Solana Developer Environment
2. Scaffolding
  a. ReactJS / NextJS with Tailwind
  b. Anchor project
3. Experience hands-on with scaffolds
  a. Anchor Hello World app
  b. NextJS web
4. Bonus Solana tools

## 1. Requirements

1. NodeJS and NPM 
Knowing Javascript and having nodeJS is like having a swiss army knife for your development environment. We will be using npx (node package executor) to generate a scaffold for your development environment.
Installing NodeJS will give you node(Javascript runner), npm (package manager) and  npx at the same time. [Install NodeJS from a package manager here.](https://nodejs.org/en/download) 
If you don’t have a package manager can Install it from the hyperlinks in the above link.
2. Code Editor of Your choice.
We will be using Visual Studio Code as the primary editor, which is opensource and Runs on efficient machines as well. Your choice could be different, You might just have to open VSCode inside your scaffolded folder.
[Here’s a link to Install VSCode](https://code.visualstudio.com/#alt-downloads).
3. You can follow a helpful guide install Solana in your developer environment, If you haven’t installed Solana CLI, Rust or Anchor in your system yet.
[Solana Installation Guide here.](https://solana.com/developers/guides/getstarted/setup-local-development)

> Scaffolds only supports coding in typescript for now, but don’t worry, it’s more helpful and extends on the basic javascript you already know.
> 

## 2. Scaffolding

The command to scaffold your boilerplate for your is simple as this command. 

```bash
npx create-solana-dapp@latest
```

I would suggest you to this on root folder where you want to create your project.
First you will be asked to enter your awesome project name, I am using counter_app for now.

```
┌  create-solana-dapp 2.0.1
│
◆  Enter project name
│  - hello_solana
└
```

Then you will be asked for a preset to use, could be Next.JS or React + React Router DOM

I prefer nextJS as it has file based routing and app routing if you want. You can go ahead with React + React Router DOM if you prefer that.

```
◆  Select a preset
│  ● Next.js
│  ○ React + React Router DOM
```

After selecting your framework, you’ll be asked to choose a styling library. 

```
◆  Select a UI library
│  ○ None
│  ● Tailwind
└
```

We use tailwindCSS and Daisy UI in here, but you can choose none if you already have your preferred one.
Next this scaffold CLI asks which template for anchor you want to use.

```
◆  Select an Anchor template
│  ○ counter
│  ● hello-world
│  ○ none
└
```

After waiting for sometime, you can make some popcorns so that you can eat those when the scaffolding is ready (Installing takes 3 mins).

```
◓  Creating new workspace with npm...
```

After you are done you can change the terminal directory to your project

```
◇  Successfully installed preset @solana-developers/preset-next@2.0.1.
│
└  Run `cd ./hello_solana-app` to get started.
```

you can type `pwd` to check if your path is correct, then I usually type `code .` to open VSCode inside our project. 

In your scaffold, there are five commands waiting for you ready to execute whenever you like.
You can type `npm run` to see all the commands available.

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

To run any of these commands you can type `npm run <SCRIPT_COMMAND>` , for example, 
`npm run dev` to start development server of your website, or `npm run anchor-test` to run tests on your scaffolded solana program.

## 3. Experience hands-on with scaffolds

### a. Anchor Program

Before starting It will be good if you initiate your project with git init to start tracking changes you make in your project. Here’s how our directory tree looks like in the root of our project.

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

Inside `anchor > programs > hello-world > src > lib.rs` , we can start writing our instructions. 

To build this program execute `npm run anchor-build` and you will see your IDL generated in the target folder. IDL is a spec similar to ABI in EVM environments, It describes how the JSON file will interact with a solana program. copy the address inside metadata from your `hello_world.json` to your anchor program `[lib.rs](http://lib.rs)` line 3 and paste your address there.

You can now run anchor test and check if your program is running successfully.

![Anchor Hello World Code Screenshot](/assets/guides/scaffolds/scaffolds---1-anchor-view.png)

![A diagram showing how data is stored on-chain]()

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

to test our hello_world instruction we can execute `npm run anchor-test` .

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

### b. NextJS app

![NextJS Starter view](/assets/guides/scaffolds/scaffolds---1-anchor-view.png)

Our NextJS Scaffold is using App Router introduced in version 13, which supports shared layouts, nested routing, loading states, error handling. 

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

The `solana-provider.tsx` already has all the wallet features you need, It handles auto connects of solana wallet easily, keeps the states managed and you can move to multiple components of you web application with the state managed.
This NextJS app is using `[@tanstack/react-query](https://tanstack.com/query/latest)` for all the fetching, caching, synchronizing and updating server state in your web applications easily. React-Query here is being used here for all the data feting needs like hook for `useGetBalance` to get balance of your wallet, `useTransferSol` to transfer sol, In similar ways you can implement features you want to fetch from RPCs. You can see react-query getting used here in the Account nav.

![NextJS web Accounts view](/assets/guides/scaffolds/scaffolds---3-web-accounts-view.png)

This app is also using [`Jotai`](https://jotai.org), is used for global React state management in your NextJS app. It is already storing the cluster and rpc information, you can fetch it anywhere in your app and manage where the transaction needs to be submitted.

![NextJS web Clusters view](/assets/guides/scaffolds/scaffolds---4-web-cluster-view.png)

Ideally copy your IDL file or Types from the target folder we generated after anchor build and import to use it inside our components.

## 4. Bonus Solana tools

This is just a bonus section if you want to use more tools built by community to ease your solana development, just be careful those might not be audited and/or maintained.
[Checkout Solana Tools Library](https://github.com/solana-developers/solana-tools)

Helpers by Solana Developers contains helper functions that can help you get an airdrop for testnet devnet, making Error messages by solana more readable and [a lot more](https://github.com/solana-developers/helpers?tab=readme-ov-file#what-can-i-do-with-this-module).

Solana Wallet Names by Portal Payments can help you get solana wallet names liek .sol, .backpack and .abc etc.

Amman by Metaplex are a set of tools to help test solana SDK libraries and apps on a locally running validator.

---

You are now ready to make your project the way you like,
Have fun building on solana.