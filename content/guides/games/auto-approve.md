---
title: How to auto approve transactions
description:
  To have a fluent game play you may want to be able to auto approve
  transactions
---

To have a fluid game play for on-chain games it is beneficial to have an auto
approve wallet.

1. Wallet auto approve [Solflare](https://solflare.com/) - and
   [Phantom](https://phantom.app/) wallet offers auto-approve functionality with
   burner wallets, but this limits your players to use one of these two wallets.
   Players may also be resistant to activate the feature since it may be seen as
   a security risk.

[Solflare auto approve](https://twitter.com/solflare_wallet/status/1625950688709644324)<br />
[Phantom auto approve](https://phantom.app/learn/blog/auto-confirm)

## Local Keypair

Another way to do it is to create a key pair in your game and let the player
transfer some sol to that wallet and then use it to pay for transaction fees.
Only problem with this is that you need to handle the security for this wallet
and the players would need to have access to their seed phrase.

[Example Source Code](https://github.com/solana-developers/solana-game-examples/blob/main/seven-seas/unity/Assets/SolPlay/Scripts/Services/WalletHolderService.cs)<br />
[Example Game Seven seas](https://solplay.de/sevenseas/)<br />

## Sign in backend

You can pay the fees yourself, by creating and signing the transactions in the
backend and interact with it via an API. For that you send parameters to your
backend and sign the transaction there and send a confirmation to the client as
soon as it is done.

## Session Keys

There is a feature called session keys maintained by
[Magic Block](https://www.magicblock.gg/). Session Keys are ephemeral keys with
fine-grained program/instruction scoping for tiered access in your @solana
programs. They allow users to interact with apps by signing transactions locally
using a temporary key pair that acts like a web2 auth token for a certain amount
of time.
[Link](https://docs.magicblock.gg/Onboarding/Session%20Keys/how-do-session-keys-work)

## Shadow Signer

[Honeycomb protocol](https://twitter.com/honeycomb_prtcl) shadow signer
Honeycomb developed a featuer called shadow signer which allows you to sign
transactions.
[How it works](https://twitter.com/honeycomb_prtcl/status/1777807635795919038)
[Docs](https://docs.honeycombprotocol.com/services/)
