---
date: Sep 01, 2023
title: How to use the Non-transferable mint extension
description:
  "In the world of digital collectibles, NFTs have plenty of uses outside of the current PFP meta. Enter the concept of "soul-bound" tokens - assets that are "bound" to an individual, ensuring exclusivity to an individual/account."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: beginner
tags:
  - token 2022
  - token extensions
altRoutes:
  - /developers/guides/non-transferable-tokens
---

In the world of digital collectibles, NFTs have plenty of uses outside of the
PFP meta. Enter the concept of "soul-bound" tokens - assets that are tied to an
individual.

This unlocks the potential for diplomas, identities, achievements, and more, all
tokenized on-chain. These are assets that should remain exclusive to an
individual/account.

Token 2022 introduces the `NonTransferable` mint extension that makes this
possible with tokens that cannot be transferred.

## Understanding the implications

However, this extension is very similar to issuing a token and then freezing the
account with a more favourable UX. While tokens cannot be transferred, the owner
can still burn and close the account. This allows the user the flexibility to no
longer be associated or "stuck" with an unwanted asset.

This guide walks you through how to use the Non-transferable extension to create
"soul-bound" tokens.

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
  createInitializeMintInstruction,
  createInitializeNonTransferableMintInstruction,
  getMintLen,
} from "@solana/spl-token";

// We establish a connection to the cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Next, we create and fund the payer account
const payer = Keypair.generate();
const airdropSignature = await connection.requestAirdrop(
  payer.publicKey,
  2 * LAMPORTS_PER_SOL,
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
const mintKeypair = Keypair.generate();
// address of the token mint
const mint = mintKeypair.publicKey;
// The amount of decimals for our mint
const decimals = 9;
// authority that can mint new tokens
const mintAuthority = Keypair.generate();

const mintLen = getMintLen([ExtensionType.NonTransferable]);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
```

Next, we get the size of our new account and calculate the amount for rent
exemption. We use the helper `getMinLen` helper function, which takes an array
of extensions we want for this mint.

## The

Now, let's build the set of instructions to:

- Create a new account
- Initialize the non-transferable mint extension
- Initialize our new account as a token mint

```javascript
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey, // The account that will transfer lamports to the created account
  newAccountPubkey: mint, // Amount of lamports to transfer to the created account
  space: mintLen, // Amount of space in bytes to allocate to the created account
  lamports, // Amount of lamports to transfer to the created account
  programId: TOKEN_2022_PROGRAM_ID, // Public key of the program to assign as the owner of the created account
});
```

We create our mint account and assign ownership to the token 2022 program.

```javascript
const initializeNonTransferableMintInstruction =
  createInitializeNonTransferableMintInstruction(
    mint, // mint account to make non-transferable
    TOKEN_2022_PROGRAM_ID, // SPL token program id
  );
```

Next, we initialize the Non-Transferable extension for our mint.

```javascript
const initializeMintInstruction = createInitializeMintInstruction(
  mint, // token mint
  decimals, // number of decimals
  mintAuthority.publicKey, // minting authority
  null, // optional authority that can freeze token accounts
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

We then initialize our account as a mint account.

## Send and confirm

```javascript
const transaction = new Transaction().add(
  createAccountInstruction,
  initializeNonTransferableMintInstruction,
  initializeMintInstruction,
);
await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer, mintKeypair],
  undefined,
);
```

Finally, we add the instructions to our transaction and send it to the network.
As a result, we've created a mint account with the non-transferable extension.

## Conclusion

Token 2022's `NonTransferable` mint extension enables the creation of
"soul-bound" tokens, ensuring that digital assets are bound to an individual
account.
