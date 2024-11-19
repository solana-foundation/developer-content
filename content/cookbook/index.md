---
sidebarSortOrder: 0
title: Solana Cookbook
seoTitle: Solana Cookbook - Code examples for Solana development
description:
  "The Solana Cookbook is a collection of code snippets, useful examples, and
  references for building on Solana."
---

# Solana Cookbook

The _Solana Cookbook_ is a developer resource that provides examples and
references for building applications on Solana. Each example and reference will
focus on specific aspects of Solana development while providing additional
details and usage examples.

## Development Guides

| Guide | Client | Description |
|-------|---------|-------------|
| [How to Start a Local Validator](/cookbook/development/start-local-validator.md) | cli | Set up and run a local Solana validator |
| [Connecting to a Solana Environment](/cookbook/development/connecting-to-solana.md) | web3.js | Connect to different Solana networks |
| [Getting Test SOL](/cookbook/development/getting-test-sol.md) | web3.js | Obtain SOL tokens for testing |
| [Subscribing to Events](/cookbook/development/subscribing-to-events.md) | web3.js | Listen to Solana program events |
| [Using Mainnet Accounts and Programs](/cookbook/development/using-mainnet.md) | cli | Work with production accounts and programs |

## Wallet Management

| Guide | Client | Description |
|-------|---------|-------------|
| [How to Create a Keypair](/cookbook/wallets/create-keypair.md) | web3.js | Generate new Solana keypairs |
| [How to Restore a Keypair](/cookbook/wallets/restore-keypair.md) | web3.js | Recover existing keypairs |
| [How to Verify a Keypair](/cookbook/wallets/verify-keypair.md) | web3.js | Validate keypair authenticity |
| [How to Validate a Public Key](/cookbook/wallets/validate-public-key.md) | web3.js | Check public key validity |
| [How to Generate Mnemonics for Keypairs](/cookbook/wallets/generate-mnemonic.md) | web3.js | Create seed phrases |
| [How to Restore a Keypair from a Mnemonic](/cookbook/wallets/restore-from-mnemonic.md) | web3.js | Recover keypairs using seed phrases |
| [How to Generate a Vanity Address](/cookbook/wallets/vanity-address.md) | cli | Create custom addresses |
| [How to Sign and Verify a Message](/cookbook/wallets/sign-verify-message.md) | web3.js | Message signing and verification |
| [How to Connect a Wallet with React](/cookbook/wallets/wallet-connect-react.md) | web3.js | Integrate wallets in React apps |

## Transaction Operations

| Guide | Client | Description |
|-------|---------|-------------|
| [How to Send SOL](/cookbook/transactions/send-sol.md) | web3.js | Transfer SOL between accounts |
| [How to Send Tokens](/cookbook/transactions/send-tokens.md) | web3.js | Transfer SPL tokens |
| [How to Calculate Transaction Cost](/cookbook/transactions/calculate-cost.md) | web3.js | Estimate transaction fees |
| [How to Add a Memo to a Transaction](/cookbook/transactions/add-memo.md) | web3.js | Include memos in transactions |
| [How to Add Priority Fees to a Transaction](/cookbook/transactions/priority-fees.md) | web3.js | Set transaction priorities |
| [How to Optimize Compute Requested](/cookbook/transactions/optimize-compute.md) | web3.js | Improve transaction efficiency |
| [Offline Transactions](/cookbook/transactions/offline-transactions.md) | web3.js | Handle offline operations |

## Account Management

| Guide | Client | Description |
|-------|---------|-------------|
| [How to Create an Account](/cookbook/accounts/create-account.md) | web3.js | Create new Solana accounts |
| [How to Calculate Account Creation Cost](/cookbook/accounts/creation-cost.md) | web3.js | Estimate account costs |
| [How to Create a PDA's Account](/cookbook/accounts/create-pda.md) | web3.js | Work with PDAs |
| [How to Sign with a PDA's Account](/cookbook/accounts/sign-pda.md) | web3.js | PDA signing operations |
| [How to Close an Account](/cookbook/accounts/close-account.md) | web3.js | Remove accounts |
| [How to Get Account Balance](/cookbook/accounts/get-balance.md) | web3.js | Check account balances |

## Program Development

| Guide | Client | Description |
|-------|---------|-------------|
| [How to Transfer SOL in a Solana Program](/cookbook/programs/transfer-sol.md) | web3.js | Program-based SOL transfers |
| [How to Get Clock in a Program](/cookbook/programs/get-clock.md) | web3.js | Access program clock |
| [How to Change Account Size](/cookbook/programs/change-account-size.md) | web3.js | Modify account sizes |
| [How to Do Cross Program Invocation](/cookbook/programs/cross-program-invocation.md) | web3.js | CPI operations |
| [How to Create a Program Derived Address](/cookbook/programs/create-pda.md) | web3.js | Generate PDAs |
| [How to Read Accounts in a Program](/cookbook/programs/read-accounts.md) | web3.js | Account data access |
| [Reading Multiple Instructions](/cookbook/programs/read-multiple-instructions.md) | web3.js | Handle multiple instructions |
| [How to Verify Accounts in a Solana Program](/cookbook/programs/verify-accounts.md) | web3.js | Account verification |

## Token Operations

| Guide | Client | Description |
|-------|---------|-------------|
| [How to Create a Token](/cookbook/tokens/create-token.md) | web3.js | Create new tokens |
| [How to Get a Token Mint](/cookbook/tokens/get-token-mint.md) | web3.js | Access token mints |
| [How to Create a Token Account](/cookbook/tokens/create-token-account.md) | web3.js | Set up token accounts |
| [How to Get a Token Account](/cookbook/tokens/get-token-account.md) | web3.js | Retrieve token accounts |
| [How to Get a Token Account's Balance](/cookbook/tokens/get-token-balance.md) | web3.js | Check token balances |
| [How to Mint Tokens](/cookbook/tokens/mint-tokens.md) | web3.js | Create new tokens |
| [How to Transfer Tokens](/cookbook/tokens/transfer-tokens.md) | web3.js | Move tokens between accounts |
| [How to Burn Tokens](/cookbook/tokens/burn-tokens.md) | web3.js | Remove tokens from circulation |
| [How to Close Token Accounts](/cookbook/tokens/close-token-accounts.md) | web3.js | Clean up token accounts |
| [How to Set Authority on Token Accounts or Mints](/cookbook/tokens/set-authority.md) | web3.js | Manage token permissions |
| [How to Delegate Token Accounts](/cookbook/tokens/delegate-tokens.md) | web3.js | Set up token delegation |
| [How to Revoke a Token Delegate](/cookbook/tokens/revoke-delegate.md) | web3.js | Remove delegates |
| [How to Use Wrapped SOL](/cookbook/tokens/wrapped-sol.md) | web3.js | Work with wrapped SOL |
| [How to Get All Token Accounts by Authority](/cookbook/tokens/get-token-accounts.md) | web3.js | List token accounts |
| [How to Create an NFT](/cookbook/tokens/create-nft.md) | web3.js | Mint NFTs |
| [How to Fetch the NFT Metadata](/cookbook/tokens/fetch-nft-metadata.md) | web3.js | Access NFT metadata |
| [How to Get the Owner of an NFT](/cookbook/tokens/get-nft-owner.md) | web3.js | Find NFT ownership |
| [How to Get All NFTs from a Wallet](/cookbook/tokens/get-wallet-nfts.md) | web3.js | List wallet NFTs |
