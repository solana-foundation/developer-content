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
  formats begin at version 0. Versioned transactions were introduced to accommodate 
  the use of Address Lookup Tables (LUTs).
- **Address Lookup Tables** are special accounts that store the addresses of other 
  accounts. In versioned transactions, these addresses can be referenced by a 1-byte 
  index instead of the full 32-byte address. This optimization enables more complex 
  transactions than previously possible.

## Lesson

By design, Solana transactions are limited to 1232 bytes. Transactions exceeding this 
limit will fail, which restricts the size of atomic operations that can be performed. 
While this limit allows for optimizations at the network level, it imposes restrictions 
on transaction complexity.

To address transaction size limitations, Solana introduced a new transaction format 
supporting multiple versions. Currently, two transaction versions are supported:

1. `legacy` - The original transaction format
2. `0` - The latest format, which supports Address Lookup Tables.

Existing Solana programs do not require changes to support versioned transactions. 
However, client-side code created prior to their introduction should be updated. 
In this lesson, we'll cover the basics of versioned transactions and how to use them, including:

- Creating versioned transactions
- Creating and managing lookup tables
- Using lookup tables in versioned transactions

### Versioned Transactions

In Solana transactions, one of the largest space consumers is account addresses, which are 32 bytes each. For transactions with 39 accounts, the size limit is exceeded even before accounting for instruction data. Typically, transactions become too large with around 20 accounts.

Versioned transactions address this issue by introducing Address Lookup Tables, which allow addresses to be stored separately and referenced via a 1-byte index. This greatly reduces transaction size by minimizing the space needed for account addresses.

Even if Address Lookup Tables are not required for your use case, understanding versioned transactions is crucial for maintaining compatibility with the latest Solana features. The `@solana/web3.js` library provides all necessary tools to work with versioned transactions and lookup tables.



#### Create versioned transactions

To create a versioned transaction, you first create a `TransactionMessage` with
the following parameters:

- `payerKey` - The public key of the account that will pay for the transaction
- `recentBlockhash` - A recent blockhash from the network
- `instructions` - The instructions to be executed in the transaction.

Once the message object is created, you can convert it into a version `0` transaction using the `compileToV0Message()` method.

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

Next, pass the compiled message into the `VersionedTransaction` constructor to create a versioned transaction. 
The transaction is then signed and sent to the network, similar to how legacy transactions are handled.

```typescript
// Create the versioned transaction from the compiled message
const transaction = new VersionedTransaction(message);

// Sign the transaction with the payer's keypair
transaction.sign([payer]);

// Send the signed transaction to the network
const signature = await connection.sendTransaction(transaction);
```

### Address Lookup Table

Address Lookup Tables (LUTs) are accounts that store references to other account addresses. These LUT accounts, owned by the Address Lookup Table Program, increase the number of accounts that can be included in a transaction.

In versioned transactions, LUT addresses are included, and additional accounts are referenced with a 1-byte index instead of the full 32-byte address, reducing space used by the transaction.

The `@solana/web3.js` library offers an `AddressLookupTableProgram` class, providing methods to manage LUTs:

- `createLookupTable` - Creates a new LUT account.
- `freezeLookupTable` - Makes a LUT immutable.
- `extendLookupTable` - Adds addresses to an existing LUT.
- `deactivateLookupTable` - Begins the deactivation period for an LUT.
- `closeLookupTable` - Permanently closes an LUT account.

#### Create a lookup table

You can use the `createLookupTable` method to construct the instruction for creating a lookup table. 
This requires the following parameters:

- `authority` - The account authorized to modify the lookup table.
- `payer` -  The account responsible for paying the account creation fees.
- `recentSlot` - A recent slot used to derive the lookup table's address.

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

Under the hood, the lookup table address is a Program Derived Address (PDA) generated using the `authority` and `recentSlot` as seeds.

```typescript
const [lookupTableAddress, bumpSeed] = PublicKey.findProgramAddressSync(
  [params.authority.toBuffer(), toBufferLE(BigInt(params.recentSlot), 8)],
  this.programId,
);
```

