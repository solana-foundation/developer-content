---
date: 2024-04-25T00:00:00Z
difficulty: intro
title: Using NFTs and Digital Assets in Games
description:
  NFTs can be a powerful tool in blockchain games. Learn how to utilize NFTs in
  Solana games to their full potential.
tags:
  - games
  - anchor
  - program
  - web3js
  - token extensions
  - token 2022
  - nfts
keywords:
  - tutorial
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - anchor
  - games
  - example
  - nfts
  - metadata
---

Non-fungible tokens (NFTs) are rapidly gaining popularity as a means of
integrating Solana into games. These unique digital assets are stored on the
Solana blockchain and come with a JSON metadata attached to them. This metadata
allows developers to store important attributes and information about a specific
asset, such as its rarity or specific in-game capabilities.

NFTs can be used in games to represent anything from weapons and armor to
digital real estate and collectibles, providing a new level of ownership and
scarcity for players. Furthermore NFTs can be representing land, houses,
achievements or even characters in a game. The possibilities are endless.

## Using Solana GameShift to create NFTs

Solana GameShift is a gaming API product build by
[Solana Labs](https://solanalabs.com/) which lets you easily create NFTs and
other assets for your game. GameShift offers these features:

- A simple API to create NFTs
- Buying assets via USD onramp
- In game market place
- Updating metadata of NFTs

- [Docs](https://docs.gameshift.dev/)
- [Example Game Live](https://solplay.de/cubeshift)
- [Example Game Source](https://github.com/solana-developers/cube_shift)
- [Example Game dev log](https://www.youtube.com/watch?v=hTCPXVn14TY)

## Token gating with NFTs

Using NFTs, you can conditionally gate access to a particular part of a game
based on owning the NFT. This can form a more tight-knit community within your
game. In [JavaScript](/docs/clients/javascript.md) using the
[Metaplex SDK](https://github.com/metaplex-foundation/js#readme) this would look
like this:

```js
JSON.parse(
  // For example '~/.config/solana/devnet.json'
  fs.readFileSync("yourKeyPair.json").toString())
);
let keyPair = Keypair.fromSecretKey(decodedKey);

const metaplex = Metaplex.make(connection).use(keypairIdentity(keyPair));

const nfts = await metaplex
  .nfts()
  .findAllByOwner({ owner: wallet.publicKey })

let collectionNfts = []
for (let i = 0; i < nfts.length; i++) {
  if (nfts[i].collection?.address.toString() == collectionAddress.toString()) {
    collectionNfts.push(nfts[i])
  }
}
```

Another performant way to load NFTs is the
[DAS asset API](https://docs.helius.dev/compression-and-das-api/digital-asset-standard-das-api).
You can see an example of this in the Solana games preset in the JavaScript
client via this
[Code Example](https://github.com/solana-developers/solana-game-preset/blob/main/app/components/DisplayNfts.tsx)
or generating a full game scaffold with the following command:

```bash
npx create-solana-game your-game-name
```

## Bonus effects with NFTs

In addition to providing new revenue streams, NFTs can also be used to provide
in-game benefits and bonuses to players. For instance, a player who owns a "coin
doubler" NFT may receive double the amount of coins for as long as they hold the
NFT in their wallet.

NFTs could be used as in-game consumables, allowing players to use them a set
number of times to gain temporary effects (such as potions or spells). Once
fully consumed, the NFT is burned, and the effect is applied to the player's
character.

These innovative features of NFTs provide game developers with new opportunities
to create unique gameplay experiences and reward players for their ownership of
valuable assets on the Solana blockchain.

> You can follow this developer guide on
> [how to interact with tokens](/content/guides/games/interact-with-tokens.md)
> within a on-chain Solana game.

In the example game, Seven Seas, the program uses 3 different digital assets,
both fungible and non-fungible assets:

- "pirate coins" (fungible tokens) which are used to upgrade ships
- "rum" (fungible tokens) which increases the health of ships
- "cannons" (NFTs) which increase ships damage dealt in battles

> You can find the source code
> [source code](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas)
> and a detailed
> [eight hour video course](https://www.youtube.com/playlist?list=PLilwLeBwGuK6NsYMPP_BlVkeQgff0NwvU)
> for the Seven Seas game here.

You can also use
[dynamic metadata](/content/guides/games/interact-with-tokens.md) (using Token
Extensions) to save character level and experience or items in an NFT. This
could allow the NFTs in your game to become more valuable the more the players
play with them.

You can also do this with Metaplex's new
[Core NFT standard](https://developers.metaplex.com/core).

## Using NFT metadata for player stats

NFTs also have metadata which can be used for all kind of traits for game
objects. For example, an NFT could represent a game character and their traits
(Strength, Intelligence, Agility, etc) could directly influence how strong the
character is in the game. You can load NFT metadata and their attributes using
the Metaplex SDK:

```js
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";

JSON.parse(
  // For example '.config/solana/devnet.json'
  fs.readFileSync("yourKeyPair.json").toString())
);
let keyPair = Keypair.fromSecretKey(decodedKey);

const metaplex = Metaplex.make(connection).use(keypairIdentity(keyPair));
const nfts = await metaplex.nfts().findAllByOwner({owner: keyPair.publicKey});

const physicalDamage = 5;
const magicalDamage = 5;

nfts.forEach(async nft => {
  const metaData = await metaplex.nfts().load({metadata: nft});

    metaData.json.attributes.forEach(async attribute => {
      if (attribute.trait_type == "Strength") {
        physicalDamage += parseInt(attribute.value)
      }
      if (attribute.trait_type == "Int") {
        magicalDamage += parseInt(attribute.value)
      }
    });
})

console.log("Player Physical Damage: " + physicalDamage)
console.log("Player Magical Damage: " + magicalDamage)
```

## Use NFTs to save a game state

You can also use the mint of an NFT to
[derive a PDA](/docs/core/pda.md#how-to-derive-a-pda) and use it to save the
game state of a player. This could allow you to save any game state of a player
directly in an NFT which the player can take with them (including selling it
allowing you to collect royalties). You can see an example of how that can be
done in the [Solana 2048 game](https://github.com/solana-developers/solana-2048)
and the following code snippet:

```rust
#[account(
    init,
    payer = signer,
    space = 800,
    seeds = [b"player".as_ref(), nftMint.key().as_ref()],
    bump,
)]
pub player: Account<'info, PlayerData>,
```

## Fusing NFTs together

The
[Metaplex Fusion Trifle program](https://docs.metaplex.com/programs/fusion/overview)
allows NFTs to own other NFTs.

As an example, you could create a plant plot NFT and then use to combine it with
a water NFT and a seed NFT to create a Tomato NFT.

## Use 3D NFTs in a game

Every NFT metadata can also have an "animation url". This url can contain a
video, GIF or a 3D file. These 3D files usually use the format `.glb` or `.gltf`
and can dynamically be loaded into a game.

For Unity, you can use the [GLTFast](https://github.com/atteneder/glTFast)
package. In JavaScript, the
[GLTFast JS](https://discoverthreejs.com/book/first-steps/load-models/).

The following is an example code snippet that loads an
[NFT's metadata with glb model](https://solscan.io/token/DzHPvbGzrHK4UcyeDurw2nuBFKNvt4Kb7K8Bx9dtsfn#metadata)
in it:

```c#
var gltf = gameObject.AddComponent<GLTFast.GltfAsset>();
gltf.url = nft.metadata.animationUrl;
```

```js
npm install --save-dev gltf-loader-ts

import { GltfLoader } from 'gltf-loader-ts';

let loader = new GltfLoader();
let uri = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxTextured/glTF/BoxTextured.gltf';
let asset: Asset = await loader.load(uri);
let gltf: GlTf = asset.gltf;
console.log(gltf);
// -> {asset: {…}, scene: 0, scenes: Array(1), nodes: Array(2), meshes: Array(1), …}

let data = await asset.accessorData(0); // fetches BoxTextured0.bin
let image: Image = await asset.imageData.get(0) // fetches CesiumLogoFlat.png
```

## Customize NFTs with items and traits with Raindrops Boots

With the [Raindrops Boots program](https://docs.raindrops.xyz/services/boots)
you can have an adventure character which owns a sword and a helmet. When the
Character NFT would be sold on a market place the other NFTs it owns would be
sold as well.

## How to create NFTs in a program and add additional metadata

With the new
[Token Extensions](/content/guides/token-extensions/getting-started.md), it is
possible to create NFTs in a program and add additional dynamic on-chain traits
that can be saved in the NFT's mint account itself.

For example, you could save the experience and player level in the NFT itself.
These NFTs could become more valuable the more the players play with them. A
player 99 character maybe more desirable than a level 1 character.

You can find more resources on working with this type of on-chain metadata with
the following links:

- [Guide](/content/guides/token-extensions/metadata-pointer.md)
- [Repository](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/nft-meta-data-pointer/anchor)
- [Video](https://www.youtube.com/watch?v=n-ym1utpzhk&ab_channel=Solana)

## How to create an NFT collection

NFTs on Solana commonly follow the Metaplex standard's for collections. Metaplex
is a company that takes care of the most-used NFT standard on Solana. The most
common way to create an NFT collection is to create a Metaplex
"[Candy Machine](https://docs.metaplex.com/programs/candy-machine/how-to-guides/my-first-candy-machine-part1)"
which lets the user mint predefined pairs of metadata and images.

You can find more information on working with Metaplex collections in the
[Metaplex community guides](https://developers.metaplex.com/community-guides).

While Metaplex is common, is popular, there are many more NFT standards on
Solana:

- spNFTs
- WNS
- Core
- SPL-22
- SPL-404
- nifty

## NFT staking and missions

You can allow players to stake NFTs (time lock) to create in-game currency or
send NFTs on missions to give the players rewards. The
[Honeycomb Protocol](https://docs.honeycombprotocol.com/) offers this type of
functionality and more.
