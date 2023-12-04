---
date: Dec 04, 2023
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
initializing the `MintCloseAuthority` extension before initializing the mint.
Note that the supply on the mint must be 0 to close the account.

In this guide, we'll walk through an example using Solana Playground. Here is a
[link](https://beta.solpg.io/656e180ffb53fa325bfd0c45) to the final script.

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
  closeAccount,
  createInitializeMintCloseAuthorityInstruction,
  createInitializeMintInstruction,
  getMintLen,
} from "@solana/spl-token";

// Establish a connection to the cluster
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
// The amount of decimals for our mint
const decimals = 9;
// authority that can mint new tokens
const mintAuthority = payer;
// authority that can close the mint account
const closeAuthority = payer;
```

Next, let's get the size of the new mint account and calculate the minimum
lamports required for rent exemption. We use the helper `getMinLen` helper
function, which takes an array of extensions we want for this mint.

```javascript
const mintLen = getMintLen([ExtensionType.MintCloseAuthority]);
const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
```

With Token 2022, the size of the mint account will vary based on the extensions
enabled.

## Build Instructions

Now, let's build the set of instructions to:

- Create a new account
- Initialize the mint close authority extension
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

Next, build the instruction to initialize the Mint Close Authority extension for
the mint account.

```javascript
const initializeMintCloseAuthorityInstruction =
  createInitializeMintCloseAuthorityInstruction(
    mint, // token mint account
    closeAuthority.publicKey, // authority that can close the mint
    TOKEN_2022_PROGRAM_ID, // SPL Token program id
  );
```

Lastly, build the instruction to initialize the rest of the Mint Account data.
This is the same as with the original Token Program.

```javascript
const initializeMintInstruction = createInitializeMintInstruction(
  mint, // token mint account
  decimals, // number of decimals for token
  mintAuthority.publicKey, // authority that can mint new tokens
  null, // optional freeze authority
  TOKEN_2022_PROGRAM_ID, // SPL Token program id
);
```

## Send Transaction

Finally, we add the instructions to a new transaction and send it to the
network. This will create a mint account with the `MintCloseAuthority`
extension.

```javascript
const transaction = new Transaction().add(
  createAccountInstruction,
  initializeMintCloseAuthorityInstruction,
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

## Closing a mint account

With the `MintCloseAuthority` extension on the mint and a valid authority, it's
possible to close the mint account and reclaim the lamports on the mint account.

```javascript
transactionSignature = await closeAccount(
  connection, // connection to use
  payer, // payer of the transaction fees
  mint, // mint account to close
  payer.publicKey, // account to receive the lamports
  closeAuthority, // authority that can close the mint
  [], // signing accounts
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL Token program id
);

console.log(
  "\n",
  "Transaction Signature:",
  `https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet`,
);
```

Run the script by clicking the `Run` button. You can then inspect the
transaction on the Solana Explorer.

## Conclusion

Token 2022's `MintCloseAuthority` extension is quite simple but effective. You
get to reclaim SOL that otherwise would have been lost.
