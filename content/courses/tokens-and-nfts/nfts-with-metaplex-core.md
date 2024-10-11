---
title: Create Solana NFTs With Metaplex Core
objectives:
  - Explain NFTs and how they're represented on the Solana network
  - Explain Collections and how do they differ between the Core Program and the Token Metadata Program
  - Explain the role of the Metaplex Core program
  - Create and update a Collection using the Metaplex JS SDK
  - Create and update NFTs using the Metaplex JS SDK
description:
  "How to create NFTs in TypeScript with Metaplex Core program and Irys
  permanent storage service."
tags:
  - quickstart
  - metaplex
  - typescript
keywords:
- typescript
- npm
- yarn
- package
- tutorial
- digital assets
- intro to solana nfts
- blockchain developer
- blockchain tutorial
- web3 developer
---

### Summary

**Todo + remember to change the objectives too!**

### Lesson

Solana Non-Fungible Tokens (NFTs) used to be represented as SPL tokens 

In this lesson, we'll explore how Core Assets are represented and demonstrate 
how to create and update them using the mpl-core npm module.

Solana Non-Fungible Tokens (NFTs) used to be represented as SPL tokens 
with an additional metadata account associated with each token mint and 
created using both the Token Program and the Metaplex Token Metadata Program.

However, with the introduction of the new Metaplex Core Program, NFTs 
have their own program and standard that leverage a single account design 
and has a flexible plugin system that that enables developers to natively 
modify asset behavior and functionality

In this lesson, we'll explore how Core Assets are represented and demonstrate 
how to create and update them using the `mpl-core` npm module.

#### NFTs on Solana

All NFTs must meet the following characteristics:

1. Have 0 decimals, so it cannot be divided into parts.
2. Have a supply of 1, so only 1 of these tokens exists.
3. Not have a mint authority to ensure that the supply never changes.
4. Have an associated **metadata** to store things like a name, images, etc.

While all this properties were previously achievable with a combination of 
the SPL Token Program and the Metaplex Token Metadata Program, it came with 
a big overhead and lots of inefficiencies for a market as big as NFTs and Digital 
Asset in general.

This is exaclty why the **Metaplex Core Program** was created!

#### The Metaplex Core program

