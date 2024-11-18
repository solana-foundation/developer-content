---
title: Load a local json file keypair
sidebarSortOrder: 6
description: "Learn how to load a keypair from file."
---

When running your local project you probably want to use a file json keypair.
This can be very useful for all the cookbook examples as well. You can grind
yourself a keypair using `solana-keygen grind --starts-with a23:1` and then load
and use this one for your projects using the `loadKeypairFromFile` function.

```typescript filename="load-keypair-from-file.ts"
import {
  airdropFactory,
  createKeyPairFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  devnet,
  generateKeyPair,
  getAddressFromPublicKey,
  lamports,
} from "@solana/web3.js";
import fs from "fs";
import path from "path";
import os from "os";

// The new library takes a brand-new approach to Solana key pairs and addresses,
// which will feel quite different from the classes PublicKey and Keypair from version 1.x.
// All key operations now use the native Ed25519 implementation in JavaScript’s
// Web Crypto API.
async function createKeypair() {
  const newKeypair: CryptoKeyPair = await generateKeyPair();
  const publicAddress = await getAddressFromPublicKey(newKeypair.publicKey);

  console.log(`Public key: ${publicAddress}`);
}

export async function loadDefaultKeypair(): Promise<CryptoKeyPair> {
  return await loadKeypairFromFile("~/.config/solana/id.json");
}

export async function loadDefaultKeypairWithAirdrop(
  cluster: string,
): Promise<CryptoKeyPair> {
  const keypair = await loadDefaultKeypair();
  const rpc = createSolanaRpc(devnet(`https://api.${cluster}.solana.com`));
  const rpcSubscriptions = createSolanaRpcSubscriptions(
    devnet(`wss://api.${cluster}.solana.com`),
  );
  try {
    const result = await rpc
      .getBalance(await getAddressFromPublicKey(keypair.publicKey))
      .send();

    console.log(`Balance: ${result.value} lamports`);
    if (result.value < lamports(500_000n)) {
      console.log(`Balance low requesting airdrop`);
      const airdrop = airdropFactory({ rpc, rpcSubscriptions });
      await airdrop({
        commitment: "confirmed",
        lamports: lamports(1000_000n),
        recipientAddress: await getAddressFromPublicKey(keypair.publicKey),
      });
    }
  } catch (err) {
    console.error("Error fetching balance:", err);
  }
  return keypair;
}

export async function loadKeypairFromFile(
  filePath: string,
): Promise<CryptoKeyPair> {
  // This is here so you can also load the default keypair from the file system.
  const resolvedPath = path.resolve(
    filePath.startsWith("~") ? filePath.replace("~", os.homedir()) : filePath,
  );
  const loadedKeyBytes = Uint8Array.from(
    JSON.parse(fs.readFileSync(resolvedPath, "utf8")),
  );
  // Here you can also set the second parameter to true in case you need to extract your private key.
  const keypair = await createKeyPairFromBytes(loadedKeyBytes);
  return keypair;
}

createKeypair();
```
