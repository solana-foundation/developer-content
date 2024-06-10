---
date: 2024-04-25T00:00:00Z
difficulty: intro
title: Solana Game Development Examples
description:
  A list of open source games and examples on Solana with tutorials to get you
  started.
tags:
  - games
  - anchor
  - program
  - react
  - web3js
  - unity
  - rust
keywords:
  - tutorial
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - anchor
  - games
  - example
---

[Solana Game Examples](https://github.com/solana-developers/solana-game-examples)
includes many open source game examples and tools for game development. Looking
at these examples and seeing how certain features are implemented can vastly
improve your development speed. If you have other example games feel free to
[submit a PR](https://github.com/solana-developers/solana-game-examples/pulls).

## Using create-solana-game

A simple npx command that sets up a new Solana game project with a Unity client,
Anchor program and a Next.js frontend. Supported features are:

- Wallet adapter
- Anchor program
- Unity client
- Next.js frontend
- Renaming all mentions of the project to your own game's name
- NFT and compressed NFT support
- [Session keys](https://docs.magicblock.gg/Onboarding/Session%20Keys/how-do-session-keys-work)
  for auto approving transactions

With this command you can easily set up a new game with all these features
working and ready go:

```bash
npx create-solana-game your-game-name
```

Here you can learn how it works:

- [Video](https://www.youtube.com/watch?v=fnhivg_pemI)
- [Source and docs](https://github.com/solana-developers/solana-game-preset)

## Interacting with Anchor Programs from Unity

Tiny adventure is a simple example moving a player left and right onchain using
Anchor framework and Unity SDK.

- [Tutorial Guide](/content/guides/games/hello-world.md)
- [Video](https://www.youtube.com/watch?v=_vQ3bSs3svs)
- [Live Version](https://solplay.de/TinyAdventure/index.html)
- [Playground](https://beta.solpg.io/tutorials/tiny-adventure)
- [Unity Client](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas/unity/Assets/SolPlay/Examples/TinyAdventure)

## Saving SOL in a PDA

Learn how to save SOL in a PDA seed vault and send it back to a player. This
backend is written in Anchor and the frontend is using the Unity SDK.

- [Tutorial Guide](/content/guides/games/store-sol-in-pda.md)
- [Video](https://www.youtube.com/watch?v=gILXyWvXu7M)
- [Live Version](https://solplay.de/TinyAdventureTwo/index.html)
- [Source](https://beta.solpg.io/tutorials/tiny-adventure-two)

## Use Solana Pay QR codes to control a game

Solana Pay transaction requests can not only be used for payments but for
signing any transactions on a phone wallet or a link, including for games. Tug
of war is a multiplayer game which can be player with many people on a big
screen, using Solana Pay QR codes to pull the rope one way or the other, which
in turn changes data in an account. The rewards will be payed out to the team
that manages to the rope pull completely to one side. The backend is Anchor and
the frontend is React.js and Next.js 13.

- [Tutorial](https://www.youtube.com/watch?v=_XBvEHwSqJc&ab_channel=SolPlay)
- [Live version on devnet](https://tug-of-war-solana-pay.vercel.app/?network=devnet)
- [Source](https://github.com/Solana-Workshops/tug-of-war-solana-pay)

## How to build a round-based multiplayer game

A simple multiplayer tic tac toe game written in Anchor

- [Tutorial](https://book.anchor-lang.com/anchor_in_depth/milestone_project_tic-tac-toe.html)
- [Source](https://github.com/coral-xyz/anchor-book/tree/master/programs/tic-tac-toe)
- [Magic Block Bolt Tic Tac Toe](https://github.com/magicblock-labs/bolt-tic-tac-toe)

## Onchain Chess

Complete onchain playable chess game written in Anchor with a 3D Unity
implementation. Send someone a link to start a game.

[Source](https://github.com/magicblock-labs/Solana-Unity-Chess/)

## Multiplayer Game using voting system

A Pokemon-style game where people collectively vote on moves. Every move is
recorded and each move can be minted as an NFTs.

- [Live Version](https://solana.playspokemon.xyz/)
- [Source](https://github.com/nelsontky/web3-plays-pokemon)

## Entity component system examples

### MagicBlock Bolt

MagicBlock Bolt is an onchain entity component system. MagicBlock is also  
working on an ephemeral rollup system for super fast transactions.

[Bolt](https://github.com/magicblock-labs/bolt)

### Arc Framework

Kyoudai Clash is an on chain realtime strategy game using the Jump Crypto
[Arc framework](https://github.com/JumpCrypto/sol-arc) which is an onchain
entity component system for Solana (not maintained anymore).

- [xNFT Version](https://www.xnft.gg/app/D2i3cz9juUPLwbpi8rV2XvAnB5nEe3f8fM5YUpgVprbT)
- [Source](https://github.com/spacemandev-git/dominari-arc)

## Hide game state from other players

Hiding data on chain is difficult because all accounts, including data accounts,
are public and can be read by anyone. There are some solutions to the problem
though.

### Light protocol

Light protocol is a ZK layer solution on Solana that lets you built on Solana  
with ZK compression, a new primitive that enables the secure scaling of state
directly on the L1.

- [Source](https://github.com/Lightprotocol/light-protocol)
- [Website](https://lightprotocol.com/)

### Race Protocol

Race protocol is building an on chain poker game and have two solutions for  
hiding data. One is server-based and one relies on players sending encrypted  
data to each other.

[Source](https://github.com/RACE-Game)

### Stone paper scissors

A game where onchain data is hidden by saving a hash in the client until reveal.
SPL Tokens are given as prizes for the winner.

[Source](https://github.com/kevinrodriguez-io/bonk-paper-scissors)

### Tilted Fish Games

Another example submitted for the Grizzlython hackathon, which encrypts entries
and sends them to the next player with an additional encryption:

[Source](https://github.com/solanaGames)

## Adventure killing monsters and gaining xp

Lumia online was a hackathon submission and is a nice reference for a little
adventure game.

- [xNFT Version](https://www.xnft.gg/app/D2i3cz9juUPLwbpi8rV2XvAnB5nEe3f8fM5YUpgVprbT)
- [Source](https://github.com/spacemandev-git/dominari-arc)

## Real-time pvp onchain game

### Solana Civ

A Civilization-style game where you can build cities, trade with other players
and fight wars. Progress through the ages by unlocking new technologies, conquer
lands and build a civilization that will stand the test of time. All open source
and crowd-built by the Solana community, through gib.work.

- [Source](https://github.com/proxycapital/solana-civ)
- [Website](https://solana-civ.com/)
- [Participate](gib.work)

### Seven Seas

Seven Seas is a real-time Solana Battle Royale game. Using an Anchor program,
the UnitySDK, and WebSocket account subscriptions. Players can spawn their ships
represented as NFTs on a grid and move around. If a player hits another player
or chest he collect its SOL and some Pirate Coin SPL tokens. The grid is
implemented as a two dimensional array where every tile saves the players wallet
key and the NFT public key. There is also a QR code in the top left corner that
triggers a Solana Pay transaction request, which players can sign on their
phones, to let Cthulhu shoot at the closest ship.

- [Example](https://solplay.de/sevenseas)
- [Source](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas)
- [Eight Hour video boot camp](https://www.youtube.com/playlist?list=PLilwLeBwGuK6NsYMPP_BlVkeQgff0NwvU)

### Blob Wars onchain strategy game ala Dark Forest

Blob Wars shows you how you can build a strategy game like Dark Forest or Tribal
Wars, but without the ZK features. Every player spawns their home blob with a
color that is derived from their public key. These blobs can then be used to
attack other blobs and conquer them. Blobs regenerate color over time, so there
are lots of tactics involved on where to spawn blobs and how to combine attacks.

[Source](https://github.com/Woody4618/colosseum_2024)
[Demo Video](https://www.youtube.com/watch?v=XNHxqdd6pz8)

## Tale of Kentridge

This is a game built with the Turbo game engine.
[Turbo](https://turbo.computer/) is a from the ground up freshly written Rust
game engine which focuses on lightweight architecture and fast iteration times
always with Solana in mind. It is beginner friendly and comes with full Solana
RPC support. You can even use its AI tools to generate complete games.

- [Example game](https://github.com/super-turbo-society/turbo-demos/tree/main/solana-lumberjack)
- [Docs](https://turbo.computer/docs/intro/)

## Roguelike game

A game where you can explore a cave and find treasures. The game is written in
Anchor and the frontend is a Unity client. You progress through a cave from
level 0 to 100 to fight the ultimate enemy. Every time you die you start again
from level 1. There are chests that offer items and resources and the items from
blue chests can be kept for the next run. A special feature is that a floor can
be owned by a certain player and when you pass that floor you either need to
fight that player or pay a little fee to be able to pass.

- [Devnet example](https://solplay.de/ancientcave/)
- [Source](https://github.com/Woody4618/speedrun2)

## On-chain city builder example

This example shows you how you can build an onchain city builder. The special
feature is that it is a competitive but also cooperative city builder since all
resources are shared between the players, but depending if you build your

buildings on the left or the right you either support the goblins or the humans.

- [Devnet example](https://solplay.de/humansandgoblins/)
- [Source](https://github.com/solana-developers/solana-game-examples/tree/main/city-builder)

## Rebirth rumble PVP battler

A 5 vs 5 PVP game where you can fight against other players. The game is written
in Anchor and the frontend is a Unity client. You can choose between different
characters and fight against other players. The game is still in development and
was the winner of the second [Solana Speedrun](https://solanaspeedrun.com/).

- [Source](https://github.com/kimo-do/Speedrun2)
- [xNFT version](https://www.xnft.gg/app/8iGi6rMEPbjTHofEwU8MNsy5MTPfhorj9QXCfH8dKBme)

## onchain matchmaking

A multiplayer match three game which uses NFT stats for the character stats in
the game and has an interesting onchain matchmaking system.

- [Live Version](https://deezquest.vercel.app/)
- [Source](https://github.com/val-samonte/deezquest)

## Game Dev Tutorial Videos

- [Building Games on Solana](https://www.youtube.com/watch?v=KT9anz_V9ns)
- [Eight hour bootcamp](https://www.youtube.com/watch?v=0P8JeL3TURU&t=1s)
- [Energy System](https://www.youtube.com/watch?v=YYQtRCXJBgs&t=3s)
- [Session Keys](https://www.youtube.com/watch?v=oKvWZoybv7Y)
- [Clockwork](https://www.youtube.com/watch?v=ax0Si3Vkvbo&t=252s)
- [Memory on Solana](https://www.youtube.com/watch?v=zs_yU0IuJxc)
- [Dynamic Metadata NFTs](https://www.youtube.com/watch?v=n-ym1utpzhk)
- [Advanced Topics](https://www.youtube.com/watch?v=jW8ep_bmaIw)
