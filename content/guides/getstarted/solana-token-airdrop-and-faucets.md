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

RPC Providers can opt in to distributing devnet SOL via their Devnet Validators.

_\*If you are an RPC Provider and want to distribute SOL please get in touch
here: [Form](https://c852ena8x5c.typeform.com/to/cUj1iRhS)_

Currently Supported:

1. [Helius](https://www.helius.dev/)
2. [QuickNode](https://faucet.quicknode.com/solana/devnet)
3. [Triton](https://triton.one/)

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

This is a proof of work Faucet where devnet SOL can be distributed to you thanks
to your computing power.

**Install the Devnet POW Crate:**

`cargo install devnet-pow`

**Start mining devnet SOL**

`devnet-pow mine`

_⚠️ The [POW Faucet](https://github.com/jarry-xiao/proof-of-work-faucet) is
maintained by Ellipsis Labs_

## 5. Discord Faucets

Various Discord communities have setup devnet SOL Faucets as BOTs.

| Community      | Usage                                                       | Link                                         |
| -------------- | ----------------------------------------------------------- | -------------------------------------------- |
| The 76 Devs    | Run `!gibsol` in the BOT commands channel.                  | [Join Server](https://discord.gg/RrChGyDeRv) |
| The LamportDAO | Run `/drop <address> <amount>` in the BOT commands channel. | [Join Server](https://discord.gg/JBVrJgtFkq) |

## 6. Reuse devnet SOL

The most sustainable way to save SOL is to reuse it. With the Solana CLI you can
for examples show and close all previous buffer accounts like this:

```bash
solana program show --buffers
```

These are created when you deploy a program. All the programs data is
transferred into this account during the deploy and when its done the data of
your program is replaced with the new data. Sometimes these are not closed
correctly. You can close them like this to get the sol in them back:

```bash
solana program close <buffer account>
```

You can also the command

```bash
solana program show --programs
```

to show all programs you deployed already. You can then close them with the
following command to close them and retrieve the sol you used to deploy them:

```bash
solana program close <program id>
```

You can then use that sol to deploy new programs.

<Callout type="info">

Note though that you will not able to use the same program id again once you
closed a program. So make sure are closing the right program and that you will
not need that id anymore.

If you get rate limited you can add -u "urlToYourRpc" to the command to use a
different rpc.

</Callout>
