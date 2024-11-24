---
sidebarSortOrder: 1
sidebarLabel: Solana Account Model
title: Solana Account Model
description:
  Learn about Solana's account model, including how accounts store data and
  programs, rent mechanics, account ownership, and the relationship between
  programs and data accounts. Understand the core concepts of Solana's key-value
  storage system.
---

On Solana, all data is stored in what are referred to as "accounts”. The way
data is organized on Solana resembles a
[key-value store](https://en.wikipedia.org/wiki/Key%E2%80%93value_database),
where each entry in the database is called an "account".

![Accounts](/assets/docs/core/accounts/accounts.svg)

## Key Points

- Accounts can store up to 10MB of data, which can consist of either executable
  program code or program state.

- Accounts require a rent deposit in SOL, proportional to the amount of data
  stored, which is fully refundable when the account is closed.

- Every account has a program "owner". Only the program that owns an account can
  modify its data or deduct its lamport balance. However, anyone can increase
  the balance.

- Programs (smart contracts) are stateless accounts that store executable code.

- Data accounts are created by programs to store and manage program state.

- Native programs are built-in programs included with the Solana runtime.

- Sysvar accounts are special accounts that store network cluster state.

## Account

Each account is identifiable by its unique address, represented as 32 bytes in
the format of an [Ed25519](https://ed25519.cr.yp.to/) `PublicKey`. You can think
of the address as the unique identifier for the account.

![Account Address](/assets/docs/core/accounts/account-address.svg)

This relationship between the account and its address can be thought of as a
key-value pair, where the address serves as the key to locate the corresponding
on-chain data of the account.

### AccountInfo

Accounts have a
[max size of 10MB](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/system_instruction.rs#L85)
(10 Mega Bytes) and the data stored on every account on Solana has the following
structure known as the
[AccountInfo](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/account_info.rs#L19).

![AccountInfo](/assets/docs/core/accounts/accountinfo.svg)

The `AccountInfo` for each account includes the following fields:

- `data`: A byte array that stores the state of an account. If the account is a
  program (smart contract), this stores executable program code. This field is
  often referred to as the "account data".
- `executable`: A boolean flag that indicates if the account is a program.
- `lamports`: A numeric representation of the account's balance in
  [lamports](/docs/terminology.md#lamport), the smallest unit of SOL (1 SOL = 1
  billion lamports).
- `owner`: Specifies the public key (program ID) of the program that owns the
  account.

As a key part of the Solana Account Model, every account on Solana has a
designated "owner", specifically a program. Only the program designated as the
owner of an account can modify the data stored on the account or deduct the
lamport balance. It's important to note that while only the owner may deduct the
balance, anyone can increase the balance.

> To store data on-chain, a certain amount of SOL must be transferred to an
> account. The amount transferred is proportional to the size of the data stored
> on the account. This concept is commonly referred to as “rent”. However, you
> can think of "rent" more like a "deposit" because the SOL allocated to an
> account can be fully recovered when the account is closed.

## Native Programs

Solana contains a small handful of native programs that are part of the
validator implementation and provide various core functionalities for the
network. You can find the full list of native programs
[here](https://docs.solanalabs.com/runtime/programs).

When developing custom programs on Solana, you will commonly interact with two
native programs, the System Program and the BPF Loader.

### System Program

By default, all new accounts are owned by the
[System Program](https://github.com/solana-labs/solana/tree/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/system/src).
The System Program performs several key tasks such as:

- [New Account Creation](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/system/src/system_processor.rs#L145):
  Only the System Program can create new accounts.
- [Space Allocation](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/system/src/system_processor.rs#L70):
  Sets the byte capacity for the data field of each account.
- [Assign Program Ownership](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/system/src/system_processor.rs#L112):
  Once the System Program creates an account, it can reassign the designated
  program owner to a different program account. This is how custom programs take
  ownership of new accounts created by the System Program.

On Solana, a "wallet" is simply an account owned by the System Program. The
lamport balance of the wallet is the amount of SOL owned by the account.

![System Account](/assets/docs/core/accounts/system-account.svg)

> Only accounts owned by the System Program can be used as transaction fee
> payers.

### BPFLoader Program

The
[BPF Loader](https://github.com/solana-labs/solana/tree/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src)
is the program designated as the "owner" of all other programs on the network,
excluding Native Programs. It is responsible for deploying, upgrading, and
executing custom programs.

## Sysvar Accounts

Sysvar accounts are special accounts located at predefined addresses that
provide access to cluster state data. These accounts are dynamically updated
with data about the network cluster. You can find the full list of Sysvar
Accounts [here](https://docs.solanalabs.com/runtime/sysvars).

## Custom Programs

On Solana, “smart contracts” are referred to as
[programs](/docs/core/programs.md). A program is an account that contains
executable code and is indicated by an “executable” flag that is set to true.

For a more detailed explanation of the program deployment process, refer to the
[Deploying Programs](/docs/programs/deploying.md) page of this documentation.

### Program Account

When new programs are
[deployed](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L498)
on Solana, technically three separate accounts are created:

- **Program Account**: The main account representing an on-chain program. This
  account stores the address of an executable data account (which stores the
  compiled program code) and the update authority for the program (address
  authorized to make changes to the program).
- **Program Executable Data Account**: An account that contains the executable
  byte code of the program.
- **Buffer Account**: A temporary account that stores byte code while a program
  is being actively deployed or upgraded. Once the process is complete, the data
  is transferred to the Program Executable Data Account and the buffer account
  is closed.

For example, here are links to the Solana Explorer for the Token Extensions
[Program Account](https://explorer.solana.com/address/TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb)
and its corresponding
[Program Executable Data Account](https://explorer.solana.com/address/DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY).

![Program and Executable Data Accounts](/assets/docs/core/accounts/program-account-expanded.svg)

For simplicity, you can think of the "Program Account" as the program itself.

![Program Account](/assets/docs/core/accounts/program-account-simple.svg)

> The address of the "Program Account" is commonly referred to as the “Program
> ID”, which is used to invoke the program.

### Data Account

Solana programs are "stateless", meaning that program accounts only contain the
program's executable byte code. To store and modify additional data, new
accounts must be created. These accounts are commonly referred to as “data
accounts”.

Data accounts can store any arbitrary data as defined in the owner program's
code.

![Data Account](/assets/docs/core/accounts/data-account.svg)

Note that only the [System Program](/docs/core/accounts.md#system-program) can
create new accounts. Once the System Program creates an account, it can then
transfer ownership of the new account to another program.

In other words, creating a data account for a custom program requires two steps:

1. Invoke the System Program to create an account, which then transfers
   ownership to a custom program
2. Invoke the custom program, which now owns the account, to then initialize the
   account data as defined in the program code

This data account creation process is often abstracted as a single step, but
it's helpful to understand the underlying process.
