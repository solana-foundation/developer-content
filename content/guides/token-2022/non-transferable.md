---
date: Aug 17, 2023
difficulty: intro
title: "Non-Transferable Tokens: Token 2022 Mint Extension"
description:
  "This guide walks you through how to use the Non-transferable extension to create 'soul-bound' tokens."
tags:
  - token-2022
keywords:
  - beginner
  - spl
  - spl token
  - token 2022
  - token 2022 extensions
altRoutes:
  - /developers/guides/non-transferable-tokens
---

In the world of digital collectibles, NFTs have plenty of uses outside of the current PFP meta. Enter the concept of "soul-bound" tokens - assets that are "bound" to an individual, ensuring exclusivity to an individual/account.

This unlocks the potential for tokenizing assets on-chain, such as diplomas, identities and achievements, which are not meant to be transferable and unique to an individual.

Token 2022 introduces the `NonTransferable` mint extension that makes this possible with tokens that cannot be transferred.

## Understanding the implications

This extension is very similar to issuing a token and then freezing the account, however with more favourable UX. While the token cannot be transferred, the owner can still burn and close the account. This allows the user the flexibility to no longer be associated or "stuck" with an unwanted asset.

This guide walks you through how to use the Non-transferable extension to create "soul-bound" tokens.

Lets get started!

## Install dependencies

```shell
npm i @solana/web3.js @solana/spl-token
```

Install the `@solana/web3.js` and `@solana/spl-token` packages.

## Setting up

We'll begin by setting up our script to create a new token mint.

First, we will need to:

- Establish a connection to the devnet cluster
- Generate a payer account and fund it
- Create a new token mint using the Token 2022 program

```javascript
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createInitializeMintInstruction,
    createInitializeNonTransferableMintInstruction,
    getMintLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

// We establish a connection to the cluster
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Next, we create and fund the payer account
const payer = Keypair.generate();
const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });
```

## Mint setup

```javascript
// We create a new keypair, the publickey will be the address for our mint
const mintKeypair = Keypair.generate();
const mint = mintKeypair.publicKey;
// The amount of decimals for our mint
const decimals = 9;
// Next, we create a new keypair that will be the mint authority
const mintAuthority = Keypair.generate();

const mintLen = getMintLen([ExtensionType.NonTransferable]);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
```

Next, we get the size of our new account and calculate the amount for rent exemption. We use the helper `getMinLen` helper function, which takes an array of extensions we want for this mint.

## The Instructions

```javascript
const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: mint,
    space: mintLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
});
```

We create our mint account and assign ownership to the token 2022 program.

```javascript
const initializeNonTransferableMintInstruction = createInitializeNonTransferableMintInstruction(
    mint,
    TOKEN_2022_PROGRAM_ID
);
```

Next, we initialize the Non-Transferable extension for our mint.

```javascript
const initializeMintInstruction = createInitializeMintInstruction(
    mint,
    decimals,
    mintAuthority.publicKey,
    null, 
    TOKEN_2022_PROGRAM_ID
);
```

We then initialize our account as a mint account.

## Send and confirm

```javascript
const transaction = new Transaction().add(
    createAccountInstruction,
    initializeNonTransferableMintInstruction,
    initializeMintInstruction
);
await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair], undefined);
```

Finally, we add the instructions to our transaction and send it to the network. As a result, we've created a mint account with the non-transferable extension.

## Conclusion

Token 2022's `NonTransferable` mint extension enables the creation of "soul-bound" tokens, ensuring that digital assets are bound to an individual account.
