---
sidebarLabel: Wallets
title: Solana Wallet Guide
sidebarSortOrder: 3
---

This document describes the different wallet options that are available to users
of Solana who want to be able to send, receive and interact with SOL tokens on
the Solana blockchain.

## What is a Wallet?

A crypto wallet is a device or application that stores a collection of keys and
can be used to send, receive, and track ownership of cryptocurrencies. Wallets
can take many forms. A wallet might be a directory or file in your computer's
file system, a piece of paper, or a specialized device called a _hardware
wallet_. There are also various smartphone apps and computer programs that
provide a user-friendly way to create and manage wallets.

### Keypair

A [_keypair_](/docs/terminology.md#keypair) is a securely generated
[_secret key_](#secret-key) and its cryptographically-derived
[_public key_](#public-key). A secret key and its corresponding public key are
together known as a _keypair_. A wallet contains a collection of one or more
keypairs and provides some means to interact with them.

### Public key

The [_public key_](/docs/terminology.md#public-key-pubkey) (commonly shortened
to _pubkey_) is known as the wallet's _receiving address_ or simply its
_address_. The wallet address **may be shared and displayed freely**. When
another party is going to send some amount of cryptocurrency to a wallet, they
need to know the wallet's receiving address. Depending on a blockchain's
implementation, the address can also be used to view certain information about a
wallet, such as viewing the balance, but has no ability to change anything about
the wallet or withdraw any tokens.

### Secret key

The [_secret key_](/docs/terminology.md#private-key) (also referred to as
_private key_) is required to digitally sign any transactions to send
cryptocurrencies to another address or to make any changes to the wallet. The
secret key **must never be shared**. If someone gains access to the secret key
to a wallet, they can withdraw all the tokens it contains. If the secret key for
a wallet is lost, any tokens that have been sent to that wallet's address are
**permanently lost**.

## Security

Different wallet solutions offer different approaches to keypair security,
interacting with the keypair, and signing transactions to use/spend the tokens.
Some are easier to use than others. Some store and back up secret keys more
securely. Solana supports multiple types of wallets so you can choose the right
balance of security and convenience.

**If you want to be able to receive SOL tokens on the Solana blockchain, you
first will need to create a wallet.**

## Supported Wallets

Several browser and mobile app based wallets support Solana. Find some options
that might be right for you on the [Solana Wallets](https://solana.com/wallets)
page.

For advanced users or developers, the
[command-line wallets](https://docs.solanalabs.com/cli/wallets) may be more
appropriate, as new features on the Solana blockchain will always be supported
on the command line first before being integrated into third-party solutions.
