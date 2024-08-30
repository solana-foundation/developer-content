---
title: Intro to onchain development
objectives:
  - Understand how Solana onchain programs work
  - Describe the structure and operation of onchain programs
  - Build a basic program
description:
  "How onchain programs (often called 'smart contracts') work on Solana."
---

## Summary

- **Onchain programs** are programs that run on Solana.
- Programs contain one or more **instruction handlers**. These are functions
  that process **instructions** within Solana transactions.
- Instruction handlers write data to Solana **accounts** and either succeed or
  fail.
- Solana programs are commonly written in **Rust** with the **Anchor**
  framework.
- Anchor programs have IDLs (Interface Description Language), small JSON files
  that describe programs. IDLs can be used to automatically generate JS/TS
  libraries for a program.

## Overview

Each Solana cluster (`mainnet-beta`, `testnet`, `devnet`, `localnet`) functions
as a single computer with a globally synchronized state. The programs that
operate on Solana—creating tokens, swapping tokens, powering art marketplaces,
escrows, market makers, DePIN apps, auctions, retail payment platforms, and
more—are referred to as **Solana apps**.

The most popular way to build onchain apps is by using the **Rust** language and
the **Anchor** framework.

These frameworks automate common security checks and handle tasks such as:

- Routing incoming instructions to the appropriate instruction handlers.
- Deserializing data from incoming transactions.
- Validating accounts provided with instructions, such as ensuring that certain
  accounts are of a specific type or distinct from other accounts.

Regardless of the language and framework you use, Solana operates in the same
way. Let’s review how programs function on Solana.

![Diagram showing a transaction with two instructions](/public/assets/courses/unboxed/transaction-and-instructions.svg)

### Programs are deployed at addresses

Just as we can send tokens to users using their public key, we can locate
programs using the program's public key. When using Anchor, a keypair is created
during `anchor init`, and the private key is saved in the `target/deploy`
directory of your project.

A program's public key is sometimes referred to as a 'program ID' or 'program
address.'

### Programs have instruction handlers

For example, a Solana client making a transaction to transfer USDC with a memo
saying 'thanks' would have two instructions:

- One instruction for the Token program's `transfer` instruction handler.
- Another instruction for the Memo program's `memo` instruction handler.

Both instructions must be completed successfully for the transaction to execute.

Instruction handlers are how onchain programs process instructions from clients.
Every exchange, lending protocol, escrow, oracle, and similar application
provides their functionality via instruction handlers.

### Instruction handlers write their state to Solana accounts

If you have experience in web development, you can think of instruction handlers
like HTTP route handlers and incoming instructions like HTTP requests.

However, unlike HTTP route handlers, Solana instruction handlers do not return
data. Instead, they write their data to accounts on Solana.

Programs on Solana can transfer tokens to user wallet addresses (for SOL) or
user token accounts (for other tokens).

More importantly, Solana programs can create additional addresses as needed to
store data items.

### Programs store data in Program Derived Addresses (PDAs), a key-value store

Data for Solana programs are stored in **Program-Derived Addresses (PDAs)**.
Solana’s PDAs can be viewed as a **key-value store**:

- The 'key' is the PDA address, determined by `seeds` chosen by you, the
  developer.
  - For example, if your program needs to store the USD to AUD exchange rate,
    you can use the seeds `USD` and `AUD` to create a Program-Derived Address.
  - To store information about the relationship between two users, you can use
    both users' wallet addresses as seeds to create a PDA to store that
    information.
  - To store Steve's review of Titanic, you can use Steve's **wallet address**
    and the string `titanic` (or the IMDB ID if you prefer) to create a
    Program-Derived Address.
  - To store global information for your entire program, you can use a string
    like `'config'`. Since your program’s PDAs are unique, they won’t conflict
    with other programs.
- The 'value' is the data stored inside the account at the given address,
  defined by you, the developer.

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

- We recommend new developers start with
  [start with Anchor](/content/courses/onchain-development/intro-to-anchor).
  Anchor's defaults make it easy to create secure programs.
- There is also a course on
  [native onchain program development](/content/courses/native-onchain-development).

Whichever approach you choose, the Solana Foundation provides
[examples in both languages](https://github.com/solana-developers/program-examples),
and [Solana Stack Exchange](https://solana.stackexchange.com/) is available for
support.

For now, let's
[set up your computer](/content/courses/onchain-development/local-setup)!
