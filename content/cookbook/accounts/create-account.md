---
title: How to Create an Account
sidebarSortOrder: 1
description:
  "Accounts are the basic building blocks of anything on Solana. Learn how to
  create accounts on the Solana blockchain."
---

Creating an account requires using the System Program `createAccount`
instruction. The Solana runtime will grant the owner of an account, access to
write to its data or transfer lamports. When creating an account, we have to
preallocate a fixed storage space in bytes (space) and enough lamports to cover
the rent.

```typescript filename="create-account.ts"
import {
  SystemProgram,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const fromPubkey = Keypair.generate();

  // Airdrop SOL for transferring lamports to the created account
  const airdropSignature = await connection.requestAirdrop(
    fromPubkey.publicKey,
    LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(airdropSignature);

  // amount of space to reserve for the account
  const space = 0;

  // Seed the created account with lamports for rent exemption
  const rentExemptionAmount =
    await connection.getMinimumBalanceForRentExemption(space);

  const newAccountPubkey = Keypair.generate();
  const createAccountParams = {
    fromPubkey: fromPubkey.publicKey,
    newAccountPubkey: newAccountPubkey.publicKey,
    lamports: rentExemptionAmount,
    space,
    programId: SystemProgram.programId,
  };

  const createAccountTransaction = new Transaction().add(
    SystemProgram.createAccount(createAccountParams),
  );

  await sendAndConfirmTransaction(connection, createAccountTransaction, [
    fromPubkey,
    newAccountPubkey,
  ]);
})();
```
