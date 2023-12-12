---
date: Dec 06, 2023
title: How to use the Permanent Delegate extension
description:
  "With Token Extensions, it's possible to specify a permanent account delegate
  for a mint. This authority has **unlimited** delegate privileges over any
  account associated with that mint, meaning that it can burn or transfer any
  amount of tokens."
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

The `PermanentDelegate` extension allows for a designated Permanent Delegate for
a Mint Account. The Permanent Delegate has unrestricted delegate privileges over
all Token Accounts for that mint, enabling them to burn or transfer tokens
without limitation.

In this guide, we'll walk through an example of using Solana Playground. Here is
the [final script](https://beta.solpg.io/6570a56bfb53fa325bfd0c4b).

## Understanding the Implications

This is a very powerful feature, and it's implications have to be clearly stated
for both users and app developers.

The Permanent Delegate is effectively a global owner of all Token Accounts for
the mint. Due to the unlimited powers of the Permanent Delegate, if the
delegate's keys are compromised, an attacker will have complete control over all
Token Accounts for that mint.

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

// Playground wallet
const payer = pg.wallet.keypair;

// Connection to devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Transaction signature returned from sent transaction
let transactionSignature: string;
```

## Mint Setup

First, let's define the properties of the Mint Account we'll be creating in the
following step.

```javascript
// Generate new keypair for Mint Account
const mintKeypair = Keypair.generate();
// Address for Mint Account
const mint = mintKeypair.publicKey;
// Decimals for Mint Account
const decimals = 2;
// Authority that can mint new tokens
const mintAuthority = pg.wallet.publicKey;
// Authority that can transfer or burn from any token account
const permanentDelegate = pg.wallet.publicKey;
```

Next, let's determine the size of the new Mint Account and calculate the minimum
lamports needed for rent exemption.

```javascript
// Size of Mint Account with extension
const mintLen = getMintLen([ExtensionType.PermanentDelegate]);
// Minimum lamports required for Mint Account
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
```

With Token Extensions, the size of the Mint Account will vary based on the
extensions enabled.

## Build Instructions

Next, let's build the set of instructions to:

- Create a new account
- Initialize the `PermanentDelegate` extension
- Initialize the remaining Mint Account data

First, build the instruction to invoke the System Program to create an account
and assign ownership to the Token Extensions Program.

```javascript
// Instruction to invoke System Program to create new account
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
  newAccountPubkey: mint, // Address of the account to create
  space: mintLen, // Amount of bytes to allocate to the created account
  lamports, // Amount of lamports transferred to created account
  programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
});
```

Next, build the instruction to initialize the `PermanentDelegate` extension for
the Mint Account.

```javascript
// Instruction to initialize the MintCloseAuthority Extension
const initializeMintCloseAuthorityInstruction =
  createInitializePermanentDelegateInstruction(
    mint, // Mint Account address
    permanentDelegate, // Designated Permanent Delegate
    TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
  );
```

Lastly, build the instruction to initialize the rest of the Mint Account data.
This is the same as with the original Token Program.

```javascript
// Instruction to initialize Mint Account data
const initializeMintInstruction = createInitializeMintInstruction(
  mint, // Mint Account Address
  decimals, // Decimals of Mint
  mintAuthority, // Designated Mint Authority
  null, // Optional Freeze Authority
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);
```

## Send Transaction

Next, let's add the instructions to a new transaction and send it to the
network. This will create a Mint Account with the `PermanentDelegate` extension
enabled.

```javascript
// Add instructions to new transaction
const transaction = new Transaction().add(
  createAccountInstruction,
  initializeMintCloseAuthorityInstruction,
  initializeMintInstruction,
);

// Send transaction
transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer, mintKeypair], // Signers
);

console.log(
  "\nCreate Mint Account:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

Run the script by clicking the `Run` button. You can then inspect the
transaction on the SolanaFM.

## Create Token Accounts

Next, let's set up two Token Accounts to demonstrate the functionality of the
Permanent Delegate.

First, generate a random keypair and use it as the owner of a
`sourceTokenAccount`.

```javascript
// Random keypair to use as owner of Token Account
const randomKeypair = new Keypair();
// Create Token Account for random keypair
const sourceTokenAccount = await createAccount(
  connection,
  payer, // Payer to create Token Account
  mint, // Mint Account address
  randomKeypair.publicKey, // Token Account owner
  undefined, // Optional keypair, default to Associated Token Account
  undefined, // Confirmation options
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);
```

Next, create a `destinationTokenAccount` owned by the Playground wallet.

```javascript
// Create Token Account for Playground wallet
const destinationTokenAccount = await createAccount(
  connection,
  payer, // Payer to create Token Account
  mint, // Mint Account address
  payer.publicKey, // Token Account owner
  undefined, // Optional keypair, default to Associated Token Account
  undefined, // Confirmation options
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);
```

Lastly, mint 2 tokens to the `sourceTokenAccount` to fund it.

```javascript
// Mint tokens to sourceTokenAccount
transactionSignature = await mintTo(
  connection,
  payer, // Transaction fee payer
  mint, // Mint Account address
  sourceTokenAccount, // Mint to
  mintAuthority, // Mint Authority address
  200, // Amount
  undefined, // Additional signers
  undefined, // Confirmation options
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);

console.log(
  "\nMint Tokens:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

## Transfer with Permanent Delegate

Next, let's send a transaction to transfer 1 token from the `sourceTokenAccount`
to the `destinationTokenAccount`. Remember, the `sourceTokenAccount` is owned by
a randomly generated keypair.

To transfer tokens using the Permanent Delegate, use the `transferChecked`
instruction and specify the Permanent Delegate as the owner of the
`sourceTokenAccount`.

```javascript
// Transfer tokens from source to destination
transactionSignature = await transferChecked(
  connection,
  payer, // Transaction fee payer
  sourceTokenAccount, // Transfer from
  mint, // Mint Account address
  destinationTokenAccount, // Transfer to
  permanentDelegate, // Use Permanent Delegate as owner
  100, // Amount
  decimals, // Mint Account decimals
  undefined, // Additional signers
  undefined, // Confirmation options
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);

console.log(
  "\nTranfer Tokens:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

## Burn with Permanent Delegate

Next, let's also send a transaction to burn 1 token from the
`sourceTokenAccount`.

To burn tokens using the `Permanent Delegate`, use the `burnChecked` instruction
and specify the Permanent Delegate as the owner of the `sourceTokenAccount`.

```javascript
// Burn tokens from token account
transactionSignature = await burnChecked(
  connection,
  payer, // Transaction fee payer
  sourceTokenAccount, // Burn from
  mint, // Mint Account address
  permanentDelegate, // Use Permanent Delegate as owner
  100, // Amount
  decimals, // Mint Account decimals
  undefined, // Additional signers
  undefined, // Confirmation options
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);

console.log(
  "\nBurn Tokens:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

Run the script by clicking the `Run` button. You can then inspect the
transactions on the SolanaFM.

Note that the both the transfer and burn transactions complete successfully,
even though the transactions are not signed by the owner of the Token Account.

## Conclusion

The `PermanentDelegate` extension is a powerful extension that enables
developers to have much greater control over tokens they create, such as the
ability to retrieve tokens that have been mistakenly transferred. While this
extension offers greater flexibility, it's essential for users to be aware of
the implications of holding tokens with this extension enabled, particularly the
risks associated with compromised delegate keys.
