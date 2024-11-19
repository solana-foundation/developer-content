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

```typescript filename="calculate-rent.ts"
import { createSolanaRpc } from "@solana/web3.js";

const rpc = createSolanaRpc("https://api.devnet.solana.com");
// 1.5k bytes
const space = 1500n;

const lamports = await rpc.getMinimumBalanceForRentExemption(space).send();
console.log("Minimum balance for rent exception:", lamports);
```

</Tab>

<Tab value="web3.js v1">

```typescript
import { Connection, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// length of data in bytes in the account to calculate rent for
const dataLength = 1500;
const rentExemptionAmount =
  await connection.getMinimumBalanceForRentExemption(dataLength);
console.log({
  rentExemptionAmount,
});
```

</Tab>

</Tabs>
