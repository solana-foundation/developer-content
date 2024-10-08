---
title: Durable Nonces
objectives:
  - Be able to explain the differences between durable transactions and regular
    transactions.
  - Create and submit durable transactions.
  - Navigate edge cases that can happen when dealing with durable transactions.
description: "Use durable nonces to sign transactions ahead of time."
---

## Summary

- Durable transactions have no expiration date unlike regular transactions that
  have an expiration date of 150 blocks (~80-90 seconds).
- After signing a durable transaction you can store it in a database or a file
  or send it to another device to submit it later.
- A durable transaction is created using a nonce account. A nonce account holds
  the authority and the nonce value which replaces the recent blockhash to make
  a durable transaction
- Durable transactions must start with an `advanceNonce` instruction, and the
  nonce authority must be a signer of the transaction.
- If the transaction fails for any reason other than the `advanceNonce`
  instruction, the nonce will still be advanced, even though all other
  instructions will be reverted.

## Overview

Durable Nonces are a way to bypass the expiration date of regular transactions.
To understand this, we'll start by looking at the concepts behind regular
transactions.

In Solana, transactions have three main parts:

1. **Instructions**: Instructions are the operations you want to perform on the
   blockchain, like transferring tokens, creating accounts, or calling a
   program. These are executed in order.

2. **Signatures**: Signatures are proof that the transaction was made by someone
   with the signer's private key - which should usually be the signer
   themselves. For instance, if you are transferring SOL from your wallet to
   another, you'll need to sign the transaction so the network can verify that
   the transaction is valid.

3. **Recent Blockhash**: The recent blockhash is a unique identifier for each
   transaction. It is used to prevent replay attacks, where an attacker records
   a transaction and then tries to submit it again. The recent blockhash ensures
   that each transaction is unique and can only be submitted once. A recent
   blockhash is only valid for 150 blocks.

In durable transactions, the first two concepts remain the same. Durable
transactions are possible by playing with recent blockhashes.

