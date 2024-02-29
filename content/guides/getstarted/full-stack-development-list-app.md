---
date: Feb 29, 2024
difficulty: intro
title: "Full Stack Development with Remix and Anchor: Build a Narrative Tracker"
seoTitle: "Full Stack Development with Remix and Anchor"
description:
  "Learn how to build a full Full Stack Solana Development with Remix, Anchor, Rust, and Phantom. Including: airdrop, web3.js, anchor..."
tags:
  - quickstart
  - Solana Playground
  - rust
  - web3js
  - fullstack
keywords:
  - webdev
  - blockchain
  - devnet
  - react
  - fullstack
  - anchor
  - playground
  - anchor
  - rust
---

## Intro and general overview

Nader Dabit https://dev.to/edge-and-node/the-complete-guide-to-full-stack-solana-development-with-react-anchor-rust-and-phantom-3291 did a really good full stack solana development guide more than 2 years ago. A lot have changed since then.

I will be as concise as possible to make it beginner friendly to show you how to build a full stack dapp in 2024. Particular attention would be done on the updates and changes of libraries and toolings.

Why create another full stack guide?
There are a lot of great guides out there that are outdated using code from old version of libraries and tools. With that being said. I will point out what is new compared to older versions so it can also works for whoever already started a project to migrate to the latest and use the latest tools.

What framework to use?
We have mainly 3: Solana, Anchor and Seahorse.
Seahorse is not maintained and Anchor is built on top of Solana making it easier and less bloated to create program. The best choise goes to Anchor for anyone starting a new projects

## Project overview

The tooling we'll be using today includes:

Solana Playground - browser based program editor. It comes with testing wallet, testnet SOL airdrop, CLI, test file. Which allow us to start right away. Export DSL which is the equivalent to EVM ABI for solana programs

Anchor JS SDK and Anchor Rust Lang - We will use Anchor for building the program and the JS library to call the contract from the frontend.

solana/web3.js - It provides utilities to help us connect wallet and format values.

React Remix - Remix is a very intuitive react framework

At the end of the guide you will be able to build a working full stack solana app from where you can continue tinkering and build your own ideas.

We will focus on setup solana playground, deploy our first program and test it.
Build the frontend, add connect wallet and call the program deployed on devnet.

## Demo

Here is a quick demo of what we are going to accomplish

## Requirements

Install a Solana wallet. Phantom Wallet is a recommended. 
[Phantom Wallet Chrome Extension](https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa)

Get some testnet SOL
[Solana Faucet](https://faucet.solana.com/)

Setup for web development: node.js, code editor.

## Playground setup


Go to "Build & Deploy" Tab and copy the Program ID and export the IDL

Open https://beta.solpg.io/ and create a new Anchor project.

![CleanShot 2024-03-01 at 04 23 46@2x](https://github.com/aeither/developer-content/assets/36173828/02eb56a1-1884-4807-a323-04115229535e)

We need SOL to deploy the program. You have to claim 5 SOL from the Solana Faucet. Copy the address of your wallet. 

![CleanShot 2024-03-01 at 04 27 32@2x](https://github.com/aeither/developer-content/assets/36173828/a9345b43-c05b-4636-b945-ea2be1eac636)

Open [Solana Faucet](https://faucet.solana.com/) and paste your wallet address. Make sure it is set to devnet and amount to 5.

![CleanShot 2024-03-01 at 04 29 42@2x](https://github.com/aeither/developer-content/assets/36173828/951441ae-68ad-4054-9765-2586419f8c67)

## Create the program

Update `lib.rs` with the following program. We will go through it right after.

```rust
use anchor_lang::prelude::*;

declare_id!("CfqCT3ojotQKHizmE73CBo95LT6MLCKQCEm3dnztJPUk");

#[program]
pub mod narrative_list {
    use super::*;

    pub fn init_user(ctx: Context<InitUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.new_user_account;
        user_account.authority = *ctx.accounts.authority.key;
        user_account.last_id = 0;

        Ok(())
    }

    pub fn add_item(ctx: Context<InitItem>, _content: String) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let item_account = &mut ctx.accounts.new_item_account;

        // item account
        item_account.authority = ctx.accounts.authority.key();
        item_account.id = 0;
        item_account.content = _content;

        // user account
        user_account.last_id += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(init, payer = authority, space = 8 + std::mem::size_of::<UserAccount>(), seeds = [b"user", authority.key().as_ref()], bump)]
    pub new_user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitItem<'info> {
    #[account(mut, seeds = [b"user", authority.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(init, payer = authority, space = 8 + std::mem::size_of::<ItemAccount>(), seeds = [b"item", authority.key().as_ref(), &[user_account.last_id as u8].as_ref()], bump)]
    pub new_item_account: Account<'info, ItemAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserAccount {
    authority: Pubkey,
    last_id: u8,
}

#[account]
pub struct ItemAccount {
    authority: Pubkey,
    id: u8,
    content: String,
}

```

Let's dive into it.

```rust
use anchor_lang::prelude::*;

declare_id!("CfqCT3ojotQKHizmE73CBo95LT6MLCKQCEm3dnztJPUk");
```

The first line of code imports all the necessary components from the Anchor framework making them readily available for use in the program.

This `declare_id` macro declares the program's ID, a unique identifier for the program on the Solana blockchain.

```rust
#[program]
pub mod narrative_list {
    use super::*;
    ...
}
```

The macro `#[program]` marks the module as containing the instruction handlers for the Solana program

```rust
#[program]
pub mod narrative_list {
    use super::*;
    ...
}
```

Two functions are defined as instruction handlers:

`init_user`: Initializes a new user account.
`add_item`: Adds an narrative associated with the user's account.

These functions are marked with the pub fn syntax, making them public functions that can be called as part of the program's API.

The `#[derive(Accounts)]` macro is used to define the context for each instruction

`InitUser` and `InitItem` structs define the accounts needed for the `init_user` and `add_item` instructions, respectively.

`UserAccount` and `ItemAccount` structs define the data layout for user and item accounts.

Now we can build and deploy the program.

![CleanShot 2024-03-01 at 04 46 02@2x](https://github.com/aeither/developer-content/assets/36173828/f3f88db0-6260-49b6-983d-4404e8d42f01)

After few seconds. The program will be available on devnet allowing us to run tests.

We can manually test the instructions

![CleanShot 2024-03-01 at 04 47 02@2x](https://github.com/aeither/developer-content/assets/36173828/48082e55-5169-482e-bac8-fe1539f65d39)

and the check the result by fetching the accounts

![CleanShot 2024-03-01 at 04 47 32@2x](https://github.com/aeither/developer-content/assets/36173828/782e5955-d3e2-443b-a9eb-082a08cbb101)



## Development

From your terminal:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

