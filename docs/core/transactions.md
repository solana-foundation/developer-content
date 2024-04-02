---
title: "Transactions and Instructions"
sidebarSortOrder: 2
---

On Solana, we send [transactions](/docs/core/transactions#transaction) made up
of [instructions](/docs/core/transactions#instruction) to interact with the
network.

You can think of instructions as APIs that programs expose to the network, where
each instruction on a program represents a specific API endpoint. Then imagine a
transaction on Solana as bundling several API requests into a single, atomic
operation that enables you to interact with multiple services simultaneously.

- If a transaction includes multiple instructions, the instructions are
  processed in the order they are added to the transaction.
- If any instruction on a transaction fails, then the whole transaction fails
  and none of the instructions get processed. This allows you to build complex
  transactions that interact with multiple programs while providing guarantees
  about the execution of the transaction.

## Transaction

Let’s begin by expanding on the details that make up a transaction:

1. **Message:** At its core, a transaction has a message. This message includes:
   - **Instructions**: An array of instructions to be executed.
   - **Recent Blockhash**: Acts as a timestamp for the transaction.
2. **Signers:** An array of signers included on the transaction.

![Transaction](/assets/docs/core/transactions/transaction.svg)

For simplicity, a transaction can be thought of as a request to process one or
multiple instructions.

![Transaction Simplified](/assets/docs/core/transactions/transaction-simple.svg)

Instructions in a transaction are processed sequentially, in the order they are
added to a transaction.

Transactions are also processed "atomically", meaning that all instructions in a
transaction either process successfully or, if one fails, the entire transaction
is rejected.

<Callout>
  By default, the first signer on the transaction is set as the fee payer unless
  otherwise specified.
</Callout>

## Instruction

An instruction is a request to process a specific action and is the smallest
contiguous unit of execution logic in a program.

Each instruction on a transaction must include the following information:

- **Program address**: Specifies the program being invoked
- **Accounts**: Lists every account the instruction reads from or writes to,
  including other programs
- **Instruction Data**: Specifies which instruction on the program to invoke,
  plus any additional data required by the instruction (function arguments)

![Transaction Instruction](/assets/docs/core/transactions/instruction.svg)

### AccountMeta

For every account required by an instruction, the following info must be
specified:

- **Account address**: The on-chain address of an account
- **is_signer**: Specify if the account is required as a signer on the
  transaction
- **is_writable**: Specify if the account data will be modified

This information is referred to as the `AccountMeta`.

![AccountMeta](/assets/docs/core/transactions/accountmeta.svg)

By specifying all accounts required by an instruction and whether each account
is writable, transactions can be processed in parallel.

For example, if two transactions do not include any accounts that write to the
same state, then the transactions can be executed at the same time.

## Basic Examples

Below is a diagram representing a transaction with a single instruction to
transfer SOL from a sender to a receiver.

Individual "wallets" on Solana are accounts owned by the
[System Program](/docs/core/accounts#system-program). As part of the
[Solana Account Model](/docs/core/accounts), only the program that owns account
is allowed to modify the data on the account.

Therefore, transferring SOL from a "wallet" account requires sending a
transaction to invoke the transfer instruction on the System Program.

![SOL Transfer](/assets/docs/core/transactions/sol-transfer.svg)

Once the transaction is sent, the System Program is invoked to process the
transfer instruction. The System Program then updates the lamport balances of
both the sender and recipient accounts accordingly.

![SOL Transfer Process](/assets/docs/core/transactions/sol-transfer-process.svg)

### Simple SOL Transfer

Here is [Solana Playground](https://beta.solpg.io/656a0ea7fb53fa325bfd0c3e)
example of how to build a SOL transfer instruction using the
`SystemProgram.transfer` method:

```typescript
// Define the amount to transfer
const transferAmount = 0.01; // 0.01 SOL

// Create a transfer instruction for transferring SOL from wallet_1 to wallet_2
const transferInstruction = SystemProgram.transfer({
  fromPubkey: sender.publicKey,
  toPubkey: receiver.publicKey,
  lamports: transferAmount * LAMPORTS_PER_SOL, // Convert transferAmount to lamports
});

// Add the transfer instruction to a new transaction
const transaction = new Transaction().add(transferInstruction);
```

### Manual SOL Transfer

Here is a [Solana Playground](https://beta.solpg.io/656a102efb53fa325bfd0c3f)
example of how to manually build the same SOL transfer instruction:

```typescript
// Define the amount to transfer
const transferAmount = 0.01; // 0.01 SOL

// Instruction index for the SystemProgram transfer instruction
const transferInstructionIndex = 2;

// Create a buffer for the data to be passed to the transfer instruction
const instructionData = Buffer.alloc(4 + 8); // uint32 + uint64
// Write the instruction index to the buffer
instructionData.writeUInt32LE(transferInstructionIndex, 0);
// Write the transfer amount to the buffer
instructionData.writeBigUInt64LE(BigInt(transferAmount * LAMPORTS_PER_SOL), 4);

// Manually create a transfer instruction for transferring SOL from sender to receiver
const transferInstruction = new TransactionInstruction({
  keys: [
    { pubkey: sender.publicKey, isSigner: true, isWritable: true },
    { pubkey: receiver.publicKey, isSigner: false, isWritable: true },
  ],
  programId: SystemProgram.programId,
  data: instructionData,
});

// Add the transfer instruction to a new transaction
const transaction = new Transaction().add(transferInstruction);
```

Under the hood, the `SystemProgram.transfer` method is functionally equivalent
to the more verbose example above. The `SystemProgram.transfer` method simply
abstracts away the details of creating the instruction data buffer and
`AccountMeta` for each account required by the instruction.

The details for building program instructions are often abstracted away by
client libraries. However, if one is not available, you can always fall back to
manually building the instruction.
