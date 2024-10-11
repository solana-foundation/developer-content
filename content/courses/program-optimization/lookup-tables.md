---
title: Versioned Transactions and Lookup Tables
objectives:
  - Create versioned transactions
  - Create lookup tables
  - Extend lookup tables
  - Use lookup tables with versioned transactions
description: "Use large amounts of accounts by using lookup tables."
---

## Summary

- **Versioned Transactions** in Solana allows support for both legacy and newer
  transaction formats. The original format is referred to as "legacy," while new
  formats begin at version 0. Versioned transactions were introduced to
  accommodate the use of Address Lookup Tables (LUTs).
- **Address Lookup Tables** are special accounts that store the addresses of
  other accounts. In versioned transactions, these addresses can be referenced
  by a 1-byte index instead of the full 32-byte address. This optimization
  enables more complex transactions than previously possible.

## Lesson

By design, Solana transactions are limited to 1232 bytes. Transactions exceeding
this limit will fail, which restricts the size of atomic operations that can be
performed. While this limit allows for optimizations at the network level, it
imposes restrictions on transaction complexity.

To address transaction size limitations, Solana introduced a new transaction
format supporting multiple versions. Currently, two transaction versions are
supported:

1. `legacy` - The original transaction format
2. `0` - The latest format, which supports Address Lookup Tables.

Existing Solana programs do not require changes to support versioned
transactions. However, client-side code created prior to their introduction
should be updated. In this lesson, we'll cover the basics of versioned
transactions and how to use them, including:

- Creating versioned transactions
- Creating and managing lookup tables
- Using lookup tables in versioned transactions

### Versioned Transactions

In Solana transactions, one of the largest space consumers is account addresses,
which are 32 bytes each. For transactions with 39 accounts, the size limit is
exceeded even before accounting for instruction data. Typically, transactions
become too large with around 20 accounts.

Versioned transactions address this issue by introducing Address Lookup Tables,
which allow addresses to be stored separately and referenced via a 1-byte index.
This greatly reduces transaction size by minimizing the space needed for account
addresses.

Even if Address Lookup Tables are not required for your use case, understanding
versioned transactions is crucial for maintaining compatibility with the latest
Solana features. The `@solana/web3.js` library provides all necessary tools to
work with versioned transactions and lookup tables.

#### Create versioned transactions

To create a versioned transaction, you first create a `TransactionMessage` with
the following parameters:

- `payerKey` - the public key of the account that will pay for the transaction
- `recentBlockhash` - a recent blockhash from the network
- `instructions` - the instructions to be executed in the transaction.

Once the message object is created, you can convert it into a version `0`
transaction using the `compileToV0Message()` method.

```typescript
import * as web3 from "@solana/web3.js";

// Example transfer instruction
const transferInstruction = SystemProgram.transfer({
  fromPubkey: payer.publicKey, // Public key of the sender account
  toPubkey: toAccount.publicKey, // Public key of the receiver account
  lamports: 1 * LAMPORTS_PER_SOL, // Amount to transfer in lamports
});

// Get the latest blockhash
const { blockhash } = await connection.getLatestBlockhash();

// Create the transaction message
const message = new TransactionMessage({
  payerKey: payer.publicKey, // Public key of the payer account
  recentBlockhash: blockhash, // Most recent blockhash
  instructions: [transferInstruction], // Transaction instructions
}).compileToV0Message();
```

Next, pass the compiled message into the `VersionedTransaction` constructor to
create a versioned transaction. The transaction is then signed and sent to the
network, similar to how legacy transactions are handled.

```typescript
// Create the versioned transaction from the compiled message
const transaction = new VersionedTransaction(message);

// Sign the transaction with the payer's keypair
transaction.sign([payer]);

// Send the signed transaction to the network
const signature = await connection.sendTransaction(transaction);
```

### Address Lookup Table

Address Lookup Tables (LUTs) are accounts that store references to other account
addresses. These LUT accounts, owned by the Address Lookup Table Program,
increase the number of accounts that can be included in a transaction.

In versioned transactions, LUT addresses are included, and additional accounts
are referenced with a 1-byte index instead of the full 32-byte address, reducing
space used by the transaction.

