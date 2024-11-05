---
title: "Program Examples"
description:
  "A list of Solana program examples in different languages and frameworks,
  which can help you learn and use as reference for your own projects."
tags:
  - quickstart
  - program
  - anchor
  - javascript
  - native
  - rust
  - token22
  - token extensions
keywords:
  - rust
  - cargo
  - toml
  - program
  - tutorial
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - anchor
sidebarSortOrder: 3
---

The
[Solana Program Examples](https://github.com/solana-developers/program-examples)
repository on GitHub offers several subfolders, each containing code examples
for different Solana programming paradigms and languages, designed to help
developers learn and experiment with Solana blockchain development.

You can find the examples in the `solana-developers/program-examples` together
with README files that explain you how to run the different examples. Most
examples are self-contained and are available in native Rust (ie, with no
framework) and [Anchor](https://www.anchor-lang.com/docs/installation). It also
contains a list of examples that we would love to
[see as contributions](https://github.com/solana-developers/program-examples?tab=readme-ov-file#examples-wed-love-to-see).

Within the repo you will find the following subfolder, each with assorted
example programs within them:

- [Basics](#basics)
- [Compression](#compression)
- [Oracles](#oracles)
- [Tokens](#tokens)
- [Token 2022 (Token Extensions)](#token-2022-token-extensions)
- [Break](#break)
  - [Build and Run](#build-and-run)

## Basics

Contains a series of examples that demonstrate the foundational steps for
building Solana programs using native Rust libraries. These examples are
designed to help developers understand the core concepts of Solana programming.

| Example Name                                                                                                                  | Description                                                                                      | Language                  |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------- |
| [Account Data](https://github.com/solana-developers/program-examples/tree/main/basics/account-data)                           | Saving an address with name, house number, street and city in an account.                        | Native, Anchor            |
| [Checking Accounts](https://github.com/solana-developers/program-examples/tree/main/basics/checking-accounts)                 | Security lessons that shows how to do account checks                                             | Native, Anchor            |
| [Close Account](https://github.com/solana-developers/program-examples/tree/main/basics/close-account)                         | Show you how to close accounts to get its rent back.                                             | Native, Anchor            |
| [Counter](https://github.com/solana-developers/program-examples/tree/main/basics/counter)                                     | A simple counter program in all the different architectures.                                     | Native, Anchor, mpl-stack |
| [Create Account](https://github.com/solana-developers/program-examples/tree/main/basics/create-account)                       | How to create a system account within a program.                                                 | Native, Anchor            |
| [Cross Program Invocation](https://github.com/solana-developers/program-examples/tree/main/basics/cross-program-invocation)   | Using a hand and lever analogy this shows you how to call another program from within a program. | Native, Anchor            |
| [hello solana](https://github.com/solana-developers/program-examples/tree/main/basics/hello-solana)                           | Hello world example which just prints hello world in the transaction logs.                       | Native, Anchor            |
| [Pda Rent payer](https://github.com/solana-developers/program-examples/tree/main/basics/pda-rent-payer)                       | Shows you how you can use the lamports from a PDA to pay for a new account.                      | Native, Anchor            |
| [Processing Instructions](https://github.com/solana-developers/program-examples/tree/main/basics/processing-instructions)     | Shows you how to handle instruction data string and u32.                                         | Native, Anchor            |
| [Program Derived Addresses](https://github.com/solana-developers/program-examples/tree/main/basics/program-derived-addresses) | Shows how to use seeds to refer to a PDA and save data in it.                                    | Native, Anchor            |
| [Realloc](https://github.com/solana-developers/program-examples/tree/main/basics/realloc)                                     | Shows you how to increase and decrease the size of an existing account.                          | Native, Anchor            |
| [Rent](https://github.com/solana-developers/program-examples/tree/main/basics/rent)                                           | Here you will learn how to calculate rent requirements within a program.                         | Native, Anchor            |
| [Repository Layout](https://github.com/solana-developers/program-examples/tree/main/basics/repository-layout)                 | Recommendations on how to structure your program layout.                                         | Native, Anchor            |
| [Transfer SOL](https://github.com/solana-developers/program-examples/tree/main/basics/transfer-sol)                           | Different methods of transferring SOL for system accounts and PDAs.                              | Native, Anchor, Seahorse  |

## Compression

Contains a series of examples that demonstrate how to use
[state compression](/docs/advanced/state-compression.md) on Solana. Mainly
focused on compressed NFTs (cNFTs).

| Example Name                                                                                                | Description                                                                         | Language |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------- |
| [cNFT-burn](https://github.com/solana-developers/program-examples/tree/main/compression/cnft-burn)          | To destroy a cNFT it can be burnt. This examples shows how to do that in a program. | Anchor   |
| [cNFT-Vault](https://github.com/solana-developers/program-examples/tree/main/compression/cnft-vault/anchor) | How to custody a cNFT in a program and send it out again.                           | Anchor   |
| [cutils](https://github.com/solana-developers/program-examples/tree/main/compression/cutils)                | A suite utils to for example mint and verify cNFTs in a program.                    | Anchor   |

## Oracles

Oracles allow to use off chain data in programs.

| Example Name                                                                         | Description                                                     | Language |
| ------------------------------------------------------------------------------------ | --------------------------------------------------------------- | -------- |
| [Pyth](https://github.com/solana-developers/program-examples/tree/main/oracles/pyth) | Pyth makes price data of tokens available in on chain programs. | Anchor   |

## Tokens

Most tokens on Solana use the Solana Program Library (SPL) token standard. Here
you can find many examples on how to mint, transfer, burn tokens and even how to
interact with them in programs.

| Example Name                                                                                                    | Description                                                                                       | Language       |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------- |
| [Create Token](https://github.com/solana-developers/program-examples/tree/main/tokens/create-token)             | How to create a token and add metaplex metadata to it.                                            | Anchor, Native |
| [NFT Minter](https://github.com/solana-developers/program-examples/tree/main/tokens/nft-minter)                 | Minting only one amount of a token and then removing the mint authority.                          | Anchor, Native |
| [PDA Mint Authority](https://github.com/solana-developers/program-examples/tree/main/tokens/pda-mint-authority) | Shows you how to change the mint authority of a mint, to mint tokens from within a program.       | Anchor, Native |
| [SPL Token Minter](https://github.com/solana-developers/program-examples/tree/main/tokens/spl-token-minter)     | Explains how to use Associated Token Accounts to be able to keep track of token accounts.         | Anchor, Native |
| [Token Swap](https://github.com/solana-developers/program-examples/tree/main/tokens/token-swap)                 | Extensive example that shows you how to build a AMM (automated market maker) pool for SPL tokens. | Anchor         |
| [Transfer Tokens](https://github.com/solana-developers/program-examples/tree/main/tokens/transfer-tokens)       | Shows how to transfer SPL token using CPIs into the token program.                                | Anchor, Native |
| [Token-2022](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022)                 | See Token 2022 (Token extensions).                                                                | Anchor, Native |

## Token 2022 (Token Extensions)

Token 2022 is a new standard for tokens on Solana. It is a more flexible and
lets you add 16 different extensions to a token mint to add more functionality
to it. A full list of the extensions can be found in the
[Getting Started Guide](https://solana.com/developers/guides/token-extensions/getting-started)

| Example Name                                                                                                                            | Description                                                                                                       | Language |
| --------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------- |
| [Basics](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/basics/anchor)                               | How to create a token, mint and transfer it.                                                                      | Anchor   |
| [Default account state](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/default-account-state/native) | This extension lets you create token accounts with a certain state, for example frozen.                           | Native   |
| [Mint Close Authority](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/mint-close-authority)          | With the old token program it was not possible to close a mint. Now it is.                                        | Native   |
| [Multiple Extensions](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/multiple-extensions)            | Shows you how you can add multiple extensions to a single mint                                                    | Native   |
| [NFT Metadata pointer](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/nft-meta-data-pointer)         | It is possible to use the metadata extension to create NFTs and add dynamic on chain metadata.                    | Anchor   |
| [Not Transferable](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/non-transferable/native)           | Useful for example for achievements, referral programs or any soul bound tokens.                                  | Native   |
| [Transfer fee](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/transfer-fees)                         | Every transfer of the tokens hold some tokens back in the token account which can then be collected.              | Native   |
| [Transfer Hook](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/transfer-hook)                        | Four examples to add additional functionality to your token using a CPI from the token program into your program. | Anchor   |

## Break

[Break](https://break.solana.com/) is a React app that gives users a visceral
feeling for just how fast and high-performance the Solana network really is. Can
you _break_ the Solana blockchain? During a 15 second play-through, each click
of a button or keystroke sends a new transaction to the cluster. Smash the
keyboard as fast as you can and watch your transactions get finalized in
real-time while the network takes it all in stride!

Break can be played on our Devnet, Testnet and Mainnet Beta networks. Plays are
free on Devnet and Testnet, where the session is funded by a network faucet. On
Mainnet Beta, users pay to play 0.08 SOL per game. The session account can be
funded by a local keystore wallet or by scanning a QR code from Trust Wallet to
transfer the tokens.

[Click here to play Break](https://break.solana.com/)

### Build and Run

First fetch the latest version of the example code:

```shell
git clone https://github.com/solana-labs/break.git
cd break
```

Next, follow the steps in the git repository's
[README](https://github.com/solana-labs/break/blob/main/README.md).
