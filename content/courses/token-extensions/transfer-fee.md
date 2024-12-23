---
title: Transfer Fee Extension
objectives:
  - Create transfer fee configured mint
  - Transfer tokens of that mint
  - Collect fees for the transfer
description:
  "Create a token that allows a fee to be charged each time the token is traded."
---

## Summary

- The Token Extension Program's `transfer fee` extension allows fees to be
  withheld on every transfer. These fees are held on the recipient's account,
  and can only be redeemed from the `withdrawWithheldAuthority` authority
- Withheld tokens can be withdrawn directly from the recipient accounts or can
  be harvested back to the mint and then withdrawn
- Transfers with mints using the `transfer fee` extension need to use the
  `transferCheckedWithFee` instruction

## Overview

Suppose you're a Solana game developer and you're making a large open world
multiplayer role playing game. You'll have a currency in this game that all the
players will earn and trade with. To make the economy in the game circular, you
may want to charge a small transfer fee every time this currency changes hands,
you'd call this the developer tax. This can be accomplished with the
`transfer fee` extension. The neat part is this will work on every transfer,
in-game and out!

The Token Extension Program's `transfer fee` extension enables you to configure
a transfer fee on a mint such that fees are assessed at the protocol level. On
every transfer, some amount of that mint is withheld on the recipient account
which cannot be used by the recipient. At any point after the transfer, the
`withdraw` authority can claim these withheld tokens.

The `transfer fee` extension is customizable and updatable. Here are the inputs
that we'll delve into a bit later:

- Fee basis points: This is the fee assessed on every transfer. For example, if
  1000 tokens with 50 basis points are transferred, it will yield 5 tokens.
- Maximum fee: The cap on transfer fees. With a maximum fee of 5000 tokens, a
  transfer of 10,000,000,000,000 tokens will only yield 5000 tokens.
- Transfer fee authority: The entity that can modify the fees.
- Withdraw withheld authority: The entity that can move tokens withheld on the
  mint or token accounts.

### Calculating fee basis points

Before we go into the extension, here's a quick intro to "fee basis points".

A basis point is a unit of measurement used in finance to describe the
percentage change in the value or rate of a financial instrument. One basis
point is equivalent to 0.01% or 0.0001 in decimal form.

To get the fee we must calculate it as follows:

```
Fee = (token_amount * fee_basis_points) / 10000
```

The constant 10,000 is used to convert the fee basis point percentage to the
equivalent amount.

### Configuring a mint with a transfer fee

Initializing a mint with the `transfer fee` extension involves three
instructions:

- `SystemProgram.createAccount`
- `createInitializeTransferFeeConfigInstruction`
- `createInitializeMintInstruction`

The first instruction `SystemProgram.createAccount` allocates space on the
blockchain for the mint account. This instruction accomplishes three things:

- Allocates `space`
- Transfers `lamports` for rent
- Assigns to it's owning program

As with all Token Extension Program's mints, we need to calculate the space and
lamports needed for the mint. We can get these by calling `getMintLen` and
`getMinimumBalanceForRentExemption`

```ts
const extensions = [ExtensionType.TransferFeeConfig];
const mintLength = getMintLen(extensions);

const mintLamports =
  await connection.getMinimumBalanceForRentExemption(mintLength);

const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: mintKeypair.publicKey,
  space: mintLength,
  lamports: mintLamports,
  programId: TOKEN_2022_PROGRAM_ID,
});
```

The second instruction `createInitializeTransferFeeConfigInstruction`
initializes the transfer fee extension.

It takes the following parameters:

- `mint`: Token mint account
- `transferFeeConfigAuthority`: Optional authority that can update the fees
- `withdrawWithheldAuthority`: Optional authority that can withdraw fees
- `transferFeeBasisPoints`: Amount of transfer collected as fees, expressed as
  basis points of the transfer amount
- `maximumFee`: Maximum fee assessed on transfers
- `programId`: SPL Token program account

