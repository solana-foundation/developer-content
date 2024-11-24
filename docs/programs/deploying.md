---
title: "Deploying Programs"
description:
  Deploying onchain programs can be done using the Solana CLI using the
  Upgradable BPF loader to upload the compiled byte-code to the Solana
  blockchain.
sidebarSortOrder: 2
---

Solana programs are stored in "executable" accounts on the network. These
accounts contain the program's compiled bytecode that define the instructions
users invoke to interact with the program.

## CLI Commands

The section is intented as a reference for the basic CLI commands for building
and deploying Solana programs. For a step-by-step guide on creating your first
program, start with [Developing Programs in Rust](/docs/programs/rust).

### Build Program

To build your program, use the `cargo build-sbf` command.

```shell
cargo build-sbf
```

This command will:

1. Compile your program
2. Create a `target/deploy` directory
3. Generate a `<program-name>.so` file, where `<program-name>` matches your
   program's name in `Cargo.toml`

The output `.so` file contains your program's compiled bytecode that will be
stored in a Solana account when you deploy your program.

### Deploy Program

To deploy your program, use the `solana program deploy` command followed by the
path to the `.so` file created by the `cargo build-sbf` command.

```shell
solana program deploy ./target/deploy/your_program.so
```

During times of congestion, there are a few additional flags you can use to help
with program deployment.

- `--with-compute-unit-price`: Set compute unit price for transaction, in
  increments of 0.000001 lamports (micro-lamports) per compute unit.
- `--max-sign-attempts`: Maximum number of attempts to sign or resign
  transactions after blockhash expiration. If any transactions sent during the
  program deploy are still unconfirmed after the initially chosen recent
  blockhash expires, those transactions will be resigned with a new recent
  blockhash and resent. Use this setting to adjust the maximum number of
  transaction signing iterations. Each blockhash is valid for about 60 seconds,
  which means using the default value of 5 will lead to sending transactions for
  at least 5 minutes or until all transactions are confirmed,whichever comes
  first. [default: 5]
- `--use-rpc`: Send write transactions to the configured RPC instead of
  validator TPUs. This flag requires a stake-weighted RPC connection.

You can use the flags individually or combine them together. For example:

```shell
solana program deploy ./target/deploy/your_program.so --with-compute-unit-price 10000 --max-sign-attempts 1000 --use-rpc
```

