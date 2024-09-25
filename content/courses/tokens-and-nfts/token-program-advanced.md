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
to
[creating NFTs with Metaplex](/content/courses/tokens-and-nfts/nfts-with-metaplex.md)!

### Burn Tokens

When tokens are burned, they are deducted from the specific token account where
they were held. The tokens are not transferred to any other account but are
simply removed from circulation, reducing the overall supply.

Not just anyone can burn tokens, only the "authority" of the token, or the
holder of the appropriate keys/permissions, can initiate the burn. The authority
might be:

- The account holder i.e you holding a token in your wallet.
- A designated authority account with permission to burn tokens i.e an approved
  delegate (more on this below).

To burn tokens using the `spl-token` library, use the `burnChecked` function.

```typescript
import { burnChecked } from "@solana/spl-token";
```

```typescript
const transactionSignature = await burnChecked(
  connection,
  payer,
  account,
  mint,
  owner,
  amount,
  decimals,
);
```

The `burnChecked` function requires the following arguments:

- `connection` - the JSON-RPC connection to the cluster
- `payer` - the account of the payer for the transaction
- `account` - the token account to burn tokens from
- `mint` - the token mint associated with the token account
- `owner` - the account of the owner of the token account
- `amount` - the amount of tokens to burn
- `decimals` - the number of decimals for the token

Under the hood, the `burnChecked` function creates a transaction with
instructions obtained from the `createBurnInstruction` function:

```typescript
import { PublicKey, Transaction } from "@solana/web3";
import { createBurnCheckedInstruction } from "@solana/spl-token";

async function buildBurnTransaction(
  account: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  amount: number,
  decimals: number,
): Promise<Transaction> {
  const transaction = new Transaction().add(
    createBurnCheckedInstruction(account, mint, owner, amount, decimals),
  );

  return transaction;
}
```

### Approve Delegate

Approving a delegate is the process of authorizing another account to transfer
or burn tokens from a token account. When using a delegate, the authority over
the token account remains with the original owner. When approving a delegate,
the token account owner specifies the exact amount of tokens that the delegate
can transfer or burn. Note that there can only be one delegate account
associated with a token account at any given time.

To approve a delegate using the `spl-token` library, you use the
`approveChecked` function.

```typescript
const transactionSignature = await approveChecked(
  connection,
  payer,
  account,
  delegate,
  owner,
  amount,
  decimals,
);
```

The `approveChecked` function returns a `TransactionSignature` that can be
viewed on Solana Explorer. The `approveChecked` function requires the following
arguments:

- `connection` - the JSON-RPC connection to the cluster
- `payer` - the account of the payer for the transaction
- `account` - the token account to delegate tokens from
- `delegate` - the account the owner is authorizing to transfer or burn tokens
- `owner` - the account of the owner of the token account
- `amount` - the maximum number of tokens the delegate may transfer or burn
- `decimals` - Number of decimals in approve amount

Under the hood, the `approveChecked` function creates a transaction with
instructions obtained from the `createApproveCheckedInstruction` function:

```typescript
import { PublicKey, Transaction } from "@solana/web3";
import { createApproveCheckedInstruction } from "@solana/spl-token";

async function buildApproveTransaction(
  account: PublicKey,
  delegate: PublicKey,
  owner: PublicKey,
  amount: number,
  decimals: number,
): Promise<web3.Transaction> {
  const transaction = new Transaction().add(
    createApproveInstruction(account, delegate, owner, amount, decimals),
  );

  return transaction;
}
```

### Revoke Delegate

A previously approved delegate for a token account can be later revoked. Once a
delegate is revoked, the delegate can no longer transfer tokens from the owner's
token account.any remaining tokens that were within the delegate's approved
limit cannot be transferred by the delegate. The delegate cannot burn tokens
either, not just transfer them. The delegate's permissions are fully revoked.

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
[previous chapter](/content/courses/tokens-and-nfts/token-program.md).

#### 1. Delegating tokens

Let's use `approveChecked` from `spl-token` to authorize a delegate to transfer
or burn up to 50 tokens from our token account.

Just like
[Transferring Tokens](/content/courses/tokens-and-nfts/token-program.md) in the
previous lab, you can
[add a second account on devnet](/content/courses/intro-to-solana/intro-to-cryptography.md)
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

try {
  const approveTransactionSignature = await approve(
    connection,
    user,
    tokenMintAccount, // The mint account of the SPL token.
    sourceTokenAccount.address, // The token account holding the tokens you want to approve for delegation.
    delegate, //The public key of the account that will be allowed to transfer/burn tokens.
    user.publicKey,
    50 * MINOR_UNITS_PER_MAJOR_UNITS,
    2, //The decimal places for the token
  );

  console.log(
    `Approve Delegate Transaction: ${getExplorerLink(
      "transaction",
      approveTransactionSignature,
      "devnet",
    )}`,
  );
} catch (error) {
  console.error("Error during delegate approval:", error);
}
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

Use the `spl-token` library's `burnChecked` function to remove half of your
tokens from circulation.

Now call this new function in `main` to burn 25 of the user's tokens.

```typescript
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  getOrCreateAssociatedTokenAccount,
  burnChecked,
} from "@solana/spl-token";

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

const transactionSignature = await burnChecked(
  connection,
  user,
  sourceTokenAccount.address,
  tokenMintAccount,
  user,
  25 * MINOR_UNITS_PER_MAJOR_UNITS,
  2,
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
