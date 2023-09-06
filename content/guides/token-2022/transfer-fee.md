---
date: Sep 01, 2023
title: How to use the Transfer Fee extension
description:
  "With any form of transaction, there's often a desire to collect or apply a
  fee. Similar to a small service charge every time you transfer money at a bank
  or the way royalties or taxes are collected for particular transfers."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: beginner
tags:
  - token 2022
  - token extensions
altRoutes:
  - /developers/guides/transfer-fee
---

With any form of transaction, there's often a desire to collect or apply a fee.
Similar to a small service charge every time you transfer money at a bank or the
way royalties or taxes are collected for particular transfers.

The original Token program has no mechanism for this. The workaround was to
freeze a user's account and force them to go through a third party.

With Token 2022, you can configure a transfer fee directly on a mint, enabling
fees to be collected at a protocol level. Every time you transact with the given
mint, a specific fee is set aside in the recipient's account. This fee is
untouchable by the recipient and can only be accessed by the withdraw authority.

This guide walks you through how to use the Transfer Fee mint extension to add a
transfer fee to a mint and how to access all the withheld fees.

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
  createAccount,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  getMintLen,
  getTransferFeeAmount,
  harvestWithheldTokensToMint,
  mintTo,
  transferCheckedWithFee,
  unpackAccount,
  withdrawWithheldTokensFromAccounts,
  withdrawWithheldTokensFromMint,
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
const mintKeypair = Keypair.generate();
const mint = mintKeypair.publicKey;
// authority that can modify the transfer fee;/
const transferFeeConfigAuthority = Keypair.generate();
// authority that can move tokens withheld on the mint or token accounts
const withdrawWithheldAuthority = Keypair.generate();
const decimals = 9;
// fee to collect on transfers
// equivalent to 0.5%
const feeBasisPoints = 50;
// maximum fee to collect on transfers
const maxFee = BigInt(5_000);
const mintLen = getMintLen([ExtensionType.TransferFeeConfig]);
const mintLamports =
  await connection.getMinimumBalanceForRentExemption(mintLen);
```

We get the size of our new account and calculate the amount for rent exemption.
We use the helper `getMinLen` helper function, which takes an array of
extensions we want for this mint.

## The Instructions

Now, let's build the set of instructions to:

- Create a new account
- Initialize the transfer fee extension
- Initialize our new account as a token mint

```javascript
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey, // account that will transfer lamports to created account
  newAccountPubkey: mint, // public key or the created account
  space: mintLen, // amount of bytes to allocate to the created account
  lamports: mintLamports, // amount of lamports to transfer to created account
  programId: TOKEN_2022_PROGRAM_ID, // public key of the program to assign as owner of created account
});
```

We create our Mint account and assign ownership to the token 2022 program.

```javascript
const initializeTransferFeeConfig =
  createInitializeTransferFeeConfigInstruction(
    mint, // token mint account
    transferFeeConfigAuthority.publicKey, // authority that can update fees
    withdrawWithheldAuthority.publicKey, // authority that can withdraw fees
    feeBasisPoints, // amount of transfer collected as fees
    maxFee, // maximum fee to collect on transfers
    TOKEN_2022_PROGRAM_ID, // SPL token program id
  );
```

Next, we initialize the Transfer Fee extension for our mint, setting the
`feeBasisPoint` and the `maxFee`.

```javascript
const initializeMintInstruction = createInitializeMintInstruction(
  mint, // token mint
  decimals, // number of decimals
  mintAuthority.publicKey, // minting authority
  null, // optional authority that can freeze token accounts
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

We then initialize our account as a token mint.

## Send and confirm

```javascript
const mintTransaction = new Transaction().add(
  createAccountInstruction,
  initializeTransferFeeConfig,
  initializeMintInstruction,
);

const mintTransactionSig = await sendAndConfirmTransaction(
  connection,
  mintTransaction,
  [payer, mintKeypair],
  undefined,
);
```

Finally, we add the instructions to our transaction and send it to the network.
As a result, we've created a mint account with the transfer fee extension.

## Transferring Tokens

To transfer tokens, you have to use the `transferCheckedWithFee` function. The
transfer only succeeds if the fee is calculated correctly to avoid any surprise
deductions during the transfer.

We'll continue by setting up our script to create two new token accounts that we
can transfer between.

First, we will need to:

- Create two new token accounts
- Mint new tokens to one of those accounts
- Transfer tokens to the other account using the `transferCheckedWithFee`
  function

### Account setup

```javascript
const owner = Keypair.generate();
const sourceAccount = await createAccount(
  connection, // connection to use
  payer, // payer of transaction and intialization fee
  mint, // mint for the account
  owner.publicKey, // owner of the new account
  undefined, // optional keypair
  undefined, // options for confirming transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);

// amount of tokens to mint to the new account
const mintAmount = BigInt(1_000_000_000);
await mintTo(
  connection, // connection to use
  payer, // payer of transaction fee
  mint, // mint for the token account
  sourceAccount, // address of account to mint to
  mintAuthority, // minting authority
  mintAmount, // amount to mint
  [], // signing acocunt
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);

const accountKeypair = Keypair.generate();
const destinationAccount = await createAccount(
  connection, // connection to use
  payer, // payer of transaction and intialization fee
  mint, // mint for the account
  owner.publicKey, // owner of the new account
  accountKeypair, // optional keypair
  undefined, // options for confirming transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

Next, we create two new token accounts and mint `1_000_000_000` tokens to the
source account.

```javascript
// amount of tokens we want to transfer
const transferAmount = BigInt(1_000_000);

// the reason why we divide by 10_000 is that 1 basis point is 1/100th of 1% | 0.01%
const fee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);

