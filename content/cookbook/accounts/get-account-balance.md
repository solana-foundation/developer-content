---
title: How to Get Account Balance
sidebarSortOrder: 6
description:
  "Every account on Solana has a balance of SOL stored. Learn how to retrieve
  that account balance on Solana."
---

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript filename="get-account-balance.ts" {13}
import { address, createSolanaRpc } from "@solana/web3.js";
const LAMPORTS_PER_SOL = 1000000000;

async function getBalance() {
  const rpc = createSolanaRpc("https://api.devnet.solana.com");
  const addressToRequest = address(
    "web3Qm5PuFapMJqe6PWRWfRBarkeqE2ZC8Eew3zwHH2",
  );

  try {
    const result = await rpc.getBalance(addressToRequest).send();
    console.log(`Balance: ${Number(result.value) / LAMPORTS_PER_SOL} sol.`);
  } catch (err) {
    console.error("Error fetching balance:", err);
  }
}

getBalance();
```

</Tab>

<Tab value="web3.js v1">

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

</Tab>

</Tabs>
