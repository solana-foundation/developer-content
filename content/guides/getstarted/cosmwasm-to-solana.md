---
date: Feb 29, 2024
difficulty: intermediate
title: "CosmWasm Smart Contracts to Solana Programs"
description: "Learn how to write Solana Programs with CosmWasm Experience"
tags:
  - rust
keywords:
  - native rust
  - solana
  - CosmWasm
  - smart contracts
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
---

Learn the difference between CosmWasm and Solana smart contracts.

**CosmWasm**

- Execution Environment: Runs on the Cosmos SDK, designed for interoperability
  between blockchains.
- State Management: Uses `cosmwasm_storage` for storing and retrieving state.
- Messages: Uses `InstantiateMsg`, `ExecuteMsg`, and `QueryMsg` for contract
  operations.
- Entry Points: Separate entry points for instantiate, execute, and query.

**Solana**

- Execution Environment: Runs on the Solana blockchain, optimized for high
  throughput and low latency.
- State Management: Uses `Borsh` for serialization and deserialization of state
  stored in accounts.
- Instructions: Uses custom-defined instructions for all operations.
- Entry Point: A single entry point (process_instruction) handles all
  instructions.

## Project Setup

1. Initialize a new Solana project:

```shell
cargo new solana_counter --lib
cd solana_counter
```

2. Update Cargo.toml

```toml
[package]
name = "solana_counter"
version = "0.1.0"
edition = "2018"

[dependencies]
solana-program = "1.9.3"
borsh = "0.9.1"

[lib]
crate-type = ["cdylib", "rlib"]
```

3. Create source files

```shell
touch src/instruction.rs src/processor.rs src/state.rs src/lib.rs
```

## State Management

In CosmWasm, state is stored in the smart contract's storage, which is managed
by the Cosmos SDK. This contract interacts with this storage via helper
functions provided by `cosmwasm-storage`. This storage is part of the blockchain
state and is specific to each contract instance. State variables are typically
defined in a `state.rs` file and are serialized/deserialized using `serde`.
State management functions are used within the contract logic to read from and
write to the storage.

In contrast, Solana programs manage state by directly reading from and writing
to the data of accounts passed into the program. The state is serialized and
deserialized using libraries like `Borsh`. State is read from and written to
account data in the program logic.

### Key Differences

1. Storage Abstraction:
   - **CosmWasm**: Uses abstractions like `cosmwasm_storage` to manage state.
     The contract interacts with a key-value storage system provided by the
     Cosmos SDK.
   - **Solana**: Directly reads from and writes to account data, which is part
     of the account's state on the Solana blockchain.
2. Serialization:
   - **CosmWasm**: Typically uses `serde` for serialization of state structures.
   - **Solana**: Uses `Borsh` for serialization and deserialization of account
     data.
3. State Location:
   - **CosmWasm**: State is stored in the contract's storage, managed by the
     Cosmos SDK.
   - **Solana**: State is stored in account data, which is passed to the program
     during execution.
4. Access Patterns:
   - **CosmWasm**: State is accessed via storage APIs provided by CosmWasm.
   - **Solana**: State is accessed by directly manipulating the data of
     accounts.

Note understanding the core concept of Accounts on Solana is crucial to
designing Solana Programs. Read about the Solana Account Model
[here](https://solana.com/docs/core/accounts).

### Example of Solana State Management

1. Defining State Structure

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Counter {
    pub count: u32,
}
```

2. Reading and Writing State

State is read from and written to account data in the program logic.

```rust
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program_error::ProgramError, pubkey::Pubkey,
};
use borsh::BorshDeserialize;
use std::convert::TryInto;

pub fn process_increment(accounts: &[AccountInfo], program_id: &Pubkey) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_info_iter)?;

    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut counter_data = Counter::try_from_slice(&counter_account.data.borrow())?;
    counter_data.count += 1;
    counter_data.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;

    Ok(())
}
```

## Messages vs. Instruction Handling

Understanding the key differences between CosmWasm messages and Solana program
instruction handling is crucial for developers transitioning between these two
ecosystems. Here’s a detailed comparison:

### Advantages of the Instruction-Based Approach in Solana
