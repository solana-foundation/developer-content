---
title: How to Calculate Transaction Cost
sidebarSortOrder: 3
description:
  "Every transaction costs an amount of fees to execute on Solana. Learn how to
  calculate transaction fees on Solana."
---

The number of signatures a transaction requires are used to calculate the
transaction cost. As long as you are not creating an account, this will be the
base transaction cost. To find out more about costs to create an account, check
out [calculating rent costs](/content/cookbook/accounts/calculate-rent.md).

```typescript filename="calculate-cost.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Message,
  SystemProgram,
  SYSTEM_INSTRUCTION_LAYOUTS,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

(async () => {
  // Connect to cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const payer = Keypair.generate();
  const recipient = Keypair.generate();

  const type = SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
  const data = Buffer.alloc(type.layout.span);
  const layoutFields = Object.assign({ instruction: type.index });
  type.layout.encode(layoutFields, data);

  const recentBlockhash = await connection.getLatestBlockhash();

  const messageParams = {
    accountKeys: [
      payer.publicKey.toString(),
      recipient.publicKey.toString(),
      SystemProgram.programId.toString(),
    ],
    header: {
      numReadonlySignedAccounts: 0,
      numReadonlyUnsignedAccounts: 1,
      numRequiredSignatures: 1,
    },
    instructions: [
      {
        accounts: [0, 1],
        data: bs58.encode(data),
        programIdIndex: 2,
      },
    ],
    recentBlockhash: recentBlockhash.blockhash,
  };

  const message = new Message(messageParams);

  const fees = await connection.getFeeForMessage(message);
  console.log(`Estimated SOL transfer cost: ${fees.value} lamports`);
  // Estimated SOL transfer cost: 5000 lamports
})();
```
