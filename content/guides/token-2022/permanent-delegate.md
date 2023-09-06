---
date: Sep 01, 2023
title: How to use the Permanent Delegate extension
description:
  "With Token 2022, it's possible to specify a permanent account delegate for a
  mint. This authority has **unlimited** delegate privileges over any account
  associated with that mint, meaning that it can burn or transfer any amount of
  tokens."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: beginner
tags:
  - token 2022
  - token extensions
altRoutes:
  - /developers/guides/permanent-delegate
---

With the Token program, the Mint may contain a `freezeAuthority` which can be
used to render an Account unusable. When an account is frozen, any Instructions
involving that account will fail until the account is reactivated.

One of the uses of the `freezeAuthority` is to freeze accounts that are linked
to sanctioned individuals or linked to wallet hacks etc. Whilst the attacker
cannot benefit from the tokens, there's no means for restitution.

With Token 2022, it's possible to specify a permanent account delegate for a
mint. This authority has **unlimited** delegate privileges over any account
associated with that mint, meaning that it can burn or transfer any amount of
tokens.

## Understanding the implications?

This is a very powerful feature, and it's implications have to be clearly stated
for both users and app developers.

Previously, tokens could be frozen if there was a security breach, but there
wasn't a system in place to return them to their original owner. With the
introduction of the permanent delegate, this authority now has the capability to
either burn or transfer the tokens back.

Due to the unlimited powers of the permanent delegate, if the delegates keys are
compromised, the attacker will have complete control on all token accounts for
that mint.

This guide walks you through how to create a mint with a permanent delegate.

Lets get started!

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
  createInitializePermanentDelegateInstruction,
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
// address for the mint
const mint = mintKeypair.publicKey;
// amount of decimals
const decimals = 9;
// authority that can mint tokens
const mintAuthority = Keypair.generate();
// authority that can sign for transfers and burn on any account
const permanentDelegate = Keypair.generate();

const mintLen = getMintLen([ExtensionType.PermanentDelegate]);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
```

We get the size of our new account and calculate the amount for rent exemption.
We use the helper `getMinLen` helper function, which takes an array of
extensions we want for this mint.

## The Instructions

Now, let's build the set of instructions to:

- Create a new account
- Initialize the permanent delegate extension
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

We create our mint account and assign ownership to the token 2022 program.

```javascript
const initializePermanentDelegateInstruction =
  createInitializePermanentDelegateInstruction(
    mint, // token mint account
    permanentDelegate.publicKey, // authority that may sign for transfers and burns on all accounts
    TOKEN_2022_PROGRAM_ID, // SPL token program id
  );
```

Next, we initialize the Permanent Delegate extension for our mint.

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
  initializePermanentDelegateInstruction,
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
As a result, we've created a mint account with the permanent delegate extension.

Important to note that when you want to transfer with the delegate, you have to
use the `transferChecked` helper from `@solana/spl-token`

## Conclusion

This could be a very devisive extension. It could easily be abused if users are
not aware that the token they're interacting with has a permanent delegate but
it does open up some "new" use-cases.

Other use cases:

Subscription Services: A company could issue tokens as access passes to a
subscription service. If a user doesn't renew their subscription, the permanent
delegate could automatically revoke their access by transferring the token back.

Decentralized Autonomous Organizations (DAOs): DAOs could use this feature to
ensure that members actively participate in voting or other community
activities. Inactive members could have their tokens automatically
redistributed.

Imagine you own a special digital collectible (NFT). There's a rule that says
you have to pay a tax to keep it. If you don't pay the tax, there's a system in
place that can automatically take it from you and give it to someone else who
wants to buy it. This rule and system together are called a Harberger Tax.
