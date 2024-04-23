---
title: Learn By Example
description: A list of open source games and examples on Solana with tutorials to get you started.
---

# Open source Solana games to reference for learning


## Solana games preset

A simple npx command that sets up a new Solana game project with a Unity client, Anchor program and a Next.js frontend. Supported features are: 
- Wallet adapter
- Anchor program
- Unity client
- Next.js frontend
- Rename all mentions of the project to your game name
- NFT and compressed NFT support 
- [Session keys](https://docs.magicblock.gg/Onboarding/Session%20Keys/how-do-session-keys-work) for auto approving transactions 

```bash
npx create-solana-game your-game-name
```

[Video](https://www.youtube.com/watch?v=fnhivg_pemI)<br />
[Source](https://github.com/solana-developers/solana_game_preset)


## Interact with Anchor Program from Unity

Tiny adventure is a simple example moving a player left and right on chain using Anchor framework and Unity SDK. 

[Tutorial Guide](/developers/guides/games/hello-world.md)<br />
[Video](https://www.youtube.com/watch?v=_vQ3bSs3svs)<br />
[Live Version](https://solplay.de/TinyAdventure/index.html)<br />
[Playground](https://beta.solpg.io/tutorials/tiny-adventure)<br />
[Unity Client](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas/unity/Assets/SolPlay/Examples/TinyAdventure)


## Saving Sol in a PDA

Learn how to save sol in a PDA seed vault and send it back to a player. Backend is written in Anchor and the frontend is using the Unity SDK. 

[Tutorial Guide](/developers/guides/games/store-sol-in-pda.md)<br />
[Video](https://www.youtube.com/watch?v=gILXyWvXu7M)<br />
[Live Version](https://solplay.de/TinyAdventureTwo/index.html)<br />
[Source](https://beta.solpg.io/tutorials/tiny-adventure-two)


## Use Solana Pay Qr codes to control a game

Solana pay transaction requests can not only be used for payments but for signing any transactions on a phone wallet or a link. This can also be used for games. 
Tug of war is a multiplayer game where an account is changed via Solana Pay qr codes which can be player with many people on a big screen. Backend Anchor and the frontend is Js React and Next13. The rewards will be payed out to the team that manages to pull completely to one side.

[Tutorial](https://www.youtube.com/watch?v=_XBvEHwSqJc&ab_channel=SolPlay)<br />
[Live version dev net](https://tug-of-war-solana-pay.vercel.app/?network=devnet)<br />
[Source](https://github.com/Solana-Workshops/tug-of-war-solana-pay)


## Hide game state from other players

Hiding data on chain is difficult because all account and data on Solana is public and can be red by anyone. There are some solutions to the problem though. 

### Light protocol 

Light protocol is a Zk layer solution on solana that lets you 

[Source](https://github.com/Lightprotocol/light-protocol)<br />
[Website](https://lightprotocol.com/)

### Race Protocol 

Race protocol is building an on chain poker game and have two solutions for hiding data. One is server based and one relies on players sending encrypted data to each other. They also offer a service solution. 

[Source](https://github.com/RACE-Game)

### Stone paper scissors

A game where on chain data is hidden by saving a hash in the client until reveal. SPL Tokens as price for the winner.

[Source](https://github.com/kevinrodriguez-io/bonk-paper-scissors)

### Tilted Fish Games

Another example submitted for grizzlython which encrypts entries and send it to the next player with an additional encryption:

[Source](https://github.com/solanaGames)


## How to build a round based multiplayer game

A simple multiplayer tic tac toe game written in Anchor

[Tutorial](https://book.anchor-lang.com/anchor_in_depth/milestone_project_tic-tac-toe.html)<br />
[Source](https://github.com/coral-xyz/anchor-book/tree/master/programs/tic-tac-toe)


## On Chain Chess

Complete on chain playable chess game written in Anchor with a 3D Unity implementation. Send someone a link to start a game.

[Source](https://github.com/magicblock-labs/Solana-Unity-Chess/)


## Multiplayer Game using voting system
Pokemon voting system
A game where collectively people vote on moves in a game boy game. Every move is recorded and each move can be minted as an NFTs.

[Live Version](https://solana.playspokemon.xyz/)<br />
[Source](https://github.com/nelsontky/web3-plays-pokemon)


## Entity component system examples

### Magic Block Bolt
Magic block Bolt is an on chain entity component system. Magic block is also working on an ephemeral rollup system for super fast transactions.

[Bolt](https://github.com/magicblock-labs/bolt)

### Arc Framework

Kyoudai Clash is an on chain realtime strategy game using the jump crypto [Arc framework](https://github.com/JumpCrypto/sol-arc) which is an on chain entity component system for Solana. 

[xNFT Version](https://www.xnft.gg/app/D2i3cz9juUPLwbpi8rV2XvAnB5nEe3f8fM5YUpgVprbT)<br />
[Source](https://github.com/spacemandev-git/dominari-arc)


## Adventure killing monsters and gaining xp

Lumia online was a hackathon submission and is a nice reference for a little adventure game.

[xNFT Version](https://www.xnft.gg/app/D2i3cz9juUPLwbpi8rV2XvAnB5nEe3f8fM5YUpgVprbT)<br />
[Source](https://github.com/spacemandev-git/dominari-arc)


## Real-time pvp on chain game

### Seven Seas 

Real-time Solana Battle Royal Game. Using Anchor program, UnitySDK, WebSocket account subscription. Players can spawn their ships represented as one of their NFTs on a grid and move around. If a player hits another player or chest he collect its Sol and some Pirate Coin SPL tokens. The grid is implemented as a two dimensional array where every tile saves the players wallet key and the NFT public key. There is also a QR code in the top right corner that triggers a Solana Pay transaction request which players can sign on their phones to let Chutuluh shoot at the closest ship. 

[Example](https://solplay.de/sevenseas)<br />
[Source](https://github.com/solana-developers/solana-game-examples/tree/main/seven-seas)<br />
[Eight Hour video boot camp](https://www.youtube.com/playlist?list=PLilwLeBwGuK6NsYMPP_BlVkeQgff0NwvU)

### Blob Wars On Chain strategy game ala Dark Forest

This example shows you how you can build a strategy game like Dark Forest or Tribal wars, but without the zk features. It is called blobs and every players spawn its home blob with a color that is derived from their public key. These blobs can then be used to attack other blobs and conquer them. Blob regenerate color for time, so there is lots of tactics involved on where to spawn blobs and how to combine attacks. 

[Source](https://github.com/Woody4618/colosseum_2024)


## Solana Civ

A civilization game where you can build cities, trade with other players and fight wars. Progress through the ages by unlocking new technologies, conquer lands and build a civilization that will stand the test of time. All open source and crowd build using the Solana community facilitating gib.work. 

[Source](https://github.com/proxycapital/solana-civ)<br />
[Website](https://solana-civ.com/)<br />
[Participate](gib.work)


## Tale of Kentridge

This is a game built with the Turbo game engine. [Turbo](https://turbo.computer/) is a from the ground up freshly written rust game engine which focuses on lightweight architecture and fast iteration times always with Solana in mind. It is beginner friendly and comes with full Solana RPC support. You can even use its AI tools to generate complete games. 

[Example game](https://github.com/super-turbo-society/turbo-demos/tree/main/solana-lumberjack)<br />
[Docs](https://turbo.computer/docs/intro/)


## Ancient Cave 

A game where you can explore a cave and find treasures. The game is written in Anchor and the frontend is a Unity client. You progress through a cave from level 0 to 100 to fight the ultimate enemy. Every time you die you start again from level 1. There are chests that offer items and resources and the items from blue chests can be kept for the next run. 
A special feature is that a floor can be owned by a certain player and when you pass that floor you either need to fight that player or pay a little fee to be able to pass.

[Dev net example](https://solplay.de/ancientcave/)<br />
[Source](https://github.com/Woody4618/speedrun2)


## On Chain City Builder example 

This example shows you how you can build an on chain city builder. The special feature is that it is a competitive but also coorperative city builder since all the resoruces are shared between the players, but depending if you build your building on the left or the right you either support the goblins or the humans. 

[Dev net example](https://solplay.de/humansandgoblins/)<br />
[Source](https://github.com/solana-developers/solana-game-examples/tree/main/city-builder)


## Rebirth rumble PVP Battler 

A 5 vs 5 PVP game where you can fight against other players. The game is written in Anchor and the frontend is a Unity client. You can choose between different characters and fight against other players. The game is still in development and was the winner of the second [Solana Speedrun](https://solanaspeedrun.com/).

[Source](https://github.com/kimo-do/Speedrun2)<br />
[xNFT version](https://www.xnft.gg/app/8iGi6rMEPbjTHofEwU8MNsy5MTPfhorj9QXCfH8dKBme)
 

## On chain matchmaking

A multiplayer match three game which uses NFT stats for the character stats in the game and has an interesting onchain matchmaking system.

[Live Version](https://deezquest.vercel.app/)<br />
[Source](https://github.com/val-samonte/deezquest)

