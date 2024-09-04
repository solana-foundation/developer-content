---
title: Close Mint Extension
objectives:
  - Create a mint that is closable
  - Describe all of the prerequisites needed to close a mint
description: "Create a mint that can be closed once the tokens are burnt."
---

## Prerequisites

Before starting this lesson, ensure you have:

- [A basic understanding of the Solana blockchain](/content/workshops/solana-101.md).
- [Getting Started with Token Extensions](/content/guides/token-extensions/getting-started.md).
- [A local Solana development environment set up](/content/workshops/solana-101.md).

## Summary

- The original Token Program only allowed closing token accounts, but not mint
  accounts.
- The Token Extensions Program includes the `close mint` extension which allows
  mint accounts to be closed.
- To close a mint with the `close mint` extension, the supply of said mint needs
  to be 0.
- The `mintCloseAuthority` can be updated by calling `setAuthority`

By the end of this lesson, you'll be able to create a mint that can be closed
under the right conditions, ensuring efficient use of resources on the Solana
network.

## Overview

The original Token Program only allows owners to close token accounts, not mint
accounts. So if you create a mint, you'll never be able to close the account.
This has resulted in a lot of wasted space on the blockchain. To remedy this,
the Token Extensions Program introduced the `close mint` extension. This simply
allows a mint account to be closed and the lamports refunded. The only caveat is
the supply of said mint needs to be 0.

This extension is a nice improvement for developers, who may have thousands of
mint accounts that could be cleaned up and refunded. Additionally, it's great
for NFT holders who wish to burn their NFT. They will now be able to recuperate
all of the costs, ie closing the mint, metadata, and token accounts. Whereas
before, if someone burned an NFT would only recuperate the metadata and token
account's rents. Note, that the burner would also have to be the
`mintCloseAuthority`.

The `close mint` extension, adds the field `mintCloseAuthority` to the mint
account. This is the address of the authority to close the account.

Again, for a mint to be closed with this extension, the supply has to be 0. So
if any of this token is minted, it will have to be burned first.

### Create Mint with Close Authority

Initializing the mint with the close authority extension involves three
instructions:

- `SystemProgram.createAccount`
- `createInitializeMintCloseAuthorityInstruction`
- `createInitializeMintInstruction`

The first instruction `SystemProgram.createAccount` allocates space on the
blockchain for the mint account. However, like all Token Extensions Program
mints, we need to calculate the size and cost of the mint. This can be
accomplished by using `getMintLen` and `getMinimumBalanceForRentExemption`. In
this case, we'll call `getMintLen` with only the
`ExtensionType.MintCloseAuthority`.

To get the mint length and create account instructions, do the following:

```ts
const extensions = [ExtensionType.MintCloseAuthority];
const mintLength = getMintLen(extensions);

const mintLamports =
  await connection.getMinimumBalanceForRentExemption(mintLength);

const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer,
  newAccountPubkey: mint,
  space: mintLength,
  lamports: mintLamports,
  programId: TOKEN_2022_PROGRAM_ID,
});
```

The second instruction `createInitializeMintCloseAuthorityInstruction`
initializes the close authority extension. The only notable parameter is the
`mintCloseAuthority` in the second position. This is the address that can close
the mint.

```ts
const initializeMintCloseAuthorityInstruction =
  createInitializeMintCloseAuthorityInstruction(
    mint,
    authority,
    TOKEN_2022_PROGRAM_ID,
  );
```

The last instruction `createInitializeMintInstruction` initializes the mint.

```ts
const initializeMintInstruction = createInitializeMintInstruction(
  mint,
  decimals,
  payer.publicKey,
  null,
  TOKEN_2022_PROGRAM_ID,
);
```

Finally, we add the instructions to the transaction and submit it to the Solana
network.

```typescript
const mintTransaction = new Transaction().add(
  createAccountInstruction,
  initializeMintCloseAuthorityInstruction,
  initializeMintInstruction,
);

const signature = await sendAndConfirmTransaction(
  connection,
  mintTransaction,
  [payer, mintKeypair],
  { commitment: "finalized" },
);
```

When the transaction is sent, a new mint account is created with the specified
close authority.

### Close Mint with Close Authority

To close a mint with the `close mint` extension, all that is needed is to call
the `closeAccount` function.

Remember, that to close the mint account, the total supply has to be 0. So if
any tokens exist, they have to be burned first. You can do this with the `burn`
function.

<Callout type="note">The `closeAccount` function applies to both mints and token
accounts. </Callout>

