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
<Tab value="web3.js v2"> ```typescript
file=/code/content/web3jsv2/cookbook/wallets/check-publickey.ts#L1-L49 import {
isAddress, isProgramDerivedAddress, Address, createAddressWithSeed, } from
"@solana/web3.js";

    export type AddressValidationResult = {
      onCurveAddress: {
        address: string;
        isValid: boolean;
      };
      offCurveAddress: {
        address: string;
        isPDA: boolean;
        seed: string;
      };
      invalidAddress: {
        address: string;
        isValid: boolean;
      };
    };

    export async function validateAddresses(): Promise<AddressValidationResult> {
      // Valid public key that lies on the ed25519 curve (suitable for users)
      const key = "5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY" as Address<string>;

      // Valid public key that's off curve (suitable for programs)
      const seed = "21";
      const offCurveAddress = await createAddressWithSeed({
        baseAddress: key,
        programAddress: "11111111111111111111111111111111" as Address,
        seed,
      });

      // Invalid public key for testing
      const errorPubkey = "testPubkey";

      return {
        onCurveAddress: {
          address: key,
          isValid: isAddress(key),
        },
        offCurveAddress: {
          address: offCurveAddress,
          isPDA: isProgramDerivedAddress([offCurveAddress, 21]),
          seed,
        },
        invalidAddress: {
    ```

  </Tab>

  <Tab value="web3.js v1">
    ```typescript file=/code/content/web3jsv1/cookbook/wallets/check-publickey.ts#L1-L24
    import { PublicKey, Keypair } from "@solana/web3.js";

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

    let errorPubkey;
    try {
      // Not a valid public key
      errorPubkey = new PublicKey("testPubkey");
    } catch (err) {
      // Error will be caught here
    }
    ```

  </Tab>
</Tabs>
