---
title: How to Get Account Balance
sidebarSortOrder: 6
description:
  "Every account on Solana has a balance of SOL stored. Learn how to retrieve
  that account balance on Solana."
---

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript filename="get-account-balance.ts"
import { address, createSolanaRpc } from "@solana/web3.js";

const rpc = createSolanaRpc("https://api.devnet.solana.com");
const LAMPORTS_PER_SOL = 1_000_000_000; // 1 billion lamports per SOL

const wallet = address("nicktrLHhYzLmoVbuZQzHUTicd2sfP571orwo9jfc8c");
const { value: balance } = await rpc.getBalance(wallet).send();
console.log(`Balance: ${Number(balance) / LAMPORTS_PER_SOL} SOL`);
```

</Tab>

<Tab value="web3.js v1">

```typescript filename="get-account-balance.ts"
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const wallet = new PublicKey("nicktrLHhYzLmoVbuZQzHUTicd2sfP571orwo9jfc8c");

const balance = await connection.getBalance(wallet);
console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
```

</Tab>

</Tabs>
