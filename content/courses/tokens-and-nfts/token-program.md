---
title: Create Tokens with the Token Program
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
for the mint of the tokens being transferred. The tokens are transferred from
the sender's token account to the receiver's token account.

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

```typescript filename="create-token-mint.ts"
```typescript filename="create-token-mint.ts"
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

![Token Mint](/public/assets/courses/unboxed/create-token-mint.png)

Be sure to note the mint address, as we'll need it later.

#### Add token metadata

You might notice that your token shows up as 'Unknown Token' in Explorer without
a symbol or additional details. This happens because your token doesn't have
metadata yet! Let's add some metadata.

First, install the required dependencies for creating token metadata.

```bash
npm i @metaplex-foundation/mpl-token-metadata
npm i @metaplex-foundation/umi
npm i @metaplex-foundation/umi-bundle-defaults
npm i @metaplex-foundation/umi-web3js-adapters
```

Create a new file called `create-token-metadata.ts`

```typescript filename="create-token-metadata.ts"
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createMetadataAccountV3 } from "@metaplex-foundation/mpl-token-metadata";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { createSignerFromKeypair } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import {
  getKeypairFromEnvironment,
  airdropIfRequired,
  getExplorerLink,
} from "@solana-developers/helpers";
import dotenv from "dotenv";

dotenv.config();

const CLUSTER = "devnet";
// Substitute your token mint account address
const TOKEN_MINT_ADDRESS = "YOUR_TOKEN_MINT_ADDRESS";

const endpoint = clusterApiUrl(CLUSTER);
const umi = createUmi(endpoint);
const connection = new Connection(endpoint);

let userKeypair;
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

const keypair = fromWeb3JsKeypair(userKeypair);
const signer = createSignerFromKeypair(umi, keypair);
umi.identity = signer;
umi.payer = signer;
const tokenMintAccount = new PublicKey(TOKEN_MINT_ADDRESS);

await airdropIfRequired(
  connection,
  userKeypair.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL,
);

const offChainMetadata = {
  name: "Solana Training Token",
  symbol: "TRAINING",
  description: "A token for Solana training",
  image: "https://arweave.net/XWpt7HDOFC0wJQcQWgP9n_cxHS0qQik9-27CAAaGP6E",
};

const createMetadataAccountV3Args = {
  mint: fromWeb3JsPublicKey(tokenMintAccount),
  mintAuthority: signer,
  payer: signer,
  updateAuthority: keypair.publicKey,
  data: {
    name: offChainMetadata.name,
    symbol: offChainMetadata.symbol,
    // Arweave / IPFS / Pinata etc link using metaplex standard for offchain data
    uri: "https://arweave.net/1234",
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  },
  isMutable: true,
  collectionDetails: null,
};

try {
  const instruction = createMetadataAccountV3(umi, createMetadataAccountV3Args);
  const transaction = await instruction.buildAndSign(umi);
  const transactionSignature = await umi.rpc.sendTransaction(transaction);
  const [signature] = base58.deserialize(transactionSignature);

  console.log(`✅ Metadata created. Signature: ${signature}`);

  const transactionLink = getExplorerLink("transaction", signature, "devnet");

  console.log(
    `✅ Transaction confirmed, explorer link is: ${transactionLink}!`,
  );

  const tokenMintLink = getExplorerLink(
    "address",
    tokenMintAccount.toString(),
    "devnet",
  );

  console.log(`✅ Look at the token mint again: ${tokenMintLink}`);
} catch (error) {
  throw new Error(
    `Failed to create metadata: ${error instanceof Error ? error.message : String(error)}`,
  );
}
```

Replace `YOUR_TOKEN_MINT_ADDRESS` with your token mint address, then run the
script with:

```bash
npx esrun create-token-metadata.ts
```

You should see the output:

```bash
🔑 Loaded keypair. Public key: GprrWv9r8BMxQiWea9MrbCyK7ig7Mj8CcseEbJhDDZXM
✅ Metadata created. Signature: 3mBqNmNBbKdGCuKvRtZfHQrtatqxJxPFAia5m7FLFpBHwZV1TMgbXVzRW9EireFaXtQa63vh2i4waKgeaPqN6nov
✅ Transaction confirmed, explorer link is: https://explorer.solana.com/tx/3mBqNmNBbKdGCuKvRtZfHQrtatqxJxPFAia5m7FLFpBHwZV1TMgbXVzRW9EireFaXtQa63vh2i4waKgeaPqN6nov?cluster=devnet!
✅ Look at the token mint again: https://explorer.solana.com/address/FXbnmvUb7CxmSjMhF2g2xVJ2CXAHHp7GormYwwTx4rgj?cluster=devnet
```

Replace `YOUR_TOKEN_MINT_ADDRESS_HERE` with your address of the mint and run the
script using `npx esrun create-token-metadata.ts`.