Using the most recent slot sometimes results in errors when submitting the transaction. To avoid this, it’s recommended to use a slot that is one slot before the most recent one (`recentSlot: currentSlot - 1`). If you still encounter errors when sending the transaction, try resubmitting it.

```
"Program AddressLookupTab1e1111111111111111111111111 invoke [1]",
"188115589 is not a recent slot",
"Program AddressLookupTab1e1111111111111111111111111 failed: invalid instruction data";
```

#### Extend a lookup table

The `extendLookupTable` method creates an instruction to add addresses to an existing lookup table. It requires the following parameters:

- `payer` - The account responsible for paying transaction fees and any additional rent.
- `authority` - The account authorized to modify the lookup table.
- `lookupTable` - The address of the lookup table to be extended.
- `addresses` - The list of addresses to add to the lookup table.

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

Note that when extending a lookup table, the number of addresses that can be added in a single instruction is limited by the transaction size limit of 1232 bytes. You can add approximately 30 addresses in one transaction. If you need to add more than that, multiple transactions are required. Each lookup table can store up to 256 addresses.

#### Send Transaction

After creating the instructions, you can add them to a transaction and send it to the network:

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

Note that After you create or extend a lookup table, it must "warm up" for one slot before the lookup table or newly added addresses can be used in transactions. You can only access lookup tables and addresses added in slots prior to the current one.

If you encounter the following error, it may indicate that you're trying to access a lookup table or an address before the warm-up period has completed:

```typescript
SendTransactionError: failed to send transaction: invalid transaction: Transaction address table lookup uses an invalid index
```

To avoid this issue, ensure you add a delay after extending the lookup table before attempting to reference the table in a transaction.

#### Deactivate a lookup table

When a lookup table (LUT) is no longer needed, you can deactivate it to reclaim its rent balance. Deactivating a LUT puts it into a "cool-down" period (approximately 513 slots) during which it can still be used by transactions. This prevents transactions from being censored by deactivating and recreating LUTs within the same slot.

To deactivate a LUT, use the `deactivateLookupTable` method with the following parameters:

- `lookupTable` - The address of the lookup table to be deactivated.
- `authority` - The account with the authority to deactivate the LUT.

```typescript
const deactivateInstruction = AddressLookupTableProgram.deactivateLookupTable({
  lookupTable: lookupTableAddress, // Address of the lookup table to deactivate
  authority: user.publicKey, // Authority to modify the lookup table
});
```

#### Close a lookup table

Once a LUT has been deactivated and the cool-down period has passed, you can close the lookup table to reclaim its rent balance. Use the `closeLookupTable` method, which requires the following parameters:

- `lookupTable` - The address of the LUT to be closed.
- `authority` - The account with the authority to close the LUT.
- `recipient` - The account that will receive the reclaimed rent balance.

```typescript
const closeInstruction = AddressLookupTableProgram.closeLookupTable({
  lookupTable: lookupTableAddress, // Address of the lookup table to close
  authority: user.publicKey, // Authority to close the LUT
  recipient: user.publicKey, // Recipient of the reclaimed rent balance
});
```

Attempting to close a LUT before it has been fully deactivated will result in the following error:

```
"Program AddressLookupTab1e1111111111111111111111111 invoke [1]",
"Table cannot be closed until it's fully deactivated in 513 blocks",
"Program AddressLookupTab1e1111111111111111111111111 failed: invalid program argument";
```

#### Freeze a lookup table

In addition to standard CRUD operations, you can "freeze" a lookup table. This
makes it immutable so that it can no longer be extended, deactivated, or closed.

The `freezeLookupTable` method is used for this operation and takes the following parameters:

- `lookupTable` - The address of the LUT to freeze.
- `authority` - The account with the authority to freeze the LUT.

```typescript
const freezeInstruction = AddressLookupTableProgram.freezeLookupTable({
  lookupTable: lookupTableAddress, // Address of the lookup table to freeze
  authority: user.publicKey, // Authority to freeze the LUT
});
```