```ts
// burn tokens to 0
const burnSignature = await burn(
  connection, // connection - Connection to use
  payer, // payer -Payer of the transaction fees
  sourceAccount, // account - Account to burn tokens from
  mintKeypair.publicKey, // mint - Mint for the account
  sourceKeypair, // owner - Account owner
  sourceAccountInfo.amount, // amount -  Amount to burn
  [], // multiSigners - Signing accounts if `owner` is a multisig
  { commitment: "finalized" }, // confirmOptions - Options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // programId - SPL Token program account
);

// account can be closed as the total supply is now 0
await closeAccount(
  connection, // connection - Connection to use
  payer, // payer - Payer of the transaction fees
  mintKeypair.publicKey, // account - Account to close
  payer.publicKey, // destination - Account to receive the remaining balance of the closed account
  payer, // authority - Authority which is allowed to close the account
  [], // multiSigners - Signing accounts of `authority` is a multisig
  { commitment: "finalized" }, // confirmOptions - Options for confirming the transaction
  TOKEN_2022_PROGRAM_ID, // programIdSPL Token program account
);
```

### Update Close Mint Authority

To update the `closeMintAuthority` you can call the `setAuthority` function and
pass in the right accounts, as well as the `authorityType`, which in this case
is `AuthorityType.CloseMint`

```ts
/**
 * Assign a new authority to the account
 *
 * @param connection       Connection to use
 * @param payer            Payer of the transaction fees
 * @param account          Address of the account
 * @param currentAuthority Current authority of the specified type
 * @param authorityType    Type of authority to set
 * @param newAuthority     New authority of the account
 * @param multiSigners     Signing accounts if `currentAuthority` is a multisig
 * @param confirmOptions   Options for confirming the transaction
 * @param programId        SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */

await setAuthority(
  connection,
  payer,
  mint,
  currentAuthority,
  AuthorityType.CloseMint,
  newAuthority,
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID,
);
```

## Lab

In this lab, we'll create a mint with the `close mint` extension. We will then
mint some of the tokens and see what happens when we try to close it with a
non-zero supply (hint, the close transaction will fail). Lastly, we will burn
the supply and close the account.

### 1. Getting Started

