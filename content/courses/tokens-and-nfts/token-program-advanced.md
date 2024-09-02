---
title: Token burning and Delegation
objectives:
  - Understand why and how to burn tokens
  - Allow a token holder to allocate a limited amount of tokens to another
    account to spend or burn using token delegation.
description:
  "How to burn tokens, and approve/revoke token delegations on Solana."
---

### Lesson

Finally, we'll cover burning tokens, and delegation. You may not use these in
your own application, so if you're really excited about NFTs, feel free to skip
to [creating NFTs with Metaplex](/content/courses/tokens/nfts-with-metaplex.md)!

### Burn Tokens

Burning tokens is the process of decreasing the token supply of a given token
mint. Burning tokens removes the tokens from the given token account and from
broader circulation.

To burn tokens using the `spl-token` library, use the `burn` function.

```typescript
import { burn } from "@solana/spl-token";
```

```typescript
const transactionSignature = await burn(
  connection,
  payer,
  account,
  mint,
  owner,
  amount,
);
```

The `burn` function requires the following arguments:

- `connection` - the JSON-RPC connection to the cluster
- `payer` - the account of the payer for the transaction
- `account` - the token account to burn tokens from
- `mint` - the token mint associated with the token account
- `owner` - the account of the owner of the token account
- `amount` - the amount of tokens to burn

Under the hood, the `burn` function creates a transaction with instructions
obtained from the `createBurnInstruction` function:

```typescript
import { PublicKey, Transaction } from "@solana/web3";
import { createBurnInstruction } from "@solana/spl-token";

async function buildBurnTransaction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  amount: number,
): Promise<Transaction> {
  const transaction = new Transaction().add(
    createBurnInstruction(account, mint, owner, amount),
  );

  return transaction;
}
```

### Approve Delegate

Approving a delegate is the process of authorizing another account to transfer
or burn tokens from a token account. When using a delegate, the authority over
the token account remains with the original owner. The maximum amount of tokens
a delegate may transfer or burn is specified at the time the owner of the token
account approves the delegate. Note that there can only be one delegate account
associated with a token account at any given time.

To approve a delegate using the `spl-token` library, you use the `approve`
function.

```typescript
const transactionSignature = await approve(
  connection,
  payer,
  account,
  delegate,
  owner,
  amount,
);
```

The `approve` function returns a `TransactionSignature` that can be viewed on
Solana Explorer. The `approve` function requires the following arguments:

- `connection` - the JSON-RPC connection to the cluster
- `payer` - the account of the payer for the transaction
- `account` - the token account to delegate tokens from
- `delegate` - the account the owner is authorizing to transfer or burn tokens
- `owner` - the account of the owner of the token account
- `amount` - the maximum number of tokens the delegate may transfer or burn

Under the hood, the `approve` function creates a transaction with instructions
obtained from the `createApproveInstruction` function:

```typescript
import { PublicKey, Transaction } from "@solana/web3";
import { createApproveInstruction } from "@solana/spl-token";

async function buildApproveTransaction(
  account: PublicKey,
  delegate: PublicKey,
  owner: PublicKey,
  amount: number,
): Promise<web3.Transaction> {
  const transaction = new Transaction().add(
    createApproveInstruction(account, delegate, owner, amount),
  );

  return transaction;
}
```

### Revoke Delegate

A previously approved delegate for a token account can be later revoked. Once a
delegate is revoked, the delegate can no longer transfer tokens from the owner's
token account. Any remaining amount left untransferred from the previously
approved amount can no longer be transferred by the delegate.

To revoke a delegate using the `spl-token` library, you use the `revoke`
function.

```typescript
import { revoke } from "@solana/spl-token";

const transactionSignature = await revoke(connection, payer, account, owner);
```

The `revoke` function returns a `TransactionSignature` that can be viewed on
Solana Explorer. The `revoke` function requires the following arguments:

- `connection` - the JSON-RPC connection to the cluster
- `payer` - the account of the payer for the transaction
- `account` - the token account to revoke the delegate authority from
- `owner` - the account of the owner of the token account

Under the hood, the `revoke` function creates a transaction with instructions
obtained from the `createRevokeInstruction` function:

```typescript
import { PublicKey, Transaction } from "@solana/web3";
import { revoke } from "@solana/spl-token";

async function buildRevokeTransaction(
  account: PublicKey,
  owner: PublicKey,
): Promise<web3.Transaction> {
  const transaction = new Transaction().add(
    createRevokeInstruction(account, owner),
  );

  return transaction;
}
```

### Lab

This lab extends the lab from the
[previous chapter](/content/courses/tokens/token-program).

#### 1. Delegating tokens

Let's use `approve` from `spl-token` to authorize a delegate to transfer or burn
up to 50 tokens from our token account.

Just like [Transferring Tokens](/content/courses/tokens/token-program) in the
previous lab, you can
[add a second account on devnet](/developers/courses/intro-to-solana/intro-to-cryptography)
if you like, or find a friend who has a devnet account!

Create a new file `delegate-tokens.ts`

```typescript
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  approve,
  getOrCreateAssociatedTokenAccount,
  revoke,
} from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`,
);

// Add the delegate public key here.
const delegate = new PublicKey("YOUR_DELEGATE_HERE");

// Substitute in your token mint account
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT_ADDRESS_HERE");

// Get or create the source and destination token accounts to store this token
const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  user.publicKey,
);

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const approveTransactionSignature = await approve(
  connection,
  user,
  sourceTokenAccount.address,
  delegate,
  user.publicKey,
  50 * MINOR_UNITS_PER_MAJOR_UNITS,
);

console.log(
  `Approve Delegate Transaction: ${getExplorerLink(
    "transaction",
    approveTransactionSignature,
    "devnet",
  )}`,
);
```

#### 2. Revoke Delegate

Lets revoke the `delegate` using the `spl-token` library's `revoke` function.

Revoke will set delegate for the token account to null and reset the delegated
amount to 0.

All we will need for this function is the token account and user. After the

```typescript
const revokeTransactionSignature = await revoke(
  connection,
  user,
  delegate,
  user.publicKey,
);

console.log(
  `Revoke Delegate Transaction: ${getExplorerLink(
    "transaction",
    revokeTransactionSignature,
    "devnet",
  )}`,
);
```

#### 3. Burn Tokens

Finally, let's remove some tokens from circulation by burning them.

Use the `spl-token` library's `burn` function to remove half of your tokens from
circulation.

Now call this new function in `main` to burn 25 of the user's tokens.

```typescript
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, burn } from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`,
);

// Substitute in your token mint account
const tokenMintAccount = new PublicKey("YOUR_TOKEN_MINT_ADDRESS_HERE");

// Get the account where the user stores these tokens
const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  user,
  tokenMintAccount,
  user.publicKey,
);

// Our token has two decimal places
const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);

const transactionSignature = await burn(
  connection,
  user,
  sourceTokenAccount.address,
  tokenMintAccount,
  user,
  25 * MINOR_UNITS_PER_MAJOR_UNITS,
);

console.log(
  `Burn Transaction: ${getExplorerLink(
    "transaction",
    transactionSignature,
    "devnet",
  )}`,
);
```

Well done! You've now

<Callout type="success">

### Completed the lab?

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=72cab3b8-984b-4b09-a341-86800167cfc7)!
</Callout>
