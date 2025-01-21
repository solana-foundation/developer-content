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

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>
<Tab value="web3.js v2"> ```typescript
file=/code/content/web3jsv2/cookbook/wallets/create-keypair.ts#L1-L28 import {
generateKeyPair, generateKeyPairSigner } from "@solana/web3.js";

    // Secret key is never exported or exposed.

    export const createKeypair = async (): Promise<{ address: string }> => {
      // KeyPairs are low-level and use the native Crypto API directly,
      // This means you can conveniently pass them to transaction pipelines and they will be used to sign your transactions.
      const keypair = await generateKeyPair();

      return { address: keypair.publicKey.toString() };
    }

    export const createKeypairSigner = async (): Promise<{ address: string }> => {
      // The Signer instance just wraps the KeyPair instance and uses it for signing using the native Crypto API when required.
      // whereas Signers is a higher-level abstraction over the concept of signing transactions and messages
      // (this could be using a keypair, using a wallet in the browser, using a ledger API directly, whatever you want).
      // Therefore KeyPairSigners are Signers that wrap the KeyPair API.

      const signer = await generateKeyPairSigner();

      return { address: signer.address };
    }

    ```

  </Tab>

  <Tab value="web3.js v1">
    ```typescript file=/code/content/web3jsv1/cookbook/wallets/create-keypair.ts#L1-L5
    import { Keypair } from "@solana/web3.js";

    const keypair = Keypair.generate();

    export { keypair };
    ```

  </Tab>
</Tabs>
