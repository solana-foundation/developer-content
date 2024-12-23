---
title: Generalized State Compression objectives

objectives:
  - Explain the flow of Solana’s state compression logic.
  - Explain the difference between a Merkle tree and a concurrent Merkle tree
  - Implement generic state compression in a basic Solana program

description:
  Understand how state compression - the technology behind compressed NFTs works
  - and learn how to apply it in your Solana programs.
---

## Summary

- State compression on Solana is primarily used for compressed NFTs (cNFTs), but
  it can be applied to any data type
- State Compression lowers the amount of data you have to store onchain using
  Merkle trees.
- A Merkle tree compresses data by hashing pairs of data repeatedly until a
  single root hash is produced. This root hash is then stored onchain.
- Each leaf on a Merkle tree is a hash of that leaf’s data.
- A concurrent Merkle tree is a specialized version of a Merkle tree. Unlike a
  standard Merkle tree, it allows multiple updates simultaneously without
  affecting transaction validity.
- Data in a state-compressed program is not stored onchain. So you have to use
  indexers to keep an offchain cache of the data. It’s this offchain cache data
  that is used to then verify against the onchain Merkle tree.

## Lesson

Previously, we talked about state compression in the context of compressed NFTs.

While compressed NFTs are the main use case for state compression, you can apply
state compression to any Solana program. In this lesson, we’ll discuss state
compression in general terms so you can use it across your Solana projects.

### A theoretical overview of state compression

Normally, data in Solana programs is serialized (usually with borsh) and stored
directly in an account. This makes it easy to read and write the data through
the program. The account data is trustworthy because only the program can modify
it.

However to verify the integrity of the data, then there’s no need to store the
actual data onchain. Instead, we can store hashes of the data, which can be used
to prove or verify its accuracy. This is called _state compression_.

These hashes take up far less storage space than the original data. The full
data can be stored in a cheaper, offchain location, and only needs to be
verified against the onchain hash when accessed.

The Solana State Compression program uses a program known as a **concurrent
Merkle tree**. A concurrent Merkle tree is a special kind of binary tree that
deterministically hashes data, i.e. the same inputs will always produce the same
Merkle root.

The final hash, called a _Merkle root_, is significantly smaller in size than
all the original full data sets combined. This is why it’s called "compression".
And it’s this hash that’s stored onchain.

**Outlined below are the steps to this process, in order:**

1. Take a piece of data.
2. Create a hash of that data.
3. Store the hash as a "leaf" at the bottom of the tree.
4. Hash pairs of leaves together to create branches.
5. Hash pairs of branches together.
6. Repeat this process until you reach the top of the tree.
7. The top of the tree contains a final "root hash."
8. Store this root hash onchain as proof of the data.
9. To verify the data, recompute the hashes and compare the final hash to the
   onchain root hash.

This method comes with some trade-offs:

1. The data isn’t stored onchain, so it’s harder to access.
2. Developers must decide how often to verify the data against the onchain hash.
3. If the data changes, the entire data set must be sent to the program, along
   with the new data. You’ll also need proof that the data matches the hash.

These considerations will guide you when deciding whether, when, and how to
implement state compression in your programs. With that quick overview, let’s go
into more technical detail.

#### Concurrent Merkle trees

Since a Merkle tree is represented as a single hash, any change to a leaf node
alters the root hash. This becomes problematic when multiple transactions in the
same slot try to update leaf data in the same slot. Since transactions are
executed serially i.e. one after the other — all but the first will fail since
the root hash and proof passed in will have been invalidated by the first
transaction executed.

