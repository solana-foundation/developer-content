---
title: Durable Nonces
objectives:
  - Explain the differences between durable transactions and regular
    transactions.
  - Create and submit durable transactions.
  - Handle edge cases that may occur with durable transactions.
description:
  "Learn how to use durable nonces to sign transactions ahead of time."
---

## Summary

- **Durable transactions** have no expiration, unlike regular transactions,
  which expire after 150 blocks (~80-90 seconds).
- Once signed, a durable transaction can be stored in a database, or file, or
  sent to another device for later submission.
- A durable transaction is created using a **nonce account**, which holds the
  nonce value and authority, replacing the recent blockhash in the transaction.
- Durable transactions must begin with an `advanceNonce` instruction, and the
  nonce authority must be a signer in the transaction.
- If the transaction fails for any reason other than the `advanceNonce`
  instruction, the nonce will still advance, but all other instructions will
  revert.

## Overview

**Durable Nonces** provide a way to bypass the expiration of regular
transactions. To understand this, let's first review the components of a regular
transaction.

In Solana, transactions consist of three main parts:

1. **Instructions**: Operations to perform on the blockchain, such as
   transferring tokens, creating accounts, or calling a program. These are
   executed sequentially.
2. **Signatures**: Proof that the transaction was signed by the required signers
   or authorities. For example, transferring SOL from your wallet requires your
   signature to verify the transaction's validity.
3. **Recent Blockhash**: A unique identifier used to prevent replay attacks,
   ensuring that a transaction is unique and can only be submitted once. A
   recent blockhash is valid for only 150 blocks.

In **durable transactions**, the first two components remain the same, but the
handling of recent blockhashes changes.

### The Role of the Recent Blockhash

