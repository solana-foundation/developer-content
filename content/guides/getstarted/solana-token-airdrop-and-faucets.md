---
date: Jul 29, 2023
difficulty: intro
title: "How to get Solana devnet SOL (including airdrops and faucets)"
seoTitle: "Faucets: How to get Solana devnet SOL"
description:
  "A list of the most common ways to get devnet and testnet SOL tokens for
  Solana development. Including: airdrop, web3.js, POW faucet, and more."
tags:
  - faucet
keywords:
  - faucet
  - blockchain
  - devnet
  - testnet
---

# How to get Solana devnet SOL (including airdrops and faucets)

This is a collection of the different ways for developers to acquire SOL on
Solana's testing networks, the Solana devnet and testnet.

## 1. Solana Airdrop

_Available on Devnet and Testnet_

This is the base way of acquiring SOL, but it can be subject to rate limits when
there is a high number of airdrops.

Here are three different ways of requesting airdrops with it:

### Using the Solana CLI:

`solana airdrop 2`

### Using web3.js:

```js
const connection = new Connection("https://api.devnet.solana.com");
connection.requestAirdrop();
```

See more:
[`requestAirdrop()`](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#requestAirdrop)
documentation inside web3.js.

## 2. Web Faucet

_Available for Devnet_

1. [faucet.solana.com](https://faucet.solana.com) - A public web faucet hosted
   by the Solana Foundation
2. [SolFaucet.com](https://solfaucet.com/) - Web UI for airdrops from the public
   RPC endpoints
3. [QuickNode](https://faucet.quicknode.com/solana/devnet) - A web faucet
   operated by QuickNode

_Available for Testnet_

1. [faucet.solana.com](https://faucet.solana.com) - A public web faucet hosted
   by the Solana Foundation
2. [SolFaucet.com](https://solfaucet.com/) - Web UI for airdrops from the public
   RPC endpoints
3. [QuickNode](https://faucet.quicknode.com/solana/testnet) - A web faucet
   operated by QuickNode
4. [TestnetFaucet.org](https://testnetfaucet.org) - A web faucet with a rate
   limit separate than the public RPC endpoints, operated by
   [@Ferric](https://twitter.com/ferric)

## 3. RPC Provider Faucets

_Available for Devnet_

RPC Providers can opt in to distributing Devnet SOL via their Devnet Validators.

_\*If you are an RPC Provider and want to distribute SOL please get in touch
here: [Form](https://c852ena8x5c.typeform.com/to/cUj1iRhS)_

Currently Supported:

1. [Helius](https://www.helius.dev/)
2. [QuickNode](https://faucet.quicknode.com/solana/devnet)

### Using the Solana CLI

Specify your [Cluster](https://docs.solana.com/clusters) to be your RPC
provider's URL.

`solana config set --url <your RPC url>`

Then you can request an airdrop like you would in the first option in this
guide.

`solana airdrop 2`

### Using Web3.js

```js
const connection = new Connection("your RPC url");
connection.requestAirdrop();
```

## 4. Proof of work Faucet

_Available for Devnet_

This is a proof of work Faucet where Devnet SOL can be distributed to you thanks
to your computing power.

**Install the Devnet POW Crate:**

`cargo install devnet-pow`

**Start mining devnet SOL**

`devnet-pow mine`

_⚠️ The [POW Faucet](https://github.com/jarry-xiao/proof-of-work-faucet) is
maintained by Ellipsis Labs_

## 5. Discord Faucets

Various Discord communities have setup Devnet SOL Faucets as BOTs.

| Community      | Usage                                                       | Link                                         |
| -------------- | ----------------------------------------------------------- | -------------------------------------------- |
| The 76 Devs    | Run `!gibsol` in the BOT commands channel.                  | [Join Server](https://discord.gg/RrChGyDeRv) |
| The LamportDAO | Run `/drop <address> <amount>` in the BOT commands channel. | [Join Server](https://discord.gg/JBVrJgtFkq) |
