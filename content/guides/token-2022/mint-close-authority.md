---
date: Sep 01, 2023
title: How to use the Mint Close Authority extension
description:
  "The Token program allows owners to close token accounts, but it is impossible
  to close mint accounts. In Token-2022, it is possible to close mints by
  initializing the MintCloseAuthority extension before initializing the mint."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: beginner
tags:
  - token 2022
  - token extensions
altRoutes:
  - /developers/guides/mint-close-authority
---

The Token program allows owners to close token accounts, but is impossible to
close mint accounts. In Token-2022, it is possible to close mints by
initializing the MintCloseAuthority extension before initializing the mint.

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
  closeAccount,
  createInitializeMintCloseAuthorityInstruction,
  createInitializeMintInstruction,
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
// address of our token mint
const mint = mintKeypair.publicKey;
// The amount of decimals for our mint
const decimals = 9;
// authority that can mint new tokens
const mintAuthority = Keypair.generate();
// authority that can close the mint account
const closeAuthority = Keypair.generate();

const mintLen = getMintLen([ExtensionType.MintCloseAuthority]);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
```

We get the size of our new account and calculate the amount for rent exemption.
We use the helper `getMinLen` helper function, which takes an array of
extensions we want for this mint.

## The Instructions

Now, let's build the set of instructions to:

- Create a new account
- Initialize the mint close authority extension
- Initialize our new account as a token mint

```javascript
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey, // account that will transfer lamports to created account
  newAccountPubkey: mint, // public key or the created account
  space: mintLen, // amount of bytes to allocate to the created account
  lamports, // amount of lamports to transfer to created account
  programId: TOKEN_2022_PROGRAM_ID, // public key of the program to assign as owner of created account
});
```

We create our Mint account and assign ownership to the token 2022 program.

```javascript
const initializeMintCloseAuthorityInstruction =
  createInitializeMintCloseAuthorityInstruction(
    mint, // token mint account
    closeAuthority.publicKey, // authority that can close the mint
    TOKEN_2022_PROGRAM_ID, // SPL Token program id
  );
```

Next, we initialize the Mint Close Authority extension for our mint.

```javascript
const initializeMintInstruction = createInitializeMintInstruction(
  mint, // token mint account
  decimals, // number of decimals for token
  mintAuthority.publicKey, // authority that can mint new tokens
  null, // optional freeze authority
  TOKEN_2022_PROGRAM_ID, // SPL Token program id
);
```

We then initialize our account as a mint account.

## Send and confirm

```javascript
const transaction = new Transaction().add(
  createAccountInstruction,
  initializeMintCloseAuthorityInstruction,
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
As a result, we've created a mint account with the mint close authority
extension.

## Closing a mint account

With the MintCloseAuthority extension on the mint and a valid authority, it's
possible to close the mint account and reclaim the lamports on the mint account.

```javascript
await closeAccount(
  connection, // connection to use
  payer, // payer of the transaction fees
  mint, // mint account to close
  payer.publicKey, // account to receive the lamports
  closeAuthority, // authority that can close the mint
  [], // signing accounts
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL Token program id
);
```

**Note**: The supply on the mint must be 0.

## Conclusion

Token 2022's `MintCloseAuthority` extension is quite simple but effective. You
get to reclaim precious SOL that otherwise would have been lost.
