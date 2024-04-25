---
title: Getting started with game development on Solana
description:
  Learn how to build games on Solana. Solana is well built for web3 games of all
  genres utilizing speed, low fees, and more to create an amazing gaming
  experience
---

The gaming space in the Solana ecosystem is expanding rapidly. Integrating with
Solana can provide numerous benefits for games, such as enabling players to own
and trade their assets via NFTs in games, building a open and composable in-game
economy, creating composable game programs, and allowing players to compete for
valuable assets.

Solana is purpose-built for games, with its 400ms block time and lightning-fast
confirmations making it a real-time database that's free for all. It's perfect
for genres like strategy games, city builders, turn-based games, and more.

However, not everything needs to be put on the blockchain. Smaller integrations
using NFTs that represent game items or achievements or use USDC micro payments
for in game items, for example, can be easily done. Transaction fees are
extremely cheap, and there are many tools and SDKs available to start building
today. You can build your game in
[Javascript](https://docs.solana.com/de/developing/clients/javascript-api) and
Canvas,
[Phaser](https://github.com/Bread-Heads-NFT/phaser-solana-platformer-template),
[Turbo Rust](https://turbo.computer/), or use one of the Solana Game SDKs for
the three biggest game engines -
[UnitySDK](/developers/guides/games/game-sdks#unity-sdk),
[UnrealSDK](https://github.com/staratlasmeta/FoundationKit), and
[Godot](https://github.com/Virus-Axel/godot-solana-sdk). Find a list of all
gaming SDKs here: [Game SDKs](/developers/guides/games/game-sdks.md).

## What are the benefits of building games on Solana?

1. No user management: Players can use their Solana wallet to authenticate
   themselves in the game.
2. No server costs: Solana is a decentralized network, so you don't need to pay
   for servers.
3. Deploy once and have no running costs for your program. You can even close
   the program to get the sol back.
4. Reward players for great achievements or let them play against each other for
   valuable assets
5. Permissionlessly use all of the other programs deployed on Solana, like
   decentralized exchanges, NFT marketplaces, lending protocols, highscore
   program, loyalty or referral program and more.
6. A globally plattform independant payment plattform, not matter if browser,
   android/ios or any other platform as long as the players can sign a
   transaction they can buy assets.
7. Save the 30% fee that Apple and Google take for in app purchases by deploying
   directly to the
   [Saga DAPP store](https://docs.solanamobile.com/dapp-publishing/intro).

## There are several ways to integrate Solana into your game:

1. Give players digital collectibles for in-game items or use them as
   characters. Check out [Nfts in games](/developers/guides/games/nfts-in-games)
2. Use tokens for in-app purchases or micro-payments in the game. See
   [use tokens](/developers/guides/games/interact-with-tokens)
3. Use the player's wallet to authenticate them in the game.
   [Solana Wallet Adapter](https://github.com/anza-xyz/wallet-adapter)
4. Run tournaments and pay out crypto rewards to your players.
5. Develop the game entirely on-chain to:
   1. Reward your players in every step they take. Start with
      [Hello world](/developers/guides/games/hello-world.md).
   2. Allow any game/app/device to connect with your game.
   3. Enact governance for the game's future.
   4. Ledger verifiable activity for anti-cheat systems.

With all these benefits, Solana is quickly becoming the go-to platform for game
developers. Get started today by first picking your favorite gaming SDK:

## Game SDKs

| Platform                                                                             | Language                    |
| ------------------------------------------------------------------------------------ | --------------------------- |
| [Unity SDK](/developers/guides/games/game-sdks#unity-sdk)                            | C#                          |
| [Godot SDK](/developers/guides/games/game-sdks#godot-sdk)                            | GD script and C++           |
| [Solana Game Shift](/developers/guides/games/game-sdks#solana-game-shift)            | RestAPI                     |
| [Turbo.Computer](/developers/guides/games/game-sdks#turbo-computer-rust-game-engine) | Rust                        |
| [Honeycomb Protocol](/developers/guides/games/game-sdks#honeycomb-protocol)          | Rust + JS                   |
| [Unreal SDKs](/developers/guides/games/game-sdks#unreal-sdks)                        | C++, C#, Blueprints         |
| [Next js, react, anchor](/developers/guides/games/game-sdks#next-js-react-anchor)    | Rust/Anchor, js, C#, NextJS |
| [Flutter](/developers/guides/games/game-sdks#flutter)                                | Js                          |
| [Phaser](/developers/guides/games/game-sdks#phaser)                                  | HTML5, Js                   |
| [Python](/developers/guides/games/game-sdks#python)                                  | Python                      |
| [Native C#](/developers/guides/games/game-sdks#native-c)                             | C#                          |

## Game Distribution

Distribution of your game depends highly on the platform you are using. With
Solana, there are game SDKs you can build for IOS, Android, Web and Native
Windows or Mac. Using the Unity SDK you could even connect Nintendo Switch or
XBox to Solana theoretically. Many game companies are pivoting to a mobile first
approach because there are so many people with mobile phones in the world.
Mobile comes with its own complications though, so you should pick what fits
best to your game.

Solana has a distinct edge over other blockchain platforms due to its offering
of a crypto-native mobile phone, named [Saga](https://solanamobile.com/), that
comes equipped with an innovative dApps store. This store enables the
distribution of crypto games without the limitations imposed by conventional app
stores such as Google or Apple.

## Publishing Platforms

Platforms where you can host your games

| Platform                                                                                         | Description                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Fractal](https://www.fractal.is/)                                                               | A game publishing platform that supports Solana and Ethereum. They also have their own wallet and account handling and there is an SDK for high scores and tournaments.                                                                                                                                                                                                                             |
| Self Hosting                                                                                     | Just host your game yourself. For example using [Vercel](https://vercel.com/) which can be easily setup so that a new version get deployed as soon as you push to your repository. Other options are [github pages](https://pages.github.com/) or [Google Firebase](https://firebase.google.com/docs/hosting) but there are many more.                                                              |
| [Solana mobile DApp Store](https://github.com/solana-mobile/dapp-publishing/blob/main/README.md) | The Solana alternative to Google Play and the Apple App Store. A crypto first variant of a dApp store, which is open source free for everyone to use. [Video Walkthrough](https://youtu.be/IgeE1mg1aYk?si=fZmU1WNiW-kR3qFa)                                                                                                                                                                         |
| [Apple App Store](https://www.apple.com/de/app-store/)                                           | The Apple app store has a high reach and is trusted by its customers. The entrance barrier for crypto games is high though. The rules are very strict for everything that tries to circumvent the fees that Apple takes for in app purchases. A soon as an NFT provides benefits for the player for example Apple requires you for example to have them purchased via their in app purchase system. |
| [Google Play Store](https://play.google.com/store/games)                                         | Google is much more crypto friendly and games with NFTs and wallet deep links for example have had a track record of being approved for the official play store.                                                                                                                                                                                                                                    |
| [xNFT Backpack](https://www.backpack.app/)                                                       | Backpack is a Solana wallet which allows you to release apps as xNFTs. They appear in the users wallet as soon as they purchase them as applications. The Unity SDK has a xNFT export and any other web app can be published as xNFT as well.                                                                                                                                                       |
| [Elixir Games](https://elixir.games/)                                                            | Elixir Games is a platform that focuses on blockchain-based games. They support a variety of blockchain technologies and offer a platform for developers to publish their games.                                                                                                                                                                                                                    |

## Next Steps

- [Solana Gaming SDKs](/developers/guides/games/game-sdks.md)
- [Hello world on-chain game](/developers/guides/games/hello-world.md)
- [Learn by example](/developers/guides/games/game-examples.md)
- [Energy System](/developers/guides/games/energy-system.md)
- [NFTs in games](/developers/guides/games/nfts-in-games.md)
- [Dynamic meta data NFTs](/developers/guides/token-extensions/dynamic-meta-data-nft.md)
- [Token in games](/developers/guides/games/interact-with-tokens.md)
- [Game eco system projects](https://solana.com/ecosystem/)