Once a LUT is frozen, any attempt to modify it will result in an error like the following:

```
"Program AddressLookupTab1e1111111111111111111111111 invoke [1]",
"Lookup table is frozen",
"Program AddressLookupTab1e1111111111111111111111111 failed: Account is immutable";
```

#### Using lookup tables in versioned transactions

To utilize a lookup table in a versioned transaction, first retrieve the lookup table account using its address:

```typescript
// Fetch the lookup table account from the blockchain using its address
const lookupTableAccount = (
  await connection.getAddressLookupTable(new PublicKey(lookupTableAddress))
).value;
```

Once you have the lookup table account, you can create the list of instructions for the transaction. When constructing the `TransactionMessage`, pass the lookup table accounts as an array to the `compileToV0Message()` method. You can include multiple lookup table accounts if needed.

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

This lab will guide you through creating, extending, and using a lookup table in a versioned transaction.

#### 1. Get the starter code

To begin, download the starter code from the "starter" branch of this
[repository](https://github.com/Unboxed-Software/solana-versioned-transactions/tree/starter).
Once you have the starter code, open a terminal and run the following command to install the necessary dependencies:

```bash
npm install
```

The starter code includes an example of creating a legacy transaction that transfers SOL to 22 recipients atomically. The transaction consists of 22 instructions, with each instruction transferring SOL from the signer to a different recipient.

This setup demonstrates the limitation of legacy transactions when trying to include numerous account addresses. As a result, the transaction built in the starter code is expected to fail when sent due to the transaction size exceeding the allowed limit.

The key logic can be found in the `index.ts` file of the starter code.
```typescript
import { initializeKeypair } from "./initializeKeypair";
import * as web3 from "@solana/web3.js";

async function main() {
  // Connect to the devnet cluster
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

  // Initialize the user's keypair
  const user = await initializeKeypair(connection);
  console.log("PublicKey:", user.publicKey.toBase58());

  // Generate 22 addresses
  const recipients = [];
  for (let i = 0; i < 22; i++) {
    recipients.push(web3.Keypair.generate().publicKey);
  }

  // Create an array of transfer instructions
  const transferInstructions = [];

  // Add a transfer instruction for each address
  for (const address of recipients) {
    transferInstructions.push(
      web3.SystemProgram.transfer({
        fromPubkey: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
        toPubkey: address, // The destination account for the transfer
        lamports: web3.LAMPORTS_PER_SOL * 0.01, // The amount of lamports to transfer
      }),
    );
  }

  // Create a transaction and add the transfer instructions
  const transaction = new web3.Transaction().add(...transferInstructions);

  // Send the transaction to the cluster (this will fail in this example if addresses > 21)
  const txid = await connection.sendTransaction(transaction, [user]);

  // Get the latest blockhash and last valid block height
  const { lastValidBlockHeight, blockhash } =
    await connection.getLatestBlockhash();

  // Confirm the transaction
  await connection.confirmTransaction({
    blockhash: blockhash,
    lastValidBlockHeight: lastValidBlockHeight,
    signature: txid,
  });

  // Log the transaction URL on the Solana Explorer
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
}
```

To execute the code, run `npm start`. This will create a new keypair, write it
to the `.env` file, airdrop devnet SOL to the keypair, and send the transaction
built in the starter code. The transaction is expected to fail with the error
message `Transaction too large`.

```
Creating .env file
Current balance is 0
Airdropping 1 SOL...
New balance is 1
PublicKey: 5ZZzcDbabFHmoZU8vm3VzRzN5sSQhkf91VJzHAJGNM7B
Error: Transaction too large: 1244 > 1232
```

In the next steps, we'll go over how to use lookup tables with versioned
transactions to increase the number of addresses that can be included in a
single transaction.

Before we start, go ahead and delete the content of the `main` function to leave
only the following:

```typescript
async function main() {
  // Connect to the devnet cluster
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

  // Initialize the user's keypair
  const user = await initializeKeypair(connection);
  console.log("PublicKey:", user.publicKey.toBase58());

  // Generate 22 addresses
  const addresses = [];
  for (let i = 0; i < 22; i++) {
    addresses.push(web3.Keypair.generate().publicKey);
  }
}
```

#### 2. Create a `sendV0Transaction` helper function

We'll be sending multiple "version 0" transactions, so let's create a helper
function to facilitate this.

This function should take parameters for a connection, a user's keypair, an
array of transaction instructions, and an optional array of lookup table
accounts.

The function then performs the following tasks:

- Retrieves the latest blockhash and last valid block height from the Solana
  network
- Creates a new transaction message using the provided instructions
- Signs the transaction using the user's keypair
- Sends the transaction to the Solana network
- Confirms the transaction
- Logs the transaction URL on the Solana Explorer

```typescript
async function sendV0Transaction(
  connection: web3.Connection,
  user: web3.Keypair,
  instructions: web3.TransactionInstruction[],
  lookupTableAccounts?: web3.AddressLookupTableAccount[],
) {
  // Get the latest blockhash and last valid block height
  const { lastValidBlockHeight, blockhash } =
    await connection.getLatestBlockhash();

  // Create a new transaction message with the provided instructions
  const messageV0 = new web3.TransactionMessage({
    payerKey: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
    recentBlockhash: blockhash, // The blockhash of the most recent block
    instructions, // The instructions to include in the transaction
  }).compileToV0Message(lookupTableAccounts ? lookupTableAccounts : undefined);

  // Create a new transaction object with the message
  const transaction = new web3.VersionedTransaction(messageV0);

  // Sign the transaction with the user's keypair
  transaction.sign([user]);

  // Send the transaction to the cluster
  const txid = await connection.sendTransaction(transaction);

  // Confirm the transaction
  await connection.confirmTransaction(
    {
      blockhash: blockhash,
      lastValidBlockHeight: lastValidBlockHeight,
      signature: txid,
    },
    "finalized",
  );

  // Log the transaction URL on the Solana Explorer
  console.log(`https://explorer.solana.com/tx/${txid}?cluster=devnet`);
}
```

#### 3. Create a `waitForNewBlock` helper function

Recall that lookup tables and the addresses contained in them can't be
referenced immediately after creation or extension. This means we'll end up
needing to wait for a new block before submitting transactions that reference
the newly created or extended lookup table. To make this simpler down the road,
let's create a `waitForNewBlock` helper function that we'll use to wait for
lookup tables to activate between sending transactions.

This function will have parameters for a connection and a target block height.
It then starts an interval that checks the current block height of the network
every 1000ms. Once the new block height exceeds the target height, the interval
is cleared and the promise is resolved.

```typescript
function waitForNewBlock(connection: web3.Connection, targetHeight: number) {
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

Now that we have some helper functions ready to go, declare a function named
`initializeLookupTable`. This function has parameters `user`, `connection`, and
`addresses`. The function will:

1. Retrieve the current slot
2. Generate an instruction for creating a lookup table
3. Generate an instruction for extending the lookup table with the provided
   addresses
4. Send and confirm a transaction with the instructions for creating and
   extending the lookup table
5. Return the address of the lookup table

```typescript
async function initializeLookupTable(
  user: web3.Keypair,
  connection: web3.Connection,
  addresses: web3.PublicKey[],
): Promise<web3.PublicKey> {
  // Get the current slot
  const slot = await connection.getSlot();

  // Create an instruction for creating a lookup table
  // and retrieve the address of the new lookup table
  const [lookupTableInst, lookupTableAddress] =
    web3.AddressLookupTableProgram.createLookupTable({
      authority: user.publicKey, // The authority (i.e., the account with permission to modify the lookup table)
      payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
      recentSlot: slot - 1, // The recent slot to derive lookup table's address
    });
  console.log("lookup table address:", lookupTableAddress.toBase58());

  // Create an instruction to extend a lookup table with the provided addresses
  const extendInstruction = web3.AddressLookupTableProgram.extendLookupTable({
    payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
    authority: user.publicKey, // The authority (i.e., the account with permission to modify the lookup table)
    lookupTable: lookupTableAddress, // The address of the lookup table to extend
    addresses: addresses.slice(0, 30), // The addresses to add to the lookup table
  });

  await sendV0Transaction(connection, user, [
    lookupTableInst,
    extendInstruction,
  ]);

  return lookupTableAddress;
}
```

#### 5. Modify `main` to use lookup tables

Now that we can initialize a lookup table with all of the recipients' addresses,
let's update `main` to use versioned transactions and lookup tables. We'll need
to:

1. Call `initializeLookupTable`
2. Call `waitForNewBlock`
3. Get the lookup table using `connection.getAddressLookupTable`
4. Create the transfer instruction for each recipient
5. Send the v0 transaction with all of the transfer instructions

```typescript
async function main() {
  // Connect to the devnet cluster
  const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

  // Initialize the user's keypair
  const user = await initializeKeypair(connection);
  console.log("PublicKey:", user.publicKey.toBase58());

  // Generate 22 addresses
  const recipients = [];
  for (let i = 0; i < 22; i++) {
    recipients.push(web3.Keypair.generate().publicKey);
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
    return web3.SystemProgram.transfer({
      fromPubkey: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
      toPubkey: recipient, // The destination account for the transfer
      lamports: web3.LAMPORTS_PER_SOL * 0.01, // The amount of lamports to transfer
    });
  });

  await sendV0Transaction(connection, user, transferInstructions, [
    lookupTableAccount,
  ]);
}
```

Notice that you create the transfer instructions with the full recipient address
even though we created a lookup table. That's because by including the lookup
table in the versioned transaction, you tell the `web3.js` framework to replace
any recipient addresses that match addresses in the lookup table with pointers
to the lookup table instead. By the time the transaction is sent to the network,
addresses that exist in the lookup table will be referenced by a single byte
rather than the full 32 bytes.

Use `npm start` in the command line to execute the `main` function. You should
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

#### 6. Add more address to the lookup table

Keep in mind that the solution we've come up with so far only supports transfers
to up to 30 accounts since we only extend the lookup table once. When you factor
in the transfer instruction size, it's actually possible to extend the lookup
table with an additional 27 addresses and complete an atomic transfer to up to
57 recipients. Let's go ahead and add support for this now!

All we need to do is go into `initializeLookupTable` and do two things:

1. Modify the existing call to `extendLookupTable` to only add the first 30
   addresses (any more than that and the transaction will be too large)
2. Add a loop that will keep extending a lookup table 30 addresses at a time
   until all addresses have been added

```typescript
async function initializeLookupTable(
  user: web3.Keypair,
  connection: web3.Connection,
  addresses: web3.PublicKey[],
): Promise<web3.PublicKey> {
  // Get the current slot
  const slot = await connection.getSlot();

  // Create an instruction for creating a lookup table
  // and retrieve the address of the new lookup table
  const [lookupTableInst, lookupTableAddress] =
    web3.AddressLookupTableProgram.createLookupTable({
      authority: user.publicKey, // The authority (i.e., the account with permission to modify the lookup table)
      payer: user.publicKey, // The payer (i.e., the account that will pay for the transaction fees)
      recentSlot: slot - 1, // The recent slot to derive lookup table's address
    });
  console.log("lookup table address:", lookupTableAddress.toBase58());

  // Create an instruction to extend a lookup table with the provided addresses
  const extendInstruction = web3.AddressLookupTableProgram.extendLookupTable({
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
    const extendInstruction = web3.AddressLookupTableProgram.extendLookupTable({
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

Congratulations! If you feel good about this lab, you're probably ready to work
with lookup tables and versioned transactions on your own. If you want to take a
look at the final solution code you can
[find it on the solution branch](https://github.com/Unboxed-Software/solana-versioned-transactions/tree/solution).

## Challenge

As a challenge, experiment with deactivating, closing and freezing lookup
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
