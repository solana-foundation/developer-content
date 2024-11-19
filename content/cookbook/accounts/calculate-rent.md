---
title: How to Calculate Account Creation Cost
sidebarSortOrder: 2
description:
  "Every time you create an account, that creation costs an amount of SOL. Learn
  how to calculate how much an account costs at creation."
---

Keeping accounts alive on Solana incurs a storage cost called rent. For the
calculation, you need to consider the amount of data you intend to store in the
account. Rent can be reclaimed in full if the account is closed.

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript
import { createSolanaRpc } from "@solana/web3.js";

(async () => {
  const rpc = createSolanaRpc("https://api.devnet.solana.com");
  // length of data in bytes in the account to calculate rent for
  const dataLength = 1500;
  const rentExemptionAmount = await rpc
    .getMinimumBalanceForRentExemption(BigInt(dataLength))
    .send();
  console.log({
    rentExemptionAmount,
  });
})();
```

</Tab>

<Tab value="web3.js v1">

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // length of data in bytes in the account to calculate rent for
  const dataLength = 1500;
  const rentExemptionAmount =
    await connection.getMinimumBalanceForRentExemption(dataLength);
  console.log({
    rentExemptionAmount,
  });
})();
```

</Tab>

</Tabs>