const transferCheckedWithFeeSig = await transferCheckedWithFee(
  connection, // connection to use
  payer, // payer of the transaction fee
  sourceAccount, // source account
  mint, // mint for the account
  destinationAccount, // destination account
  owner, // owner of the source account
  transferAmount, // number of tokens to transfer
  decimals, // number of decimals
  fee, // expected fee collected for transfer
  [], // signing accounts
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

Finally we transfer the tokens from our `sourceAccount` to the
`destinationAccount`.

## Find and withdraw withheld tokens from accounts

As users transfer their tokens, transfer fees are accumulated in the various
recipient accounts. The withdraw withheld authority can withdraw these tokens
from the various recipients' accounts.

We'll need to iterate over all token accounts for the Mint and find which
accounts have withheld tokens.

```javascript
const allAccounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
  commitment: "confirmed",
  filters: [
    {
      memcmp: {
        offset: 0,
        bytes: mint.toString(),
      },
    },
  ],
});
```

We get all accounts for the given mint.

```javascript
const accountsToWithdrawFrom = [];

for (const accountInfo of allAccounts) {
  const account = unpackAccount(
    accountInfo.pubkey,
    accountInfo.account,
    TOKEN_2022_PROGRAM_ID,
  );

  // We then extract the transfer fee extension data from the account
  const transferFeeAmount = getTransferFeeAmount(account);

  if (
    transferFeeAmount !== null &&
    transferFeeAmount.withheldAmount > BigInt(0)
  ) {
    accountsToWithdrawFrom.push(accountInfo.pubkey);
  }
}
```

Next, we filter out the accounts that have incurred transfer fees.

```javascript
await withdrawWithheldTokensFromAccounts(
  connection, // connection to use
  payer, // payer of the transaction fee
  mint, // the token mint
  destinationAccount, // the destination account
  withdrawWithheldAuthority, // the withdraw withheld token authority
  [], // signing accounts
  accountsToWithdrawFrom, // source accounts from which to withdraw withheld fees
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

Finally, with the accounts found, we use the `withdrawWithheldAuthority` to
withdraw the fees from all the accounts to the `destinationAccount`.

## Harvest withheld tokens to mint

Token accounts holding any tokens, including withheld ones, cannot be closed.
Therefore, a user may want to close a token account with withheld transfer fees.

Users can permissionlessly clear out their account of withheld tokens with the
`harvestWithheldTokensToMint` function.

```javascript
await harvestWithheldTokensToMint(
  connection, // connection to use
  payer, // payer of the transaction fee
  mint, // the token mint
  [destinationAccount], // source accounts from which to withdraw withheld fees
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

## Withdraw withheld tokens from mint

As users permissionlessly move the withheld tokens to the mint, the
`withdrawAuthority` may choose to move those tokens from the Mint to any other
account.

```javascript
await withdrawWithheldTokensFromMint(
  connection, // connection to use
  payer, // payer of the transaction fee
  mint, // the token mint
  destinationAccount, // the destination account
  withdrawWithheldAuthority, // the withdraw withheld authority
  [], // signing accounts
  undefined, // options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // SPL token program id
);
```

## Conclusion

The Transfer Fee mint extension makes it much easier to handle transfer fees,
integrating them at the protocol level. It offers a superior UX for users and
dApp developers, opening up new possibilities and use cases.
