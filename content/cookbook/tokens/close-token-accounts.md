---
title: How to Close Token Accounts
sidebarSortOrder: 9
description:
  "Learn how to close token accounts on Solana, including cases such as Wrapped
  SOL and empty accounts."
---

You can close a token account if you don't want to use it anymore. There are two
situations:

1. Wrapped SOL - Closing converts Wrapped SOL to SOL
2. Other Tokens - You can close it only if token account's balance is 0.

```typescript filename="close-token-account.ts"
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { closeAccount, createCloseAccountInstruction } from "@solana/spl-token";
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

  const tokenAccountPubkey = new PublicKey(
    "2XYiFjmU1pCXmC2QfEAghk6S7UADseupkNQdnRBXszD5",
  );

  // 1) use build-in function
  {
    let txhash = await closeAccount(
      connection, // connection
      feePayer, // payer
      tokenAccountPubkey, // token account which you want to close
      alice.publicKey, // destination
      alice, // owner of token account
    );
    console.log(`txhash: ${txhash}`);
  }

  // or

  // 2) compose by yourself
  {
    let tx = new Transaction().add(
      createCloseAccountInstruction(
        tokenAccountPubkey, // token account which you want to close
        alice.publicKey, // destination
        alice.publicKey, // owner of token account
      ),
    );
    console.log(
      `txhash: ${await sendAndConfirmTransaction(connection, tx, [
        feePayer,
        alice /* fee payer + owner */,
      ])}`,
    );
  }
})();
```
