---
title: Non-Fungible Tokens (NFTs)
sidebarSortOrder: 17
description:
  "Learn how to create, mint, and transfer non-fungible tokens (NFTs) on Solana,
  using metaplex, token-metadata, umi, candy machine v2."
---

## Candy Machine v2

### How to create a Candy Machine

```typescript filename="create-candy-machine.ts"
import {
  createNft,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { create } from "@metaplex-foundation/mpl-candy-machine";
import {
  generateSigner,
  percentAmount,
  some,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl, Keypair } from "@solana/web3.js";
import "dotenv/config";

(async () => {
  try {
    console.log("Loading keypair from environment...");
    const privateKey = JSON.parse(process.env.SOLANA_PRIVATE_KEY || "[]");
    if (privateKey.length === 0) {
      throw new Error("SOLANA_PRIVATE_KEY is not set in .env file");
    }

    // Create a UMI instance
    const umi = createUmi(clusterApiUrl("devnet"));

    // Use the keypair as the signer for Umi
    const keypair = umi.eddsa.createKeypairFromSecretKey(
      new Uint8Array(privateKey),
    );
    umi.use(keypairIdentity(keypair));
    console.log("Signer public key:", keypair.publicKey);

    // Create the Collection NFT.
    const collectionMint = generateSigner(umi);
    console.log("Creating Collection NFT...");
    await createNft(umi, {
      mint: collectionMint,
      authority: umi.identity,
      name: "My Collection NFT",
      uri: "https://example.com/path/to/some/json/metadata.json",
      sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
      isCollection: true,
    }).sendAndConfirm(umi);
    console.log("Collection NFT created. Mint:", collectionMint.publicKey);

    // Create the Candy Machine
    console.log("Creating Candy Machine...");
    const candyMachine = generateSigner(umi);
    const transactionBuilder = await create(umi, {
      candyMachine,
      collectionMint: collectionMint.publicKey,
      collectionUpdateAuthority: umi.identity,
      tokenStandard: TokenStandard.NonFungible,
      sellerFeeBasisPoints: percentAmount(9.99, 2), // 9.99%
      itemsAvailable: 5000,
      creators: [
        {
          address: umi.identity.publicKey,
          verified: true,
          percentageShare: 100,
        },
      ],
      configLineSettings: some({
        prefixName: "",
        nameLength: 32,
        prefixUri: "",
        uriLength: 200,
        isSequential: false,
      }),
    });
    await transactionBuilder.sendAndConfirm(umi);
    console.log("Candy Machine created. Address:", candyMachine.publicKey);
  } catch (error) {
    console.error("Error:", error);
  }
})();
```

### How to delete a Candy Machine

```typescript filename="delete-candy-machine.ts"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { publicKey, keypairIdentity } from "@metaplex-foundation/umi";
import { deleteCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { clusterApiUrl } from "@solana/web3.js";

async function deleteCandyMachineScript() {
  // Initialize UMI
  console.log("Loading keypair from environment...");
  const privateKey = JSON.parse(process.env.SOLANA_PRIVATE_KEY || "[]");
  if (privateKey.length === 0) {
    throw new Error("SOLANA_PRIVATE_KEY is not set in .env file");
  }

  // Create a UMI instance
  const umi = createUmi(clusterApiUrl("devnet"));

  // Use the keypair as the signer for Umi
  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(privateKey),
  );
  umi.use(keypairIdentity(keypair));
  console.log("Signer public key:", keypair.publicKey);

  // The address of the Candy Machine you want to delete
  const candyMachineAddress = publicKey("CANDY_MACHINE_ADDRESS_HERE");

  try {
    console.log("Deleting Candy Machine...");
    const tx = await deleteCandyMachine(umi, {
      candyMachine: candyMachineAddress,
      // The collection mint is required if the Candy Machine has a collection set
      // collectionMint: publicKey('COLLECTION_MINT_ADDRESS_HERE'),
    }).sendAndConfirm(umi);

    console.log("Candy Machine deleted successfully!");
    console.log("Transaction signature:", tx.signature);
  } catch (error) {
    console.error("Error deleting Candy Machine:", error);
  }
}

(async () => {
  try {
    await deleteCandyMachineScript();
  } catch (error) {
    console.error("Error:", error);
  }
})();
```