The `@solana/web3.js` library offers an `AddressLookupTableProgram` class,
providing methods to manage LUTs:

- `createLookupTable` - creates a new LUT account.
- `freezeLookupTable` - makes a LUT immutable.
- `extendLookupTable` - adds addresses to an existing LUT.
- `deactivateLookupTable` - begins the deactivation period for an LUT.
- `closeLookupTable` - permanently closes an LUT account.

#### Create a lookup table

You can use the `createLookupTable` method to construct the instruction for
creating a lookup table. This requires the following parameters:

- `authority` - the account authorized to modify the lookup table.
- `payer` - the account responsible for paying the account creation fees.
- `recentSlot` - a recent slot used to derive the lookup table's address.

The function returns both the instruction for creating the LUT and its address.

```typescript
// Get the current slot
const slot = await connection.getSlot();

// Create the lookup table creation instruction and retrieve its address
const [lookupTableInst, lookupTableAddress] =
  AddressLookupTableProgram.createLookupTable({
    authority: user.publicKey, // Account authorized to modify the LUT
    payer: user.publicKey, // Account paying for transaction fees
    recentSlot: slot - 1, // Use a recent slot to derive the LUT address
  });
```

Under the hood, the lookup table address is a Program Derived Address (PDA)
generated using the `authority` and `recentSlot` as seeds.

```typescript
const [lookupTableAddress, bumpSeed] = PublicKey.findProgramAddressSync(
  [params.authority.toBuffer(), toBufferLE(BigInt(params.recentSlot), 8)],
  this.programId,
);
```

<Callout>
Using the most recent slot sometimes results in errors when submitting the
transaction. To avoid this, it’s recommended to use a slot that is one slot
before the most recent one (`recentSlot: currentSlot - 1`). If you still
encounter errors when sending the transaction, try resubmitting it.
</Callout>

```
"Program AddressLookupTab1e1111111111111111111111111 invoke [1]",
"188115589 is not a recent slot",
"Program AddressLookupTab1e1111111111111111111111111 failed: invalid instruction data";
```

#### Extend a lookup table

The `extendLookupTable` method creates an instruction to add addresses to an
existing lookup table. It requires the following parameters:

- `payer` - the account responsible for paying transaction fees and any
  additional rent.
- `authority` - the account authorized to modify the lookup table.
- `lookupTable` - the address of the lookup table to be extended.
- `addresses` - the list of addresses to add to the lookup table.

The function returns an instruction to extend the lookup table.

```typescript
const addresses = [
  new PublicKey("31Jy3nFeb5hKVdB4GS4Y7MhU7zhNMFxwF7RGVhPc1TzR"),
  new PublicKey("HKSeapcvwJ7ri6mf3HwBtspLFTDKqaJrMsozdfXfg5y2"),
  // Add more addresses here
];

// Create the instruction to extend the lookup table with the provided addresses
const extendInstruction = AddressLookupTableProgram.extendLookupTable({
  payer: user.publicKey, // Account paying for transaction fees
  authority: user.publicKey, // Account authorized to modify the lookup table
  lookupTable: lookupTableAddress, // Address of the lookup table to extend
  addresses: addresses, // Addresses to add to the lookup table
});
```

Note that when extending a lookup table, the number of addresses that can be
added in a single instruction is limited by the transaction size limit of 1232
bytes. You can add approximately 30 addresses in one transaction. If you need to
add more than that, multiple transactions are required. Each lookup table can
store up to 256 addresses.

#### Send Transaction

After creating the instructions, you can add them to a transaction and send it
to the network:

```typescript
// Get the latest blockhash
const { blockhash } = await connection.getLatestBlockhash();

// Create the transaction message
const message = new TransactionMessage({
  payerKey: payer.publicKey, // Account paying for the transaction
  recentBlockhash: blockhash, // Latest blockhash
  instructions: [lookupTableInst, extendInstruction], // Instructions to be included in the transaction
}).compileToV0Message();

// Create the versioned transaction from the message
const transaction = new VersionedTransaction(message);

// Sign the transaction
transaction.sign([payer]);

// Send the signed transaction to the network
const transactionSignature = await connection.sendTransaction(transaction);
```

