---
sidebarSortOrder: 0
title: Solana Cookbook
seoTitle: Solana Cookbook - Code examples for Solana development
description:
  "The Solana Cookbook is a collection of code snippets, useful examples, and
  references for building on Solana."
---

The _Solana Cookbook_ is a developer resource that provides examples and
references for building applications on Solana. Each example and reference will
focus on specific aspects of Solana development while providing additional
details and usage examples.

## Table of Contents

### Development

| Page Title                                                                                                                | Client     |
| ------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [How to Start a Local Validator](https://solana.com/developers/cookbook/development/start-local-validator)                | Solana CLI |
| [Connecting to a Solana Environment](https://solana.com/developers/cookbook/development/connect-environment)              | Web3.js    |
| [Getting Test SOL](https://solana.com/developers/cookbook/development/test-sol)                                           | Web3.js    |
| [Subscribing to Events](https://solana.com/developers/cookbook/development/subscribing-events)                            | Web3.js    |
| [Using Mainnet Accounts and Programs](https://solana.com/developers/cookbook/development/using-mainnet-accounts-programs) | Solana CLI |

### Wallets

| Page Title                                                                                                       | Client              |
| ---------------------------------------------------------------------------------------------------------------- | ------------------- |
| [How to Create a Keypair](https://solana.com/developers/cookbook/wallets/create-keypair)                         | Web3.js             |
| [How to Restore a Keypair](https://solana.com/developers/cookbook/wallets/restore-keypair)                       | Web3.js             |
| [How to Verify a Keypair](https://solana.com/developers/cookbook/wallets/verify-keypair)                         | Web3.js             |
| [How to Validate a Public Key](https://solana.com/developers/cookbook/wallets/check-publickey)                   | Web3.js             |
| [How to Generate Mnemonics for Keypairs](https://solana.com/developers/cookbook/wallets/generate-mnemonic)       | bip39               |
| [How to Restore a Keypair from a Mnemonic](https://solana.com/developers/cookbook/wallets/restore-from-mnemonic) | Web3.js,bip39       |
| [How to Generate a Vanity Address](https://solana.com/developers/cookbook/wallets/generate-vanity-address)       | Solana CLI          |
| [How to Sign and Verify a Message](https://solana.com/developers/cookbook/wallets/sign-message)                  | Web3.js , TweetNaCl |
| [How to Connect a Wallet with React](https://solana.com/developers/cookbook/wallets/connect-wallet-react)        | React, Web3.js      |

### Transactions

| Page Title                                                                                                         | Client            |
| ------------------------------------------------------------------------------------------------------------------ | ----------------- |
| [How to Send SOL](https://solana.com/developers/cookbook/transactions/send-sol)                                    | Web3.js           |
| [How to Send Tokens](https://solana.com/developers/cookbook/transactions/send-tokens)                              | Web3.js           |
| [How to Calculate Transaction Cost](https://solana.com/developers/cookbook/transactions/calculate-cost)            | Web3.js           |
| [How to Add a Memo to a Transaction](https://solana.com/developers/cookbook/transactions/add-memo)                 | Web3.js           |
| [How to Add Priority Fees to a Transaction](https://solana.com/developers/cookbook/transactions/add-priority-fees) | Web3.js           |
| [How to Optimize Compute Requested](https://solana.com/developers/cookbook/transactions/optimize-compute)          | Web3.js           |
| [Offline Transactions](https://solana.com/developers/cookbook/transactions/offline-transactions)                   | Web3.js,TweetNaCl |

### Accounts

| Page Title                                                                                               | Client        |
| -------------------------------------------------------------------------------------------------------- | ------------- |
| [How to Create an Account](https://solana.com/developers/cookbook/accounts/create-account)               | Web3.js       |
| [How to Calculate Account Creation Cost](https://solana.com/developers/cookbook/accounts/calculate-rent) | Web3.js       |
| [How to Create a PDA's Account](https://solana.com/developers/cookbook/accounts/create-pda-account)      | Web3.js, Rust |
| [How to Sign with a PDA's Account](https://solana.com/developers/cookbook/accounts/sign-with-pda)        | Rust          |
| [How to Close an Account](https://solana.com/developers/cookbook/accounts/close-account)                 | Rust          |
| [How to Get Account Balance](https://solana.com/developers/cookbook/accounts/get-account-balance)        | Web3.js       |

### Writing Programs

| Page Title                                                                                                     | Client       |
| -------------------------------------------------------------------------------------------------------------- | ------------ |
| [How to Transfer SOL in a Solana Program](https://solana.com/developers/cookbook/programs/transfer-sol)        | Rust         |
| [How to Get Clock in a Program](https://solana.com/developers/cookbook/programs/clock)                         | Rust         |
| [How to Change Account Size](https://solana.com/developers/cookbook/programs/change-account-size)              | Rust         |
| [How to do Cross Program Invocation](https://solana.com/developers/cookbook/programs/cross-program-invocation) | Rust         |
| [How to Create a Program Derived Address](https://solana.com/developers/cookbook/programs/create-pda)          | Rust         |
| [How to Read Accounts in a Program](https://solana.com/developers/cookbook/programs/read-accounts)             | Rust         |
| [Reading Multiple Instructions](https://solana.com/developers/cookbook/programs/read-multiple-instructions)    | Rust, Anchor |
| [How to Verify Accounts in a Solana Program](https://solana.com/developers/cookbook/programs/verify-accounts)  | Rust         |

### Tokens

| Page Title                                                                                                                  | Client             |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| [How to Create a Token](https://solana.com/developers/cookbook/tokens/create-mint-account)                                  | Web3.js, spl-token |
| [How to Get a Token Mint](https://solana.com/developers/cookbook/tokens/get-token-mint)                                     | Web3.js, spl-token |
| [How to Create a Token Account](https://solana.com/developers/cookbook/tokens/create-token-account)                         | Web3.js, spl-token |
| [How to Get a Token Account](https://solana.com/developers/cookbook/tokens/get-token-account)                               | Web3.js, spl-token |
| [How to Get a Token Account's Balance](https://solana.com/developers/cookbook/tokens/get-token-balance)                     | Web3.js,Rust       |
| [How to Mint Tokens](https://solana.com/developers/cookbook/tokens/mint-tokens)                                             | Web3.js, spl-token |
| [How to Transfer Tokens](https://solana.com/developers/cookbook/tokens/transfer-tokens)                                     | Web3.js, spl-token |
| [How to Burn Tokens](https://solana.com/developers/cookbook/tokens/burn-tokens)                                             | Web3.js, spl-token |
| [How to Close Token Accounts](https://solana.com/developers/cookbook/tokens/close-token-accounts)                           | Web3.js, spl-token |
| [How to Set Authority on Token Accounts or Mints](https://solana.com/developers/cookbook/tokens/set-update-token-authority) | Web3.js, spl-token |
| [How to Delegate Token Accounts](https://solana.com/developers/cookbook/tokens/approve-token-delegate)                      | Web3.js, spl-token |
| [How to Revoke a Token Delegate](https://solana.com/developers/cookbook/tokens/revoke-token-delegate)                       | Web3.js, spl-token |
| [How to Use Wrapped SOL](https://solana.com/developers/cookbook/tokens/manage-wrapped-sol)                                  | Web3.js, spl-token |
| [How to Get All Token Accounts by Authority](https://solana.com/developers/cookbook/tokens/get-all-token-accounts)          | Web3.js, spl-token |
| [How to Create an NFT](https://solana.com/developers/cookbook/tokens/create-nft)                                            | Metaplex, Web3.js  |
| [How to Fetch the NFT Metadata](https://solana.com/developers/cookbook/tokens/fetch-nft-metadata)                           | Metaplex           |
| [How to Get the Owner of an NFT](https://solana.com/developers/cookbook/tokens/get-nft-owner)                               | Web3.js            |
| [How to Get All NFTs from a Wallet](https://solana.com/developers/cookbook/tokens/fetch-all-nfts)                           | Metaplex,Web3.js   |
