---
sidebarLabel: Solana Account Model
sidebarSortOrder: 1
title: Solana Account Model
---

On Solana, all data is stored in what are referred to as "accounts”. The way
data is organized on Solana resembles a key-value store, where each entry in the
database is called an "account".

![Accounts](/assets/docs/core/accounts/accounts.svg)

## Account

Each account is identifiable by its unique address, represented as 32 bytes in
the format of an
[Ed25519](https://github.com/solana-labs/solana/blob/master/sdk/src/signer/keypair.rs#L25)
`PublicKey`. You can think of the address as the unique identifier for the
account.

![Account Address](/assets/docs/core/accounts/account-address.svg)

This relationship between the account and its address can be thought of as a
key-value pair, where the address serves as the key to locate the corresponding
on-chain data of the account.

## AccountInfo

Every account on Solana has the following structure known as the
[AccountInfo](https://github.com/solana-labs/solana/blob/master/sdk/program/src/account_info.rs#L19).

![AccountInfo](/assets/docs/core/accounts/accountinfo.svg)

The `AccountInfo` for each account includes the following fields:

- **data**: A byte array that stores the state of an account. If the account is
  a program (smart contract), this stores executable program code. This field is
  often referred to as the "account data".
- **executable**: A boolean flag that indicates if the account is a program.
- **lamports**: A numeric representation of the account's balance in lamports,
  the smallest unit of SOL (1 SOL = 1 billion Lamports).
- **owner**: Specifies the public key (program ID) of the program (smart
  contract) that owns the account.

As a key part of the Solana Account Model, every account on Solana has a
designated "owner", specifically a program. Only the program designated as the
owner of an account can modify the data stored on the account or deduct the
lamport balance.

<Callout>
  To store data on-chain, a certain amount of SOL must be transferred to an
  account. The amount transferred is proportional to the size of the data stored on the account. This concept is commonly referred to as “rent”. However, you can
  think of "rent" more like a "deposit" because the SOL allocated to an account
  can be fully recovered when the account is closed.
</Callout>

## System Program

By default, all new accounts are owned by the
[System Program](https://github.com/solana-labs/solana/tree/master/programs/system/src).
The System Program is one of Solana's "Native Programs", which performs several
key tasks such as:

- [New Account Creation](https://github.com/solana-labs/solana/blob/master/programs/system/src/system_processor.rs#L145):
  Only the System Program can create new accounts.
- [Space Allocation](https://github.com/solana-labs/solana/blob/master/programs/system/src/system_processor.rs#L70):
  Sets the byte capacity for the data field of each account.
- [Assign Program Ownership](https://github.com/solana-labs/solana/blob/master/programs/system/src/system_processor.rs#L112):
  Once the System Program creates an account, it can reassign the designated
  program owner to a different program account. This is how custom programs take
  ownership of new accounts created by the System Program.

On Solana, a "wallet" is simply an account owned by the System Program. The
lamport balance of the wallet is the amount of SOL owned by the account.

![System Account](/assets/docs/core/accounts/system-account.svg)

<Callout>
  Only accounts owned by the System Program can be used as transaction fee payers.
</Callout>

## Program Account

On Solana, “smart contracts” are referred to as programs. A program is an
account that stores executable code and is indicated by an “executable” flag
that is set to true.

When new programs are deployed on Solana, technically two separate accounts are
created.

- **Program Account**: The main account representing an on-chain program. This
  account stores the address of an executable data account (which stores the
  compiled program code) and the update authority for the program (address
  authorized to make changes to the program).
- **Program Executable Data Account**: An account that stores the executable
  byte code of the program.

<Callout>
  The address of the "Program Account" is commonly referred to as the “Program
  ID”, which is used to invoke the program.
</Callout>

For example, here are links to Solana Explorer for the Token Extensions
[Program Account](https://explorer.solana.com/address/TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb)
and its corresponding
[Program Executable Data Account](https://explorer.solana.com/address/DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY).

![Program and Executable Data Accounts](/assets/docs/core/accounts/program-account-expanded.svg)

For simplicity, you can think of the "Program Account" as the program itself.

![Program Account](/assets/docs/core/accounts/program-account-simple.svg)

Program accounts are owned by the
[BPF Loader](https://github.com/solana-labs/solana/tree/master/programs/bpf_loader/src)
program, another one of Solana's “Native Programs”. There are multiple versions
of the BPF Loader program, but at a high level, it's simply the program that
owns other programs (with the exception of Native Programs).

## Data Account

Solana programs are "stateless", meaning that program accounts only store the
program's executable byte code. To store and modify additional data, new
accounts must be created. These accounts are commonly referred to as “data
accounts”.

Data accounts can be used to store any data as defined by the owner program.

![Data Account](/assets/docs/core/accounts/data-account.svg)

Note that only the [System Program](/docs/core/accounts#system-program) can
create new accounts. Once the System Program creates an account, it can then
transfer ownership of the new account to another program.

In other words, creating a data account for a custom program requires two steps:

1. Invoke the System Program to create an account, which then transfers
   ownership to a custom program
2. Invoke the custom program, which now owns the account, to then initialize the
   account data as defined in the program logic

This data account creation process is often abstracted as a single step, but
it's helpful to understand the underlying process.
