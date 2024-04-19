---
title: How to Create a Keypair
sidebarSortOrder: 1
---

Any transaction on the Solana blockchain requires a keypair or wallet. If you
are [connecting to a wallet](/developers/cookbook/wallets/connect-wallet), you
do not need to worry about the keypair. Otherwise a keypair must be generated
for signing transactions.

```javascript
import { Keypair } from "@solana/web3.js";

(async () => {
  let keypair = Keypair.generate();
})();
```
