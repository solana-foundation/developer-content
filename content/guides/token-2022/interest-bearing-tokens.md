---
date: Sep 01, 2023
title: How to use the Interest-Bearing extension
description:
  "Interest-bearing tokens are tokens that can either increase or decrease in
  value over time. Similar to how a bank savings account or a loan accumulates
  interest."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: beginner
tags:
  - token 2022
  - token extensions
altRoutes:
  - /developers/guides/interest-bearing-tokens
---

Interest-bearing tokens can either increase or decrease in value over time.
Similar to how a bank savings account or a loan accumulates interest.

The Interest-bearing extension allows you to set an interest rate on a token
calculated continuously based on the network's timestamp.

## How does it work?

The extension offers a new way to represent the value of the tokens. No new
tokens are created/minted; only the displayed value of the token increases. It's
just a visual representation. Think of it as seeing your bank balance increase
due to interest, but no new physical money is added/created.

This guide walks you through how to use the Interest-bearing extension to add an
interest rate to a token.

Let's get started!

## Install dependencies

```shell
npm i @solana/web3.js @solana/spl-token
```

Install the `@solana/web3.js` and `@solana/spl-token` packages.

## Setting up

Let's start by setting up our script to create a new token mint.

First, we will need to:

- Establish a connection to the devnet cluster
- Generate a payer account and fund it
- Create a new token mint using the Token 2022 Program

```javascript
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  amountToUiAmount,
  createInterestBearingMint,
  TOKEN_2022_PROGRAM_ID,
  updateRateInterestBearingMint,
} from "@solana/spl-token";

// We establish a connection to the cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Next, we create and fund the payer account
const payer = Keypair.generate();
const airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  LAMPORTS_PER_SOL,
);
await connection.confirmTransaction({
  signature: airdropSignature,
  ...(await connection.getLatestBlockhash()),
});
```

## Mint setup

Next, let's configure the properties of our token mint and generate the
necessary authorities.

```javascript
const mintAuthority = Keypair.generate();
const freezeAuthority = Keypair.generate();

// rateAuthority: The authority that can update the interest rate
const rateAuthority = Keypair.generate();
const mintKeypair = Keypair.generate();

// rate: The initial interest rate
const rate = 50;
const decimals = 0;
```

We create various authorities to manage different aspects of our mint (mint,
freeze and rate authority), and then set our initial interest rate.

## Initialize an interest-bearing account on a mint

```javascript
const mint = await createInterestBearingMint(
  connection, // connection to use
  payer, // payer of the transaction fees
  mintAuthority.publicKey, // account that will control minting
  freezeAuthority.publicKey, // optional account that can freeze token accounts
  rateAuthority.publicKey, // account that can update the rate
  rate, // the initial interest rate
  decimals, // decimals for this mint
  mintKeypair, // optional keypair
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program account
);
```

As a result, we've created a new token mint with the interest-bearing extension
applied.

## View interest generated

We use the `amountToUiAmount` helper function from the `@solana/spl-token`
library to view the interest generated.

```javascript
const accountBalance = 1000;

const uiAmount = await amountToUiAmount(
  connection, // connection to use
  payer, // payer of the transaction fees
  mint, // token mint
  accountBalance, // amount of tokens to be converted to UI amount
  TOKEN_2022_PROGRAM_ID, // Token program ID
);
```

## Update the interest rate

The `RateAuthority` can update the interest rate on the mint at any time.

```javascript
const updateRate = 50;
const tx = await updateRateInterestBearingMint(
  connection, // connection to use
  payer, // payer of the transaction fee
  mint, // public key of the mint
  rateAuthority, // account that can update the rate
  updateRate, // the initial interest rate
  [], // signing accounts
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // Token program ID
);
```

## Conclusion

The Interest-bearing extension for Token 2022 on Solana introduces a simple
mechanism for tokens to increase/decrease in value over time.

By seamlessly integrating tools commonly found in traditional finance, this
innovation broadens Solana's capabilities, bridging the gap between conventional
financial instruments and the world of blockchain.
