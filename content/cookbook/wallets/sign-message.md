---
title: How to Sign and Verify a Message
sidebarSortOrder: 6
description: "Learn how to sign messages on Solana."
---

The primary function of a keypair is to sign messages, transactions and enable
verification of the signature. Verification of a signature allows the recipient
to be sure that the data was signed by the owner of a specific private key.

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}> <Tab value="web3.js v2">

```typescript
import {
  generateKeyPair,
  signBytes,
  verifySignature,
  getUtf8Encoder,
  getBase58Decoder,
} from "@solana/web3.js";

const keys = await generateKeyPair();
const message = getUtf8Encoder().encode("Hello, World!");
const signedBytes = await signBytes(keys.privateKey, message);

const decoded = getBase58Decoder().decode(signedBytes);
console.log("Signature:", decoded);

const verified = await verifySignature(keys.publicKey, signedBytes, message);
console.log("Verified:", verified);
```

</Tab>

<Tab value="web3.js v1">

In Solana Web3.js v1, we can use the
[TweetNaCl](https://www.npmjs.com/package/tweetnacl) crypto library:

```typescript
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";

const keypair = Keypair.fromSecretKey(
  Uint8Array.from([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
  ]),
);

const message = "The quick brown fox jumps over the lazy dog";
const messageBytes = decodeUTF8(message);

const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
const result = nacl.sign.detached.verify(
  messageBytes,
  signature,
  keypair.publicKey.toBytes(),
);

console.log(result);
```

</Tab>
</Tabs>