The [Metaplex Core Program](https://developers.metaplex.com/core) is the new 
standard for NFTs and Digital Assets on Solana

[image needed (?) ...]

- Differently from the Token Metadata Program, Collection are different accounts,
  model that requires different data, from the Asset they group together. Collections 
  store only collection specific metadata such as collection name and collection 
  image.
- Assets are now a single account model and design that don't rely on additional
  accounts such as Associated Token Accounts or Metadata Accounts. Instead, when 
  a Core Assets is created, the Metaplex Core Program stores ownership metadata 
  (like the URI pointing to an offchain `.json` that follow a [certain standard](https://developers.metaplex.com/token-metadata/token-standard)), 
  directly on the Asset.
- Both Assets and Collections can hook into lifecycle events, such as create
  transfer and burn, allowing custom behaviors via **Plugins**. For example, 
  thanks to plugin, royalty enforcement or onchain attributes can be added with 
  a single instruction and no additional code.

In the following sections, we'll cover the basics of using the `metaplex-foundation/mpl-core` 
package with Umi to prepare off-chain metadata, create and update Assets, and add 
them into a collection. For more information about `metaplex-foundation/mpl-core` 
visit the [Metaplex Developer Docs](https://developers.metaplex.com/core).

#### Umi

Umi is a framework built by Metaplex for registering JS/TS clients that interact with 
on-chain programs. While it can create clients for various programs, it's most commonly 
used with all the Metaplex program.

**Note**: Umi uses different implementations for common web3.js concepts, such as 
Keypairs, PublicKeys, and Connections. Fortunately, it's easy to convert between 
web3.js and Umi equivalents.

For more deetails, visit the [Metaplex Developer Docs](https://developers.metaplex.com/umi).

#### Installing and setting up Umi

First, create a new Umi instance. We can do this by either providing our own RPC 
endpoint, or use the public facing Solana endpoints provided by the `clusterApiUrl` 
method.

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";

const umi = createUmi(clusterApiUrl("devnet"));
```

Next, set the identity for your Umi instance (the keypair what will be used to sign 
transactions) and load the necessary plugins, in this case, the `mplCore` plugin.

```typescript
import { mplCore } from "@metaplex-foundation/mpl-core";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { promises as fs } from "fs";
import { clusterApiUrl } from "@solana/web3.js";

const umi = createUmi(clusterApiUrl("devnet")).use(mplCore());

// load keypair from local file system
// See https://github.com/solana-developers/helpers?tab=readme-ov-file#get-a-keypair-from-a-keypair-file
const localKeypair = await getKeypairFromFile();

// convert to Umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(localKeypair.secretKey);

// load the MPL metadata program plugin and assign a signer to our umi instance
umi.use(keypairIdentity(umiKeypair));
```

#### Uploading images

Before creating an Asset, you must prepare and upload any assets you plan to associate 
with it. While this doesn't have to be an image, most Assets have an image associated 
with them.

Preparing and uploading an image involves converting to a buffer first. You can convert
the file to a [generic file](https://developers.metaplex.com/umi/storage#generic-files) 
using the `createGenericFile()` function and finally uploading it to the designated 
Storage Driver.

The `GenericFile` type allows Umi to support different file variations despite the 
difference of browser files and local file system files i.e. those on your computer.

In action, uploading an image named `random-image.png` from your computer would take the following steps:

1. Reading the file using `readFile` into a buffer.

2. Creating a generic file type with the files MIME Type from the buffer and filePath.

3. Uploading file to designated storage provider.

```typescript
let filePath = "random-image.png";

const buffer = await fs.readFile(filePath);
let file = createGenericFile(buffer, filePath, {
  // chose the correct file MIME type https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types
  contentType: "image/jpeg",
});
const [image] = await umi.uploader.upload([file]);
```

The function will return the uri where the image is stored.

#### Uploading the metadata

After uploading the image, it's time to upload the offchain JSON metadata using the 
`uploadJson()` method. This will return a uri where the JSON metadata is stored.

Remember, the offchain portion of the metadata includes things like the image uri we
just generated as well as additional information like the name and description of the 
Asset. While you can technically include anything you'd like in this JSON object, in 
most cases, you should follow the [NFT standard](https://developers.metaplex.com/token-metadata/token-standard#the-non-fungible-standard)
to ensure compatibility with wallets, programs, and applications.

To create the metadata, use the `uploadJson()` method provided by the SDK. This method 
accepts a metadata object and returns a uri that points to the uploaded metadata.

```typescript
const metadata = {
  name: 'My NFT',
  description: 'This is an NFT on Solana',
  image,
  external_url: 'https://example.com',
  properties: {
    files: [
      {
        uri: imageUri[0],
        type: 'image/jpeg',
      },
    ],
    category: 'image',
  },
}

const uri = await umi.uploader.uploadJson(metadata);
```

#### Creating the Collection

Once the metadata is uploaded, you can finally create a Collection to group assets. 

The `createCollection` method allows you to create a collection with the provided data

```typescript
const collection = generateSigner(umi)
console.log("\nCollection Address: ", collection.publicKey.toString())

const { signature, result } = await createCollection(umi, {
  collection,
  name: 'My Collection',
  uri: collectionUri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

The `sendAndConfirm` method is what takes care of signing our transaction and sending
it. It also provides other options to set pre-flight checks and our desired commitment 
for the transaction, which defaults to `confirmed` if not provided.

This method returns an object containing the transaction signature and a result. The 
result object contains the outcome of our transaction. If successful, the `err` inside 
this will be set to null otherwise it'll contain the error for the failed transaction.

By default, the SDK sets the `payer` and the `updateAuthority` property respecitvely 
using the payer and signer identity of the Umi istance we created previously like this:

```typescript
const { signature, result } = await createCollection(umi, {
  ...createCollectionArgs,
  payer: umi.payer.publickey,
  updateAuthority: umi.identity.publicKey,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

#### Creating the Asset

The `create` method allows you to create a new Asset similarly to how is done for Collections

```typescript
const asset = generateSigner(umi)
console.log("\nAsset Address: ", asset.publicKey.toString())

const { signature, result } = await create(umi, {
  asset,
  name: 'My Asset',
  uri: assetUri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

For this method there are two additional optional field:
- the `owner` field that if not supplied gets defaulted to the signer identity of the
Umi istance like this:

```typescript
const { signature, result } = await create(umi, {
  ...createArgs,
  owner: umi.identity.publicKey,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

- the `collection` field that it's needed only when we want to add the asset to a collection

```typescript
const asset = generateSigner(umi)
const collection = await fetchCollection(umi, publicKey("CORE_COLLECTION_ADDRESS"));

const { signature, result } = await create(umi, {
  asset,
  collection,
  name: 'My Asset',
  uri: assetUri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

**Note**: once you add an Asset to a Collection you'll need to pass in a `CollectionV1` object in 
the collection field (can be obtained by using the `fetchCollection()` function) of subsequent instructions. 
Leaving the collection field empty will cause invalidations during transactions causing them to fail.

#### Updating the Asset & Collection

The following steps works for both Assets and Collection, the only difference will be 
employing the `update` method for Assets and the `updateCollection` method for Collections

The `update` method allows you to update all the fields present in the account like `collection`, 
`name`, `updateAuthority` and the `uri`

```typescript
const asset = await fetchAsset(umi, publickey("CORE_ASSET_ADDRESS"));
const collection = await fetchCollection(umi, publicKey("CORE_ASSET_ADDRESS"));

const { signature, result } = await update(umi, {
  asset,
  collection,
  name: 'My new NFT'
  uri: newAssetUri
  newCollection: publicKey("NEW_CORE_COLLECTION_ADDRESS")
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

When we add an Asset to a Collection, to not waste any additional bytes, the collection gets stored 
in the `updateAuthority` field of the asset. So if you want to change the collection address for the 
asset, you can update the `updateAuthority` field of the `update` function, instead of using the 
`newCollection` field, like this:

```typescript
const asset = await fetchAsset(umi, publickey("CORE_ASSET_ADDRESS"));
const collection = await fetchCollection(umi, publicKey("CORE_ASSET_ADDRESS"));

const { signature, result } = await update(umi, {
  asset,
  collection,
  newUpdateAuthority: updateAuthority("Collection", [publicKey("NEW_CORE_COLLECTION_ADDRESS")])
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

**Note**: We can use the same method to add the Asset to a Collection if it isn't part of a 
collection currently.

A noted difference from the `token-metadata` program is that it not impossible to create an immutable 
`Asset` using the `create` method. The only way to make an asset immutable is to change the `updateAuthority` 
to `None` in a futher update.

```typescript
const asset = await fetchAsset(umi, publickey("CORE_ASSET_ADDRESS"));
const collection = await fetchCollection(umi, publicKey("CORE_ASSET_ADDRESS"));

const { signature, result } = await update(umi, {
  asset,
  collection,
  newUpdateAuthority: updateAuthority("None")
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

**Note**: any fields you don't include in the call to `updateV1` will stay the same, by design.

### Lab

In this lab, we'll go through the steps to create a Core Asset using the Metaplex Umi framework, 
add the Asset to the Collection and update its metadata after the fact. By the end, you will 
have a basic understanding of how to use the Metaplex Umi and the `mpl-core` library to interact 
with digital assets on Solana.

#### Part 1: Creating an Core collection

To begin, make a new folder and install the relevant dependencies:

```bash
npm i @solana/web3.js npm i @solana/web3.js npm i @solana-developers/helpers npm i @metaplex-foundation/mpl-core npm i @metaplex-foundation/umi-bundle-defaults npm i @metaplex-foundation/umi-uploader-irys npm i --save-dev esrun
```

Then create a file called `create-metaplex-core-collection.ts`, and add our imports:

```typescript
import {
  createCollection,
  mplCore,
} from "@metaplex-foundation/mpl-core";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
  sol,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { promises as fs } from "fs";
import * as path from "path";
```

Connect to devnet, load a user and Airdrop some SOL if needed:

```typescript
// create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// load keypair from local file system
// assumes that the keypair is already generated using `solana-keygen new`
const user = await getKeypairFromFile();

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL,
);

console.log("Loaded user:", user.publicKey.toBase58());
```

Create a new Umi instance, assign it the loaded keypair, load the `mplCore` 
to interact with the metadata program and `irysUploader` to upload our files.

```typescript
// create a new connection to Solana's devnet cluster
const umi = createUmi(connection)
  .use(mplCore())
  .use(irysUploader());

// load keypair from local file system
// See https://github.com/solana-developers/helpers?tab=readme-ov-file#get-a-keypair-from-a-keypair-file
const user = await getKeypairFromFile();

// convert to umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
umi.use(keypairIdentity(umiKeypair))
```

Download the image assets the collection image from the links below and save them 
inside your working directory:

1. collection image:
   https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/collection.png

2. NFT image:
   https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/nft.png

We will use these images as our collection and asset cover images respectively.

We will use Irys as our storage provider, and since Metaplex conveniently created the 
`umi-uploader-irys` plugin, we can use that to upload our files. The plugin, also takes 
care of sending the right amount of lamports for storage fees so we don't have to worry 
about making this on our own.

Upload the offchain metadata to Irys:

```typescript
const collectionImagePath = "collection.png";

const buffer = await fs.readFile(collectionImagePath);
let file = createGenericFile(buffer, collectionImagePath, {
  contentType: "image/png",
});
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

const metadata = {
  name: "My Collection",
  description: "My Collection description",
  image,
  external_url: 'https://example.com',
  properties: {
    files: [
      {
        uri: image,
        type: 'image/jpeg',
      },
    ],
    category: 'image',
  },
}

// upload offchain json to Arweave using irys
const uri = await umi.uploader.uploadJson(metadata);
console.log("Collection offchain metadata URI:", uri);
```

Then actually create the collection:

```typescript
// generate mint keypair
const collection = generateSigner(umi);

// create and mint a Collection
await createCollection(umi, {
  collection,
  name: 'My Collection',
  uri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink(
  "address",
  collection.publicKey,
  "devnet",
);
console.log(`Collection: ${explorerLink}`);
console.log(`Collection address is:  ${collection.publicKey}`);
console.log("✅ Finished successfully!");
```

We advise using [esrun](https://www.npmjs.com/package/esrun) to run the scripts because 
it allows you to use top level await without having to wrap your code inside asynchronous 
function.

Run the `create-metaplex-core-collection.ts` script

```
npx esrun create-metaplex-nft-collection.ts
```

The output should look like this:

``` // TODO
% npx esrun create-metaplex-nft-collection.ts

Loaded user: 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
image uri: https://arweave.net/XWpt7HDOFC0wJQcQWgP9n_cxHS0qQik9-27CAAaGP6E
Collection offchain metadata URI: https://arweave.net/atIf58t3FHa3heoOtNqPkVvEGC_9WzAduY0GQE-LnFI
Collection: https://explorer.solana.com/address/D2zi1QQmtZR5fk7wpA1Fmf6hTY2xy8xVMyNgfq6LsKy1?cluster=devnet
Collection address is: D2zi1QQmtZR5fk7wpA1Fmf6hTY2xy8xVMyNgfq6LsKy1
✅ Finished successfully!
```

Congratulations! You've created a Metaplex Core Collection. Check this out on Solana Explorer 
using the URL above which should resemble 
![Solana Explorer with details about created collection](/public/assets/courses/unboxed/solana-explorer-metaplex-collection.png) // TODO

If you have any trouble, try and fix it yourself, but if you need to you can also check out the
[solution code](https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/create-collection.ts). // TODO

Keep the Collection addres since we're going to use it in the next step.

#### 2. Creating a Core Asset and adding it to the Collection

We'll now create a Core Assets that's a member of the Collection we just Created.

Start by creating a new  file called `create-metaplex-core-asset.ts`. The setup for this will 
look the same as the previous file, with slightly different imports:

```typescript
import { 
  mplCore
  create, 
  fetchCollection 
} from '@metaplex-foundation/mpl-core'
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  publickey as UMIPublicKey
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { promises as fs } from "fs";
import * as path from "path";

// create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// load keypair from local file system
// assumes that the keypair is already generated using `solana-keygen new`
const user = await getKeypairFromFile();
console.log("Loaded user:", user.publicKey.toBase58());

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL,
);

const umi = createUmi(connection)
  .use(mplCore())
  .use(irysUploader());

// convert to umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
umi.use(keypairIdentity(umiKeypair))
```

We can then put out files into Irys:

```typescript
const assetImagePath = "asset.png";

const buffer = await fs.readFile(assetImagePath);
let file = createGenericFile(buffer, assetImagePath, {
  contentType: "image/png",
});

// upload image and get image uri
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

const metadata = {
  name: 'My Asset',
  description: "My Asset Description",
  image,
  external_url: 'https://example.com',
  attributes: [
    {
      trait_type: 'trait1',
      value: 'value1',
    },
    {
      trait_type: 'trait2',
      value: 'value2',
    },
  ],
  properties: {
    files: [
      {
        uri: image,
        type: 'image/jpeg',
      },
    ],
    category: 'image',
  },
}

// upload offchain json using irys and get metadata uri
const uri = await umi.uploader.uploadJson(metadata);
console.log("Asset offchain metadata URI:", uri);
```

Then we create an Asset and we add it to the Collection we just created:

```typescript
// Substitute in your collection NFT address from create-metaplex-nft-collection.ts
const collection = fetchCollection(umi, UMIPublicKey("YOUR_COLLECTION_ADDRESS_HERE"))
const asset = generateSigner(umi);

// create and mint NFT
await create(umi, {
  asset,
  collection,
  name: 'My Asset',
  uri,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink(
  "address",
  asset.publicKey,
  "devnet",
);
console.log(`Asset: ${explorerLink}`);
console.log(`Asset address: ${asset.publicKey}`);
```

Run `npx esrun create-metaplex-nft.ts`. If all goes well, you will see the
following:

``` // TODO
% npx esrun create-metaplex-nft.ts

Loaded user: 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
image uri: https://arweave.net/XgTss3uKlddlMFjRTIvDiDLBv6Pptm-Vx9mz6Oe5f-o
Asset offchain metadata URI: https://arweave.net/PK3Url31k4BYNvYOgTuYgWuCLrNjl5BrrF5lbY9miR8
Asset:  https://explorer.solana.com/address/CymscdAwuTRjCz1ezsNZa15MnwGNrxhGUEToLFcyijMT?cluster=devnet
Asset address: CymscdAwuTRjCz1ezsNZa15MnwGNrxhGUEToLFcyijMT
✅ Finished successfully!
```

Inspect your Asset at the address given! If you have any trouble, try and fix it yourself, 
but if you need to you can also check out the [solution code](https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/create-nft.ts). // TODO

You should have something similar to this image on your explorer page
![Solana Explorer with details about created NFT](/public/assets/courses/unboxed/solana-explorer-metaplex-nft.png) // TODO

#### 3. Update the NFT

Create a new file, called `update-metaplex-core-asset.ts`. The imports will be similar to our previous files:

```typescript
import { 
  mplCore
  update, 
  fetchAsset, 
  fetchCollection 
} from '@metaplex-foundation/mpl-core'
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
  publicKey as UMIPublicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import {
  airdropIfRequired,
  getExplorerLink,
  getKeypairFromFile,
} from "@solana-developers/helpers";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { promises as fs } from "fs";
import * as path from "path";

// create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// load keypair from local file system
// assumes that the keypair is already generated using `solana-keygen new`
const user = await getKeypairFromFile();
console.log("Loaded user:", user.publicKey.toBase58());

await airdropIfRequired(
  connection,
  user.publicKey,
  1 * LAMPORTS_PER_SOL,
  0.1 * LAMPORTS_PER_SOL,
);

// create a new connection to Solana's devnet cluster
const umi = createUmi(connection)
  .use(mplCore())
  .use(irysUploader());

// load keypair from local file system
// See https://github.com/solana-developers/helpers?tab=readme-ov-file#get-a-keypair-from-a-keypair-file
const user = await getKeypairFromFile();

console.log("Loaded user:", user.publicKey.toBase58());

// convert to umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
umi.use(keypairIdentity(umiKeypair))
```

Fetch both Asset and Collection, using the address from the previous example and
try to update the uri and the name of the Asset:

```typescript
const assetImagePath = "asset.png";

const buffer = await fs.readFile(assetImagePath);
let file = createGenericFile(buffer, assetImagePath, {
  contentType: "image/png",
});

// upload new image and get image uri
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

const metadata = {
  name: 'My Updated Asset',
  description: "My Updated Asset Description",
  image,
  external_url: 'https://example.com',
  attributes: [
    {
      trait_type: 'trait1',
      value: 'value1',
    },
    {
      trait_type: 'trait2',
      value: 'value2',
    },
  ],
  properties: {
    files: [
      {
        uri: image,
        type: 'image/jpeg',
      },
    ],
    category: 'image',
  },
}

// upload offchain json using irys and get metadata uri
const uri = await umi.uploader.uploadJson(metadata);
console.log("Asset offchain metadata URI:", uri);

// Fetch the accounts using the address
const asset = fetchAsset(umi, UMIPublicKey("YOUR_ASSET_ADDRESS_HERE"))
const collecition = fetchCollection(umi, UMIPublicKey("YOUR_COLLECTION_ADDRESS_HERE"))

await update(umi, {
  asset,
  collection,
  name: "My Updated Asset"
  uri,
}).sendAndConfirm(umi);

let explorerLink = getExplorerLink("address", asset, "devnet");
console.log(`Asset updated with new metadata URI: ${explorerLink}`);

console.log("✅ Finished successfully!");
```

Run `npx esrun update-metaplex-core-assetft.ts`. You should see something like:

``` // TODO
% npx esrun update-metaplex-core-asset.ts

Loaded user: 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
image uri: https://arweave.net/dboiAebucLGhprtknDQnp-yMj348cpJF4aQul406odg
Asset offchain metadata URI: https://arweave.net/XEjo-44GHRFNOEtPUdDsQlW5z1Gtpk2Wv0HvR8ll1Bw
Asset updated with new metadata URI: https://explorer.solana.com/address/Zxd9TmtBHQNti6tJxtx1AKYJFykNUwJL4rth441CjRd?cluster=devnet
✅ Finished successfully!
```

Inspect the updated NFT on Solana Explorer! Just like previously, if you have any issues, 
you should fix them yourself, but if needed the
[solution code](https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/update-nft.ts) // TODO
is available.

![Solana Explorer with details about the updated NFT](/public/assets/courses/unboxed/solana-explorer-with-updated-NFT.png) //TODO

Congratulations! You've successfully learned how to use the Metaplex SDK to create, update, 
and add an Asset to a Collection. That's everything you need to build out your own collection 
for just about any use case. You could build a new event ticketing platform, revamp a retail 
business membership program, or even digitize your school's student ID system. The possibilities 
are endless!

### Challenge

The steps covered above for creating an NFT would be incredibly tedious to
execute for thousands of NFTs in one go. Many providers, including Metaplex,
Magic Eden, and Tensor have so-called 'fair launch' tools that take care of
minting large quantities of NFTs and ensuring they are sold within the
parameters set by their creators. Dive into fair launch platforms on the
[Digital Collectables](https://solana.com/ecosystem/explore?categories=digital%20collectibles)
page. This hands-on experience will not only reinforce your understanding of the
tools but also boost your confidence in your ability to use them effectively in
the future.

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=296745ac-503c-4b14-b3a6-b51c5004c165)! // TODO
</Callout>



