---
title: How to Restore a Keypair
sidebarSortOrder: 2
description: "Learn how to restore keypairs from a secret on Solana."
---

If you already have your secret key or bytes, you can get your Keypair from the
secret to test out your dApp.

## From Bytes

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>
<Tab value="web3.js v2"> ```typescript filename="restore-keypair-from-bytes.ts"
file=/code/content/web3jsv2/cookbook/wallets/restore-keypair.ts#L1-L13 import {
createKeyPairFromBytes, createKeyPairSignerFromBytes, getBase58Codec, } from
"@solana/web3.js";

    export async function restoreKeypairBytes() {
      const keypairBytes = new Uint8Array([
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
        222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
        15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
        121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
      ]);
    ```

  </Tab>

  <Tab value="web3.js v1">
    ```typescript filename="restore-keypair-from-bytes.ts" file=/code/content/web3jsv1/cookbook/wallets/restore-keypair-from-bytes.ts#L1-L12
    import { Keypair } from "@solana/web3.js";

    const keypair = Keypair.fromSecretKey(
      Uint8Array.from([
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
        222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
        15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
        121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
      ]),
    );

    export { keypair as bytesKeypair };
    ```

  </Tab>
</Tabs>

## From Base58 String

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>
<Tab value="web3.js v2"> ```typescript filename="restore-keypair-from-base58.ts"
file=/code/content/web3jsv2/cookbook/wallets/restore-keypair.ts#L1-L6,L19-L25,
import { createKeyPairFromBytes, createKeyPairSignerFromBytes, getBase58Codec, }
from "@solana/web3.js";

    export async function restoreKeypairBase58() {
      const keypairBase58 =
        "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG";
      const keypairBytes = getBase58Codec().encode(keypairBase58);

      return await createKeyPairFromBytes(keypairBytes);
    }
    ```

  </Tab>

  <Tab value="web3.js v1">
    ```typescript filename="restore-keypair-from-base58.ts" file=/code/content/web3jsv1/cookbook/wallets/restore-keypair-from-bs58.ts#L1-L10
    import { Keypair } from "@solana/web3.js";
    import bs58 from "bs58";

    const keypair = Keypair.fromSecretKey(
      bs58.decode(
        "4UzFMkVbk1q6ApxvDS8inUxg4cMBxCQRVXRx5msqQyktbi1QkJkt574Jda6BjZThSJi54CHfVoLFdVFX8XFn233L",
      ),
    );

    export { keypair as bs58Keypair };
    ```

  </Tab>
</Tabs>