```ts
const initializeTransferFeeConfigInstruction =
  createInitializeTransferFeeConfigInstruction(
    mintKeypair.publicKey,
    payer.publicKey,
    payer.publicKey,
    feeBasisPoints,
    maxFee,
    TOKEN_2022_PROGRAM_ID,
  );
```

The third instruction `createInitializeMintInstruction` initializes the mint.

```ts
const initializeMintInstruction = createInitializeMintInstruction(
  mintKeypair.publicKey,
  decimals,
  payer.publicKey,
  null,
  TOKEN_2022_PROGRAM_ID,
);
```

Lastly, you need to add all of these instructions to a transaction and send it
off the the blockchain.

```ts
const mintTransaction = new Transaction().add(
  createAccountInstruction,
  initializeTransferFeeConfigInstruction,
  initializeMintInstruction,
);

const signature = await sendAndConfirmTransaction(
  connection,
  mintTransaction,
  [payer, mintKeypair],
  { commitment: "finalized" },
);
```

### Transferring mint with transfer fees

There are a couple of notes when transferring tokens with the `transfer fee`
extension.

First, the recipient is the one who "pays" for the fee. If I send 100 tokens
with basis points of 500 (5%), the recipient will receive 95 tokens (five
withheld)

Second, the fee is calculated not by the tokens sent, but the smallest unit of
said token. In Solana programming, we always specify amounts to be transferred,
minted or burned in their smallest unit. To send one SOL to someone, we actually
send `1 * 10 ^ 9` lamports. Another way to look at it is if you wanted to send
one US dollar, you're actually sending 100 pennies. Let's make this dollar a
token with a 500 basis points (5%) transfer fee. Sending one dollar, would
result in a five cent fee. Now let's say we have a max fee of 10 cents, this
will always be the highest fee, even if we send $10,000.

The calculation can be summed up like this:

```ts
const transferAmount = BigInt(tokensToSend * 10 ** decimals);
const basisPointFee =
  (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);
const fee = basisPointFee > maxFee ? maxFee : basisPointFee;
```

Third and final, there are two ways to transfer tokens with the `transfer fee`
extension: `transfer_checked` or `transfer_checked_with_fee`. The regular
`transfer` function lacks the necessary logic to handle fees.

You have the choice of which function to use for transferring:

- `transfer_checked_with_fee`: You have to calculate and provide the correct
  fees
- `transfer_checked`: This will calculate the fees for you

```ts
/**
 * Transfer tokens from one account to another, asserting the token mint and decimals
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param source         Source account
 * @param mint           Mint for the account
 * @param destination    Destination account
 * @param owner          Owner of the source account
 * @param amount         Number of tokens to transfer
 * @param decimals       Number of decimals in transfer amount
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */

const secondTransferAmount = BigInt(1 * 10 ** decimals);
const secondTransferSignature = await transferChecked(
  connection,
  payer,
  sourceAccount,
  mint,
  destinationAccount,
  sourceKeypair,
  secondTransferAmount,
  decimals, // Can also be gotten by getting the mint account details with `getMint(...)`
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID,
);
```

### Collecting fees

There are two ways to "collect fees" from the withheld portion of the token
accounts.

1. The `withdrawWithheldAuthority` can withdraw directly from the withheld
   portion of a user's token account into any "token vault"
2. We can "harvest" the withheld tokens and store them within the mint account
   itself, which can be withdrawn at any point from the
   `withdrawWithheldAuthority`

But first, why have these two options?

Simply put, directly withdrawing is a permissioned function, meaning only the
`withdrawWithheldAuthority` can call it. Whereas harvesting is permissionless,
where anyone can call the harvest function consolidating all of the fees into
the mint itself.

But why not just directly transfer the tokens to the fee collector on each
transfer?

Two reasons: one, where the mint creator wants the fees to end up may change.
Two, this would create a bottleneck.