Note that after you create or extend a lookup table, it must "warm up" for one
slot before the lookup table or newly added addresses can be used in
transactions. You can only access lookup tables and addresses added in slots
prior to the current one.

If you encounter the following error, it may indicate that you're trying to
access a lookup table or an address before the warm-up period has completed:

```typescript
SendTransactionError: failed to send transaction: invalid transaction: Transaction address table lookup uses an invalid index
```

To avoid this issue, ensure you add a delay after extending the lookup table
before attempting to reference the table in a transaction.

#### Deactivate a lookup table

When a lookup table (LUT) is no longer needed, you can deactivate it to reclaim
its rent balance. Deactivating a LUT puts it into a "cool-down" period
(approximately 513 slots) during which it can still be used by transactions.
This prevents transactions from being censored by deactivating and recreating
LUTs within the same slot.

To deactivate a LUT, use the `deactivateLookupTable` method with the following
parameters:

- `lookupTable` - the address of the lookup table to be deactivated.
- `authority` - the account with the authority to deactivate the LUT.

```typescript
const deactivateInstruction = AddressLookupTableProgram.deactivateLookupTable({
  lookupTable: lookupTableAddress, // Address of the lookup table to deactivate
  authority: user.publicKey, // Authority to modify the lookup table
});
```

#### Close a lookup table

Once a LUT has been deactivated and the cool-down period has passed, you can
close the lookup table to reclaim its rent balance. Use the `closeLookupTable`
method, which requires the following parameters:

- `lookupTable` - the address of the LUT to be closed.
- `authority` - the account with the authority to close the LUT.
- `recipient` - the account that will receive the reclaimed rent balance.

```typescript
const closeInstruction = AddressLookupTableProgram.closeLookupTable({
  lookupTable: lookupTableAddress, // Address of the lookup table to close
  authority: user.publicKey, // Authority to close the LUT
  recipient: user.publicKey, // Recipient of the reclaimed rent balance
});
```

Attempting to close a LUT before it has been fully deactivated will result in
the following error:

```
"Program AddressLookupTab1e1111111111111111111111111 invoke [1]",
"Table cannot be closed until it's fully deactivated in 513 blocks",
"Program AddressLookupTab1e1111111111111111111111111 failed: invalid program argument";
```

#### Freeze a lookup table

In addition to standard CRUD operations, you can "freeze" a lookup table. This
makes it immutable so that it can no longer be extended, deactivated, or closed.

The `freezeLookupTable` method is used for this operation and takes the
following parameters:

- `lookupTable` - the address of the LUT to freeze.
- `authority` - the account with the authority to freeze the LUT.

```typescript
const freezeInstruction = AddressLookupTableProgram.freezeLookupTable({
  lookupTable: lookupTableAddress, // Address of the lookup table to freeze
  authority: user.publicKey, // Authority to freeze the LUT
});
```

Once a LUT is frozen, any attempt to modify it will result in an error like the
following:

```
"Program AddressLookupTab1e1111111111111111111111111 invoke [1]",
"Lookup table is frozen",
"Program AddressLookupTab1e1111111111111111111111111 failed: Account is immutable";
```

#### Using lookup tables in versioned transactions

To utilize a lookup table in a versioned transaction, first retrieve the lookup
table account using its address:

```typescript
// Fetch the lookup table account from the blockchain using its address
const lookupTableAccount = (
  await connection.getAddressLookupTable(new PublicKey(lookupTableAddress))
).value;
```

Once you have the lookup table account, you can create the list of instructions
for the transaction. When constructing the `TransactionMessage`, pass the lookup
table accounts as an array to the `compileToV0Message()` method. You can include
multiple lookup table accounts if needed.

```typescript
const message = new web3.TransactionMessage({
  payerKey: payer.publicKey, // Public key of the account paying for the transaction
  recentBlockhash: blockhash, // Blockhash of the most recent block
  instructions: instructions, // Instructions to be included in the transaction
}).compileToV0Message([lookupTableAccount]); // Include lookup table accounts

// Create a versioned transaction using the compiled message
const transaction = new web3.VersionedTransaction(message);

// Sign the transaction
transaction.sign([payer]);

// Send the signed transaction to the network
const transactionSignature = await connection.sendTransaction(transaction);
```

## Lab

Let's go ahead and practice using lookup tables!

