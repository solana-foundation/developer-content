---
date: Feb 29, 2024
difficulty: intermediate
title: "Complete Guide to Solana Development on Mobile"
description:
  "A detailed guide to help you build mobile apps using Solana on any Android
  device, including the Saga."
tags:
  - cli
  - dApp
  - mobile
  - web3js
keywords:
  - tutorial
  - mobile
  - dapps
  - transactions
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
---

# Complete Guide to Solana Development For Mobile

A detailed guide to help you build mobile apps using Solana on any Android
device, including the Saga.

![](https://cdn-images-1.medium.com/max/2912/0*ea4zpPyd_m9S8NFq.png)

## Introduction

Minting an NFT and storing it in your wallet, everything from your phone?
Interacting with over 2919 nodes to deploy your smart contract with a single
click. Building scalable decentralized systems that solve global payments
through a Solana Pay mobile app. All from your phone sounds insane, right? But
that’s what we do — make impossible things happen.

Here, I want to dive into Solana to show you how to build a full stack dapp. I
also want to introduce the ecosystem and the developer tooling to hopefully help
you get up and running building your ideas and applications in the future. The
flow is that we go through some primary Solana-specific concepts for development
and then dive into everything Solana Mobile.

In this deep dive, we will go through everything involving building Mobile Apps
on Solana. That is discussing the components of Solana Mobile Stack (SMS),
building on SMS with and without the Saga phone, setting up the development
environment, going over some development frameworks, and finally building
something. 2024 is the year of Solana Mobile, a lot of impactful projects are to
come, so let’s try to boat these waters together. Buckle up, it’s a fun ride
ahead!

## Development on Solana

Building products that bring mass crypto-adoption is what we stand for, and
Solana lets us exactly do that. The developer experience was referred to be
"[eating glass](https://www.theblock.co/post/173036/aptos-lures-solana-developers-tired-of-eating-glass)"
earlier. But with collective efforts from the whole ecosystem in terms of
frameworks, documentation, tutorials, and general support IΓÇÖd say it's pretty
accessible to start building now.

The biggest practical difference Solana has from Ethereum is that it very
aggressively separates code and data. This has several implications for how the
system is structured. Data is stored in
[accounts](https://solana.com/docs/core/accounts). accounts are buffers. you
create an account with a declared size in bytes and can store arbitrary binary
data in it. That is what makes Solana incredibly fast and cheap. So, you'll see
a lot of 'accounts' when building on Solana, these accounts have types attached
to them like tokenAccount, mintAccount, etc. Accounts are owned by the system
program by default or are owned by the signer(the user).

Something called
[Program Derived Addresses (PDA)](https://solanacookbook.com/core-concepts/pdas.html#facts)
exists in Solana. This is a special kind of account that a program can sign for
without a privatekey. Given a seed of arbitrary bytes plus a program id, you can
generate what looks like an ed25519 pubkey. With PDAs, programs can
programmatically sign for certain addresses without needing a private key. PDAs
serve as the foundation for
[Cross-Program Invocation](https://solana.com/docs/core/cpi#cross-program-invocations)(CPI),
which allows Solana apps to be composable with one another. CPI is a way to
interact with other programs on the chain. Like when you mint an NFT you can CPI
to an existing Metaplex program to use the already written standards.

Now that we've covered some Solana-specific concepts that are relevant for
building any dApp on Solana(web or mobile), we jump to everything Solana mobile,
starting with the Solana Mobile Stack.

## What is Solana Mobile Stack?

[Solana Mobile Stack (SMS)](https://docs.solanamobile.com/getting-started/intro)
is a collection of key technologies for building mobile applications that
interact with the Solana blockchain. In a nutshell, it lets you deploy your
mobile app on the Solana blockchain.

## Why is this important?

- [Almost everyone](https://explodingtopics.com/blog/smartphone-stats) has a
  smartphone today. Most of them are mobile-first - meaning they perform
  day-to-day tasks using a mobile device and do not necessarily use a PC often.
  Most don't even own a PC. Even for crypto, most people do not understand web
  tech and care about using complex packages to mint a new NFT collection or
  claim an airdrop.

- Data suggest in the biggest emerging markets like India and China, people
  mandatorily have a mobile internet plan but do not necessarily have a
  broadband plan. Going mobile is the best way to onboard the next billion users
  into crypto.

- To deploy and run apps in the
  [web2](https://www.algorand.foundation/news/web2-vs-web3#:~:text=Web2%2C%20also%20known%20as%20the,privacy%20and%20ownership%20of%20data.)
  world, there is always a centralized authority in the middle controlling and
  limiting the operations. There are fees and commissions attached to Google or
  Apple (15%ΓÇô30%). Even in-app purchases have a minimum amount according to
  guidelines. With SMS, this centralized authority doesn't exist anymore.
  Developers have total control of transaction flows and user onboarding with
  **zero commission.** Now, there is a direct relationship between the publisher
  and the customer. This means new opportunities to try out experimental
  user-centric features, or SDKs that directly add value to the end user. This
  is a win for both developers and the end users.

- Most people do not understand crypto tech, and we, as developers shouldnΓÇÖt
  need to care about that. We just need users, right? When a user doesn't need
  to know the underlying tech while pressing the "Mint NFTΓ" button, then only a
  greater user base can enter crypto. If the experience is as smooth as using
  WhatsApp and not like mining a bitcoin for normal people, we as crypto grow.
  And that's exactly why Solana Mobile Stack is so important. (With SMS you can
  actually mint an NFT from just one line of code for the developer and just a
  click for the user.) User education in the between is not feasible, and SMS
  just solves that barrier of crypto illiteracy in achieving a greater user
  base.

Now, let us learn about the core technologies of the SMS and how each fits into
the web3 mobile landscape.

## Mobile Wallet Adapter

This is a really important and useful element in the Solana Mobile Stack. The
Mobile Wallet Adapter (MWA) is a protocol specification for connecting mobile
dApps to mobile Wallet Apps, enabling communication for Solana transactions and
message signing. Applications can connect with any crypto wallet application
(e.g., Phantom, Ultimate) and request authorization, sign, and send
transactions. For example, if you build an NFT staking platform, you can use MWA
to let users access their wallets, check their NFTs, and send transactions for
staking the NFT. Also, the best part you don't have to build for each wallet
individually, instead can just integrate once and use a single unified API to be
compatible with every compliant
[Solana wallet](https://solanamobile.com/wallets)! Isn't that great?

> Mobile Wallet Adapter is currently supported for Android and Mobile Web -
> Chrome (Android). With native Android it completely supports dApps and wallet
> apps, and for Chrome, it automatically integrates while using
> _@solana/wallet-adapter-react._

So, for example, this dReader app which is an on-chain app built with Flutter
and the SMS Mobile Wallet Adapter to allow users to connect with a variety of
different wallets. It's implemented with just one unified API but will work for
all the wallet apps.

Solana Mobile maintains an official
[Mobile Wallet Adapter SDK](https://github.com/solana-mobile/mobile-wallet-adapter)
that implements the protocol, originally written as an Android Kotlin/Java
library. But for our ease, SDK is also ported to other frameworks and is
available for React Native, Flutter, Unity, and Unreal Engine. Build in what
suits you the best.

![dReader MWR implementation](https://cdn-images-1.medium.com/max/2912/0*F-WtJ8ePZ0kpnyz7.png)_dReader
MWR implementation_

## Seed Vault

The [Seed Vault](https://docs.solanamobile.com/getting-started/overview#seed-vault)
is a system service providing secure key custody to Wallet apps. It helps to
keep your secrets safe, by moving them to the highest privileged environment
available on the device. Your keys, seeds, and secret phrases never leave the
secure execution environment, while UI components built into Android handle user
interaction to provide users with a secure transaction signing experience. As
the name suggests, itΓÇÖs a vault that often uses the safest components
available in your mobile, like the secure operating nodes, to store your keys
and phrases so that the security of the wallets and the network is not easily
compromised.

## Solana dApp Store

The [Solana dApp Store](https://github.com/solana-mobile/dapp-publishing#welcome-publishers)
is an alternate app distribution system well-suited for distributing apps
developed to the Solana ecosystem.

The Solana dApp Store is an app store for the **Saga**, a flagship Android phone
from Solana Mobile designed for Web3 (We'll come to that soon). Solana dApp
store is what you call the perfect stop - customizability and web3
specification. The dApp Store offers the attention of engaged Web3-focused users
of the Saga device, combined with publisher policies compatible with crypto use
cases, such as NFTs, DeFi, payments, blockchain gaming, and more.

Most importantly, it isn't like a Web2 centralized app store. It is fee-free:
meaning that Solana Mobile Inc. collects no fees from users of the dApp Store.
As we discussed earlier, Web2 platforms do not always let you do everything you
want for your app in terms of policies. But here, dApps are allowed to let users
buy, sell, and trade digital goods, participate in DeFi, token-gate experiences
based on the contents of a user's wallets, send and receive microtransactions,
use the payment system of their choice, etc, freely, without policies preventing
these uses. You get to curate the perfect user experience and build what you
dream.

![Solana dApp store.](https://cdn-images-1.medium.com/max/2000/0*AhOGEPf0vH_v5G1E.jpeg)_Solana
dApp store._

## Solana Pay for Android

The perfect use case for a token-based network is payments, right? Borderless
payments where no central authority controls the value of these tokens is what
decentralization stands for, and Solana Pay lets you exactly do that. It was
developed independently of the Solana Mobile Stack, but combining payments with
a mobile device is a natural fit for Solana Pay. Android devices can capture
Solana Pay URLs via QR codes, NFC taps, messages, and web browser interactions
to launch Solana Pay requests. ItΓÇÖs your perfect decentralized, bankless,
transparent, secured, and scalable payment solution.

> Solana Pay has been Integrated with **Shopify** as a New Payment Option to
> Transform Commerce. You can read more about it
> [here](https://solana.com/news/solana-pay-shopify).

![The flow of Solana Pay.](https://cdn-images-1.medium.com/max/2000/0*PuAmO1VDSgvcMuKX.png)_The
flow of Solana Pay._

## The SAGA Phone

Now imagine all these components and decentralization of web3 with premium
hardware purpose-built to power and access the best dApps; that is, Saga for
you. It's Solana's very own mobile web3 experience which encapsulates Seed
Vault, dApp Store, and Solana Mobile Stack (SMS).

![Saga phone](https://cdn-images-1.medium.com/max/2000/0*3FJMwdZjziiZU1Q8.png)_Saga
phone_

Every Saga user feels like web3 as a whole is in their palms now. With a seed
vault that protects your private keys via secure hardware and AES encryption and
the perfectly curated dApp store, you get the hottest projects in the Solana
ecosystem while using the dApps you already love on the go. Most importantly,
you can transact seamlessly across dApps without ever having to open another
browser extension. As I said, it's the future of mobile experience and
technology. The best part is that Saga users get exclusive rewards and early
claims in the airdrops of the best projects. The last release of Saga phones
sold out in less than a week, and most people made more money in airdrops than
the cost of the Saga phone. The new Saga phone 2 has more than 40,000 preorders
as of now.

> "We need a crypto phone. With built-in balances. And provable encryption.
> SoΓÇªSolana actually built one," -
> [Balaji](https://twitter.com/balajis/status/1751439927940911113)

## Building on SMS with the Saga phone

As Balaji said, and we all say, Saga is the ultimate web3 mobile experience. So
it's obvious that Saga is designed to enhance the Solana Mobile Stack (SMS)
development experience. It includes the essential Seed Vault for secure key
custody, a curated dApp Store for easy access, and seamless integration with
Solana Mobile Stack (SMS). Development on SMS can be built with or without the
Saga Phone. HereΓÇÖs how the differences unfold:

![](https://cdn-images-1.medium.com/max/2000/0*9-aew7vnPUHAKJVA.png)

## Building on SMS without Saga Phone

- **Hardware Limitations:** Web3 apps on scale behave and require very different
  specifications than traditional apps. Not every Android phone can match the
  hardware needs and create limitations in features you want to build.

- **Storage and Security:** We discussed Seed Vault earlier and why it is
  extremely important. When not using the Saga phone, some "Safe" components of
  your phone are used as the vault, or at times you'll have to add an external
  hardware component. An ecosystem where you sign and send transactions, and all
  your liquidity and data are stored in your Solana keypair addresses, securing
  that information is as important as securing national reserve for a country.

- **dApp access:** Solana dApp store is a precisely curated app store with
  access to all web3 apps and their exclusive mechanisms. You must navigate
  through conventional app stores and web browsers without the Saga. As I
  mentioned earlier, these conventional stores can limit the true potential of
  your dApp with policies, unwanted rules, and less transparency.

- **SMS Integration: **We went through all the SMS components earlier. Some of
  it will have to be configured when using a standard device. When you want to
  build things on the go and push features FAST, configuring individual
  components manually is a hassle. Saga helps you avoid that.

Now, let's see how using Saga solves these problems and makes the experience way
better.

## Building on SMS with the Saga Phone

- **Optimized Web3 Experience:** Saga, a flagship Android smartphone, is
  custom-built to enhance and secure Web3 interactions. Its purpose-built
  hardware is optimized for web3 apps going all in with the power. "**Premium
  Hardware for the Mobile Web3 era**" is the saga's tagline and it stands with
  that with its specifically curated hardware components that let users feel
  like they're interacting with the blockchain and experiencing the future.

- **The Seed Vault Support**: Unlike a traditional phone where some "safe"
  components of the phone or external hardware are used for the seed vault, Saga
  comes with dedicated hardware that secures your address and keys with its
  life.

- **The dApp Store:** Unlike your conventional app stores and gateways, Solana's
  dApp store is cool and Web3 curated. It is fee-free and allows users to buy,
  sell, and trade digital goods, participate in DeFi, and token-gate
  experiences, and not get stuck with unnecessary policies and middle muddle.
  ItΓÇÖs a win-win for users and the publishers, with direct interaction and
  exciting things. The publishing process is seamless; you can check it
  [here](https://www.helius.dev/blog/publishing-solana-mobile-apps). All these
  exclusive rewards only come with Saga, so it is clear I guess.

- **Dedicated Solana Mobile Stack:** Saga comes equipped with the Solana Mobile
  Stack (SMS), providing the complete toolkit for development. You don't have to
  configure the components individually, just harness the power of SMS and start
  building.

- **Exclusive Features:** Saga users benefit from unique features such as
  decentralized payments with Solana Pay, secure self-custody of digital assets
  with the Seed Vault, and direct relationships with apps through the Solana
  dApp Store.

What I am trying to say is:

![](https://cdn-images-1.medium.com/max/2000/0*SSet8531khfaluM6.jpeg)

## Setting up the Environment

Let us set up the development environment for Android mobile development.
Regardless of framework choice, we follow these steps to start developing.

## 1. Install Android Studio

First things first, let's set up our Integrated Development Environment (IDE) to
write the code. Android Studio is the official IDE for Android app development
especially curated for unique Android needs. Go ahead and set it up from the
[official docs.](https://developer.android.com/studio/intro)

## 2. Setup Device/Emulator

Next, we set up a physical device or emulator to preview the app as we develop.
You can either
[start an emulator](https://developer.android.com/studio/run/emulator),
essentially an Android phone on your computer, which will run your app, or
connect your [physical device](https://developer.android.com/studio/run/device)
(your phone) to view the app. This is why I started coding as a kid - I could
write a line, and itΓÇÖd build something on my screen. Felt liberating!

## 3. Install a wallet app

In the Web3 world, every execution is a transaction to the blockchain. A
transaction consists of instructions that know what exactly to do. To send in
these transactions, you need a wallet that funds the gas fees, signs the
transaction, sends/receives tokens, authorizes, etc. As discussed earlier, the
MWA library allows you to connect and interact with these wallets.

Some popular Solana wallets are Phantom and Solfare. You can download its mobile
app onto your phone or in the emulator. For quick testing purposes, you can also
use something called the "fakewallet" app - a 'fake' Mobile Wallet
adapter-compliant wallet. It does not store persistent keypairs, and the wallet
is ΓÇ£resetΓÇ¥ each time the app is exited.

## Choosing the development Framework and the SDKs

The Solana Mobile Stack is primarily written in native Android, to experience
the full capabilities of the Android OS. But because Solana is cool and it wants
developers to just focus on building great things, SMS supports other
development frameworks too.

Firstly, React Native and Kotlin have official SDKs maintained by the Solana
Mobile team.

## React Native SDK

[React Native](https://reactnative.dev/docs/getting-started) is a popular
development framework for creating mobile apps using React and Javascript. The
best thing about React Native is that you can continue using popular,
well-supported Solana web libraries like
[@solana/web3](http://twitter.com/solana/web3).js and leverage their existing
code in your React Native project. So, for current Solana web or React
developers, itΓÇÖll be the easiest and quickest option to switch to mobile. Some
existing react libraries like [@solana/web3](http://twitter.com/solana/web3).js
and [@solana](http://twitter.com/solana)-mobile/mobile-wallet-adapter-protocol
are handy for Solana core concepts (like accounts, programs, transactions) and
MWR implementation.

React native, being a cross-platform framework, is great for getting things up
and running fast but can have problems in memory management and debugging. Since
transactions might sometimes need low latency functionalities, react-native
might not be the best choice.

Here is an NFT minter app built with react native using MWA implementation,
Metaplex concepts, and core propositions of how apps' functionalities work in
Solana.
[Check out ](https://github.com/solana-mobile/tutorial-apps/tree/main/MobileNFTMinter)how
the codebase has been set up.

![](https://cdn-images-1.medium.com/max/2912/0*7AGgzPHQ3-rkDiWC.png)

NFT minter built on React Native

## Kotlin SDK

[Kotlin](https://kotlinlang.org/) is an
[officially supported](https://developer.android.com/kotlin) programming
language for Android development and is used to build native Android apps. For
native Android devs who are looking to build something on Solana, this is your
way ( I made my first app using this). Developing on Android enables convenient
and full access to the Android platform's capabilities. Without bridging, you
can access OS-specific functionalities like Camera SDK, ARKit, Touch ID,
hardware sensors, etc..

Native Android apps, as a result of full utilization of the system capabilities,
generally have better performance and efficiency. Native apps provide the
highest attainable frame rates, computing power, graphics support, etc. But for
someone migrating as a Web Developer and having done no amount of mobile
development, it is like learning a whole new system entirely with very different
ways of building - like the scaffolding, widgets, trees, state management, etc.

[Here](https://github.com/solana-mobile/Minty-fresh/tree/main?tab=readme-ov-file)
is a codebase of MintyFresh ΓÇö A full-fledged production dApp built using
Kotlin. It lets you mint NFTs directly from your phone.

To provide more tools and better the overall developer experience SMS supports
other community SDKs. These SDKs are actively maintained, supported, and used by
members and developers of the Solana Mobile community.

![](https://cdn-images-1.medium.com/max/2512/0*qvpLGI3horN6CaAF.png)

MintyFresh built with Kotlin

## Unity SDK

[Unity](https://unity.com/) is a popular development platform for games and
other real-time 3D experiences. Unity is commonly used by mobile game developers
to build fun and engaging experiences that are playable on your phone! Gaming in
crypto is a different segment altogether, with exciting existing projects with
thousands of users. The experience of in-game assets, the community, and the
real asset value that Web3 gives is unmatchable, so building games on Solana is
great!

The Solana Unity SDK is an open-source community-led project that enables Solana
NFT support and RPC functionality for Unity games and projects. If you are a
game developer looking to incorporate web3 features using the Solana blockchain,
check out the [Solana.Unity-SDK](https://solana.unity-sdk.gg/).

## Unreal Engine SDK

The solana-saga-unreal-sdk is an open-source Unreal Engine plugin that
integrates with the Solana Mobile Stack to provide features like wallet signing.
It is a community-developed SDK maintained by the
[CaveWorld](https://www.caveworld.com/) team.

Currently, the status of the SDK is still in the pre-release stage and
development.

## Flutter SDK

Next is Flutter, another community-maintained SDK that lets you deploy code on
multiple platforms. For this article, we will be building a mobile app using
Solana Mobile Stack and Flutter SDK to understand better Solana Mobile
Development and the things we can achieve with it. Even though I have chosen
Flutter, the core concepts and mechanisms remain the same; youΓÇÖll just have to
get the framework-specific implementation for your app.

## LetΓÇÖs get started!

For this tutorial, we will use the Flutter SDK for Solana Mobile maintained by
the Espresso Cash team. This collection of Flutter plugins brings the core SMS
technologies like Mobile Wallet Adapter onto Flutter.

We'll be sticking with the implementation of **dReader** for reference. dReader
is an on-chain platform for publishing, trading, collecting, and reading digital
comics.

![dReader App](https://cdn-images-1.medium.com/max/2912/0*kWwVzLadFODThjWF.png)_dReader
App_

## Starting off with Flutter

Flutter is an open-source mobile app development framework created by Google. It
uses the Dart programming language and allows us to create cross-platform
applications for Android and iOS using a single codebase. So it's great for
getting things up and running FAST. With that said, the key tradeoffs are the
same as React Native, plus you'll have to learn Dart language for this, contrary
to writing on React Native, which is very similar to React and Javascript.

- First things first, letΓÇÖs create a new Flutter app.

  flutter create solana_dApp

- Then let's install two important dart packages for Solana. They are Solana and
  Solana Mobile clients. Install them by writing this in the terminal.

  flutter pub add solana flutter pub add solana_mobile_client

## Connecting your wallet using Mobile Wallet Adapter

As discussed earlier, connecting a wallet is essential to sign transactions,
manage accounts, and store your collectibles. This can be easily done with the
MWR dart library. We're using the Solana network as devnet because the app is
not in production, and we don't want to pay real money for gas fees.

    import 'package:flutter/material.dart';
    import 'package:solana_wallet_adapter/solana_wallet_adapter.dart';

    class _ExampleAppState extends State<ExampleApp> {

      /// Initialization future.
      late final Future<void> _future;

      /// NOTE: Your wallet application must be connected to the same cluster.
      static final Cluster cluster = Cluster.devnet;

      /// Request status.
      String? _status;

      /// Create an instance of the [SolanaWalletAdapter].
      final SolanaWalletAdapter adapter = SolanaWalletAdapter(
        AppIdentity(
          // uri: Uri.https('merigo.com'),   // YOUR_APP_DOMAIN.
          // icon: Uri.parse('favicon.png'), // YOUR_ICON_PATH relative to `uri`
          // name: 'Example App',            // YOUR_APP_NAME.
        ),
        cluster: cluster,                 // The cluster your wallet is connected to.
        hostAuthority: null,              // The server address that brokers a remote connection.
      );

      /// Load the adapter's stored state.
      @override
      void initState() {
        super.initState();
        _future = SolanaWalletAdapter.initialize();
      }

      /// Connects the application to a wallet running on the device.
      Future<void> _connect() async {
        if (!adapter.isAuthorized) {
          await adapter.authorize(walletUriBase: adapter.store.apps[1].walletUriBase);
          setState(() {});
        }
      }

The in-app implementation of what we did in the code is below. The images above
(below the MWR explanation) show the whole process; displays the wallet options
in the phone, connects the wallet, and stores it in the UI. All of it with
MWRΓÇª.greatt!!

![MWR implementation](https://cdn-images-1.medium.com/max/2000/0*Ia47fXe4V7BgcyV0.jpeg)_MWR
implementation_

## Requesting Airdrop

Another reason why Solana is great. You can airdrop (acquire) SOL on SolanaΓÇÖs
testing networks. To see if transactions are working, or to pay gas fees, you'll
need SOL. Because Solana is so fast, airdrop lets you test your apps
efficiently, and you can get up and running on the go.

    Future<void> requestAirdrop() async {
        final publicKey = state.authorizationResult?.publicKey;
        if (publicKey == null) return;

        if (state.isRequestingAirdrop) return;

        emit(state.copyWith(isRequestingAirdrop: true));

        try {
          await _solanaClient.requestAirdrop(
            address: Ed25519HDPublicKey(publicKey),
            lamports: lamportsPerSol,
          );
        } finally {
          emit(state.copyWith(isRequestingAirdrop: false));
        }
      }

## Signing and Sending Transactions

On the Solana blockchain, program execution begins with a
[transaction](https://docs.solana.com/terminology#transaction) being submitted
to the cluster. With each transaction consisting of one or many
[instructions](https://docs.solana.com/terminology#instruction), the runtime
will process each of the instructions contained within the transaction in order
and atomically. So a bunch of instructions can be to send tokens, buy an NFT,
and download the book after tokens are transferred. So, for instance, if a
transaction is responsible for sending tokens, checking the reply, and
downloading a comic (dReader example) each of these steps will be individual
instructions and will be incorporated into a transaction (Selling a comic book)
so when it's signed and sent, each instruction will be executed and the App
state will be updated using the Solana Client. In our dReader app, when a
collectible or a comic is bought, the app sends a transaction to the blockchain
using an RPC client and waits for authorization.

    Future<void> signAndSendTransactions(int number) async {
        final session = await LocalAssociationScenario.create();

        session.startActivityForResult(null).ignore();

        final client = await session.start();
        if (await _doReauthorize(client)) {
          final signer = state.publicKey as Ed25519HDPublicKey;

          final blockhash = await _solanaClient.rpcClient
              .getLatestBlockhash()
              .then((it) => it.value.blockhash);
          final txs = _generateTransactions(
            number: number,
            signer: signer,
            blockhash: blockhash,
          ).map((e) => e.toByteArray().toList()).map(Uint8List.fromList).toList();

          await client.signAndSendTransactions(transactions: txs);
        }
        await session.close();
      }

## Authorize Transactions

Each transaction explicitly lists all account public keys referenced by the
transactionΓÇÖs instructions. A subset of those public keys are each accompanied
by a transaction signature. Those signatures signal on-chain programs that the
account holder has authorized the transaction. Typically, the program uses the
authorization to permit debiting the account or modifying its data. So in our
case, when the transaction to buy the comic is sent to the blockchain, the user
authorizes it from his wallet to continue the transaction and execute the
instruction sequentially. More information about how the authorization is
communicated to a program can be found in
[Accounts](https://solana.com/docs/core/accounts#signers).

    Future<bool> _doAuthorize(MobileWalletAdapterClient client) async {
        final result = await client.authorize(
          identityUri: Uri.parse('https://solana.com'),
          iconUri: Uri.parse('favicon.ico'),
          identityName: 'Solana',
          cluster: 'testnet',
        );

        emit(state.copyWith(authorizationResult: result));

        return result != null;
      }

      Future<bool> _doReauthorize(MobileWalletAdapterClient client) async {
        final authToken = state.authorizationResult?.authToken;
        if (authToken == null) return false;

        final result = await client.reauthorize(
          identityUri: Uri.parse('https://solana.com'),
          iconUri: Uri.parse('favicon.ico'),
          identityName: 'Solana',
          authToken: authToken,
        );

![Sends and authorizes a transaction](https://cdn-images-1.medium.com/max/2912/0*LhAUg7UwYDqV_bhQ.png)_Sends
and authorizes a transaction_

## Fetching data and integrating it

One big part of development is to handle data. Data in Solana is stored in
accounts, unlike other chains. That is what makes Solana incredibly fast. Data
is stored in data accounts associated with a user address or a program ID.
Something called PDAs (**Program Derived Accounts) **exit in Solana, which is
derived from program ID and a combination of seeds. It is an account associated
with the program that derives it and can programmatically sign for certain
addresses without needing a private key.

So in this code, weΓÇÖre building so that the app showcases the userΓÇÖs
walletΓÇÖs current Solana token balance. It's important to show the current
token balance in specific places of the app and check if the wallet has a
balance before confirming a transaction.

    import 'package:flutter/material.dart';
    import 'package:solana_mobile_stack/solana_mobile_stack.dart';

    class SolanaBalanceScreen extends StatefulWidget {
      @override
      _SolanaBalanceScreenState createState() => _SolanaBalanceScreenState();
    }

    class _SolanaBalanceScreenState extends State<SolanaBalanceScreen> {
      // Variable to hold the wallet balance, initially set to 'Loading...'
      String balance = 'Loading...';

      @override
      void initState() {
        super.initState();
        // Call the function to fetch the wallet balance when the widget is initialized
        fetchWalletBalance(); // Implement this function
      }

      // Function to fetch the wallet balance asynchronously
      void fetchWalletBalance() async {
        try {
          // Create a wallet object from a mnemonic phrase (replace 'your_mnemonic_phrase_here' with the actual mnemonic)
          final wallet = Wallet.fromMnemonic('your_mnemonic_phrase_here');

          // Create a connection to the Solana Devnet
          final connection = SolanaConnection(SolanaNetwork.devnet);

          // Fetch the wallet balance from the Solana blockchain
          final balance = await wallet.getBalance(connection);

          // Update the balance variable with the fetched balance in SOL
          setState(() {
            this.balance = '$balance SOL';
          });
        } catch (error) {
          // Handle errors by updating the balance variable with an error message
          setState(() {
            this.balance = 'Error: $error';
          });
        }
      }

      @override
      Widget build(BuildContext context) {
        return Scaffold(
          appBar: AppBar(
            title: Text('Solana Wallet Balance'),
          ),
          body: Center(
            child: Text(
              'Wallet Balance: $balance', // Display the wallet balance here
              style: TextStyle(fontSize: 24),
            ),
          ),
        );
      }
    }

> In this code, replace "**your_mnemonic_phrase_here**" with your own mnemonic
> phrase. Also, getbalanceΓÇÖs in-app implementation for our very own dReader
> app is below.

But apart from just the wallet balance, other data stored in the blockchain can
be retrieved using SMS to formulate the UI. For instance, the metadata of the
books in the picture below is fetched and formulated into the stellar-looking
UI.

![Fetches the wallet balance. Uses other databases to implement the UI](https://cdn-images-1.medium.com/max/2912/0*dX91Fgaj0zR3hE8a.png)_Fetches
the wallet balance. Uses other databases to implement the UI_

That's it! ThatΓÇÖs the app we built using SMS and Flutter SDK. As a developer,
you need to remember that the Solana community is the best. They keep on
building tools and apps that ease other devs' lives. ItΓÇÖs a constant pursuit
of becoming better and bringing everyone together. So many companies have built
something because they faced those issues while doing something else. Let's look
at a couple of tools.

## Conclusion

Woo! We've done a lot. Let's take a moment to step back and see what we've done.
Learned Solana Mobile App development, wow! This was a very comprehensive
tutorial on Solana Mobile Stack. We went through the importance of SMS, how we
can utilize it to make our apps scalable and easier, its elements and SDKs,
other tools, and how going mobile brings more users into crypto. Also, we used
its major components to build an app like dReader while understanding the
practical application and impact of the code.

Building on Solana is the best thing you can do as a developer, with fast
transaction speed and low gas fees, tons of tools and apps to take help from, a
great community to push you further, and the best learning ecosystem you can get
to build the **Future. **And the best thing, you are highly rewarded for your
efforts. Unlike a traditional system, capital distribution is done to the core,
where everyone putting in the effort is compensated.

With rewards, bounties, grants, tons of dev jobs, and token airdrops, your
contribution is recognized. With that said, you can find plenty of grants - get
paid to build what you love. Sounds great to me! Superteam grants, Solana
Foundation grants, and tons of other project grants are available.

Embracing technology is magical, and we are the people who get to do it. There
are countless more things you can do in Solana, especially when SMS makes things
so easy. We want to see what story you tell, and what magic you build. The
Solana community, countless blogs and resources like this, and the whole
ecosystem are at your disposal to help you navigate when you hit a bump, you
just need to start!

**\*dReader**:
[https://github.com/d-reader-organization/d-reader-flutter](https://github.com/d-reader-organization/d-reader-flutter)\*

**\*Espresso-cash**:
[https://github.com/espresso-cash/espresso-cash-public/tree/master](https://github.com/espresso-cash/espresso-cash-public/tree/master)\*

**Solana Mobile's** official site:
[https://solanamobile.com/](https://solanamobile.com/)

**Discord for resources and help**:
[https://discord.com/invite/solanamobile](https://discord.com/invite/solanamobile)

**Developer docs**:
[https://docs.solanamobile.com/getting-started/overview](https://docs.solanamobile.com/getting-started/overview)

**GitHub**: [https://github.com/solana-mobile](https://github.com/solana-mobile)
