---
title: Connecting to a Solana Environment
sidebarSortOrder: 2
description: "Learn how to connect to a Solana environment."
---

When you are working on Solana development, you will need to connect to a
specific RPC API endpoint. Solana has 3 public development environments:

- mainnet-beta https://api.mainnet-beta.solana.com
- devnet https://api.devnet.solana.com
- testnet https://api.testnet.solana.com

```typescript filename="connect-to-environment.ts"
import { clusterApiUrl, Connection } from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
})();
```

Finally, you can also connect to a private cluster, either one local or running
remotely with the following:

```ts
import { Connection } from "@solana/web3.js";

(async () => {
  // This will connect you to your local validator
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
})();
```
