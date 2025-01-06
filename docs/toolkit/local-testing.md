---
title: Running a Local Network
---

The Solana test validator is a local emulator for the Solana blockchain,
designed to provide developers with a private and controlled environment for
building and testing Solana programs without the need to connect to a public
testnet or mainnet. If you have the Solana CLI tool suite already installed, you
can run the test validator with the following command:

```shell
solana-test-validator
```

### Advantages

- Ability to reset the blockchain state at any moment
- Ability to simulate different network conditions
- No RPC rate-limits
- No airdrop limits
- Direct on-chain program deployment
- Ability to clone accounts from a public cluster
- Ability to load accounts from files
- Configurable transaction history retention
- Configurable epoch length
- Installation #

Since the `solana-test-validator` is part of the Solana CLI tool suite, ensure
you have Solana's command-line tools installed. You can install the entire
Solana toolkit (which includes the Solana CLI) using the following command:

```shell
npx solana install
```

Or install just the Solana CLI with:

```shell
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

You can replace `stable` with the release tag matching the software version of
your desired release (i.e. `v1.18.12`), or use one of the three symbolic channel
names: `stable`, `beta`, or `edge`.

### Starting the Test Validator

To start your local validator, simply run:

```shell
solana-test-validator
```

This command initializes a new ledger and starts the validator.

### Interacting with a Running Test Validator

Once you have the `solana-test-validator` up and running, you can interact with
it using various Solana CLI commands. These commands let you deploy programs,
manage accounts, send transactions, and much more. Below is a detailed guide on
the key commands you will use.

Check your current CLI configuration to see which network you are selected too:

```shell
solana config get
```

If needed update your Solana configuration to connect to your test validator
running on localhost:

```shell
solana config set --url localhost
```

### Checking the Status of the Test Validator

Before interacting with the test validator, it's useful to confirm its status
and ensure it is running correctly.

```shell
solana ping
```

This command pings the local test validator and returns the current blockhash
and latency, verifying that it is active.

### Account Management

View the pubkey of your configured CLI keypair:

```shell
solana address
```

View the current balance of your keypair:

```shell
solana balance
```

To add SOL to your CLI keypair, request an airdrop:

```shell
solana airdrop 10
```

To retrieve details about any account, such as its balance and owner:

```shell
solana account <ACCOUNT_ADDRESS>
```

You must first add SOL to an account for it to exist. This airdrop command
requests 2 SOL to the specified account address:

```shell
solana airdrop 2 <ACCOUNT_ADDRESS>
```

Aside from "wallet accounts" that only hold SOL, accounts are normally created
by smart contracts (aka programs) so they can store the `data` desired by that
program.

### Deploying and Managing Programs

To deploy a compiled program (BPF) to the test validator:

```shell
solana program deploy <PROGRAM_FILE_PATH>
```

This uploads and deploys a program to the blockchain.

To check the details of a deployed program:

```shell
solana program show <ACCOUNT_ADDRESS>
```

### Sending Transactions

To transfer SOL from one account to another:

```shell
solana transfer --from /path/to/keypair.json <RECIPIENT_ADDRESS> <AMOUNT>
```

This sends `AMOUNT` of SOL from the source account to the `RECIPIENT_ADDRESS`.

### Simulating and Confirming Transactions

Before actually sending a transaction, you can simulate it to see if it would
likely succeed:

```shell
solana transfer --from /path/to/keypair.json --simulate <RECIPIENT_ADDRESS> <AMOUNT>
```

To confirm the details and status of a transaction:

```shell
solana confirm <TRANSACTION_SIGNATURE>
```

### Viewing Recent Block Production

To see information about recent block production, which can be useful for
debugging performance issues:

```shell
solana block-production
```

### Creating Token Accounts

### Adjusting Logs

For debugging, you might want more detailed logs:

```shell
solana logs
```

This streams log messages from the validator.

### Tips for Logging

- Increase log verbosity with the `-v` flag if you need more detailed output for
  debugging.
- Use the `--rpc-port` and `--rpc-bind-address` options to customize the RPC
  server settings.
- Adjust the number of CPU cores used by the validator with the `--gossip-host`
  option to simulate network conditions more realistically.

### Configuration

Check CLI Tool Suite configuration:

```shell
solana genesis-hash
```

View all the configuration options available for the Solana test validator:

```shell
solana-test-validator --help
```

### Local Ledger

By default, the ledger data is stored in a directory named `test-ledger` in your
current working directory.

### Specifying Ledger Location

When starting the test validator, you can specify a different directory for the
ledger data using the `--ledger` option:

```shell
solana-test-validator --ledger /path/to/custom/ledger
```

### Resetting the Ledger

By default the validator will resume an existing ledger, if one is found. To
reset the ledger, you can either manually delete the ledger directory or restart
the validator with the `--reset` flag:

```shell
solana-test-validator --reset
```

If the ledger exists, this command will reset the ledger to genesis, which
resets the state by deleting all existing accounts and starting fresh.

### Cloning Programs

To add existing onchain programs to your local environment, you can clone the
program with a new ledger. This is useful for testing interactions with other
programs that already exist on any other cluster.

To clone an account from another cluster:

```shell
solana-test-validator --clone PROGRAM_ADDRESS --url CLUSTER_PROGRAM_IS_DEPLOYED_TO
```

To clone an upgradeable program and its executable data from another cluster:

```shell
solana-test-validator --clone-upgradeable-program PROGRAM_ADDRESS --url CLUSTER_PROGRAM_IS_DEPLOYED_TO
```

> If a ledger already exists in your working directory, you must reset the
> ledger to be able to clone a program.

### Cloning Accounts

To add existing onchain accounts to your local environment, you can clone the
account with a new ledger from any other network cluster.

To clone an account from the cluster when a ledger already exists:

```shell
solana-test-validator --clone ACCOUNT_ADDRESS --url CLUSTER_PROGRAM_IS_DEPLOYED_TO --reset
```

### Reset to Specific Account Data

To reset the state of specific accounts every time you start the validator, you
can use a combination of account snapshots and the `--account` flag.

First, save the desired state of an account as a JSON file:

```shell
solana account ACCOUNT_ADDRESS --output json > account_state.json
```

Then load this state each time you reset the validator:

```shell
solana-test-validator --reset --account ACCOUNT_ADDRESS account_state.json
```

### Runtime Features

Solana has a feature set mechanism that allows you to enable or disable certain
blockchain features when running the test validator. By default, the test
validator runs with all runtime features activated.

To see all the runtime features available and their statuses:

```shell
solana feature status
```

To query a specific runtime feature's status:

```shell
solana feature status <ADDRESS>
```

To activate a specific feature:

```shell
solana feature activate <FEATURE_KEYPAIR> <CLUSTER>
```

- `FEATURE_KEYPAIR` is the signer for the feature to activate
- `CLUSTER` is the cluster to activate the feature on

To deactivate specific features in genesis:

```shell
solana-test-validator --deactivate-feature <FEATURE_PUBKEY> --reset
```

This must be done on a fresh ledger, so if a ledger already exists in your
working directory you must add the `--reset` flag to reset to genesis.

### Changing Versions

To check your current `solana-test-validator` version:

```shell
solana-test-validator --version
```

Your test validator runs on the same version as the Solana CLI installed and
configured for use.

To test your programs against different versions of the Solana runtime, you can
install multiple versions of the Solana CLI and switch between them using the
following command:

```shell
solana-install init <VERSION>
```

Make sure to reset your Solana test validator's ledger after changing versions
to ensure it runs a valid ledger without corruption.
