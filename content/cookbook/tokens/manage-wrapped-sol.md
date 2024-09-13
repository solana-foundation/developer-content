---
title: How to Use Wrapped SOL
sidebarSortOrder: 13
description:
  "Learn how to use wrapped SOL on Solana, including creating token accounts and
  adding balance through SOL transfers or token transfers."
---

Wrapped SOL just like any other token mint. The difference is using `syncNative`
and creating token accounts specifically on the `NATIVE_MINT` address.

## Create Token Account

Like creating
[SPL token accounts](/content/cookbook/tokens/create-token-account.md) but
replace mint with `NATIVE_MINT`

```js
import { NATIVE_MINT } from "@solana/spl-token";
```

## Add Balance

There are two ways to add balance for Wrapped SOL

### 1. By SOL Transfer

```typescript filename="add-balance-by-sol.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  NATIVE_MINT,
  getAssociatedTokenAddress,
  createSyncNativeInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";

(async () => {
  // connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8
  const feePayer = Keypair.fromSecretKey(
    bs58.decode(
      "588FU4PktJWfGfxtzpAAXywSNt74AvtroVzGfKkVN1LwRuvHwKGr851uH8czM5qm4iqLbs1kKoMKtMJG4ATR7Ld2",
    ),
  );

  // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
  const alice = Keypair.fromSecretKey(
    bs58.decode(
      "4NMwxzmYj2uvHuq8xoqhY8RXg63KSVJM1DXkpbmkUY7YQWuoyQgFnnzn6yo3CMnqZasnNPNuAT2TLwQsCaKkUddp",
    ),
  );

  // remember to create ATA first
  let ata = await getAssociatedTokenAddress(
    NATIVE_MINT, // mint
    alice.publicKey, // owner
  );

  let amount = 1 * 1e9; /* Wrapped SOL's decimals is 9 */

  let tx = new Transaction().add(
    // trasnfer SOL
    SystemProgram.transfer({
      fromPubkey: alice.publicKey,
      toPubkey: ata,
      lamports: amount,
    }),
    // sync wrapped SOL balance
    createSyncNativeInstruction(ata),
  );
  console.log(
    `txhash: ${await sendAndConfirmTransaction(connection, tx, [feePayer, alice])}`,
  );
})();
```

### 2. By Token Transfer

```typescript filename="add-balance-by-token.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  getMinimumBalanceForRentExemptAccount,
  getAssociatedTokenAddress,
  ACCOUNT_SIZE,
  createInitializeAccountInstruction,
  createTransferInstruction,
  createCloseAccountInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";

(async () => {
  // connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8
  const feePayer = Keypair.fromSecretKey(
    bs58.decode(
      "588FU4PktJWfGfxtzpAAXywSNt74AvtroVzGfKkVN1LwRuvHwKGr851uH8czM5qm4iqLbs1kKoMKtMJG4ATR7Ld2",
    ),
  );

  // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
  const alice = Keypair.fromSecretKey(
    bs58.decode(
      "4NMwxzmYj2uvHuq8xoqhY8RXg63KSVJM1DXkpbmkUY7YQWuoyQgFnnzn6yo3CMnqZasnNPNuAT2TLwQsCaKkUddp",
    ),
  );

  // remember to create ATA first
  let ata = await getAssociatedTokenAddress(
    NATIVE_MINT, // mint
    alice.publicKey, // owner
  );

  let auxAccount = Keypair.generate();
  let amount = 1 * 1e9; /* Wrapped SOL's decimals is 9 */

  let tx = new Transaction().add(
    // create token account
    SystemProgram.createAccount({
      fromPubkey: alice.publicKey,
      newAccountPubkey: auxAccount.publicKey,
      space: ACCOUNT_SIZE,
      lamports:
        (await getMinimumBalanceForRentExemptAccount(connection)) + amount, // rent + amount
      programId: TOKEN_PROGRAM_ID,
    }),
    // init token account
    createInitializeAccountInstruction(
      auxAccount.publicKey,
      NATIVE_MINT,
      alice.publicKey,
    ),
    // transfer WSOL
    createTransferInstruction(
      auxAccount.publicKey,
      ata,
      alice.publicKey,
      amount,
    ),
    // close aux account
    createCloseAccountInstruction(
      auxAccount.publicKey,
      alice.publicKey,
      alice.publicKey,
    ),
  );

  console.log(
    `txhash: ${await sendAndConfirmTransaction(connection, tx, [
      feePayer,
      auxAccount,
      alice,
    ])}`,
  );
})();
```
