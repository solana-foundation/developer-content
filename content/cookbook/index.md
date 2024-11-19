---
sidebarSortOrder: 0
title: Solana Cookbook
seoTitle: Code examples for Solana development
description:
  "The Solana cookbook is a collection of useful examples and references for
  building on Solana"
---

The _Solana Cookbook_ is a developer resource that provides examples and
references for building applications on Solana. Each example and reference will
focus on specific aspects of Solana development while providing additional
details and usage examples.

## Table of Contents

## Development

| **Page Title**                                                                                                            | **Client Code** |
| ------------------------------------------------------------------------------------------------------------------------- | --------------- |
| [How to Start a Local Validator](https://solana.com/developers/cookbook/development/start-local-validator)                | Solana CLI      |
| [Connecting to a Solana Environment](https://solana.com/developers/cookbook/development/connect-environment)              | Web3.js         |
| [Getting Test SOL](https://solana.com/developers/cookbook/development/test-sol)                                           | Web3.js         |
| [Subscribing to Events](https://solana.com/developers/cookbook/development/subscribing-events)                            | Web3.js         |
| [Using Mainnet Accounts and Programs](https://solana.com/developers/cookbook/development/using-mainnet-accounts-programs) | Solana CLI      |

---

## Wallets

| **Page Title**                                                                                                   | **Client Code**    |
| ---------------------------------------------------------------------------------------------------------------- | ------------------ |
| [How to Create a Keypair](https://solana.com/developers/cookbook/wallets/create-keypair)                         | Web3.js            |
| [How to Restore a Keypair](https://solana.com/developers/cookbook/wallets/restore-keypair)                       | Web3.js            |
| [How to Verify a Keypair](https://solana.com/developers/cookbook/wallets/verify-keypair)                         | Web3.js            |
| [How to Validate a Public Key](https://solana.com/developers/cookbook/wallets/check-publickey)                   | Web3.js            |
| [How to Generate Mnemonics for Keypairs](https://solana.com/developers/cookbook/wallets/generate-mnemonic)       | bip39              |
| [How to Restore a Keypair from a Mnemonic](https://solana.com/developers/cookbook/wallets/restore-from-mnemonic) | Web3.js, bip39     |
| [How to Generate a Vanity Address](https://solana.com/developers/cookbook/wallets/generate-vanity-address)       | Solana CLI         |
| [How to Sign and Verify a Message](https://solana.com/developers/cookbook/wallets/sign-message)                  | Web3.js, TweetNaCl |
| [How to Connect a Wallet with React](https://solana.com/developers/cookbook/wallets/connect-wallet-react)        | React, Web3.js     |

---

## Transactions

| **Page Title**                                                                                                     | **Client Code**       |
| ------------------------------------------------------------------------------------------------------------------ | --------------------- |
| [How to Send SOL](https://solana.com/developers/cookbook/transactions/send-sol)                                    | Web3.js, Rust         |
| [How to Send Tokens](https://solana.com/developers/cookbook/transactions/send-tokens)                              | Web3.js               |
| [How to Calculate Transaction Cost](https://solana.com/developers/cookbook/transactions/calculate-cost)            | Web3.js               |
| [How to Add a Memo to a Transaction](https://solana.com/developers/cookbook/transactions/add-memo)                 | Web3.js               |
| [How to Add Priority Fees to a Transaction](https://solana.com/developers/cookbook/transactions/add-priority-fees) | Web3.js               |
| [How to Optimize Compute Requested](https://solana.com/developers/cookbook/transactions/optimize-compute)          | Web3.js               |
| [Offline Transactions](https://solana.com/developers/cookbook/transactions/offline-transactions)                   | Web3.js, TweetNaCl    |
| [Create Token Account](./transactions/create-token-account.md)                                                     | Web3.js, Rust, Anchor |

---

## Programs

| **Page Title**                                                                                                 | **Client Code**       |
| -------------------------------------------------------------------------------------------------------------- | --------------------- |
| [How to Transfer SOL in a Solana Program](https://solana.com/developers/cookbook/programs/transfer-sol)        | Rust                  |
| [How to Get Clock in a Program](https://solana.com/developers/cookbook/programs/clock)                         | Rust                  |
| [How to Change Account Size](https://solana.com/developers/cookbook/programs/change-account-size)              | Rust                  |
| [How to do Cross Program Invocation](https://solana.com/developers/cookbook/programs/cross-program-invocation) | Rust                  |
| [How to Create a Program Derived Address](https://solana.com/developers/cookbook/programs/create-pda)          | Rust                  |
| [How to Read Accounts in a Program](https://solana.com/developers/cookbook/programs/read-accounts)             | Rust                  |
| [Using the Clock Program](./programs/clock.md)                                                                 | Rust, Anchor          |
| [Hello World Program](./programs/hello-world.md)                                                               | Web3.js, Rust, Anchor |

---

## Accounts

| **Page Title**                                                                                           | **Client Code** |
| -------------------------------------------------------------------------------------------------------- | --------------- |
| [How to Create an Account](https://solana.com/developers/cookbook/accounts/create-account)               | Web3.js         |
| [How to Calculate Account Creation Cost](https://solana.com/developers/cookbook/accounts/calculate-rent) | Web3.js         |
| [How to Create a PDA's Account](https://solana.com/developers/cookbook/accounts/create-pda-account)      | Web3.js, Rust   |
| [How to Sign with a PDA's Account](https://solana.com/developers/cookbook/accounts/sign-with-pda)        | Rust            |
| [How to Close an Account](https://solana.com/developers/cookbook/accounts/close-account)                 | Rust            |
| [How to Get Account Balance](https://solana.com/developers/cookbook/accounts/get-account-balance)        | Web3.js         |
| [Reading Account Data](./accounts/read-data.md)                                                          | Web3.js, Rust   |

---

## Client SDKs Overview

Below is an overview of the most commonly used Solana client SDKs and their
features:

- **web3.js**: JavaScript library for building Solana-based web applications.
- **Rust**: Low-level access for building high-performance programs.
- **Anchor**: Framework for Solana program development.

---

## Get Started

Choose a topic from the table of contents to dive deeper into Solana
development. Whether you're sending SOL, interacting with programs, or learning
to work with accounts, the cookbook has you covered.

Looking for the source code or more examples? Visit our
[GitHub repository](https://github.com/solana-foundation/developer-content) for
all the content used in this cookbook.
