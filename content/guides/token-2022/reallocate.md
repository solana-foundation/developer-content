---
date: Dec 7, 2023
title: How to use the Reallocate instruction
description:
  "The Token Extensions program has account extensions that can be applied after
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

The `MemoTransfer` and `CpiGuard` extensions can be enabled for existing Token
Accounts. However, enabling these extensions once a Token Account has already
been created requires reallocating additional space to accommodate the extra
data required by the extensions. This can be done using the `reallocate`
instruction.

In this guide, we'll walk through an example of using Solana Playground. Here is
the [final script](https://beta.solpg.io/65723a50fb53fa325bfd0c52).

## Getting Started

Start by opening this Solana Playground
[link](https://beta.solpg.io/656e19acfb53fa325bfd0c46) with the following
starter code.

```javascript
// Client
console.log("My address:", pg.wallet.publicKey.toString());
const balance = await pg.connection.getBalance(pg.wallet.publicKey);
console.log(`My balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`);
```

If it is your first time using Solana Playground, you'll first need to create a
Playground Wallet and fund the wallet with devnet SOL.

To get devnet SOL, run the `solana airdrop` command in the Playground's
terminal, or visit this [devnet faucet](https://faucet.solana.com/).

```
solana airdrop 5
```

Once you've created and funded the Playground wallet, click the "Run" button to
run the starter code.

## Add Dependencies

Let's start by setting up our script. We'll be using the `@solana/web3.js` and
`@solana/spl-token` libraries.

Replace the starter code with the following:

```javascript
import {
  Connection,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createAccount,
  createMint,
  createReallocateInstruction,
  createEnableRequiredMemoTransfersInstruction,
} from "@solana/spl-token";

// Playground wallet
const payer = pg.wallet.keypair;

// Connection to devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Transaction signature returned from sent transaction
let transactionSignature: string;
```

## Create Mint and Token Account

We'll first need to create a new Mint Account.

```javascript
// Authority that can mint new tokens
const mintAuthority = pg.wallet.publicKey;
// Decimals for Mint Account
const decimals = 2;

// Create Mint Account
const mint = await createMint(
  connection,
  payer, // Payer of the transaction and initialization fees
  mintAuthority, // Mint Authority
  null, // Optional Freeze Authority
  decimals, // Decimals of Mint
  undefined, // Optional keypair
  undefined, // Options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);
```

Next, let's create a Token Account with no extensions enabled.

```javascript
// Create Token Account for Playground wallet
const tokenAccount = await createAccount(
  connection,
  payer, // Payer to create Token Account
  mint, // Mint Account address
  payer.publicKey, // Token Account owner
  undefined, // Optional keypair, default to Associated Token Account
  undefined, // Confirmation options
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);
```

## Build Instructions

Next, let's build a transaction to enable the `MemoTransfer` extensions for an
existing Token Account.

First, build the instruction to reallocate the Token Account with enough space
for the specified extension.

```javascript
// Extensions to reallocate data for
const extensions = [ExtensionType.MemoTransfer];
// Instruction to reallocate Token Account data
const reallocateInstruction = createReallocateInstruction(
  tokenAccount, // Token Account address
  payer.publicKey, // Payer to reallocate data
  extensions, // Extensions to reallocate
  payer.publicKey, // Token Account owner
  undefined, // Additional signers
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);
```

Next, build the instruction to enable the `MemoTransfer` extension for the Token
Account.

```javascript
// Instruction to initialize the MemoTransfer Extension
const enableRequiredMemoTransfersInstruction =
  createEnableRequiredMemoTransfersInstruction(
    tokenAccount, // Token Account address
    payer.publicKey, // Token Account Owner
    undefined, // Additional signers
    TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
  );
```

## Send Transaction

Next, let's add the instructions to a new transaction and send it to the
network. This will update the Token Account with the `MemoTransfer` extension
enabled.

```javascript
// Add instructions to new transaction
const transaction = new Transaction().add(
  reallocateInstruction,
  enableRequiredMemoTransfersInstruction,
);

// Send Transactoin
transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer],
);

console.log(
  "\nReallocate:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

Run the script by clicking the `Run` button. You can then inspect the
transaction details on SolanaFM.

## Conclusion

The reallocate instruction is useful when you need to add an extension on an
existing Token Account.
