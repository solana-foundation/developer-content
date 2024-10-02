---
title: Compressed NFTs
objectives:
  - Create a compressed NFT collection using Metaplex’s Bubblegum program
  - Mint compressed NFTs using the Bubblegum program
  - Transfer compressed NFTs using the Bubblegum program
  - Read compressed NFT data using the Read API
description:
  "How to mint, transfer and read large-scale NFT collections using Metaplex's
  Bubblegum SDK."
---

## Summary

- **Compressed NFTs (cNFTs)** use **State Compression** to hash NFT data and
  store the hash onchain in an account using a **Concurrent Merkle Tree**
  structure.
- The cNFT data hash can’t be used to infer the cNFT data, but it can be used to
  **verify** if the cNFT data you see is correct.
- Supporting RPC providers **index** cNFT data offchain when the cNFT is minted
  so that you can use the **Read API** to access the data.
- The **Metaplex Bubblegum program** is an abstraction on top of the **State
  Compression** program that enables you to create, mint, and manage cNFT
  collections.

## Lesson

Compressed NFTs (cNFTs) are exactly what their name suggests: NFTs whose
structure takes up less account storage than traditional NFTs. Compressed NFTs
use a technique called
[**State Compression**](https://solana.com/docs/advanced/state-compression) to
store data in a way that drastically reduces costs.

Solana’s transaction costs are so low that most users don't think about the cost
of minting NFTs at scale. However, minting 1 million NFTs can cost around 24,000
SOL. In contrast, cNFTs can be set up and minted for 10 SOL or less, meaning
costs can be reduced by over 1000x by using cNFTs.

While cNFTs are much cheaper, they can be more complex to work with. Over time,
tools will evolve to make using cNFTs as easy as traditional NFTs.

But for now, you’ll still need to understand the technical details, so let’s
dive in!

### A theoretical overview of cNFTs

Most of the costs of traditional NFTs comes from the need for account storage
space. Compressed NFTs (cNFTs) use State Compression to store data in the
blockchain’s cheaper **ledger state**, using the more expensive account storage
space only to store a “fingerprint”, or **hash**, of the data. This hash allows
you to cryptographically verify that data has not been altered.

To store and verify these hashes , we use a special binary tree structure known
as a
[**Concurrent Merkle Tree**](https://developers.metaplex.com/bubblegum/concurrent-merkle-trees).
This tree structure combines data through hashing in a determininistic way,
eventually creating a single smaller hash called a "root hash" that's stored
onchain, this process ccompresses the data, hence the “compression.” The steps
to this process are:

1. Take any piece of data
2. Create a hash of the data
3. Store the hash as a “leaf” at the bottom of the tree
4. Hash pairs of leaves together, to create “branches”
5. Hash branches together
6. Continually climb the tree and hash adjacent branches together
7. Once at the top of the tree, a final ”root hash” is produced
8. Store the root hash onchain as a verifiable proof that the data within each
   leaf has not changed
9. Anyone wanting to verify that the data they have matches the “source of
   truth” can go through the same process and compare the final hash without
   having to store all the data onchain

One challenge in the process above is how to make data available if its not
directly stored in an account. Since this hashing happens onchain, all the data
exists in the ledger state and could theoretically be retrieved from the
original transaction by replaying the entire chain state from the origin.
However, it’s easier (though still complicated) to have an **indexer** track and
index this data as the transactions occur. This ensures there is an offchain
“cache” of the data that anyone can access and subsequently verify against the
onchain root hash.

This process is _complicated_. We’ll cover some of the key concepts below but
don’t worry if you don’t understand it right away. We’ll cover more theory in
the state compression lesson and focus on applying it to NFTs. By the end of
this lesson, you’ll be able to work with cNFTs even if you don’t fully
understand the whole state compression process.

#### Concurrent Merkle trees

A **Merkle tree** is a binary tree structure that represents data as a single
hash. Every leaf node in the structure is a hash of its inner data while every
branch is a hash of its child leaf hashes. In turn, branches are also hashed
together until eventually one final root hash remains.

Any modification to leaf data changes the root hash. This causes a problem when
multiple transactions in the same slot try to update the tree at the same time.
Since these transactions must execute in series, all but the first will fail
since the root hash and proof passed in will have been invalidated by the first
transaction to be executed.

A **Concurrent Merkle Tree** is a Merkle tree that stores a secure changelog of
the most recent changes along with their root hash and the proof to derive it.
When multiple transactions in the same slot try to update the tree, the
changelog can be used as a source of truth to allow for concurrent changes to be
made to the tree.

When working with a concurrent Merkle tree, there are three variables that
determine the size, the cost to create the tree, and how many number changes
that can be made to the tree at once:

1. Max depth
2. Max buffer size
3. Canopy depth

The **max depth** is the maximum number of layers or "hops" to get from any leaf
to the root of the tree. Since its a type of binary tree, every leaf is
connected only to one other leaf. Max depth can then logically be used to
calculate the number of nodes for the tree with `2 ^ maxDepth`.

The **max buffer size** is effectively the maximum number of concurrent changes
that you can make to a tree within a single slot with the root hash still being
valid.

The **canopy depth** is the number of proof nodes that are stored onchain for
verification. To verify a leaf you need the complete proof path for the tree.
The complete proof path is made up of one proof node for every “layer” of the
tree, i.e. a max depth of 14 means there are 14 proof nodes. The larger the
tree, the more proof nodes there are, and each node adds 32 bytes to a
transaction, which can quickly exceed the maximum transaction size limit , so
caching proof nodes onchain helps manaage this.

Each of these three values, max depth, max buffer size, and canopy depth, comes
with a tradeoff. Increasing the value of any of these values increases the size
of the account used to store the tree, thus increasing the cost to create the
tree.

Choosing the max depth is fairly straightforward as it directly relates to the
number of leafs and therefore the amount of data you can store. If you need
1million cNFTs on a single tree, find the max depth that makes the following
expression true: `2^maxDepth > 1million`. The answer is 20.

Choosing a max buffer size is effectively a question of throughput: how many
concurrent writes do you need.

#### SPL State Compression and Noop Programs

The SPL State Compression Program simplifies and standardizes the process of
using merkle trees across the Solana ecosystem. It provides key functionalities
for initializing Merkle trees, managing tree leafs (i.e. add, update, remove
data), and verifying leaf data.

The State Compression Program also leverages a separate “No op” (No Operation)
program whose primary purpose log leaf data to the ledger state making it easier
to index leaf data.

#### Use the Ledger State for storage

The Solana ledger is a continuous record of signed transactions, theoretically
traceable all the way back to the genesis block. This means any data that has
ever been put into a transaction exists in the ledger.

When you want to store compressed data, you pass it to the State Compression
program where it gets hashed and emitted as an “event” to the Noop program. The
hash is then stored in the corresponding concurrent Merkle tree. Since the data
passed through a transaction and even exists on the Noop program logs, it will
exist on the ledger state permanently.

#### Index data for easy lookup

Normally, you would access onchain data by fetching it from an account. However,
when using state compression, its a bit more complicated .

Instead of being stored in an account, compressed data resides in the ledger
state. The easiest way to access the full data is through the logs of the Noop
instruction, but while this data will in a sense exist in the ledger state
forever, it will likely be inaccessible through validators after a certain
period of time.

To save space and be more performant, validators don't retain every transaction
back to the genesis block. The specific amount of time you'll be able to access
the Noop instruction logs related to your data will vary based on the validator,
but eventually you'll lose access to it if you're relying directly on
instruction logs.

Technically, it is possible to replay the entire transaction history back to the
genesis block but this is impractical and unperformant for most teams. Instead,
a better approach is using an indexer that will observe the events sent to the
Noop program and store the relevant data offchain. That way you don’t need to
worry about old data becoming inaccessible.

### Create a cNFT Collection

Now that we've covered the theory, let’s focus on the main point of this lesson:
how to create a cNFT collection.

Fortunately, you can use tools created by Solana Foundation, the Solana
developer community, and Metaplex to simplify the process. Specifically, we'll
be using the `@solana/spl-account-compression` SDK, the Metaplex Bubblegum
program, and the Bubblegum program’s corresponding typescript SDK
`@metaplex-foundation/mpl-bugglegum` alongside the Metaplex umi library
`@metaplex-foundation/umi`.

<aside>
💡 Note: We'll be using the bubblegum client SDK by metaplex which now supports umi, their modular framework for building and using JS clients for Solana programs
</aside>

#### Prepare metadata

Before starting, you’ll need to prepare your NFT metadata similar to how you
would with a Candy Machine. An NFT is simply a token with metadata that follows
the NFT standard. In other words, heres an example of how it should look like:

```json
{
  "name": "12_217_47",
  "symbol": "RGB",
  "description": "Random RGB Color",
  "seller_fee_basis_points": 0,
  "image": "https://raw.githubusercontent.com/ZYJLiu/rgb-png-generator/master/assets/12_217_47/12_217_47.png",
  "attributes": [
    {
      "trait_type": "R",
      "value": "12"
    },
    {
      "trait_type": "G",
      "value": "217"
    },
    {
      "trait_type": "B",
      "value": "47"
    }
  ]
}
```

Depending on your project, you may be able to generate this metadata dynamically
or you have a separate JSON file prepared for each cNFT . You’ll also need any
other assets referenced by the JSON, such as the `image` url shown in the
example above.

#### Setting up Umi

Before we start creating Collection NFTs we have to setup Umi. Umi is a modular
framework for building and using JavaScript clients for Solana onchain programs
that was created by Metaplex. Note that Umi provides distinct implementations
for many components compared to web3.js, such as Keypairs, PublicKeys, and
Connections, but converting from web3.js versions to Umi equivalents is simple.

To begin, we first need to initialize an Umi instance.

```typescript
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { clusterApiUrl } from "@solana/web3.js";

const umi = createUmi(clusterApiUrl("devnet"));
```

The above code initializes an empty Umi instance and connects to the devnet
cluster with no signer or plugin attached.

After we have done this we will add in imports then attach a signer to the Umi
instance

```typescript
import { clusterApiUrl } from "@solana/web3.js";
import { createTree, mplBubblegum } from "@metaplex-foundation/mpl-bubblegum";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import { keypairIdentity } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { getOrCreateKeypair } from "./utils";

const umi = createUmi(clusterApiUrl("devnet"));

//get keypair from .env file or create a new one
const wallet = await getOrCreateKeypair("Wallet1");

// convert to Umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(wallet.secretKey);

// Load the DAS API and MPL Bubblegum plugins into Umi, and set the Umi identity using a keypair, which acts as the signer for transactions.
umi.use(keypairIdentity(umiKeypair)).use(mplBubblegum()).use(dasApi());
```

#### Create Collection NFT

If you want your cNFTs to be part of a collection, you’ll need to create a
Collection NFT **before** you start minting cNFTs. A Collection NFT is a
traditional NFT that serves as the reference binding your cNFTs together into a
single collection. To create a Collection NFT we will use the `createNft` method
from the `@metaplex-foundation/mpl-token-metadata` library. Just make sure you
set `isCollection` field to `true`. You can find the documentation for the
createNft method on the "Minting Assets" page, in the "Create helpers" section
at
[Metaplex token-metadata documentation](https://developers.metaplex.com/token-metadata/mint).

In the code below, `generateSigner(umi)` is used to create a new keypair (or
signer) that represents the mint address for the Collection NFT. This signer is
a unique address that will serve as the mint for your Collection NFT. It ensures
that each Collection NFT has a distinct mint address.

```typescript
import { percentAmount, generateSigner } from "@metaplex-foundation/umi";
import { createNft } from "@metaplex-foundation/mpl-token-metadata";

const collectionMint = generateSigner(umi);

await createNft(umi, {
  mint: collectionMint,
  name: "Collection NFT",
  uri: randomUri,
  authority: umi.identity,
  updateAuthority: umi.identity.publicKey,
  sellerFeeBasisPoints: percentAmount(0),
  symbol: "Collection",
  isMutable: true,
  isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });
```

#### Create Merkle tree Account

When creating compressed NFTs (cNFTs), you need to setup an an account for the
Concurrent Merkle Tree. This Merkle tree account belongs to the SPL State
Compression program. Before you can do any cNFT related actions, you need to
create an empty Merkle tree account with the appropriate size.

The variables impacting the size of the account are:

1. Max depth
2. Max buffer size
3. Canopy depth

The Max depth and Max buffer size must be selected from an existing set of valid
pairs. The table below shows the valid pairs along with the number of cNFTs that
can be created with those values.

| Max Depth | Max Buffer Size | Max Number of cNFTs |
| --------- | --------------- | ------------------- |
| 3         | 8               | 8                   |
| 5         | 8               | 32                  |
| 14        | 64              | 16,384              |
| 14        | 256             | 16,384              |
| 14        | 1,024           | 16,384              |
| 14        | 2,048           | 16,384              |
| 15        | 64              | 32,768              |
| 16        | 64              | 65,536              |
| 17        | 64              | 131,072             |
| 18        | 64              | 262,144             |
| 19        | 64              | 524,288             |
| 20        | 64              | 1,048,576           |
| 20        | 256             | 1,048,576           |
| 20        | 1,024           | 1,048,576           |
| 20        | 2,048           | 1,048,576           |
| 24        | 64              | 16,777,216          |
| 24        | 256             | 16,777,216          |
| 24        | 512             | 16,777,216          |
| 24        | 1,024           | 16,777,216          |
| 24        | 2,048           | 16,777,216          |
| 26        | 512             | 67,108,864          |
| 26        | 1,024           | 67,108,864          |
| 26        | 2,048           | 67,108,864          |
| 30        | 512             | 1,073,741,824       |
| 30        | 1,024           | 1,073,741,824       |
| 30        | 2,048           | 1,073,741,824       |

Note that the number of cNFTs that can be stored on the tree depends entirely on
the max depth, while the buffer size will determine the number of concurrent
changes (mints, transfers, etc.) within the same slot that can occur to the
tree. In other words, choose the max depth that corresponds to the number of
NFTs you need the tree to hold, then choose one of the options for max buffer
size based on the traffic you expect you'll need to support.

Next, choose the canopy depth. Increasing the canopy depth increases the
composability of your cNFTs. Any time you or another developer’s code attempts
to verify a cNFT down the road, the code will have to pass in as many proof
nodes as there are “layers” in your tree. So for a max depth of 20, you'll need
to pass in 20 proof nodes. Not only is this tedious, but since each proof node
is 32 bytes it's possible to max out transaction sizes very quickly.

For example, if your tree has a very low canopy depth, an NFT marketplace may
only be able to support simple NFTs transfers rather than support an onchain
bidding system for your cNFTs. The canopy effectively caches proof nodes onchain
so you don't have to pass all of them into the transaction, allowing for more
complex transactions.

Increasing any of these three values increases the size of the account, which
also increasing the cost associated with creating it. Weigh the benefits
accordingly when choosing the values.

Once you know these values, you can use the `createTree` method from the
@metaplex-foundation/mpl-bubblegum package to create your tree.

```typescript

import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import {
  ValidDepthSizePair,
} from "@solana/spl-account-compression"

  const maxDepthSizePair: ValidDepthSizePair = {
    maxDepth: 3,
    maxBufferSize: 8,
  };

 const merkleTree = generateSigner(umi);

  const builder = await createTree(umi, {
    merkleTree,
    maxDepth: maxDepthSizePair.maxDepth, //  Max depth of the tree
    maxBufferSize: maxDepthSizePair.maxBufferSize // Max buffer size,
    public: false, // Set to false to restrict minting to the tree creator/delegate
  });

```

In the code above, we define an object of type `ValidDepthSizePair` from the
`@solana/spl-account-compression` program, setting maxDepth to 3 and
maxBufferSize to 8 to define valid limits for the Merkle tree. We then generate
a merkleTree signer using `generateSigner` with the umi instance, after we've
done this, we now invoke `createTree`, passing the umi instance, the merkleTree
signer, and the parameters from maxDepthSizePair to configure the tree's maximum
depth and buffer size, then we set the public parameter to false, restricting
minting to the tree's creator or delegate , doing so is optional.

When submitted, this will invoke the `create_tree` instruction on the Bubblegum
program under the hood. This instruction does three things:

1. Creates the tree config PDA account
2. Initializes the `TreeConfig` account with appropriate initial values that
   holds additional data exclusive to compressed NFTs such as the tree creator,
   whether the tree is public.
3. Issues a CPI to the State Compression program to initialize the empty Merkle
   tree account

Feel free to take a look at the source code for the create_tree instruction and
the TreeConfig account

- [Create Tree](https://github.com/metaplex-foundation/mpl-bubblegum/blob/df5b5feae8c161a7e22b9878a3b30a62f92ee864/programs/bubblegum/program/src/processor/create_tree.rs#L40)

- [Tree Config](https://github.com/metaplex-foundation/mpl-bubblegum/blob/42ffed35da6b2a673efacd63030a360eac3ae64e/programs/bubblegum/program/src/state/mod.rs#L17)

#### Mint cNFTs

Now that we have the Merkle tree account and its corresponding Bubblegum tree
config account initialized, its time to mint cNFTs to the tree, we use `mintV1`
or `mintToCollectionV1` from the `@metaplex-foundation/mpl-bubblegum` package,
depending on whether we want the minted cNFT to be part of a collection.

### 1. mintV1

```typescript
await mintV1(umi, {
  leafOwner,
  merkleTree,
  metadata: {
    name: "My Compressed NFT",
    uri: "https://example.com/my-cnft.json",
    sellerFeeBasisPoints: 0, // 0%
    collection: none(),
    creators: [
      { address: umi.identity.publicKey, verified: false, share: 100 },
    ],
  },
}).sendAndConfirm(umi);
```

### 2. mintToCollectionV1

```typescript
await mintToCollectionV1(umi, {
  leafOwner,
  merkleTree,
  collectionMint,
  metadata: {
    name: "My Compressed NFT",
    uri: "https://example.com/my-cnft.json",
    sellerFeeBasisPoints: 0, // 0%
    collection: { key: collectionMint, verified: false },
    creators: [
      { address: umi.identity.publicKey, verified: false, share: 100 },
    ],
  },
}).sendAndConfirm(umi);
```

Both functions require you to pass the NFT metadata and the accounts required to
mint the NFT `leafOwner`, `merkleTree`, but the mintToCollectionV1 requires an
additional collectionMint account which is the mint address of the Collection
NFT to which the cNFT will be part.

### Interact with cNFTs

It's important to note that cNFTs _are not_ SPL tokens. That means your code
needs to follow different conventions to handle cNFT functionality like
fetching, querying, transferring, etc.

#### Fetch cNFT data

The simplest way to fetch data from an existing cNFT is to use the
[Digital Asset Standard Read API](https://solana.com/developers/guides/javascript/compressed-nfts#reading-compressed-nfts-metadata)
(Read API). Note that this is separate from the standard JSON RPC. To use the
Read API, you'll need to use a supporting RPC Provider. Metaplex maintains a
(likely non-exhaustive)
[list of RPC providers](https://developers.metaplex.com/bubblegum/rpcs) that
support the Read API.

In this lesson we’ll be using
[Helius](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)
as they have free support for Devnet.

To fetch a specific cNFT using the Read API you need to derive the cNFT’s asset
ID, from the leaf index (which you track). However, after minting cNFTs you’ll
have at most two pieces of information:

1. The transaction signature
2. The leaf index (possibly)

The only real guarantee is that you'll have the transaction signature. It is
**possible** to locate the leaf index from there, but it involves some fairly
complex parsing. The short story is you must retrieve the relevant instruction
logs from the Noop program and parse them to find the leaf index. We'll cover
this more in depth in a future lesson. For now, we'll assume you know the leaf
index.

This is a reasonable assumption for most mints given that the minting will be
controlled by your code and can be set up sequentially so that your code can
track which index is going to be used for each mint. that is, the first mint
will use index 0, the second index 1, etc.

Once you have the leaf index, you can derive the cNFT's corresponding asset ID.
When using Bubblegum, the asset ID is a PDA derived using the Bubblegum program
ID and the following seeds:

1. The static string `asset` represented in utf8 encoding
2. The Merkle tree address
3. The leaf index

The indexer essentially observes transaction logs from the Noop program as they
happen and stores the cNFT metadata that was hashed and stored in the Merkle
tree. This enables them to surface that data when requested. This asset id is
what the indexer uses to identify the particular asset.

Heres how you can fetch the cNFT using the `findLeafAssetIdPda` helper function
from the Bubblegum SDK, and the `getAsset` method provided by your RPC provider:

```typescript
const assetId = findLeafAssetIdPda(umi, {
  merkleTree,
  leafIndex: leaf.nonce,
});
```

Now that you have the Asset ID , you can now fetch the cNFT, we will simply use
the `getAsset` method provided by the supporting RPC provider and the dasApi
library:

```typescript
const rpcAsset = await umi.rpc.getAsset(assetId);
```

After fetching the cNFT using the getAsset RPC method, the returned JSON object
will contain metadata that is comprehensive of what a traditional NFT’s on and
offchain metadata would look like combined. For example, you can find the cNFT
attributes at `content.metadata.attributes` or the image at `content.files.uri`.

#### Query cNFTs

The Read API also includes ways to get multiple assets, query by owner, creator,
and more. For example, Helius supports the following methods:

- `getAsset`
- `getSignaturesForAsset`
- `searchAssets`
- `getAssetProof`
- `getAssetsByOwner`
- `getAssetsByAuthority`
- `getAssetsByCreator`
- `getAssetsByGroup`

We won't go over most of these directly, but be sure to look through the
[Helius docs](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)
to learn how to use them correctly.

#### Transfer cNFTs

Just as with a standard SPL token transfer, security is important. An SPL token
transfer, however, makes verifying transfer authority very easy. It’s built into
the SPL Token program and standard signing. A compressed token’s ownership is
harder to verify. The actual verification will happen program-side, but your
client-side code needs to provide additional information to make it possible.

The Bubblegum program needs to verify that the entirety of the cNFT’s data is
what the client asserts before a transfer can occur. The entirety of the cNFT
data has been hashed and stored as a single leaf on the Merkle tree, and the
Merkle tree is simply a hash of all the tree’s leafs and branches. Because of
this, you can’t simply tell the program what account to look at and have it
compare that account’s `authority` or `owner` field to the transaction signer.

Instead, you need to provide the entirety of the cNFT data and any of the Merkle
tree's proof information that isn't stored in the canopy. That way, the program
can independently prove that the provided cNFT data, and therefore the cNFT
owner, is accurate. Only then can the program safely determine if the
transaction signer should, in fact, be allowed to transfer the cNFT.

In broad terms, this involves a five step process:

1. Fetch the cNFT's asset data from the indexer
2. Fetch the cNFT's proof from the indexer
3. Fetch the Merkle tree account from the Solana blockchain
4. Prepare the asset proof as a list of `AccountMeta` objects
5. Build and send the Bubblegum transfer instruction

The first two steps are very similar. Using your supporting RPC provider, use
the `getAsset` and `getAssetProof` methods to fetch the asset data and proof,
respectively.

```typescript
import { publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";

const umi = createUmi("<ENDPOINT>").use(dasApi());
const assetId = publicKey("8TrvJBRa6Pzb9BDadqroHhWTHxaxK8Ws8r91oZ2jxaVV");

const asset = await umi.rpc.getAsset(assetId);

console.log(asset);
```

Then we can use the transfer method from the
`@metaplex-foundation/mpl-bubblegum` package. This method requires two
arguments: the `umi` instance and an object containing the following fields:
=======

- `assetWithProof` - Data representing the asset and its associated Merkle
  proof.
- `leafOwner` - the owner of the leaf (cNFT) in question
- `newLeafOwner` - the address of the new owner after the transfer

const leafOwner = new PublicKey(assetData.ownership.owner);

```typescript
import { transfer } from "@metaplex-foundation/mpl-bubblegum";

await transfer(umi, {
  ...assetWithProof,
  leafOwner: currentLeafOwner,
  newLeafOwner: newLeafOwner.publicKey,
}).sendAndConfirm(umi);
```

### Conclusion

We've covered the primary skills needed to interact with cNFTs, but haven't been
fully comprehensive. You can also use Bubblegum to do things like burn, verify,
delegate, and more. We won't go through these, but these instructions are
similar to the mint and transfer process. If you need this additional
functionality, take a look at the
[Bubblegum client source code](https://github.com/metaplex-foundation/mpl-bubblegum/tree/main/clients/js-solita)
and leverage the helper functions it provides.

Keep in mind that compression is still new. Available tooling will improve
quickly but the principles you’ve learned in this lesson will likely remain the
same. These principles can also be broadened to arbitrary state compression, so
be sure to master them here so you're ready for more fun stuff in future
lessons!

## Lab

Let's jump in and practice creating and working with cNFTs. Together, we'll
build as simple a script as possible that will let us mint a cNFT collection
from a Merkle tree.

### 1. Get the starter code

First things first, clone the starter code from the `starter` branch of our
[cNFT lab repository](https://github.com/solana-developers/solana-cnft-demo).

`git clone https://github.com/solana-developers/solana-cnft-demo.git`

`cd solana-cnft-demo`

`npm install`

Take some time to familiarize yourself with the starter code provided. Most
important are the helper functions provided in `utils.ts` and the URIs provided
in `uri.ts`.

The `uri.ts` file provides 1k URIs that you can use for the offchain portion of
your NFT metadata. You can, of course, create your own metadata. But this lesson
isn't explicitly about preparing metadata so we've provided some for you.

The `utils.ts` file has a few helper functions to keep you from writing
unnecessary boilerplate code. They are as follows:

- `getOrCreateKeypair` will create a new keypair for you and save it to a `.env`
  file, or if there's already a private key in the `.env` file it will
  initialize a keypair from that.
- `airdropSolIfNeeded` will airdrop some Devnet SOL to a specified address if
  that address's balance is below 1 SOL.
- `createNftMetadata` will create the NFT metadata for a given creator public
  key and index. The metadata it's getting is just dummy metadata using the URI
  corresponding to the provided index from the `uri.ts` list of URIs.
- `getOrCreateCollectionNFT` will fetch the collection NFT from the address
  specified in `.env` or if there is none it will create a new one and add the
  address to `.env`.

Finally, there's some boilerplate in `index.ts` that calls creates a new Devnet
connection, calls `getOrCreateKeypair` to initialize a “wallet,” and calls
`airdropSolIfNeeded` to fund the wallet if its balance is low all wrapped in a
function named `initializeUmi` that can be used throughout the codebase

### 2. Create the Merkle tree account

We’ll start by creating the Merkle tree account. Let’s wrap this in a function
that will eventually create _and_ initialize the account. We’ll create a new
file called `create-and-initialize-tree.ts` and call our function =======
`createAndInitializeTree`. For this function to work, it will need the following
parameters:

- `umi` - our umi instance
- `payer` - a `Keypair` that will pay for transactions.
- `maxDepthSizePair` - a `ValidDepthSizePair`. This type comes from
  `@solana/spl-account-compression`. It's a simple object with properties
  `maxDepth` and `maxBufferSize` that enforces a valid combination of the two
  values.

This will initialize the Merkle tree account _and_ create a new tree config
account on the Bubblegum program.

```typescript
import * as fs from "fs";
import dotenv from "dotenv";
import { createTree } from "@metaplex-foundation/mpl-bubblegum";
import { generateSigner, publicKey } from "@metaplex-foundation/umi";
import { getExplorerLink } from "@solana-developers/helpers";
import { ValidDepthSizePair } from "@solana/spl-account-compression";
import { initializeUmi } from ".";

const umi = await initializeUmi();

export async function createAndInitializeTree(
  umi: Umi,
  maxDepthSizePair: ValidDepthSizePair,
) {
  try {
    const merkleTree = generateSigner(umi);
    const builder = await createTree(umi, {
      merkleTree,
      maxDepth: maxDepthSizePair.maxDepth, // Max depth of the tree,
      maxBufferSize: maxDepthSizePair.maxBufferSize, // Max buffer size,
      public: false, // Set to false to restrict minting to the tree creator/delegate
    });

    builder.sendAndConfirm(umi);

    const merkleTreeAddress = merkleTree.publicKey;

    const explorerLink = getExplorerLink(
      "transaction",
      merkleTreeAddress,
      "devnet",
    );

    console.log(`Transaction submitted: ${explorerLink}`);
    console.log("Tree Address:", merkleTreeAddress);
    console.log("Created Merkle Tree Successfully ✅");

    fs.appendFileSync(".env", `\nMERKLE_TREE_ADDRESS=${merkleTreeAddress}`);

    return merkleTreeAddress;
  } catch (error: any) {
    console.error("\nFailed to create merkle tree:", error, "❌");
    throw error;
  }
}
```

Then you now call `createAndInitializeTree` and provide small values for the max
depth and max buffer size.

```typescript
export const maxDepthSizePair: ValidDepthSizePair = {
  maxDepth: 14,
  maxBufferSize: 64,
};

export async function createAndInitializeTree(
  umi:Umi,
  maxDepthSizePair: ValidDepthSizePair) {
    ...
}

createAndInitializeTree(maxDepthSizePair);

```

To test, run the command in your terminal:

`npx esrun create-and-initialize-tree.ts`

Your output should look like this

```typescript

```

in the body of the createAndInitializeTree function we have a line of code

```typescript
fs.appendFileSync(".env", `\nMERKLE_TREE_ADDRESS=${merkleTreeAddress}`);
```

this creates a variable called `MERKLE_TREE_ADDRESS` and appends the
merkleTreeAddress we just initialized to our .env file so we do not need to
bother remembering the merkleTreeAddress, in subsequent steps, we just load our
merkleTreeAddress from the .env file.

#### 4. Mint cNFTs to your tree

Believe it or not, that’s all it takes to set up your tree to compressed NFTs!
Now let’s focus on the minting process.

First, let’s create a new file called `mint-compressed-nfts.ts` and declare a
function called `mintCompressedNftToCollection`. It will need the following
parameters:

- `payer` - a `Publickey` that will pay for transactions, fees, rent, etc.
- `collectionDetails` - the details of the collection as type
  `CollectionDetails` from `utils.ts`
- `amount` - the number of cNFTs to mint

The body of this function will do the following:

1. Create the cNFT metadata by calling `createNftMetadata` from our `utils.ts`
   file.
2. Create the mint instruction by calling `mintToCollectionV1` from the
   Bubblegum SDK.
3. Build and send a transaction with the mint instruction
4. Repeat steps 1-4 `amount` number of times

This is what it’ll look like:

```typescript
import dotenv from "dotenv";
import { mintToCollectionV1 } from "@metaplex-foundation/mpl-bubblegum";
import { CollectionDetails } from "@metaplex-foundation/mpl-token-metadata";
import {
  base58,
  Keypair,
  publicKey,
  PublicKey,
} from "@metaplex-foundation/umi";
import { getExplorerLink } from "@solana-developers/helpers";
import { createNftMetadata, getOrCreateCollectionNFT } from "./utils";
import { initializeUmi } from ".";
import { maxDepthSizePair } from "./create-and-initialize-tree";

const umi = await initializeUmi();

export async function mintCompressedNftToCollection(
  payer: Publickey,
  collectionDetails: CollectionDetails,
  amount: number,
) {
  if (!process.env.MERKLE_TREE_ADDRESS) {
    throw new Error("No MERKLE_TREE_ADDRESS found");
  }
  const treeAddress = process.env["MERKLE_TREE_ADDRESS"];
  const mintAddress = collectionDetails.mint;
  for (let i = 0; i < amount; i++) {
    const compressedNFTMetadata = createNftMetadata(payer, i, mintAddress);

    const { signature } = await mintToCollectionV1(umi, {
      leafOwner: payer.publicKey,
      merkleTree: publicKey(treeAddress),
      collectionMint: mintAddress,
      metadata: compressedNFTMetadata,
    }).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });

    const transactionSignature = base58.deserialize(signature);
    try {
      const explorerLink = getExplorerLink(
        "transaction",
        transactionSignature[0],
        "devnet",
      );
      console.log(`Transaction submitted: ${explorerLink} '\n'`);
      console.log("Address:", transactionSignature[0]);
    } catch (err) {
      console.error("\nFailed to mint compressed NFT: '\n'", err);
      throw err;
    }
  }
}
```

Now let us mint cNFTs to our merkle tree. Simply update
`mint-compressed-nfts.ts` to call `getOrCreateCollectionNFT` then
`mintCompressedNftToCollection`:

```typescript
const collectionNft = await getOrCreateCollectionNFT(umi);

await mintCompressedNftToCollection(
  umi.identity.publicKey,
  collectionNft,
  2 ** maxDepthSizePair.maxDepth,
);
```

To run, in your terminal type: `npx esrun mint-compressed-nfts.ts`

Your output should look like this

```typescript

```

#### 5. Read existing cNFT data

Now that we've written code to mint cNFTs, let's see if we can actually fetch
their data. This is tricky because the onchain data is just the Merkle tree
account, the data from which can be used to verify existing information as
accurate but is useless in conveying what the information is.

Let’s start by creating a new file called `log-nft-details.ts` declaring a
function `logNftDetails` that takes a parameter `nftsMinted`.

Since theres no direct identifier of any kind that points to our cNFT, we need
to know the leaf index that was used when we minted our cNFT. We can then use
that to derive the asset ID used by the Read API and then use the Read API to
fetch our cNFT data.

In our case, we created a non-public tree and minted 8 cNFTs, so we know that
the leaf indexes used were 0-7. With this, we can use the `getLeafAssetId`
function from `@metaplex-foundation/mpl-bubblegum` to get the asset ID.

Finally, we can use an RPC that supports the
[Read API](https://solana.com/developers/guides/javascript/compressed-nfts) to
fetch the asset. We'll be using
[Helius](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api),
but feel free to choose your own RPC provider. To use Helius, you'll need to get
a free API Key from [the Helius website](https://dev.helius.xyz/). Then add your
`RPC_URL` to your `.env` file. For example:

```bash
## Add this
RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_API_KEY
```

Then simply call the getAsset method and pass the `assetId` as a parameter

```typescript
function logNftDetails(treeAddress: PublicKey, nftsMinted: number) {
  if (!process.env.RPC_URL) {
    throw new Error("RPC_URL environment variable is not defined.");
  }
  if (!process.env.MERKLE_TREE_ADDRESS) {
    throw new Error("No MERKLE_TREE_ADDRESS found");
  }
  for (let i = 0; i < nftsMinted; i++) {
    const assetId = await getLeafAssetId(treeAddress, new BN(i));
    console.log("Asset ID:", assetId);
    const umi = createUmi(process.env.RPC_URL).use(dasApi());
    const asset = await umi.rpc.getAsset(assetId);
    return asset;
  }
}
```

Helius monitors transaction logs in real time and stores the NFT metadata that
was hashed and stored in the Merkle tree. This enables them to display that data
when requested.

If you now call this function and re-run your script, the data we get back in
the console is very detailed. It includes all of the data you’d expect in both
the onchain and offchain portion of a traditional NFT. You can find the cNFT’s
attributes, files, ownership and creator information, and more.

```json
{
  "interface": "V1_NFT",
  "id": "48Bw561h1fGFK4JGPXnmksHp2fpniEL7hefEc6uLZPWN",
  "content": {
    "$schema": "https://schema.metaplex.com/nft1.0.json",
    "json_uri": "https://raw.githubusercontent.com/Unboxed-Software/rgb-png-generator/master/assets/183_89_78/183_89_78.json",
    "files": [
      {
        "uri": "https://raw.githubusercontent.com/Unboxed-Software/rgb-png-generator/master/assets/183_89_78/183_89_78.png",
        "cdn_uri": "https://cdn.helius-rpc.com/cdn-cgi/image//https://raw.githubusercontent.com/Unboxed-Software/rgb-png-generator/master/assets/183_89_78/183_89_78.png",
        "mime": "image/png"
      }
    ],
    "metadata": {
      "attributes": [
        {
          "value": "183",
          "trait_type": "R"
        },
        {
          "value": "89",
          "trait_type": "G"
        },
        {
          "value": "78",
          "trait_type": "B"
        }
      ],
      "description": "Random RGB Color",
      "name": "CNFT",
      "symbol": "CNFT"
    },
    "links": {
      "image": "https://raw.githubusercontent.com/Unboxed-Software/rgb-png-generator/master/assets/183_89_78/183_89_78.png"
    }
  },
  "authorities": [
    {
      "address": "DeogHav5T2UV1zf5XuH4DTwwE5fZZt7Z4evytUUtDtHd",
      "scopes": ["full"]
    }
  ],
  "compression": {
    "eligible": false,
    "compressed": true,
    "data_hash": "3RsXHMBDpUPojPLZuMyKgZ1kbhW81YSY3PYmPZhbAx8K",
    "creator_hash": "Di6ufEixhht76sxutC9528H7PaWuPz9hqTaCiQxoFdr",
    "asset_hash": "2TwWjQPdGc5oVripPRCazGBpAyC5Ar1cia8YKUERDepE",
    "tree": "7Ge8nhDv2FcmnpyfvuWPnawxquS6gSidum38oq91Q7vE",
    "seq": 8,
    "leaf_id": 7
  },
  "grouping": [
    {
      "group_key": "collection",
      "group_value": "9p2RqBUAadMznAFiBEawMJnKR9EkFV98wKgwAz8nxLmj"
    }
  ],
  "royalty": {
    "royalty_model": "creators",
    "target": null,
    "percent": 0,
    "basis_points": 0,
    "primary_sale_happened": false,
    "locked": false
  },
  "creators": [
    {
      "address": "HASk3AoTPAvC1KnXSo6Qm73zpkEtEhbmjLpXLgvyKBkR",
      "share": 100,
      "verified": false
    }
  ],
  "ownership": {
    "frozen": false,
    "delegated": false,
    "delegate": null,
    "ownership_model": "single",
    "owner": "HASk3AoTPAvC1KnXSo6Qm73zpkEtEhbmjLpXLgvyKBkR"
  },
  "supply": {
    "print_max_supply": 0,
    "print_current_supply": 0,
    "edition_nonce": 0
  },
  "mutable": false,
  "burnt": false
}
```

Remember, the Read API also includes ways to get multiple assets, query by
owner, creator, etc., and more. Be sure to look through the
[Helius docs](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api)
to see what's available.

#### 6. Transfer a cNFT

The last thing we’re going to add to our script is a cNFT transfer. To do this,
we are going to use the `transfer` method from the
`@metaplex-foundation/mpl-bubblegum` library.

Let's start by declaring a `transferNft` function that takes the following:

- `assetId` - a `PublicKey` object
- `sender` - a `Keypair` object so we can sign the transaction
- `receiver` - a `PublicKey` object representing the new owner

```typescript
dotenv.config();

const umi = await initializeUmi();

async function transferNft(
  assetId: PublicKey,
  sender: Keypair,
  receiver: PublicKey,
) {
  if (!process.env.RPC_URL) {
    throw new Error("RPC_URL environment variable is not defined.");
  }
  try {
    const assetWithProof = umi.rpc.getAssetWithProof(assetId);

    const { signature } = await transfer(umi, {
      ...assetWithProof,
      leafOwner: umi.identity.publicKey,
      newLeafOwner: receiver,
    }).sendAndConfirm(umi, { confirm: { commitment: "confirmed" } });
    const transactionSignature = base58.deserialize(signature);

    const explorerLink = getExplorerLink(
      "transaction",
      transactionSignature.toLocaleString(),
      "devnet",
    );

    console.log(`Transaction submitted: ${explorerLink}`);
  } catch (error: any) {
    console.error("\nFailed to transfer nft:", error);
    throw error;
  }
}

// Transfer first cNFT to random receiver to illustrate transfers
const receiver = Keypair.generate();

transferNft(
  await getLeafAssetId(publicKey(treeAddress), new BN(0)),
  wallet,
  publicKey(receiver.publicKey),
);
```

Lets transfer our first compressed NFT at index 0 to someone else. First we'll
need to spin up another wallet with some funds, then grab the assetID at index 0
using `getLeafAssetId`. Then we'll do the transfer. Finally, we'll print out the
entire collection using our function `logNftDetails`. You'll note that the NFT
at index zero will now belong to our new wallet in the `ownership` field.

```typescript
const collectionNft = await getOrCreateCollectionNFT(connection, wallet);

await mintCompressedNftToCollection(
  wallet,
  treeAddress,
  collectionNft,
  2 ** maxDepthSizePair.maxDepth,
);

const receiverWallet = await getOrCreateKeypair("Wallet2");
const assetId = await getLeafAssetId(treeAddress, new BN(0));
await airdropSolIfNeeded(receiverWallet.publicKey);

console.log(
  `Transferring ${assetId.toString()} from ${wallet.publicKey.toString()} to ${recieverWallet.publicKey.toString()}`,
);

await transferNft(assetId, wallet, recieverWallet.publicKey);

await logNftDetails(8);
```

Go ahead and run your script. Type the command The whole thing should execute
without failing, and all for close to 0.01 SOL!

Congratulations! Now you know how to mint, read, and transfer cNFTs. If you
wanted, you could update the max depth, max buffer size, and canopy depth to
larger values and as long as you have enough Devnet SOL, this script will let
you mint up to 10k cNFTs for a small fraction of what it would cost to mint 10k
traditional NFTs.

<Callout type="note">If you plan to mint a large amount of NFTs you might want
to try and batch these instructions for fewer total transactions.</Callout>

If you need more time with this lab, feel free to go through it again and/or
take a look at the solution code on the `solution` branch of the
[lab repo](https://github.com/solana-developers/solana-cnft-demo/tree/solution).

### Challenge

It’s your turn to apply these concepts on your own! We’re not going to give you
detailed instructions at this point, but here are some ideas:

1. Create your own production cNFT collection
2. Build a UI for this lesson's lab that will let you mint a cNFT and display it
3. See if you can replicate some of the lab script's functionality in an onchain
   program, i.e. write a program that can mint cNFTs

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=db156789-2400-4972-904f-40375582384a)!
</Callout>
