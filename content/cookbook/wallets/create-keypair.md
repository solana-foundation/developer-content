---
title: How to Create a Keypair
sidebarSortOrder: 1
description:
  "Every transaction requires a signature from a keypair on Solana. Learn how to
  create Keypairs on Solana."
---

Any transaction on the Solana blockchain requires a keypair or wallet. If you
are [connecting to a wallet](/content/cookbook/wallets/connect-wallet-react),
you do not need to worry about the keypair. Otherwise a keypair must be
generated for signing transactions.

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}> <Tab value="web3.js v2">
```typescript file=/code/content/web3jsv2/cookbook/wallets/create-keypair.ts#L1-L5
import { generateKeyPairSigner } from "@solana/web3.js";

    (async () => {
    ```

  </Tab>

  <Tab value="web3.js v1">
    ```typescript file=/code/content/web3jsv1/cookbook/wallets/create-keypair.ts#L1-L5
    import { Keypair } from "@solana/web3.js";

    const keypair = Keypair.generate();
    ```

  </Tab>
</Tabs>
