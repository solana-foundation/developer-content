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
- Entry Points: Separate entry points for instantiate, execute, and query.
- Messages: Uses `InstantiateMsg`, `ExecuteMsg`, and `QueryMsg` to define
  contract interactions.

**Solana**

- Execution Environment: Runs on the Solana blockchain, optimized for high
  throughput and low latency.
- State Management: Primarily uses `Borsh` for serialization and deserialization
  of state stored in accounts. Solana recommends Borsh for its efficiency, but
  developers can use other serialization formats like bincode if desired.
- Entry Point: A single entry point (process_instruction) handles all
  instructions.
- Instructions: Uses custom-defined instructions encoded typically as byte
  arrays, which are parsed within process_instruction to determine the specific
  operations to perform. Instructions must be explicitly defined and handled
  within the smart contract.

## State Management

In CosmWasm, state is stored in the smart contract's storage, which is managed
by the Cosmos SDK. This contract interacts with this storage via helper
functions provided by `cosmwasm-storage`. This storage is part of the blockchain
state and is specific to each contract instance. State variables are typically
defined in a `state.rs` file and are serialized/deserialized using `serde`.
State management functions are used within the contract logic to read from and
write to the storage.

In contrast, Solana programs manage state by interacting with the data of
specific accounts that are passed into the program during execution. These
accounts can be created and assigned by the System Program and are allocated a
certain amount of space for storing data. The state within these accounts is
serialized and deserialized using libraries like Borsh. Solana programs are
responsible for interpreting the account data as state information, writing to
and reading from these accounts directly in the program logic.

The core concept of accounts on Solana is crucial to understanding state
management and effectively designing Solana programs. Each account on Solana can
be associated with a specific program (smart contract), and only the owning
program can modify its state. This model differs significantly from many other
blockchain platforms where the state is managed more directly through the smart
contract itself. For detailed information on the Solana Account Model, refer to
the Solana documentation [here](https://solana.com/docs/core/accounts).

### Key Differences

1. Storage Abstraction:
   - **CosmWasm**: Uses abstractions like `cosmwasm_storage` to manage state.
     The contract interacts with a key-value storage system provided by the
     Cosmos SDK.
   - **Solana**: Directly reads from and writes to account data, which is part
     of the account's state on the Solana blockchain.
2. Serialization:
   - **CosmWasm**: Uses a mix of JSON for interoperability and human
     readability, and binary formats like bincode for state storage.
   - **Solana**: Typically uses Borsh for all serialization purposes to ensure
     speed and consistency in a high throughput environment, but have the option
     to roll your own if you choose to.
3. State Location:
   - **CosmWasm**: State is stored in the contract's storage, managed by the
     Cosmos SDK.
   - **Solana**: State is stored in account data, which is passed to the program
     during execution.
4. Access Patterns:
   - **CosmWasm**: State is accessed via storage APIs provided by CosmWasm.
   - **Solana**: State is accessed by directly manipulating the data of
     accounts.

### Converting CosmWasm State Management to Solana

#### Step 1: Define Account State

In Solana, state is stored in accounts. Define the state structure and manage
serialization using Borsh.

**CosmWasm State Definition**

```rust
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct State {
    pub count: u32,
}
```

**Solana State Definition**

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterState {
    pub count: u32,
}
```

#### Step 2: Reading and Writing State

In Solana, State is read from and written to account data in the program logic.

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

## Entry Points

CosmWasm provides a modular approach with separate entry points (instantiate,
execute, query) for different types of operations. Solana uses a single entry
point (process_instruction) for all instruction types, which offers fine-grained
control.

### Key Differences

1. Entry point structure
   - In CosmWasm, each entry point is defined as a separate function, often
     using the `#[entry_point]` attribute in Rust.
   - In Solana, the program internally dispatches the instruction to the
     appropriate handler based on teh instruction data.
2. Serialization and Deserialization
   - CosmWasm contracts use JSON for message serialization and deserialization,
     which makes it easier to understand and debug but can introduce overhead
   - Solana Programs use Binary Serialization for instructions, which is more
     efficient in terms of performance and storage.
3. Error Handling
   - CosmWasm typically uses standard Rust error handling methods and the errors
     are returned as part of the result
   - Solana has a specific set of program errors and error handling is closely
     tied to instruction processing. Errors must be propagated correctly to
     ensure proper transaction behavior.

### Converting CosmWasm Entry Points to Solana

**CosmWasm EntryPoint Example**

```rust
use cosmwasm_std::{entry_point, DepsMut, Env, MessageInfo, Response, StdResult};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialization logic
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    match msg {
        ExecuteMsg::Increment {} => execute_increment(deps, env, info),
        ExecuteMsg::Reset { count } => execute_reset(deps, env, info, count),
    }
}

#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::GetCount {} => query_count(deps),
    }
}
```

**Solana Entry Point Example**

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError,
};
use borsh::BorshDeserialize;

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = CounterInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        CounterInstruction::Initialize { count } => {
            process_initialize(accounts, count, program_id)
        }
        CounterInstruction::Increment => process_increment(accounts, program_id),
        CounterInstruction::Reset { count } => process_reset(accounts, count, program_id),
    }
}
```

## Messages vs. Instruction Handling

Understanding the key differences between CosmWasm messages and Solana program
instruction handling is crucial for developers transitioning between these two
ecosystems

### Key Differences

CosmWasm smart contracts use a message-based architecture to handle different
types of interactions. These messages define the inputs and operations that a
contract can perform.

1. Message Types:

   - InstantiateMsg: Defines parameters for contract instantiation.
   - ExecuteMsg: Defines parameters for executing various contract functions.
   - QueryMsg: Defines parameters for querying the contract state without
     changing it.

2. Handling Messages:

   - Separate entry points for different message types: instantiate, execute,
     and query.
   - Each entry point processes its specific message type and performs the
     corresponding logic.

Solana programs use instructions to define operations that an on-chain program
can perform. These instructions are more granular and low-level compared to
CosmWasm messages.

1. Instruction Definition:

   - Instructions are defined using custom data structures.
   - Typically serialized and deserialized using Borsh.

2. Account Handling:

   - Instructions include references to accounts that the program will read from
     or write to.
   - Ensures the program has the necessary access to operate on the blockchain
     state.

### Converting Messages to Instructions

#### Step 1: Define Messages as Instructions

In CosmWasm, messages are defined using structs and enums. In Solana, similar
structs and enums will be used to define instructions.

**CosmWasm Message Definition:**

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct InstantiateMsg {
    pub count: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum ExecuteMsg {
    Increment {},
    Reset { count: u32 },
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub struct QueryMsg {
    pub get_count: {},
}
```

