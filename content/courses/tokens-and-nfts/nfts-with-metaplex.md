---
title: Create Solana NFTs With Metaplex
objectives:
  - Explain NFTs and how they're represented on the Solana network
  - Explain the role of the Metaplex Token Metadata program
  - Create and update NFTs using the Metaplex JS SDK
description:
  "How to create NFTs in TypeScript with Metaplex Metadata program and Irys
  permanent storage service."
---

### Summary

- **Non-Fungible Tokens (NFTs)** are SPL Tokens with an associated metadata
  account, 0 decimals, and a maximum supply of 1
- **Metadata** attaches additional properties to token mints (both NFTs and
  regular tokens). For NFTs, metadata includes the token name and a link to an
  offchain JSON file. This JSON file contains links to artwork and other media
  files, any special traits the NFT has, and more.
- The **Metaplex Token Metadata** program is an onchain program that attaches
  metadata to a token mint. We can interact with the Token Metadata program
  using the
  [Token Metadata package](https://developers.metaplex.com/token-metadata) via
  Umi, a tool made by Metaplex for working with onchain programs.

### Lesson

Solana Non-Fungible Tokens (NFTs) are SPL tokens created using the Token
program. These tokens, however, also have an additional metadata account
associated with each token mint.

In this lesson, we'll cover the basics of how NFTs are represented on Solana,
how to create and update them using the `mpl-token-metadata` npm module.

#### NFTs on Solana

An NFT is a standard token from the Token Program with the following
characteristics:

1. Has 0 decimals, so it cannot be divided into parts
2. Comes from a token mint with a supply of 1, so only 1 of these tokens exists
3. Comes from a token mint whose authority is set to `null` (to ensure that the
   supply never changes)
4. Has an associated account that stores **metadata** - things like a name,
   symbol, images, etc.

While the first three points can be achieved with the SPL Token Program, the
associated metadata requires an additional program. This is the **Metadata
program**.

#### The Metaplex Token Metadata program

The most popular way Solana NFTs have been created is by using the
[Metaplex Token Metadata](https://developers.metaplex.com/token-metadata)
program.

![Metadata](/public/assets/courses/unboxed/solana-nft-metaplex-metadata.png)

- When creating an NFT, the Token Metadata program creates an **onchain
  metadata** account using a Program Derived Address (PDA) with the token mint
  as a seed. This allows the metadata account for any NFT to be located
  deterministically using the address of the token mint. The onchain metadata
  contains a URI field that points to an offchain `.json` file.

- The **offchain metadata** in the JSON file stores the link to the media
  (images, videos, 3D files) of the NFT, any traits the NFT may have, and
  additional metadata (see
  [this example JSON file](https://lsc6xffbdvalb5dvymf5gwjpeou7rr2btkoltutn5ij5irlpg3wa.arweave.net/XIXrlKEdQLD0dcML01kvI6n4x0GanLnSbeoT1EVvNuw)).
  Permanent data storage systems such as Arweave are often used to store the
  offchain component of NFT metadata.

In the following sections, we'll cover the basics of using the
`metaplex-foundation/token-metadata` plugin with Umi to prepare assets, create
NFTs, update NFTs, and associate an NFT with a broader collection. For more
information on `metaplex-foundation/token-metadata` see the
[developer docs for Token Metadata](https://developers.metaplex.com/token-metadata).

<Callout type="note">
[Metaplex Core](https://developers.metaplex.com/core), is an NFT standard from Metaplex where asset details such as the owner, name, uri e.t.c are stored on a single account. However, the most common style of NFT is still by making a Solana
SPL token with some Metadata attached via the Metaplex Metadata program, so
that's what we'll be using in this tutorial. </Callout>

#### UMI instance

Umi is a framework for making JS/TS clients for onchain programs, that was
created by Metaplex. Umi can create JS/TS clients for many programs, but in
practice, it's most commonly used to communicate to the Token Metadata program.

Note that Umi has different implementations for many concepts than web3.js,
including Keypairs, PublicKeys, and Connections. However, it is easy to convert
from web3.js versions of these items to the Umi equivalents.

#### Installation and setting up Umi

First we create a new Umi instance. We can do this by either providing our own
RPC endpoint, or use the public facing Solana endpoints provided by the
`clusterApiUrl` method.

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";

const umi = createUmi(clusterApiUrl("devnet"));
```

Finally, we pass in the identity for our Umi instance (this is the keypair that
will be used to sign transactions) and the plugins that we will use, in our
case, this is the `metaplex-foundation/mpl-token-metadata`.

```typescript
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getKeypairFromFile } from "@solana-developers/helpers";
import { promises as fs } from "fs";
import { clusterApiUrl } from "@solana/web3.js";

const umi = createUmi(clusterApiUrl("devnet"));

// load keypair from local file system
// See https://github.com/solana-developers/helpers?tab=readme-ov-file#get-a-keypair-from-a-keypair-file
const localKeypair = await getKeypairFromFile();

// convert to Umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(localKeypair.secretKey);

// load the MPL metadata program plugin and assign a signer to our umi instance
umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata());
```

#### Uploading assets

Before creating an NFT, you must prepare and upload any assets you plan to
associate with the NFT. While this doesn't have to be an image, most NFTs have
an image associated with them.

Preparing and uploading an image involves converting the image to a buffer,
converting the file to a
[generic file](https://developers.metaplex.com/umi/storage#generic-files) using
the `createGenericFile()` function and finally uploading it to the designated
Storage Driver.

The `GenericFile` type allows Umi to support different file variations despite
the difference of browser files and local file system files i.e. those on your
computer.

In action, uploading an image named `random-image.png` from your computer would
take the following steps:

1. Reading the file using `readFile` into a buffer.

2. Creating a generic file type with the files MIME Type from the buffer and
   filePath.

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

The function's return value will be the URI where the image was stored.

#### Upload metadata

After uploading an image, it's time to upload the offchain JSON metadata using
the `uploadJson()` method. This will return a URI where the JSON metadata is
stored.

Remember, the offchain portion of the metadata includes things like the image
URI as well as additional information like the name and description of the NFT.
While you can technically include anything you'd like in this JSON object, in
most cases, you should follow the
[NFT standard](https://developers.metaplex.com/token-metadata/token-standard#the-non-fungible-standard)
to ensure compatibility with wallets, programs, and applications.

To create the metadata, use the `uploadJson()` method provided by the SDK. This
method accepts a metadata object and returns a URI that points to the uploaded
metadata.

```typescript
const uri = await umi.uploader.uploadJson({
  name,
  description,
  image,
});
```

#### Create the NFT

After uploading the NFT's metadata, you can finally create the NFT on the
network. The `mplTokenMetadata` plugin we added earlier provides the required
helpers to create an NFT or any other token with minimal configuration. The
helper `createNft` method will create the mint account, token account, metadata
account, and master edition account for you. The data provided to this method
will represent the onchain portion of the NFT metadata. You can explore the SDK
to see all the other input optionally supplied to this method.

```typescript
const { signature, result } = await createNft(umi, {
  mint,
  name: "My NFT",
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

The `sendAndConfirm` method is what takes care of signing our transaction and
sending it. It also provides other options to set pre-flight checks and our
desired commitment for the transaction, which defaults to `confirmed` if not
provided.

This method returns an object containing the transaction signature and a result.
The result object contains the outcome of our transaction. If successful, the
`err` inside this will be set to null otherwise it'll contain the error for the
failed transaction.

By default, the SDK sets the `isMutable` property to true, allowing for updates
to be made to the NFT's metadata. However, you can choose to set `isMutable` to
false, making the NFT's metadata immutable.

#### Update the NFT

If you've left `isMutable` as true, you may update your NFT's metadata.

The SDK's `updateV1` method allows you to update both the onchain and offchain
portions of the NFT's metadata. To update the offchain metadata, you'll need to
repeat the steps of uploading a new image and metadata URI (as outlined in the
previous steps), then provide the new metadata URI to this method. This will
change the URI that the onchain metadata points to, effectively updating the
offchain metadata as well.

```typescript
const nft = await fetchMetadataFromSeeds(umi, { mintAddress });

await updateV1(umi, {
  mint,
  authority: umi.identity,
  data: {
    ...nft,
    sellerFeeBasisPoints: 0,
    name: "Updated Name",
  },
  primarySaleHappened: true,
  isMutable: true,
}).sendAndConfirm(umi);
```

Note that any fields you don't include in the call to `updateV1` will stay the
same, by design.

#### Add the NFT to a collection

A
[Certified Collection](https://developers.metaplex.com/token-metadata/collections)
is an NFT that individual NFTs can belong to. Think of a large NFT collection
like Solana Monkey Business. If you look at an individual NFT's
[Metadata](https://explorer.solana.com/address/C18YQWbfwjpCMeCm2MPGTgfcxGeEDPvNaGpVjwYv33q1/metadata)
you will see a `collection` field with a `key` that points to the
`Certified Collection`
[NFT](https://explorer.solana.com/address/SMBH3wF6baUj6JWtzYvqcKuj2XCKWDqQxzspY12xPND/).
Simply put, NFTs that are part of a collection are associated with another NFT
that represents the collection itself.

Certified collections are important because they mean the collection owner has
verified that each NFT actually belongs to the collection!

To add an NFT to a collection, first, the Collection NFT has to be created. The
process is the same as before, except you'll include one additional field on our
NFT Metadata: `isCollection`. This field tells the token program that this NFT
is a Collection NFT.

```typescript
const collectionMint = generateSigner(umi);

await createNft(umi, {
  mint: collectionMint,
  name: `My Collection`,
  uri,
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
}).sendAndConfirm(umi);
```

To mint an NFT into this collection, the
[Collection type](https://mpl-token-metadata-js-docs.vercel.app/types/Collection.html)
which has two fields, the address of the `collectionMint` generated above and
the verified field.

```typescript
const { signature, result } = await createNft(umi, {
  mint,
  name: "My NFT",
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  collection: { key: collectionMint.publicKey, verified: false },
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

When you checkout the metadata on your newly created NFT, you should now see a
`collection` field like so:

```JSON
"collection":{
  "verified": false,
  "key": "SMBH3wF6baUj6JWtzYvqcKuj2XCKWDqQxzspY12xPND"
}
```

The last thing you need to do is verify the NFT. This effectively just flips the
`verified` field above to true, but it's incredibly important. This is what lets
consuming programs and apps, including wallets and art marketplaces, know that
your NFT is in fact part of the collection - because the Collection's owner has
signed a transaction making the NFT a member of that collection. You can do this
using the `verifyCollectionV1` function:

```typescript
const metadata = findMetadataPda(umi, { mint: mint.publicKey });

await verifyCollectionV1(umi, {
  metadata,
  collectionMint,
  authority: umi.identity,
}).sendAndConfirm(umi);
```

### Lab

In this lab, we'll go through the steps to create an NFT using the Metaplex Umi
framework, update the NFT's metadata after the fact, and then associate the NFT
with a collection. By the end, you will have a basic understanding of how to use
the Metaplex Umi and the mplTokenMetadata library to interact with NFTs on
Solana.

#### Part 1: Creating an NFT collection

To begin, make a new folder and install the relevant dependencies:

```bash
npm i @solana/web3.js@1 @solana-developers/helpers@2 @metaplex-foundation/mpl-token-metadata @metaplex-foundation/umi-bundle-defaults @metaplex-foundation/umi-uploader-irys esrun
```

Then create a file called `create-metaplex-nft-collection.ts`, and add our
imports:

```typescript
import {
  createNft,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createGenericFile,
  generateSigner,
  keypairIdentity,
  percentAmount,
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

Create a new Umi instance, assign it the loaded keypair, load the
`mplTokenMetadata` to interact with the metadata program and `irysUploader` to
upload our files.

```typescript
const umi = createUmi(connection);

// load keypair from local file system
// See https://github.com/solana-developers/helpers?tab=readme-ov-file#get-a-keypair-from-a-keypair-file
const user = await getKeypairFromFile();

// convert to umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// assigns a signer to our umi instance, and loads the MPL metadata program and Irys uploader plugins.
umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());
```

Download the image assets the collection image from the links below and save
them inside your working directory,

1. collection image:
   https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/collection.png

2. NFT image:
   https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/nft.png

We will use these images as our collection and nft cover images respectively.

We will use Irys as our storage provider, and Metaplex conveniently ships the
`umi-uploader-irys` plugin we can use to upload our files. The plugin, also
takes care of storage fees so that we don't have to worry about making this on
our own.

Upload the offchain metadata to Irys:

```typescript
const collectionImagePath = path.resolve(__dirname, "collection.png");

const buffer = await fs.readFile(collectionImagePath);
let file = createGenericFile(buffer, collectionImagePath, {
  contentType: "image/png",
});
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

// upload offchain json to Arweave using irys
const uri = await umi.uploader.uploadJson({
  name: "My Collection",
  symbol: "MC",
  description: "My Collection description",
  image,
});
console.log("Collection offchain metadata URI:", uri);
```

Then actually make the collection:

```typescript
// generate mint keypair
const collectionMint = generateSigner(umi);

// create and mint NFT
await createNft(umi, {
  mint: collectionMint,
  name: "My Collection",
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink(
  "address",
  collectionMint.publicKey,
  "devnet",
);
console.log(`Collection NFT:  ${explorerLink}`);
console.log(`Collection NFT address is:`, collectionMint.publicKey);
console.log("✅ Finished successfully!");
```

We advise using [esrun](https://www.npmjs.com/package/esrun) to run the scripts
because it allows you to use top level await without having to wrap your code
inside asynchronous function.

Run the `create-metaplex-nft-collection.ts` script

```
npx esrun create-metaplex-nft-collection.ts
```

The output should look like this:

```
% npx esrun create-metaplex-nft-collection.ts

Loaded user: 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
image uri: https://arweave.net/XWpt7HDOFC0wJQcQWgP9n_cxHS0qQik9-27CAAaGP6E
Collection offchain metadata URI: https://arweave.net/atIf58t3FHa3heoOtNqPkVvEGC_9WzAduY0GQE-LnFI
Collection NFT:  https://explorer.solana.com/address/D2zi1QQmtZR5fk7wpA1Fmf6hTY2xy8xVMyNgfq6LsKy1?cluster=devnet
Collection NFT address is: D2zi1QQmtZR5fk7wpA1Fmf6hTY2xy8xVMyNgfq6LsKy1
✅ Finished successfully!
```

Congratulations! You've created a Metaplex Collection. Check this out on Solana
Explorer using the URL above which should resemble

![Solana Explorer with details about created collection](/public/assets/courses/unboxed/solana-explorer-metaplex-collection.png)

If you have any trouble, try and fix it yourself, but if you need to you can
also check out the
[solution code](https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/create-collection.ts).

We'll use the collection NFT address in the next step.

#### 2. Creating a Metaplex NFT inside the collection

We'll now make a Metaplex NFT that's a member of the collection we just made.
Make a new file called `create-metaplex-nft.ts`. The setup for this will look
the same as the previous file, with slightly different imports:

```typescript
import {
  createNft,
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
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

const umi = createUmi(connection);

// convert to umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// load our plugins and signer
umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());
```

Now let's tell Metaplex our collection, and the NFT we want to make:

```typescript
// Substitute in your collection NFT address from create-metaplex-nft-collection.ts
const collectionNftAddress = UMIPublicKey("YOUR_COLLECTION_NFT_ADDRESS_HERE");

// example data and metadata for our NFT
const nftData = {
  name: "My NFT",
  symbol: "MN",
  description: "My NFT Description",
  sellerFeeBasisPoints: 0,
  imageFile: "nft.png",
};
```

We can then put out files into Irys:

```typescript
const NFTImagePath = path.resolve(__dirname, "nft.png");

const buffer = await fs.readFile(NFTImagePath);
let file = createGenericFile(buffer, NFTImagePath, {
  contentType: "image/png",
});

// upload image and get image uri
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

// upload offchain json using irys and get metadata uri
const uri = await umi.uploader.uploadJson({
  name: "My NFT",
  symbol: "MN",
  description: "My NFT Description",
  image,
});
console.log("NFT offchain metadata URI:", uri);
```

And then create an NFT using the URI from the metadata:

```typescript
// generate mint keypair
const mint = generateSigner(umi);

// create and mint NFT
await createNft(umi, {
  mint,
  name: "My NFT",
  symbol: "MN",
  uri,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  collection: {
    key: collectionAddress,
    verified: false,
  },
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink("address", mint.publicKey, "devnet");
console.log(`Token Mint:  ${explorerLink}`);
```

Run `npx esrun create-metaplex-nft.ts`. If all goes well, you will see the
following:

```
% npx esrun create-metaplex-nft.ts

Loaded user: 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
image uri: https://arweave.net/XgTss3uKlddlMFjRTIvDiDLBv6Pptm-Vx9mz6Oe5f-o
NFT offchain metadata URI: https://arweave.net/PK3Url31k4BYNvYOgTuYgWuCLrNjl5BrrF5lbY9miR8
Token Mint:  https://explorer.solana.com/address/CymscdAwuTRjCz1ezsNZa15MnwGNrxhGUEToLFcyijMT?cluster=devnet
Created NFT address is CymscdAwuTRjCz1ezsNZa15MnwGNrxhGUEToLFcyijMT
✅ Finished successfully!
```

Inspect your NFT at the address given! If you have any trouble, try and fix it
yourself, but if you need to you can also check out the
[solution code](https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/create-nft.ts).

You should have something similar to this image on your explorer page
![Solana Explorer with details about created NFT](/public/assets/courses/unboxed/solana-explorer-metaplex-nft.png)

Finally, let's verify our mint as being part of our collection. This makes it so
the `verified` field in the onchain metadata is set to `true`, so consuming
programs and apps can know for sure that the NFT in fact belongs to the
collection.

Create a new file `verify-metaplex-nft.ts`, import the required libraries and
instantiate a new umi Instance.

```typescript
import {
  findMetadataPda,
  mplTokenMetadata,
  verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  keypairIdentity,
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

const umi = createUmi(connection);

// Substitute in your collection NFT address from create-metaplex-nft-collection.ts
const collectionAddress = UMIPublicKey("");

// Substitute in your NFT address from create-metaplex-nft.ts
const nftAddress = UMIPublicKey("");
```

Verifying an NFT will require you to have the `collectionAddress` you used
created in the creation of a collection stage, and we will use the
`verifyCollectionV1` method.

```typescript
// Verify our collection as a Certified Collection
// See https://developers.metaplex.com/token-metadata/collections
const metadata = findMetadataPda(umi, { mint: nftAddress });
await verifyCollectionV1(umi, {
  metadata,
  collectionMint: collectionAddress,
  authority: umi.identity,
}).sendAndConfirm(umi);

let explorerLink = getExplorerLink("address", nftAddress, "devnet");
console.log(`verified collection:  ${explorerLink}`);
console.log("✅ Finished successfully!");
```

Run `npx esrun verify-metaplex-nft.ts`. If all goes well, you will see the
following:

```
% npx esrun create-metaplex-nft.ts

Loaded user: 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
verified collection: https://explorer.solana.com/address/CymscdAwuTRjCz1ezsNZa15MnwGNrxhGUEToLFcyijMT?cluster=devnet
✅ Finished successfully!
```

Inspect your verified NFT at the address given! If you have any trouble, try and
fix it yourself, but if you need to you can also check out the
[solution code](https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/verify-nft.ts).

The verified flag on your NFT should now be set to `1` -> `true` showing that
it's verified. To confirm this, look under the metadata tab on the Solana
Explorer to confirm that your NFT is verified as part of the collection.

![Solana Explorer with details about created NFT](/public/assets/courses/unboxed/solana-explorer-verified-nft.png)

Remember the NFT address, we'll use it in the next step.

#### 3. Update the NFT

Create a new file, called `update-metaplex-nft.ts`. The imports will be similar
to our previous files:

```typescript
import {
  createNft,
  fetchMetadataFromSeeds,
  updateV1,
  findMetadataPda,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
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

const umi = createUmi(connection);

// convert to umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// load our plugins and signer
umi
  .use(keypairIdentity(umiKeypair))
  .use(mplTokenMetadata())
  .use(irysUploader());
```

Let's load our NFT, specifying the address from the previous example, and set up
what we'd like to update:

```typescript
// Load the NFT using the mint address
const mint = UMIPublicKey("YOUR_NFT_ADDRESS_HERE");
const asset = await fetchDigitalAsset(umi, mint);

// example data for updating an existing NFT
const updatedNftData = {
  name: "Updated Asset",
  symbol: "UPDATED",
  description: "Updated Description",
  sellerFeeBasisPoints: 0,
  imageFile: "nft.png",
};
```

We can then use Metaplex to update our NFT:

```typescript
const NFTImagePath = path.resolve(__dirname, "nft.png");

const buffer = await fs.readFile(NFTImagePath);
let file = createGenericFile(buffer, NFTImagePath, {
  contentType: "image/png",
});

// upload new image and get image uri
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

// upload updated offchain json using irys and get metadata uri
const uri = await umi.uploader.uploadJson({
  name: "Updated ",
  symbol: "UPDATED",
  description: "Updated Description",
  image,
});
console.log("NFT offchain metadata URI:", uri);

// Load the NFT using the mint address
const mint = UMIPublicKey("Zxd9TmtBHQNti6tJxtx1AKYJFykNUwJL4rth441CjRd");
const nft = await fetchMetadataFromSeeds(umi, { mint });

await updateV1(umi, {
  mint,
  authority: umi.identity,
  data: {
    ...nft,
    sellerFeeBasisPoints: 0,
    name: "Updated Asset",
  },
  primarySaleHappened: true,
  isMutable: true,
}).sendAndConfirm(umi);

let explorerLink = getExplorerLink("address", mint, "devnet");
console.log(`NFT updated with new metadata URI: ${explorerLink}`);

console.log("✅ Finished successfully!");
```

Run `npx esrun update-metaplex-nft.ts`. You should see something like:

```bash
% npx esrun update-metaplex-nft.ts

Loaded user: 4kg8oh3jdNtn7j2wcS7TrUua31AgbLzDVkBZgTAe44aF
image uri: https://arweave.net/dboiAebucLGhprtknDQnp-yMj348cpJF4aQul406odg
NFT offchain metadata URI: https://arweave.net/XEjo-44GHRFNOEtPUdDsQlW5z1Gtpk2Wv0HvR8ll1Bw
NFT updated with new metadata URI: https://explorer.solana.com/address/Zxd9TmtBHQNti6tJxtx1AKYJFykNUwJL4rth441CjRd?cluster=devnet
✅ Finished successfully!
```

Inspect the updated NFT on Solana Explorer! Just like previously, if you have
any issues, you should fix them yourself, but if needed the
[solution code](https://github.com/solana-developers/professional-education/blob/main/labs/metaplex-umi/update-nft.ts)
is available.

![Solana Explorer with details about the updated NFT](/public/assets/courses/unboxed/solana-explorer-with-updated-NFT.png)

Congratulations! You've successfully learned how to use the Metaplex SDK to
create, update, and verify NFTs as part of a collection. That's everything you
need to build out your own collection for just about any use case. You could
build a new event ticketing platform, revamp a retail business membership
program, or even digitize your school's student ID system. The possibilities are
endless!

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
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=296745ac-503c-4b14-b3a6-b51c5004c165)!
</Callout>
