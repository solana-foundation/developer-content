---
date: Dec 04, 2023
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

With Token 2022, it's possible to specify a permanent account delegate for a
mint. This authority has **unlimited** delegate privileges over any token
account for that mint, meaning that it can burn or transfer any amount of
tokens.

In this guide, we'll walk through an example using Solana Playground. Here is a
[link](https://beta.solpg.io/656e3c06fb53fa325bfd0c47) to the final script.

## Understanding the Implications

This is a very powerful feature, and it's implications have to be clearly stated
for both users and app developers.

The permanent delegate is effectively a global owner of all token accounts for
the mint. Due to the unlimited powers of the permanent delegate, if the
delegate's keys are compromised, an attacker will have complete control over all
token accounts for that mint.

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
  Keypair,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  createInitializePermanentDelegateInstruction,
  createInitializeMintInstruction,
  getMintLen,
  createAccount,
  mintTo,
  transferChecked,
  burnChecked,
} from "@solana/spl-token";

// We establish a connection to the cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Playground wallet
const payer = pg.wallet.keypair;

// transaction signature return from sent transaction
let transactionSignature: string;
```

## Mint Setup

Next, let's configure the properties of our token mint and the define the
authorities.

```javascript
const mintKeypair = Keypair.generate();
// address of our token mint
const mint = mintKeypair.publicKey;
// the amount of decimals for our mint
const decimals = 9;
// authority that can mint new tokens
const mintAuthority = payer;
// authority that can sign for transfers and burn on any account
const permanentDelegate = payer;
```

Next, let's get the size for the mint account and calculate the minimum lamports
required for rent exemption. We'll use the `getMinLen` helper function, which
takes an array of extensions we want for this mint.

```javascript
const mintLen = getMintLen([ExtensionType.PermanentDelegate]);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
```

With Token 2022, the size of the mint account will vary based on the extensions
enabled.

## Build Instructions

Next, let's build the set of instructions to:

- Create a new account
- Initialize the permanent delegate extension
- Initialize our new account as a token mint

First, build the instruction to invoke the System Program to create an account
and assign ownership to the Token 2022 Program.

```javascript
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey, // account that will transfer lamports to created account
  newAccountPubkey: mint, // public key to use as the address of the created account
  space: mintLen, // amount of bytes to allocate to the created account
  lamports, // amount of lamports to transfer to created account
  programId: TOKEN_2022_PROGRAM_ID, // public key of the program to assign as owner of created account
});
```

Next, build the instruction to initialize the Permanent Delegate extension for
the mint account.

```javascript
const initializePermanentDelegateInstruction =
  createInitializePermanentDelegateInstruction(
    mint, // token mint account
    permanentDelegate.publicKey, // authority that may sign for transfers and burns on all accounts
    TOKEN_2022_PROGRAM_ID, // SPL token program id
  );
```

Lastly, build the instruction to initialize the rest of the Mint Account data.
This is the same as with the original Token Program.

```javascript
const initializeMintInstruction = createInitializeMintInstruction(
  mint, // token mint
  decimals, // number of decimals
  mintAuthority.publicKey, // minting authority
  null, // optional authority that can freeze token accounts
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

## Send Transaction

Finally, add the instructions to a new transaction and send it to the network.
This will create a mint account with the `PermanentDelegate` extension.

```javascript
const transaction = new Transaction().add(
  createAccountInstruction,
  initializePermanentDelegateInstruction,
  initializeMintInstruction,
);

transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer, mintKeypair],
);

console.log(
  "\n",
  "Transaction Signature:",
  `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
);
```

Run the script by clicking the `Run` button. You can then inspect the
transaction on the Solana Explorer.

## Create Token Accounts

Next, let's set up two token accounts to demonstrate the functionality of the
permanent delegate.

First, generate a random keypair and use it as the owner of a
`sourceTokenAccount`.

```javascript
// generate random keypair to use as owner of a token account
const randomKeypair = new Keypair();

// create associated token account for random keypair
const sourceTokenAccount = await createAccount(
  connection,
  payer, // payer
  mint, // mint address
  randomKeypair.publicKey, // token account owner
  undefined, // optional keypair
  undefined, // confirmOptions
  TOKEN_2022_PROGRAM_ID,
);
```

Next, create a `destinationTokenAccount` owned by the Playground wallet.

```javascript
// create associated token account for playground wallet
const destinationTokenAccount = await createAccount(
  connection,
  payer, // payer
  mint, // mint address
  payer.publicKey, // token account owner
  undefined, // optional keypair
  undefined, // confirmOptions
  TOKEN_2022_PROGRAM_ID,
);
```

Lastly, mint 2 tokens to the `sourceTokenAccount` to fund it.

```javascript
// mint tokens to sourceTokenAccount
transactionSignature = await mintTo(
  connection,
  payer, // payer
  mint, // mint address
  sourceTokenAccount, // destination
  mintAuthority.publicKey, // mint authority
  2_000_000_000, // amount
  undefined, // multiSigners
  undefined, // confirmOptions
  TOKEN_2022_PROGRAM_ID, // program ID
);

console.log(
  "\n",
  "Transaction Signature:",
  `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
);
```

## Transfer with Permanent Delegate

Let's send a transaction to transfer 1 token from the `sourceTokenAccount` to
the `destinationTokenAccount`.

To transfer tokens with the permanent delegate, use the `transferChecked`
instruction.

```javascript
// transfer tokens from source to destination token account
transactionSignature = await transferChecked(
  connection,
  payer, // payer
  sourceTokenAccount, // transfer from
  mint, // mint
  destinationTokenAccount, // transfer to
  permanentDelegate, // pass in permanent delegate as owner of token account
  1_000_000_000, // amount
  decimals, // decimals
  undefined, // multiSigners
  undefined, // confirmOptions
  TOKEN_2022_PROGRAM_ID, // program ID
);

console.log(
  "\n",
  "Transaction Signature:",
  `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
);
```

## Burn with Permanent Delegate

Let's send a transaction to burn 1 token from the `sourceTokenAccount`.

To burn tokens with the permanent delegate, use the `burnChecked` instruction.

```javascript
transactionSignature = await burnChecked(
  connection,
  payer, // payer
  sourceTokenAccount, // transfer from
  mint, // mint
  permanentDelegate, // pass in permanent delegate as owner of source token account
  1_000_000_000, // amount
  decimals, // decimals
  undefined, // multiSigners
  undefined, // confirmOptions
  TOKEN_2022_PROGRAM_ID, // program ID
);

console.log(
  "\n",
  "Transaction Signature:",
  `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
);
```

Run the script by clicking the `Run` button. You can then inspect the
transactions on the Solana Explorer.

Note that the both the transfer and burn transactions complete successfully,
even though the transactions are not signed by the owner of the token account.

## Conclusion

The permanent delegate extension is a powerful extension that potentially opens
up new use-cases for tokens. However, users should be aware of the implications
of holding tokens for a mint that has enabled this extension.