Let's dive deep into the recent blockhash, to understand the blockhash better
let's look at the problem that it tries to solve, the
[double-spend](https://solana.com/developers/guides/advanced/introduction-to-durable-nonces#double-spend)
problem.

Imagine you're buying an NFT on MagicEden or Tensor. You must sign a transaction
that allows the marketplace's program to extract some SOL from your wallet.
After signing the transaction the marketplace will submit it to the network. If
the marketplace submits it again, without checks, you could be charged twice.

This is known as the double-spend problem and is one of the core issues that
blockchains, like Solana, solve. A naive solution could be to crosscheck all
transactions made in the past and see if we find a duplicate transaction
signature. This is not practically possible, as the size of the Solana ledger
is >80 TB. So to solve this, Solana uses recent blockhashs.

A recent blockhash is a 32-byte SHA-256 hash of a valid block's last
[entry id](https://solana.com/docs/terminology#blockhash) within the last 150
blocks. Since this recent blockhash was part of the transaction before it was
signed, we can guarantee the signer has signed it within the last 150 blocks.
Checking 150 blocks is much more reasonable than the entire ledger.

When the transaction is submitted, the Solana validators will do the following:

1. Check if the signature of the transaction has been submitted within the last
   150 blocks - if there is a duplicate signature it'll fail the duplicate
   transaction.
2. If the transaction signature has not been found, it will check the recent
   blockhash to see if it exists within the last 150 blocks - if it does not, it
   will return a "Blockhash not found" error. If it does, the transaction goes
   through its execution checks.

While this solution is great for most use cases, it has some limitations.
Mainly, the transaction needs to get signed and submitted to the network within
150 blocks or around ~80-90 seconds. But there are some use cases where we need
more than 90 seconds to submit a transaction.

From the
[Durable Nonce guide](https://solana.com/developers/guides/advanced/introduction-to-durable-nonces#durable-nonce-applications):

> 1. **Scheduled Transactions**: One of the most apparent applications of
>    Durable Nonces is the ability to schedule transactions. Users can pre-sign
>    a transaction and then submit it at a later date, allowing for planned
>    transfers, contract interactions, or even executing pre-determined
>    investment strategies.
> 2. **Multisig Wallets**: Durable Nonces are very useful for multi-signature
>    wallets where one party signs a transaction, and others may confirm it at a
>    later time. This feature enables the proposal, review, and later execution
>    of a transaction within a trustless system.
> 3. **Programs Requiring Future Interaction**: If a program on Solana requires
>    interaction at a future point (such as a vesting contract or a timed
>    release of funds), a transaction can be pre-signed using a Durable Nonce.
>    This ensures the contract interaction happens at the correct time without
>    necessitating the presence of the transaction creator.
> 4. **Cross-chain Interactions**: When you need to interact with another
>    blockchain and it requires waiting for confirmations, you can sign the
>    transaction with a Durable Nonce and execute it once the required
>    confirmations are received.
> 5. **Decentralized Derivatives Platforms**: In a decentralized derivatives
>    platform, complex transactions might need to be executed based on specific
>    triggers. With Durable Nonces, these transactions can be pre-signed and
>    executed when the trigger condition is met.

### Considerations

### Considerations

Durable transactions should be treated with care, which is why users should
always trust the transactions they sign.

As developers, it's important to inform users that their durable nonce
transactions may be flagged by wallets. Durable nonces are often used for
malicious transactions, and understanding the risks can help users make informed
decisions.

For example, imagine a user blindly signed a malicious durable transaction. This
transaction could sign away 500 SOL to an attacker and change the nonce
authority to the attacker as well. Even if the user doesn't have this amount
yet, the attacker could wait to cash this check as soon as the user's balance
exceeds 500 SOL. The user would have no recollection of what they clicked on,
and the transaction could remain dormant for days, weeks, or years.

To mitigate these risks, developers should educate users on the following
points:

1. **Trust the Source**: Users should only sign transactions from trusted
   sources. Encourage users to verify the origin of the transaction before
   signing.
2. **Use Hot Wallets Cautiously**: Users should only keep in hot wallets what
   they're willing to lose. Hot wallets are more susceptible to attacks, so it's
   wise to limit the amount of funds stored in them.
3. **Protect Cold Wallets**: Users should avoid signing transactions with their
   cold wallets unless absolutely necessary. Cold wallets are more secure and
   should be used to store larger amounts of funds.
4. **Monitor Transactions**: Encourage users to regularly monitor their
   transaction history and account balances. Promptly reporting any suspicious
   activity can help mitigate potential losses.

By providing this information, developers can help users understand the
potential dangers of durable nonce transactions and take appropriate
precautions. This is not meant to provoke hysteria but serves to show what's
possible and emphasize the importance of security in handling durable
transactions.

### Using Durable Nonces to Overcome the Short Lifespan of Regular Transactions

Durable nonces are a way to sign transactions offchain and keep them in storage
until they are ready to be submitted to the network. This allows us to create
durable transactions.

Durable nonces, which are 32 bytes in length (usually represented as base58
encoded strings), are used in place of recent blockhashes to make each
transaction unique (to avoid double-spending) while removing the expiration of
the unexecuted transactions.

If nonces are used in place of recent blockhashes, the first instruction of the
transaction needs to be a `nonceAdvance` instruction, which changes or advances
the nonce. This ensures that every transaction which is signed using the nonce
as the recent blockhash will be unique.

It is important to note that durable nonces require
[unique mechanisms within Solana](https://docs.solanalabs.com/implemented-proposals/durable-tx-nonces)
to function, thus they have some special rules that don't apply normally. We'll
see this as we deep dive into the technicals.

### Durable Nonces In-Depth

Durable transactions differ from regular transactions in the following ways:

1. Durable Nonces replace the recent blockhash with a nonce. This nonce is
   stored in a nonce account and will be used only once in one transaction. The
   nonce is a unique blockhash.
2. Each durable transaction must start with the `nonceAdvance` instruction,
   which will change the nonce in the nonce account. This ensures that the nonce
   is unique and cannot be reused in another transaction.

The nonce account is an account that holds the following values:

1. nonce value: the nonce value that will be used in the transaction.
2. authority: the public key that can change the nonce value.
3. fee calculator: the fee calculator for the transaction.

Again, every durable transaction must start with the `nonceAdvance` instruction,
and the `authority` must be a signer.

Lastly, there is a special rule - if a durable transaction fails because of any
instruction other than the `nonceAdvance` instruction, the nonce will still
advance, while the rest of the transaction is rolled back. This behavior is
unique only to durable nonces.

### Durable Nonce Operations

Durable nonces have a few helpers and constants in the `@solana/web3.js`
package:

1. `SystemProgram.nonceInitialize`: This instruction creates a new nonce
   account.
2. `SystemProgram.nonceAdvance`: This instruction changes the Nonce in the nonce
   account.
3. `SystemProgram.nonceWithdraw`: This instruction withdraws funds from the
   nonce account. To delete the nonce account, withdraw all the funds from it.
4. `SystemProgram.nonceAuthorize`: This instruction changes the authority of the
   nonce account.
5. `NONCE_ACCOUNT_LENGTH`: A constant that represents the length of the nonce
   account data.
6. `NonceAccount`: A class that represents the nonce account. It contains a
   static function `fromAccountData` that can take the nonce account data and
   return a nonce account object.

Let's look into each one of the helper functions in detail.

#### `nonceInitialize`

The `nonceInitialize` instruction is used to create a new nonce account. It
takes two parameters:

1. `noncePubkey`: the public key of the nonce account.
2. `authorizedPubkey`: the public key of the authority of the nonce account.

Here is a code example for it:

```typescript
// 1. Generate/get a keypair for the nonce account, and the authority.
const [nonceKeypair, nonceAuthority] = makeKeypairs(2); // from '@solana-developers/helpers'
// Calculate the minimum balance required for rent exemption
const rentExemptBalance =
  await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);

const tx = new Transaction().add(
  // 2. Allocate the account and transfer funds to it (the rent-exempt balance)
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: nonceKeypair.publicKey,
    lamports: rentExemptBalance,
    space: NONCE_ACCOUNT_LENGTH,
    programId: SystemProgram.programId,
  }),
  // 3. Initialize the nonce account using the `SystemProgram.nonceInitialize` instruction.
  SystemProgram.nonceInitialize({
    noncePubkey: nonceKeypair.publicKey,
    authorizedPubkey: nonceAuthority.publicKey,
  }),
);

// Send the transaction
await sendAndConfirmTransaction(connection, tx, [payer, nonceKeypair]);
```

The system program will take care of setting the nonce value for us inside the
nonce account.

#### `nonceAdvance`

This instruction is used to change the nonce value in the nonce account, it
takes two parameters:

1. `noncePubkey`: the public key of the nonce account.
2. `authorizedPubkey`: the public key of the authority of the nonce account.

Here is a code example for it:

```typescript
const instruction = SystemProgram.nonceAdvance({
  authorizedPubkey: nonceAuthority.publicKey,
  noncePubkey: nonceKeypair.publicKey,
});
```

You will see this instruction as the first instruction in any durable
transaction. But that doesn't mean that you only have to use it as the first
instruction of a durable transaction. You can always call this function, and it
will automatically invalidate any durable transaction tied to its previous nonce
value.

#### `nonceWithdraw`

This instruction is used to withdraw the funds from the nonce account, it takes
four parameters:

1. `noncePubkey`: the public key of the nonce account.
2. `toPubkey`: the public key of the account that will receive the funds.
3. `lamports`: the amount of lamports that will be withdrawn.
4. `authorizedPubkey`: the public key of the authority of the nonce account.

Here is a code example for it:

```typescript
const instruction = SystemProgram.nonceWithdraw({
  noncePubkey: nonceKeypair.publicKey,
  toPubkey: payer.publicKey,
  lamports: amount,
  authorizedPubkey: nonceAuthority.publicKey,
});
```

You can also use this instruction to close the nonce account by withdrawing all
the funds in it.

#### `nonceAuthorize`

This instruction is used to change the authority of the nonce account, it takes
three parameters:

1. `noncePubkey`: the public key of the nonce account.
2. `authorizedPubkey`: the public key of the current authority of the nonce
   account.
3. `newAuthorizedPubkey`: the public key of the new authority of the nonce
   account.

Here is a code example for it:

```typescript
const instruction = SystemProgram.nonceAuthorize({
  noncePubkey: nonceKeypair.publicKey,
  authorizedPubkey: nonceAuthority.publicKey,
  newAuthorizedPubkey: newAuthority.publicKey,
});
```

### How to use the durable nonces

Now that we learned about the nonce account and its different operations, let's
talk about how to use it.

We'll discuss:

1. Fetching the nonce account
2. Using the nonce in the transaction to make a durable transaction.
3. Submitting a durable transaction.

#### Fetching the nonce account

We can fetch the nonce account to get the nonce value by fetching the account
and serializing it:

```typescript
const nonceAccount = await connection.getAccountInfo(nonceKeypair.publicKey);

const nonce = NonceAccount.fromAccountData(nonceAccount.data);
```

#### Using the nonce in the transaction to make a durable transaction

To build a fully functioning durable transaction, we need the following:

1. Use the nonce value in replacement of the recent blockhash.
2. Add the nonceAdvance instruction as the first instruction in the transaction.
3. Sign the transaction with the authority of the nonce account.

After building and signing the transaction we can serialize it and encode it
into a base58 string, and we can save this string in some store to submit it
later.

```typescript
// Assemble the durable transaction
const durableTx = new Transaction();
durableTx.feePayer = payer.publicKey;

// use the nonceAccount's stored nonce as the recentBlockhash
durableTx.recentBlockhash = nonceAccount.nonce;

// make a nonce advance instruction
durableTx.add(
  SystemProgram.nonceAdvance({
    authorizedPubkey: nonceAuthority.publicKey,
    noncePubkey: nonceKeypair.publicKey,
  }),
);

// Add any instructions you want to the transaction in this case we are just doing a transfer
durableTx.add(
  SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient.publicKey,
    lamports: 0.1 * LAMPORTS_PER_SOL,
  }),
);

// sign the tx with the nonce authority's keypair
durableTx.sign(payer, nonceAuthority);

// once you have the signed tx, you can serialize it and store it in a database, or send it to another device.
// You can submit it at a later point.
const serializedTx = base58.encode(
  durableTx.serialize({ requireAllSignatures: false }),
);
```

#### submitting a durable transaction:

Now that we have a base58 encoded transaction, we can decode it and submit it:

```typescript
const tx = base58.decode(serializedTx);
const sig = await sendAndConfirmRawTransaction(connection, tx as Buffer);
```

### Some important edge cases

There are a few things that you need to consider when dealing with durable
transactions:

1. If the transaction fails due to an instruction other than the nonce advanced
   instruction.
2. If the transaction fails due to the nonce advanced instruction.

#### If the transaction fails due to an instruction other than the nonce advanced instruction

In the normal case of failing transactions, the known behavior is that all the
instructions in the transaction will get reverted to the original state. But in
the case of a durable transaction, if any instruction fails that is not the
advance nonce instruction, the nonce will still get advanced and all other
instructions will get reverted. This feature is designed for security purposes,
ensuring that once a user signs a transaction, if it fails, it cannot be used
again.

Presigned, never expiring, durable transactions are like signed paychecks. They
can be dangerous in the right scenarios. This extra safety feature effectively
"voids" the paycheck if handled incorrectly.

#### If the transaction fails due to the nonce advanced instruction

If a transaction fails because of the advance instruction, the entire
transaction is reverted, meaning the nonce does not advance.

## Lab

In this lab, we'll learn how to create a durable transaction. We'll focus on
what you can and can't do with it. Additionally, we'll discuss some edge cases
and how to handle them.

### 0. Getting started

Let's go ahead and clone our starter code

```bash
git clone https://github.com/Unboxed-Software/solana-lab-durable-nonces
cd Solana-lab-durable-nonces
git checkout starter
npm install
```

In the starter code, you will find a file inside `test/index.ts`, with a testing
skeleton, we'll write all of our code here.

We're going to use the local validator for this lab. However, feel free to use
devnet if you'd like. ( If you have issues airdropping on devnet, check out
[Solana's Faucet](https://faucet.solana.com/) )

To run the local validator, you'll need to have it installed, if you don't you
can refer to [installing the Solana CLI](/docs/intro/installation.md), once you
install the CLI you'll have access to the `solana-test-validator`.

In a separate terminal run:

```bash
solana-test-validator
```

In `test/index.ts` you'll see five tests, these will help us understand durable
nonces better.

We'll discuss each test case in depth.

### 1. Create the nonce account

Before we write any tests, let's create a helper function above the `describe`
block called `createNonceAccount`.

It will take the following parameters:

- `Connection`: Connection to use
- `payer`: The payer
- `nonceKeypair`: The nonce keypair
- `authority`: Authority over the nonce

It will:

1. Assemble and submit a transaction that will:
   1. Allocate the account that will be the nonce account.
   2. Initialize the nonce account using the `SystemProgram.nonceInitialize`
      instruction.
2. Fetch the nonce account.
3. Serialize the nonce account data and return it.

Paste the following somewhere above the `describe` block.

```typescript
async function createNonceAccount(
  connection: Connection,
  payer: Keypair,
  nonceKeypair: Keypair,
  authority: PublicKey,
) {
  const rentExemptBalance =
    await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
  // 2. Assemble and submit a transaction that will:
  const tx = new Transaction().add(
    // 2.1. Allocate the account that will be the nonce account.
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: nonceKeypair.publicKey,
      lamports: rentExemptBalance,
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    }),
    // 2.2. Initialize the nonce account using the `SystemProgram.nonceInitialize` instruction.
    SystemProgram.nonceInitialize({
      noncePubkey: nonceKeypair.publicKey,
      authorizedPubkey: authority,
    }),
  );

  const sig = await sendAndConfirmTransaction(connection, tx, [
    payer,
    nonceKeypair,
  ]);
  console.log("Creating Nonce TX:", getExplorerLink("tx", sig, "localnet"));

  // 3. Fetch the nonce account.
  const accountInfo = await connection.getAccountInfo(nonceKeypair.publicKey);
  // 4. Serialize the nonce account data and return it.
  return NonceAccount.fromAccountData(accountInfo!.data);
}
```

### 2. Test: Create and submit a durable transaction

To create and submit a durable transaction we must follow these steps:

1. Create a Durable Transaction.
1. Create the nonce account.
1. Create a new transaction.
1. Set the `recentBlockhash` to be the nonce value.
1. Add the `nonceAdvance` instruction as the first instruction in the
   transaction.
1. Add the transfer instruction (you can add any instruction you want here).
1. Sign the transaction with the keypairs that need to sign it, and make sure to
   add the nonce authority as a signer as well.
1. Serialize the transaction and encode it.
1. At this point you have a durable transaction, you can store it in a database
   or a file or send it somewhere else, etc.
1. Submit the durable transaction.
1. Decode the serialized transaction.
1. Submit it using the `sendAndConfirmRawTransaction` function.

We can put all of this together in our first test:

```typescript
it("Creates a durable transaction and submits it", async () => {
  // Step 1: Initialize the payer
  const payer = await initializeKeypair(connection, {
    airdropAmount: AIRDROP_AMOUNT,
    minimumBalance: MINIMUM_BALANCE,
  });

  // Step 1.1: Create keypairs for nonce account and recipient
  const [nonceKeypair, recipient] = makeKeypairs(2);

  // Step 1.2: Create the nonce account
  const nonceAccount = await createNonceAccount(
    connection,
    payer,
    nonceKeypair,
    payer.publicKey,
  );

  // Step 1.3: Create a new transaction
  const durableTx = new Transaction();
  durableTx.feePayer = payer.publicKey;

  // Step 1.4: Set the recentBlockhash to the nonce value from the nonce account
  durableTx.recentBlockhash = nonceAccount.nonce;

  // Step 1.5: Add the `nonceAdvance` instruction as the first instruction
  durableTx.add(
    SystemProgram.nonceAdvance({
      authorizedPubkey: payer.publicKey,
      noncePubkey: nonceKeypair.publicKey,
    }),
  );

  // Step 1.6: Add the transfer instruction
  durableTx.add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: TRANSFER_AMOUNT,
    }),
  );

  // Step 1.7: Sign the transaction with the payer's keypair
  await durableTx.partialSign(payer);

  // Step 1.8: Serialize the transaction (base64 encoding for easier handling)
  const serializedTx = durableTx
    .serialize({ requireAllSignatures: false })
    .toString("base64");

  // Step 1.9: At this point, you can store the durable transaction for future use.
  // ------------------------------------------------------------------

  // Step 2: Submit the durable transaction

  // Step 2.1: Decode the serialized transaction
  const tx = Buffer.from(serializedTx, "base64");

  // Step 2.2: Submit the transaction using `sendAndConfirmRawTransaction`
  const sig = await sendAndConfirmRawTransaction(connection, tx, {
    skipPreflight: true,
  });

  // Step 2.3: Generate and log the explorer link using `getExplorerLink`
  console.log("Transaction Signature:", getExplorerLink("tx", sig, "localnet"));
});
```

### 3. Test: Transaction fails if the nonce has advanced

Because we are using the nonce in place of the recent blockhash, the system will
check to ensure that the nonce we provided matches the nonce in the
`nonce_account`. Additionally with each transaction, we need to add the
`nonceAdvance` instruction is the first instruction. This ensures that if the
transaction goes through, the nonce will change, and no one will be able to
submit it twice.

Here is what we'll test:

1. Create a durable transaction just like in the previous step.
2. Advance the nonce.
3. Try to submit the transaction, and it should fail.

```typescript
it("Fails if the nonce has advanced", async () => {
  try {
    const payer = await initializeKeypair(connection, {
      airdropAmount: AIRDROP_AMOUNT,
      minimumBalance: MINIMUM_BALANCE,
    });

    const [nonceKeypair, nonceAuthority, recipient] = makeKeypairs(3);

    // Step 1: Create a Durable Transaction
    const nonceAccount = await createNonceAccount(
      connection,
      payer,
      nonceKeypair,
      nonceAuthority.publicKey,
    );

    const durableTransaction = new Transaction();
    durableTransaction.feePayer = payer.publicKey;
    durableTransaction.recentBlockhash = nonceAccount.nonce;

    // Add a nonce advance instruction
    durableTransaction.add(
      SystemProgram.nonceAdvance({
        authorizedPubkey: nonceAuthority.publicKey,
        noncePubkey: nonceKeypair.publicKey,
      }),
    );

    // Add a transfer instruction
    durableTransaction.add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipient.publicKey,
        lamports: TRANSFER_AMOUNT,
      }),
    );

    // Sign the transaction with both the payer and nonce authority's keypairs
    await durableTransaction.partialSign(payer, nonceAuthority);

    // Serialize the transaction (in base64 format for simplicity)
    const serializedTransaction = durableTransaction
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    // Step 2: Advance the nonce
    const nonceAdvanceSignature = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(
        SystemProgram.nonceAdvance({
          noncePubkey: nonceKeypair.publicKey,
          authorizedPubkey: nonceAuthority.publicKey,
        }),
      ),
      [payer, nonceAuthority],
    );

    // Using getExplorerLink from solana-helpers
    console.log(
      "Nonce Advance Signature:",
      getExplorerLink("tx", nonceAdvanceSignature, "localnet"),
    );

    // Deserialize the transaction
    const deserializedTransaction = Buffer.from(
      serializedTransaction,
      "base64",
    );

    // Step 3: Try to submit the transaction, expecting it to fail due to nonce advancement
    await assert.rejects(
      sendAndConfirmRawTransaction(connection, deserializedTransaction),
    );
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
});
```

### 4. Test: Nonce account advances even if the transaction fails

An important edge case to be aware of is that even if a transaction fails for
any reason other than the nonce advance instruction, the nonce will still
advance. This feature is designed for security purposes, ensuring that once a
user signs a transaction and it fails, that durable transaction cannot be used
again.

The following code demonstrates this use case. We'll attempt to create a durable
transaction to transfer 50 SOL from the payer to the recipient. However, the
payer doesn't have enough SOL for the transfer, so the transaction will fail,
but the nonce will still advance.

```typescript
it("Advances the nonce account even if the transaction fails", async () => {
  const TRANSFER_AMOUNT = 50;
  const payer = await initializeKeypair(connection, {
    airdropAmount: 3 * LAMPORTS_PER_SOL,
    minimumBalance: 1 * LAMPORTS_PER_SOL,
  });

  // Generate keypairs for nonce account, nonce authority, and recipient
  const [nonceKeypair, nonceAuthority, recipient] = makeKeypairs(3);

  // Step 1: Create the nonce account
  const nonceAccount = await createNonceAccount(
    connection,
    payer,
    nonceKeypair,
    nonceAuthority.publicKey,
  );
  const nonceBeforeAdvancing = nonceAccount.nonce;

  console.log("Nonce Before Advancing:", nonceBeforeAdvancing);

  // Step 2: Check payer's balance to ensure it doesn't have enough to transfer
  const balance = await connection.getBalance(payer.publicKey);

  // Ensure the balance is less than the transfer amount (50 SOL)
  assert(
    balance < TRANSFER_AMOUNT * LAMPORTS_PER_SOL,
    `Balance too high! Adjust 'TRANSFER_AMOUNT' to be higher than the current balance of ${balance / LAMPORTS_PER_SOL} SOL.`,
  );

  // Step 3: Create a durable transaction that will fail
  const durableTx = new Transaction();
  durableTx.feePayer = payer.publicKey;

  // Set the recent blockhash to the nonce value from the nonce account
  durableTx.recentBlockhash = nonceAccount.nonce;

  // Step 4: Add the nonce advance instruction as the first instruction
  durableTx.add(
    SystemProgram.nonceAdvance({
      authorizedPubkey: nonceAuthority.publicKey,
      noncePubkey: nonceKeypair.publicKey,
    }),
  );

  // Step 5: Add a transfer instruction that will fail (since the payer has insufficient funds)
  durableTx.add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: TRANSFER_AMOUNT * LAMPORTS_PER_SOL,
    }),
  );

  // Step 6: Sign the transaction with both the payer and nonce authority
  durableTx.sign(payer, nonceAuthority);

  // Serialize the transaction and store or send it (if needed)
  const serializedTx = base58.encode(
    durableTx.serialize({ requireAllSignatures: false }),
  );

  const tx = base58.decode(serializedTx);

  // Step 7: Send the transaction and expect it to fail (due to insufficient funds)
  await assert.rejects(
    sendAndConfirmRawTransaction(connection, tx as Buffer, {
      skipPreflight: true, // Ensure the transaction reaches the network despite the expected failure
    }),
  );

  // Step 8: Fetch the nonce account again after the failed transaction
  const nonceAccountAfterAdvancing = await connection.getAccountInfo(
    nonceKeypair.publicKey,
  );
  const nonceAfterAdvancing = NonceAccount.fromAccountData(
    nonceAccountAfterAdvancing!.data,
  ).nonce;

  // Step 9: Verify that the nonce has advanced even though the transaction failed
  assert.notEqual(nonceBeforeAdvancing, nonceAfterAdvancing);
});
```

Notice that we are setting `skipPreflight: true` in the
`sendAndConfirmRawTransaction` function. This step is crucial because, without
it, the transaction would never reach the network. Instead, the library would
reject it and throw an error, leading to a failure where the nonce does not
advance.

However, this is not the whole story. In the upcoming test case, we'll discover
a scenario where even if the transaction fails, the nonce will not advance.

### 5. Test: Nonce account will not advance if the transaction fails because of the nonce advance instruction

For the nonce to advance, the `advanceNonce` instruction must succeed. Thus, if
the transaction fails for any reason related to this instruction, the nonce will
not advance.

A well-formatted `nonceAdvance` instruction will only ever fail if the nonce
authority did not sign the transaction.

Let's see this in action.

```typescript
it("The nonce account will not advance if the transaction fails because the nonce authority did not sign the transaction", async () => {
  // Step 1: Initialize payer with SOL airdrop
  const payer = await initializeKeypair(connection, {
    airdropAmount: 3 * LAMPORTS_PER_SOL,
    minimumBalance: 1 * LAMPORTS_PER_SOL,
  });

  // Step 2: Generate keypairs for nonce account, nonce authority, and recipient
  const [nonceKeypair, nonceAuthority, recipient] = makeKeypairs(3);

  // Step 3: Create the nonce account
  const nonceAccount = await createNonceAccount(
    connection,
    payer,
    nonceKeypair,
    nonceAuthority.publicKey,
  );
  const nonceBeforeAdvancing = nonceAccount.nonce;

  console.log("Nonce before submitting:", nonceBeforeAdvancing);

  // Step 4: Create a durable transaction that will fail (due to missing nonce authority signature)
  const durableTx = new Transaction();
  durableTx.feePayer = payer.publicKey;

  // Use the nonce account's stored nonce as the recent blockhash
  durableTx.recentBlockhash = nonceAccount.nonce;

  // Add nonce advance instruction
  durableTx.add(
    SystemProgram.nonceAdvance({
      authorizedPubkey: nonceAuthority.publicKey,
      noncePubkey: nonceKeypair.publicKey,
    }),
  );

  // Add transfer instruction
  durableTx.add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    }),
  );

  // Sign the transaction only with the payer, omitting nonce authority signature (this will cause the failure)
  durableTx.sign(payer);

  // Step 5: Serialize the transaction
  const serializedTx = base58.encode(
    durableTx.serialize({ requireAllSignatures: false }),
  );

  // Decode the serialized transaction
  const tx = base58.decode(serializedTx);

  // Step 6: Send the transaction and expect it to fail (due to missing nonce authority signature)
  await assert.rejects(
    sendAndConfirmRawTransaction(connection, tx as Buffer, {
      skipPreflight: true, // Ensure the transaction reaches the network despite the expected failure
    }),
  );

  // Step 7: Fetch the nonce account again after the failed transaction
  const nonceAccountAfterAdvancing = await connection.getAccountInfo(
    nonceKeypair.publicKey,
  );
  const nonceAfterAdvancing = NonceAccount.fromAccountData(
    nonceAccountAfterAdvancing!.data,
  ).nonce;

  // Step 8: Verify that the nonce has not advanced, as the failure was due to the nonce advance instruction
  assert.equal(nonceBeforeAdvancing, nonceAfterAdvancing);
});
```

### 6. Test sign transaction and then change nonce authority

The last test case we'll go over is creating a durable transaction. Try to send
it with the wrong nonce authority (it will fail). Change the nonce authority and
send it with the correct one this time and it will succeed.

```typescript
it("Submits after changing the nonce authority to an already signed address", async () => {
  try {
    // Step 1: Initialize payer with an airdrop
    const payer = await initializeKeypair(connection, {
      airdropAmount: AIRDROP_AMOUNT,
      minimumBalance: MINIMUM_BALANCE,
    });

    // Step 2: Generate keypairs for nonce account, nonce authority, and recipient
    const [nonceKeypair, nonceAuthority, recipient] = makeKeypairs(3);

    // Step 3: Create the nonce account
    const nonceAccount = await createNonceAccount(
      connection,
      payer,
      nonceKeypair,
      nonceAuthority.publicKey,
    );
    const nonceBeforeAdvancing = nonceAccount.nonce;

    console.log("Nonce before submitting:", nonceBeforeAdvancing);

    // Step 4: Create a durable transaction that will initially fail
    const durableTransaction = new Transaction();
    durableTransaction.feePayer = payer.publicKey;

    // Use the nonceAccount's stored nonce as the recent blockhash
    durableTransaction.recentBlockhash = nonceAccount.nonce;

    // Add nonce advance instruction
    durableTransaction.add(
      SystemProgram.nonceAdvance({
        authorizedPubkey: payer.publicKey, // should be nonce authority, will fail
        noncePubkey: nonceKeypair.publicKey,
      }),
    );

    // Add a transfer instruction
    durableTransaction.add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipient.publicKey,
        lamports: TRANSACTION_LAMPORTS,
      }),
    );

    // Sign the transaction with the payer
    durableTransaction.sign(payer);

    // Step 5: Serialize and store the transaction
    const serializedTransaction = base58.encode(
      durableTransaction.serialize({ requireAllSignatures: false }),
    );

    const deserializedTx = base58.decode(serializedTransaction);

    // Step 6: Attempt to send the transaction, expect it to fail (due to incorrect authority)
    await assert.rejects(
      sendAndConfirmRawTransaction(connection, deserializedTx as Buffer, {
        skipPreflight: true, // Ensures the transaction hits the network despite failure
      }),
    );

    // Step 7: Verify that the nonce did not advance after the failed transaction
    const nonceAccountAfterAdvancing = await connection.getAccountInfo(
      nonceKeypair.publicKey,
    );
    const nonceAfterAdvancing = NonceAccount.fromAccountData(
      nonceAccountAfterAdvancing!.data,
    ).nonce;
    assert.equal(nonceBeforeAdvancing, nonceAfterAdvancing);

    // Step 8: Change the nonce authority to the payer
    const nonceAuthSignature = await sendAndConfirmTransaction(
      connection,
      new Transaction().add(
        SystemProgram.nonceAuthorize({
          noncePubkey: nonceKeypair.publicKey,
          authorizedPubkey: nonceAuthority.publicKey,
          newAuthorizedPubkey: payer.publicKey, // changing authority to payer
        }),
      ),
      [payer, nonceAuthority],
    );

    console.log(
      "Nonce Auth Signature:",
      getExplorerLink("tx", nonceAuthSignature, "localnet"),
    );

    // Step 9: Submit the transaction again, which should now succeed
    const transactionSignature = await sendAndConfirmRawTransaction(
      connection,
      deserializedTx as Buffer,
      {
        skipPreflight: true, // Ensures submission without preflight checks
      },
    );

    console.log(
      "Transaction Signature:",
      getExplorerLink("tx", transactionSignature, "localnet"),
    );
  } catch (error) {
    console.error("Test failed:", error);
    throw error;
  }
});
```

### 8. Run the tests

Finally, let's run the tests:

```bash
npm start
```

Ensure that all tests pass successfully.

For your reference, here is a screenshot showing the successful execution of the
tests:

![image](https://github.com/user-attachments/assets/03b2396a-f146-49e2-872b-6a657a209cd4)

If you see this result, it means your durable nonce implementation is correct!

Congratulations! You now know how durable nonces work!

## Challenge

Write a program that creates a durable transaction and saves it to a file, then
create a separate program that reads the durable transaction file and sends it
to the network.
