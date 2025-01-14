---
sidebarLabel: Quick Start
title: Solana Quick Start Guide
sidebarSortOrder: 0
description:
  Learn Solana development basics. Create your first program, understand
  accounts, send transactions, and explore PDAs and CPIs using Solana Playground
  - no installation required.
---

Welcome to the Solana Quick Start Guide! This hands-on guide will introduce you
to the core concepts for building on Solana, regardless of your prior
experience. By the end of this tutorial, you'll have a basic foundation in
Solana development and be ready to explore more advanced topics.

## What You'll Learn

In this tutorial, you'll learn about:

- Understanding Accounts: Explore how data is stored on the Solana network.
- Sending Transactions: Learn to interact with the Solana network by sending
  transactions.
- Building and Deploying Programs: Create your first Solana program and deploy
  it to the network.
- Program Derived Addresses (PDAs): Learn how to use PDAs to create
  deterministic addresses for accounts.
- Cross-Program Invocations (CPIs): Learn how to make your programs interact
  with other programs on Solana.

The best part? You don't need to install anything! We'll be using Solana
Playground, a browser-based development environment, for all our examples. This
means you can follow along, copy and paste code, and see results immediately,
all from your web browser. Basic programming knowledge is helpful but not
required.

Let's dive in and start building on Solana!

## Solana Playground

Solana Playground (Solpg) is a browser-based development environment that allows
you to quickly develop, deploy, and test Solana programs!

Open a new tab in your web browser and navigate to https://beta.solpg.io/.

<Steps>

### Create Playground Wallet

If you're new to Solana Playground, the first step is to create your Playground
Wallet. This wallet will allow you to interact with the Solana network right
from your browser.

#### Step 1. Connect to Playground

Click the "Not connected" button at the bottom left of the screen.

![Not Connected](/assets/docs/intro/quickstart/pg-not-connected.png)

#### Step 2. Create Your Wallet

You'll see an option to save your wallet's keypair. Optionally, save your
wallet's keypair for backup and then click "Continue".

![Create Playground Wallet](/assets/docs/intro/quickstart/pg-create-wallet.png)

You should now see your wallet's address, SOL balance, and connected cluster
(devnet by default) at the bottom of the window.

![Connected](/assets/docs/intro/quickstart/pg-connected.png)

<Callout>
  Your Playground Wallet will be saved in your browser's local storage. Clearing
  your browser cache will remove your saved wallet.
</Callout>

Some definitions you may find helpful:

- _wallet address_: a unique identifier for a digital wallet, used to send or
  receive crypto assets on a blockchain. Each wallet address is a string of
  alphanumeric characters that represents a specific destination on the network.
  Think of it like an email address or bank account number—if someone wants to
  send you cryptocurrency, they need your wallet address to direct the funds.
- _connected cluster_: a set of network nodes that work together to maintain a
  synchronized copy of the blockchain. These clusters are essential for
  providing a decentralized, distributed ledger and powering the Solana network
  by validating transactions, securing the chain, and executing programs (smart
  contracts).

### Get Devnet SOL

Before we start building, we first need some devnet SOL.

From a developer's perspective, SOL is required for two main use cases:

- To create accounts where we can store data or deploy programs
- To pay for transaction fees when we interact with the network

Below are two methods to fund your wallet with devnet SOL:

#### Option 1: Using the Playground Terminal

To fund your Playground wallet with devnet SOL. In the Playground terminal, run:

```shell filename="Terminal"
solana airdrop 5
```

#### Option 2: Using the Devnet Faucet

If the airdrop command doesn't work (due to rate limits or errors), you can use
the [Web Faucet](https://faucet.solana.com/).

- Enter your wallet address (found at the bottom of the Playground screen) and
  select an amount
- Click "Confirm Airdrop" to receive your devnet SOL

![Faucet Airdrop](/assets/docs/intro/quickstart/faucet-airdrop.gif)

</Steps>