The recent blockhash ensures that a transaction is submitted within a limited
time frame (about 80-90 seconds or 150 blocks). This helps prevent
[double-spending](/content/guides/advanced/introduction-to-durable-nonces.md#double-spend),
where an attacker could replay a transaction to charge a user multiple times.

For example, if you're buying an NFT on a marketplace like MagicEden or Tensor,
you sign a transaction allowing the program to withdraw SOL from your wallet.
Without protection, the marketplace could accidentally or maliciously resubmit
the transaction, charging you twice. This is known as the **double-spend
problem**.

Solana addresses this by using a **recent blockhash**. A recent blockhash is a
32-byte SHA-256 hash of a valid block's last
[entry id](https://solana.com/docs/terminology#blockhash) within the last 150
blocks. When you sign a transaction, it includes this blockhash, proving the
signature is recent.

### How Solana Validators Process Transactions

When a transaction is submitted, Solana validators:

1. Check if the transaction signature was submitted within the last 150 blocks.
   If a duplicate signature is found, the transaction fails.
2. If no duplicate exists, the validator checks whether the recent blockhash
   exists within the last 150 blocks. If not, a "Blockhash not found" error
   occurs. If valid, the transaction proceeds to execution.

While this works well in most cases, it limits transaction submission to 90
seconds. However, some scenarios require more time, which is where **durable
transactions** come into play.

From the
[Durable Nonce guide](/content/guides/advanced/introduction-to-durable-nonces.md#durable-nonce-applications):

> 1. **Scheduled Transactions**: One of the most apparent applications of
>    Durable Nonces is the ability to schedule transactions. Users can pre-sign
>    a transaction and then submit it at a later date, allowing for planned
>    transfers, contract interactions, or even executing pre-determined
>    investment strategies.
> 2. **Multisig Wallets**: Durable Nonces are very useful for multi-signature
>    wallets where one party signs a transaction, and others may confirm at a
>    later time. This feature enables the proposal, review, and later execution
>    of a transaction within a trustless system.
> 3. **Programs Requiring Future Interaction**: If a program on Solana requires
>    interaction at a future point (such as a vesting contract or a timed
>    release of funds), a transaction can be pre-signed using a Durable Nonce.
>    This ensures the contract interaction happens at the correct time without
>    necessitating the presence of the transaction creator.
> 4. **Cross-chain Interactions**: When you need to interact with another
>    blockchain, and it requires waiting for confirmations, you could sign the
>    transaction with a Durable Nonce and then execute it once the required
>    confirmations are received.
> 5. **Decentralized Derivatives Platforms**: In a decentralized derivatives
>    platform, complex transactions might need to be executed based on specific
>    triggers. With Durable Nonces, these transactions can be pre-signed and
>    executed when the trigger condition is met.

### Considerations

Durable transactions must be used carefully, as it's crucial to trust the
transactions you sign.

For example, imagine you unknowingly signed a malicious durable transaction.
This transaction could withdraw 500 SOL to an attacker's account and transfer
nonce authority to them. Even if you don't have 500 SOL now, the attacker could
wait until your balance reaches that amount before executing the transaction. It
could stay dormant for days, weeks, or even years, without you recalling what
you signed.

This is not meant to cause alarm, but it's a reminder of the importance of
protecting your wallet. Only keep what you're willing to lose in hot wallets,
and avoid signing unknown transactions with your cold wallet.

### Using durable nonces to extend the lifespan of transactions

Durable nonces allow you to sign transactions offchain and store them until they
are ready to be submitted to the network. This makes it possible to create
**durable transactions** that don't expire like regular transactions.

A durable nonce is a 32-byte value (often represented as a base58-encoded
string) used instead of a recent blockhash to ensure each transaction is unique,
preventing double-spending while removing the time limit on unexecuted
transactions.

When using a nonce in place of a recent blockhash, the transaction must begin
with a `nonceAdvance` instruction, which updates the nonce to ensure that each
signed transaction remains unique.

Durable nonces depend on
[unique Solana mechanisms](https://docs.solanalabs.com/implemented-proposals/durable-tx-nonces)
to function, which come with specific rules. We'll explore these in more detail
in the technical section.

### Durable nonces in-depth

Durable transactions differ from regular transactions in these key ways:

1. **Durable nonces** replace the recent blockhash with a nonce stored in a
   `nonce account`. This nonce is a unique blockhash, used once per transaction.
2. Each durable transaction must begin with a **`nonce advance instruction`**,
   which updates the nonce in the `nonce account`, ensuring it remains unique
   and cannot be reused in another transaction.

The `nonce account` holds the following values:

1. **nonce value**: The nonce that will be used in the transaction.
2. **authority**: The public key that has the authority to update the nonce.
3. **fee calculator**: The fee structure used for the transaction.

Each durable transaction must start with a **`nonce advance instruction`**, and
the authority must be a signer.

One special rule applies: If a durable transaction fails due to any instruction
other than the `nonce advance instruction`, the nonce will still be updated, but
the rest of the transaction will be rolled back. This behavior is unique to
durable nonces.

### Durable nonce operations

The `@solana/web3.js` package provides several helper functions and constants
for managing durable nonces:

1. **`SystemProgram.nonceInitialize`**: Initializes a new nonce account.
2. **`SystemProgram.nonceAdvance`**: Advances the nonce in the nonce account.
3. **`SystemProgram.nonceWithdraw`**: Withdraws funds from the nonce account. To
   delete a nonce account, all funds must be withdrawn.
4. **`SystemProgram.nonceAuthorize`**: Changes the authority of the nonce
   account.
5. **`NONCE_ACCOUNT_LENGTH`**: Constant that defines the length of the nonce
   account data.
6. **`NonceAccount`**: Class that represents a nonce account. It includes the
   static method `fromAccountData`, which converts nonce account data into a
   `NonceAccount` object.

We'll explore each helper function in more detail.

#### Using nonceInitialize

The `nonceInitialize` instruction creates a new nonce account and requires two
parameters:

1. `noncePubkey`: The public key of the nonce account.
2. `authorizedPubkey`: The public key of the authority of the nonce account.

Here’s an example:

```typescript
// 1. Generate or get keypairs for the nonce account and its authority.
const [nonceKeypair, nonceAuthority] = makeKeypairs(2); // from '@solana-developers/helpers'

const tx = new Transaction().add(
  // 2. Allocate the account and transfer the minimum funds required (0.0015 SOL).
  SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: nonceKeypair.publicKey,
    lamports: 0.0015 * LAMPORTS_PER_SOL,
    space: NONCE_ACCOUNT_LENGTH,
    programId: SystemProgram.programId,
  }),
  // 3. Initialize the nonce account with `SystemProgram.nonceInitialize`.
  SystemProgram.nonceInitialize({
    noncePubkey: nonceKeypair.publicKey,
    authorizedPubkey: nonceAuthority.publicKey,
  }),
);

// Send the transaction.
await sendAndConfirmTransaction(connection, tx, [payer, nonceKeypair]);
```

The system program handles setting the nonce value within the nonce account.

#### nonceAdvance

The `nonceAdvance` instruction changes the nonce value in the nonce account. It
requires two parameters:

1. `noncePubkey`: The public key of the nonce account.
2. `authorizedPubkey`: The public key of the authority of the nonce account.

Here’s an example:

```typescript
const instruction = SystemProgram.nonceAdvance({
  authorizedPubkey: nonceAuthority.publicKey,
  noncePubkey: nonceKeypair.publicKey,
});
```

This instruction is typically the first one in any durable transaction. However,
you can call it at any time, and it will automatically invalidate any durable
transaction tied to the previous nonce value.

#### nonceWithdraw

This instruction is used to withdraw the funds from the nonce account. It takes
four parameters:

1. `noncePubkey`: The public key of the nonce account.
2. `toPubkey`: The public key of the account that will receive the funds.
3. `lamports`: The amount of lamports to be withdrawn.
4. `authorizedPubkey`: The public key of the authority of the nonce account.

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

#### nonceAuthorize

This instruction is used to change the authority of the nonce account. It takes
three parameters:

1. `noncePubkey`: The public key of the nonce account.
2. `authorizedPubkey`: The public key of the current authority of the nonce
   account.
3. `newAuthorizedPubkey`: The public key of the new authority of the nonce
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

1. Use the nonce value as a replacement for the recent blockhash.
2. Add the `nonceAdvance` instruction as the first instruction in the
   transaction.
3. Sign the transaction with the authority of the nonce account.

After building and signing the transaction, we can serialize it, encode it into
a base58 string, and store this string somewhere to submit it later.

```typescript
// Assemble the durable transaction
const durableTx = new Transaction();
durableTx.feePayer = payer.publicKey;

// Use the nonceAccount's stored nonce as the recentBlockhash
durableTx.recentBlockhash = nonceAccount.nonce;

// Make a nonce advance instruction
durableTx.add(
  SystemProgram.nonceAdvance({
    authorizedPubkey: nonceAuthority.publicKey,
    noncePubkey: nonceKeypair.publicKey,
  }),
);

// Add any instructions you want to the transaction, in this case, we are just doing a transfer
durableTx.add(
  SystemProgram.transfer({
    fromPubkey: payer.publicKey,
    toPubkey: recipient.publicKey,
    lamports: 0.1 * LAMPORTS_PER_SOL,
  }),
);

// Sign the transaction with the nonce authority's keypair
durableTx.sign(payer, nonceAuthority);

// Once you have the signed transaction, you can serialize it and store it in a database, or send it to another device.
// You can submit it at a later point.
const serializedTx = base58.encode(
  durableTx.serialize({ requireAllSignatures: false }),
);
```

#### Submitting a durable transaction

Now that we have a base58 encoded transaction, we can decode it and submit it:

```typescript
const tx = base58.decode(serializedTx);
const sig = await sendAndConfirmRawTransaction(connection, tx as Buffer);
```

### Some important edge cases

There are a few things to consider when dealing with durable transactions:

1. If the transaction fails due to an instruction other than the nonce advance
   instruction.
2. If the transaction fails due to the nonce advance instruction.

#### If the transaction fails due to an instruction other than the nonce advance instruction

In normal failing transactions, all the instructions will revert to the original
state. However, in the case of a durable transaction, if any instruction fails
that is not the nonce advance instruction, the nonce will still advance, and all
other instructions will be reverted.

This feature is designed for security, ensuring that once a user signs a
transaction, if it fails, it cannot be reused. Presigned, never-expiring durable
transactions can be dangerous in some scenarios. This extra safety feature
effectively "voids" the transaction if handled incorrectly.

#### If the transaction fails due to the nonce advance instruction

If a transaction fails because of the `advanceNonce` instruction, the entire
transaction is reverted, and the nonce will not advance.

## Lab

In this lab, we'll learn how to create a durable transaction. We'll focus on
what you can and can't do with it, and also cover some edge cases and how to
handle them effectively.

### 1. Getting started

Let's go ahead and clone our starter code.

```bash
git clone https://github.com/Unboxed-Software/solana-lab-durable-nonces
cd solana-lab-durable-nonces
git checkout starter
npm install
```

In the starter code, you'll find a `test/index.ts` file containing a testing
skeleton where we'll write all of our test code.

We'll use the local validator for this lab, but you're welcome to use the devnet
if you prefer. If you encounter any issues with airdrops on devnet, check out
[Solana's Faucet](https://faucet.solana.com/).

To run the local validator, ensure it is installed. If you haven't done this
yet, refer to [installing the Solana CLI](/docs/intro/installation.md). Once
installed, you'll have access to the `solana-test-validator`.

In a separate terminal, run:

```bash
solana-test-validator
```

In `test/index.ts` you'll see five tests, these will help us understand durable
nonces better.

We'll discuss each test case in depth.

### 2. Create the Nonce Account

Before we write any tests, let's create a helper function above the `describe`
block, called `createNonceAccount`.

It will take the following parameters:

- `Connection`: The connection to use.
- `payer`: The payer.
- `nonceKeypair`: The nonce keypair.
- `authority`: Authority over the nonce.

It will:

1. Assemble and submit a transaction that will:
   1. Allocate the account that will serve as the nonce account.
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
): Promise<NonceAccount> {
  // Assemble and submit a transaction that will:
  const transaction = new Transaction().add(
    // 1. Allocate the account that will be the nonce account.
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: nonceKeypair.publicKey,
      lamports:
        await connection.getMinimumBalanceForRentExemption(
          NONCE_ACCOUNT_LENGTH,
        ),
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    }),
    // 2. Initialize the nonce account using the `SystemProgram.nonceInitialize` instruction.
    SystemProgram.nonceInitialize({
      noncePubkey: nonceKeypair.publicKey,
      authorizedPubkey: authority,
    }),
  );

  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, nonceKeypair],
  );
  console.log(
    "Verify transaction details for creating nonce account ",
    getExplorerLink("transaction", transactionSignature, "localnet"),
  );

  // Fetch and return the nonce account.
  const accountInfo = await connection.getAccountInfo(nonceKeypair.publicKey);
  return NonceAccount.fromAccountData(accountInfo!.data);
}
```

### 3. Test: Create and submit a durable transaction

To create and submit a durable transaction we must follow these steps:

1. Set up the environment (create payer, airdrop SOL if needed)
2. Create a nonce account
3. Create a new Transaction object
4. Set the transaction's feePayer
5. Set the transaction's recentBlockhash to the nonce value
6. Add the nonceAdvance instruction as the first instruction in the transaction
7. Add the transfer instruction (or any other desired instruction)
8. Sign the transaction with the necessary keypair(s)
9. Serialize the transaction
10. Get the current slot number
11. Send the raw transaction to get a transaction signature
12. Create a DurableNonceTransactionConfirmationStrategy object
13. Confirm the transaction using the confirmation strategy
14. Verify the transaction was successful

We can put all of this together in our first test:

```typescript
it("creates and submits a durable transaction successfully", async () => {
  const payer = await initializeKeypair(connection);
  await airdropIfRequired(
    connection,
    payer.publicKey,
    AIRDROP_AMOUNT,
    MINIMUM_BALANCE,
  );

  const [nonceKeypair, recipient] = [Keypair.generate(), Keypair.generate()];

  // Create the nonce account
  const nonceAccount = await createNonceAccount(
    connection,
    payer,
    nonceKeypair,
    payer.publicKey,
  );

  // Create a durable transaction
  const durableTransaction = new Transaction();
  durableTransaction.feePayer = payer.publicKey;
  durableTransaction.recentBlockhash = nonceAccount.nonce;

  // Add the `nonceAdvance` instruction as the first instruction in the transaction
  durableTransaction.add(
    SystemProgram.nonceAdvance({
      authorizedPubkey: payer.publicKey,
      noncePubkey: nonceKeypair.publicKey,
    }),
  );

  // Add the transfer instruction
  durableTransaction.add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: TRANSFER_AMOUNT,
    }),
  );

  // Sign the transaction
  durableTransaction.sign(payer);

  try {
    // Get the current slot to use as minContextSlot
    const slot = await connection.getSlot();

    // Send the transaction first to get the signature
    const transactionSignature = await connection.sendRawTransaction(
      durableTransaction.serialize(),
      {
        skipPreflight: true,
      },
    );

    // Create the confirmation strategy
    const confirmationStrategy: DurableNonceTransactionConfirmationStrategy = {
      signature: transactionSignature,
      minContextSlot: slot,
      nonceAccountPubkey: nonceKeypair.publicKey,
      nonceValue: nonceAccount.nonce,
    };

    // Confirm the durable transaction
    await connection.confirmTransaction(confirmationStrategy);
    console.log(
      "Verify transaction details - ",
      getExplorerLink("transaction", transactionSignature, "localnet"),
    );
    assert.ok(transactionSignature, "Transaction should be successful");
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(`Failed to submit durable transaction: ${error.message}`);
    } else {
      throw new Error(`Failed to submit durable transaction: Unknown error`);
    }
  }
});
```

### 4. Test: Transaction fails if the nonce has advanced

Since we're using the nonce instead of a recent blockhash, the system will
verify that the nonce in the transaction matches the one in the `nonce_account`.
Each transaction must begin with the `nonceAdvance` instruction to ensure that
once the transaction succeeds, the nonce changes and can't be reused.

Here's the test plan:

1. Create a durable transaction as in the previous step.
2. Advance the nonce.
3. Attempt to submit the transaction—it should fail.

```typescript
it("fails when attempting to use an advanced nonce", async () => {
  const payer = await initializeKeypair(connection);
  await airdropIfRequired(
    connection,
    payer.publicKey,
    AIRDROP_AMOUNT,
    MINIMUM_BALANCE,
  );

  const [nonceKeypair, nonceAuthority, recipient] = [
    Keypair.generate(),
    Keypair.generate(),
    Keypair.generate(),
  ];

  // Create the nonce account
  const nonceAccount = await createNonceAccount(
    connection,
    payer,
    nonceKeypair,
    nonceAuthority.publicKey,
  );

  // Create a durable transaction
  const durableTransaction = new Transaction();
  durableTransaction.feePayer = payer.publicKey;
  durableTransaction.recentBlockhash = nonceAccount.nonce;

  durableTransaction.add(
    SystemProgram.nonceAdvance({
      authorizedPubkey: nonceAuthority.publicKey,
      noncePubkey: nonceKeypair.publicKey,
    }),
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: TRANSFER_AMOUNT,
    }),
  );

  durableTransaction.sign(payer, nonceAuthority);

  // Advance the nonce
  try {
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(
        SystemProgram.nonceAdvance({
          noncePubkey: nonceKeypair.publicKey,
          authorizedPubkey: nonceAuthority.publicKey,
        }),
      ),
      [payer, nonceAuthority],
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to advance nonce: ${error.message}`);
    } else {
      throw new Error(`Failed to advance nonce: Unknown error`);
    }
  }

  // Try to submit the transaction, and it should fail
  try {
    const slot = await connection.getSlot();
    const transactionSignature = await connection.sendRawTransaction(
      durableTransaction.serialize(),
      {
        skipPreflight: true,
      },
    );

    const confirmationStrategy: DurableNonceTransactionConfirmationStrategy = {
      signature: transactionSignature,
      minContextSlot: slot,
      nonceAccountPubkey: nonceKeypair.publicKey,
      nonceValue: nonceAccount.nonce,
    };

    await connection.confirmTransaction(
      confirmationStrategy,
      CONFIRMATION_COMMITMENT,
    );
    console.log(
      "Verify transaction details - ",
      getExplorerLink("transaction", transactionSignature, "localnet"),
    );
    assert.fail("Transaction should have failed");
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
    assert.ok(error, "Transaction should fail due to advanced nonce");
  }
});
```

### 5. Test: Nonce account advances even if the transaction fails

A key edge case to consider is that even if a transaction fails for reasons
unrelated to the `nonceAdvance` instruction, the nonce will still advance. This
security feature ensures that once a user signs a transaction and it fails, that
durable transaction can't be reused.

In this test, we'll create a durable transaction to transfer more SOL than the
payer's balance from the payer to the recipient. Since the payer lacks
sufficient SOL for the transfer, the transaction will fail, but the nonce will
still advance.

```typescript
it("advances the nonce account even when the transaction fails", async () => {
  const payer = await initializeKeypair(connection);
  await airdropIfRequired(
    connection,
    payer.publicKey,
    AIRDROP_AMOUNT,
    MINIMUM_BALANCE,
  );

  const [nonceKeypair, nonceAuthority, recipient] = [
    Keypair.generate(),
    Keypair.generate(),
    Keypair.generate(),
  ];

  // Create the nonce account
  const nonceAccount = await createNonceAccount(
    connection,
    payer,
    nonceKeypair,
    nonceAuthority.publicKey,
  );
  const nonceBeforeAdvancing = nonceAccount.nonce;

  const balanceBefore = await connection.getBalance(payer.publicKey);

  // Create a durable transaction that will fail (transferring more than the balance)
  const durableTransaction = new Transaction();
  durableTransaction.feePayer = payer.publicKey;
  durableTransaction.recentBlockhash = nonceAccount.nonce;

  durableTransaction.add(
    SystemProgram.nonceAdvance({
      authorizedPubkey: nonceAuthority.publicKey,
      noncePubkey: nonceKeypair.publicKey,
    }),
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: balanceBefore + LAMPORTS_PER_SOL, // Intentionally more than the balance
    }),
  );

  durableTransaction.sign(payer, nonceAuthority);

  try {
    const slot = await connection.getSlot();
    const transactionSignature = await connection.sendRawTransaction(
      durableTransaction.serialize(),
      {
        skipPreflight: true,
      },
    );

    const confirmationStrategy: DurableNonceTransactionConfirmationStrategy = {
      signature: transactionSignature,
      minContextSlot: slot,
      nonceAccountPubkey: nonceKeypair.publicKey,
      nonceValue: nonceAccount.nonce,
    };

    // When `skipPreflight` is enabled, the transaction is sent directly to the network without any client-side checks, including balance checks.
    // This means that the transaction will be processed by the network, and the nonce will be advanced, even if the transfer itself fails due to insufficient funds.
    await connection.confirmTransaction(
      confirmationStrategy,
      CONFIRMATION_COMMITMENT,
    );
    console.log(
      "Verify transaction details - ",
      getExplorerLink("transaction", transactionSignature, "localnet"),
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error:", error.message);
    }
    assert.ok(error, "Transaction should fail due to insufficient funds");
  }

  // Check if the nonce has advanced
  const updatedNonceAccount = await connection.getNonce(nonceKeypair.publicKey);
  assert.notEqual(
    nonceBeforeAdvancing,
    updatedNonceAccount?.nonce,
    "Nonce should have advanced",
  );
});
```

<Callout>

Notice that we are setting `skipPreflight: true` in the `sendRawTransaction`
function. This step is crucial because, without it, the transaction would never
reach the network. Instead, the library would reject it and throw an error,
leading to a failure where the nonce does not advance. </Callout>

However, this is not the whole story. In the upcoming test case, we'll discover
a scenario where even if the transaction fails, the nonce will not advance.

### 6. Test: Nonce account will not advance if the transaction fails due to the Nonce Advance Instruction

For the nonce to advance, the `advanceNonce` instruction must succeed. Thus, if
the transaction fails for any reason related to this instruction, the nonce will
not advance.

A well-formatted `nonceAdvance` instruction will only fail if the nonce
authority did not sign the transaction.

Let's see this in action.

```typescript
it("does not advance the nonce account when the nonce authority fails to sign", async () => {
  const payer = await initializeKeypair(connection);
  await airdropIfRequired(
    connection,
    payer.publicKey,
    AIRDROP_AMOUNT,
    MINIMUM_BALANCE,
  );

  const [nonceKeypair, nonceAuthority, recipient] = [
    Keypair.generate(),
    Keypair.generate(),
    Keypair.generate(),
  ];

  // Create the nonce account
  const nonceAccount = await createNonceAccount(
    connection,
    payer,
    nonceKeypair,
    nonceAuthority.publicKey,
  );
  const nonceBeforeAdvancing = nonceAccount.nonce;

  // Create a durable transaction
  const durableTransaction = new Transaction();
  durableTransaction.feePayer = payer.publicKey;
  durableTransaction.recentBlockhash = nonceAccount.nonce;

  durableTransaction.add(
    SystemProgram.nonceAdvance({
      authorizedPubkey: nonceAuthority.publicKey,
      noncePubkey: nonceKeypair.publicKey,
    }),
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: TRANSFER_AMOUNT,
    }),
  );

  // Intentionally not signing with nonceAuthority
  durableTransaction.sign(payer);

  try {
    const slot = await connection.getSlot();
    const transactionSignature = await connection.sendRawTransaction(
      durableTransaction.serialize(),
      {
        skipPreflight: true,
      },
    );

    const confirmationStrategy: DurableNonceTransactionConfirmationStrategy = {
      signature: transactionSignature,
      minContextSlot: slot,
      nonceAccountPubkey: nonceKeypair.publicKey,
      nonceValue: nonceAccount.nonce,
    };

    await connection.confirmTransaction(
      confirmationStrategy,
      CONFIRMATION_COMMITMENT,
    );
    console.log(
      "Verify transaction details - ",
      getExplorerLink("transaction", transactionSignature, "localnet"),
    );
    assert.fail("Transaction should have failed");
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
    assert.ok(
      error,
      "Transaction should fail due to missing nonce authority signature",
    );
  }

  // Check if the nonce has remained the same
  const updatedNonceAccount = await connection.getNonce(nonceKeypair.publicKey);
  assert.equal(
    nonceBeforeAdvancing,
    updatedNonceAccount?.nonce,
    "Nonce should not have advanced",
  );
});
```

### 7. Test: Sign transaction and then change Nonce Authority

The last test case we'll go over involves creating a durable transaction and
attempting to send it with the wrong nonce authority, which will cause it to
fail. After changing the nonce authority, we'll attempt to send the transaction
again with the correct authority, and this time it will succeed.

```typescript
it("submits successfully after changing the nonce authority to a pre-signed address", async () => {
  const payer = await initializeKeypair(connection);
  await airdropIfRequired(
    connection,
    payer.publicKey,
    AIRDROP_AMOUNT,
    MINIMUM_BALANCE,
  );

  const [nonceKeypair, initialNonceAuthority, recipient] = [
    Keypair.generate(),
    Keypair.generate(),
    Keypair.generate(),
  ];

  // Create the nonce account
  const nonceAccount = await createNonceAccount(
    connection,
    payer,
    nonceKeypair,
    initialNonceAuthority.publicKey,
  );

  // Create a durable transaction
  const durableTransaction = new Transaction();
  durableTransaction.feePayer = payer.publicKey;
  durableTransaction.recentBlockhash = nonceAccount.nonce;

  durableTransaction.add(
    SystemProgram.nonceAdvance({
      authorizedPubkey: payer.publicKey, // New nonce authority
      noncePubkey: nonceKeypair.publicKey,
    }),
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: recipient.publicKey,
      lamports: TRANSFER_AMOUNT,
    }),
  );

  durableTransaction.sign(payer);

  // Change nonce authority
  try {
    await sendAndConfirmTransaction(
      connection,
      new Transaction().add(
        SystemProgram.nonceAuthorize({
          noncePubkey: nonceKeypair.publicKey,
          authorizedPubkey: initialNonceAuthority.publicKey,
          newAuthorizedPubkey: payer.publicKey,
        }),
      ),
      [payer, initialNonceAuthority],
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to change nonce authority: ${error.message}`);
    } else {
      throw new Error(`Failed to change nonce authority: Unknown error`);
    }
  }

  // Submit the durable transaction
  try {
    // Get the current slot to use as minContextSlot
    const slot = await connection.getSlot();

    // Send the transaction first to get the signature
    const transactionSignature = await connection.sendRawTransaction(
      durableTransaction.serialize(),
      {
        skipPreflight: true,
      },
    );

    // Create the confirmation strategy
    const confirmationStrategy: DurableNonceTransactionConfirmationStrategy = {
      signature: transactionSignature,
      minContextSlot: slot,
      nonceAccountPubkey: nonceKeypair.publicKey,
      nonceValue: nonceAccount.nonce,
    };

    // Confirm the durable transaction
    await connection.confirmTransaction(
      confirmationStrategy,
      CONFIRMATION_COMMITMENT,
    );
    console.log(
      "Verify transaction details - ",
      getExplorerLink("transaction", transactionSignature, "localnet"),
    );
    assert.ok(
      transactionSignature,
      "Transaction should be successful after changing nonce authority",
    );
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      throw new Error(
        `Failed to submit transaction after changing nonce authority: ${error.message}`,
      );
    } else {
      throw new Error(
        `Failed to submit transaction after changing nonce authority: Unknown error`,
      );
    }
  }
});
```

### 8. Run the tests

Finally, let's run the tests:

```bash
npm start
```

Make sure all the tests pass. If successful, you should see an output similar to
this:

```bash
  Durable Nonce Transactions
