---
sidebarSortOrder: 0
title: Solana Cookbook
seoTitle: Solana Cookbook - Code examples for Solana development
description:
  "The Solana Cookbook is a collection of code snippets, useful examples, and
  references for building on Solana."
---

The Solana Cookbook is a developer resource that provides examples and
references for building applications on Solana. Each example and reference will
focus on specific aspects of Solana development while providing additional
details and usage examples.

## Development Guides

Development guides help developers set up and interact with the Solana ecosystem
using various tools and clients.

| Guide                                                                                  | Client     | Description                                |
| -------------------------------------------------------------------------------------- | ---------- | ------------------------------------------ |
| [How to Start a Local Validator](/development/start-local-validator.md)                | Solana CLI | Set up and run a local Solana validator    |
| [Connecting to a Solana Environment](/development/connect-environment.md)              | web3.js    | Connect to different Solana networks       |
| [Getting Test SOL](/development/test-sol.md)                                           | web3.js    | Obtain SOL tokens for testing              |
| [Subscribing to Events](/development/subscribing-events.md)                            | web3.js    | Listen to Solana program events            |
| [Using Mainnet Accounts and Programs](/development/using-mainnet-accounts-programs.md) | Solana CLI | Work with production accounts and programs |

## Wallet Management

Learn how to create, restore, and manage Solana wallets using various tools and
libraries.

| Guide                                                                         | Client             | Description                         |
| ----------------------------------------------------------------------------- | ------------------ | ----------------------------------- |
| [How to Create a Keypair](/wallets/create-keypair.md)                         | web3.js            | Generate new Solana keypairs        |
| [How to Restore a Keypair](/wallets/restore-keypair.md)                       | web3.js            | Recover existing keypairs           |
| [How to Verify a Keypair](/wallets/verify-keypair.md)                         | web3.js            | Validate keypair authenticity       |
| [How to Validate a Public Key](/wallets/check-publickey.md)                   | web3.js            | Check public key validity           |
| [How to Generate Mnemonics for Keypairs](/wallets/generate-mnemonic.md)       | bip39              | Create seed phrases                 |
| [How to Restore a Keypair from a Mnemonic](/wallets/restore-from-mnemonic.md) | web3.js, bip39     | Recover keypairs using seed phrases |
| [How to Generate a Vanity Address](/wallets/generate-vanity-address.md)       | Solana CLI         | Create custom addresses             |
| [How to Sign and Verify a Message](/wallets/sign-message.md)                  | web3.js, tweetNaCl | Message signing and verification    |
| [How to Connect a Wallet with React](/wallets/connect-wallet-react.md)        | React, web3.js     | Integrate wallets in React apps     |

## Transaction Operations

Explore various transaction-related operations on the Solana blockchain.

| Guide                                                                           | Client             | Description                    |
| ------------------------------------------------------------------------------- | ------------------ | ------------------------------ |
| [How to Send SOL](/transactions/send-sol.md)                                    | web3.js            | Transfer SOL between accounts  |
| [How to Send Tokens](/transactions/send-tokens.md)                              | web3.js            | Transfer SPL tokens            |
| [How to Calculate Transaction Cost](/transactions/calculate-cost.md)            | web3.js            | Estimate transaction fees      |
| [How to Add a Memo to a Transaction](/transactions/add-memo.md)                 | web3.js            | Include memos in transactions  |
| [How to Add Priority Fees to a Transaction](/transactions/add-priority-fees.md) | web3.js            | Set transaction priorities     |
| [How to Optimize Compute Requested](/transactions/optimize-compute.md)          | web3.js            | Improve transaction efficiency |
| [Offline Transactions](/transactions/offline-transactions.md)                   | web3.js, tweetNaCl | Handle offline operations      |

## Account Management

Learn how to manage Solana accounts effectively.

