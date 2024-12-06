---
title: Versioned Transactions and Lookup Tables
objectives:
  - Create versioned transactions
  - Create lookup tables
  - Extend lookup tables
  - Use lookup tables with versioned transactions
description:
  "Use large amounts of accounts in a transaction by using lookup tables."
keywords:
  - lookup tables
  - address
  - transaction versions
  - versioned
  - legacy
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

- Creating versioned transactions.
- Creating and managing lookup tables.
- Using lookup tables in versioned transactions.

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

#### Using the @solana/web3.js library

To get started, you'll need to install the `@solana/web3.js` library in your
project. You can do this using npm or yarn.

```shell
npm install @solana/web3.js
```

#### Create versioned transactions

To create a versioned transaction, you first create a `TransactionMessage` with
the following parameters:

- `payerKey` - the public key of the account that will pay for the transaction
- `recentBlockhash` - a recent blockhash from the network
- `instructions` - the instructions to be executed in the transaction.

Once the message object is created, you can convert it into a version `0`
transaction using the `compileToV0Message()` method.

Replace the `<YOUR_RPC_URL_HERE>` placeholder with the URL of your RPC. You can
get a RPC providers from [Solana RPC](https://solana.com/rpc).

```ts
import {
  SystemProgram,
  Connection,
  LAMPORTS_PER_SOL,
  TransactionMessage,
  VersionedTransaction,
  AddressLookupTableProgram,
  PublicKey,
} from "@solana/web3.js";

// Example transfer instruction
const transferInstruction = SystemProgram.transfer({
  fromPubkey: payer.publicKey, // Public key of the sender account
  toPubkey: toAccount.publicKey, // Public key of the receiver account
  lamports: 1 * LAMPORTS_PER_SOL, // Amount to transfer in lamports
});

// Establish a JSON RPC connection
const connection = new Connection(
  "<YOUR_RPC_URL_HERE>", // Replace with the URL of your RPC provider.
  "confirmed",
);

// Get the latest blockhash
const { blockhash } = await connection.getLatestBlockhash();

// Create the transaction message
const message = new TransactionMessage({
  payerKey: payer.publicKey, // Public key of the account that will pay for the transaction
  recentBlockhash: blockhash, // Latest blockhash
  instructions: [transferInstruction], // Instructions included in transaction
}).compileToV0Message();
```

<Callout type="info" title="Note">
  The recent blockhash is important because it helps prevent replay attacks.
  Also, The recent blockhash serves as a timestamp, ensuring that transactions
  are processed in the correct order. When a node receives a transaction, it
  checks the blockhash to ensure that it is newer than the previous blockhash.
  If the blockhash is older, the transaction is rejected.
</Callout>

Finally, you can use the `VersionedTransaction` constructor to create a new
versioned transaction from the compiled message. Then, you can sign and send the
transaction to the network, just like you would with a legacy transaction.

```ts
// Create the versioned transaction using the message
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

```ts
// Fetch the current slot that the node is processing
const slot = await connection.getSlot();

// Create the lookup table creation instruction and retrieve its address
const [lookupTableInst, lookupTableAddress] =
  AddressLookupTableProgram.createLookupTable({
    authority: user.publicKey, // The authority (i.e., the account with permission to change the lookup table)
    payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
    recentSlot: slot - 1, // The recent slot to derive the lookup table's address
  });
```

Under the hood, the lookup table address is simply a
[PDA](/docs/terminology.md#program-derived-account-pda) derived using the
`authority` and `recentSlot` as seeds.

```ts
import { toBufferLE } from "bigint-buffer";

const [lookupTableAddress, bumpSeed] = PublicKey.findProgramAddressSync(
  [params.authority.toBuffer(), toBufferLE(BigInt(params.recentSlot), 8)],
  this.programId,
);
```

<Callout type="caution">
  When using the most recent slot number (recentSlot) to derive a program
  address, you may encounter an error after sending the transaction. This
  is because the Solana network may not have processed the latest block yet,
  or the slot number may have changed by the time the transaction is processed.
  
  To avoid this, you can use a slot that is one slot before the
  most recent one (e.g. `recentSlot: slot - 1`). However, if you still
  encounter an error when sending the transaction, you can try resending the
  transaction.

```txt
"Program AddressLookupTab1e1111111111111111111111111 invoke [1]",
"188115589 is not a recent slot",
"Program AddressLookupTab1e1111111111111111111111111 failed: invalid instruction data";
```

</Callout>

#### Extend a lookup table

The `extendLookupTable` method creates an instruction to add addresses to an
existing lookup table. It requires the following parameters:

- `payer` - the account responsible for paying transaction fees and any
  additional rent.
- `authority` - the account authorized to modify the lookup table.
- `lookupTable` - the address of the lookup table to be extended.
- `addresses` - the list of addresses to add to the lookup table.

The function returns an instruction to extend the lookup table.

```ts
const addresses = [
  new PublicKey("31Jy3nFeb5hKVdB4GS4Y7MhU7zhNMFxwF7RGVhPc1TzR"),
  new PublicKey("HKSeapcvwJ7ri6mf3HwBtspLFTDKqaJrMsozdfXfg5y2"),
  // Add more addresses here
];

// Create an instruction to extend a lookup table with the provided addresses
const extendInstruction = AddressLookupTableProgram.extendLookupTable({
  payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
  authority: user.publicKey, // The authority (i.e., the account with permission to change the lookup table)
  lookupTable: lookupTableAddress, // The address of the lookup table to extend
  addresses: addresses, // The addresses to add to the lookup table
});
```

<Callout type="info" title="Note">
  Note that when extending a lookup table, the number of addresses that can be
  added in one instruction is limited by the transaction size limit, which is 1,232
  bytes. This means you can add 30 addresses to a lookup table at a time. If you
  need to add more than that, you'll need to send many transactions. Each
  lookup table can store a maximum of 256 addresses.
</Callout>

#### Send Transaction

After creating the instructions, you can add them to a transaction and send it
to the network:

```ts
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

<Callout type="info" title="Note">
  Note that when you first create or extend a lookup table, it needs to "warm up"
  for one slot before the LUT or new addresses can be used in transactions. In
  other words, you can only use lookup tables and access addresses that were added
  before the current slot.
</Callout>

```ts
SendTransactionError: failed to send transaction: invalid transaction: Transaction address table lookup uses an invalid index
```

If you see the error above, or cannot access addresses in a lookup table after
extending it, it's likely you are trying to access the table or a specific
address too soon. You must wait until the warm-up period ends.

To avoid this issue, add a delay after extending the lookup table before sending
a transaction that references the table.

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

```txt
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

```txt
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

This project uses [esrun](https://www.npmjs.com/package/@digitak/esrun) for
running scripts. You can install it globally by running `npm install -g esrun`.

The starter code includes an example of creating a versioned transaction that
intends to atomically transfer SOL to 22 recipients. The transaction contains 22
instructions where each instruction transfers SOL from the signer to a different
recipient.

The purpose of the starter code is to illustrate the limitation on the number of
addresses that can be included in a versioned transaction. The transaction built
in the starter code is expected to fail when sent.

The following starter code can be found in the `index.ts` file.

```ts filename="index.ts"
import { initializeKeypair } from "./initializeKeypair";
import {
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  Connection,
} from "@solana/web3.js";

try {
  // Connect to the devnet cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // Initialize the user's keypair
  const user = await initializeKeypair(connection);
  console.log("Public Key:", user.publicKey.toBase58());

  // Generate 22 addresses
  const recipients = [];
  for (let i = 0; i < 22; i++) {
    recipients.push(Keypair.generate().publicKey);
  }

  // Create a legacy transaction
  const transaction = new Transaction();

  // Add a transfer instruction for each address
  for (const address of recipients) {
    transferInstructions.push(
      SystemProgram.transfer({
        fromPubkey: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
        toPubkey: address, // The destination account for the transfer
        lamports: LAMPORTS_PER_SOL * 0.01, // Transfer 0.01 SOL to each recipient
      }),
    );
  }

  // Get the latest blockhash and last valid block height
  const { lastValidBlockHeight, blockhash } =
    await connection.getLatestBlockhash();

  // Create the transaction message
  const message = new TransactionMessage({
    payerKey: user.publicKey, // Public key of the account that will pay for the transaction
    recentBlockhash: blockhash, // Latest blockhash
    instructions: transferInstructions, // Instructions included in transaction
  }).compileToV0Message();

  // Create the versioned transaction using the message
  const transaction = new VersionedTransaction(message);

  // Sign the transaction
  transaction.sign([user]);

  // Send the transaction to the cluster (this will fail in this example if addresses > 21)
  const txid = await connection.sendTransaction(transaction);

  // Confirm the transaction
  await connection.confirmTransaction({
    blockhash: blockhash,
    lastValidBlockHeight: lastValidBlockHeight,
    signature: txid,
  });

  // Log the transaction URL on the Solana Explorer
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
  console.log("Finished successfully");
} catch (error) {
  console.log(error);
}
```

To execute the code, run `npm start`. This will create a new keypair, write it
to the `.env` file, airdrop devnet SOL to the keypair, and send the transaction
built in the starter code. The transaction is expected to fail with the error
message `VersionedTransaction too large`.

```txt
Creating .env file
Current balance is 0
Airdropping 1 SOL...
New balance is 1
Public Key: 5ZZzcDbabFHmoZU8vm3VzRzN5sSQhkf91VJzHAJGNM7B
VersionedTransaction too large: 1664 bytes
```

<Callout>
By design, Solana transactions are limited to 1,232 bytes. Transactions exceeding
this size will fail.
</Callout>

In the next steps, we'll go over how to use lookup tables with versioned
transactions to increase the number of addresses that can be included in a
single transaction.

Before we start, go ahead and delete the content of the `try-catch` block to
leave only the following:

```ts filename="index.ts"
// Connect to the devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// Initialize the user's keypair
const user = await initializeKeypair(connection);
console.log("Public Key:", user.publicKey.toBase58());

// Generate 22 addresses
const addresses = [];
for (let i = 0; i < 22; i++) {
  addresses.push(Keypair.generate().publicKey);
}
```

### 2. Create a `sendV0Transaction` helper function

We'll be sending many "version 0" transactions, so let's create a helper
function to facilitate this.

To handle versioned transactions, we will create a helper function in `index.ts`
file, called `sendV0Transaction`, to simplify the process. This function will
accept the following parameters:

- `connection`: the solana connection to the cluster (e.g., devnet).
- `user`: the keypair of the user (payer) signing the transaction.
- `instructions`: an array of TransactionInstruction objects to include in the
  transaction.
- `lookupTableAccounts` (optional): an array of lookup table accounts, if
  applicable, to reference additional addresses.

This helper function will:

```ts filename="index.ts"
import {
  ...
  TransactionInstruction,
  AddressLookupTableAccount
} from "@solana/web3.js";

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

  // Create a new transaction object with the message
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

<Callout>
Remember to update the `import` statement at the top of the file to include the
`TransactionInstruction` and `AddressLookupTableAccount` classes.
</Callout>

#### 3. Create a `waitForNewBlock` helper function

When working with lookup tables, it's important to remember that newly created
or extended lookup tables cannot be referenced immediately. Therefore, before
submitting transactions that reference these tables, we need to wait for a new
block to be generated.

We will create a `waitForNewBlock` helper function that accepts:

- `connection`: the Solana network connection.
- `targetHeight`: the target block height to wait for.

This function will:

- Start an interval that checks the current block height of the network every
  second (1000ms).
- Resolve the promise once the current block height exceeds the target block
  height.

```ts filename="index.ts"
function waitForNewBlock(connection: Connection, targetHeight: number) {
  console.log(`Waiting for ${targetHeight} new blocks`);
  return new Promise(async (resolve: any) => {
    // Get the last valid block height of the blockchain
    const { lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Set an interval to check for new blocks every 1000ms
    const intervalId = setInterval(async () => {
      // Get the new valid block height
      const { lastValidBlockHeight: newValidBlockHeight } =
        await connection.getLatestBlockhash();
      // console.log(newValidBlockHeight)

      // Check if the new valid block height is greater than the target block height
      if (newValidBlockHeight > lastValidBlockHeight + targetHeight) {
        // If the target block height is reached, clear the interval and resolve the promise
        clearInterval(intervalId);
        resolve();
      }
    }, 1000);
  });
}
```

#### 4. Create an `initializeLookupTable` function

Next, we need to initialize a lookup table to hold the addresses of the
recipients. The `initializeLookupTable` function will accept the following
parameters:

- `user`: the user's keypair (payer and authority).
- `connection`: the Solana network connection.
- `addresses`: an array of recipient addresses (public keys) to add to the
  lookup table.

```ts filename="index.ts"
import {
  ...
  PublicKey
} from "@solana/web3.js";

async function initializeLookupTable(
  user: Keypair,
  connection: Connection,
  addresses: PublicKey[]
): Promise<PublicKey> {
  // Get the current slot
  const slot = await connection.getSlot();

  // Create an instruction for creating a lookup table
  // and retrieve the address of the new lookup table
  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: user.publicKey, // The authority (i.e., the account with permission to modify the lookup table)
      payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
      recentSlot: slot - 1, // The recent slot to derive the lookup table's address
    });
  console.log("lookup table address:", lookupTableAddress.toBase58());

  // Create an instruction to extend a lookup table with the provided addresses
  const extendInstruction = AddressLookupTableProgram.extendLookupTable({
    payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
    authority: user.publicKey, // The authority (i.e., the account with permission to modify the lookup table)
    lookupTable: lookupTableAddress, // The address of the lookup table to extend
    addresses: addresses.slice(0, 30), // The addresses to add to the lookup table
  });

  await sendV0Transaction(connection, user, [
    lookupTableInst,
    extendInstruction,
  ]);

  var remaining = addresses.slice(30);

  while (remaining.length > 0) {
    const toAdd = remaining.slice(0, 30);
    remaining = remaining.slice(30);
    const extendInstruction = AddressLookupTableProgram.extendLookupTable({
      payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
      authority: user.publicKey, // The authority (i.e., the account with permission to modify the lookup table)
      lookupTable: lookupTableAddress, // The address of the lookup table to extend
      addresses: toAdd, // The addresses to add to the lookup table
    });

    await sendV0Transaction(connection, user, [extendInstruction]);
  }

  return lookupTableAddress;
}
```

<Callout>
Remember to update the `import` statement at the top of the file to include the
`PublicKey` class.
</Callout>

#### 5. Modify `try-catch` block to use lookup tables

With the helper functions in place, we are now ready to modify the `main`
function to utilize versioned transactions and address lookup tables. To do so,
we will follow these steps:

1. Call `initializeLookupTable`
2. Call `waitForNewBlock`
3. Get the lookup table using `connection.getAddressLookupTable`
4. Create the transfer instructions for each recipient
5. Send the v0 transaction with all of the transfer instructions

```ts filename="index.ts"
// Connect to the devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Initialize the user's keypair
const user = await initializeKeypair(connection);
console.log("PublicKey:", user.publicKey.toBase58());

// Generate 22 addresses
const recipients = [];
for (let i = 0; i < 22; i++) {
  recipients.push(Keypair.generate().publicKey);
}

const lookupTableAddress = await initializeLookupTable(
  user,
  connection,
  recipients,
);

await waitForNewBlock(connection, 1);

const lookupTableAccount = (
  await connection.getAddressLookupTable(lookupTableAddress)
).value;

if (!lookupTableAccount) {
  throw new Error("Lookup table not found");
}

const transferInstructions = recipients.map(recipient => {
  return SystemProgram.transfer({
    fromPubkey: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
    toPubkey: recipient, // The destination account for the transfer
    lamports: LAMPORTS_PER_SOL * 0.01, // Transfer 0.01 SOL to each recipient
  });
});

await sendV0Transaction(connection, user, transferInstructions, [
  lookupTableAccount,
]);
```

Notice that you created the transfer instructions with the full recipient
address even though we created a lookup table. That's because by including the
lookup table in the versioned transaction, you tell the `web3.js` framework to
replace any recipient addresses that match addresses in the lookup table with
pointers to the lookup table instead. By the time the transaction is sent to the
network, addresses that exist in the lookup table will be referenced by a single
byte rather than the full 32 bytes.

Use `npx start` in the command line to execute the `main` function. You should
see an output similar to the following:

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

```ts filename="index.ts"
async function initializeLookupTable(
  user: Keypair,
  connection: Connection,
  addresses: PublicKey[],
): Promise<PublicKey> {
  // Get the current slot
  const slot = await connection.getSlot();

  // Create an instruction for creating a lookup table
  // and retrieve the address of the new lookup table
  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: user.publicKey, // The authority (i.e., the account with permission to change the lookup table)
      payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
      recentSlot: slot - 1, // The recent slot to derive the lookup table's address
    });
  console.log("lookup table address:", lookupTableAddress.toBase58());

  // Create an instruction to extend a lookup table with the provided addresses
  const extendInstruction = AddressLookupTableProgram.extendLookupTable({
    payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
    authority: user.publicKey, // The authority (i.e., the account with permission to change the lookup table)
    lookupTable: lookupTableAddress, // The address of the lookup table to extend
    addresses: addresses.slice(0, 30), // The addresses to add to the lookup table
  });

  await sendV0Transaction(connection, user, [
    lookupTableInst,
    extendInstruction,
  ]);

  var remaining = addresses.slice(30);

  while (remaining.length > 0) {
    const toAdd = remaining.slice(0, 30);
    remaining = remaining.slice(30);
    const extendInstruction = AddressLookupTableProgram.extendLookupTable({
      payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
      authority: user.publicKey, // The authority (i.e., the account with permission to change the lookup table)
      lookupTable: lookupTableAddress, // The address of the lookup table to extend
      addresses: toAdd, // The addresses to add to the lookup table
    });

    await sendV0Transaction(connection, user, [extendInstruction]);
  }

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
this
[solution code](https://github.com/Unboxed-Software/versioned-transaction/tree/challenge).

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=b58fdd00-2b23-4e0d-be55-e62677d351ef)!
</Callout>
