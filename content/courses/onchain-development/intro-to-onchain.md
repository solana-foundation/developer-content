---
title: Intro to Solana Onchain Development
objectives:
  - Understand how Solana onchain programs work
  - Know about the structure and operation of Solana programs
  - Build a basic program
description:
  "Discover how onchain programs ( often called 'smart contracts') work on
  Solana and learn to build your own."
---

## Summary

- **Onchain programs** (sometimes called 'smart contracts') run directly on
  Solana, just like programs on your computer.
- These programs consist of **instruction handlers** - functions that process
  instructions from transactions.
- Programs interact with the blockchain by reading from and writing to Solana
  **accounts**.
- Solana programs are most commonly written in **Rust**, often using the
  **Anchor** framework for simplified development.
- Anchor generates **Interface Description Language (IDL)** files, which:
  - Describe the program's structure and functionality
  - Enable automatic creation of JavaScript/TypeScript client libraries
- Solana's architecture allows for parallel execution of non-overlapping
  transactions, contributing to its high speed and efficiency.
- Rent is a concept in Solana where accounts must maintain a minimum balance to
  stay alive on the blockchain.

## Overview

Solana operates on various clusters, each functioning as a unified, globally
synchronized system:

- **mainnet-beta**: The main production network
- **testnet**: For testing new features
- **devnet**: For application development
- **localnet**: For local testing

The program that run on Solana - the ones that create tokens, swap tokens, art
marketplaces, escrows, market makers, DePIN apps, auctions, retail payments
platforms, etc - are called **Solana apps**.

The most popular way to build onchain apps is using **Rust** language and the
**Anchor** framework. There is also another way of developing Solana programs
that is, by using the **native onchain program development**, however **Anchor**
makes things a lot simpler and safer. Some pros of using Anchor are:

- Security checks are implemented automatically
- Automatic routing of incoming instructions to the correct instruction handler
- Automatic serialization and deserialization of the data inside transactions
- Account validation, including:
  - Type checking
  - Ensuring account uniqueness

Regardless of the language and framework you choose, Solana works the same.
Let's refresh how programs work on Solana.

![Diagram showing a transaction with two instructions](/public/assets/courses/unboxed/transaction-and-instructions.svg)

### Programs are deployed at addresses

In the same way that we can send tokens to users using their public key, we can
find programs using the program's public key. When using Anchor, a keypair is
created during `anchor init`, and the private key is saved in the
`target/deploy` directory of your project.

A program's public key is sometimes called a 'program ID' or 'program address'.
Which can be seen in the `programs/<insert_project_name>/src/lib.rs` and
`Anchor.toml` files.

### Programs have instruction handlers

For example, a Solana client making a transaction transferring some USDC with a
memo saying 'thanks' would have two instructions:

- one instruction for the Token program's `transfer` instruction handler
- the other instruction for the Memo program's `memo` instruction handler.

Both these instructions must be completed successfully for the transaction to
execute.

Instruction handlers are how blockchain programs process the instructions from
clients. Every exchange, lending protocol, escrow, oracle, etc. provides their
functionality by instruction handlers.

### Instruction handlers write their state to Solana accounts

If you have done web development before, think of instruction handlers like HTTP
route handlers, and incoming instructions like HTTP requests.

However, unlike HTTP route handlers, Solana instruction handlers don't return
data. Instead, they write their data to accounts on Solana.

Programs on Solana can transfer tokens to user wallet addresses (for SOL) or
user token accounts (for other tokens).

More importantly, programs can create additional addresses to store data as
needed.

This is how Solana programs store their state.

### Program Derived Addresses (PDAs): Solana's Key-Value Store

Data for Solana programs are stored in **program-derived addresses (PDAs)**.
Solana's PDAs can be thought of as a **key/value store**. A PDA can be designed
to store any form of data as required by the program.

#### Key Concepts

1. **Structure**

   - **Key**: The PDA's address
   - **Value**: Data stored in the account at that address

2. **Address Generation**

   - **Seed**: chosen by the programmer
   - **Bump**: An additional value to ensure unique PDA creation
   - **Deterministic**: Same combination of seed and bump always produce the
     same address. This helps the program and the client to accurately determine
     the address of the data.

3. **Data Storage**

   - Programmers define the structure of data stored in PDAs
   - Can store any type of program-specific information

4. **Some properties**:
   - PDAs are off the Ed25519 elliptic curve. While the data type web3.js uses
     is a `PublicKey`, PDA addresses are not public keys and do not have a
     matching private key.
   - A program's PDAs are unique so, they won't conflict with other programs.
   - PDAs can also act as signer in an instruction. We'll learn more about this
     in further lessons.

#### Examples of PDA Usage

| Purpose           | Seeds                      | Resulting PDA                |
| ----------------- | -------------------------- | ---------------------------- |
| Exchange Rate     | `"USD"`, `"AUD"`           | Stores USD to AUD rate       |
| User Relationship | User1 wallet, User2 wallet | Stores relationship data     |
| Product Review    | User wallet, Product ID    | Stores user's review         |
| Global Config     | `"config"`                 | Stores program-wide settings |

#### Benefits

1. **Uniqueness**: PDAs are specific to your program, avoiding conflicts
2. **Determinism**: Consistent address generation across clients and on-chain
   programs
3. **Flexibility**: Can store various types of data structures
4. **Efficiency**: Quick lookup and access to program-specific data

### Solana instructions need to specify all the accounts they will use

As you may already know, Solana is fast because it can process transactions that
don't overlap at the same time i.e., just like in the real world, Alice sending
to Bob doesn't stop Chris from sending something to Diana. Your front-end apps
need to specify the addresses of all the accounts they will use.

This includes the PDAs you make. Thankfully, you can calculate the address for
PDAs in your front-end code before you write data there!

```typescript
// There's nothing at this address right now, but we're going to use in our transaction
const address = findProgramAddressSync(["seed", "another seed"], PROGRAM_ID);
```

### There are multiple ways to build onchain, but we recommend Anchor

You currently have two options for onchain program development:

- We recommend new onchain programmers
  [start with Anchor](/content/courses/onchain-development/intro-to-anchor).
  Anchor's defaults make it easy to create safe programs.
- There's also a separate
  [native onchain program development](/content/courses/native-onchain-development)
  course.

Whichever way you pick, Solana Foundation maintains
[examples in both languages](https://github.com/solana-developers/program-examples),
and [Solana Stack Exchange](https://solana.stackexchange.com/) is there to help.

For now, let's
[set up your computer](/content/courses/onchain-development/local-setup)!
