---
title: How to Add Priority Fees to a Transaction
sidebarSortOrder: 5
description:
  "Transactions executed in order they are prioritized on Solana. Learn how to
  increase your transaction priority with priority fees on Solana."
---

Transaction (TX) priority is achieved by paying a Prioritization Fee in addition
to the Base Fee. By default the compute budget is the product of 200,000 Compute
Units (CU) \* number of instructions, with a max of 1.4M CU. The Base Fee is
5,000 Lamports per signature. A microLamport is 0.000001 Lamports.

> You can find a detailed guide here on
> [how to use priority fees](https://solana.com/developers/guides/advanced/how-to-use-priority-fees).

The total compute budget or Prioritization Fee for a single TX can be changed by
adding instructions from the ComputeBudgetProgram.

`ComputeBudgetProgram.setComputeUnitPrice({ microLamports: number })` will add a
Prioritization Fee above the Base Fee (5,000 Lamports). The value provided in
microLamports will be multiplied by the CU budget to determine the
Prioritization Fee in Lamports. For example, if your CU budget is 1M CU, and you
add 1 microLamport/CU, the Prioritization Fee will be 1 Lamport (1M \*
0.000001). The total fee will then be 5001 Lamports.

Use `ComputeBudgetProgram.setComputeUnitLimit({ units: number })` to set the new
compute budget. The value provided will replace the default value. Transactions
should request the minimum amount of CU required for execution to maximize
throughput, or minimize fees.

```typescript filename="add-priority-fees.ts" {25-28, 30-33}
import { BN } from "@coral-xyz/anchor";
import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

(async () => {
  const payer = Keypair.generate();
  const toAccount = Keypair.generate().publicKey;

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    LAMPORTS_PER_SOL,
  );

  await connection.confirmTransaction(airdropSignature);

  // request a specific compute unit budget
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });

  // set the desired priority fee
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });

  // Total fee will be 5,001 Lamports for 1M CU
  const transaction = new Transaction()
    .add(modifyComputeUnits)
    .add(addPriorityFee)
    .add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: toAccount,
        lamports: 10000000,
      }),
    );

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    payer,
  ]);
  console.log(signature);

  const result = await connection.getParsedTransaction(signature);
  console.log(result);
})();
```
