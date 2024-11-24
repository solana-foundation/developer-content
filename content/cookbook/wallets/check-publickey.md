---
title: How to Validate a Public Key
sidebarSortOrder: 4
description:
  "Public keys on Solana can be validated with a small amount of code. Learn how
  to validate public keys on Solana."
---

In certain special cases (e.g. a Program Derived Address), public keys may not
have a private key associated with them. You can check this by looking to see if
the public key lies on the ed25519 curve. Only public keys that lie on the curve
can be controlled by users with wallets.

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript
import { isAddress } from "@solana/web3.js";

// Note that generateKeyPair() will always give a public key that is valid for users

// Valid public key
const key = "5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY";

// Lies on the ed25519 curve and is suitable for users
console.log("Valid Address: ", isAddress(key));

// // Valid public key
const offCurveAddress = "4BJXYkfvg37zEmBbsacZjeQDpTNx91KppxFJxRqrz48e";

// // Not on the ed25519 curve, therefore not suitable for users
console.log("Valid Off Curve Address: ", isAddress(offCurveAddress));

// // Not a valid public key
const errorPubkey = "testPubkey";
console.log("Invalid Address: ", isAddress(errorPubkey));
```

</Tab>
<Tab value="web3.js v1">

```typescript
import { PublicKey } from "@solana/web3.js";

// Note that Keypair.generate() will always give a public key that is valid for users

// Valid public key
const key = new PublicKey("5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY");
// Lies on the ed25519 curve and is suitable for users
console.log(PublicKey.isOnCurve(key.toBytes()));

// Valid public key
const offCurveAddress = new PublicKey(
  "4BJXYkfvg37zEmBbsacZjeQDpTNx91KppxFJxRqrz48e",
);

// Not on the ed25519 curve, therefore not suitable for users
console.log(PublicKey.isOnCurve(offCurveAddress.toBytes()));

// Not a valid public key
const errorPubkey = new PublicKey("testPubkey");
console.log(PublicKey.isOnCurve(errorPubkey.toBytes()));
```

</Tab>
</Tabs>
