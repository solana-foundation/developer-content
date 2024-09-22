---
title: Create tokens with the token program
objectives:
  - Create token mints
  - Create token metadata
  - Create associated token accounts
  - Mint tokens
  - Transfer tokens
description:
  "Understand how tokens, including both regular tokens and NFTs, are created,
  stored, and transferred on Solana."
---

### Summary

- SOL is Solana's **native token**. All other tokens, both fungible and
  non-fungible (NFTs), are called **SPL tokens**.
- The **[Token Program](https://spl.solana.com/token)** provides instructions
  for creating and interacting with SPL tokens.
- **Token Mints** are accounts that define a specific token. They include
  details like the token's decimal places, the **mint authority** (the account
  allowed to mint more tokens), and metadata such as descriptions and images.
  The mint authority can use the token mint to issue new tokens.
- **Token Accounts** hold balances of a specific token mint. For most users,
  their balances of each token mint are stored in **Associated Token
  Accounts** - accounts with addresses derived from their wallet address and the
  token mint's address.
- Creating token mints and token accounts requires **rent** in SOL. Rent for a
  token account can be refunded when the account is closed. Additionally, tokens
  created with the
  [Token extensions program](/content/courses/token-extensions/close-mint.md)
  can also close token mints.

### Lesson

The Token program is one of many programs available through the Solana Program
Library (SPL). It provides instructions for creating and interacting with **SPL
tokens**, which represent all non-native tokens on the Solana network (i.e.,
tokens other than SOL).

This lesson covers the basics of creating and managing a new SPL token using the
Token program:

1. Creating a new **Token Mint**
2. Creating **Token Accounts**
3. **Minting** tokens
4. **Transferring** tokens between holders

We'll be using the
[`@solana/spl-token`](https://www.npmjs.com/package/@solana/spl-token)
JavaScript library from the client side to achieve this.

#### Token Mint

To create a new SPL Token, you first need to create a **Token Mint**. A Token
Mint is an account that holds data about a specific token.

For example, take a look at
[USD Coin (USDC) on Solana Explorer](https://explorer.solana.com/address/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v).
USDC's token mint address is `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`. In
the Explorer, you can see specific details about USDC's token mint, including
the current token supply, the mint and freeze authority addresses, and the
token's decimal precision.

![USDC Token Mint](/public/assets/courses/unboxed/token-program-usdc-mint.png)

To create a new Token Mint, you need to send the appropriate transaction
instructions to the Token Program. You can achieve this by using the
[`createMint()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createMint.html#createMint)
function from the `@solana/spl-token` library.

```typescript
const tokenMint = await createMint(
  connection,
  payer,
  mintAuthority,
  freezeAuthority,
  decimal,
);
```

The `createMint()` function returns the `publicKey` of the new token mint. This
function requires the following arguments:

- `connection` - the JSON-RPC connection to the cluster
- `payer` - the public key of the payer for the transaction
- `mintAuthority` - the account that is authorized to do the actual minting of
  tokens from the token mint.
- `freezeAuthority` - an account authorized to freeze the tokens in a token
  account. If freezing is not a desired attribute, the parameter can be set to
  null
- `decimals` - specifies the desired decimal precision of the token

When creating a new mint from a script that has access to your secret key, you
can use the `createMint()` function. However, if you're building a website where
users create a new token mint, you'll need to securely handle the user's secret
key without exposing it in the browser. In this case, you'd build and submit a
transaction with the correct instructions.

Under the hood, the `createMint()` function creates a transaction containing two
instructions:

1. Create a new account
2. Initialize a new mint

Here's how that would look:

```typescript
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
} from "@solana/spl-token";

async function buildCreateMintTransaction(
  connection: Connection,
  payer: PublicKey,
  decimals: number,
  mintAuthority: PublicKey,
  freezeAuthority: PublicKey | null = null,
): Promise<Transaction> {
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const mintKeypair = Keypair.generate();

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      mintAuthority,
      freezeAuthority,
      TOKEN_PROGRAM_ID,
    ),
  );

  return transaction;
}
```

When manually building the instructions to create a new token mint, ensure you
add both the account creation and mint initialization instructions to the _same
transaction_. If you were to split them into separate transactions, someone else
could potentially take control of the account you create and initialize it for
their own mint.

#### Rent and Rent Exemption

The
[`getMinimumBalanceForRentExemptMint()`](https://solana-labs.github.io/solana-program-library/token/js/functions/getMinimumBalanceForRentExemptMint.html#getMinimumBalanceForRentExemptMint)
function in the previous snippet calculates the minimum SOL needed to make an
account rent-exempt, which is required during account initialization.

Previously, Solana accounts had two options to avoid deallocation:

1. Pay rent periodically
2. Deposit enough SOL during initialization for rent exemption

The first option is no longer available, so rent exemption is now mandatory for
all accounts.

For token mints, you'll use the `getMinimumBalanceForRentExemptMint()` from the
`@solana/spl-token` library. For other account types, use the more general
[`getMinimumBalanceForRentExemption()`](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getMinimumBalanceForRentExemption)
method from the `Connection` object.

#### Token Account

Before minting tokens (issuing new supply), you'll need a Token Account to store
them.

A Token Account holds tokens of a specific mint and is owned by a specific
owner. Only the owner can decrease the Token Account balance (e.g., transfer,
burn), while anyone can send tokens to the account to increase its balance.

You can create the Token Account using the `spl-token` library's
[`createAccount()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createAccount.html#createAccount)
function:

