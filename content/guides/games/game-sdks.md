---
date: 2024-04-25T00:00:00Z
difficulty: intro
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

With Solana being a high performance blockchain with low fees and fast
transactions, a great game developer community has formed around it.

Here you can find details about the Solana game development SDKs available
within the ecosystem. All the SDKs, except [GameShift](#solana-game-shift), are
open source and community built. If you are working on a SDK yourself feel free
to open a PR to this page and add it.

## Unity SDK

The Unity game engine is known for its beginner friendly approach and cross
platform support including WebGL, iOS, and Android. Build once, export
everywhere.

- [Docs](https://docs.magicblock.gg/introduction)
- [Source](https://github.com/magicblock-labs/Solana.Unity-SDK)
- [Verified Unity Asset Store Listing](https://assetstore.unity.com/packages/decentralization/infrastructure/solana-sdk-for-unity-246931)
- [Example Games](https://github.com/solana-developers/solana-game-examples)
- [Tic Tac Toe](https://blog.magicblock.gg/bolt-tic-tac-toe/)

The Solana Unity SDK is maintained by [Magicblock](https://www.magicblock.gg/)
and comes with:

- NFT support
- Candy machine integration
- Transactions
- RPC functions
- Phantom deep links
- WebGL connector
- Reliable WebSocket connection support
- Mobile wallet-adapter
- Sessions keys for auto approving transaction
- Anchor client code generation and more.

## Godot SDK

The [Godot Engine](https://godotengine.org/) is an open source game engine which
gained lots of support in the last few years. The Solana SDK for Godot is
maintained by [ZenRepublic](https://twitter.com/ZenRepublicNDM) and
[Virus-Axel](https://twitter.com/AxelBenjam). It comes with a wallet adapter
integration, transactions, RPC functions, and Anchor client code generation.
Even a fully functional Metaplex
[candy machine integration](https://zenwiki.gitbook.io/solana-godot-sdk-docs/guides/setup-candy-machine).

- [Solana Godot Engine SDK](https://github.com/Virus-Axel/godot-solana-sdk)
- [Docs](https://zenwiki.gitbook.io/solana-godot-sdk-docs)
- [Demo](https://github.com/ZenRepublic/GodotSolanaSDKDemoPackage)
- [Tutorial](https://www.youtube.com/watch?v=tszFPInYmXQ)
- [Maintainer](https://twitter.com/ZenRepublicNDM)

## Solana GameShift

Solana GameShift is an API solution, developed by
[Solana Labs](https://solanalabs.com), to integrate Solana into your game,
including the ability to easily mint and change assets. It also supports USDC
on-ramps and in-game marketplaces. You can onboard your players without creating
or managing blockchain key phrases and easily let them pay with credit card
payments.

- [Solana GameShift](https://gameshift.solanalabs.com/)
- [Docs](https://docs.gameshift.dev/)
- [Example Game Live](https://solplay.de/cubeshift)
- [Example Game Source](https://github.com/solana-developers/cube_shift)
- [Example Game Dev log](https://www.youtube.com/watch?v=hTCPXVn14TY)

## Turbo.Computer - Rust Game Engine

Turbo is a rust game engine written from the ground up to focus on Solana, with
a lightweight architecture and fast iteration times. It is beginner friendly and
comes with full Solana RPC support. You can even use its AI tools to generate
complete games.

- [Website](https://turbo.computer/)
- [Docs](https://turbo.computer/docs/intro)
- [Twitter account](https://twitter.com/makegamesfast)
- [Maintainer](https://twitter.com/jozanza)

# Honeycomb Protocol

Honeycomb provides a suite of onchain programs and state-compression tools that
handle all crucial game lifecycle functions and composability within the Solana
Virtual Machine (SVM). It supports lots of NFT functionality like staking,
missions, loot boxes, player profiles, state compression, auto approving
transactions and more.

- [Twitter account](https://twitter.com/honeycomb_prtcl)
- [Docs](https://docs.honeycombprotocol.com/)

# Unreal SDKs

Unreal Engine is known for its great visuals and node based scripting framework.
There are multiple Solana SDKs maintained by different companies.

### Bitfrost Unreal SDK

Bitfrost is working on an Unreal SDK which was already used in multiple games
built during recent Solana game jams. It comes with C# `solnet` support in C++
and Blueprints, minting of metaplex NFTs, payment processor examples in game
wallet and more.

- [Solana Unreal SDK by Bitfrost](https://github.com/Bifrost-Technologies/Solana-Unreal-SDK)
- [Tutorial](https://www.youtube.com/watch?v=S8fm8mFeUkk)
- [Maintainer](https://twitter.com/BifrostTitan)

### Thugz Unreal SDK

Thugz is a game studio and NFT project which is also maintaining on open source
a Unreal SDK for Solana. It comes with lots of NFT focused functionality and has
already released the plugin in the Unreal marketplace.

- [Thugz Unreal plugin](https://www.unrealengine.com/marketplace/en-US/product/thugz-blockchain-plugin)
- [Repository](https://github.com/ThugzLabs/Thugz-BC-Plugin-Packaged-for-UE5.0)
- [Video Tutorial](https://www.youtube.com/watch?v=dS7sTZd_E9U&ab_channel=ThugzNFT)

### Star Atlas Foundation Kit

The [Star Atlas](https://staratlas.com/) team open sourced some of their SDK
stack called _Foundation Kit_. It is not actively maintained but can be a
starting point for your project.

- [Star Atlas Unreal SDK](https://github.com/staratlasmeta/FoundationKit)
- [Tutorial](https://www.youtube.com/watch?v=S8fm8mFeUkk)

## Next.js/React + Anchor

One of the easiest way to build on Solana is using the Web3js JavaScript
framework in combination with the Solana Anchor framework. For more complex
games, we recommend looking into using a Game Engine like [Unity](#unity-sdk) or
[Unreal](#unreal-sdks) though.

The fastest way to set it up a Next.js based game:

```shell
npx create-solana-game your-game-name
```

This will generate a great starting application with `wallet-adapter` support,
an Anchor program, a React app, and a Unity client already configured to work
together. A benefit of using Next.js is that you can use the same code in the
backend and in the frontend, speeding up development.

- [Web3.js](/docs/clients/javascript.md)
- [Video Tutorial](https://www.youtube.com/watch?v=fnhivg_pemI&t=1s&ab_channel=Solana)

> If you are working on a Solana SDK and want to add your preset to the preset
> you can open a PR here:
> [Solana games preset](https://github.com/solana-developers/solana-game-preset)

## Phaser

A fast, free, and fun open source framework for Canvas and WebGL powered browser
based games. [Phaser](https://phaser.io/) is a great way to get started with
game development on Solana. The Phaser Solana Platformer Template is a great
starting point for your game.

- [Source Code](https://github.com/Bread-Heads-NFT/phaser-solana-platformer-template)
- [Maintainer](https://twitter.com/blockiosaurus)

## Flutter

Flutter is an open source framework, maintained by Google, for building
beautiful, natively compiled, multi-platform applications from a single
codebase. The Solana Flutter SDK is maintained by the
[Espresso Cash](https://www.espressocash.com/) team.

- [Source Code](https://github.com/espresso-cash/espresso-cash-public)

## Python

Python is an easy to learn programming and widely used language (often used in
machine learning applications). The Seahorse framework enables developers to
write Solana programs in Python. Seahorse is built on top of the Anchor
framework and converts Python code into Anchor based rust code. Seahorse is
currently in beta.

- [Documentation](https://www.seahorse.dev/)
- [Github Repo](https://github.com/solana-developers/seahorse)
- [Anchor Playground Example](https://beta.solpg.io/tutorials/hello-seahorse)

## Native C#

The original port of Web3js to C#. It comes with a bunch of functionality like
transactions, RPC functions and Anchor client code generation.

- [Source and Docs](https://github.com/bmresearch/Solnet/blob/master/docs/articles/getting_started.md)