To get started, you can either clone the provided
[starter repository](https://github.com/Unboxed-Software/solana-lab-close-mint-account/tree/starter)
and then follow the instructions in the `README.md` file to get started.

Alternatively, you can start from scratch by creating an empty directory named
`close-mint` and navigate to it. We'll be initializing a new project. Run
`npm init -y` and follow through the prompts.

Next, we'll need to add our dependencies. Run the following to install the
required packages:

```bash
npm i @solana-developers/helpers @solana/spl-token @solana/web3.js esrun dotenv typescript
```

Remember to update your package.json file to include the following `start`
script.

```json
"scripts": {
  "start": "esrun src/index.ts"
}
```

Then create a directory named `src`. In this directory, create a file named
`index.ts`. This is where we will run checks against the rules of this
extension. Paste the following code in `index.ts`:

```ts
import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { initializeKeypair } from "@solana-developers/helpers";
// import { createClosableMint } from './create-mint' // - uncomment this in a later step
import {
  TOKEN_2022_PROGRAM_ID,
  burn,
  closeAccount,
  createAccount,
  getAccount,
  getMint,
  mintTo,
} from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();

/**
 * Create a connection and initialize a keypair if one doesn't already exist.
 * If a keypair exists, airdrop a SOL if needed.
 */
const connection = new Connection("http://127.0.0.1:8899");
const payer = await initializeKeypair(connection);

console.log(`public key: ${payer.publicKey.toBase58()}`);

const mintKeypair = Keypair.generate();
const mint = mintKeypair.publicKey;
console.log("\nmint public key: " + mintKeypair.publicKey.toBase58() + "\n\n");

// CREATE A MINT WITH CLOSE AUTHORITY

// MINT TOKEN

// VERIFY SUPPLY

// TRY CLOSING WITH NON ZERO SUPPLY

// BURN SUPPLY

// CLOSE MINT
```

`index.ts` creates a connection to the specified validator node and calls
`initializeKeypair`. This is where we'll call the rest of our script once we've
written it.

Go ahead and run the script. You should see the `payer` and `mint` public key
logged to your terminal.

```bash
$npm run start


> solana-lab-close-mint-account@1.0.0 start
> esrun src/index.ts


public key: 61Yvz9TsBgcoX2opQUATNhnJH81sHXmoWu7XvGtUQjGz


mint public key: 95yXT66xeqxopxE3MXAgsf8k1nMNSwbX6px82fzwhUuF
```

If you run into an error in `initializeKeypair` with airdropping, follow the
next step.

#### 2. Run validator node

For the sake of this guide, we'll be running our validator node.

In a separate terminal, run the following command: `solana-test-validator`. This
will run the node and also log out some keys and values. The value we need to
retrieve and use in our connection is the JSON RPC URL, which in this case is
`http://127.0.0.1:8899`. We then use that in the connection to specify the use
of the local RPC URL.

```typescript
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
```

Alternatively, if you’d like to use testnet or devnet, import the
`clusterApiUrl` from `@solana/web3.js` and pass it to the connection as such:

```typescript
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
```

If you decide to use devnet and have issues with airdropping SOL, feel free to
add the `keypairPath` parameter to `initializeKeypair`. You can get this by
running `solana config get` in your terminal. And then go to
[faucet.solana.com](https://faucet.solana.com/) and airdrop some SOL to your
address. You can get your address by running `solana address` in your terminal.

### 3. Create a mint with close authority

Let's create a closable mint by creating the function `createClosableMint` in a
new file `src/create-mint.ts`.

To create a closable mint, we need several instructions:

- `getMintLen`: Gets the space needed for the mint account
- `SystemProgram.getMinimumBalanceForRentExemption`: Tells us the cost of the
  rent for the mint account
- `SystemProgram.createAccount`: Creates the instruction to allocate space on
  Solana for the mint account
- `createInitializeMintCloseAuthorityInstruction`: Creates the instruction to
  initialize the close mint extension - this takes the `closeMintAuthority` as a
  parameter.
- `createInitializeMintInstruction`: Creates the instruction to initialize the
  mint
- `sendAndConfirmTransaction`: Sends the transaction to the blockchain

We'll call all of these functions in turn. But before that, let's define the
inputs to our `createClosableMint` function:

- `connection: Connection` : The connection object
- `payer: Keypair` : Payer for the transaction
- `mintKeypair: Keypair` : Keypair for new mint
- `decimals: number` : Mint decimals

Putting it all together we get:

```ts
import {
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";

import {
  ExtensionType,
  createInitializeMintInstruction,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMintCloseAuthorityInstruction,
} from "@solana/spl-token";

export async function createClosableMint(
  connection: Connection,
  payer: Keypair,
  mintKeypair: Keypair,
  decimals: number,
): Promise<TransactionSignature> {
  const extensions = [ExtensionType.MintCloseAuthority];
  const mintLength = getMintLen(extensions);

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(mintLength);

  console.log("Creating a transaction with close mint instruction...");
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLength,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeMintCloseAuthorityInstruction(
      mintKeypair.publicKey,
      payer.publicKey,
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      payer.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  console.log("Sending transaction...");
  const signature = await sendAndConfirmTransaction(
    connection,
    mintTransaction,
    [payer, mintKeypair],
    { commitment: "finalized" },
  );

  return signature;
}
```

Now let's call this function in `src/index.ts`. First, you'll need to import our
new function. Then paste the following under the right comment section:

```ts
// CREATE A MINT WITH CLOSE AUTHORITY
const decimals = 9;

await createClosableMint(connection, payer, mintKeypair, decimals);
```

This will create a transaction with close mint instructions.

Feel free to run this and check that everything is working:

```bash
npm run start
```

You should have the following logged in your terminal:

```bash


Creating a transaction with close mint instruction...
Sending transaction...
```

### 4. Closing the mint

We're going to close the mint, but first, let's explore what happens when we
have a supply when trying to close (hint, it'll fail).

To do this, we are going to mint some tokens, try to close them, then burn the
tokens and then actually close.

#### 4.1 Mint a token

In `src/index.ts`, create an account and mint 1 token to that account.

We can accomplish this by calling 2 functions: `createAccount` and `mintTo`:

```ts
// MINT TOKEN
/**
 * Create an account and mint 1 token to that account
 */
console.log("Creating an account...");
const sourceKeypair = Keypair.generate();
const sourceAccount = await createAccount(
  connection,
  payer,
  mint,
  sourceKeypair.publicKey,
  undefined,
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);

console.log("Minting 1 token...\n\n");
const amount = 1 * LAMPORTS_PER_SOL;
await mintTo(
  connection,
  payer,
  mint,
  sourceAccount,
  payer,
  amount,
  [payer],
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);
```

Now we can verify that the mint supply is non-zero by fetching the mint info.
Underneath the minting functions, add the following code block:

```ts
// VERIFY SUPPLY
/**
 * Get mint information to verify the supply
 */
const mintInfo = await getMint(
  connection,
  mintKeypair.publicKey,
  "finalized",
  TOKEN_2022_PROGRAM_ID,
);
console.log("Initial supply: ", mintInfo.supply);
```

Let's run the script and check the initial supply:

```bash
npm run start
```

You should see the following in your terminal:

```bash
Initial supply:  1000000000n
```

#### 4.2 Closing the mint with non zero supply

Now we'll attempt to close the mint when supply is non-zero. We know this is
going to fail, since the `close mint` extension requires a non-zero supply. So
to see the resulting error message, we'll wrap the `closeAccount` function in a
try catch and log out of the error:

```ts
// TRY CLOSING WITH NON ZERO SUPPLY
/**
 * Try closing the mint account when the supply is not 0
 *
 * Should throw `SendTransactionError`
 */
try {
  await closeAccount(
    connection,
    payer,
    mintKeypair.publicKey,
    payer.publicKey,
    payer,
    [],
    { commitment: "finalized" },
    TOKEN_2022_PROGRAM_ID,
  );
} catch (e) {
  console.log(
    "Close account fails here because the supply is not zero. Check the program logs:",
    (e as any).logs,
    "\n\n",
  );
}
```

Give this a run:

```bash
npm run start
```

We'll see that the program throws an error along with the program logs. You
should see the following:

```bash
Close account fails here because the supply is not zero.
```

#### 4.3 Burning the supply

Let's burn the whole supply so we can close the mint. We do this by calling
`burn`:

```ts
// BURN SUPPLY
const sourceAccountInfo = await getAccount(
  connection,
  sourceAccount,
  "finalized",
  TOKEN_2022_PROGRAM_ID,
);

console.log("Burning the supply...");
const burnSignature = await burn(
  connection,
  payer,
  sourceAccount,
  mintKeypair.publicKey,
  sourceKeypair,
  sourceAccountInfo.amount,
  [],
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);
```

#### 4.4 Close the mint

With no tokens in circulation, we can now close the mint. At this point, we can
call `closeAccount`, however, for the sake of visualizing how this works, we'll
do the following:

    - Retrieve Mint Information: Initially, we fetch and inspect the mint's details, particularly focusing on the supply, which should be zero at this stage. This shows that the mint is eligible to be closed.


    - Verify Account Status: Next, we confirm the account status to ensure it's still open and active.


    - Close the Account: Once we've verified the account's open status, we proceed to close the mint account.


    - Confirm Closure: Finally, after invoking the `closeAccount` function, we check the account status once more to confirm that it has indeed been closed successfully.

We can accomplish all of this with the following functions:

- `getMint`: Grabs the mint account and deserializes the information
- `getAccountInfo`: Grabs the mint account, so we can check it exists - we'll
  call this before and after the close.
- `closeAccount`: Closes the mint

Putting this all together we get:

```ts
// CLOSE MINT
console.log("After burn supply: ", mintInfo.supply);

const accountInfoBeforeClose = await connection.getAccountInfo(
  mintKeypair.publicKey,
  "finalized",
);

console.log("Account closed? ", accountInfoBeforeClose === null);

console.log("Closing account after burning the supply...");
const closeSignature = await closeAccount(
  connection,
  payer,
  mintKeypair.publicKey,
  payer.publicKey,
  payer,
  [],
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);

const accountInfoAfterClose = await connection.getAccountInfo(
  mintKeypair.publicKey,
  "finalized",
);

console.log("Account closed? ", accountInfoAfterClose === null);
```

Run the script one last time.

```bash
npm run start
```

After running the script your terminal should log this out:

```bash
Creating a transaction with close mint instruction...
Sending transaction...
Creating an account...
Minting 1 token...




Initial supply:  1000000000n
Close account fails here because the supply is not zero.


Burning the supply...
After burn supply:  0n
Account closed?  false
Closing account after burning the supply...
Account closed?  true
```

You should see the whole process of creating a closable mint, minting a token,
trying to close, burning the token, and finally closing the account.

That's it! We have successfully created a mint with close authority. If you get
stuck at any point, you can find working code in the `solution` branch of
[this repository](https://github.com/Unboxed-Software/solana-lab-close-mint-account/tree/solution).

If you would prefer a visual guide on
[Closing Token Mints with Token Extensions on Solana](https://www.youtube.com/watch?v=TpshfjHq57I)
check out this video.

## Challenge

For the challenge, try and create your mint and mint to several tokens accounts,
then create a script to burn all of those token accounts, then close the mint.

## Next Steps

Congratulations on completing this lesson! Now that you have successfully
created and closed a mint with the `close mint` extension, here are some next
steps you can take:

- [The Token Extensions Program offers several other useful
  features](/content/guides/token-extensions/getting-started.md#How do I create
  a token with token extensions?)
- Consider using the `close mint` extension in a real-world project, such as an
  NFT platform or a DeFi application.
- Lastly, don’t forget to share your experience with the Solana developer
  community, contribute to open-source projects, or write a blog post about what
  you've learned.

By continuing to build on this knowledge, you'll deepen your expertise and
become a more proficient Solana developer.