| Guide                                                                    | Client        | Description                |
| ------------------------------------------------------------------------ | ------------- | -------------------------- |
| [How to Create an Account](/accounts/create-account.md)                  | web3.js       | Create new Solana accounts |
| [How to Calculate Account Creation Cost](/accounts/calculate-account.md) | web3.js       | Estimate account costs     |
| [How to Create a PDA's Account](/accounts/create-pda.md)                 | web3.js, Rust | Work with PDAs             |
| [How to Sign with a PDA's Account](/accounts/sign-with-pda.md)           | Rust          | PDA signing operations     |
| [How to Close an Account](/accounts/close-account.md)                    | Rust          | Remove accounts            |
| [How to Get Account Balance](/accounts/get-account-balance.md)           | web3.js       | Check account balances     |

## Program Development

Develop Solana programs with these comprehensive guides.

| Guide                                                                       | Client | Description                  |
| --------------------------------------------------------------------------- | ------ | ---------------------------- |
| [How to Transfer SOL in a Solana Program](/programs/transfer-sol.md)        | Rust   | Program-based SOL transfers  |
| [How to Get Clock in a Program](/programs/clock.md)                         | Rust   | Access program clock         |
| [How to Change Account Size](/programs/change-account-size.md)              | Rust   | Modify account sizes         |
| [How to Do Cross Program Invocation](/programs/cross-program-invocation.md) | Rust   | CPI operations               |
| [How to Create a Program Derived Address](/programs/create-pda.md)          | Rust   | Generate PDAs                |
| [How to Read Accounts in a Program](/programs/read-accounts.md)             | Rust   | Account data access          |
| [Reading Multiple Instructions](/programs/read-multiple-instructions.md)    | Rust   | Handle multiple instructions |
| [How to Verify Accounts in a Solana Program](/programs/verify-accounts.md)  | Rust   | Account verification         |

## Token Operations

Comprehensive guides for working with tokens on Solana.

| Guide                                                                                    | Client             | Description                    |
| ---------------------------------------------------------------------------------------- | ------------------ | ------------------------------ |
| [How to Create a Token](/tokens/create-token.md)                                         | web3.js, spl-token | Create new tokens              |
| [How to Get a Token Mint](/tokens/get-token-mint.md)                                     | web3.js, spl-token | Access token mints             |
| [How to Create a Token Account](/tokens/create-token-account.md)                         | web3.js, spl-token | Set up token accounts          |
| [How to Get a Token Account](/tokens/get-token-account.md)                               | web3.js, spl-token | Retrieve token accounts        |
| [How to Get a Token Account's Balance](/tokens/get-token-balance.md)                     | web3.js, rust      | Check token balances           |
| [How to Mint Tokens](/tokens/mint-tokens.md)                                             | web3.js, spl-token | Create new tokens              |
| [How to Transfer Tokens](/tokens/transfer-tokens.md)                                     | web3.js, spl-token | Move tokens between accounts   |
| [How to Burn Tokens](/tokens/burn-tokens.md)                                             | web3.js, spl-token | Remove tokens from circulation |
| [How to Close Token Accounts](/tokens/close-token-accounts.md)                           | web3.js, spl-token | Clean up token accounts        |
| [How to Set Authority on Token Accounts or Mints](/tokens/set-update-token-authority.md) | web3.js            | Manage token permissions       |
| [How to Delegate Token Accounts](/tokens/approve-token-delegate.md)                      | web3.js, spl-token | Set up token delegation        |
| [How to Revoke a Token Delegate](/tokens/revoke-token-delegate.md)                       | web3.js, spl-token | Remove delegates               |
| [How to Use Wrapped SOL](/tokens/manage-wrapped-sol.md)                                  | web3.js, spl-token | Work with wrapped SOL          |
| [How to Get All Token Accounts by Authority](/tokens/get-all-token-accounts.md)          | web3.js, spl-token | List token accounts            |
| [How to Create an NFT](/tokens/create-nft.md)                                            | Metaplex, web3.js  | Mint NFTs                      |
| [How to Fetch the NFT Metadata](/tokens/fetch-nft-metadata.md)                           | Metaplex           | Access NFT metadata            |
| [How to Get the Owner of an NFT](/tokens/get-nft-owner.md)                               | web3.js            | Find NFT ownership             |
| [How to Get All NFTs from a Wallet](/tokens/fetch-all-nfts.md)                           | Metaplex, web3.js  | List wallet NFTs               |