Verify transaction details for creating nonce account  https://explorer.solana.com/tx/uzRWPu2PuWT3mYdfeEHp96MmiuNu4PG7UUPduLRvqqWKPkD3VeNBDnXwYWLV95gpa1jBAK3J16Kf2D65cvzJ9pk?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
Verify transaction details -  https://explorer.solana.com/tx/3WfqizMuu4Rey6YzopK5t7AzaPka62ieZuLZX1rmeJqtWG4rXcJNyLQmFswY5s6gDTy4PbVauSZn3XNs8wxKEA6N?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
    ✔ creates and submits a durable transaction successfully (15185ms)
Verify transaction details for creating nonce account  https://explorer.solana.com/tx/5wd1bACLK2GGPoivYX8o18criFuJ5QdnUYVwUDyxrd8zifR758qEKp1e2BSNPW4baGKaxNsQk3AX9EyjwnfEE6sc?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
Signature 3F9FEnaqUAkBNf2b7ked23h2YR4VhjEN1s4q8XQXeuRVCFbSYzXUuyPkxfd5Z37VKHPMnBh33PfkijUKGW2MBBBo has expired: the nonce is no longer valid.
    ✔ fails when attempting to use an advanced nonce (15164ms)
Verify transaction details for creating nonce account  https://explorer.solana.com/tx/3B7WTwz97AuTY4YXzoXFbPeGg8wThyvV2McVih2FYeKUJJ6jDUAxQTF1dNErDGocXhR9JS5GnLvs6Mo6N4HCeGrL?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
Verify transaction details -  https://explorer.solana.com/tx/wzefPnqPdBVYesxdtnyVgAh5vNVkMBfzbZmf6JXL8fpyuzYQuk7EQ7JhPT3sQGB3XgHR63H9RzNDV7pFSkFhueG?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
    ✔ advances the nonce account even when the transaction fails (15157ms)
