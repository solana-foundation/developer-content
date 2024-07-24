---
title: How to Create a Token Account
sidebarSortOrder: 3
description:
  "Learn to create Solana token accounts, which hold tokens for users."
---

A token account is required for a user to hold tokens.

A user will have at least one token account for every type of token they own.

Associated Token Accounts are deterministicly created accounts for every
keypair. ATAs are the recommended method of managing token accounts.

```typescript filename="ata.ts"
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
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

  const mintPubkey = new PublicKey(
    "2SKpuBU9ksneBZD4nqbZkw75NE11HsSHsGRtW2BZh5aQ",
  );

  // 1) use build-in function
  {
    let ata = await createAssociatedTokenAccount(
      connection, // connection
      feePayer, // fee payer
      mintPubkey, // mint
      alice.publicKey, // owner,
    );
    console.log(`ATA: ${ata.toBase58()}`);
  }

  // or

  // 2) composed by yourself
  {
    // calculate ATA
    let ata = await getAssociatedTokenAddress(
      mintPubkey, // mint
      alice.publicKey, // owner
    );
    console.log(`ATA: ${ata.toBase58()}`);

    // if your wallet is off-curve, you should use
    // let ata = await getAssociatedTokenAddress(
    //   mintPubkey, // mint
    //   alice.publicKey // owner
    //   true, // allowOwnerOffCurve
    // );

    let transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        feePayer.publicKey, // payer
        ata, // ata
        alice.publicKey, // owner
        mintPubkey, // mint
      ),
    );

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [feePayer], // Signers
    );

    console.log(`txhash: ${await signature}`);
  }
})();
```
