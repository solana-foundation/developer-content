---
date: Jul 29, 2023
difficulty: intro
title: "Solana Test Validator Guide"
seoTitle: "Solana Test Validator Guide"
description:
  "How to run localnet on your computer by using the solana test validator for
  local development."
tags:
  - validator
  - localnet
  - solana-test-validator
keywords:
  - localnet
  - blockchain
  - devnet
  - development
  - test-validator
  - local-development
---

# Solana Test Validator

The solana-test-validator is a local emulator for the Solana blockchain,
designed to provide developers with a private and controlled environment for
building and testing Solana programs without the need to connect to a public
testnet or mainnet.

## Advantages

- Ability to reset the blockchain state at any moment
- Ability to simulate different network conditions
- No RPC rate-limits
- No airdrop limits
- Direct on-chain program deployment
- Ability to clone accounts from a public cluster
- Ability to load accounts from files
- Configurable transaction history retention
- Configurable epoch length

## Installation

Since the solana-test-validator is part of the Solana CLI tool suite, ensure you
have Solana's command-line tools installed. You can install them using the
following command:

```shell
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
```

You can replace stable with the release tag matching the software version of
your desired release (i.e. v1.18.1), or use one of the three symbolic channel
names: stable, beta, or edge.

## Starting the Test Validator

To start your local validator, simply run:

```shell
solana-test-validator
```

This command initializes a new ledger and starts the validator.

## Configuration

Configure the CLI Tool Suite to target a local cluster by default:

```shell
solana config set --url http://127.0.0.1:8899
```

Check CLI Tool Suite configuration:

```shell
solana genesis-hash
```

View all configuration options:

```shell
solana-test-validator --help
```

## Local Ledger

By default, the ledger data is stored in a directory named `test-ledger` in your
current working directory.

### Specifying Ledger Location

You can specify a different directory for the ledger data using the --ledger
option:

```shell
solana-test-validator --ledger /path/to/custom/ledger
```

### Resetting the Ledger

By default the validator will resume an existing ledger. To reset the ledger,
you can either manually delete the ledger directory or restart the validator
with the `--reset` flag:

```shell
solana-test-validator --reset
```

If the ledger exists, this command will reset the ledger to genesis, which
resets the state by deleting all existing data and starting fresh.

## Feature Flags

Solana has a feature set mechanism that allows you to enable or disable certain
blockchain features when running your localnet. You can check the currently
active features with:

```shell
solana feature status 
```

To enable a specific feature, you need to know its feature ID, which you can
find in the (Solana feature proposal)[https://spl.solana.com/feature-proposal]
repository. To enable a feature, use:

```shell
solana feature activate <FEATURE_ID> 
```

## Changing Solana Versions

To test your programs against different versions of the Solana runtime, you can
install multiple versions of the Solana CLI and switch between them using the
solana-install set command:

```shell
solana-install set 1.10.32
```

Make sure to restart your solana-test-validator after changing versions to
ensure it runs the correct version.

## Cloning Programs

To add existing on-chain programs to your local environment, use the --clone
flag followed by the program's address:

```shell
solana-test-validator --clone PROGRAM_ADDRESS
```

This is useful for testing interactions with standard programs like Token
Extensions.

## Resetting State on Accounts at Startup

To reset the state of specific accounts every time you start the validator, you
can use a combination of account snapshots and the `--account` flag. First, save
the desired state of an account as a JSON file:

```shell
solana account PROGRAM_ADDRESS --output json > account_state.json
```

Then load this state each time you start the validator:

```shell
solana-test-validator --reset --account PROGRAM_ADDRESS account_state.json
```

## Interacting with a Running Test Validator

Once you have the solana-test-validator up and running, you can interact with it
using various Solana CLI (Command Line Interface) commands. These commands let
you deploy programs, manage accounts, send transactions, and much more. Here’s a
detailed guide on the key commands you will use.

### Checking the Status of the Test Validator

Before interacting with the test validator, it's useful to confirm its status
and ensure it is running correctly.

```shell
solana ping 
```

This command pings the local test validator and returns the current blockhash
and latency, verifying that it is active.

### Account Management

To create a new keypair (account), use:

```shell
solana-keygen new 
```

This command creates a new keypair and saves it to the specified file.

To retrieve details about an account, such as its balance and owner:

```shell
solana account <ACCOUNT_ADDRESS>
```

To add SOL to your account:

```shell
solana airdrop 10 <ACCOUNT_ADDRESS>
```

This command sends 10 SOL to the specified account address.

### Deploying and Managing Programs

To deploy a compiled program (BPF) to the test validator:

```shell
solana program deploy /path/to/compiled_program
```

This uploads and deploys a program to the blockchain.

To check the details of a deployed program:

```shell
solana program show <PROGRAM_ID>
```

### Sending Transactions

To transfer SOL from one account to another:

```shell
solana transfer --from /path/to/source/keypair.json <RECIPIENT_ADDRESS> 5
```

This sends 5 SOL from the source account to the recipient address.

### Simulating and Confirming Transactions

Before actually sending a transaction, you can simulate it to see if it would
succeed:

```shell
solana transfer <RECIPIENT_ADDRESS> 1 --from /path/to/keypair.json --simulate
```

To confirm the details and status of a transaction:

```shell
solana confirm <TRANSACTION_SIGNATURE>
```

### Viewing Recent Block Production 
To see information about recent block production, which can be useful for debugging performance issues:

```shell
solana block-production
```
### Adjusting Logs

For debugging, you might want more detailed logs:

```shell
solana logs 
```

This streams log messages from the validator.

Useful Tips Logging: 
- Increase log verbosity with the `-v` flag if you need more detailed output for debugging. 
- Use the `--rpc-port` and `--rpc-bind-address` options to customize the RPC server settings. 
- Adjust the number of CPU cores used by the validator with the `--gossip-host` option to simulate network conditions more realistically.