Verify transaction details for creating nonce account  https://explorer.solana.com/tx/4XhUAtBHr3daKt15tUCjRFGtYVyUgAQ1eTZn1WZ7uBk4xt2MgRQcuNvcWYqnCLGtweGsmeRPpxt94m7kV7Zwbdk3?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
Signature verification failed.
Missing signature for public key [`F2QSwkvVvPYkj5CJaSy9CF5ztkxZJmvHFKK5r4JxdQQy`].
    ✔ does not advance the nonce account when the nonce authority fails to sign (14793ms)
Verify transaction details for creating nonce account  https://explorer.solana.com/tx/Lcvw4LQYFZTayAh1cjPyEazCEm4P9W2K32WNtNYcTtWAmaweWyJJUJfPjKhYiWQcNGeLtKsnn2iALYUmPZuWoZ3?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
Verify transaction details -  https://explorer.solana.com/tx/4TRe5sgbKNv1m25P5u7MvBmNL1UciaLeK2Qd8fDmEwbUTAsVY3dBKX7oZun27uLAMdA5DZ64jpxsZLcJw3jq96Fi?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
    ✔ submits successfully after changing the nonce authority to a pre-signed address (15603ms)


  5 passing (1m)
```

Congratulations! You now know how durable nonces work! If you need more time
with the concepts from this lesson or got stuck along the way, feel free to take
a look at the
[solution code in `new-solution` branch of this repository](https://github.com/Unboxed-Software/solana-lab-durable-nonces/tree/new-solution).

## Challenge

Write a program that creates a durable transaction and saves it to a file, then
create a separate program that reads the durable transaction file and sends it
to the network.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=ade5d386-809f-42c2-80eb-a6c04c471f53)!
</Callout>
