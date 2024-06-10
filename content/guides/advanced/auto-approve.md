---
date: 2024-04-25T00:00:00Z
difficulty: beginner
title: How to auto approve transactions
seoTitle: How to auto approve transactions on Solana
description:
  By auto approving transactions dApps and games can create a more fluid user
  experience. This is especially interesting for on-chain games.
tags:
  - games
  - wallets
  - transactions
  - unity
keywords:
  - tutorial
  - auto approve
  - transactions
  - blockchain developer
  - blockchain tutorial
  - web3 developer
---

Auto approving transactions means that the user does not have to manually
confirm every transaction. This is especially useful for on-chain games where
you want to have fluid game play. Here are some options on how this can be
achieved.

## Wallet Auto Approve

A few popular Solana wallet applications have transaction "auto approve"
functionality directly with in them. Some accomplish this with burner wallets.
This is a very convenient solution, but it may limit your players to using one
of these wallets. Players may also be resistant to activate the feature since it
may be seen as a security risk.

- [Solflare auto approve](https://twitter.com/solflare_wallet/status/1625950688709644324)
- [Phantom auto approve](https://phantom.app/learn/blog/auto-confirm)

## Local Keypair

Another way to add transaction auto approval is to create a keypair in your
game/dApp and let the player transfer some SOL to that wallet and then use it to
pay for transaction fees. The only problem with this is that you need to handle
the security for this wallet and the keys can get lost if the users clear their
browser cache.

Here, you can find some example source code on how to implement transaction auto
approval using local keypairs:

- [Example Source Code](https://github.com/solana-developers/solana-game-examples/blob/main/seven-seas/unity/Assets/SolPlay/Scripts/Services/WalletHolderService.cs)
- [Example Game Seven seas](https://solplay.de/sevenseas/)

## Server Backend

Using a server backend for your game or dApp, you can configure a system that
will allow your backend to handle paying the [Solana fees](/docs/core/fees.md)
yourself. This backend would allow you to create and sign transactions for the
user, marking your secure backend keypair the `fee payer`, and enabling your
application to interact with it via an API endpoint.

To accomplish this, your client application (i.e. game or dApp) would send
parameters to your backend server. The backend server would then authenticate
that request and the build a transaction with the required data from the user.
The backend would then sign and send this transaction to the Solana blockchain,
confirm the transaction was successful, and send a confirmation message to the
client.

This server backend method is an easy and convenient solution, but you need to
handle the user's authentication and security. So that could add complexity to
your application's infrastructure and architecture.

## Session Keys

Session Keys are ephemeral (short lived) keypairs with fine-grained
program/instruction scoping for tiered access in your Solana programs. They
allow users to interact with apps by signing transactions locally using a
temporary keypair. The temporary keypair acts a bit like an oauth token from web
2, allowing access for a certain amount of time.

Session keys make for a really great user experience, but they do need some
extra work to implement in the on-chain program. You can use the `session-keys`
crate maintained by [Magic Block](https://www.magicblock.gg/) using their
[official documentation](https://docs.magicblock.gg/Onboarding/Session%20Keys/integrating-sessions-in-your-program).

## Shadow Signer

Shadow signer is a feature within the
[Honeycomb Protocol](https://twitter.com/honeycomb_prtcl) that allows you to
sign transactions.

- [How Shadow Signer works](https://twitter.com/honeycomb_prtcl/status/1777807635795919038)
- [Docs](https://docs.honeycombprotocol.com/services/)
