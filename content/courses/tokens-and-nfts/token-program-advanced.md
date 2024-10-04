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

- **Burning tokens** reduces the total supply of a token by removing them from
  circulation.
- **Approving a delegate**, allows another account to transfer or burn a
  specified amount of tokens from a token account while retaining original
  account ownership.
- **Revoking a delegate**, removes their authority to act on behalf of the token
  account owner.
- Each of these operations is facilitated through the `spl-token` library,
  utilizing specific functions for each action.

### Lesson

In this lesson, we'll cover burning tokens and delegation. You may not have a
need for these in your own application, so if you're more interested in NFTs,
feel free to skip ahead to
[creating NFTs with Metaplex](/content/courses/tokens-and-nfts/nfts-with-metaplex.md)!

#### Burn Tokens

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
There are two functions used to burn tokens, you could either choose to use
`burn` or choose its better version `burnChecked`. `burnChecked` ensures that
the amount of tokens being burned matches the expected number of decimals in the
token mint, adding an extra layer of validation compared to the standard `burn`
function. This reduces the chances of accidentally burning the wrong amount of
tokens due to decimal mismatches.

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

#### Approve Delegate

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

Just like `burnChecked`, the `approveChecked` also has a less safe twin namely
`approve` that does not ensure the amount being approved matches the token's
decimal precision.

### Revoke Delegate

A previously approved delegate for a token account can be later revoked. Once a
delegate is revoked, the delegate can no longer transfer tokens from the owner's
token account.any remaining tokens that were within the delegate's approved
limit cannot be transferred by the delegate. The delegate cannot burn tokens
either, not just transfer them. The delegate's permissions are fully revoked.

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

This lab extends the concepts covered in the previous lesson on the
[Token Program](/content/courses/tokens-and-nfts/token-program.md).

#### 1. Delegating Tokens

Let's use `approveChecked` from `spl-token` to authorize a delegate to transfer
or burn up to 50 tokens from our token account.

