---
title: How to Create a Keypair
sidebarSortOrder: 1
description:
  "Ever transaction requires a signature from a keypair on Solana. Learn how to
  create Keypairs on Solana."
---

Any transaction on the Solana blockchain requires a keypair or wallet. If you
are [connecting to a wallet](/content/cookbook/wallets/connect-wallet-react),
you do not need to worry about the keypair. Otherwise a keypair must be
generated for signing transactions.

```javascript file=/code/content/cookbook/wallets/create-keypair.ts#L1-L3
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.generate();
```