Say you have a very popular token with `transfer fee` enabled and your fee vault
is the recipient of the fees. If thousands of people are trying to transact the
token simultaneously, they'll all have to update your fee vault's balance - your
fee vault has to be "writable". While it's true Solana can execute in parallel,
it cannot execute in parallel if the same accounts are being written to at the
same time. So, these thousands of people would have to wait in line, slowing
down the transfer drastically. This is solved by setting aside the `withheld`
transfer fees within the recipient's account - this way, only the sender and
receiver's accounts are writable. Then the `withdrawWithheldAuthority` can
withdraw to the fee vault anytime after.

#### Directly withdrawing fees

In the first case, If we want to withdraw all withheld transfer fees from all
token accounts directly we can do the following:

1. Grab all token accounts associated with the mint using `getProgramAccounts`
2. Add all token accounts with some withheld tokens to a list
3. Call the `withdrawWithheldTokensFromAccounts` function (the `authority` needs
   to be a signer)

```ts
// grabs all of the token accounts for a given mint
const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
  commitment: "finalized",
  filters: [
    {
      memcmp: {
        offset: 0,
        bytes: mint.toString(),
      },
    },
  ],
});

const accountsToWithdrawFrom = [];
for (const accountInfo of accounts) {
  const unpackedAccount = unpackAccount(
    accountInfo.pubkey,
    accountInfo.account,
    TOKEN_2022_PROGRAM_ID,
  );

  // If there is withheld tokens add it to our list
  const transferFeeAmount = getTransferFeeAmount(unpackedAccount);
  if (
    transferFeeAmount != null &&
    transferFeeAmount.withheldAmount > BigInt(0)
  ) {
    accountsToWithdrawFrom.push(accountInfo.pubkey);
  }
}

/**
 * Withdraw withheld tokens from accounts
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           The token mint
 * @param destination    The destination account
 * @param authority      The mint's withdraw withheld tokens authority
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param sources        Source accounts from which to withdraw withheld fees
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
await withdrawWithheldTokensFromAccounts(
  connection,
  payer,
  mint,
  feeVaultAccount,
  authority,
  [],
  accountsToWithdrawFrom,
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);
```

#### Harvesting fees