**Solana Instruction Definitions:**

```rust
use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CounterInstruction {
    Initialize { count: u32 },
    Increment,
    Reset { count: u32 },
}
```

#### Step 2: Implement Instruction Handling

Create handlers for each instruction in Solana. This involves writing the logic
to process each instruction and update the account state accordingly. This is
very similar to handling Execute and Query messages in a CosmWasm smart
contract.

**Solana Instruction Handling:**

```rust
use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};
use crate::state::CounterState;

pub fn process_initialize(
    accounts: &[AccountInfo],
    count: u32,
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_info_iter)?;

    // Ensure the account is owned by the program
    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut counter_data = CounterState { count };

    // Serialize the state into the account
    counter_data.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;

    Ok(())
}

pub fn process_increment(accounts: &[AccountInfo], program_id: &Pubkey) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_info_iter)?;

    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize the state
    let mut counter_data = CounterState::try_from_slice(&counter_account.data.borrow())?;

    // Update the count
    counter_data.count += 1;

    // Serialize the updated state back into the account
    counter_data.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;

    Ok(())
}

pub fn process_reset(
    accounts: &[AccountInfo],
    count: u32,
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let counter_account = next_account_info(account_info_iter)?;

    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut counter_data = CounterState::try_from_slice(&counter_account.data.borrow())?;

    counter_data.count = count;

    counter_data.serialize(&mut &mut counter_account.data.borrow_mut()[..])?;

    Ok(())
}
```

## Solana Program Advantages

1. Performance Efficiency:
   - Solana's binary instruction data and direct account manipulation provide
     high performance and low latency.
   - This is critical for high-throughput applications like decentralized
     exchanges (DEXes) and other performance-sensitive use cases.
2. Fine-Grained Control:
   - The instruction-based approach offers fine-grained control over program
     execution and state management.
   - Developers can optimize their programs at a low level, potentially leading
     to more efficient implementations.
3. Flexibility:
   - Custom instructions can be designed to fit any specific use case, providing
     flexibility for advanced and complex operations.
   - This makes it suitable for developers who need to implement highly
     specialized logic.

In conclusion, Solana is ideal for applications that require high performance,
low latency, and fine-grained control over execution. It's better suited for
developers comfortable with lower-level programming and those who need to
optimize for specific use cases.
