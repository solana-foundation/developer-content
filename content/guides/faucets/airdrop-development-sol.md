---
date: Jul 29, 2023
difficulty: intro
title: "SOL Faucets for Testing Networks"
description:
  "How to acquire SOL, the native currency of the Solana blockchain on it's
  development testing networks ?"
tags:
  - faucet
keywords:
  - faucet
  - blockchain
  - devnet
  - testnet
---

# **SOL for Solana Testing Networks**

This is a collection of the different ways for developers to acquire SOL on
Solana's testing networks, the Solana devnet and testnet.

# 1. Solana Airdrop

_Available on Devnet and Testnet_

This is the base way of acquiring SOL, but it can be subject to rate limits when
there is a high number of airdrops.

Here are three different ways of requesting airdrops with it:

**With the Solana CLI:**

`solana airdrop 2`

**Using a web faucet:**

[solfaucet.com](https://solfaucet.com)

_⚠️ SolFaucet is not maintained by the Solana Foundation_

**Using web3.js:**

```js
const connection = new Connection("https://api.devnet.solana.com");
connection.requestAirdrop();
```
See more: [`requestAirdrop()`](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#requestAirdrop) documentation inside web3.js.
# 2. Web Faucet

_Available for Devnet_

A web faucet hosted by Solana Foundation that has lower rate limits.

[faucet.solana.com](https://faucet.solana.com)

# 3. RPC Provider Faucets

_Available for Devnet_

RPC Providers can opt in to distributing Devnet SOL via their Devnet Validators.

_\*If you are an RPC Provider and want to distribute SOL please get in touch
here_

Currently Supported:

1. **[Helius](https://www.helius.dev/)**
2. **[QuickNode](https://www.quicknode.com/chains/sol)**

**Using the Solana CLI**

Specify your Cluster to be your RPC Providers URL.

`solana config set --url <your RPC url>`

Then you can request an airdrop like you would in the first option in this
guide.

`solana airdrop 2`

**Using Web3.js**

```js
const connection = new Connection("your RPC url");
connection.requestAirdrop();
```

# 4. POW Faucet

_Available for Devnet_

This is a proof of work Faucet where Devnet SOL can be distributed to you thanks
to your computing power.

**Install the Devnet POW Crate:**

`cargo install devnet-pow`

**Start mining devnet SOL**

`devnet-pow mine`

_The POW Faucet is maintained by Ellipsis Labs_

# 5. Discord Faucet

The LamportDAO community has set up a Devnet Faucet Discord BOT.

You can join the LamportDAO Discord by clicking
[here](https://discord.gg/JBVrJgtFkq).

After that, head to a channel made for BOT commands and run send this message:

`/drop <address> <amount>`
