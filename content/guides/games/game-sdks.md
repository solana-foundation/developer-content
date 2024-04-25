---
date: Apr 25, 2024
difficulty: Intro
title: Solana Gaming SDKs
description:
  A list of Solana Gaming SDKs to get you started creating your first Solana
  Game
tags:
  - games
  - anchor
  - program
  - infrastructure
  - unity
keywords:
  - tutorial
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - anchor
  - games
  - example
---

Here you can find a list of all the Solana game development SKDs. Solana is a
high performance blockchain which is perfect for games. It has low fees, fast
transactions and a great game developer community. All the SDKs except Game
Shift are open source and community built. If you are working on a SDK yourself
feel free to open a pr to this page and add it.

## Unity SDK

The Unity game engine is known for its beginner friendly approach and cross
platform support including WebGL, ios and android. Build once export everywhere.
The Solana Unity SDK comes with

- NFT support
- Candy machine integration
- Transactions
- RPC functions
- Phantom Deep links
- WebGL connector
- Reliable WebSocket connection support
- Mobile wallet-adapter
- Sessions keys for auto approving transaction
- Anchor client code generation and more.

- [Docs](https://docs.magicblock.gg/introduction)
- [Source](https://github.com/magicblock-labs/Solana.Unity-SDK)
- [Verified Unity Asset Store Listing](https://assetstore.unity.com/packages/decentralization/infrastructure/solana-sdk-for-unity-246931)
- [Example Games](https://github.com/solana-developers/solana-game-examples)
- [Tic Tac Toe](https://blog.magicblock.gg/bolt-tic-tac-toe/)

## Godot SDK

The Godot engine is an open source game engine which gained lots of support in
the last years. [Godot Engine](https://godotengine.org/) is the official website
of the engine. The Solana SDK for Godot is maintained by
[ZenRepublic](https://twitter.com/ZenRepublicNDM) and
[Virus-Axel](https://twitter.com/AxelBenjam). It comes with a wallet adapter
integration, transactions, RPC functions and anchor client code generation. And
fully functional Metaplex
[candy machine integration](https://zenwiki.gitbook.io/solana-godot-sdk-docs/guides/setup-candy-machine).

- [Solana Godot Engine SDK](https://github.com/Virus-Axel/godot-solana-sdk)
- [Docs](https://zenwiki.gitbook.io/solana-godot-sdk-docs)
- [Demo](https://github.com/ZenRepublic/GodotSolanaSDKDemoPackage)
- [Tutorial](https://www.youtube.com/watch?v=tszFPInYmXQ)
- [Maintainer](https://twitter.com/ZenRepublicNDM)

## Solana Game Shift

Solana game shift is an API solution to integrate Solana into your game and mint
and change asset easily. It also supports USDC on ramps and in game market
place. You can onboard your player without creating key phrases and easily let
them pay with credit card payments.

- [Solana Game Shift](https://gameshift.solanalabs.com/)
- [Docs](https://docs.gameshift.dev/)
- [Example Game Live](https://solplay.de/cubeshift)
- [Example Game Source](https://github.com/solana-developers/cube_shift)
- [Example Game Dev log](https://www.youtube.com/watch?v=hTCPXVn14TY)

## Turbo.Computer - Rust Game Engine

Turbo is a from the ground up freshly written rust game engine which focuses on
lightweight architecture and fast iteration times always with Solana in mind. It
is beginner friendly and comes with full Solana RPC support. You can even use
its AI tools to generate complete games.

- [Website](https://turbo.computer/)
- [Docs](https://turbo.computer/docs/intro)
- [Twitter account](https://twitter.com/jozanza)
- [Maintainer](https://twitter.com/jozanza)

# Honeycomb Protocol

Honeycomb provides a suite of on-chain Programs and state-compression tools that
handle all crucial game lifecycle functions and composability with the SVM. It
supports lots of NFT functionality like staking, missions, loot boxes, player
profiles, state compression, auto approving transactions and more.

- [Maintainer](https://twitter.com/honeycomb_prtcl)
- [Docs](https://docs.honeycombprotocol.com/)

# Unreal SDKs

Unreal engine is known for its great visuals and node based scripting framework.
There are multiple Solana sdks maintained by different companies.

### Bitfrost Unreal SDK

Bitfrost is working on an Unreal SDK which was already used in multiple game jam
games. It comes with C# solnet support in C++ and Blueprints, minting of
metaplex NFTs, payment processor examples in game wallet and more.

- [Solana Unreal SDK by Bitfrost](https://github.com/Bifrost-Technologies/Solana-Unreal-SDK)
- [Tutorial](https://www.youtube.com/watch?v=S8fm8mFeUkk)
- [Maintainer](https://twitter.com/BifrostTitan)

### Thugs Unreal SDK

Thugs is a game studio and NFT projects which is also maintaining on open source
a Unreal SDK for Solana. It comes with lots of NFT functionality and has already
released the plubin in the Unreal marketplace.

- [Thugs Unreal plugin](https://www.unrealengine.com/marketplace/en-US/product/thugz-blockchain-plugin)
- [Repository](https://github.com/ThugzLabs/Thugz-BC-Plugin-Packaged-for-UE5.0)
- [Video Tutorial](https://www.youtube.com/watch?v=dS7sTZd_E9U&ab_channel=ThugzNFT)

### Star Atlas foundation kit

The Star Atlas team open sourced some of their SDK stack. It is not actively
maintained but can be a starting point for your project.

- [Star Atlas Unreal SDK](https://github.com/staratlasmeta/FoundationKit)
- [Tutorial](https://www.youtube.com/watch?v=S8fm8mFeUkk)

## Next.js/React + Anchor

One of the easiest way to build on Solana is using the Web3js Javascript
framework in combination with the Solana Anchor frameworks. For more complex
games I would recommend using a GameEngine like Unity or Unreal though. The
fastest way to set it up is:

```js
npx create-solana-game your-game-name
```

This will generate a great starting application with wallet-adapter support an
anchor program, a js react app and a unity client. It will also rename all
mentions of the project to your game name. A benefit of using Next.js is that
you can use the same code in the backend and in the frontend, speeding up
development.

- [Web3Js](https://solana.com/de/docs/clients/javascript-reference)
- [Video Tutorial](https://www.youtube.com/watch?v=fnhivg_pemI&t=1s&ab_channel=Solana)

If you are working on a Solana SDK and want to add your preset to the preset you
can open a PR here:
[Solana games preset](https://github.com/solana-developers/solana_game_preset)

## Phaser

A fast, free and fun open source framework for Canvas and WebGL powered browser
games. Phaser is a great way to get started with game development on Solana. The
Phaser Solana Platformer Template is a great starting point for your game.

- [Source Code](https://github.com/Bread-Heads-NFT/phaser-solana-platformer-template)
- [Maintainer](https://twitter.com/blockiosaurus)

## Flutter

Flutter is an open source framework by Google for building beautiful, natively
compiled, multi-platform applications from a single codebase.

[Source Code](https://github.com/espresso-cash/espresso-cash-public)

## Python

Python is an easy to learn programming language which is often used in AI
programming. There is a framework called Seahorse which lets you build smart
contracts in Python. Seahorse is built on top of the Solana Anchor framework. It
converts Python code into Rust which Anchor can then use. Seahorse is currently
in beta.

- [Anchor Playground Example](https://beta.solpg.io/tutorials/hello-seahorse)
- [Github Repo](https://github.com/solana-developers/seahorse)
- [Documentation](https://www.seahorse.dev/)

## Native C#

The original port of Web3js to C#. It comes with a bunch of functionality like
transactions, RPC functions and anchor client code generation.

[Source and Docs](https://github.com/bmresearch/Solnet/blob/master/docs/articles/getting_started.md)