This lab will guide you through creating, extending, and using a lookup table in
a versioned transaction.

#### 1. Create the `try-large-transaction.ts` file

To begin, create a new file named `try-large-transaction.ts` in your project
directory. This file will contain the code to illustrate a scenario where a
legacy transaction is created to transfer SOL to 22 recipients in a single
atomic transaction. The transaction will include 22 separate instructions, each
transferring SOL from the payer (signer) to a different recipient.

This example highlights a key limitation of legacy transactions when trying to
accommodate many account addresses within a single transaction. As expected,
when attempting to send this transaction, it will likely fail due to exceeding
the transaction size limits.

Here’s the code to include in `try-large-transaction.ts`:

```typescript filename="try-large-transaction.ts"
import {
  Connection,
  clusterApiUrl,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  initializeKeypair,
  makeKeypairs,
  getExplorerLink,
} from "@solana-developers/helpers";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Initialize the keypair from the environment variable or create a new one
  const payer = await initializeKeypair(connection);

  // Generate 22 recipient keypairs using makeKeypairs
  const recipients = makeKeypairs(22).map(keypair => keypair.publicKey);

  // Create a legacy transaction
  const transaction = new Transaction();

  // Add 22 transfer instructions to the transaction
  recipients.forEach(recipient => {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipient,
        lamports: LAMPORTS_PER_SOL * 0.01, // Transfer 0.01 SOL to each recipient
      }),
    );
  });

  // Sign and send the transaction
  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [
      payer,
    ]);
    console.log(
      `Transaction successful with signature: ${getExplorerLink("tx", signature, "devnet")}`,
    );
  } catch (error) {
    console.error("Transaction failed:", error);
  }
}
```

To run the example, execute `npx esrun try-large-transaction.ts`. This process
will:

- Generate a new keypair.
- Store the keypair details in the `.env` file.
- Request airdrop of devnet SOL to the generated keypair.
- Attempt to send the transaction.
- Since the transaction includes 22 instructions, it is expected to fail with
  the error: "Transaction too large".

```
Creating .env file
Current balance is 0
Airdropping 1 SOL...
New balance is 1
PublicKey: 7YsGYC4EBs6Dxespe4ZM3wfCp856xULWoLw7QUcVb6VG
Error: Transaction too large: 1244 > 1232
```

#### 2. Create the `use-lookup-tables.ts` File

Next, we'll explore how to use lookup tables in combination with versioned
transactions to overcome the limitation of legacy transactions and include a
greater number of addresses in a single transaction.

Create a new file named `use-lookup-tables.ts` in your project directory. This
file will contain the code to demonstrate the use of lookup tables.

Here’s the starter code to include in `use-lookup-tables.ts` file:

```typescript filename="use-lookup-tables.ts"
import {
  Connection,
  clusterApiUrl,
  Keypair,
  TransactionInstruction,
  AddressLookupTableAccount,
  SystemProgram,
  VersionedTransaction,
  TransactionMessage,
  AddressLookupTableProgram,
  LAMPORTS_PER_SOL,
  getSlot,
} from "@solana/web3.js";
import {
  initializeKeypair,
  makeKeypairs,
  getExplorerLink,
} from "@solana-developers/helpers";
import dotenv from "dotenv";
dotenv.config();

async function main() {
  // Connect to the local Solana cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Initialize the keypair from the environment variable or create a new one
  const payer = await initializeKeypair(connection);

  // Generate 22 recipient keypairs using makeKeypairs
  const recipients = makeKeypairs(22).map(keypair => keypair.publicKey);
}
```

Next, we will create a few helper functions that will be crucial for working
with versioned transactions and lookup tables. These functions will simplify our
process and make our code more modular and reusable.

#### 3. Create a `sendV0Transaction` helper function

To handle versioned transactions, we will create a helper function in
`use-lookup-tables.ts` file, called `sendV0Transaction`, to simplify the
process. This function will accept the following parameters:

- `connection`: the solana connection to the cluster (e.g., devnet).
- `user`: the keypair of the user (payer) signing the transaction.
- `instructions`: an array of TransactionInstruction objects to include in the
  transaction.
- `lookupTableAccounts` (optional): an array of lookup table accounts, if
  applicable, to reference additional addresses.

