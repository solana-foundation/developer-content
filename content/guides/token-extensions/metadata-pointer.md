---
date: Dec 21, 2023
seoTitle: "Token Extensions: Metadata Pointer and Token Metadata"
title: How to use the Metadata Pointer extension
description:
  "The Metadata Pointer extensions enables a Mint Account to specify the address
  of the account that stores its metadata. When used along with the Metadata
  Extension, metadata can be stored directly on the Mint Account."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: beginner
tags:
  - token 2022
  - token extensions
---

Before the Token Extensions Program and the
[Token Metadata Interface](https://github.com/solana-labs/solana-program-library/tree/master/token-metadata/interface),
the process of adding extra data to a Mint Account required creating a Metadata
Account through the
[Metaplex Metadata Program](https://developers.metaplex.com/token-metadata).

The `MetadataPointer` extension now enables a Mint Account to specify the
address of its corresponding Metadata Account. This flexibility allows the Mint
Account to point to any account owned by a program that implements the Token
Metadata Interface.

The Token Extensions Program directly implements the Token Metadata Interface,
made accessible through the `TokenMetadata` extension. With the `TokenMetadata`
extension, the Mint Account can now store the metadata.

In this guide, we will demonstrate how to create a Mint Account that enables
both the `MetadataPointer` and `TokenMetadata` extensions. This setup simplifies
the process of adding metadata to a Mint Account by storing all the data on a
single account. Here is the
[final script](https://beta.solpg.io/658c5a75cffcf4b13384ceb5).

<Callout type="info">

The `@solana/spl-token-metadata` library used in this guide is under active
development and is subject to change.

</Callout>

## Token Metadata Interface Overview

The
[Token Metadata Interface](https://github.com/solana-labs/solana-program-library/tree/master/token-metadata/interface)
is designed to standardize and simplify the process of adding metadata to tokens
by defining the data structure and set of instructions for handling metadata.

The Token Metadata Interface can be implemented by any program. This allows
developers the flexibility to create custom Metadata Programs while reducing the
challenges related to ecosystem integration for their program.

With this common interface, wallets, dApps, and on-chain programs can
universally access token metadata, and tools for creating or modifying metadata
become universally compatible.

### Metadata Interface Fields

The Token Metadata Interface defines a standard set of data fields for
[`TokenMetadata`](https://github.com/solana-labs/solana-program-library/blob/master/token-metadata/interface/src/state.rs#L25-L40),
as outlined below. Additionally, it allows for the inclusion of custom data
fields within the `additional_metadata` section, formatted as key-value pairs.

```rust
pub struct TokenMetadata {
    /// The authority that can sign to update the metadata
    pub update_authority: OptionalNonZeroPubkey,
    /// The associated mint, used to counter spoofing to be sure that metadata
    /// belongs to a particular mint
    pub mint: Pubkey,
    /// The longer name of the token
    pub name: String,
    /// The shortened symbol for the token
    pub symbol: String,
    /// The URI pointing to richer metadata
    pub uri: String,
    /// Any additional metadata about the token as key-value pairs. The program
    /// must avoid storing the same key twice.
    pub additional_metadata: Vec<(String, String)>,
}
```

### Metadata Interface Instructions

The Metadata Interface specifies the following
[instructions](https://github.com/solana-labs/solana-program-library/blob/master/token-metadata/interface/src/instruction.rs):

- [**Initialize**](https://github.com/solana-labs/solana-program-library/blob/master/token-metadata/interface/src/instruction.rs#L97):
  Initialize the required token metadata fields (name, symbol, URI).

- [**UpdateField**](https://github.com/solana-labs/solana-program-library/blob/master/token-metadata/interface/src/instruction.rs#L120):
  Updates an existing token metadata field or adds to the `additional_metadata`
  if it does not already exist. Requires resizing the account after
  modification.

- [**RemoveKey**](https://github.com/solana-labs/solana-program-library/blob/master/token-metadata/interface/src/instruction.rs#L137):
  Deletes a key-value pair from the `additional_metadata`. This instruction does
  not apply to the required name, symbol, and URI fields.

- [**UpdateAuthority**](https://github.com/solana-labs/solana-program-library/blob/master/token-metadata/interface/src/instruction.rs#L147):
  Updates the authority allows to change the token metadata.

- [**Emit**](https://github.com/solana-labs/solana-program-library/blob/master/token-metadata/interface/src/instruction.rs#L162):
  Emits the token metadata in the format of the `TokenMetadata` struct. This
  allows account data to be stored in a different format while maintaining
  compatibility with the Interface standards.

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

<Callout type="info">

If you do not have a Playground wallet, you may see a type error within the
editor on all declarations of `pg.wallet.publicKey`. This type error will clear
after you create a Playground wallet.

</Callout>

To get devnet SOL, run the `solana airdrop` command in the Playground's
terminal, or visit this [devnet faucet](https://faucet.solana.com/).

```
solana airdrop 5
```

Once you've created and funded the Playground wallet, click the "Run" button to
run the starter code.

## Add Dependencies

Let's start by setting up our script. We'll be using the `@solana/web3.js`,
`@solana/spl-token`, and `@solana/spl-token-metadata` libraries.

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
  createInitializeMintInstruction,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  getMint,
  getMetadataPointerState,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  createRemoveKeyInstruction,
  unpack,
  pack,
  TokenMetadata,
} from "@solana/spl-token-metadata";

// Playground wallet
const payer = pg.wallet.keypair;

// Connection to devnet cluster
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Transaction to send
let transaction: Transaction;
// Transaction signature returned from sent transaction
let transactionSignature: string;
```

## Mint Setup

Next, define the properties of the Mint Account we'll be creating in the
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
// Authority that can update token metadata
const updateAuthority = pg.wallet.publicKey;

// Metadata to store in Mint Account
const metaData: TokenMetadata = {
  updateAuthority: updateAuthority,
  mint: mint,
  name: "OPOS",
  symbol: "OPOS",
  uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
  additionalMetadata: [["description", "Only Possible On Solana"]],
};
```

Next, determine the size of the new Mint Account and calculate the minimum
lamports needed for rent exemption.

```javascript
// Size of MetadataExtension 2 bytes for type, 2 bytes for length
const metadataExtension = 4;
// Size of metadata
const metadataLen = pack(metaData).length;

// Size of Mint Account with extension
const mintLen = getMintLen([ExtensionType.MetadataPointer]);

// Minimum lamports required for Mint Account
const lamports = await connection.getMinimumBalanceForRentExemption(
  mintLen + metadataExtension + metadataLen,
);
```

With Token Extensions, the size of the Mint Account will vary based on the
extensions enabled.

<Callout type="info">

At the time of this writing, the `TokenMetadata` extension for
`@solana/spl-token` is still in development.

In the code snippet above, we manually add 4 bytes for the `TokenMetadata`
extension and then calculate the space required by the metadata.

</Callout>

## Build Instructions

Next, let's build the set of instructions to:

- Create a new account
- Initialize the `MetadataPointer` extension
- Initialize the remaining Mint Account data
- Initialize the `TokenMetadata` extension and required metadata
- Update the metadata with a custom field

First, build the instruction to invoke the System Program to create an account
and assign ownership to the Token Extensions Program.

```js
// Instruction to invoke System Program to create new account
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
  newAccountPubkey: mint, // Address of the account to create
  space: mintLen, // Amount of bytes to allocate to the created account
  lamports, // Amount of lamports transferred to created account
  programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
});
```

Next, build the instruction to initialize the `MetadataPointer` extension for
the Mint Account. In this example, the metadata pointer will point to the Mint
address, indicating that the metadata will be stored directly on the Mint
Account.

```js
// Instruction to initialize the MetadataPointer Extension
const initializeMetadataPointerInstruction =
  createInitializeMetadataPointerInstruction(
    mint, // Mint Account address
    updateAuthority, // Authority that can set the metadata address
    mint, // Account address that holds the metadata
    TOKEN_2022_PROGRAM_ID,
  );
```

Next, build the instruction to initialize the rest of the Mint Account data.
This is the same as with the original Token Program.

```js
// Instruction to initialize Mint Account data
const initializeMintInstruction = createInitializeMintInstruction(
  mint, // Mint Account Address
  decimals, // Decimals of Mint
  mintAuthority, // Designated Mint Authority
  null, // Optional Freeze Authority
  TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
);
```

Next, build the instruction to initialize the `TokenMetadata` extension and the
required metadata fields (name, symbol, URI).

For this instruction, use the Token Extensions Program as the `programId`, which
functions as the "Metadata Program". Additionally, the Mint Account's address is
used as the `metadata` to indicate that the Mint itself is the "Metadata
Account".

```js
// Instruction to initialize Metadata Account data
const initializeMetadataInstruction = createInitializeInstruction({
  programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
  metadata: mint, // Account address that holds the metadata
  updateAuthority: updateAuthority, // Authority that can update the metadata
  mint: mint, // Mint Account address
  mintAuthority: mintAuthority, // Designated Mint Authority
  name: metaData.name,
  symbol: metaData.symbol,
  uri: metaData.uri,
});
```

Next, build the instruction to update the metadata with a custom field using the
`UpdateField` instruction from the Token Metadata Interface.

This instruction will either update the value of an existing field or add it to
`additional_metadata` if it does not already exist. Note that you may need to
reallocate more space to the account to accommodate the additional data. In this
example, we allocated all the lamports required for rent up front when creating
the account.

```js
// Instruction to update metadata, adding custom field
const updateFieldInstruction = createUpdateFieldInstruction({
  programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
  metadata: mint, // Account address that holds the metadata
  updateAuthority: updateAuthority, // Authority that can update the metadata
  field: metaData.additionalMetadata[0][0], // key
  value: metaData.additionalMetadata[0][1], // value
});
```

## Send Transaction

Next, add the instructions to a new transaction and send it to the network. This
will create a Mint Account with the `MetadataPointer` and `TokenMetadata`
extensions enabled and store the metadata on the Mint Account.

```javascript
// Add instructions to new transaction
transaction = new Transaction().add(
  createAccountInstruction,
  initializeMetadataPointerInstruction,
  initializeMintInstruction,
  initializeMetadataInstruction,
  updateFieldInstruction,
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

## Read Metadata from Mint Account

Next, fetch and read from the Mint Account to verify that the metadata has been
stored.

Start by fetching the Mint Account's data:

```js
// Retrieve mint information
const mintInfo = await getMint(
  connection,
  mint,
  "confirmed",
  TOKEN_2022_PROGRAM_ID,
);
```

Next, read the `MetadataPointer` extension portion of the account data:

```js
// Retrieve and log the metadata pointer state
const metadataPointer = getMetadataPointerState(mintInfo);
console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2));
```

Next, read the Metadata portion of the account data:

<Callout type="info">

Currently, reading the metadata requires identifying its location within the
account data. In this specific example, the Mint Account stores the metadata at
an offset of 72 bytes from the beginning of the `tlvData`.

In the future, `@solana/spl-token` will include a dedicated helper function to
simplify this process.

</Callout>

```js
// Extract and log the metadata
const slicedBuffer = mintInfo.tlvData.subarray(72);
const metadata = unpack(slicedBuffer);
console.log("\nMetadata:", JSON.stringify(metadata, null, 2));
```

Run the script by clicking the `Run` button. You can then inspect the
transaction details on SolanaFM.

You should also see console output like the following:

```
Metadata Pointer: {
  "authority": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "metadataAddress": "BFqmKEm12CrDbcFAncjL34Anu5w18LruxQrgvy7aExzV"
}

Metadata: {
  "updateAuthority": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "mint": "BFqmKEm12CrDbcFAncjL34Anu5w18LruxQrgvy7aExzV",
  "name": "OPOS",
  "symbol": "OPOS",
  "uri": "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
  "additionalMetadata": [
    [
      "description",
      "Only Possible On Solana"
    ]
  ]
}
```

## Remove Custom Field

To delete a custom field from the metadata, use the `RemoveKey` instruction from
the Token Metadata Interface.

<Callout type="info">

The `idempotent` flag is used to specify whether the transaction should fail if
the key does not exist on the account. If the idempotent flag is set to `true`,
then the instruction will not error if the key does not exist.

</Callout>

```js
// Instruction to remove a key from the metadata
const removeKeyInstruction = createRemoveKeyInstruction({
  programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
  metadata: mint, // Address of the metadata
  updateAuthority: updateAuthority, // Authority that can update the metadata
  key: metaData.additionalMetadata[0][0], // Key to remove from the metadata
  idempotent: true, // If the idempotent flag is set to true, then the instruction will not error if the key does not exist
});

// Add instruction to new transaction
transaction = new Transaction().add(removeKeyInstruction);

// Send transaction
transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer],
);

console.log(
  "\nRemove Additional Metadata Field:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);

console.log(
  "\nMint Account:",
  `https://solana.fm/address/${mint}?cluster=devnet-solana`,
);
```

Run the script by clicking the `Run` button. You can then inspect the
transaction details on SolanaFM.

If you inspect the Mint Account data on SolanaFM (JSON tab), you should see that
the additional metadata is empty.

```
{
  "extensionLength": 192,
  "updateAuthority": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "mint": "BFqmKEm12CrDbcFAncjL34Anu5w18LruxQrgvy7aExzV",
  "name": "OPOS",
  "symbol": "OPOS",
  "uri": "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
  "additionalMetadata": {
      "dataType": "Map",
      "value": []
  },
  "enumType": "tokenMetadata"
}
```

## Conclusion

By enabling both the `MetadataPointer` and `TokenMetadata` extensions, the Mint
Account can directly store metadata. This feature simplifies the process of
adding metadata to a Mint Account.