You'll now see Solana Explorer is updated, showing the token's name and symbol
on the mint!

![Token Metadata](/public/assets/courses/unboxed/add-token-metadata.png)

Note that Solana Explorer will display a warning like:

> Warning! Token names and logos are not unique. This token may have spoofed its
> name and logo to look like another token. Verify the token's mint address to
> ensure it is correct.

This warning is accurate - indeed anyone can make any token have any symbol or
name they like. However for your reference, if you are making an original token
that becomes very well-known, Solana Explorer uses a whitelist based on the
[Unified Token List API](https://github.com/solflare-wallet/utl-api).

#### Create an Associated Token Account to store the tokens

Now that we've created the mint, let's create a new Associated Token Account so
someone can store the tokens. This account could be for our wallet (if we, as
the mint authority, want to mint tokens to ourselves) or for anyone else with a
devnet wallet!

Create an empty file called `create-token-account.ts`. Use
`getOrCreateAssociatedTokenAccount()` to get an associated token account based
on a wallet and our mint address, creating the account if it doesn't exist.

Don't forget to substitute your token mint address in the code below!

```typescript filename="create-token-account.ts"
```typescript filename="create-token-account.ts"
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import "dotenv/config";

const connection = new Connection(clusterApiUrl("devnet"));

// Load user's keypair from environment variable
const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded keypair from environment. Public key: ${user.publicKey.toBase58()}`,
);

// Replace with your actual token mint address from create-token-mint.ts
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT_ADDRESS");

// Define the recipient of the associated token account
// For this example, we're creating an ATA for the user's own wallet
// Uncomment the next line to create an ATA for a different wallet
// const recipient = new PublicKey("RECIPIENT_WALLET_ADDRESS");
const recipient = user.publicKey;

try {
  // Create or get the associated token account for the recipient
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMintAccount,
    recipient,
  );

  console.log(`Token Account Address: ${tokenAccount.address.toBase58()}`);

  const explorerLink = getExplorerLink(
    "address",
    tokenAccount.address.toBase58(),
    "devnet",
  );

  console.log(`✅ Token Account created. Explorer link: ${explorerLink}`);
} catch (error) {
  console.error(
    `Failed to create token account: ${error instanceof Error ? error.message : String(error)}`,
  );
}
```

Run the script using `npx esrun create-token-account.ts`. You should see:
Run the script using `npx esrun create-token-account.ts`. You should see:

```bash
🔑 Loaded keypair from environment. Public key: GprrWv9r8BMxQiWea9MrbCyK7ig7Mj8CcseEbJhDDZXM
Token Account Address: FufnDfidkitedX83dkLFuZ2MhP8kKdm6c5W4W5JbnkUm
✅ Token Account created. Explorer link: https://explorer.solana.com/address/FufnDfidkitedX83dkLFuZ2MhP8kKdm6c5W4W5JbnkUm?cluster=devnet
```

Open the token account in Solana Explorer. Notice that the owner is the account
you created the associated token account for. The balance will be zero because
no tokens have been minted to it yet. Let's mint some tokens to this account to
update the balance!

![Token Account](/public/assets/courses/unboxed/create-token-account.png)

Remember the address of your token account that will be used next to mint
tokens.

#### Minting Tokens

Now that we have a token mint and a token account, let's mint tokens to the
token account. Recall that we set the `user` as the `mintAuthority` for the mint
we created.

Create an empty file called `mint-tokens.ts`. We will be using the `mintTo()`
function from `spl-token` to mint tokens. Remember to substitute your token mint
address and token account address in the code below:

```typescript filename="mint-tokens.ts"
import { mintTo } from "@solana/spl-token";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import dotenv from "dotenv";

dotenv.config();

const connection = new Connection(clusterApiUrl("devnet"));

// Our token has two decimal places
const TOKEN_DECIMALS = 2;
const MINOR_UNITS_PER_MAJOR_UNITS = 10 ** TOKEN_DECIMALS;

// Load user's keypair from environment variable
const user = getKeypairFromEnvironment("SECRET_KEY");

// Replace with your actual token mint address from create-token-mint.ts
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT_ADDRESS");

// Replace with the recipient's associated token account address
// This could be your own or another wallet's token account
const recipientAssociatedTokenAccount = new PublicKey(
  "RECIPIENT_TOKEN_ACCOUNT",
);

try {
  // Mint 10 tokens to the recipient's associated token account
  const transactionSignature = await mintTo(
    connection,
    user,
    tokenMintAccount,
    recipientAssociatedTokenAccount,
    user, // The user is both the payer and the mint authority in this case
    10 * MINOR_UNITS_PER_MAJOR_UNITS,
  );

  const explorerLink = getExplorerLink(
    "transaction",
    transactionSignature,
    "devnet",
  );

  console.log(
    `✅ Tokens minted successfully. Transaction explorer link: ${explorerLink}`,
  );
} catch (error) {
  console.error(
    `Failed to mint tokens: ${error instanceof Error ? error.message : String(error)}`,
  );
}
```

Run the script using `npx esrun mint-tokens.ts`. You should see:

```bash
✅ Tokens minted successfully. Transaction explorer link: https://explorer.solana.com/tx/4gm5dNoRBipndJTRfUQ5x1v9azTeymDc8UojXdyP6TcZriUgvdr7kZdCJmgdUKnrBMMWKiRKmj3wbjozbpy7znWU?cluster=devnet
```

Open Explorer, and see the transaction and the new tokens in the recipient's
account!

![Mint Tokens](/public/assets/courses/unboxed/mint-tokens.png)

#### Transferring Tokens

Next, let's transfer some of the tokens we just minted using the `spl-token`
library's `transfer()` function. You can
[add a second account on devnet](/content/courses/intro-to-solana/intro-to-cryptography.md)
if you like, or find a friend who has a devnet account and send them your token!

As you saw in Explorer, the tokens currently reside in an Associated Token
Account (ATA) attached to our wallet. We don't need to remember the address for
our associated token account — we can just look it up using
`getOrCreateAssociatedTokenAccount()` by providing our wallet address and the
mint of the token we want to send. Similarly, we can find (or create) an ATA for
our recipient to hold this token too.

Create an empty file called `transfer-tokens.ts`. Then replace
`YOUR_RECIPIENT_HERE` with your recipient public key and replace
`YOUR_TOKEN_MINT_ADDRESS_HERE` with your token mint address.

```typescript filename="transfer-tokens.ts"
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import dotenv from "dotenv";

dotenv.config();

const connection = new Connection(clusterApiUrl("devnet"));

// Load sender's keypair from environment variable
const sender = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${sender.publicKey.toBase58()}`,
);