This helper function will:

- Retrieve the latest blockhash and last valid block height from the Solana
  network.
- Compile a versioned transaction message using the provided instructions.
- Sign the transaction using the user's keypair.
- Send the transaction to the network.
- Confirm the transaction and log the transaction's URL using Solana Explorer.

```typescript filename="use-lookup-tables.ts"
async function sendV0Transaction(
  connection: Connection,
  user: Keypair,
  instructions: TransactionInstruction[],
  lookupTableAccounts?: AddressLookupTableAccount[],
) {
  // Get the latest blockhash and last valid block height
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  // Create a new transaction message with the provided instructions
  const messageV0 = new TransactionMessage({
    payerKey: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
    recentBlockhash: blockhash, // The blockhash of the most recent block
    instructions, // The instructions to include in the transaction
  }).compileToV0Message(lookupTableAccounts);

  // Create a versioned transaction from the message
  const transaction = new VersionedTransaction(messageV0);

  // Use the helper function to send and confirm the transaction
  const txid = await sendAndConfirmTransactionV0(
    connection,
    transaction,
    [user],
    {
      commitment: "finalized", // Ensures the transaction is confirmed at the highest level
    },
  );

  // Log the transaction URL on the Solana Explorer using the helper
  const explorerLink = getExplorerLink("tx", txid, "devnet");
  console.log(
    `Transaction successful! View it on Solana Explorer: ${explorerLink}`,
  );
}
```

#### 4. Create a `waitForNewBlock` helper function

When working with lookup tables, it's important to remember that newly created
or extended lookup tables cannot be referenced immediately. Therefore, before
submitting transactions that reference these tables, we need to wait for a new
block to be generated.

We will create a `waitForNewBlock` helper function that accepts:

- `connection`: the Solana network connection.
- `targetBlockHeight`: the target block height to wait for.

This function will:

- Start an interval that checks the current block height of the network every
  second (1000ms).
- Resolve the promise once the current block height exceeds the target block
  height.

```typescript filename="use-lookup-tables.ts"
async function waitForNewBlock(
  connection: Connection,
  targetHeight: number,
): Promise<void> {
  console.log(`Waiting for ${targetHeight} new blocks...`);

  // Get the initial block height of the blockchain
  const { lastValidBlockHeight: initialBlockHeight } =
    await connection.getLatestBlockhash();

  return new Promise(resolve => {
    const SECOND = 1000;
    const checkInterval = 1 * SECOND; // Interval to check for new blocks (1000ms)

    // Set an interval to check for new block heights
    const intervalId = setInterval(async () => {
      try {
        // Get the current block height
        const { lastValidBlockHeight: currentBlockHeight } =
          await connection.getLatestBlockhash();

        // If the current block height exceeds the target, resolve and clear interval
        if (currentBlockHeight >= initialBlockHeight + targetHeight) {
          clearInterval(intervalId);
          console.log(`New block height reached: ${currentBlockHeight}`);
          resolve();
        }
      } catch (error) {
        console.error("Error fetching block height:", error);
        clearInterval(intervalId);
        resolve(); // Resolve to avoid hanging in case of errors
      }
    }, checkInterval);
  });
}
```

#### 5. Create an `initializeLookupTable` function

Next, we need to initialize a lookup table to hold the addresses of the
recipients. The `initializeLookupTable` function will accept the following
parameters:

- `user`: the user's keypair (payer and authority).
- `connection`: the Solana network connection.
- `addresses`: an array of recipient addresses (public keys) to add to the
  lookup table.

The function will:

- Retrieve the current slot to derive the lookup table's address.
- Generate the necessary instructions to create and extend the lookup table with
  the provided recipient addresses.
- Send and confirm a transaction that includes these instructions.
- Return the address of the newly created lookup table.

Although the transaction includes the full recipient addresses, using the lookup
table allows Solana to reference those addresses with significantly fewer bytes
in the actual transaction. By including the lookup table in the versioned
transaction, the framework optimizes the transaction size, replacing addresses
with pointers to the lookup table.

This design is crucial for enabling the transaction to support more recipients
by staying within Solana’s transaction size limits.