- Use the
  [Priority Fee API by Helius](https://docs.helius.dev/guides/priority-fee-api)
  to get an estimate of the priority fee to set with the
  `--with-compute-unit-price` flag.

- Get a
  [stake-weighted](https://solana.com/developers/guides/advanced/stake-weighted-qos)
  RPC connection from [Helius](https://www.helius.dev/) or
  [Trition](https://triton.one/) to use with the `--use-rpc` flag. The
  `--use-rpc` flag should only be used with a stake-weighted RPC connection.

To update your default RPC URL with a custom RPC endpoint, use the
`solana config set` command.

```shell
solana config set --url <RPC_URL>
```

You can view the list of programs you've deployed using the
`solana program show --programs` command.

```shell
solana program show --programs
```

Example output:

```
Program Id                                   | Slot      | Authority                                    | Balance
2w3sK6CW7Hy1Ljnz2uqPrQsg4KjNZxD4bDerXDkSX3Q1 | 133132    | 4kh6HxYZiAebF8HWLsUWod2EaQQ6iWHpHYCz8UcmFbM1 | 0.57821592 SOL
```

### Update Program

A program's update authority can modify an existing Solana program by deploying
a new `.so` file to the same program ID.

To update an existing Solana program:

- Make changes to your program source code
- Run `cargo build-sbf` to generate an updated `.so` file
- Run `solana program deploy ./target/deploy/your_program.so` to deploy the
  updated `.so` file

The update authority can be changed using the
`solana program set-upgrade-authority` command.

```shell
solana program set-upgrade-authority <PROGRAM_ADDRESS> --new-upgrade-authority <NEW_UPGRADE_AUTHORITY>
```

### Immutable Program

A program can be made immutable by removing its update authority. This is an
irreversible action.

```shell
solana program set-upgrade-authority <PROGRAM_ADDRESS> --final
```

You can specify that program should be immutable on deployment by setting the
`--final` flag when deploying the program.

```shell
solana program deploy ./target/deploy/your_program.so --final
```

### Close Program

You can close your Solana program to reclaim the SOL allocated to the account.
Closing a program is irreversible, so it should be done with caution. To close a
program, use the `solana program close <PROGRAM_ID>` command. For example:

```shell filename="Terminal"
solana program close 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz
--bypass-warning
```

Example output:

```
Closed Program Id 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz, 0.1350588 SOL
reclaimed
```

Note that once a program is closed, its program ID cannot be reused. Attempting
to deploy a program with a previously closed program ID will result in an error.

```
Error: Program 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz has been closed, use
a new Program Id
```

If you need to redeploy a program after closing it, you must generate a new
program ID. To generate a new keypair for the program, run the following
command:

```shell filename="Terminal"
solana-keygen new -o ./target/deploy/your_program-keypair.json --force
```

Alternatively, you can delete the existing keypair file and run
`cargo build-sbf` again, which will generate a new keypair file.

### Program Buffer Accounts

Deploying a program requires multiple transactions due to the 1232 byte limit
for transactions on Solana. An intermediate step of the deploy process involves
writing the program's byte-code to temporary "buffer account".

This buffer account is automatically closed after successful program deployment.
However, if the deployment fails, the buffer account remains and you can either:

- Continue the deployment using the existing buffer account
- Close the buffer account to reclaim the allocated SOL (rent)

You can check if you have any open buffer accounts by using the
`solana program show --buffers` command.

```shell
solana program show --buffers
```

Example output:

```
Buffer Address                               | Authority                                    | Balance
5TRm1DxYcXLbSEbbxWcQbEUCce7L4tVgaC6e2V4G82pM | 4kh6HxYZiAebF8HWLsUWod2EaQQ6iWHpHYCz8UcmFbM1 | 0.57821592 SOL
```

You can continue to the deployment using
`solana program deploy --buffer <BUFFER_ADDRESS>`.

For example:

```shell
solana program deploy --buffer 5TRm1DxYcXLbSEbbxWcQbEUCce7L4tVgaC6e2V4G82pM
```

Expected output on successful deployment:

```
Program Id: 2w3sK6CW7Hy1Ljnz2uqPrQsg4KjNZxD4bDerXDkSX3Q1

Signature: 3fsttJFskUmvbdL5F9y8g43rgNea5tYZeVXbimfx2Up5viJnYehWe3yx45rQJc8Kjkr6nY8D4DP4V2eiSPqvWRNL
```

To close buffer accounts, use the `solana program close --buffers` command.

```shell
solana program close --buffers
```

### ELF Dump

The SBF shared object internals can be dumped to a text file to gain more
insight into a program's composition and what it may be doing at runtime. The
dump will contain both the ELF information as well as a list of all the symbols
and the instructions that implement them. Some of the BPF loader's error log
messages will reference specific instruction numbers where the error occurred.
These references can be looked up in the ELF dump to identify the offending
instruction and its context.

```shell
cargo build-bpf --dump
```

The file will be output to `/target/deploy/your_program-dump.txt`.

## Program Deployment Process

Deploying a program on Solana requires multiple transactions, due to the max
size limit of 1232 bytes for Solana transactions. The Solana CLI sends these
transactions with the `solana program deploy` subcommand. The process can be
broken down into the following 3 phases:

1. [Buffer initialization](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L2113):
   First, the CLI sends a transaction which
   [creates a buffer account](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L1903)
   large enough for the byte-code being deployed. It also invokes the
   [initialize buffer instruction](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/programs/bpf_loader/src/lib.rs#L320)
   to set the buffer authority to restrict writes to the deployer's chosen
   address.
2. [Buffer writes](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L2129):
   Once the buffer account is initialized, the CLI
   [breaks up the program byte-code](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L1940)
   into ~1KB chunks and
   [sends transactions at a rate of 100 transactions per second](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/client/src/tpu_client.rs#L133)
   to write each chunk with
   [the write buffer instruction](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/programs/bpf_loader/src/lib.rs#L334).
   These transactions are sent directly to the current leader's transaction
   processing (TPU) port and are processed in parallel with each other. Once all
   transactions have been sent, the CLI
   [polls the RPC API with batches of transaction signatures](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/client/src/tpu_client.rs#L216)
   to ensure that every write was successful and confirmed.
3. [Finalization](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L1807):
   Once writes are completed, the CLI
   [sends a final transaction](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/cli/src/program.rs#L2150)
   to either
   [deploy a new program](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/programs/bpf_loader/src/lib.rs#L362)
   or
   [upgrade an existing program](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/programs/bpf_loader/src/lib.rs#L513).
   In either case, the byte-code written to the buffer account will be copied
   into a program data account and verified.

## Upgradeable BPF Loader Program

The BPF loader program is the program that "owns" all executable accounts on
Solana. When you deploy a program, the owner of the program account is set to
the the BPF loader program.

### State accounts

The Upgradeable BPF loader program supports three different types of state
accounts:

1. [Program account](https://github.com/solana-labs/solana/blob/master/sdk/program/src/bpf_loader_upgradeable.rs#L34):
   This is the main account of an on-chain program and its address is commonly
   referred to as a "program id." Program id's are what transaction instructions
   reference in order to invoke a program. Program accounts are immutable once
   deployed, so you can think of them as a proxy account to the byte-code and
   state stored in other accounts.
2. [Program data account](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/bpf_loader_upgradeable.rs#L39):
   This account is what stores the executable byte-code of an on-chain program.
   When a program is upgraded, this account's data is updated with new
   byte-code. In addition to byte-code, program data accounts are also
   responsible for storing the slot when it was last modified and the address of
   the sole account authorized to modify the account (this address can be
   cleared to make a program immutable).
3. [Buffer accounts](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/bpf_loader_upgradeable.rs#L27):
   These accounts temporarily store byte-code while a program is being actively
   deployed through a series of transactions. They also each store the address
   of the sole account which is authorized to do writes.

### Instructions

The state accounts listed above can only be modified with one of the following
instructions supported by the Upgradeable BPF Loader program:

1. [Initialize buffer](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L21):
   Creates a buffer account and stores an authority address which is allowed to
   modify the buffer.
2. [Write](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L28):
   Writes byte-code at a specified byte offset inside a buffer account. Writes
   are processed in small chunks due to a limitation of Solana transactions
   having a maximum serialized size of 1232 bytes.
3. [Deploy](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L77):
   Creates both a program account and a program data account. It fills the
   program data account by copying the byte-code stored in a buffer account. If
   the byte-code is valid, the program account will be set as executable,
   allowing it to be invoked. If the byte-code is invalid, the instruction will
   fail and all changes are reverted.
4. [Upgrade](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L102):
   Fills an existing program data account by copying executable byte-code from a
   buffer account. Similar to the deploy instruction, it will only succeed if
   the byte-code is valid.
5. [Set authority](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L114):
   Updates the authority of a program data or buffer account if the account's
   current authority has signed the transaction being processed. If the
   authority is deleted without replacement, it can never be set to a new
   address and the account can never be closed.
6. [Close](https://github.com/solana-labs/solana/blob/7409d9d2687fba21078a745842c25df805cdf105/sdk/program/src/loader_upgradeable_instruction.rs#L127):
   Clears the data of a program data account or buffer account and reclaims the
   SOL used for the rent exemption deposit.
