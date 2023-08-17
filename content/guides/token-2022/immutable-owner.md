# Immutable Owner: Token 2022 Account Extension

With the Token program, the `SetAuthority` instruction can be used for various use cases. Among them, an Account's owner may transfer ownership of an account to another.

The immutable owner extension ensures that ownership of a token account cannot be reassigned.

## Understanding the implications

So, why is this important? The addresses for Associated Token Accounts are derived based on the owner and the mint. This makes it easy to find the related token account for a specific owner. If the account owner has reassigned ownership of this account, then applications may derive the address for that account and use it, not knowing that it no longer belongs to the owner.

This guide walks you through how to use the Immutable Owner extension to prevent the transfer of ownership of a token account.

Let's get started!

## Install dependencies

```shell
npm i @solana/web3.js @solana/spl-token
```

Install the `@solana/web3.js` and `@solana/spl-token` packages.

## Setting up

We'll begin by setting up our script to create a new token account.

First, we will need to:

- Establish a connection to the devnet cluster
- Generate a payer account and fund it
- Create a new token mint using the Token 2022 program

```javascript
import {
    clusterApiUrl,
    sendAndConfirmTransaction,
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
    createAccount,
    createMint,
    createInitializeImmutableOwnerInstruction,
    createInitializeAccountInstruction,
    getAccountLen,
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

// We establish a connection to the cluster
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Next, we create and fund the payer account
const payer = Keypair.generate();
const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

// Next, we create a new keypair that will be the mint authority
const mintAuthority = Keypair.generate();
const decimals = 9;

// Next, we create a new token mint
const mint = await createMint(
    connection, // connection
    payer, // fee payer
    mintAuthority.publicKey, // mint authority
    mintAuthority.publicKey, // freeze authority
    decimals, // decimals
    undefined, // keypair
    undefined, // confirm options
    TOKEN_2022_PROGRAM_ID // Token Program ID
);
```

> The [Mint](https://spl.solana.com/token#creating-a-new-token-type) is used to create or "mint" new tokens that are stored in token accounts.

Lets explore two options of using the extension:

1. Creating an account with immutable ownership
2. Creating an associated token account with immutable ownership

## Option 1: Creating an account with immutable ownership

### Account setup

```javascript
const ownerKeypair = Keypair.generate();
const accountKeypair = Keypair.generate();

// Explanation of the two keypairs:
// ownerKeypair: The owner of the token account
// accountKeypair: The address of our token account

const account = accountKeypair.publicKey;

const accountLen = getAccountLen([ExtensionType.ImmutableOwner]);
const lamports = await connection.getMinimumBalanceForRentExemption(accountLen);
```

Next, we get the size of our new account and calculate the amount for rent exemption. We use the helper `getAccountLen` helper function, which takes an array of extensions we want for this account.

> The total size of the token account is 165 bytes (the size of a token account) + the size of the added extensions

### The Instructions

```javascript
const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey,
    newAccountPubkey: account,
    space: accountLen,
    lamports,
    programId: TOKEN_2022_PROGRAM_ID,
});
```

We create a new account and assign ownership to the token 2022 program.

```javascript
const initializeImmutableOwnerInstruction = createInitializeImmutableOwnerInstruction(
    account, 
    TOKEN_2022_PROGRAM_ID
);
```

We then initialize the Immutable Owner extension for the given token account. It's important to note that this can only be done for accounts that have not been initialized yet.

```javascript
const initializeAccountInstruction = createInitializeAccountInstruction(
    account, 
    mint, 
    ownerKeypair.publicKey, 
    TOKEN_2022_PROGRAM_ID
);
```

Next, we initialize our newly created account to hold tokens.

### Send and confirm

```javascript
const transaction = new Transaction().add(
    createAccountInstruction,
    initializeImmutableOwnerInstruction,
    initializeAccountInstruction
);
await sendAndConfirmTransaction(connection, transaction, [payer, accountKeypair], undefined);
```

Finally, we add the instructions to our transaction and send it to the network. As a result, we've created a token account for our new mint with the immutable owner extension applied.

If we attempt to change the owner of this account, we get an error:

```shell
"Program log: Instruction: SetAuthority", 
"Program log: The owner authority cannot be changed"
```

## Option 2: Creating an associated token account with immutable ownership

By default, all associated token accounts have the immutable owner extension applied.

### Create Account

```javascript
const associatedTokenAccount = await createAccount(
    connection, // connection
    payer, // fee payer
    mint, // token mint
    ownerKeypair.publicKey, // owner
    undefined, // keypair | defaults to ATA
    undefined, // confirm options
    TOKEN_2022_PROGRAM_ID // program id
);
```

The newly created `associatedTokenAccount` has the immutable owner extension applied as the Associated Token Account program always uses the extension when creating accounts.

## Conclusion

With the Immutable Owner extension, Token 2022 removes a potential foot gun. By ensuring that a token account's derived address genuinely reflects its owner.
