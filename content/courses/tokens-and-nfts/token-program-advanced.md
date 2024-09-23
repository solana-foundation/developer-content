---
title: Token Burning and Delegation
objectives:
  - Understand why and how to burn tokens
  - Allow a token holder to allocate a limited amount of tokens to another
    account to spend or burn using token delegation.
description:
  "How to burn tokens, and approve/revoke token delegations on Solana."
---

### Summary

- **Burning tokens**, which reduces the total supply of a token by removing them
  from circulation.
- **Approve a delegate**, allowing another account to transfer or burn a
  specified amount of tokens from a token account while retaining original
  ownership.
- **Revoke a delegate**, removing their authority to act on behalf of the token
  account owner.
- Each of these operations is facilitated through the `spl-token` library,
  utilizing specific functions for each action.

### Lesson

In this lesson, we'll cover burning tokens and delegation. You may not use these
in your own application, so if you're more interested in NFTs, feel free to skip
ahead to
[creating NFTs with Metaplex](/content/courses/tokens-and-nfts/nfts-with-metaplex.md)!

#### Burn Tokens

Burning tokens is the process of decreasing the token supply of a given token
mint. Burning tokens removes the tokens from the given token account and from
broader circulation.

To burn tokens using the `spl-token` library, use the
[`burn()`](https://solana-labs.github.io/solana-program-library/token/js/functions/burn.html#burn)
function.

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

The `burn()` function requires the following arguments:

- `connection`: JSON-RPC connection to the cluster.
- `payer`: The account responsible for paying transaction fees.
- `account`: The token account from which tokens will be burned.
- `mint`: The token mint associated with the token account.
- `owner`: The owner of the token account.
- `amount`: The number of tokens to burn.

Under the hood, the `burn()` function creates a transaction using the
instruction obtained from
[`createBurnInstruction()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createBurnInstruction.html#createBurnInstruction)
function.

```typescript
import { PublicKey, Transaction } from "@solana/web3.js";
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

#### Approve Delegate

Approving a delegate is the process of authorizing another account to transfer
or burn tokens from a token account. The authority over the token account
remains with the original owner. The maximum number of tokens a delegate can
transfer or burn is defined when the owner approves the delegate. Only one
delegate can be associated with a token account at a time.

To approve a delegate using the `spl-token` library, use the
[`approve()`](https://solana-labs.github.io/solana-program-library/token/js/functions/approve.html#approve)
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

The `approve()` function returns a `TransactionSignature` that can be viewed on
Solana Explorer. It requires the following arguments:

- `connection`: The JSON-RPC connection to the cluster.
- `payer`: The account of the payer for the transaction.
- `account`: The token account to delegate tokens from.
- `delegate`: The account authorized to transfer or burn tokens.
- `owner`: The account of the owner of the token account.
- `amount`: The maximum number of tokens the delegate can transfer or burn.

Under the hood, the `approve()` function creates a transaction with instructions
obtained from the
[`createApproveInstruction()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createApproveInstruction.html#createApproveInstruction)
function.

```typescript
import { PublicKey, Transaction } from "@solana/web3.js";
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

#### Revoke Delegate

A previously approved delegate for a token account can be revoked. Once revoked,
the delegate can no longer transfer tokens from the owner's token account. Any
untransferred amount from the previously approved tokens will no longer be
accessible by the delegate.

To revoke a delegate using the `spl-token` library, use the
[`revoke()`](https://solana-labs.github.io/solana-program-library/token/js/functions/revoke.html#revoke)
function.

```typescript
import { revoke } from "@solana/spl-token";

const transactionSignature = await revoke(connection, payer, account, owner);
```

The `revoke()` function returns a `TransactionSignature` that can be viewed on
Solana Explorer. This function requires the following arguments:

- `connection`: The JSON-RPC connection to the cluster.
- `payer`: The account responsible for paying the transaction fees.
- `account`: The token account from which to revoke the delegate authority.
- `owner`: The account of the owner of the token account.

Under the hood, the `revoke()` function generates a transaction using the
instructions from the
[`createRevokeInstruction()`](https://solana-labs.github.io/solana-program-library/token/js/functions/createRevokeInstruction.html#createRevokeInstruction)
function:

```typescript
import { PublicKey, Transaction } from "@solana/web3.js";
import { createRevokeInstruction } from "@solana/spl-token";

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

This lab extends the concepts covered in the previous chapter on the
[Token Program](/content/courses/tokens-and-nfts/token-program.md).

#### 1. Delegating Tokens

We will use the `approve()` function from the `spl-token` library to authorize a
delegate to transfer or burn up to 50 tokens from our token account.

Similar to the process of
[Transferring Tokens](/content/courses/tokens-and-nfts/token-program.md#transferring-tokens)
in the previous lab, you can
[add a second account on Devnet](/content/courses/intro-to-solana/intro-to-cryptography.md)
if desired or collaborate with a friend who has a Devnet account.

Create a new file named `delegate-tokens.ts`.

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
  sourceTokenAccount.address,
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

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=72cab3b8-984b-4b09-a341-86800167cfc7)!
</Callout>
