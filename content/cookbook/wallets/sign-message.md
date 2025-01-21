---
title: How to Sign and Verify a Message
sidebarSortOrder: 6
description: "Learn how to sign messages on Solana."
---

The primary function of a keypair is to sign messages, transactions and enable
verification of the signature. Verification of a signature allows the recipient
to be sure that the data was signed by the owner of a specific private key.

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>
<Tab value="web3.js v2"> ```typescript filename="sign-message.ts"
file=/code/content/web3jsv2/cookbook/wallets/sign-message.ts#L1-L28 import {
signBytes, verifySignature, getUtf8Encoder, getBase58Decoder, Address, } from
"@solana/web3.js";

    export async function signMessage(
      keys: CryptoKeyPair,
      message: string = "Hello, World!",
    ) {
      const encodedMessage = getUtf8Encoder().encode(message);
      const signedBytes = await signBytes(keys.privateKey, encodedMessage);

      const decoded = getBase58Decoder().decode(signedBytes);
      const verified = await verifySignature(
        keys.publicKey,
        signedBytes,
        encodedMessage,
      );

      return {
        signature: signedBytes,
        decodedSignature: decoded,
        verified,
      };
    }
    ```

  </Tab>

  <Tab value="web3.js v1">
    In Solana Web3.js v1, we can use the
    [TweetNaCl](https://www.npmjs.com/package/tweetnacl) crypto library:

    ```typescript filename="sign-message.ts" file=/code/content/web3jsv1/cookbook/wallets/sign-message.ts#L1-L25
    import { Keypair } from "@solana/web3.js";
    import * as ed from "@noble/ed25519";
    import { sha512 } from "@noble/hashes/sha512";
    import { utf8ToBytes } from "@noble/hashes/utils";

    // Enable synchronous methods for noble-ed25519
    ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

    const keypair = Keypair.fromSecretKey(
      Uint8Array.from([
        174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
        222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
        15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
        121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
      ]),
    );

    const message = "The quick brown fox jumps over the lazy dog";
    const messageBytes = utf8ToBytes(message);

    // Sign using noble-ed25519
    const signature = ed.sign(messageBytes, keypair.secretKey.slice(0, 32));

    // Verify using noble-ed25519
    const result = ed.verify(signature, messageBytes, keypair.publicKey.toBytes());
    ```

  </Tab>
</Tabs>