```typescript
const tokenAccount = await createAccount(
  connection,
  payer,
  mint,
  owner,
  keypair,
);
```

The `createAccount()` function returns the `publicKey` of the new token account
and requires the following arguments:

- `connection` - the JSON-RPC connection to the cluster
- `payer` - the account responsible for paying the transaction fees
- `mint` - the token mint associated with the new token account
- `owner` - the account that owns the new token account
- `keypair` - an optional parameter for specifying the new token account
  address. If not provided, the function defaults to a derivation from the
  associated `mint` and `owner` accounts.

Note that this `createAccount()` function is different from the
`createAccount()` used earlier when we manually built the transaction for the
`createMint` function. Previously, we used
[`SystemProgram.createAccount()`](https://solana-labs.github.io/solana-web3.js/classes/SystemProgram.html#createAccount)
to generate the instruction for creating accounts in general.

In contrast, this `createAccount()` function is a helper from the `spl-token`
library that submits a transaction with two instructions:

1. The first instruction creates the account.
2. The second initializes the account as a Token Account.

If you were to manually build the transaction for `createAccount()`, you would
follow these steps:

1. Use
   [`getMint()`](https://solana-labs.github.io/solana-program-library/token/js/functions/getMint.html#getMint)
   to retrieve the data associated with the `mint`.
2. Use
   [`getAccountLenForMint()`](https://solana-labs.github.io/solana-program-library/token/js/functions/getAccountLenForMint.html#getAccountLenForMint)
   to calculate the space required for the token account.
3. Use `getMinimumBalanceForRentExemption()` to calculate the lamports needed
   for rent exemption.
4. Create a new transaction using `SystemProgram.createAccount()` and
   [`createInitializeAccountInstruction()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createInitializeAccountInstruction.html#createInitializeAccountInstruction).
   Note that `SystemProgram.createAccount()` from `@solana/web3.js` is used to
   create a generic account, while `createInitializeAccountInstruction()`
   initializes this account as a Token Account.

```typescript
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  getMint,
  getAccountLenForMint,
  createInitializeAccountInstruction,
} from "@solana/spl-token";

async function buildCreateTokenAccountTransaction(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
): Promise<Transaction> {
  const mintState = await getMint(connection, mint);
  const tokenAccount = Keypair.generate();
  const space = getAccountLenForMint(mintState);
  const lamports = await connection.getMinimumBalanceForRentExemption(space);

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: tokenAccount.publicKey,
      space,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeAccountInstruction(
      tokenAccount.publicKey,
      mint,
      owner,
      TOKEN_PROGRAM_ID,
    ),
  );

  return transaction;
}
```

#### Associated Token Accounts

An **Associated Token Account (ATA)** stores tokens in an address derived from
two components:

- The owner's public key
- The token mint

For instance, if Bob holds USDC, his USDC is stored in an Associated Token
Account created using Bob's public key and the USDC mint address.

Associated Token Accounts offer a deterministic way to locate the Token Account
owned by a specific `publicKey` for a given token. While there are alternative
methods to create token accounts, especially for onchain programs, Associated
Token Accounts are almost always the preferred choice when storing tokens for a
user. Even if the user doesn't have an Associated Token Account for a token, you
can easily determine the address and create the account for them.

![ATAs are PDAs](/public/assets/courses/unboxed/atas-are-pdas.svg)

You can create an associated token account using the `spl-token` library's
[`createAssociatedTokenAccount()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createAssociatedTokenAccount.html#createAssociatedTokenAccount)
function.

```typescript
const associatedTokenAccount = await createAssociatedTokenAccount(
  connection,
  payer,
  mint,
  owner,
);
```

The function returns the `publicKey` of the new associated token account and
requires these parameters:

- `connection` – the JSON-RPC connection to the cluster
- `payer` – the account of the payer for the transaction
- `mint` – the token mint that the new token account is associated with
- `owner` – the account of the owner of the new token account

You can also use
[`getOrCreateAssociatedTokenAccount()`](https://solana-labs.github.io/solana-program-library/token/js/functions/getOrCreateAssociatedTokenAccount.html#getOrCreateAssociatedTokenAccount)
to retrieve the Token Account associated with a given address or create it if it
doesn't exist. For instance, if you're writing code to airdrop tokens to a user,
you'd likely use this function to ensure that the token account for the user is
created if it doesn't already exist.

Behind the scenes, `createAssociatedTokenAccount()` does the following:

1. Uses
   [`getAssociatedTokenAddress()`](https://solana-labs.github.io/solana-program-library/token/js/functions/getAssociatedTokenAddress.html#getAssociatedTokenAddress)
   to derive the associated token account address from the `mint` and `owner`.
2. Builds a transaction using instructions from
   [`createAssociatedTokenAccountInstruction()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createAssociatedTokenAccountInstruction.html#createAssociatedTokenAccountInstruction).

```typescript
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

async function buildCreateAssociatedTokenAccountTransaction(
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
): Promise<Transaction> {
  const associatedTokenAddress = await getAssociatedTokenAddress(
    mint,
    owner,
    false,
  );

  const transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      payer,
      associatedTokenAddress,
      owner,
      mint,
    ),
  );

  return transaction;
}
```

#### Mint Tokens

Minting tokens is the process of issuing new tokens into circulation. When you
mint tokens, you increase the supply of the token mint and deposit the newly
minted tokens into a token account. Only the **mint authority** of a token mint
has permission to mint new tokens.

To mint tokens using the `spl-token` library, you can call the
[`mintTo()`](https://solana-labs.github.io/solana-program-library/token/js/functions/mintTo.html#mintTo)
function.

```typescript
const transactionSignature = await mintTo(
  connection,
  payer,
  mint,
  destination,
  authority,
  amount,
);
```

The `mintTo()` function returns a `TransactionSignature` that can be viewed on
Solana Explorer. This function requires the following arguments:

- `connection`: The JSON-RPC connection to the cluster.
- `payer`: The account paying for the transaction.
- `mint`: The token mint associated with the new token account.
- `destination`: The token account to receive the minted tokens.
- `authority`: The account authorized to mint tokens.
- `amount`: The raw token amount, excluding decimals. For example, if the mint's
  `decimals` is set to 2, you would mint 100 to create 1 full token.

It's common to set the mint authority to `null` after tokens are minted,
establishing a fixed supply and preventing future minting. Alternatively,
minting authority can be granted to a program for automated minting based on
conditions.

The `mintTo()` function generates a transaction using instructions from
[`createMintToInstruction()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createMintToInstruction.html#createMintToInstruction).

```typescript
import { PublicKey, Transaction } from "@solana/web3.js";
import { createMintToInstruction } from "@solana/spl-token";

async function buildMintToTransaction(
  mintAuthority: PublicKey,
  mint: PublicKey,
  destination: PublicKey,
  amount: bigint,
): Promise<Transaction> {
  const transaction = new Transaction().add(
    createMintToInstruction(mint, destination, mintAuthority, amount),
  );

  return transaction;
}
```

#### Transfer Tokens

SPL Token transfers require both the sender and receiver to have token accounts
for the token mint being transferred. Tokens move from the sender's token
account to the receiver's token account.

To ensure the receiver has a token account, you can use
`getOrCreateAssociatedTokenAccount()`. This function verifies the receiver's
associated token account exists, or creates one if it doesn't, with the payer
covering the lamports required for account creation.

Once the receiver's token account address is confirmed, use the
[`transfer()`](https://solana-labs.github.io/solana-program-library/token/js/functions/transfer.html#transfer)
function from the `spl-token` library to transfer tokens.

```typescript
const transactionSignature = await transfer(
  connection,
  payer,
  source,
  destination,
  owner,
  amount,
);
```

The `transfer()` function returns a `TransactionSignature`, which can be tracked
on Solana Explorer. It requires the following arguments:

- `connection`: The JSON-RPC connection to the cluster.
- `payer`: The account responsible for the transaction fees.
- `source`: The token account sending the tokens.
- `destination`: The token account receiving the tokens.
- `owner`: The account that owns the `source` token account.
- `amount`: The number of tokens to transfer.

Internally, the `transfer()` function builds a transaction using instructions
from the
[`createTransferInstruction()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createTransferInstruction.html#createTransferInstruction)
function.

```typescript
import { PublicKey, Transaction } from "@solana/web3.js";
import { createTransferInstruction } from "@solana/spl-token";

async function buildTransferTransaction(
  source: PublicKey,
  destination: PublicKey,
  owner: PublicKey,
  amount: bigint,
): Promise<Transaction> {
  const transaction = new Transaction().add(
    createTransferInstruction(source, destination, owner, amount),
  );

  return transaction;
}
```

### Lab

In this lab, we'll use the Token Program to:

- Create a Token Mint
- Create an Associated Token Account
- Mint tokens
- Transfer tokens
- Burn tokens

Make sure you have a `.env` file set up with a `SECRET_KEY`, following the steps
in
[Cryptography Fundamentals](/content/courses/intro-to-solana/intro-to-cryptography.md).

```bash
npm i @solana/web3.js @solana/spl-token @solana-developers/helpers esrun
```

#### Create the Token Mint

Create an empty file named `create-token-mint.ts`. After loading the keypairs,
call `createMint()` and set `user` as the `payer`, `mintAuthority`, and
`freezeAuthority`.

Think of the token mint as a factory that creates tokens, with `user` as the
`mintAuthority`, acting as the person running the factory.

```typescript
import { createMint } from "@solana/spl-token";
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import dotenv from "dotenv";

dotenv.config();

const CLUSTER = "devnet";
const DECIMAL_PLACES = 2;

const connection = new Connection(clusterApiUrl(CLUSTER), "confirmed");

let userKeypair: Keypair;
try {
  userKeypair = getKeypairFromEnvironment("SECRET_KEY");
  console.log(
    `🔑 Loaded keypair. Public key: ${userKeypair.publicKey.toBase58()}`,
  );
} catch (error) {
  throw new Error(
    `Failed to load keypair: ${error instanceof Error ? error.message : String(error)}`,
  );
}

try {
  const tokenMintAddress = await createMint(
    connection,
    userKeypair,
    userKeypair.publicKey,
    null,
    DECIMAL_PLACES,
  );

  const explorerLink = getExplorerLink(
    "address",
    tokenMintAddress.toString(),
    CLUSTER,
  );
  console.log(`✅ Created token mint: ${explorerLink}`);
} catch (error) {
  throw new Error(
    `Failed to create token mint: ${error instanceof Error ? error.message : String(error)}`,
  );
}
```

Run the script using `npx esrun create-token-mint.ts`. You should see

```bash
🔑 Loaded keypair. Public key: GprrWv9r8BMxQiWea9MrbCyK7ig7Mj8CcseEbJhDDZXM
✅ Created token mint: https://explorer.solana.com/address/Gydngxd1wSgkYtfEh87nUU98Sjm5ZcEZsNAtyRdwd5jR?cluster=devnet
```

Open Solana Explorer and check out your new token!

Be sure to note the mint address, as we'll need it later.

#### Add token metadata

You might notice that your token shows up as 'Unknown Token' in the Explorer
without a symbol or additional details. That’s because your token doesn’t have
metadata yet! Let’s add some.

We'll use version 2 of the Metaplex `mpl-token-metadata` program. This version
is widely used and simplifies the process compared to version 3.

```bash
npm i @metaplex-foundation/mpl-token-metadata@2
```

Create a new file called `create-token-metadata.ts`

```typescript
// This uses "@metaplex-foundation/mpl-token-metadata@2" to create tokens
import "dotenv/config";
import {
  getKeypairFromEnvironment,
  getExplorerLink,
} from "@solana-developers/helpers";
import {
  Connection,
  clusterApiUrl,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";

const user = getKeypairFromEnvironment("SECRET_KEY");

const connection = new Connection(clusterApiUrl("devnet"));

console.log(
  `🔑 We've loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`,
);

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

// Substitute in your token mint account
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT_ADDRESS_HERE");

const metadataData = {
  name: "Solana Training Token",
  symbol: "TRAINING",
  // Arweave / IPFS / Pinata etc link using metaplex standard for offchain data
  uri: "https://arweave.net/1234",
  sellerFeeBasisPoints: 0,
  creators: null,
  collection: null,
  uses: null,
};

const metadataPDAAndBump = PublicKey.findProgramAddressSync(
  [
    Buffer.from("metadata"),
    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
    tokenMintAccount.toBuffer(),
  ],
  TOKEN_METADATA_PROGRAM_ID,
);

const metadataPDA = metadataPDAAndBump[0];

const transaction = new Transaction();

const createMetadataAccountInstruction =
  createCreateMetadataAccountV3Instruction(
    {
      metadata: metadataPDA,
      mint: tokenMintAccount,
      mintAuthority: user.publicKey,
      payer: user.publicKey,
      updateAuthority: user.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        collectionDetails: null,
        data: metadataData,
        isMutable: true,
      },
    },
  );

transaction.add(createMetadataAccountInstruction);

const transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [user],
);

const transactionLink = getExplorerLink(
  "transaction",
  transactionSignature,
  "devnet",
);

console.log(`✅ Transaction confirmed, explorer link is: ${transactionLink}!`);

const tokenMintLink = getExplorerLink(
  "address",
  tokenMintAccount.toString(),
  "devnet",
);

console.log(`✅ Look at the token mint again: ${tokenMintLink}!`);
```

You'll now see Solana Explorer is updated, showing the token's name and symbol
on the mint!

Note that Solana Explorer will display a warning like:

> Warning! Token names and logos are not unique. This token may have spoofed its
> name and logo to look like another token. Verify the token's mint address to
> ensure it is correct.

This warning is accurate - indeed anyone can make any token have any symbol or
name they like. However for your reference, if you are making an original token
that becomes very well known, Solana Explorer uses a whitelist based on the
[Unified Token List API](https://github.com/solflare-wallet/utl-api).

#### Create an Associated Token Account to store the tokens

Now that we've created the mint, let's create a new Associated Token Account so
that someone can store our tokens. This Associated Token Account could be for
our wallet (if we, as the token mint authority, want to mint tokens to our
address) or anyone else we know with a devnet wallet!

Create an empty file called `create-token-account.ts`. Then use
`getOrCreateAssociatedTokenAccount()` to get an associated token account based
on a wallet and our mint address, making the account if it needs to.

Remember to substitute in your token mint address below!

```typescript
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`,
);

// Substitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT");

// Here we are making an associated token account for our own address, but we can
// make an ATA on any other wallet in devnet!
// const recipient = new PublicKey("SOMEONE_ELSES_DEVNET_ADDRESS");
const recipient = user.publicKey;

const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  recipient,
);

console.log(`Token Account: ${tokenAccount.address.toBase58()}`);

const link = getExplorerLink(
  "address",
  tokenAccount.address.toBase58(),
  "devnet",
);

console.log(`✅ Created token Account: ${link}`);
```

Run the script using `npx esrun create-token-mint.ts`. You should see:

```bash
✅ Success! Created token account: https://explorer.solana.com/address/CTjoLdEeK8rk4YWYW9ZqACyjHexbYKH3hEoagHxLVEFs?cluster=devnet
```

Open the token account in Solana Explorer. Look at the owner - it's the account
you made the ATA for! The balance will be zero, as we haven't sent any tokens
there yet. Let's mint some tokens there and fix that!

#### Mint Tokens

Now that we have a token mint and a token account, let's mint tokens to the
token account. Recall that we set the `user` as the `mintAuthority` for the
`mint` we created.

Create a function `mintTokens` that uses the `spl-token` function `mintTo` to
mint tokens:

```typescript
import { mintTo } from "@solana/spl-token";
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"));

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const user = getKeypairFromEnvironment("SECRET_KEY");

// Substitute in your token mint account from create-token-mint.ts
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT_ACCOUNT");

// Substitute in your own, or a friend's token account address, based on the previous step.
const recipientAssociatedTokenAccount = new PublicKey(
  "RECIPIENT_TOKEN_ACCOUNT",
);

const transactionSignature = await mintTo(
  connection,
  user,
  tokenMintAccount,
  recipientAssociatedTokenAccount,
  user,
  10 * MINOR_UNITS_PER_MAJOR_UNITS,
);

const link = getExplorerLink("transaction", transactionSignature, "devnet");

console.log(`✅ Success! Mint Token Transaction: ${link}`);
```

Run the script using `npx esrun mint-tokens.ts`. You should see:

```bash
✅ Success! Mint Token Transaction: https://explorer.solana.com/tx/36U9ELyJ2VAZSkeJKj64vUh9cEzVKWznESyqFCJ92sj1KgKwrFH5iwQsYmjRQDUN2uVhcbW8AVDsNaiNuPZ7n9m4?cluster=devnet
```

Open Explorer, and see the transaction and the new tokens in the recipient's
account!

#### Transfer Tokens

Next, let's transfer some of the tokens we just minted using the `spl-token`
library's `transfer` function. You can
[add a second account on devnet](/content/courses/intro-to-solana/intro-to-cryptography.md)
if you like, or find a friend who has a devnet account and send them your token!

As you saw in Explorer, the tokens currently reside in an Associated Token
Account attached to our wallet. We don't have to remember the address for our
associated token account - we can just look it up using
`getOrCreateAssociatedTokenAccount()` and provide our wallet address and the
mint of the token we want to send. Likewise, we can find (or make) an ATA for
our recipient to hold this token too.

```typescript
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
const connection = new Connection(clusterApiUrl("devnet"));

const sender = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${sender.publicKey.toBase58()}`,
);

// Add the recipient public key here.
const recipient = new PublicKey("YOUR_RECIPIENT_HERE");

// Substitute in your token mint account
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT_ADDRESS_HERE");

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

console.log(`💸 Attempting to send 1 token to ${recipient.toBase58()}...`);

// Get or create the source and destination token accounts to store this token
const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  sender.publicKey,
);

const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  sender,
  tokenMintAccount,
  recipient,
);

// Transfer the tokens
const signature = await transfer(
  connection,
  sender,
  sourceTokenAccount.address,
  destinationTokenAccount.address,
  sender,
  1 * MINOR_UNITS_PER_MAJOR_UNITS,
);

const explorerLink = getExplorerLink("transaction", signature, "devnet");

console.log(`✅ Transaction confirmed, explorer link is: ${explorerLink}!`);
```

Open the Explorer link. You see your balance go down, and the recipient's
balance go up!

### Challenge

Now it's your turn to build something independently. Create an application that
allows a user to create a new mint, create a token account, and mint tokens.

To interact with the Token Program using the wallet adapter, you will have to
build each transaction and then submit the transaction to the wallet app for
approval.

![Token Program Challenge Frontend](/public/assets/courses/unboxed/token-program-frontend.png)

1. You can build this from scratch or you can
   [download the starter code](https://github.com/Unboxed-Software/solana-token-frontend/tree/starter).
2. Create a new Token Mint in the `CreateMint` component. If you need a
   refresher on how to send transactions to a wallet for approval, have a look
   at the
   [Wallets lesson](/content/courses/intro-to-solana/interact-with-wallets.md).

When creating a new mint, the newly generated `Keypair` will also have to sign
the transaction. When additional signers are required in addition to the
connected wallet, use the following format:

```typescript
sendTransaction(transaction, connection, {
  signers: [Keypair],
});
```

3. Create a new Token Account in the `CreateTokenAccount` component.
4. Mint tokens in the `MintToForm` component.

If you get stumped, feel free to reference the
[solution code](https://github.com/ZYJLiu/solana-token-frontend).

And remember, get creative with these challenges and make them your own!

<Callout type="success">

### Completed the lab?

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=72cab3b8-984b-4b09-a341-86800167cfc7)!
</Callout>