The second approach we call "harvesting" - this is a permissionless function
meaning anyone can call it. This approach is great for "cranking" the harvest
instruction with tools like [clockwork](https://www.clockwork.xyz/). The
difference is when we harvest, the withheld tokens get stored in the mint
itself. Then the `withdrawWithheldAuthority` can withdraw the tokens from the
mint at any point.

To harvest:

1. gather all of the accounts you want to harvest from (same flow as above)
2. call `harvestWithheldTokensToMint`
3. To withdraw from the mint, call `withdrawWithheldTokensFromMint`

```ts
/**
 * Harvest withheld tokens from accounts to the mint
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           The token mint
 * @param sources        Source accounts from which to withdraw withheld fees
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
await harvestWithheldTokensToMint(
  connection,
  payer,
  mint,
  accountsToHarvestFrom,
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);

/**
 * Withdraw withheld tokens from mint
 *
 * @param connection     Connection to use
 * @param payer          Payer of the transaction fees
 * @param mint           The token mint
 * @param destination    The destination account
 * @param authority      The mint's withdraw withheld tokens authority
 * @param multiSigners   Signing accounts if `owner` is a multisig
 * @param confirmOptions Options for confirming the transaction
 * @param programId      SPL Token program account
 *
 * @return Signature of the confirmed transaction
 */
await withdrawWithheldTokensFromMint(
  connection,
  payer,
  mint,
  feeVaultAccount,
  authority,
  [],
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);
```

### Updating fees

As of right now there is no way to set the transfer fee post
[creation with the JS library](https://solana.stackexchange.com/questions/7775/spl-token-2022-how-to-modify-transfer-fee-configuration-for-an-existing-mint).
However you can from the CLI assuming the result of `solana config` wallet is
the `transferFeeConfigAuthority`:

```bash
solana address
## The result of ^ needs to be the `transferFeeConfigAuthority`
spl-token set-transfer-fee <MINT_ID> <FEE_IN_BASIS_POINTS> <MAX_FEE>
```

### Updating authorities

If you'd like to change the `transferFeeConfigAuthority` or the
`withdrawWithheldAuthority` you can with the `setAuthority` function. Just pass
in the correct accounts and the `authorityType`, which in these cases are:
`TransferFeeConfig` and `WithheldWithdraw`, respectively.

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
  AuthorityType.TransferFeeConfig, // or AuthorityType.WithheldWithdraw
  newAuthority,
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID,
);
```

## Lab

In this lab, we are going to create a transfer fee configured mint. We'll use a
fee vault to hold the transfer fees, and we'll collect the fees using both the
direct and the harvesting methods.

#### 1. Getting started

To get started, create an empty directory named `transfer-fee` and navigate to
it. We'll be initializing a brand new project. Run `npm init` and follow through
the prompts.

Next, we'll need to add our dependencies. Run the following to install the
required packages:

```bash
npm i @solana-developers/helpers@2 @solana/spl-token @solana/web3.js@1 esrun dotenv typescript
```

Create a directory named `src`. In this directory, create a file named
`index.ts`. This is where we will run checks against the rules of this
extension. Paste the following code in `index.ts`:

```ts
import { Connection, Keypair } from "@solana/web3.js";
import { initializeKeypair } from "@solana-developers/helpers";
import { transferCheckedWithFee } from "@solana/spl-token";

/**
 * Create a connection and initialize a keypair if one doesn't already exists.
 * If a keypair exists, airdrop a SOL token if needed.
 */
const connection = new Connection("http://127.0.0.1:8899");
const payer = await initializeKeypair(connection);

console.log(`public key: ${payer.publicKey.toBase58()}`);

const mintKeypair = Keypair.generate();
const mint = mintKeypair.publicKey;
console.log("\nmint public key: " + mintKeypair.publicKey.toBase58() + "\n\n");

// CREATE MINT WITH TRANSFER FEE

// CREATE FEE VAULT ACCOUNT

// CREATE A SOURCE ACCOUNT AND MINT TOKEN

// CREATE DESTINATION ACCOUNT

// TRANSFER TOKENS

// FETCH ACCOUNTS WITH WITHHELD TOKENS

// WITHDRAW WITHHELD TOKENS

// VERIFY UPDATED FEE VAULT BALANCE

// HARVEST WITHHELD TOKENS TO MINT

// WITHDRAW HARVESTED TOKENS

// VERIFY UPDATED FEE VAULT BALANCE
```

`index.ts` has a main function that creates a connection to the specified
validator node and calls `initializeKeypair`. This `main` function is where
we'll be writing our script.

Go ahead and run the script. You should see the `mint` public key logged to your
terminal.

```bash
esrun src/index.ts
```

If you run into an error in `initializeKeypair` with airdropping, follow the
next step.

#### 2. Run validator node

For the sake of this guide, we'll be running our own validator node.

In a separate terminal, run the following command: `solana-test-validator`. This
will run the node and also log out some keys and values. The value we need to
retrieve and use in our connection is the JSON RPC URL, which in this case is
`http://127.0.0.1:8899`. We then use that in the connection to specify to use
the local RPC URL.

```typescript
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
```

Alternatively, if you'd like to use testnet or devnet, import the
`clusterApiUrl` from `@solana/web3.js` and pass it to the connection as such:

```typescript
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
```

If you decide to use devnet, and have issues with airdropping SOL. Feel free to
add the `keypairPath` parameter to `initializeKeypair`. You can get this from
running `solana config get` in your terminal. And then go to
[faucet.solana.com](https://faucet.solana.com/) and airdrop some sol to your
address. You can get your address from running `solana address` in your
terminal.

#### 3. Create a mint with transfer fee

Let's create a function `createMintWithTransferFee` in a new file
`src/create-mint.ts`.

To create a mint with the `transfer fee` extension, we need three instructions:
`SystemProgram.createAccount`, `createInitializeTransferFeeConfigInstruction`
and `createInitializeMintInstruction`.

We'll also want the our new `createMintWithTransferFee` function to have
following arguments:

- `connection` : The connection object
- `payer` : Payer for the transaction
- `mintKeypair` : Keypair for the new mint
- `decimals` : Mint decimals
- `feeBasisPoints` : Fee basis points for the transfer fee
- `maxFee` : Maximum fee points for the transfer fee

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
  createInitializeTransferFeeConfigInstruction,
} from "@solana/spl-token";

export async function createMintWithTransferFee(
  connection: Connection,
  payer: Keypair,
  mintKeypair: Keypair,
  decimals: number,
  feeBasisPoints: number,
  maxFee: bigint,
): Promise<TransactionSignature> {
  const extensions = [ExtensionType.TransferFeeConfig];
  const mintLength = getMintLen(extensions);

  const mintLamports =
    await connection.getMinimumBalanceForRentExemption(mintLength);

  console.log("Creating a transaction with transfer fee instruction...");
  const mintTransaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLength,
      lamports: mintLamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeTransferFeeConfigInstruction(
      mintKeypair.publicKey,
      payer.publicKey,
      payer.publicKey,
      feeBasisPoints,
      maxFee,
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
  console.log("Transaction sent");

  return signature;
}
```

Now let's import and call our new function in `src/index.ts`. We'll create a
mint that has nine decimal points, 1000 fee basis points (10%), and a max fee
of 5000.

```ts
// CREATE MINT WITH TRANSFER FEE
const decimals = 9;
const feeBasisPoints = 1000;
const maxFee = BigInt(5000);

await createMintWithTransferFee(
  connection,
  payer,
  mintKeypair,
  decimals,
  feeBasisPoints,
  maxFee,
);
```

Run the script to make sure it's working so far.

```bash
esrun src/index.ts
```

#### 4. Create a fee vault account

Before we transfer any tokens and accrue transfer fees, let's create a "fee
vault" that will be the final recipient of all transfer fees.

For simplicity, let's make the fee vault the associated token account (ATA) of
our payer.

```ts
// CREATE FEE VAULT ACCOUNT
console.log("\nCreating a fee vault account...");

const feeVaultAccount = await createAssociatedTokenAccount(
  connection,
  payer,
  mintKeypair.publicKey,
  payer.publicKey,
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);

const initialBalance = (
  await connection.getTokenAccountBalance(feeVaultAccount, "finalized")
).value.amount;

console.log("Current fee vault balance: " + initialBalance + "\n\n");
```

Let's run the script again, we should have a zero balance.

```bash
esrun src/index.ts
```

#### 5. Create two token accounts and mint to one

Let's now create two test token accounts we'll call the `source` and
`destination` accounts. Then let's mint some tokens to the `source`.

We can do this by calling `createAccount` and `mintTo`.

We'll mint 10 full tokens.

```ts
// CREATE TEST ACCOUNTS AND MINT TOKENS
console.log("Creating source account...");

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

console.log("Creating destination account...");

const destinationKeypair = Keypair.generate();
const destinationAccount = await createAccount(
  connection,
  payer,
  mint,
  destinationKeypair.publicKey,
  undefined,
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);

console.log("Minting 10 tokens to source...\n\n");

const amountToMint = 10 * 10 ** decimals;

await mintTo(
  connection,
  payer,
  mint,
  sourceAccount,
  payer,
  amountToMint,
  [payer],
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);
```

If you'd like, run the script to check that everything is working:

```bash
esrun src/index.ts
```

#### 6. Transfer one token

Now, let's transfer 1 token from our `sourceAccount` to our `destinationAccount`
and see what happens.

To transfer a token with the `transfer fee` extension enabled, we have to call
`transferCheckedWithFee`. This requires us to decide how much we want to send,
and to calculate the correct fee associated.

To do this, we can do a little math:

First, to send one full token is actually sending `1 * (10 ^ decimals)` tokens.
In Solana programming, we always specify amounts to be transferred, minted or
burned in their smallest unit. To send one SOL to someone, we actually send
`1 * 10 ^ 9` lamports. Another way to look at it is if you wanted to send one US
dollar, you're actually sending 100 pennies.

Now, we can take the resulting amount: `1 * (10 ^ decimals)` and calculate the
fee using the basis points. We can do this by taking the `transferAmount`
multiplying it by the `feeBasisPoints` and dividing by `10_000` (the definition
of a fee basis point).

Lastly, we need to check if the fee is more than the max fee, if it is, then we
call `transferCheckedWithFee` with our max fee.

```ts
const transferAmount = BigInt(1 * 10 ** decimals);
const basisPointFee =
  (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);
const fee = basisPointFee > maxFee ? maxFee : basisPointFee;
```

With all of this information, take a second, what do you think the final
balances and withheld amounts for this transaction will be?

Now, let's transfer one of our tokens and print out the resulting balances:

```ts
// TRANSFER TOKENS
console.log("Transferring with fee transaction...");

const transferAmount = BigInt(1 * 10 ** decimals);
const fee = (transferAmount * BigInt(feeBasisPoints)) / BigInt(10_000);

const transferSignature = await transferCheckedWithFee(
  connection,
  payer,
  sourceAccount,
  mint,
  destinationAccount,
  sourceKeypair.publicKey,
  transferAmount,
  decimals,
  fee,
  [sourceKeypair],
  { commitment: "finalized" },
  TOKEN_2022_PROGRAM_ID,
);

const sourceAccountAfterTransfer = await getAccount(
  connection,
  sourceAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const destinationAccountAfterTransfer = await getAccount(
  connection,
  destinationAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const withheldAmountAfterTransfer = getTransferFeeAmount(
  destinationAccountAfterTransfer,
);

console.log(`Source Token Balance: ${sourceAccountAfterTransfer.amount}`);
console.log(
  `Destination Token Balance: ${destinationAccountAfterTransfer.amount}`,
);
console.log(
  `Withheld Transfer Fees: ${withheldAmountAfterTransfer?.withheldAmount}\n`,
);
```

Go ahead and run the script:

```bash
esrun src/index.ts
```

You should get the following:

```bash
Transferring with fee transaction...
Source Token Balance: 9000000000
Destination Token Balance: 999995000
Withheld Transfer Fees: 5000
```

A little breakdown:

Our fee basis points are 1000, meaning 10% of the amount transferred should be
used as a fee. In this case 10% of 1,000,000,000 is 100,000,000, which is way
bigger than our 5000 max fee. So that's why we see 5000 withheld. Additionally,
note that the receiver is the one who "pays" for the transfer fee.

<Callout type="note">From now on, to calculate fees, you may want to use the
`calculateFee` helper function. We did it manually for demonstration purposes.
The following is one way to accomplish this:

```ts
const transferAmount = BigInt(1 * 10 ** decimals);
const mintAccount = await getMint(
  connection,
  mint,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);
const transferFeeAmount = getTransferFeeConfig(mintAccount);
const fee = calculateFee(
  transferFeeAmount?.newerTransferFee!,
  secondTransferAmount,
);
```

</Callout>

#### 7. Withdrawing fees

There are two ways in which we can collect fees from the recipient's account
into the fee vault. The first one is withdrawing the withheld fees directly from
the recipient's account itself to the fee vault account using
`withdrawWithheldTokensFromAccounts`. The second approach is "harvesting" the
fees from the recipient's account to the mint with `harvestWithheldTokensToMint`
and then withdrawing it from the mint to the fee vault account with
`withdrawWithheldTokensFromMint`.

#### 7.1 Withdraw fees directly from the recipient accounts

First, let's withdraw the fees directly. We can accomplish this by calling
`withdrawWithheldTokensFromAccounts`. This is a permissioned function, meaning
only the `withdrawWithheldAuthority` can sign for it.

The `withdrawWithheldTokensFromAccounts` function takes the following
parameters:

- `connection`: The connection to use
- `payer`: The payer keypair of the transaction fees
- `mint`: The token mint
- `destination`: The destination account - in our case, the fee vault
- `authority`: The mint's withdraw withheld tokens authority - in our case, the
  payer
- `multiSigners`: Signing accounts if `owner` is a multisig
- `sources`: Source accounts from which to withdraw withheld fees
- `confirmOptions`: Options for confirming the transaction
- `programId`: SPL Token program account - in our case `TOKEN_2022_PROGRAM_ID`

Now, let's directly withdraw the fees from the destination account and check the
resulting balances:

```ts
// DIRECTLY WITHDRAW
await withdrawWithheldTokensFromAccounts(
  connection,
  payer,
  mint,
  feeVaultAccount,
  payer.publicKey,
  [],
  [destinationAccount],
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const withheldAccountAfterWithdraw = await getAccount(
  connection,
  destinationAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const withheldAmountAfterWithdraw = getTransferFeeAmount(
  withheldAccountAfterWithdraw,
);

const feeVaultAfterWithdraw = await getAccount(
  connection,
  feeVaultAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

console.log(
  `Withheld amount after withdraw: ${withheldAmountAfterWithdraw?.withheldAmount}`,
);
console.log(
  `Fee vault balance after withdraw: ${feeVaultAfterWithdraw.amount}\n`,
);
```

Go ahead and run the script:

```bash
esrun src/index.ts
```

You should get the following:

```bash
Withheld amount after withdraw: 0
Fee vault balance after withdraw: 5000
```

<Callout type="note">The `withdrawWithheldTokensFromAccounts` can also be used
to collect all fees from all token accounts, if you fetch them all first.
Something like the following would work:

```ts
const accounts = await connection.getProgramAccounts(TOKEN_2022_PROGRAM_ID, {
  commitment: "finalized",
  filters: [
    {
      memcmp: {
        offset: 0,
        bytes: mint.toString(),
      },
    },
  ],
});

const accountsToWithdrawFrom = [];
for (const accountInfo of accounts) {
  const unpackedAccount = unpackAccount(
    accountInfo.pubkey,
    accountInfo.account,
    TOKEN_2022_PROGRAM_ID,
  );

  const transferFeeAmount = getTransferFeeAmount(unpackedAccount);
  if (
    transferFeeAmount != null &&
    transferFeeAmount.withheldAmount > BigInt(0)
  ) {
    accountsToWithdrawFrom.push(accountInfo.pubkey);
  }
}

await withdrawWithheldTokensFromAccounts(
  connection,
  payer,
  mint,
  feeVaultAccount,
  payer.publicKey,
  [],
  accountsToWithdrawFrom,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);
```

</Callout>

#### 7.2 Harvest and then withdraw

Let's look at the second option to retrieving the withheld fees: "harvesting".
The difference here is that instead of withdrawing the fees directly, we
"harvest" them back to the mint itself using `harvestWithheldTokensToMint`. This
is a permissionless function, meaning anyone can call it. This is useful if you
use something like [clockwork](https://www.clockwork.xyz/) to automate these
harvesting functions.

After the fees are harvested to the mint account, we can call
`withdrawWithheldTokensFromMint` to transfer these tokens into our fee vault.
This function is permissioned and we need the `withdrawWithheldAuthority` to
sign for it.

To do this, we need to transfer some more tokens to accrue more fees. This time,
we're going to take a shortcut and use the `transferChecked` function instead.
This will automatically calculate our fees for us. Then we'll print out the
balances to see where we are at:

```ts
// TRANSFER TOKENS PT2
console.log("Transferring with fee transaction pt2...");

const secondTransferAmount = BigInt(1 * 10 ** decimals);
const secondTransferSignature = await transferChecked(
  connection,
  payer,
  sourceAccount,
  mint,
  destinationAccount,
  sourceKeypair,
  secondTransferAmount,
  decimals, // Can also be gotten by getting the mint account details with `getMint(...)`
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const sourceAccountAfterSecondTransfer = await getAccount(
  connection,
  sourceAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const destinationAccountAfterSecondTransfer = await getAccount(
  connection,
  destinationAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const withheldAmountAfterSecondTransfer = getTransferFeeAmount(
  destinationAccountAfterTransfer,
);

console.log(`Source Token Balance: ${sourceAccountAfterSecondTransfer.amount}`);
console.log(
  `Destination Token Balance: ${destinationAccountAfterSecondTransfer.amount}`,
);
console.log(
  `Withheld Transfer Fees: ${withheldAmountAfterSecondTransfer?.withheldAmount}\n`,
);
```

Now, let's harvest the tokens back to the mint account. We will do this using
the `harvestWithheldTokensToMint` function. This function takes the following
parameters:

- `connection`: Connection to use
- `payer`: Payer of the transaction fees
- `mint`: The token mint
- `sources`: Source accounts from which to withdraw withheld fees
- `confirmOptions`: Options for confirming the transaction
- `programId`: SPL Token program account

Then we'll check the resulting balances. However, since the withheld amount will
now be stored in the mint, we have to fetch the mint account with `getMint` and
then read the `transfer fee` extension data on it by calling
`getTransferFeeConfig`:

```ts
// HARVEST WITHHELD TOKENS TO MINT
await harvestWithheldTokensToMint(
  connection,
  payer,
  mint,
  [destinationAccount],
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const withheldAccountAfterHarvest = await getAccount(
  connection,
  destinationAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const withheldAmountAfterHarvest = getTransferFeeAmount(
  withheldAccountAfterHarvest,
);

const mintAccountAfterHarvest = await getMint(
  connection,
  mint,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const mintTransferFeeConfigAfterHarvest = getTransferFeeConfig(
  mintAccountAfterHarvest,
);

console.log(
  `Withheld amount after harvest: ${withheldAmountAfterHarvest?.withheldAmount}`,
);
console.log(
  `Mint withheld amount after harvest: ${mintTransferFeeConfigAfterHarvest?.withheldAmount}\n`,
);
```

Lastly, let's withdraw these fees from the mint itself using the
`withdrawWithheldTokensFromMint` function. This function takes the following
parameters:

- `connection`: Connection to use
- `payer`: Payer of the transaction fees
- `mint`: The token mint
- `destination`: The destination account
- `authority`: The mint's withdraw withheld tokens authority
- `multiSigners`: Signing accounts if `owner` is a multisig
- `confirmOptions`: Options for confirming the transaction
- `programId`: SPL Token program account

After that, let's check the balances:

```ts
// WITHDRAW HARVESTED TOKENS
await withdrawWithheldTokensFromMint(
  connection,
  payer,
  mint,
  feeVaultAccount,
  payer,
  [],
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const mintAccountAfterSecondWithdraw = await getMint(
  connection,
  mint,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

const mintTransferFeeConfigAfterSecondWithdraw = getTransferFeeConfig(
  mintAccountAfterSecondWithdraw,
);

const feeVaultAfterSecondWithdraw = await getAccount(
  connection,
  feeVaultAccount,
  undefined,
  TOKEN_2022_PROGRAM_ID,
);

console.log(
  `Mint withheld balance after second withdraw: ${mintTransferFeeConfigAfterSecondWithdraw?.withheldAmount}`,
);
console.log(
  `Fee Vault balance after second withdraw: ${feeVaultAfterSecondWithdraw.amount}`,
);
```

Now, let's run it.

```bash
esrun src/index.ts
```

You should see the balances after every step of the way.

That's it! We have successfully created a mint with a transfer fee. If you get
stuck at any point, you can find the working code in the `solution` branch of
[this repository](https://github.com/Unboxed-Software/solana-lab-transfer-fee/tree/solution).

#### Challenge

Create a transfer fee enabled mint and transfer some tokens with different
decimals, fee transfer points and max fees.