```typescript filename="use-lookup-tables.ts"
async function initializeLookupTable(
  user: Keypair,
  connection: Connection,
  addresses: PublicKey[],
): Promise<PublicKey> {
  // Get the current slot using a helper function from @solana/web3.js
  const slot = await getSlot(connection);

  // Create an instruction for creating a lookup table
  // and retrieve the address of the new lookup table
  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: user.publicKey, // The authority to modify the lookup table
      payer: user.publicKey, // The payer for transaction fees
      recentSlot: slot - 1, // The slot for lookup table address derivation
    });

  console.log("Lookup Table Address:", lookupTableAddress.toBase58());

  // Create an instruction to extend a lookup table with the provided addresses
  const extendInstruction = AddressLookupTableProgram.extendLookupTable({
    payer: user.publicKey, // The payer of transaction fees
    authority: user.publicKey, // The authority to extend the lookup table
    lookupTable: lookupTableAddress, // Address of the lookup table to extend
    addresses: addresses.slice(0, 30), // Add up to 30 addresses per instruction
  });

  // Use the helper function to send a versioned transaction
  await sendVersionedTransaction(connection, user, [
    lookupTableInst,
    extendInstruction,
  ]);

  return lookupTableAddress;
}
```

#### 6. Modify `main` to use lookup tables

With the helper functions in place, we are now ready to modify the `main`
function to utilize versioned transactions and address lookup tables. To do so,
we will follow these steps:

1. Call `initializeLookupTable`: Create and extend the lookup table with the
   recipients' addresses.
2. Call `waitForNewBlock`: Ensure the lookup table is activated by waiting for a
   new block.
3. Retrieve the Lookup Table: Use `connection.getAddressLookupTabl`e to fetch
   the lookup table and reference it in the transaction.
4. Create Transfer Instructions: Generate a transfer instruction for each
   recipient.
5. Send the Versioned Transaction: Use `sendV0Transaction` to send a single
   transaction with all transfer instructions, referencing the lookup table.

```typescript filename="use-lookup-tables.ts"
async function main() {
  // Connect to the devnet Solana cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Initialize the keypair from the environment variable or create a new one
  const payer = await initializeKeypair(connection);

  // Generate 22 recipient keypairs using makeKeypairs
  const recipients = makeKeypairs(22).map(keypair => keypair.publicKey);
  // Initialize the lookup table with the generated recipients
  const lookupTableAddress = await initializeLookupTable(
    user,
    connection,
    recipients,
  );

  // Wait for a new block before using the lookup table
  await waitForNewBlock(connection, 1);

  // Fetch the lookup table account
  const lookupTableAccount = (
    await connection.getAddressLookupTable(lookupTableAddress)
  ).value;

  // Check if the lookup table was successfully fetched
  if (!lookupTableAccount) {
    throw new Error("Lookup table not found");
  }

  // Create transfer instructions for each recipient
  const transferInstructions = recipients.map(recipient =>
    SystemProgram.transfer({
      fromPubkey: user.publicKey, // The payer
      toPubkey: recipient, // The recipient
      lamports: LAMPORTS_PER_SOL * 0.01, // Amount to transfer
    }),
  );

  // Send the versioned transaction including the lookup table
  const txid = await sendVersionedTransaction(
    connection,
    user,
    transferInstructions,
    [lookupTableAccount],
  );

  // Log the transaction link for easy access
  console.log(`Transaction URL: ${getExplorerLink("tx", txid, "devnet")}`);
}
```

Even though we will create transfer instructions with full recipient addresses,
the use of lookup tables allows the `@solana/web3.js` framework to optimize the
transaction size. The addresses in the transaction that match entries in the
lookup table will be replaced with compact pointers referencing the lookup
table. By doing this, addresses will be represented using only a single byte in
the final transaction, significantly reducing the transaction's size.

Use `npx esrun use-lookup-tables.ts` in the command line to execute the `main`
function. You should see an output similar to the following:

```bash
Current balance is 1.38866636
PublicKey: 8iGVBt3dcJdp9KfyTRcKuHY6gXCMFdnSG2F1pAwsUTMX
lookup table address: Cc46Wp1mtci3Jm9EcH35JcDQS3rLKBWzy9mV1Kkjjw7M
https://explorer.solana.com/tx/4JvCo2azy2u8XK2pU8AnJiHAucKTrZ6QX7EEHVuNSED8B5A8t9GqY5CP9xB8fZpTNuR7tbUcnj2MiL41xRJnLGzV?cluster=devnet
Waiting for 1 new blocks
https://explorer.solana.com/tx/rgpmxGU4QaAXw9eyqfMUqv8Lp6LHTuTyjQqDXpeFcu1ijQMmCH2V3Sb54x2wWAbnWXnMpJNGg4eLvuy3r8izGHt?cluster=devnet
Finished successfully
```

The first transaction link in the console represents the transaction for
creating and extending the lookup table. The second transaction represents the
transfers to all recipients. Feel free to inspect these transactions in the
explorer.

Remember, this same transaction was failing when you first downloaded the
starter code. Now that we're using lookup tables, we can do all 22 transfers in
a single transaction.

#### 6. Add more addresses to the lookup table

Keep in mind that the solution we've come up with so far only supports transfers
to up to 30 accounts since we only extend the lookup table once. When you factor
in the transfer instruction size, it's actually possible to extend the lookup
table with an additional 27 addresses and complete an atomic transfer to up to
57 recipients. Let's go ahead and add support for this now!

All we need to do is go into `initializeLookupTable` and do two things:

1. Modify the existing call to `extendLookupTable` to only add the first 30
   addresses (any more than that and the transaction will be too large)
2. Add a loop that will keep extending a lookup table of 30 addresses at a time
   until all addresses have been added

```typescript filename="use-lookup-tables.ts"
async function initializeLookupTable(
  user: Keypair,
  connection: Connection,
  addresses: PublicKey[],
): Promise<PublicKey> {
  // Get the current slot
  const slot = await connection.getSlot();

  // Create the lookup table and retrieve its address
  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: user.publicKey, // The authority to modify the lookup table
      payer: user.publicKey, // The payer for the transaction fees
      recentSlot: slot - 1, // Recent slot to derive lookup table's address
    });
  console.log("Lookup table address:", lookupTableAddress.toBase58());

  // Helper function to extend the lookup table in batches
  const extendLookupTable = async (remainingAddresses: PublicKey[]) => {
    while (remainingAddresses.length > 0) {
      const toAdd = remainingAddresses.slice(0, 30); // Add up to 30 addresses
      remainingAddresses = remainingAddresses.slice(30);

      const extendInstruction = AddressLookupTableProgram.extendLookupTable({
        payer: user.publicKey,
        authority: user.publicKey,
        lookupTable: lookupTableAddress,
        addresses: toAdd,
      });

      // Send the transaction to extend the lookup table with the new addresses
      await sendVersionedTransaction(connection, user, [extendInstruction]);
    }
  };

  // Send the initial transaction to create the lookup table and add the first 30 addresses
  const initialBatch = addresses.slice(0, 30);
  const remainingAddresses = addresses.slice(30);

  await sendVersionedTransaction(connection, user, [lookupTableInst]);

  // Extend the lookup table with the remaining addresses, if any
  await extendLookupTable(initialBatch);
  await extendLookupTable(remainingAddresses);

  return lookupTableAddress;
}
```

Congratulations! If you feel good about this lab, you're probably ready to work
with lookup tables and versioned transactions on your own. If you want to take a
look at the final solution code you can
[find it on the solution branch](https://github.com/Unboxed-Software/solana-versioned-transactions/tree/solution).

## Challenge

As a challenge, experiment with deactivating, closing, and freezing lookup
tables. Remember that you need to wait for a lookup table to finish deactivating
before you can close it. Also, if a lookup table is frozen, it cannot be
modified (deactivated or closed), so you will have to test separately or use
separate lookup tables.

1. Create a function for deactivating the lookup table.
2. Create a function for closing the lookup table
3. Create a function for freezing the lookup table
4. Test the functions by calling them in the `main()` function

You can reuse the functions we created in the lab for sending the transaction
and waiting for the lookup table to activate/deactivate. Feel free to reference
this [solution code](https://github.com/Unboxed-Software/versioned-transaction/tree/challenge).

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=b58fdd00-2b23-4e0d-be55-e62677d351ef)!
</Callout>
