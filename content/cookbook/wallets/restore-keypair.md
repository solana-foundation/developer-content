---
title: How to Restore a Keypair
sidebarSortOrder: 2
description: "Learn how to restore keypairs from a secret on Solana."
---

If you already have your secret key or bytes, you can get your Keypair from the
secret to test out your dApp.

## From Bytes

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript
import { createKeyPairFromBytes } from "@solana/web3.js";

const keypair = await createKeyPairFromBytes(
  new Uint8Array([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
  ]),
);

console.log(keypair);
```

</Tab>

<Tab value="web3.js v1">

```typescript
import { Keypair } from "@solana/web3.js";

const keypair = Keypair.fromSecretKey(
  Uint8Array.from([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
  ]),
);
```

</Tab>

</Tabs>

## From base58 String

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2 from base58">

```typescript
import { createKeyPairFromBytes } from "@solana/keys";
import bs58 from "bs58";

const keypair = await createKeyPairFromBytes(
  bs58.decode(
    "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG",
  ),
);

console.log(keypair);
```

</Tab>

<Tab value="web3.js v1 from base58">

```typescript
import { Keypair } from "@solana/web3.js";
import * as bs58 from "bs58";

const keypair = Keypair.fromSecretKey(
  bs58.decode(
    "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG",
  ),
);
```

</Tab>

</Tabs>
