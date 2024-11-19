---
title: How to Sign and Verify a Message
sidebarSortOrder: 6
description: "Learn how to sign messages on Solana."
---

The primary function of a keypair is to sign messages and enable verification of
the signature. Verification of a signature allows the recipient to be sure that
the data was signed by the owner of a specific private key.

For Solana Web3.js v1, we can use the
[TweetNaCl](https://www.npmjs.com/package/tweetnacl) crypto library:

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript
import { generateKeyPair, signBytes, verifySignature } from "@solana/keys";
import { getUtf8Encoder, getBase58Decoder } from "@solana/codecs";

const keys = await generateKeyPair();

const message = getUtf8Encoder().encode(
  "The quick brown fox jumps over the lazy dog",
);
const signedBytes = await signBytes(keys.privateKey, message);

console.log("Signature:", getBase58Decoder().decode(signedBytes));

const verifiedSignature = await verifySignature(
  keys.publicKey,
  signedBytes,
  message,
);

console.log("Verified:", verifiedSignature);
```

</Tab>
<Tab value="web3.js v1">

```typescript
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { decodeUTF8 } from "tweetnacl-util";

const keypair = Keypair.generate();

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
