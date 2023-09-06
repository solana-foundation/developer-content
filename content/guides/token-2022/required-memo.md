---
date: Sep 01, 2023
title: How to use the Required memo extension
description:
  "Memos in financial transactions serve as a communication tool between sender
  and recipient. It aids in the identification of both parties and offers
  clarity on the purpose of the transfer."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: beginner
tags:
  - token 2022
  - token extensions
altRoutes:
  - /developers/guides/required-memo
---

Memos in financial transactions serve as a communication tool between sender and
recipient. It aids in the identification of both parties and offers clarity on
the purpose of the transfer.

The Required Memo extension enforces that all incoming transfers have an
accompanying [memo](https://spl.solana.com/memo) instruction.

## The value of adding memos

**Identifying Parties**: Memos help pinpoint the sender and receiver. Given the
anonymity of addresses, a memo can provide context, ensuring the right parties
are involved.

**Clarifying Purpose**: A memo provides clarity on the transaction's intent.

**Tracking Finances**: If you're keeping an eye on your assets, memos help
ensure you've sent or received the right amounts, which is especially useful
during tax time (ahemm).

These are a few examples of how transaction memos offer clarity, help in
tracking, and add a personal touch, making every transaction easily
identifiable.

This guide walks you through how to use the Required Memo extension to enforce a
memo on all incoming transfers.

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
- Create a new token mint using the Token 2022 program

```javascript
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createEnableRequiredMemoTransfersInstruction,
  createInitializeAccountInstruction,
  createMint,
  disableRequiredMemoTransfers,
  enableRequiredMemoTransfers,
  getAccountLen,
} from "@solana/spl-token";

// We establish a connection to the cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Next, we create and fund the payer account
const payer = Keypair.generate();
const airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  0.5 * LAMPORTS_PER_SOL,
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
  mintAuthority.publicKey, // Account or multisig that will control minting
  mintAuthority.publicKey, // Optional account or multisig that can freeze token accounts
  decimals, // Location of the decimal place
  undefined, // Optional keypair, defaulting to a new random one
  undefined, // Options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // Token Program ID
);
```

As a result, we create a new token mint using the `createMint` helper function.

## Account setup

```javascript
// owner of the token account
const ownerKeypair = Keypair.generate();
const accountKeypair = Keypair.generate();
// address of our token account
const account = accountKeypair.publicKey;

const accountLen = getAccountLen([ExtensionType.MemoTransfer]);
const lamports = await connection.getMinimumBalanceForRentExemption(accountLen);
```

Next, we get the size of our new account and calculate the amount for rent
exemption. We use the helper `getAccountLen` helper function, which takes an
array of extensions we want for this account.

## The Instructions

Now, let's build the set of instructions to:

- Create a new account
- Initialize our new account as a token account
- Enable the required memo extension

```javascript
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey, // The account that will transfer lamports to the created account
  newAccountPubkey: account, // Amount of lamports to transfer to the created account
  space: accountLen, // Amount of space in bytes to allocate to the created account
  lamports, // Amount of lamports to transfer to the created account
  programId: TOKEN_2022_PROGRAM_ID, // Public key of the program to assign as the owner of the created account
});
```

We create a new account and assign ownership to the token 2022 program.

```javascript
const initializeAccountInstruction = createInitializeAccountInstruction(
  account, // New token account
  mint, // Mint account
  ownerKeypair.publicKey, // Owner of the new token account
  TOKEN_2022_PROGRAM_ID, // Token program ID
);
```

Next, we initialize our newly created account to hold tokens.

```javascript
const enableRequiredMemoTransfersInstruction =
  createEnableRequiredMemoTransfersInstruction(
    account, // Token account to update
    owner.publicKey, // The account owner/delegate
    [], // The signer account(s)
    TOKEN_2022_PROGRAM_ID, // Token Program ID
  );
```

We then initialize the Required memo extension for the given token account. It's
important to note that this can be enabled and disabled at any time.

## Send and confirm

```javascript
const transaction = new Transaction().add(
  createAccountInstruction,
  initializeAccountInstruction,
  enableRequiredMemoTransfersInstruction,
);
await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer, owner, accountKeypair],
  undefined,
);
```

Finally, we add the instructions to our transaction and send it to the network.
As a result, we've created a token account for our new mint with the immutable
owner extension applied.

## Enabling memo transfers

An account owner can enable the required memo transfer extension at any time.

```javascript
await enableRequiredMemoTransfers(
  connection, // connection to use
  payer, // payer of the transaction fee
  account, // account to modify
  owner, // owner of the account
  [], // signing account if owner is a multisig
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // Token Program ID
);
```

## Disabling memo transfers

An account owner can disable the required memo transfer extension at any time.

```javascript
await disableRequiredMemoTransfers(
  connection, // connection to use
  payer, // payer of the transaction fee
  account, // account to modify
  owner, // owner of the account
  [], // signing account if owner is a multisig
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // Token Program ID
);
```

## Conclusion

The Required Memo extension in the Token 2022 program ensures every incoming
transfer has a memo, enhancing transaction clarity and ease of tracking.
