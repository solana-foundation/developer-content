---
title: Running a Local Network
sidebarSortOrder: 5
sidebarLabel: Local Testing
---

The Solana test validator is a local emulator for the Solana blockchain,
designed to provide developers with a private and controlled environment for
building and testing Solana programs without the need to connect to a public
testnet or mainnet. If you have the Solana CLI tool suite already installed, you
can run the test validator with the following command:

```shell
mucho test-validator
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

### Starting the Test Validator

To start your local validator, simply run:

```shell
mucho test-validator
```

This command initializes a new ledger and starts the validator.

### Checking the Status of the Test Validator

Before interacting with the test validator, it's useful to confirm its status
and ensure it is running correctly.

```shell
solana ping
```

This command pings the local test validator and returns the current blockhash
and latency, verifying that it is active.

### Deploying and Managing Programs Locally

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
mucho validator --help
```

### Local Ledger

By default, the ledger data is stored in a directory named `test-ledger` in your
current working directory.

### Specifying Ledger Location

When starting the test validator, you can specify a different directory for the
ledger data using the `--ledger` option:

```shell
mucho validator --ledger /path/to/custom/ledger
```

### Resetting the Ledger

By default the validator will resume an existing ledger, if one is found. To
reset the ledger, you can either manually delete the ledger directory or restart
the validator with the `--reset` flag:

```shell
mucho validator --reset
```

If the ledger exists, this command will reset the ledger to genesis, which
resets the state by deleting all existing accounts and starting fresh.

### Cloning Programs

To add existing onchain programs to your local environment, you can clone the
program with a new ledger. This is useful for testing interactions with other
programs that already exist on any other cluster.

To clone an account from another cluster:

```shell
mucho validator--clone PROGRAM_ADDRESS --url CLUSTER_PROGRAM_IS_DEPLOYED_TO
```

To clone an upgradeable program and its executable data from another cluster:

```shell
mucho validator --clone-upgradeable-program PROGRAM_ADDRESS --url CLUSTER_PROGRAM_IS_DEPLOYED_TO
```

> If a ledger already exists in your working directory, you must reset the
> ledger to be able to clone a program.

### Cloning Accounts

To add existing onchain accounts to your local environment, you can clone the
account with a new ledger from any other network cluster.

To clone an account from the cluster when a ledger already exists:

```shell
mucho validator --clone ACCOUNT_ADDRESS --url CLUSTER_PROGRAM_IS_DEPLOYED_TO --reset
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
mucho validator --reset --account ACCOUNT_ADDRESS account_state.json
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
mucho validator --deactivate-feature <FEATURE_PUBKEY> --reset
```

This must be done on a fresh ledger, so if a ledger already exists in your
working directory you must add the `--reset` flag to reset to genesis.

### Changing Versions

To check your current `solana-test-validator` version:

```shell
mucho validator --version
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
