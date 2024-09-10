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

The programs that run on Solana - the ones that create tokens, swap tokens, art
marketplaces, escrows, market makers, DePIN apps, auctions, retail payments
platforms, etc - are called **Solana apps**.

The most popular way to build onchain apps is using **Rust** language and the
**Anchor** framework. There is also another way of developing Solana programs
which is, by using the **native onchain program development**, however
**Anchor** makes things a lot simpler and safer. Some pros of using Anchor are:

- Security checks are implemented automatically
- Automatic routing of incoming instructions to the correct instruction handler
- Automatic serialization and deserialization of the data inside transactions
- Account validation, including:
  - Ensuring that certain accounts have signed the transaction
  - Type checking
  - Ensuring account uniqueness

Regardless of the language and framework you use, Solana operates in the same
way. Let’s review how programs function on Solana.

![Diagram showing a transaction with two instructions](/public/assets/courses/unboxed/transaction-and-instructions.svg)

### Programs are deployed at addresses

Just as we can send tokens to users using their public key, we can locate
programs using the program's public key. When using Anchor, a keypair is created
during `anchor init`, and the private key is saved in the `target/deploy`
directory of your project.

A program's public key is sometimes called a 'program ID' or 'program address'.
Which can be seen in the `programs/<insert_project_name>/src/lib.rs` and
`Anchor.toml` files.

### Programs have instruction handlers

For example, a Solana client making a transaction to transfer USDC with a memo
saying 'thanks' would have two instructions:

- One instruction for the Token program's `transfer` instruction handler.
- Another instruction for the Memo program's `memo` instruction handler.

Both instructions must be completed successfully for the transaction to execute.

Instruction handlers are how onchain programs process instructions from clients.
Every exchange, lending protocol, escrow, oracle, and similar application
provide their functionality via instruction handlers.

### Instruction handlers write their state to Solana accounts

If you have experience in web development, you can think of instruction handlers
like HTTP route handlers and incoming instructions like HTTP requests.

However, unlike HTTP route handlers, Solana instruction handlers do not return
data. Instead, they write their data to accounts on Solana.

Programs on Solana can transfer tokens to user wallet addresses (for SOL) or
user token accounts (for other tokens).

More importantly, programs can create additional addresses to store data as
needed.

This is how Solana programs store their state.

### Program Derived Addresses (PDAs): Solana's Key-Value Store

Data for Solana programs are stored in **Program-Derived Addresses (PDAs)**.
Solana’s PDAs can be viewed as a **key-value store**:

#### Key Concepts

1. **Structure**

   - **Key**: The PDA's address
   - **Value**: Data stored in the account at that address

2. **Address Generation**

   - **Seed**: chosen by the programmer
   - **Bump**: An additional value to ensure unique PDA creation
   - **Deterministic**: The same combination of seed and bump always produces
     the same address. This helps the program and the client to accurately
     determine the address of the data.

3. **Data Storage**

   - Programmers define the structure of data stored in PDAs
   - Can store any type of program-specific information

4. **Some properties**:
   - PDAs are off the Ed25519 elliptic curve. While the data type web3.js uses
     is a `PublicKey`, PDA addresses are not public keys and do not have a
     matching private key.
   - A program's PDAs are unique so, they won't conflict with other programs.
   - PDAs can also act as signers in an instruction. We'll learn more about this
     in further lessons.

Key-value stores enable your onchain program and client software to consistently
determine the address for a data item because the same seeds will always return
the same address.

#### How PDAs Work

1. **Key**: The PDA address, derived from seeds you choose as a developer.
2. **Value**: The data stored in the account at that address.

#### Examples

Here's a table illustrating various use cases for PDAs:

| Use Case          | Seeds                          | PDA (Key)       | Value (Data Stored)                        |
| ----------------- | ------------------------------ | --------------- | ------------------------------------------ |
| Exchange Rate     | `["USD", "AUD"]`               | Derived address | Current USD to AUD exchange rate           |
| User Relationship | `[user1_wallet, user2_wallet]` | Derived address | Relationship data (e.g., friends, blocked) |
| Movie Review      | `[reviewer_wallet, "titanic"]` | Derived address | Review text, rating, timestamp             |
| Global Config     | `["config"]`                   | Derived address | Program-wide settings                      |

#### Detailed Explanations

#### 1. Exchange Rate Example

- **Seeds**: `["USD", "AUD"]`
- **Purpose**: Store the current exchange rate between USD and AUD.
- **Benefits**: Easy to locate and update the exchange rate for this specific
  currency pair.

#### 2. User Relationship Example

- **Seeds**: `[user1_wallet, user2_wallet]`
- **Purpose**: Store information about the relationship between two users.
- **Benefits**: Quickly retrieve or modify the relationship status between any
  two users.

#### 3. Movie Review Example

- **Seeds**: `[reviewer_wallet, "titanic"]`
- **Purpose**: Store a user's review for a specific movie.
- **Benefits**: Efficiently organize and access reviews by user and movie.

#### 4. Global Config Example

- **Seeds**: `["config"]`
- **Purpose**: Store global settings for your entire program.
- **Benefits**: Centralize program-wide configurations in an easily accessible
  location.

#### Key Benefits of Using PDAs

1. **Consistency**: The same seeds always produce the same address, ensuring
   data can be reliably located.
2. **Uniqueness**: PDAs are unique to your program, preventing conflicts with
   other programs.
3. **Flexibility**: You can create complex data structures by carefully choosing
   your seeds.
4. **Efficiency**: Quick and deterministic access to data based on known
   parameters (seeds).

### Solana instructions need to specify all the accounts they will use

As you may already know, Solana is fast because it can process non-overlapping
transactions simultaneously. For example, Alice sending tokens to Bob doesn’t
stop Chris from sending tokens to Diana. Your front-end apps need to specify the
addresses of all the accounts they will use.

This includes the PDAs you create. Fortunately, you can calculate the address
for PDAs in your front-end code before writing data to them.

```typescript
import { PublicKey } from "@solana/web3.js";

// There's nothing at this address right now, but we'll use it in our transaction
const [address, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("seed"), Buffer.from("another seed")],
  PROGRAM_ID,
);
```

### There are multiple ways to build onchain, but we recommend Anchor

You currently have two options for onchain program development:

- We recommend new developers
  [start with Anchor](/content/courses/onchain-development/intro-to-anchor.md).
  Anchor's defaults make it easy to create secure programs.
- There is also a course on
  [native onchain program development](/content/courses/native-onchain-development.md).

Whichever approach you choose, the Solana Foundation provides
[examples in both Anchor and native Rust](https://github.com/solana-developers/program-examples),
and [Solana Stack Exchange](https://solana.stackexchange.com/) is available for
support.

For now, let's
[set up your computer](/content/courses/onchain-development/local-setup.md)!