In short, a standard Merkle tree can only handle one leaf update per
[slot](https://solana.com/docs/terminology#slot). This significantly limits the
throughput in a state-compressed program that depends on a single Merkle tree
for its state.

Thankfully, this issue can be addressed using a _concurrent_ Merkle tree. Unlike
a regular Merkle tree, a concurrent Merkle tree keeps a secure changelog of
recent updates, along with their root hash and the proof needed to derive it.
When multiple transactions in the same slot attempt to modify leaf data, the
changelog serves as a reference, enabling concurrent updates to the tree.

How does the concurrent Merkle tree achieve this? In a standard Merkle tree,
only the root hash is stored. However, a concurrent Merkle tree includes extra
data that ensures subsequent writes can succeed.

This includes:

1. The root hash - The same root hash found in a regular Merkle tree.
2. A changelog buffer - A buffer containing proof data for recent root hash
   changes, allowing further writes in the same slot to succeed.
3. A canopy - To update a specific leaf, you need the entire proof path from the
   leaf to the root hash. The canopy stores intermediate proof nodes along this
   path so that not all of them need to be sent from the client to the program.

### Key Parameters for Configuring a Concurrent Merkle Tree

As a developer, you are responsible for controlling three key parameters that
directly affect the tree’s size, cost, and the number of concurrent changes it
can handle:

1. **Max Depth**
2. **Max Buffer Size**
3. **Canopy Depth**

Let’s take a brief overview of each parameter.

#### Max Depth

The **max depth** determines how many levels or "hops" are required to reach the
root of the tree from any leaf. Since Merkle trees are structured as binary
trees, where each leaf is paired with only one other leaf, the max depth can be
used to calculate the total number of nodes in the tree with the formula:
`2^maxDepth`.

Here’s a quick TypeScript function for illustration:

```typescript
const getMaxDepth = (itemCount: number) => {
  if (itemCount === 0) {
    return 0;
  }
  return Math.ceil(Math.log2(itemCount));
};
```

A max depth of 20 would allow for over one million leaves, making it suitable
for storing large datasets like NFTs.

#### Max Buffer Size

The **max buffer size** controls how many concurrent updates can be made to the
tree within a single slot while keeping the root hash valid. In a standard
Merkle tree, only the first transaction in a slot would be successful since it
updates the root hash, causing all subsequent transactions to fail due to hash
mismatches. However, in a concurrent Merkle tree, the buffer maintains a log of
changes, allowing multiple transactions to update the tree simultaneously by
checking the appropriate root hash from the buffer. A larger buffer size
increases throughput by enabling more concurrent changes.

#### Canopy Depth

The **canopy depth** specifies how many proof nodes are stored onchain for any
given proof path. To verify any leaf in the tree, you need a complete proof
path, which includes one proof node for every layer of the tree. For a tree with
a max depth of 14, there will be 14 proof nodes in total. Each proof node adds
32 bytes to the transaction, and without careful management, large trees could
exceed the transaction size limit.

Storing more proof nodes onchain (i.e., having a deeper canopy) allows other
programs to interact with your tree without exceeding transaction limits, but it
also uses more onchain storage. Consider the complexity of interactions with
your tree when deciding on an appropriate canopy depth.

### Balancing Trade-offs

These three values—max depth, max buffer size, and canopy depth—all come with
trade-offs. Increasing any of them will enlarge the account used to store the
tree, raising the cost of creating the tree.

- **Max Depth:** This is straightforward to determine based on how much data
  needs to be stored. For example, if you need to store 1 million compressed
  NFTs (cNFTs), where each cNFT is a leaf, you would need a max depth of 20
  (`2^maxDepth > 1 million`).
- **Max Buffer Size:** The choice of buffer size is mainly a question of
  throughput—how many concurrent updates are required? A larger buffer allows
  for more updates in the same slot.
- **Canopy Depth:** A deeper canopy improves composability, enabling other
  programs to interact with your state-compressed program without exceeding
  transaction size limits. Omitting the canopy is discouraged, as it could cause
  issues with transaction size, especially when other programs are involved.

### Data Access in a State-Compressed Program

In a state-compressed program, the actual data isn’t stored directly onchain.
Instead, the concurrent Merkle tree structure is stored, while the raw data
resides in the blockchain’s more affordable ledger state. This makes accessing
the data more challenging, but not impossible.

The Solana ledger is essentially a list of entries containing signed
transactions, which can be traced back to the Genesis block theoretically. This
means any data that has ever been included in a transaction is stored in the
ledger.

Since the state compression process happens onchain, all the data is still in
the ledger state. In theory, you could retrieve the original data by replaying
the entire chain state from the start. However, it’s far more practical (though
still somewhat complex) to use an indexer to track and index the data as the
transactions happen. This creates an offchain "cache" of the data that can be
easily accessed and verified against the onchain root hash.

While this process may seem complex at first, it becomes clearer with practice.

### State Compression Tooling

While understanding the theory behind state compression is crucial, you don’t
have to build it all from scratch. Talented engineers have already developed
essential tools like the SPL State Compression Program and the Noop Program to
simplify the process.

#### SPL State Compression and Noop Programs

The SPL State Compression Program is designed to streamline and standardize the
creation and management of concurrent Merkle trees across the Solana ecosystem.
It provides Instruction Handlers for initializing Merkle trees, handling tree
leaves (such as adding, updating, or removing data), and verifying the integrity
of leaf data.

Additionally, the State Compression Program works in conjunction with a separate
"Noop" program. A [no-op program](<https://en.wikipedia.org/wiki/NOP_(code)>)
does nothing - literally 'no operation.' The Solana Noop Program only logs data
to the ledger state, however that logging is essential to state compression:

When you store compressed data, it’s passed to the State Compression Program,
which hashes the data and emits it as an "event" to the Noop Program. While the
hash is stored in the concurrent Merkle tree, the raw data can still be accessed
via the Noop Program’s transaction logs.

### Indexing Data for Easy Lookup

Typically, accessing onchain data is as simple as fetching the relevant account.
However, with state compression, it’s not that straightforward.

As mentioned earlier, the data now resides in the ledger state rather than in an
account. The most accessible place to find the complete data is in the logs of
the Noop instruction. While this data remains in the ledger state indefinitely,
it may become inaccessible through validators after a certain period.

Validators don’t store all transactions back to the Genesis block to save space
and improve performance. The length of time you can access Noop instruction logs
varies depending on the validator. Eventually, the logs will become unavailable
if you’re relying on direct access to them.

In theory, it’s possible to replay transaction states back to the genesis block,
but this approach is impractical for most teams and isn’t efficient. Some RPC
providers have adopted the
[Digital Asset Standard (DAS)](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)
to enable efficient querying of compressed NFTs and other assets. However, as of
now, DAS does not support arbitrary state compression.

You essentially have two main options:

1. Use an indexing provider to create a custom indexing solution for your
   program, which will monitor the events sent to the Noop program and store the
   relevant data offchain.
2. Build your indexing solution that stores transaction data offchain.

For many dApps, option 2 can be a practical choice. Larger-scale applications,
however, may need to rely on infrastructure providers to manage their indexing
needs.

### State Compression Development Process

#### Create Rust Types

In a typical Anchor program, developers often start by defining the Rust types
that represent accounts. For a state-compressed program, however, the focus
shifts to defining types that align with the Merkle tree structure.

In state compression, your onchain account will primarily store the Merkle tree.
The more practical data will be serialized and logged to the Noop program for
easier access and management. Your Rust types should encompass all data stored
in the leaf nodes and any contextual information necessary for interpreting that
data. For instance, if you’re developing a simple messaging program, your
`Message` struct might look something like this:

```rust
const DISCRIMINATOR_SIZE: usize = 8;
const PUBKEY_SIZE: usize = 32;

/// A log entry for messages sent between two public keys.
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MessageLog {
    /// The leaf node hash for message logging.
    pub leaf_node: [u8; DISCRIMINATOR_SIZE + PUBKEY_SIZE],
    /// The public key of the message sender.
    pub from: Pubkey,
    /// The public key of the message recipient.
    pub to: Pubkey,
    /// The actual message content.
    pub message: String,
}

/// Constructs a new `MessageLog`.
///
/// # Arguments
///
/// * `leaf_node` - A 32-byte array representing the leaf node hash.
/// * `from` - The public key of the message sender.
/// * `to` - The public key of the message recipient.
/// * `message` - The message to be sent.
///
/// # Returns
///
/// Returns a new `MessageLog` instance.
pub fn new_message_log(leaf_node: [u8; DISCRIMINATOR_SIZE + PUBKEY_SIZE], from: Pubkey, to: Pubkey, message: String) -> MessageLog {
    MessageLog { leaf_node, from, to, message }
}
```

To be absolutely clear, the **`MessageLog` is not an account you will read
from**. Instead, your program will create an instance of `MessageLog` using
inputs from Instructions Handler, rather than constructing it from data read
from an account. We will cover how to read data from compressed accounts later.

#### Initialize a New Tree

To set up a new Merkle tree, clients need to perform two distinct steps.

1. First, they allocate the account by calling the System Program.
2. Next, they use a custom program to initialize the new account. This
   initialization involves setting the maximum depth and buffer size for the
   Merkle tree.

The initialization Instruction Handler must create a CPI (Cross-Program
Invocation) to call the `init_empty_merkle_tree` instruction from the State
Compression Program. You’ll need to provide the maximum depth and buffer size as
arguments to this instruction Handler.

- **Max depth**: Defines the maximum number of hops needed to travel from any
  leaf to the root of the tree.
- **Max buffer size**: Specifies the space allocated for storing a changelog of
  tree updates. This changelog is essential for supporting concurrent updates
  within the same block.

For instance, if you are initializing a tree to store messages between users,
your Instruction Handler might look like this:

```rust
/// Initializes an empty Merkle tree for storing messages with a specified depth and buffer size.
///
/// This function creates a CPI (Cross-Program Invocation) call to initialize the Merkle tree account
/// using the provided authority and compression program. The PDA (Program Derived Address) seeds are used for
/// signing the transaction.
///
/// # Arguments
///
/// * `ctx` - The context containing the accounts required for Merkle tree initialization.
/// * `max_depth` - The maximum depth of the Merkle tree.
/// * `max_buffer_size` - The maximum buffer size of the Merkle tree.
///
/// # Returns
///
/// This function returns a `Result<()>`, indicating success or failure.
///
/// # Errors
///
/// This function will return an error if the CPI call to `init_empty_merkle_tree` fails.
pub fn create_messages_tree(
    ctx: Context<MessageAccounts>,
    max_depth: u32, // Max depth of the Merkle tree
    max_buffer_size: u32 // Max buffer size of the Merkle tree
) -> Result<()> {
    // Get the address for the Merkle tree account
    let merkle_tree = ctx.accounts.merkle_tree.key();

    // The seeds for PDAs signing
    let signers_seeds: &[&[&[u8]]] = &[
        &[
            merkle_tree.as_ref(), // The address of the Merkle tree account
            &[*ctx.bumps.get("tree_authority").unwrap()], // The bump seed for the PDA
        ],
    ];

    // Create CPI context for `init_empty_merkle_tree` instruction handler
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.compression_program.to_account_info(), // The SPL account compression program
        Initialize {
            authority: ctx.accounts.tree_authority.to_account_info(), // The authority for the Merkle tree, using a PDA
            merkle_tree: ctx.accounts.merkle_tree.to_account_info(), // The Merkle tree account to be initialized
            noop: ctx.accounts.log_wrapper.to_account_info(), // The noop program to log data
        },
        signers_seeds // The seeds for PDAs signing
    );

    // CPI to initialize an empty Merkle tree with the given max depth and buffer size
    init_empty_merkle_tree(cpi_ctx, max_depth, max_buffer_size)?;

    Ok(())
}
```

#### Adding Hashes to the Tree

Once the Merkle tree is initialized, you can begin adding data hashes to it.
This process involves passing the uncompressed data to an Instruction handler
within your program, which will hash the data, log it to the Noop Program, and
then use the State Compression Program’s `append` instruction to add the hash to
the tree. Here’s how the Instruction Handler operates in detail:

1. **Hash the Data**: Use the `hashv` function from the `keccak` crate to hash
   the data. It’s recommended to include the data owner or authority in the hash
   to ensure that only the proper authority can modify it.
2. **Log the Data**: Create a log object representing the data you want to log
   to the Noop Program. Then, call `wrap_application_data_v1` to issue a CPI
   (Cross-Program Invocation) to the Noop Program with this object. This makes
   the uncompressed data easily accessible to any client, such as indexers, that
   may need it. You could also develop a custom client to observe and index data
   for your application specifically.

3. **Append the Hash**: Construct and issue a CPI to the State Compression
   Program’s `append` Instruction. This will take the hash generated in step 1
   and append it to the next available leaf on the Merkle tree. As with previous
   steps, this requires the Merkle tree address and tree authority bump as
   signature seeds.

When applied to a messaging system, the resulting implementation might look like
this:

```rust
/// Appends a message to the Merkle tree.
///
/// This function hashes the message and the sender’s public key to create a leaf node,
/// logs the message using the noop program, and appends the leaf node to the Merkle tree.
///
/// # Arguments
///
/// * `ctx` - The context containing the accounts required for appending the message.
/// * `message` - The message to append to the Merkle tree.
///
/// # Returns
///
/// This function returns a `Result<()>`, indicating success or failure.
///
/// # Errors
///
/// This function will return an error if any of the CPI calls (logging or appending) fail.
pub fn append_message(ctx: Context<MessageAccounts>, message: String) -> Result<()> {
    // Hash the message + sender’s public key to create a leaf node
    let leaf_node = keccak::hashv(&[message.as_bytes(), ctx.accounts.sender.key().as_ref()]).to_bytes();

    // Create a new "MessageLog" using the leaf node hash, sender, recipient, and message
    let message_log = new_message_log(
        leaf_node.clone(),
        ctx.accounts.sender.key().clone(),
        ctx.accounts.recipient.key().clone(),
        message,
    );

    // Log the "MessageLog" data using the noop program
    wrap_application_data_v1(message_log.try_to_vec()?, &ctx.accounts.log_wrapper)?;

    // Get the Merkle tree account address
    let merkle_tree = ctx.accounts.merkle_tree.key();

    // The seeds for PDAs signing
    let signers_seeds: &[&[&[u8]]] = &[
        &[
            merkle_tree.as_ref(), // The address of the Merkle tree account as a seed
            &[*ctx.bumps.get("tree_authority").unwrap()], // The bump seed for the PDA
        ],
    ];

    // Create a CPI context and append the leaf node to the Merkle tree
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.compression_program.to_account_info(), // The SPL account compression program
        Modify {
            authority: ctx.accounts.tree_authority.to_account_info(), // Authority for the Merkle tree, using a PDA
            merkle_tree: ctx.accounts.merkle_tree.to_account_info(), // The Merkle tree account to be modified
            noop: ctx.accounts.log_wrapper.to_account_info(), // The noop program to log data
        },
        signers_seeds, // The seeds for PDAs signing
    );

    // CPI call to append the leaf node to the Merkle tree
    append(cpi_ctx, leaf_node)?;

    Ok(())
}
```

#### Updating Hashes

To update a leaf in a Merkle tree, you’ll need to generate a new hash to replace
the existing one. This process requires four key inputs:

1. The index of the leaf you wish to update
2. The root hash of the Merkle tree
3. The original data you want to modify
4. The updated data

Using these inputs, you can follow a series of steps similar to those used when
initially appending data to the tree:

1. **Verify Update Authority**: The first step, unique to updates, is to verify
   the authority of the entity making the update. This generally involves
   checking that the signer of the `update` transaction is indeed the owner or
   authority of the leaf at the specified index. Since the data in the leaf is
   hashed, you can’t directly compare the authority’s public key to a stored
   value. Instead, compute the previous hash using the old data and the
   `authority` listed in the account validation struct. Then, invoke a CPI to
   the State Compression Program’s `verify_leaf` instruction to confirm the hash
   matches.

2. **Hash the New Data**: This step mirrors the hashing process for appending
   data. Use the `hashv` function from the `keccak` crate to hash the new data
   and the update authority, converting each to its corresponding byte
   representation.

3. **Log the New Data**: As with the initial append operation, create a log
   object to represent the new data, and use `wrap_application_data_v1` to
   invoke the Noop Program via CPI. This ensures that the new uncompressed data
   is logged and accessible offchain.

4. **Replace the Existing Leaf Hash**: This step is slightly different from
   appending new data. Here, you’ll need to invoke a CPI to the State
   Compression Program’s `replace_leaf` instruction. This operation will replace
   the existing hash at the specified leaf index with the new hash. You’ll need
   to provide the old hash, the new hash, and the leaf index. As usual, the
   Merkle tree address and tree authority bump are required as signature seeds.

When combined, the instructions for updating a hash might look like this:

```rust
/// Updates a message in the Merkle tree.
///
/// This function verifies the old message in the Merkle tree by checking its leaf node,
/// and then replaces it with a new message by modifying the Merkle tree’s leaf node.
///
/// # Arguments
///
/// * `ctx` - The context containing the accounts required for updating the message.
/// * `index` - The index of the leaf node to update.
/// * `root` - The root hash of the Merkle tree.
/// * `old_message` - The old message that is currently in the Merkle tree.
/// * `new_message` - The new message to replace the old message.
///
/// # Returns
///
/// This function returns a `Result<()>`, indicating success or failure.
///
/// # Errors
///
/// This function will return an error if verification or replacement of the Merkle tree leaf fails.
pub fn update_message(
    ctx: Context<MessageAccounts>,
    index: u32,
    root: [u8; 32],
    old_message: String,
    new_message: String
) -> Result<()> {
    // Hash the old message + sender’s public key to create the old leaf node
    let old_leaf = keccak::hashv(&[old_message.as_bytes(), ctx.accounts.sender.key().as_ref()]).to_bytes();

    // Get the Merkle tree account address
    let merkle_tree = ctx.accounts.merkle_tree.key();

    // The seeds for PDAs signing
    let signers_seeds: &[&[&[u8]]] = &[
        &[
            merkle_tree.as_ref(), // The address of the Merkle tree account as a seed
            &[*ctx.bumps.get("tree_authority").unwrap()], // The bump seed for the PDA
        ],
    ];

    // Verify the old leaf node in the Merkle tree
    {
        // If the old and new messages are the same, no update is needed
        if old_message == new_message {
            msg!("Messages are the same!");
            return Ok(());
        }

        // Create CPI context for verifying the leaf node
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.compression_program.to_account_info(), // The SPL account compression program
            VerifyLeaf {
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(), // The Merkle tree account to be verified
            },
            signers_seeds, // The seeds for PDAs signing
        );

        // Verify the old leaf node in the Merkle tree
        verify_leaf(cpi_ctx, root, old_leaf, index)?;
    }

    // Hash the new message + sender’s public key to create the new leaf node
    let new_leaf = keccak::hashv(&[new_message.as_bytes(), ctx.accounts.sender.key().as_ref()]).to_bytes();

    // Log the new message for indexers using the noop program
    let message_log = new_message_log(
        new_leaf.clone(),
        ctx.accounts.sender.key().clone(),
        ctx.accounts.recipient.key().clone(),
        new_message,
    );
    wrap_application_data_v1(message_log.try_to_vec()?, &ctx.accounts.log_wrapper)?;

    // Replace the old leaf with the new leaf in the Merkle tree
    {
        // Create CPI context for replacing the leaf node
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.compression_program.to_account_info(), // The SPL account compression program
            Modify {
                authority: ctx.accounts.tree_authority.to_account_info(), // The authority for the Merkle tree, using a PDA
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(), // The Merkle tree account to be modified
                noop: ctx.accounts.log_wrapper.to_account_info(), // The noop program to log data
            },
            signers_seeds, // The seeds for PDAs signing
        );

        // Replace the old leaf node with the new one in the Merkle tree
        replace_leaf(cpi_ctx, root, old_leaf, new_leaf, index)?;
    }

    Ok(())
}
```

#### Deleting Hashes

As of now, the State Compression Program does not have a dedicated `delete`
instruction.

Instead, you can simulate deletion by updating the leaf data with a value that
signals it has been "deleted."

The exact value you choose will depend on your specific use case and security
requirements. For some, this may involve setting all data fields to zero, while
others might prefer storing a predefined static string that marks the leaf as
deleted. This approach allows you to handle deletions in a way that suits your
application’s needs without compromising data integrity.

#### Accessing Data from a Client

We’ve covered creating, updating, and deleting data in state compression, but
reading data presents its unique challenges.

Accessing compressed data from a client can be tricky because the Merkle tree
stores only data hashes, which cannot be used to recover the original data.
Additionally, the uncompressed data logged to the Noop program is not retained
indefinitely.

To access this data, you generally have two options:

1. **Work with an indexing provider** to develop a custom solution tailored to
   your program. This allows you to write client-side code to retrieve and
   access the data based on how the indexer provides it.
2. **Create your own pseudo-indexer** to store and retrieve the data, offering a
   lighter-weight solution.

If your project is decentralized and expects widespread interaction beyond your
frontend, option 2 might not be sufficient. However, if you have control over
most program interactions, this approach can work.

There’s no one-size-fits-all solution here. Two potential strategies include:

1. **Store raw data**: One approach is to store the raw data in a database
   simultaneously by sending it to the program. This allows you to keep a record
   of the data, along with the Merkle tree leaf where the data was hashed and
   stored.

2. **Create a transaction observer**: Another approach is to create a server
   that observes the transactions your program executes. This server would fetch
   transactions, look up the related Noop logs, decode them, and store the data.

When writing tests in the lab, we’ll simulate both of these approaches, although
instead of using a database, the data will be stored in memory for the test’s
duration.

The process of setting this up can be a bit complex. For a given transaction,
you’ll retrieve it from the RPC provider, extract the inner instructions related
to the Noop program, and use the `deserializeApplicationDataEvent` function from
the `@solana/spl-account-compression` JS package to decode the logs. Then,
you’ll use Borsh to deserialize the data. Here’s an example from the messaging
program to illustrate the process:

```typescript
export async function getMessageLog(
  connection: Connection,
  txSignature: string,
) {
  // Confirm the transaction, otherwise the getTransaction sometimes returns null
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: txSignature,
  });

  // Get the transaction info using the tx signature
  const txInfo = await connection.getTransaction(txSignature, {
    maxSupportedTransactionVersion: 0,
  });

  // Get the inner instructions related to the program instruction at index 0
  // We only send one instruction in test transaction, so we can assume the first
  const innerIx = txInfo!.meta?.innerInstructions?.[0]?.instructions;

  // Get the inner instructions that match the SPL_NOOP_PROGRAM_ID
  const noopInnerIx = innerIx.filter(
    instruction =>
      txInfo?.transaction.message.staticAccountKeys[
        instruction.programIdIndex
      ].toBase58() === SPL_NOOP_PROGRAM_ID.toBase58(),
  );

  let messageLog: MessageLog;
  for (let i = noopInnerIx.length - 1; i >= 0; i--) {
    try {
      // Try to decode and deserialize the instruction data
      const applicationDataEvent = deserializeApplicationDataEvent(
        Buffer.from(bs58.decode(noopInnerIx[i]?.data!)),
      );

      // Get the application data
      const applicationData = applicationDataEvent.fields[0].applicationData;

      // Deserialize the application data into MessageLog instance
      messageLog = deserialize(
        MessageLogBorshSchema,
        MessageLog,
        Buffer.from(applicationData),
      );

      if (messageLog !== undefined) {
        break;
      }
    } catch (__) {}
  }

  return messageLog;
}
```

### Conclusion

Implementing generalized state compression may be challenging, but it is
entirely achievable using the available tools. As the ecosystem evolves, these
tools and programs will continue to improve, making the process more
streamlined. If you discover solutions that enhance your development experience,
please don’t hesitate to share them with the community!

<Callout type="info" title="Testing">
Remember to write comprehensive tests for your state compression implementation. This ensures your program behaves correctly and helps catch potential issues early in the development process.
</Callout>

## Lab: Building a Note-Taking App with Generalized State Compression

In this lab, we’ll walk through the process of developing an Anchor program that
uses custom state compression to power a basic note-taking app. This will give
you hands-on experience in working with compressed data and help reinforce key
concepts around state compression on Solana.

#### 1. Set up the Project

Start by initializing an Anchor program:

```bash
anchor init compressed-notes
```

Next, we’ll add the `spl-account-compression` crate with the `cpi` feature
enabled. To do this, update the `Cargo.toml` file located at
`programs/compressed-notes` by adding the following dependency:

```toml
[dependencies]
anchor-lang = "0.28.0"
spl-account-compression = { version="0.2.0", features = ["cpi"] }
solana-program = "1.16.0"
```

We’ll be running tests locally, but we’ll need both the State Compression
Program and the Noop Program from the Mainnet to do so. To make sure these
programs are available on our local cluster, we need to include them in the
`Anchor.toml` file located in the root directory. Here’s how you can add them:

In `Anchor.toml`, update the programs section with the following entries:

```toml
[test.validator]
url = "https://api.mainnet-beta.solana.com"

[[test.validator.clone]]
address = "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"

[[test.validator.clone]]
address = "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"
```

Finally, let’s set up the `lib.rs` file for the remainder of the demo. Start by
removing the `initialize` instruction and the `Initialize` accounts struct.
Next, add the necessary imports as indicated in the code snippet, making sure to
include **_your_** program ID.

```rust
use anchor_lang::{
    prelude::*,
    solana_program::keccak,
};
use spl_account_compression::{
    Noop,
    program::SplAccountCompression,
    cpi::{
        accounts::{Initialize, Modify, VerifyLeaf},
        init_empty_merkle_tree, verify_leaf, replace_leaf, append,
    },
    wrap_application_data_v1,
};

// Replace with your program ID
declare_id!("PROGRAM_PUBLIC_KEY_GOES_HERE");

/// A program that manages compressed notes using a Merkle tree for efficient storage and verification.
#[program]
pub mod compressed_notes {
    use super::*;

    // Define your program instructions here.

    /// Initializes a new Merkle tree for storing messages.
    ///
    /// This function creates a Merkle tree with the specified maximum depth and buffer size.
    ///
    /// # Arguments
    ///
    /// * `ctx` - The context containing the accounts required for initializing the tree.
    /// * `max_depth` - The maximum depth of the Merkle tree.
    /// * `max_buffer_size` - The maximum buffer size of the Merkle tree.
    pub fn create_messages_tree(
        ctx: Context<MessageAccounts>,
        max_depth: u32,
        max_buffer_size: u32,
    ) -> Result<()> {
        // Tree creation logic here
        Ok(())
    }

    /// Appends a new message to the Merkle tree.
    ///
    /// This function hashes the message and adds it as a leaf node to the tree.
    ///
    /// # Arguments
    ///
    /// * `ctx` - The context containing the accounts required for appending the message.
    /// * `message` - The message to append to the Merkle tree.
    pub fn append_message(ctx: Context<MessageAccounts>, message: String) -> Result<()> {
        // Message appending logic here
        Ok(())
    }

    /// Updates an existing message in the Merkle tree.
    ///
    /// This function verifies the old message and replaces it with the new message in the tree.
    ///
    /// # Arguments
    ///
    /// * `ctx` - The context containing the accounts required for updating the message.
    /// * `index` - The index of the message in the tree.
    /// * `root` - The root of the Merkle tree.
    /// * `old_message` - The old message to be replaced.
    /// * `new_message` - The new message to replace the old message.
    pub fn update_message(
        ctx: Context<MessageAccounts>,
        index: u32,
        root: [u8; 32],
        old_message: String,
        new_message: String,
    ) -> Result<()> {
        // Message updating logic here
        Ok(())
    }

    // Add more functions as needed
}

// Add structs for accounts, state, etc., here

/// Struct for holding the account information required for message operations.
#[derive(Accounts)]
pub struct MessageAccounts<'info> {
    /// The Merkle tree account.
    #[account(mut)]
    pub merkle_tree: AccountInfo<'info>,
    /// The authority for the Merkle tree.
    pub tree_authority: AccountInfo<'info>,
    /// The sender’s account.
    pub sender: Signer<'info>,
    /// The recipient’s account.
    pub recipient: AccountInfo<'info>,
    /// The compression program (Noop program).
    pub compression_program: Program<'info, SplAccountCompression>,
    /// The log wrapper account for logging data.
    pub log_wrapper: AccountInfo<'info>,
}
```

For the remainder of this demo, we’ll be making updates directly in the `lib.rs`
file. This approach simplifies the explanations. You can modify the structure as
needed.

It’s a good idea to build your project now to confirm that your environment is
set up correctly and to reduce build times in the future.

#### 2. Define `Note` schema

Next, we’ll define the structure of a note within our program. Each note should
have the following attributes:

- `leaf_node` - a 32-byte array representing the hash stored on the leaf node.
- `owner` - the public key of the note’s owner.
- `note` - a string containing the text of the note.

```rust
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
/// A struct representing a log entry in the Merkle tree for a note.
pub struct NoteLog {
    /// The leaf node hash generated from the note data.
    pub leaf_node: [u8; 32],
    /// The public key of the note’s owner.
    pub owner: Pubkey,
    /// The content of the note.
    pub note: String,
}

/// Constructs a new note log from a given leaf node, owner, and note message.
///
/// # Arguments
///
/// * `leaf_node` - A 32-byte array representing the hash of the note.
/// * `owner` - The public key of the note’s owner.
/// * `note` - The note message content.
///
/// # Returns
///
/// A new `NoteLog` struct containing the provided data.
pub fn create_note_log(leaf_node: [u8; 32], owner: Pubkey, note: String) -> NoteLog {
    NoteLog { leaf_node, owner, note }
}
```

In a traditional Anchor program, a note would typically be represented by a
`Note` struct using the `account` macro. However, because we’re using state
compression we use `NoteLog`, a struct with the `AnchorSerialize` macro applied.

#### 3. Define Account Constraints

All our instruction handlers will use the same
[account constraints](https://www.anchor-lang.com/docs/account-constraints):

- `owner` - The creator and owner of the note, who must sign the transaction.
- `tree_authority` - The authority for the Merkle tree, used for signing
  compression-related CPIs.
- `merkle_tree` - The address of the Merkle tree where note hashes are stored;
  this will be unchecked as it’s validated by the State Compression Program.
- `log_wrapper` - The address of the Noop Program.
- `compression_program` - The address of the State Compression Program.

```rust
#[derive(Accounts)]
/// Accounts required for interacting with the Merkle tree for note management.
pub struct NoteAccounts<'info> {
    /// The payer for the transaction, who also owns the note.
    #[account(mut)]
    pub owner: Signer<'info>,

    /// The PDA (Program Derived Address) authority for the Merkle tree.
    /// This account is only used for signing and is derived from the Merkle tree address.
    #[account(
        seeds = [merkle_tree.key().as_ref()],
        bump,
    )]
    pub tree_authority: SystemAccount<'info>,

    /// The Merkle tree account, where the notes are stored.
    /// This account is validated by the SPL Account Compression program.
    ///
    /// The `UncheckedAccount` type is used since the account’s validation is deferred to the CPI.
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

    /// The Noop program used for logging data.
    /// This is part of the SPL Account Compression stack and logs the note operations.
    pub log_wrapper: Program<'info, Noop>,

    /// The SPL Account Compression program used for Merkle tree operations.
    pub compression_program: Program<'info, SplAccountCompression>,
}
```

#### 4. Create `create_note_tree` Instruction handler

Next, we’ll make the `create_note_tree` instruction handler, to initialize the
already allocated Merkle tree account.

To implement this, you’ll need to build a CPI to invoke the
`init_empty_merkle_tree` instruction from the State Compression Program. The
`NoteAccounts` struct will provide the necessary accounts, but you’ll also need
to include two additional arguments:

1. **`max_depth`** - Specifies the maximum depth of the Merkle tree, indicating
   the longest path from any leaf to the root.
2. **`max_buffer_size`** - Defines the maximum buffer size for the Merkle tree,
   which determines the space allocated for recording tree updates. This buffer
   is crucial for supporting concurrent updates within the same block.

```rust
#[program]
pub mod compressed_notes {
    use super::*;

    /// Instruction to create a new note tree (Merkle tree) for storing compressed notes.
    ///
    /// # Arguments
    /// * `ctx` - The context that includes the accounts required for this transaction.
    /// * `max_depth` - The maximum depth of the Merkle tree.
    /// * `max_buffer_size` - The maximum buffer size of the Merkle tree.
    ///
    /// # Returns
    /// * `Result<()>` - Returns a success or error result.
    pub fn create_note_tree(
        ctx: Context<NoteAccounts>,
        max_depth: u32,       // Max depth of the Merkle tree
        max_buffer_size: u32, // Max buffer size of the Merkle tree
    ) -> Result<()> {
        // Get the address for the Merkle tree account
        let merkle_tree = ctx.accounts.merkle_tree.key();

        // The seeds for PDAs signing
        let signers_seeds: &[&[&[u8]]] = &[&[
            merkle_tree.as_ref(), // The Merkle tree account address as the seed
            &[*ctx.bumps.get("tree_authority").unwrap()], // The bump seed for the tree authority PDA
        ]];

        // Create a CPI (Cross-Program Invocation) context for initializing the empty Merkle tree.
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.compression_program.to_account_info(), // The SPL Account Compression program
            Initialize {
                authority: ctx.accounts.tree_authority.to_account_info(), // PDA authority for the Merkle tree
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(),  // The Merkle tree account
                noop: ctx.accounts.log_wrapper.to_account_info(),        // The Noop program for logging data
            },
            signers_seeds, // The seeds for PDAs signing
        );

        // CPI call to initialize an empty Merkle tree with the specified depth and buffer size.
        init_empty_merkle_tree(cpi_ctx, max_depth, max_buffer_size)?;

        Ok(())
    }

    // Additional functions for the program can go here...
}
```

Make sure that when setting up your CPI, you include both the Merkle tree
address and the tree authority bump in the signer seeds.

#### 5. Create `append_note` Instruction handler

Let’s create the `append_note` instruction handler. This will compress a raw
note into a hash and store it on the Merkle tree, while also logging the note to
the Noop program to ensure all data remains available onchain.

Here’s how to accomplish this:

1. **Hash the Data**: Utilize the `hashv` function from the `keccak` crate to
   compute a hash of the note and the owner’s public key. Both should be
   converted to their byte representations. It’s essential to hash the owner
   along with the note to facilitate ownership verification during updates.

2. **Log the Data**: Create a `NoteLog` instance with the hash from step 1, the
   owner’s public key, and the note as a `String`. Then, use
   `wrap_application_data_v1` to issue a CPI to the Noop program with this
   `NoteLog` instance. This ensures the complete note (not just the hash) is
   available to clients, similar to how indexers manage cNFTs. You might also
   develop an observing client to simulate indexer functionality specific to
   your application.

3. **Append to the Merkle Tree**: Build and issue a CPI to the State Compression
   Program’s `append` instruction. This will add the hash from step 1 to the
   next available leaf on your Merkle tree. Ensure that the Merkle tree address
   and the tree authority bump are included as signature seeds.

```rust
#[program]
pub mod compressed_notes {
    use super::*;

    //...

    /// Instruction to append a note to the Merkle tree.
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts needed for this transaction.
    /// * `note` - The note message to append as a leaf node in the Merkle tree.
    ///
    /// # Returns
    /// * `Result<()>` - Returns a success or error result.
    pub fn append_note(ctx: Context<NoteAccounts>, note: String) -> Result<()> {
        // Step 1: Hash the note message to create a leaf node for the Merkle tree
        let leaf_node = keccak::hashv(&[note.as_bytes(), ctx.accounts.owner.key().as_ref()]).to_bytes();

        // Step 2: Create a new NoteLog instance containing the leaf node, owner, and note
        let note_log = NoteLog::new(leaf_node.clone(), ctx.accounts.owner.key().clone(), note);

        // Step 3: Log the NoteLog data using the Noop program
        wrap_application_data_v1(note_log.try_to_vec()?, &ctx.accounts.log_wrapper)?;

        // Step 4: Get the Merkle tree account key (address)
        let merkle_tree = ctx.accounts.merkle_tree.key();

        // Step 5: The seeds for PDAs signing
        let signers_seeds: &[&[&[u8]]] = &[&[
            merkle_tree.as_ref(), // The address of the Merkle tree account as a seed
            &[*ctx.bumps.get("tree_authority").unwrap()], // The bump seed for the PDA
        ]];

        // Step 6: Create a CPI (Cross-Program Invocation) context to modify the Merkle tree
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.compression_program.to_account_info(), // SPL Account Compression program
            Modify {
                authority: ctx.accounts.tree_authority.to_account_info(), // The PDA authority for the
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(),  // The Merkle tree account to modify
                noop: ctx.accounts.log_wrapper.to_account_info(),        // The Noop program for logging data
            },
            signers_seeds, // Seeds for PDAs with that will sign the transaction
        );

        // Step 7: Append the leaf node to the Merkle tree using CPI
        append(cpi_ctx, leaf_node)?;

        Ok(())
    }

    //...
}
```

#### 6. Create `update_note` Instruction Handler

The final instruction we’ll implement is `update_note`, which will replace an
existing leaf with a new hash that represents the updated note data.

To perform this update, you’ll need the following parameters:

1. **Index**: The index of the leaf to be updated.
2. **Root**: The root hash of the Merkle tree.
3. **Old Note**: The string representation of the note that is being updated.
4. **New Note**: The string representation of the updated note.

The process for this instruction is similar to `append_note`, with some
additional steps:

1. **Verify Ownership**: Before updating, prove that the `owner` executing this
   instruction is the rightful owner of the leaf at the specified index. Since
   the leaf data is compressed as a hash, you can’t directly compare the
   `owner`'s public key. Instead, compute the previous hash using the old note
   data and the `owner` from the account validation struct. Then, use this
   computed hash to build and issue a CPI to the State Compression Program’s
   `verify_leaf` instruction.

2. **Hash the New Data**: Hash the new note and the owner’s public key using the
   `hashv` function from the `keccak` crate, converting each to its byte
   representation.

3. **Log the New Data**: Create a `NoteLog` instance with the new hash from step
   2, the owner’s public key, and the new note. Call `wrap_application_data_v1`
   to issue a CPI to the Noop program with this `NoteLog` instance, ensuring the
   updated note data is available to clients.

4. **Replace the Leaf**: Build and issue a CPI to the State Compression
   Program’s `replace_leaf` instruction. This will replace the old hash with the
   new hash at the specified leaf index. Ensure the Merkle tree address and the
   tree authority bump are included as signature seeds.

```rust
#[program]
pub mod compressed_notes {
    use super::*;

    //...

    /// Instruction to update a note in the Merkle tree.
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts needed for this transaction.
    /// * `index` - The index of the note to update in the Merkle tree.
    /// * `root` - The root hash of the Merkle tree for verification.
    /// * `old_note` - The current note to be updated.
    /// * `new_note` - The new note that will replace the old one.
    ///
    /// # Returns
    /// * `Result<()>` - Returns a success or error result.
    pub fn update_note(
        ctx: Context<NoteAccounts>,
        index: u32,
        root: [u8; 32],
        old_note: String,
        new_note: String,
    ) -> Result<()> {
        // Step 1: Hash the old note to generate the corresponding leaf node
        let old_leaf = keccak::hashv(&[old_note.as_bytes(), ctx.accounts.owner.key().as_ref()]).to_bytes();

        // Step 2: Get the address of the Merkle tree account
        let merkle_tree = ctx.accounts.merkle_tree.key();

        // Step 3: The seeds for PDAs signing
        let signers_seeds: &[&[&[u8]]] = &[&[
            merkle_tree.as_ref(), // The address of the Merkle tree account as a seed
            &[*ctx.bumps.get("tree_authority").unwrap()], // The bump seed for the PDA
        ]];

        // Step 4: Check if the old note and new note are the same
        if old_note == new_note {
            msg!("Notes are the same!");
            return Ok(());
        }

        // Step 5: Verify the leaf node in the Merkle tree
        let verify_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.compression_program.to_account_info(), // The SPL account compression program
            VerifyLeaf {
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(), // The Merkle tree account to be modified
            },
            signers_seeds, // The seeds for PDAs signing
        );
        // Verify or fail
        verify_leaf(verify_cpi_ctx, root, old_leaf, index)?;

        // Step 6: Hash the new note to create the new leaf node
        let new_leaf = keccak::hashv(&[new_note.as_bytes(), ctx.accounts.owner.key().as_ref()]).to_bytes();

        // Step 7: Create a NoteLog entry for the new note
        let note_log = NoteLog::new(new_leaf.clone(), ctx.accounts.owner.key().clone(), new_note);

        // Step 8: Log the NoteLog data using the Noop program
        wrap_application_data_v1(note_log.try_to_vec()?, &ctx.accounts.log_wrapper)?;

        // Step 9: Prepare to replace the old leaf node with the new one in the Merkle tree
        let modify_cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.compression_program.to_account_info(), // The SPL account compression program
            Modify {
                authority: ctx.accounts.tree_authority.to_account_info(), // The authority for the Merkle tree, using a PDA
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(), // The Merkle tree account to be modified
                noop: ctx.accounts.log_wrapper.to_account_info(), // The Noop program to log data
            },
            signers_seeds, // The seeds for PDAs signing
        );

        // Step 10: Replace the old leaf node with the new leaf node in the Merkle tree
        replace_leaf(modify_cpi_ctx, root, old_leaf, new_leaf, index)?;

        Ok(())
    }
}
```

#### 7. Client Test Setup

To ensure our program functions correctly, we’ll set up and write some tests.
Here’s what you need to do for the setup:

1. **Install Dependencies**: We’ll be using the
   `@solana/spl-account-compression` package for our tests. Install it using the
   following command:

```bash
yarn add @solana/spl-account-compression
```

2. **Create Utility File**: To simplify testing, we’ve provided a utility file.
   Create a `utils.ts` file in the `tests` directory and add the provided
   contents. We’ll go over the details of this file shortly.

```typescript
import {
  SPL_NOOP_PROGRAM_ID,
  deserializeApplicationDataEvent,
} from "@solana/spl-account-compression";
import { Connection, PublicKey } from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { deserialize } from "borsh";
import { keccak256 } from "js-sha3";

class NoteLog {
  leafNode: Uint8Array;
  owner: PublicKey;
  note: string;

  constructor(properties: {
    leafNode: Uint8Array;
    owner: Uint8Array;
    note: string;
  }) {
    this.leafNode = properties.leafNode;
    this.owner = new PublicKey(properties.owner);
    this.note = properties.note;
  }
}

// A map that describes the Note structure for Borsh deserialization
const NoteLogBorshSchema = new Map([
  [
    NoteLog,
    {
      kind: "struct",
      fields: [
        ["leafNode", [32]], // Array of 32 `u8`
        ["owner", [32]], // Pubkey
        ["note", "string"],
      ],
    },
  ],
]);

export function getHash(note: string, owner: PublicKey) {
  const noteBuffer = Buffer.from(note);
  const publicKeyBuffer = Buffer.from(owner.toBytes());
  const concatenatedBuffer = Buffer.concat([noteBuffer, publicKeyBuffer]);
  const concatenatedUint8Array = new Uint8Array(
    concatenatedBuffer.buffer,
    concatenatedBuffer.byteOffset,
    concatenatedBuffer.byteLength,
  );
  return keccak256(concatenatedUint8Array);
}

export async function getNoteLog(connection: Connection, txSignature: string) {
  // Confirm the transaction, otherwise the getTransaction sometimes returns null
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: txSignature,
  });

  // Get the transaction info using the tx signature
  const txInfo = await connection.getTransaction(txSignature, {
    maxSupportedTransactionVersion: 0,
  });

  // Get the inner instructions related to the program instruction at index 0
  // We only send one instruction in test transaction, so we can assume the first
  const innerIx = txInfo!.meta?.innerInstructions?.[0]?.instructions;

  // Get the inner instructions that match the SPL_NOOP_PROGRAM_ID
  const noopInnerIx = innerIx.filter(
    instruction =>
      txInfo?.transaction.message.staticAccountKeys[
        instruction.programIdIndex
      ].toBase58() === SPL_NOOP_PROGRAM_ID.toBase58(),
  );

  let noteLog: NoteLog;
  for (let i = noopInnerIx.length - 1; i >= 0; i--) {
    try {
      // Try to decode and deserialize the instruction data
      const applicationDataEvent = deserializeApplicationDataEvent(
        Buffer.from(bs58.decode(noopInnerIx[i]?.data!)),
      );

      // Get the application data
      const applicationData = applicationDataEvent.fields[0].applicationData;

      // Deserialize the application data into NoteLog instance
      noteLog = deserialize(
        NoteLogBorshSchema,
        NoteLog,
        Buffer.from(applicationData),
      );

      if (noteLog !== undefined) {
        break;
      }
    } catch (__) {}
  }

  return noteLog;
}
```

The `utils.ts` file contains three key components:

1. **`NoteLog` Class**: This class represents the note log that we’ll extract
   from the Noop program logs. It also includes the Borsh schema, named
   `NoteLogBorshSchema`, which is used for deserialization.

2. **`getHash` Function**: This function generates a hash from the note and its
   owner, allowing us to compare it against the data in the Merkle tree.

3. **`getNoteLog` Function**: This function searches through the transaction
   logs to locate the Noop program logs then deserializes and retrieves the
   corresponding `NoteLog`.

#### 8. Write Client Tests

With our packages and utility file set up, we’re ready to dive into writing the
tests. We will create four tests for our program:

1. **Create Note Tree**: This test will initialize the Merkle tree for storing
   note hashes.
2. **Add Note**: This test will invoke the `append_note` instruction to add a
   note to the tree.
3. **adds max size note to the Merkle tree**: This test will also use the
   `append_note` instruction, but with a note that reaches the maximum allowable
   size of 1232 bytes in a single transaction.
4. **Updates the first note in the Merkle tree**: This test will use the
   `update_note` instruction to modify the first note that was added.

The first test is mainly for setup purposes. For the remaining three tests, we
will check that the note hash in the Merkle tree matches the expected value
based on the note content and the signer.

We’ll start by setting up our imports. This includes a variety of components
from Anchor, `@solana/web3.js`, `@solana/spl-account-compression`, and our own
utility functions.

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CompressedNotes } from "../target/types/compressed_notes";
import {
  Keypair,
  Transaction,
  PublicKey,
  sendAndConfirmTransaction,
  Connection,
} from "@solana/web3.js";
import {
  ValidDepthSizePair,
  createAllocTreeIx,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ConcurrentMerkleTreeAccount,
} from "@solana/spl-account-compression";
import { getHash, getNoteLog } from "./utils";
import { assert } from "chai";
```

Next, we’ll set up the state variables needed for our tests. This setup will
include:

1. **Default Anchor Setup**: Configure the basic environment for Anchor testing.
2. **Merkle Tree Keypair**: Generate a keypair for the Merkle tree.
3. **Tree Authority**: Create a keypair for the authority of the Merkle tree.
4. **Notes**: Define some sample notes to use in the tests.

```typescript
describe("compressed-notes", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = new Connection(
    provider.connection.rpcEndpoint,
    "confirmed",
  );

  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.CompressedNotes as Program<CompressedNotes>;

  // Generate a new keypair for the Merkle tree account
  const merkleTree = Keypair.generate();

  // Derive the PDA to use as the tree authority for the Merkle tree account
  const [treeAuthority] = PublicKey.findProgramAddressSync(
    [merkleTree.publicKey.toBuffer()],
    program.programId,
  );

  const firstNote = "hello world";
  const secondNote = "0".repeat(917);
  const updatedNote = "updated note";

  describe("Merkle Tree Operations", () => {
    // Tests will go here
  });
});
```

Now, let’s dive into the `Create Note Tree` test. This test will accomplish two
key tasks:

1. **Allocate a New Merkle Tree Account**: Create a new account for the Merkle
   tree, specifying a max depth of 3, a max buffer size of 8, and a canopy depth
   of 0.
2. **Initialize the Account**: Use our program’s `createNoteTree` instruction to
   set up the newly allocated Merkle tree account.

```typescript
it("creates a new note tree", async () => {
  const maxDepthSizePair: ValidDepthSizePair = {
    maxDepth: 3,
    maxBufferSize: 8,
  };

  const canopyDepth = 0;

  // Instruction to create a new account with the required space for the tree
  const allocTreeIx = await createAllocTreeIx(
    connection,
    merkleTree.publicKey,
    wallet.publicKey,
    maxDepthSizePair,
    canopyDepth,
  );

  // Instruction to initialize the tree through the Note program
  const ix = await program.methods
    .createNoteTree(maxDepthSizePair.maxDepth, maxDepthSizePair.maxBufferSize)
    .accounts({
      owner: wallet.publicKey,
      merkleTree: merkleTree.publicKey,
      treeAuthority,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    })
    .instruction();

  const tx = new Transaction().add(allocTreeIx, ix);
  await sendAndConfirmTransaction(connection, tx, [wallet.payer, merkleTree]);

  // Fetch the Merkle tree account to confirm it’s initialized
  const merkleTreeAccount =
    await ConcurrentMerkleTreeAccount.fromAccountAddress(
      connection,
      merkleTree.publicKey,
    );
  assert(merkleTreeAccount, "Merkle tree should be initialized");
});

it("adds a note to the Merkle tree", async () => {
  const txSignature = await program.methods
    .appendNote(firstNote)
    .accounts({
      owner: wallet.publicKey,
      merkleTree: merkleTree.publicKey,
      treeAuthority,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    })
    .rpc();

  const noteLog = await getNoteLog(connection, txSignature);
  const hash = getHash(firstNote, wallet.publicKey);

  assert(
    hash === Buffer.from(noteLog.leafNode).toString("hex"),
    "Leaf node hash should match",
  );
  assert(firstNote === noteLog.note, "Note should match the appended note");
});

it("adds max size note to the Merkle tree", async () => {
  const txSignature = await program.methods
    .appendNote(secondNote)
    .accounts({
      owner: wallet.publicKey,
      merkleTree: merkleTree.publicKey,
      treeAuthority,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    })
    .rpc();

  const noteLog = await getNoteLog(connection, txSignature);
  const hash = getHash(secondNote, wallet.publicKey);

  assert(
    hash === Buffer.from(noteLog.leafNode).toString("hex"),
    "Leaf node hash should match",
  );
  assert(
    secondNote === noteLog.note,
    "Note should match the appended max size note",
  );
});

it("updates the first note in the Merkle tree", async () => {
  const merkleTreeAccount =
    await ConcurrentMerkleTreeAccount.fromAccountAddress(
      connection,
      merkleTree.publicKey,
    );
  const root = merkleTreeAccount.getCurrentRoot();

  const txSignature = await program.methods
    .updateNote(0, root, firstNote, updatedNote)
    .accounts({
      owner: wallet.publicKey,
      merkleTree: merkleTree.publicKey,
      treeAuthority,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    })
    .rpc();

  const noteLog = await getNoteLog(connection, txSignature);
  const hash = getHash(updatedNote, wallet.publicKey);

  assert(
    hash === Buffer.from(noteLog.leafNode).toString("hex"),
    "Leaf node hash should match after update",
  );
  assert(
    updatedNote === noteLog.note,
    "Updated note should match the logged note",
  );
});
```

That’s a wrap—congratulations! Run `anchor test`, and you should see all four
tests passing.

If you encounter any issues, don’t hesitate to revisit the demo or check out the
complete solution code in the
[Compressed Notes repository](https://github.com/unboxed-software/anchor-compressed-notes).

### Challenge

Now that you’ve got the hang of state compression, it’s time to add a new
feature to the Compressed Notes program. Your task is to implement an
instruction that allows users to delete an existing note. Keep in mind that you
can’t physically remove a leaf from the Merkle tree, so you’ll need to come up
with a method to signify that a note has been deleted.

Good luck, and happy coding!

For a straightforward example of how to implement a delete function, check out
the
[`main` branch on GitHub](https://github.com/Unboxed-Software/anchor-compressed-notes/tree/main).

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and [let us know what you think of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=60f6b072-eaeb-469c-b32e-5fea4b72d1d1)!
</Callout>
```