// Add the recipient public key here
const recipient = new PublicKey("YOUR_RECIPIENT_HERE");

// Replace with your actual token mint address from create-token-mint.ts
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT_ADDRESS_HERE");

// Our token has two decimal places
const TOKEN_DECIMALS = 2;
const MINOR_UNITS_PER_MAJOR_UNITS = 10 ** TOKEN_DECIMALS;

console.log(`💸 Attempting to send 1 token to ${recipient.toBase58()}...`);

try {
  // Get or create the source token account
  const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    sender,
    tokenMintAccount,
    sender.publicKey,
  );

  // Get or create the destination token account
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

  console.log(`✅ Transaction confirmed, explorer link is: ${explorerLink}`);
} catch (error) {
  console.error(
    `Failed to transfer tokens: ${error instanceof Error ? error.message : String(error)}`,
  );
}
```

Run the script using `npx esrun transfer-tokens.ts`. You should see:

```bash
 Loaded our keypair securely, using an env file! Our public key is: GprrWv9r8BMxQiWea9MrbCyK7ig7Mj8CcseEbJhDDZXM
💸 Attempting to send 1 token to 3oihZhwmbtJwi9J3bgZzfd5uHDBwWr7prFanisgi9mjz...
✅ Transaction confirmed, explorer link is: https://explorer.solana.com/tx/4m9DA14qg1D2oRXydqCXHPY4UAPEWQgjDvryAUEH1Zn8pEACDMmNj7CP4bxnScPNKuzG6CARwwGpGWVmqCuW3QeC?cluster=devnet
```

Open the Explorer link. You see your balance go down, and the recipient's
balance go up!

![Transfer Tokens](/public/assets/courses/unboxed/transfer-tokens.png)

### Challenge

Now it's your turn to build something independently. Create an application that
Now it's your turn to build something independently. Create an application that
allows a user to create a new mint, create a token account, and mint tokens.

To interact with the Token Program using the wallet adapter, you will have to
build each transaction and then submit the transaction to the wallet app for
approval.

![Token Program Challenge Frontend](/public/assets/courses/unboxed/token-program-frontend.png)

1. You can build this from scratch or
   [download the starter code](https://github.com/Unboxed-Software/solana-token-frontend/tree/starter).
2. Create a new Token Mint in the `CreateMint` component. If you need a
   refresher on how to send transactions to a wallet for approval, check out the
   [Wallets lesson](/content/courses/intro-to-solana/interact-with-wallets.md).

   When creating a new mint, the newly generated `Keypair` will also have to
   sign the transaction. When additional signers are required, in addition to
   the connected wallet, use the following format:

   ```typescript
   sendTransaction(transaction, connection, {
     signers: [Keypair],
   });
   ```

3. Create a new Token Account in the `CreateTokenAccount` component.
4. Mint tokens in the `MintToForm` component.

If you get stumped, feel free to reference the
[solution code](https://github.com/Unboxed-Software/solana-token-frontend/tree/main).

And remember, get creative with these challenges and make them your own!

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=72cab3b8-984b-4b09-a341-86800167cfc7)!
</Callout>
