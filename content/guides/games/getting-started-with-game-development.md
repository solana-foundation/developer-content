---
date: 2024-04-25T00:00:00Z
difficulty: intro
title: Getting started with game development on Solana
description:
  Learn how to build games on Solana. Solana is well built for web3 games of all
  genres utilizing speed, low fees, and more to create an amazing gaming
  experience
tags:
  - games
  - unity
  - quickstart
keywords:
  - tutorial
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - anchor
  - games
  - example
---

The gaming space in the Solana ecosystem is expanding rapidly. Integrating with
Solana can provide numerous benefits for games, such as enabling players to own
and trade their assets (via NFTs in games), building an open and composable
in-game economy (using various DeFi protocols), creating composable game
programs, and allowing players to compete for valuable assets.

Solana is nearly purpose-built for games. With its 400ms block time and
lightning-fast confirmations: it's a real-time database that is accessible for
all. It's especially perfect for genres like strategy games, city builders,
turn-based games, and more.

With extremely cheap transaction fees, smaller integrations using NFTs that
represent game items or achievements, or that use USDC micro payments for in
game items can be done easily. There are already many tools and SDKs available
to start building these types of on-chain interactions today, using many of the
game development frameworks that you know and love.

You can build your game in [JavaScript](/docs/clients/javascript.md) and Canvas,
[Phaser](https://github.com/Bread-Heads-NFT/phaser-solana-platformer-template),
[Turbo Rust](https://turbo.computer/), or use one of the Solana Game SDKs for
the three biggest game engines -
[UnitySDK](/content/guides/games/game-sdks.md#unity-sdk),
[UnrealSDK](https://github.com/staratlasmeta/FoundationKit), and
[Godot](https://github.com/Virus-Axel/godot-solana-sdk). Find a list of all
gaming SDKs here: [Game SDKs](/content/guides/games/game-sdks.md).

## What are the benefits of building games on Solana?

1. No user management: players can use their Solana wallet to authenticate
   themselves in the game.
2. No server costs: Solana is a decentralized network, so you don't need to pay
   for additional backed servers.
3. No running costs for your program. You can even
   [close the program](/content/guides/getstarted/solana-token-airdrop-and-faucets.md#6-reuse-devnet-sol)
   to get the SOL back.
4. The ability to reward players for great achievements or let them play against
   each other for assets with real value outside the game.
5. The ability to permissionlessly use all of the other programs deployed on
   Solana, like decentralized exchanges, NFT marketplaces, lending protocols,
   high score programs, loyalty/referral programs, and more.
6. The ability to write your own onchain programs. If some game functionality
   you want does not already exist, you can always
   [write and deploy](/docs/core/programs.md) your own custom onchain program.
7. Platform independent payments, for all browsers, Android/iOS, and any other
   platform - as long as the players can sign a transaction they can buy assets.
8. No 30% fee that Apple and Google take for in-app purchases by deploying
   directly to the
   [Saga dApp store](https://docs.solanamobile.com/dapp-publishing/intro).

## How to integrate Solana into your game?

1. Give players digital collectibles for in-game items or use them as
   characters. See [NFTs in games](/content/guides/games/nfts-in-games.md)
2. Use tokens for in-app purchases or micro-payments in the game. See
   [Using tokens in games](/content/guides/games/interact-with-tokens.md)
3. Use the player's wallet to authenticate them in the game using the
   [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter) framework
4. Run tournaments and pay out crypto rewards to your players.
5. Develop the game entirely on-chain to:
   - reward your players in every step they take
   - allow any game/app/device to connect with your game
   - enact governance for the game's future
   - ledger verifiable activity for anti-cheat systems

> See our [Solana games "Hello world"](/content/guides/games/hello-world.md) for
> a detailed guide on how to get started with building games on Solana.

## Game SDKs

With all these benefits, Solana is quickly becoming the go-to platform for game
developers. Get started today by first picking your favorite gaming SDK:

| Platform                                                                             | Language                            |
| ------------------------------------------------------------------------------------ | ----------------------------------- |
| [Unity SDK](/content/guides/games/game-sdks.md#unity-sdk)                            | C#                                  |
| [Godot SDK](/content/guides/games/game-sdks.md#godot-sdk)                            | GD script and C++                   |
| [Solana GameShift](/content/guides/games/game-sdks.md#solana-game-shift)             | RestAPI                             |
| [Turbo.Computer](/content/guides/games/game-sdks.md#turbo-computer-rust-game-engine) | Rust                                |
| [Honeycomb Protocol](/content/guides/games/game-sdks.md#honeycomb-protocol)          | Rust and JavaScript                 |
| [Unreal SDKs](/content/guides/games/game-sdks.md#unreal-sdks)                        | C++, C#, Blueprints                 |
| [Next js, React, Anchor](/content/guides/games/game-sdks.md#next-js-react-anchor)    | Rust/Anchor, JavaScript, C#, NextJS |
| [Flutter](/content/guides/games/game-sdks.md#flutter)                                | Dart                                |
| [Phaser](/content/guides/games/game-sdks.md#phaser)                                  | HTML5, JavaScript                   |
| [Python](/content/guides/games/game-sdks.md#python)                                  | Python                              |
| [Native C#](/content/guides/games/game-sdks.md#native-c)                             | C#                                  |

## Game Distribution

Distribution of your game depends highly on the platform you are using. With
Solana, there are [game SDKs](#game-sdks) you can build for iOS, Android, Web
and Native Windows or Mac. Using the Unity SDK you could even connect Nintendo
Switch or XBox to Solana theoretically. Many game companies are pivoting to a
mobile first approach because there are so many people with mobile phones in the
world. Mobile comes with its own complications though, so you should pick what
fits best to your game.

Solana has a distinct edge over other blockchain platforms due to its offering
of a crypto-native mobile phone from [Solana Mobile](https://solanamobile.com),
named Saga. The Android based [Saga phone](https://solanamobile.com/hardware)
comes equipped with an innovative dApps store that enables the distribution of
crypto games without the limitations imposed by conventional app stores,
including those from Google or Apple.

## Publishing Platforms

Platforms where you can host and/or publish your games:

| Platform                                                                                         | Description                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Fractal](https://www.fractal.is/)                                                               | A game publishing platform that supports Solana and Ethereum. They also have their own wallet and account handling and there is an SDK for high scores and tournaments.                                                                                                                                                                                                                             |
| [Solana mobile dApp Store](https://github.com/solana-mobile/dapp-publishing/blob/main/README.md) | The Solana alternative to Google Play and the Apple App Store. A crypto first variant of a dApp store, which is open source free for everyone to use. See([video walkthrough](https://youtu.be/IgeE1mg1aYk?si=fZmU1WNiW-kR3qFa))                                                                                                                                                                    |
| [Apple App Store](https://www.apple.com/de/app-store/)                                           | The Apple app store has a high reach and is trusted by its customers. The entrance barrier for crypto games is high though. The rules are very strict for everything that tries to circumvent the fees that Apple takes for in app purchases. A soon as an NFT provides benefits for the player for example Apple requires you for example to have them purchased via their in app purchase system. |
| [Google Play Store](https://play.google.com/store/games)                                         | Google is much more crypto friendly and games with NFTs and wallet deep links for example have had a track record of being approved for the official Play Store.                                                                                                                                                                                                                                    |
| [xNFT Backpack](https://www.backpack.app/)                                                       | Backpack is a Solana wallet which allows you to release apps as xNFTs. They appear in the user's wallet as soon as they purchase them as applications. The Unity SDK has a xNFT export and any other web app can be published as xNFT as well.                                                                                                                                                      |
| [Elixir Games](https://elixir.games/)                                                            | Elixir Games is a platform that focuses on blockchain-based games. They support a variety of blockchain technologies and offer a platform for developers to publish their games.                                                                                                                                                                                                                    |
| Self Hosting                                                                                     | Just host your game yourself. For example, using [Vercel](https://vercel.com/) which can be easily setup so that a new version get deployed as soon as you push to your repository. Other options are [GitHub pages](https://pages.github.com/) or [Google Firebase](https://firebase.google.com/docs/hosting) but there are many more.                                                             |

## Next Steps

If you would like to learn more about developing games on Solana, take a look at
these developer resources and guides:

- [Solana Gaming SDKs](/content/guides/games/game-sdks.md)
- [Hello world on-chain game](/content/guides/games/hello-world.md)
- [Learn by example](/content/guides/games/game-examples.md)
- [Energy System](/content/guides/games/energy-system.md)
- [NFTs in games](/content/guides/games/nfts-in-games.md)
- [Dynamic metadata NFTs](/content/guides/token-extensions/dynamic-meta-data-nft.md)
- [Token in games](/content/guides/games/interact-with-tokens.md)
