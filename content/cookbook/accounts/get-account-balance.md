---
title: How to Get Account Balance
sidebarSortOrder: 6
---

```typescript filename="get-account-balance.ts" {13}
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  let wallet = new PublicKey("G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY");
  console.log(
    `${(await connection.getBalance(wallet)) / LAMPORTS_PER_SOL} SOL`,
  );
})();
```
