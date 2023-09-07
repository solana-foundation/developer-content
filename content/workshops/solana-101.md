---
featured: true
date: 04 Jan 2023
updatedDate: 04 Jan 2023
title: Solana 101
description:
  Introduction to building on & interacting with the Solana blockchain
repoUrl: https://github.com/Solana-Workshops/solana-101
duration: "2 hours"
objectives:
  - The Solana Network
  - Solana’s Programming Model
  - Tokens & NFTs
tags:
  - Introduction
  - Beginner
video: "https://www.youtube.com/watch?v=56Erql9229E"
presentation: "https://docs.google.com/presentation/u/1/d/1e62b2hRbfREidLsVEnDNDKjXCRQDW2cyQOesy9Ozsbs/"
# author details
author: Joe Caulfield
authorDescription: DevRel at Solana Foundation
authorTwitterHandle: realbuffalojoe
authorGithubUsername: buffalojoec
---

# Solana 101

## Introduction to Programming on Solana

### Topics Introduced

---

#### The Solana Network

- Technical Advantages
- Network Overview

#### Solana’s Programming Model

- Accounts

  - Accounts Overview
  - Anatomy of an Account

- Programs

  - Programs Overview

- Instructions & Transactions

  - Anatomy of an Instruction
  - Anatomy of a Transaction

- Custom Program Data
  - Data Ownership
  - Program-Derived Addresses

#### Tying it All Together

- Lifecycle of a Transaction

---

### Why Solana?

Let’s talk about the main technological advantages to building a decentralized
application on Solana.  
Solana has extremely fast block confirmation times, so users don’t have to wait
to make sure their action worked.

Solana’s transaction fees are exceptionally low, so developers can build more
robust user experiences that cost less.

Let’s take a brief look at how Solana’s network creates blocks and processes
transactions.

Like most proof-of-stake networks, Solana elects a leader for each block
creation cycle, who’s responsible for creating a new block.

Unlike Ethereum - Solana does not use a mempool. Instead, it forwards new
transactions to the next leader in the block creation cycle, which means when
that leader is elected, it already has all of the transactions it needs to pack
into a new block.

Next, Solana leverages a high-throughput engine called Turbine that disseminates
information about a new block to the rest of the network.

When a block’s transactions are executed, Solana’s runtime actually allows the
operations within each transaction to run in parallel wherever possible. The
combination of these 3 innovations leads to greatly increased speed and
throughput for the network.

Solana’s most popular innovation is Proof-of-History, which leverages a
Verifiable-Delay Function (VDF) to allow all nodes in the network to agree on
the passage of time.

Solana also has various upgrades like QUIC, and localised fee markets, Stake
Weighted QoS, makes it perfect for high-performance applications.

### Programming on Solana

Now let’s dive into the concepts you’ll need to know when programming on Solana.
The first thing we’ll want to understand is the concept of an account.

#### Account

An account on Solana is a slice of data from the blockchain.

Everything on Solana is an account! You can kind of think of it like a
computer’s file system - where everything is a file!

Every account has a unique address, holds some balance of SOL, and can store
arbitrary data. Based on the size of that arbitrary data, a user is required to
pay some value of SOL for what’s called “Rent”.

Since this is blockchain data, anyone can read from an account. Also, anyone can
credit SOL or tokens to an account. However, only an account’s owner can modify
its data - which includes debiting it’s SOL balance.

```
{
	key: number,				// The address of the account
	lamports: number,			// Lamports currently held
	data: Uint8Array,			// Data stored in the account
	is_executable: boolean,	// Is this data a program?
	owner: PublicKey,			// The program with write access
 }

 Accounts,
 1 Lamport = 10E-9 SOL
```

If we take a look at what an actual account looks like in raw form, we can see
some of the fields present on all accounts shown here.

The “key” field is just that account’s address.

The “lamports” field simply tracks that account’s current balance of SOL.
Lamports are the smaller denomination of SOL.

“Data” is where the arbitrary data is stored inside of an account.

If that arbitrary data stored in this account is actually an executable program,
the “is_executable” boolean will be set to true.

Lastly, the “owner” field determines which Solana program has the authority to
perform changes to this account’s data, including its balance of Lamports.

#### Programs

First of all, you may have heard the term “smart contract” from the world of
Ethereum. On Solana, smart contracts are called “Programs”.

Programs are a special type of account whose data is an executable program, like
we mentioned before. Right now, Solana programs can be written in Rust, C/C++ or
Python. Soon, we may be able to write programs in other languages - such as
TypeScript and GoLang.

Unlike Ethereum’s “smart contracts”, programs don’t actually have state of their
own. Instead, they perform reads and writes on accounts from the blockchain. To
perform a write, this program must be the designated owner of the account it’s
attempting to modify. Programs are designed to process what are called
“instructions”, and they can also send these instructions to other programs on
the network.

#### Takeaways

- Everything is an account
- All accounts hold SOL
- Accounts can store arbitrary data
- Accounts can also store executable programs
- Accounts are passed into programs, allowing for parallel execution

~ Read more about this workshop in the Video or Presentation.~
