---
sidebarLabel: Staking
title: Staking on Solana
---

_Note before reading: All references to increases in values are in absolute
terms with regards to balance of SOL. This document makes no suggestion as to
the monetary value of SOL at any time._

By staking your SOL tokens, you help secure the network and
[earn rewards](https://docs.solanalabs.com/implemented-proposals/staking-rewards)
while doing so.

You can stake by delegating your tokens to validators who process transactions
and run the network.

Delegating stake is a shared-risk shared-reward financial model that may provide
returns to holders of tokens delegated for a long period. This is achieved by
aligning the financial incentives of the token-holders (delegators) and the
validators to whom they delegate.

The more stake delegated to a validator, the more often this validator is chosen
to write new transactions to the ledger. The more transactions the validator
writes, the more rewards the validator and its delegators earn. Validators who
configure their systems to be able to process more transactions earn
proportionally more rewards and because they keep the network running as fast
and as smoothly as possible.

Validators incur costs by running and maintaining their systems, and this is
passed on to delegators in the form of a fee collected as a percentage of
rewards earned. This fee is known as a _commission_. Since validators earn more
rewards the more stake is delegated to them, they may compete with one another
to offer the lowest commission for their services.

Although this is not implemented in the Solana protocol today, in the future,
delegators could risk losing tokens when staking through a process known as
_slashing_. Slashing involves the removal and destruction of a portion of a
validator's SOL in response to intentional malicious behavior, such as creating
invalid transactions or censoring certain types of transactions or network
participants.

There is no in protocol implementation of slashing currently. For more
information on slashing see the
[slashing roadmap](https://docs.solanalabs.com/proposals/optimistic-confirmation-and-slashing#slashing-roadmap).

## How do I stake my SOL tokens?

You can stake SOL by moving your tokens into a wallet that supports staking. The
wallet provides steps to create a stake account and do the delegation.

#### Supported Wallets

Many web and mobile wallets support Solana staking operations. Please check with
your favorite wallet's maintainers regarding status

#### Solana command line tools

- Solana command line tools can perform all stake operations in conjunction with
  a CLI-generated keypair file wallet, a paper wallet, or with a connected
  Ledger Nano.
  [Staking commands using the Solana Command Line Tools](https://docs.solanalabs.com/cli/examples/delegate-stake).

#### Create a Stake Account

Follow the wallet's instructions for creating a staking account. This account
will be of a different type than one used to simply send and receive tokens.

#### Select a Validator

Follow the wallet's instructions for selecting a validator. You can get
information about potentially performant validators from the links below. The
Solana Foundation does not recommend any particular validator.

The site solanabeach.io is built and maintained by one of our validators,
Staking Facilities. It provides a some high-level graphical information about
the network as a whole, as well as a list of each validator and some recent
performance statistics about each one.

- https://solanabeach.io

To view block production statistics, use the Solana command-line tools:

- `solana validators`
- `solana block-production`

The Solana team does not make recommendations on how to interpret this
information. Do your own due diligence.

#### Delegate your Stake

Follow the wallet's instructions for delegating your stake to your chosen
validator.

## Stake Account Details

For more information about the operations and permissions associated with a
stake account, please see
[Stake Accounts](/docs/economics/staking/stake-accounts.md)
