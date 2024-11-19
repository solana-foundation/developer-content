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

| Page Title                                                                                           | Client     |
| ---------------------------------------------------------------------------------------------------- | ---------- |
| [How to Start a Local Validator](/content/cookbook/development/start-local-validator)                | Solana CLI |
| [Connecting to a Solana Environment](/content/cookbook/development/connect-environment)              | Web3.js    |
| [Getting Test SOL](/content/cookbook/development/test-sol)                                           | Web3.js    |
| [Subscribing to Events](/content/cookbook/development/subscribing-events)                            | Web3.js    |
| [Using Mainnet Accounts and Programs](/content/cookbook/development/using-mainnet-accounts-programs) | Solana CLI |

### Wallets

| Page Title                                                                                  | Client              |
| ------------------------------------------------------------------------------------------- | ------------------- |
| [How to Create a Keypair](/content/cookbook/wallets/create-keypair)                         | Web3.js             |
| [How to Restore a Keypair](/content/cookbook/wallets/restore-keypair)                       | Web3.js             |
| [How to Verify a Keypair](/content/cookbook/wallets/verify-keypair)                         | Web3.js             |
| [How to Validate a Public Key](/content/cookbook/wallets/check-publickey)                   | Web3.js             |
| [How to Generate Mnemonics for Keypairs](/content/cookbook/wallets/generate-mnemonic)       | bip39               |
| [How to Restore a Keypair from a Mnemonic](/content/cookbook/wallets/restore-from-mnemonic) | Web3.js,bip39       |
| [How to Generate a Vanity Address](/content/cookbook/wallets/generate-vanity-address)       | Solana CLI          |
| [How to Sign and Verify a Message](/content/cookbook/wallets/sign-message)                  | Web3.js , TweetNaCl |
| [How to Connect a Wallet with React](/content/cookbook/wallets/connect-wallet-react)        | React, Web3.js      |

### Transactions

| Page Title                                                                                    | Client            |
| --------------------------------------------------------------------------------------------- | ----------------- |
| [How to Send SOL](/content/cookbook/transactions/send-sol)                                    | Web3.js           |
| [How to Send Tokens](/content/cookbook/transactions/send-tokens)                              | Web3.js           |
| [How to Calculate Transaction Cost](/content/cookbook/transactions/calculate-cost)            | Web3.js           |
| [How to Add a Memo to a Transaction](/content/cookbook/transactions/add-memo)                 | Web3.js           |
| [How to Add Priority Fees to a Transaction](/content/cookbook/transactions/add-priority-fees) | Web3.js           |
| [How to Optimize Compute Requested](/content/cookbook/transactions/optimize-compute)          | Web3.js           |
| [Offline Transactions](/content/cookbook/transactions/offline-transactions)                   | Web3.js,TweetNaCl |

### Accounts

| Page Title                                                                          | Client        |
| ----------------------------------------------------------------------------------- | ------------- |
| [How to Create an Account](/content/cookbook/accounts/create-account)               | Web3.js       |
| [How to Calculate Account Creation Cost](/content/cookbook/accounts/calculate-rent) | Web3.js       |
| [How to Create a PDA's Account](/content/cookbook/accounts/create-pda-account)      | Web3.js, Rust |
| [How to Sign with a PDA's Account](/content/cookbook/accounts/sign-with-pda)        | Rust          |
| [How to Close an Account](/content/cookbook/accounts/close-account)                 | Rust          |
| [How to Get Account Balance](/content/cookbook/accounts/get-account-balance)        | Web3.js       |

### Writing Programs

| Page Title                                                                                | Client       |
| ----------------------------------------------------------------------------------------- | ------------ |
| [How to Transfer SOL in a Solana Program](/content/cookbook/programs/transfer-sol)        | Rust         |
| [How to Get Clock in a Program](/content/cookbook/programs/clock)                         | Rust         |
| [How to Change Account Size](/content/cookbook/programs/change-account-size)              | Rust         |
| [How to do Cross Program Invocation](/content/cookbook/programs/cross-program-invocation) | Rust         |
| [How to Create a Program Derived Address](/content/cookbook/programs/create-pda)          | Rust         |
| [How to Read Accounts in a Program](/content/cookbook/programs/read-accounts)             | Rust         |
| [Reading Multiple Instructions](/content/cookbook/programs/read-multiple-instructions)    | Rust, Anchor |
| [How to Verify Accounts in a Solana Program](/content/cookbook/programs/verify-accounts)  | Rust         |

### Tokens

| Page Title                                                                                             | Client             |
| ------------------------------------------------------------------------------------------------------ | ------------------ |
| [How to Create a Token](/content/cookbook/tokens/create-mint-account)                                  | Web3.js, spl-token |
| [How to Get a Token Mint](/content/cookbook/tokens/get-token-mint)                                     | Web3.js, spl-token |
| [How to Create a Token Account](/content/cookbook/tokens/create-token-account)                         | Web3.js, spl-token |
| [How to Get a Token Account](/content/cookbook/tokens/get-token-account)                               | Web3.js, spl-token |
| [How to Get a Token Account's Balance](/content/cookbook/tokens/get-token-balance)                     | Web3.js,Rust       |
| [How to Mint Tokens](/content/cookbook/tokens/mint-tokens)                                             | Web3.js, spl-token |
| [How to Transfer Tokens](/content/cookbook/tokens/transfer-tokens)                                     | Web3.js, spl-token |
| [How to Burn Tokens](/content/cookbook/tokens/burn-tokens)                                             | Web3.js, spl-token |
| [How to Close Token Accounts](/content/cookbook/tokens/close-token-accounts)                           | Web3.js, spl-token |
| [How to Set Authority on Token Accounts or Mints](/content/cookbook/tokens/set-update-token-authority) | Web3.js, spl-token |
| [How to Delegate Token Accounts](/content/cookbook/tokens/approve-token-delegate)                      | Web3.js, spl-token |
| [How to Revoke a Token Delegate](/content/cookbook/tokens/revoke-token-delegate)                       | Web3.js, spl-token |
| [How to Use Wrapped SOL](/content/cookbook/tokens/manage-wrapped-sol)                                  | Web3.js, spl-token |
| [How to Get All Token Accounts by Authority](/content/cookbook/tokens/get-all-token-accounts)          | Web3.js, spl-token |
| [How to Create an NFT](/content/cookbook/tokens/create-nft)                                            | Metaplex, Web3.js  |
| [How to Fetch the NFT Metadata](/content/cookbook/tokens/fetch-nft-metadata)                           | Metaplex           |
| [How to Get the Owner of an NFT](/content/cookbook/tokens/get-nft-owner)                               | Web3.js            |
| [How to Get All NFTs from a Wallet](/content/cookbook/tokens/fetch-all-nfts)                           | Metaplex,Web3.js   |
