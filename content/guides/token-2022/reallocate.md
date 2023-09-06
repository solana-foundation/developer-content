---
date: Sep 01, 2023
title: How to use the Reallocate extension
description:
  "The token 2022 program has account extensions that can be applied after
  initializing a token account. Unless you anticipate which extensions you will
  need in the future, this could be tricky as you'll need to allocate enough
  space for them on creation."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: beginner
tags:
  - token 2022
  - token extensions
altRoutes:
  - /developers/guides/reallocate
---

The token 2022 program has account extensions that can be applied after
initializing a token account. Unless you anticipate which extensions you will
need in the future, this could be tricky as you'll need to allocate enough space
for them on creation.

In order for you to use these extensions, you will need to reallocate more space
in the Account for the additional extension bytes.

To address this, the Reallocate instruction allows an owner to reallocate more
space to their token account to fit room for more extensions.

Let's get started!

## Install dependencies

```shell
npm i @solana/web3.js @solana/spl-token
```

Install the `@solana/web3.js` and `@solana/spl-token` packages.

## Setting up

Let’s start by setting up our script to create a new token mint.

First, we will need to:

- Establish a connection to the devnet cluster
- Generate a payer account and fund it
- Create a new token mint using the Token 2022 program

```javascript
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createAccount,
  createEnableRequiredMemoTransfersInstruction,
  createMint,
  createReallocateInstruction,
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
// authority that can mint new tokens
const mintAuthority = Keypair.generate();
const decimals = 9;

// Next, we create a new token mint
const mint = await createMint(
  connection, // Connection to use
  payer, // Payer of the transaction and initialization fees
  mintAuthority.publicKey, //Account or multisig that will control minting
  mintAuthority.publicKey, // Optional Account or multisig that can freeze token accounts
  decimals, // Location of the decimal place
  undefined, // Optional keypair, defaulting to a new random one
  undefined, // Options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // Token Program ID
);
```

As a result, we create a new token mint using the `createMint` helper function.

## Account setup

```javascript
const owner = Keypair.generate();
const account = await createAccount(
  connection, // connection to use
  payer, // payer of the transaction fee
  mint, // mint for the account
  owner.publicKey, // owner of the new account
  undefined, // optional keypair
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

Next, we create a new token account.

## The Instructions

Now, let's build the set of instructions to:

- Apply the reallocate extension
- Then apply the required memo extension

```javascript
const extensions = [ExtensionType.MemoTransfer];
const reallocateInstruction = createReallocateInstruction(
  account, // address of the token account
  payer.publicKey, // address paying for the reallocation
  extensions, // extensions to reallocate for
  owner.publicKey, // owner of the account
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);

// enable required memo transfer instruction
const enableRequiredMemoTransfersInstruction =
  createEnableRequiredMemoTransfersInstruction(
    account, // token account to update
    owner.publicKey, // accounts owner
    [], // signer account(s)
    TOKEN_2022_PROGRAM_ID, // SPL token program id
  );
```

We then use the reallocate instruction to make more space for our Account and
apply the required memo extension.

## Send and confirm

```javascript
const transaction = new Transaction().add(
  reallocateInstruction,
  enableRequiredMemoTransfersInstruction,
);

await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer, mintKeypair],
  undefined,
);
```

Finally, we add the instructions to our transaction and send it to the network.
As a result, we've created a mint account with the mint close authority
extension.

## Conclusion

The reallocate extension will always be useful when you need to add an extension
on an already initialized account.