Similar to the process of
[Transferring Tokens](/content/courses/tokens-and-nfts/token-program.md#transferring-tokens)
in the previous lab, you can
[add a second account on Devnet](/content/courses/intro-to-solana/intro-to-cryptography.md)
if desired or collaborate with a friend who has a Devnet account.

Create a new file named `delegate-tokens.ts`. For this example, we are using the
System Program ID as a delegate for demonstration, but you can use an actual
address that you want to delegate.

```typescript filename="delegate-tokens.ts"
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import {
  approveChecked,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"));

const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(`🔑 Loaded keypair. Public key: ${user.publicKey.toBase58()}`);

// Replace this with your actual address
// For this example, we will be using System Program's ID as a delegate
const delegatePublicKey = new PublicKey(SystemProgram.programId);

// Substitute your token mint address
const tokenMintAddress = new PublicKey("YOUR_TOKEN_MINT_ADDRESS_HERE");

try {
  // Get or create the user's token account
  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMintAddress,
    user.publicKey,
  );

try {
  const approveTransactionSignature = await approveChecked(
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

You will see something similar to this:

```bash
🔑 Loaded our keypair securely, using an env file! Our public key is: FN7XXRhzP5GmgQkYLMdGGeV2HvYJtjeZVXuVYyoAFRyi
Approve Delegate Transaction: https://explorer.solana.com/tx/2JUuBw7naMTP4vNsKJDEDyvxrs42bT4NbURt4wSp4x6qSNro2upWzFLpbzrYatcggc3xgzZuqqiKPsSoh9YttnUG?cluster=devnet6CkQmVQM7yMhebnQKdKAxV9nzdBRPqSjiBgrSq2iombe
```

![Delegating tokens](/public/assets/courses/unboxed/token-program-advanced-delegating-tokens.png)

#### 2. Revoke Delegate

Let's revoke the `delegate` using the `spl-token` library's `revoke()` function.

Revoke will set the delegate for the token account to null and reset the
delegated amount to 0.

Create a new file `revoke-approve-tokens.ts`.

```typescript filename="revoke-approve-tokens.ts"
import "dotenv/config";
import {
  getExplorerLink,
  getKeypairFromEnvironment,
} from "@solana-developers/helpers";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { revoke, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const DEVNET_URL = clusterApiUrl("devnet");
// Substitute your token mint address
const TOKEN_MINT_ADDRESS = "YOUR_TOKEN_MINT_ADDRESS_HERE";

const connection = new Connection(DEVNET_URL);
const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(`🔑 Loaded keypair. Public key: ${user.publicKey.toBase58()}`);

try {
  const tokenMintAddress = new PublicKey(TOKEN_MINT_ADDRESS);

  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMintAddress,
    user.publicKey,
  );

  const revokeTransactionSignature = await revoke(
    connection,
    user,
    userTokenAccount.address,
    user.publicKey,
  );

  const explorerLink = getExplorerLink(
    "transaction",
    revokeTransactionSignature,
    "devnet",
  );

  console.log(`✅ Revoke Delegate Transaction: ${explorerLink}`);
} catch (error) {
  console.error(
    `Error: ${error instanceof Error ? error.message : String(error)}`,
  );
}
```

Replace `YOUR_TOKEN_MINT_ADDRESS_HERE` with your mint token address obtained
from the previous lesson
[Token Program](/content/courses/tokens-and-nfts/token-program.md#create-the-token-mint).

Run the script using `npx esrun revoke-approve-tokens.ts`. You should see:

```bash
🔑 Loaded keypair. Public key: GprrWv9r8BMxQiWea9MrbCyK7ig7Mj8CcseEbJhDDZXM
✅ Revoke Delegate Transaction: https://explorer.solana.com/tx/YTc2Vd41SiGiHf3iEPkBH3y164fMbV2TSH2hbe7WypT6K6Q2b3f31ryFWhypmBK2tXmvGYjXeYbuwxHeJvnZZX8?cluster=devnet
```

Open the Explorer link, you will see the revoke information.

![Revoke Approve Tokens](/public/assets/courses/unboxed/revoke-approve-tokens.png)

#### 3. Burn Tokens

Finally, let's remove some tokens from circulation by burning them.

Use the `spl-token` library's `burnChecked` function to remove half of your
tokens from circulation.

Create a new file `burn-tokens.ts`.

```typescript filename="burn-tokens.ts"
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

const DEVNET_URL = clusterApiUrl("devnet");
const TOKEN_DECIMALS = 2;
const BURN_AMOUNT = 5;
// Substitute your token mint address
const TOKEN_MINT_ADDRESS = "YOUR_TOKEN_MINT_ADDRESS_HERE";

const connection = new Connection(DEVNET_URL);
const user = getKeypairFromEnvironment("SECRET_KEY");

console.log(`🔑 Loaded keypair. Public key: ${user.publicKey.toBase58()}`);

try {
  const tokenMintAccount = new PublicKey(TOKEN_MINT_ADDRESS);

  const userTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    user,
    tokenMintAccount,
    user.publicKey,
  );

  const burnAmount = BURN_AMOUNT * 10 ** TOKEN_DECIMALS;

const transactionSignature = await burnChecked(
  connection,
  user,
  sourceTokenAccount.address,
  tokenMintAccount,
  user,
  25 * MINOR_UNITS_PER_MAJOR_UNITS,
  2,
);

  const explorerLink = getExplorerLink(
    "transaction",
    transactionSignature,
    "devnet",
  );

  console.log(`✅ Burn Transaction: ${explorerLink}`);
} catch (error) {
  console.error(
    `Error: ${error instanceof Error ? error.message : String(error)}`,
  );
}
```

You should see something like this:

```bash
🔑 Loaded our keypair securely, using an env file! Our public key is: FN7XXRhzP5GmgQkYLMdGGeV2HvYJtjeZVXuVYyoAFRyi
Burn Transaction: https://explorer.solana.com/tx/4cfiDc1LpeRpLG7wfGrWZaXsVWqN4eL1im8EJ1keGFcf4RFLBgnZM4FwRCMXEVsUSxmxTNcten4qr9CVg71iey4c?cluster=devnet
```

![Delegating tokens](/public/assets/courses/unboxed/token-program-advanced-burn-tokens.png)

<callout type="info">
Sometimes you might get an error in passing your transaction especially when trying to burn after you have delegated some tokens to a delegate account. 
This means you have to mint more tokens to be able to burn tokens or alternatively reduce the amount you want to burn.
</callout>

Well done! You've now'

Well done! You've now completed the lab.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=72cab3b8-984b-4b09-a341-86800167cfc7)!
</Callout>
