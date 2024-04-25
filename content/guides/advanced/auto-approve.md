---
title: How to auto approve transactions
description:
  To have a fluent game play you may want to be able to auto approve
  transactions
---

Auto approve means that the user does not have to confirm every transaction.
This is especially useful for on chain games where you want to have a fluid game
play. Here are some options on how this can be achieved.

## Wallet auto approve

1. Wallet auto approve [Solflare](https://solflare.com/) - and
   [Phantom](https://phantom.app/) wallet offers auto-approve functionality with
   burner wallets. This is a very convenient solution, but this limits your
   players to use one of these two wallets. Players may also be resistant to
   activate the feature since it may be seen as a security risk.

- [Solflare auto approve](https://twitter.com/solflare_wallet/status/1625950688709644324)
- [Phantom auto approve](https://phantom.app/learn/blog/auto-confirm)

## Local Keypair

Another way to do it is to create a key pair in your game/dapp and let the
player transfer some sol to that wallet and then use it to pay for transaction
fees. Only problem with this is that you need to handle the security for this
wallet and the keys can get lost if the users clear their browser.

- [Example Source Code](https://github.com/solana-developers/solana-game-examples/blob/main/seven-seas/unity/Assets/SolPlay/Scripts/Services/WalletHolderService.cs)
- [Example Game Seven seas](https://solplay.de/sevenseas/)

## Sign In Backend

You can pay the fees yourself, by creating and signing the transactions in the
backend and interact with it via an API. For that you send parameters to your
backend and sign the transaction there and send a confirmation to the client as
soon as it is done. This is an easy and convenient solution, but you need to
handle the users authentication and security.

## Session Keys

There is a feature called session keys maintained by
[Magic Block](https://www.magicblock.gg/). Session Keys are ephemeral keys with
fine-grained program/instruction scoping for tiered access in your Solana
programs. They allow users to interact with apps by signing transactions locally
using a temporary key pair that acts like a web2 auth token for a certain amount
of time. This is a nice solution, but needs some extra work to implement in the
on chain program.
[Link](https://docs.magicblock.gg/Onboarding/Session%20Keys/how-do-session-keys-work)

## Shadow Signer

[Honeycomb protocol](https://twitter.com/honeycomb_prtcl) shadow signer
Honeycomb developed a feature called shadow signer which allows you to sign
transactions.

- [How it works](https://twitter.com/honeycomb_prtcl/status/1777807635795919038)
- [Docs](https://docs.honeycombprotocol.com/services/)
