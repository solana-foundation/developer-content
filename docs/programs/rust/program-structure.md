---
title: Rust Program Structure
sidebarLabel: Program Structure
description:
  Learn how to structure Solana programs in Rust, including entrypoints, state
  management, instruction handling, and testing.
sidebarSortOrder: 1
---

Solana programs written in Rust have minimal structural requirements, allowing
for flexibility in how code is organized. The only requirement is that a program
must have an `entrypoint`, which defines where the execution of a program
begins.

## Program Structure

While there are no strict rules for file structure, Solana programs typically
follow a common pattern:

- `entrypoint.rs`: Defines the entrypoint that routes incoming instructions.
- `state.rs`: Define program-specific state (account data).
- `instructions.rs`: Defines the instructions that the program can execute.
- `processor.rs`: Defines the instruction handlers (functions) that implement
  the business logic for each instruction.
- `error.rs`: Defines custom errors that the program can return.

You can find examples in the
[Solana Program Library](https://github.com/solana-labs/solana-program-library/tree/master/token/program/src).

## Example Program

To demonstrate how to build a native Rust program with multiple instructions,
we'll walk through a simple counter program that implements two instructions:

1. `InitializeCounter`: Creates and initializes a new account with an initial
   value.
2. `IncrementCounter`: Increments the value stored in an existing account.

For simplicity, the program will be implemented in a single `lib.rs` file,
though in practice you may want to split larger programs into multiple files.

<Accordion>
<AccordionItem title="Full Program Code">

```rs filename="lib.rs"
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};

// Program entrypoint
entrypoint!(process_instruction);

// Function to route instructions to the correct handler
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Unpack instruction data
    let instruction = CounterInstruction::unpack(instruction_data)?;

    // Match instruction type
    match instruction {
        CounterInstruction::InitializeCounter { initial_value } => {
            process_initialize_counter(program_id, accounts, initial_value)?
        }
        CounterInstruction::IncrementCounter => process_increment_counter(program_id, accounts)?,
    };
    Ok(())
}

// Instructions that our program can execute
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CounterInstruction {
    InitializeCounter { initial_value: u64 }, // variant 0
    IncrementCounter,                         // variant 1
}

impl CounterInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Get the instruction variant from the first byte
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        // Match instruction type and parse the remaining bytes based on the variant
        match variant {
            0 => {
                // For InitializeCounter, parse a u64 from the remaining bytes
                let initial_value = u64::from_le_bytes(
                    rest.try_into()
                        .map_err(|_| ProgramError::InvalidInstructionData)?,
                );
                Ok(Self::InitializeCounter { initial_value })
            }
            1 => Ok(Self::IncrementCounter), // No additional data needed
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}

// Initialize a new counter account
fn process_initialize_counter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_value: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let counter_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Size of our counter account
    let account_space = 8; // Size in bytes to store a u64

    // Calculate minimum balance for rent exemption
    let rent = Rent::get()?;
    let required_lamports = rent.minimum_balance(account_space);

    // Create the counter account
    invoke(
        &system_instruction::create_account(
            payer_account.key,    // Account paying for the new account
            counter_account.key,  // Account to be created
            required_lamports,    // Amount of lamports to transfer to the new account
            account_space as u64, // Size in bytes to allocate for the data field
            program_id,           // Set program owner to our program
        ),
        &[
            payer_account.clone(),
            counter_account.clone(),
            system_program.clone(),
        ],
    )?;

    // Create a new CounterAccount struct with the initial value
    let counter_data = CounterAccount {
        count: initial_value,
    };

    // Get a mutable reference to the counter account's data
    let mut account_data = &mut counter_account.data.borrow_mut()[..];

    // Serialize the CounterAccount struct into the account's data
    counter_data.serialize(&mut account_data)?;

    msg!("Counter initialized with value: {}", initial_value);

    Ok(())
}

// Update an existing counter's value
fn process_increment_counter(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let counter_account = next_account_info(accounts_iter)?;

    // Verify account ownership
    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Mutable borrow the account data
    let mut data = counter_account.data.borrow_mut();

    // Deserialize the account data into our CounterAccount struct
    let mut counter_data: CounterAccount = CounterAccount::try_from_slice(&data)?;

    // Increment the counter value
    counter_data.count = counter_data
        .count
        .checked_add(1)
        .ok_or(ProgramError::InvalidAccountData)?;

    // Serialize the updated counter data back into the account
    counter_data.serialize(&mut &mut data[..])?;

    msg!("Counter incremented to: {}", counter_data.count);
    Ok(())
}

// Struct representing our counter account's data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    count: u64,
}

#[cfg(test)]
mod test {
    use super::*;
    use solana_program_test::*;
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        signature::{Keypair, Signer},
        system_program,
        transaction::Transaction,
    };

    #[tokio::test]
    async fn test_counter_program() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "counter_program",
            program_id,
            processor!(process_instruction),
        )
        .start()
        .await;

        // Create a new keypair to use as the address for our counter account
        let counter_keypair = Keypair::new();
        let initial_value: u64 = 42;

        // Step 1: Initialize the counter
        println!("Testing counter initialization...");

        // Create initialization instruction
        let mut init_instruction_data = vec![0]; // 0 = initialize instruction
        init_instruction_data.extend_from_slice(&initial_value.to_le_bytes());

        let initialize_instruction = Instruction::new_with_bytes(
            program_id,
            &init_instruction_data,
            vec![
                AccountMeta::new(counter_keypair.pubkey(), true),
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new_readonly(system_program::id(), false),
            ],
        );

        // Send transaction with initialize instruction
        let mut transaction =
            Transaction::new_with_payer(&[initialize_instruction], Some(&payer.pubkey()));
        transaction.sign(&[&payer, &counter_keypair], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();

        // Check account data
        let account = banks_client
            .get_account(counter_keypair.pubkey())
            .await
            .expect("Failed to get counter account");

        if let Some(account_data) = account {
            let counter: CounterAccount = CounterAccount::try_from_slice(&account_data.data)
                .expect("Failed to deserialize counter data");
            assert_eq!(counter.count, 42);
            println!(
                "✅ Counter initialized successfully with value: {}",
                counter.count
            );
        }

        // Step 2: Increment the counter
        println!("Testing counter increment...");

        // Create increment instruction
        let increment_instruction = Instruction::new_with_bytes(
            program_id,
            &[1], // 1 = increment instruction
            vec![AccountMeta::new(counter_keypair.pubkey(), true)],
        );

        // Send transaction with increment instruction
        let mut transaction =
            Transaction::new_with_payer(&[increment_instruction], Some(&payer.pubkey()));
        transaction.sign(&[&payer, &counter_keypair], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();

        // Check account data
        let account = banks_client
            .get_account(counter_keypair.pubkey())
            .await
            .expect("Failed to get counter account");

        if let Some(account_data) = account {
            let counter: CounterAccount = CounterAccount::try_from_slice(&account_data.data)
                .expect("Failed to deserialize counter data");
            assert_eq!(counter.count, 43);
            println!("✅ Counter incremented successfully to: {}", counter.count);
        }
    }
}
```

```toml filename="Cargo.toml"
[package]
name = "counter_program"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
borsh = "1.5.1"
solana-program = "1.18.26"

[dev-dependencies]
solana-program-test = "1.18.26"
solana-sdk = "1.18.26"
tokio = "1.41.0"
```

</AccordionItem>
</Accordion>

<Steps>

### Create a new Program

First, create a new Rust project using the standard `cargo init` command with
the `--lib` flag.

```shell filename="Terminal"
cargo init counter_program --lib
```

Navigate to the project directory. You should see the default `src/lib.rs` and
`Cargo.toml` files

```shell filename="Terminal"
cd counter_program
```

Next, add the `solana-program` dependency. This is the minimum dependency
required to build a Solana program.

```shell filename="Terminal"
cargo add solana-program@1.18.26
```

Next, add the following snippet to `Cargo.toml`. If you don't include this
config, the `target/deploy` directory will not be generated when you build the
program.

```toml filename="Cargo.toml"
[lib]
crate-type = ["cdylib", "lib"]
```

Your `Cargo.toml` file should look like the following:

```toml filename="Cargo.toml"
[package]
name = "counter_program"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "1.18.26"
```

### Program Entrypoint

A Solana program entrypoint is the function that gets called when a program is
invoked. The entrypoint has the following raw definition and developers are free
to create their own implementation of the entrypoint function.

For simplicity, use the
[`entrypoint!`](https://github.com/solana-labs/solana/blob/v2.0/sdk/program/src/entrypoint.rs#L124-L140)
macro from the `solana_program` crate to define the entrypoint in your program.

```rs
#[no_mangle]
pub unsafe extern "C" fn entrypoint(input: *mut u8) -> u64;
```

Replace the default code in `lib.rs` with the following code. This snippet:

1. Imports the required dependencies from `solana_program`
2. Defines the program entrypoint using the `entrypoint!` macro
3. Implements the `process_instruction` function that will route instructions to
   the appropriate handler functions

```rs filename="lib.rs" {13} /process_instruction/
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Your program logic
    Ok(())
}
```

The `entrypoint!` macro requires a function with the the following
[type signature](https://github.com/solana-labs/solana/blob/v2.0/sdk/program/src/entrypoint.rs#L28-L29)
as an argument:

```rs
pub type ProcessInstruction =
    fn(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8]) -> ProgramResult;
```

When a Solana program is invoked, the entrypoint
[deserializes](https://github.com/solana-labs/solana/blob/v2.0/sdk/program/src/entrypoint.rs#L277)
the
[input data](https://github.com/solana-labs/solana/blob/v2.0/sdk/program/src/entrypoint.rs#L129-L131)
(provided as bytes) into three values and passes them to the
[`process_instruction`](https://github.com/solana-labs/solana/blob/v2.0/sdk/program/src/entrypoint.rs#L132)
function:

- `program_id`: The public key of the program being invoked (current program)
- `accounts`: The `AccountInfo` for accounts required by the instruction being
  invoked
- `instruction_data`: Additional data passed to the program which specifies the
  instruction to execute and its required arguments

These three parameters directly correspond to the data that clients must provide
when building an instruction to invoke a program.

### Define Program State

When building a Solana program, you'll typically start by defining your
program's state - the data that will be stored in accounts created and owned by
your program.

Program state is defined using Rust structs that represent the data layout of
your program's accounts. You can define multiple structs to represent different
types of accounts for your program.

When working with accounts, you need a way to convert your program's data types
to and from the raw bytes stored in an account's data field:

- Serialization: Converting your data types into bytes to store in an account's
  data field
- Deserialization: Converting the bytes stored in an account back into your data
  types

While you can use any serialization format for Solana program development,
[Borsh](https://borsh.io/) is commonly used. To use Borsh in your Solana
program:

1. Add the `borsh` crate as a dependency to your `Cargo.toml`:

```shell filename="Terminal"
cargo add borsh
```

2. Import the Borsh traits and use the derive macro to implement the traits for
   your structs:

```rust
use borsh::{BorshSerialize, BorshDeserialize};

// Define struct representing our counter account's data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    count: u64,
}
```

Add the `CounterAccount` struct to `lib.rs` to define the program state. This
struct will be used in both the initialization and increment instructions.

```rs filename="lib.rs" {12} {25-29}
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use borsh::{BorshSerialize, BorshDeserialize};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Your program logic
    Ok(())
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct CounterAccount {
    count: u64,
}
```

### Define Instructions

Instructions refer to the different operations that your Solana program can
perform. Think of them as public APIs for your program - they define what
actions users can take when interacting with your program.

Instructions are typically defined using a Rust enum where:

- Each enum variant represents a different instruction
- The variant's payload represents the instruction's parameters

Note that Rust enum variants are implicitly numbered starting from 0.

Below is an example of an enum defining two instructions:

```rust
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CounterInstruction {
    InitializeCounter { initial_value: u64 }, // variant 0
    IncrementCounter,                         // variant 1
}
```

When a client invokes your program, they must provide instruction data (as a
buffer of bytes) where:

- The first byte identifies which instruction variant to execute (0, 1, etc.)
- The remaining bytes contain the serialized instruction parameters (if
  required)

To convert the instruction data (bytes) into a variant of the enum, it is common
to implement a helper method. This method:

1. Splits the first byte to get the instruction variant
2. Matches on the variant and parses any additional parameters from the
   remaining bytes
3. Returns the corresponding enum variant

For example, the `unpack` method for the `CounterInstruction` enum:

```rust
impl CounterInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Get the instruction variant from the first byte
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        // Match instruction type and parse the remaining bytes based on the variant
        match variant {
            0 => {
                // For InitializeCounter, parse a u64 from the remaining bytes
                let initial_value = u64::from_le_bytes(
                    rest.try_into()
                        .map_err(|_| ProgramError::InvalidInstructionData)?
                );
                Ok(Self::InitializeCounter { initial_value })
            }
            1 => Ok(Self::IncrementCounter), // No additional data needed
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}
```

Add the following code to `lib.rs` to define the instructions for the counter
program.

```rs filename="lib.rs" {18-46}
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, msg,
    program_error::ProgramError, pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Your program logic
    Ok(())
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CounterInstruction {
    InitializeCounter { initial_value: u64 }, // variant 0
    IncrementCounter,                         // variant 1
}

impl CounterInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Get the instruction variant from the first byte
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        // Match instruction type and parse the remaining bytes based on the variant
        match variant {
            0 => {
                // For InitializeCounter, parse a u64 from the remaining bytes
                let initial_value = u64::from_le_bytes(
                    rest.try_into()
                        .map_err(|_| ProgramError::InvalidInstructionData)?,
                );
                Ok(Self::InitializeCounter { initial_value })
            }
            1 => Ok(Self::IncrementCounter), // No additional data needed
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}
```

### Instruction Handlers

Instruction handlers refer to the functions that contain the business logic for
each instruction. It's common to name handler functions as
`process_<instruction_name>`, but you're free to choose any naming convention.

Add the following code to `lib.rs`. This code uses the `CounterInstruction` enum
and `unpack` method defined in the previous step to route incoming instructions
to the appropriate handler functions:

```rs filename="lib.rs" {8-17} {20-32} /process_initialize_counter/1 /process_increment_counter/1
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Unpack instruction data
    let instruction = CounterInstruction::unpack(instruction_data)?;

    // Match instruction type
    match instruction {
        CounterInstruction::InitializeCounter { initial_value } => {
            process_initialize_counter(program_id, accounts, initial_value)?
        }
        CounterInstruction::IncrementCounter => process_increment_counter(program_id, accounts)?,
    };
}

fn process_initialize_counter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_value: u64,
) -> ProgramResult {
    // Implementation details...
    Ok(())
}

fn process_increment_counter(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    // Implementation details...
    Ok(())
}
```

Next, add the implementation of the `process_initialize_counter` function. This
instruction handler:

1. Creates and allocates space for a new account to store the counter data
2. Initializing the account data with `initial_value` passed to the instruction

<Accordion>
<AccordionItem title="Explanation">

The `process_initialize_counter` function requires three accounts:

1. The counter account that will be created and initialized
2. The payer account that will fund the new account creation
3. The System Program that we invoke to create the new account

To define the accounts required by the instruction, we create an iterator over
the `accounts` slice and use the `next_account_info` function to get each
account. The number of accounts you define are the accounts required by the
instruction.

The order of accounts is important - when building the instruction on the client
side, accounts must be provided in the same order as it is defined in the
program for the instruction to execute successfully.

While the variable names for the accounts have no effect on the program's
functionality, using descriptive names is recommended.

```rs filename="lib.rs" {6-10}
fn process_initialize_counter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_value: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let counter_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    Ok(())
}
```

Before creating an account, we need to:

1. Specify the space (in bytes) to allocate to the account's data field. Since
   we're storing a u64 value (`count`), we need 8 bytes.

2. Calculate the minimum "rent" balance required. On Solana, accounts must
   maintain a minimum balance of lamports (rent) based on amount of data stored
   on the account.

```rs filename="lib.rs" {12-17}
fn process_initialize_counter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_value: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let counter_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Size of our counter account
    let account_space = 8; // Size in bytes to store a u64

    // Calculate minimum balance for rent exemption
    let rent = Rent::get()?;
    let required_lamports = rent.minimum_balance(account_space);

    Ok(())
}
```

Once the space is defined and rent is calculated, create the account by invoking
the System Program's `create_account` instruction.

On Solana, new accounts can only be created by the System Program. When creating
an account, we specify the amount of bytes to allocate and the program owner of
the new account. The System Program:

1. Creates the new account
2. Allocates the specified space for the account's data field
3. Transfers ownership to the specified program

This ownership transfer is important because only the program owner of an
account can modify an account's data. In this case, we set our program as the
owner, which will allow us to modify the account's data to store the counter
value.

To invoke the System Program from our program's instruction, we make a Cross
Program Invocation (CPI) via the `invoke` function. A CPI allows one program to
call instructions on other programs - in this case, the System Program's
`create_account` instruction.

```rs filename="lib.rs" {19-33}
fn process_initialize_counter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_value: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let counter_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Size of our counter account
    let account_space = 8; // Size in bytes to store a u64

    // Calculate minimum balance for rent exemption
    let rent = Rent::get()?;
    let required_lamports = rent.minimum_balance(account_space);

    // Create the counter account
    invoke(
        &system_instruction::create_account(
            payer_account.key,    // Account paying for the new account
            counter_account.key,  // Account to be created
            required_lamports,    // Amount of lamports to transfer to the new account
            account_space as u64, // Size in bytes to allocate for the data field
            program_id,           // Set program owner to our program
        ),
        &[
            payer_account.clone(),
            counter_account.clone(),
            system_program.clone(),
        ],
    )?;

    Ok(())
}
```

Once the account is created, we initialize the account data by:

1. Creating a new `CounterAccount` struct with the `initial_value` provided to
   the instruction.
2. Getting a mutable reference to the new account's data field.
3. Serializing the `CounterAccount` struct into the account's data field,
   effectively storing the `initial_value` on the account.

```rs filename="lib.rs" {35-44} /inital_value/
fn process_initialize_counter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_value: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let counter_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Size of our counter account
    let account_space = 8; // Size in bytes to store a u64

    // Calculate minimum balance for rent exemption
    let rent = Rent::get()?;
    let required_lamports = rent.minimum_balance(account_space);

    // Create the counter account
    invoke(
        &system_instruction::create_account(
            payer_account.key,    // Account paying for the new account
            counter_account.key,  // Account to be created
            required_lamports,    // Amount of lamports to transfer to the new account
            account_space as u64, // Size in bytes to allocate for the data field
            program_id,           // Set program owner to our program
        ),
        &[
            payer_account.clone(),
            counter_account.clone(),
            system_program.clone(),
        ],
    )?;

    // Create a new CounterAccount struct with the initial value
    let counter_data = CounterAccount {
        count: initial_value,
    };

    // Get a mutable reference to the counter account's data
    let mut account_data = &mut counter_account.data.borrow_mut()[..];

    // Serialize the CounterAccount struct into the account's data
    counter_data.serialize(&mut account_data)?;

    msg!("Counter initialized with value: {}", initial_value);

    Ok(())
}
```

</AccordionItem>
</Accordion>

```rs filename="lib.rs"
// Initialize a new counter account
fn process_initialize_counter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_value: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let counter_account = next_account_info(accounts_iter)?;
    let payer_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Size of our counter account
    let account_space = 8; // Size in bytes to store a u64

    // Calculate minimum balance for rent exemption
    let rent = Rent::get()?;
    let required_lamports = rent.minimum_balance(account_space);

    // Create the counter account
    invoke(
        &system_instruction::create_account(
            payer_account.key,    // Account paying for the new account
            counter_account.key,  // Account to be created
            required_lamports,    // Amount of lamports to transfer to the new account
            account_space as u64, // Size in bytes to allocate for the data field
            program_id,           // Set program owner to our program
        ),
        &[
            payer_account.clone(),
            counter_account.clone(),
            system_program.clone(),
        ],
    )?;

    // Create a new CounterAccount struct with the initial value
    let counter_data = CounterAccount {
        count: initial_value,
    };

    // Get a mutable reference to the counter account's data
    let mut account_data = &mut counter_account.data.borrow_mut()[..];

    // Serialize the CounterAccount struct into the account's data
    counter_data.serialize(&mut account_data)?;

    msg!("Counter initialized with value: {}", initial_value);

    Ok(())
}
```

Next, add the implementation of the `process_increment_counter` function. This
instruction increments the value of an existing counter account.

<Accordion>
<AccordionItem title="Explanation">

Just like the `process_initialize_counter` function, we start by creating an
iterator over the accounts. In this case, we are only expecting one account,
which is the account to be updated.

Note that in practice, a developer must implement various security checks to
validate the accounts passed to the program. Since all accounts are provided by
the caller of the instruction, there is no guarantee that the accounts provided
are the ones the program expects. Missing account validation checks are a common
source of program vulnerabilities.

The example below includes a check to ensure the account we're referring to as
the `counter_account` is owned by the executing program.

```rs filename="lib.rs" {6-9}
// Update an existing counter's value
fn process_increment_counter(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let counter_account = next_account_info(accounts_iter)?;

    // Verify account ownership
    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    Ok(())
}
```

To update the account data, we:

- Mutably borrow the existing account's data field
- Deserialize the raw bytes into our `CounterAccount` struct
- Update the `count` value
- Serialize the modified struct back into the account's data field

```rs filename="lib.rs" {11-24}
// Update an existing counter's value
fn process_increment_counter(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let counter_account = next_account_info(accounts_iter)?;

    // Verify account ownership
    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Mutable borrow the account data
    let mut data = counter_account.data.borrow_mut();

    // Deserialize the account data into our CounterAccount struct
    let mut counter_data: CounterAccount = CounterAccount::try_from_slice(&data)?;

    // Increment the counter value
    counter_data.count = counter_data
        .count
        .checked_add(1)
        .ok_or(ProgramError::InvalidAccountData)?;

    // Serialize the updated counter data back into the account
    counter_data.serialize(&mut &mut data[..])?;

    msg!("Counter incremented to: {}", counter_data.count);
    Ok(())
}
```

</AccordionItem>
</Accordion>

```rs filename="lib.rs"
// Update an existing counter's value
fn process_increment_counter(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let counter_account = next_account_info(accounts_iter)?;

    // Verify account ownership
    if counter_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Mutable borrow the account data
    let mut data = counter_account.data.borrow_mut();

    // Deserialize the account data into our CounterAccount struct
    let mut counter_data: CounterAccount = CounterAccount::try_from_slice(&data)?;

    // Increment the counter value
    counter_data.count = counter_data
        .count
        .checked_add(1)
        .ok_or(ProgramError::InvalidAccountData)?;

    // Serialize the updated counter data back into the account
    counter_data.serialize(&mut &mut data[..])?;

    msg!("Counter incremented to: {}", counter_data.count);
    Ok(())
}
```

### Instruction Testing

To test the program instructions, add the following dependencies to
`Cargo.toml`.

```shell filename="Terminal"
cargo add solana-program-test@1.18.26 --dev
cargo add solana-sdk@1.18.26 --dev
cargo add tokio --dev
```

Then add the following test module to `lib.rs` and run `cargo test-sbf` to
execute the tests. Optionally, use the `--nocapture` flag to see the print
statements in the output.

```shell filename="Terminal"
cargo test-sbf -- --nocapture
```

<Accordion>
<AccordionItem title="Explanation">

First, set up the test module and import required dependencies:

```rs filename="lib.rs"
#[cfg(test)]
mod test {
    use super::*;
    use solana_program_test::*;
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        signature::{Keypair, Signer},
        system_program,
        transaction::Transaction,
    };

    #[tokio::test]
    async fn test_counter_program() {
        // Test code will go here
    }
}
```

Next, set up the test using `ProgramTest`. Then create a new keypair to use as
the address for the counter account we'll initialize and define an initial value
to set for the counter.

```rs filename="lib.rs"
#[cfg(test)]
mod test {
    use super::*;
    use solana_program_test::*;
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        signature::{Keypair, Signer},
        system_program,
        transaction::Transaction,
    };

    #[tokio::test]
    async fn test_counter_program() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "counter_program",
            program_id,
            processor!(process_instruction),
        )
        .start()
        .await;

        // Create a new keypair to use as the address for our counter account
        let counter_keypair = Keypair::new();
        let initial_value: u64 = 42;
    }
}
```

When building an instruction, each account must be provided as an
[`AccountMeta`](https://github.com/solana-labs/solana/blob/v2.0/sdk/program/src/instruction.rs#L539-L545),
which specifies:

- The account's public key (`Pubkey`)
- `is_writable`: Whether the account data will be modified
- `is_signer`: Whether the account must sign the transaction

```rs
AccountMeta::new(account1_pubkey, true),           // writable, signer
AccountMeta::new(account2_pubkey, false),          // writable, not signer
AccountMeta::new_readonly(account3_pubkey, false), // not writable, not signer
AccountMeta::new_readonly(account4_pubkey, true),  // writable, signer
```

To test the initialize instruction:

- Create instruction data with variant 0 (`InitializeCounter`) and initial value
- Build the instruction with the program ID, instruction data, and required
  accounts
- Send a transaction with the initialize instruction
- Check the account was created with the correct initial value

```rs filename="lib.rs" {16-53}
    #[tokio::test]
    async fn test_counter_program() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "counter_program",
            program_id,
            processor!(process_instruction),
        )
        .start()
        .await;

        // Create a new keypair to use as the address for our counter account
        let counter_keypair = Keypair::new();
        let initial_value: u64 = 42;

        // Step 1: Initialize the counter
        println!("Testing counter initialization...");

        // Create initialization instruction
        let mut init_instruction_data = vec![0]; // 0 = initialize instruction
        init_instruction_data.extend_from_slice(&initial_value.to_le_bytes());

        let initialize_instruction = Instruction::new_with_bytes(
            program_id,
            &init_instruction_data,
            vec![
                AccountMeta::new(counter_keypair.pubkey(), true),
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new_readonly(system_program::id(), false),
            ],
        );

        // Send transaction with initialize instruction
        let mut transaction =
            Transaction::new_with_payer(&[initialize_instruction], Some(&payer.pubkey()));
        transaction.sign(&[&payer, &counter_keypair], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();

        // Check account data
        let account = banks_client
            .get_account(counter_keypair.pubkey())
            .await
            .expect("Failed to get counter account");

        if let Some(account_data) = account {
            let counter: CounterAccount = CounterAccount::try_from_slice(&account_data.data)
                .expect("Failed to deserialize counter data");
            assert_eq!(counter.count, 42);
            println!(
                "✅ Counter initialized successfully with value: {}",
                counter.count
            );
        }
    }
```

To test the increment instruction:

- Build the instruction with the program ID, instruction data, and required
  accounts
- Send a transaction with the increment instruction
- Check the account was incremented to the correct value

Note that the instruction data for the increment instruction is `[1]`, which
corresponds to variant 1 (`IncrementCounter`). Since there are no additional
parameters to the increment instruction, the data is simply the instruction
variant.

```rs filename="lib.rs" {55-82}
    #[tokio::test]
    async fn test_counter_program() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "counter_program",
            program_id,
            processor!(process_instruction),
        )
        .start()
        .await;

        // Create a new keypair to use as the address for our counter account
        let counter_keypair = Keypair::new();
        let initial_value: u64 = 42;

        // Step 1: Initialize the counter
        println!("Testing counter initialization...");

        // Create initialization instruction
        let mut init_instruction_data = vec![0]; // 0 = initialize instruction
        init_instruction_data.extend_from_slice(&initial_value.to_le_bytes());

        let initialize_instruction = Instruction::new_with_bytes(
            program_id,
            &init_instruction_data,
            vec![
                AccountMeta::new(counter_keypair.pubkey(), true),
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new_readonly(system_program::id(), false),
            ],
        );

        // Send transaction with initialize instruction
        let mut transaction =
            Transaction::new_with_payer(&[initialize_instruction], Some(&payer.pubkey()));
        transaction.sign(&[&payer, &counter_keypair], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();

        // Check account data
        let account = banks_client
            .get_account(counter_keypair.pubkey())
            .await
            .expect("Failed to get counter account");

        if let Some(account_data) = account {
            let counter: CounterAccount = CounterAccount::try_from_slice(&account_data.data)
                .expect("Failed to deserialize counter data");
            assert_eq!(counter.count, 42);
            println!(
                "✅ Counter initialized successfully with value: {}",
                counter.count
            );
        }

        // Step 2: Increment the counter
        println!("Testing counter increment...");

        // Create increment instruction
        let increment_instruction = Instruction::new_with_bytes(
            program_id,
            &[1], // 1 = increment instruction
            vec![AccountMeta::new(counter_keypair.pubkey(), true)],
        );

        // Send transaction with increment instruction
        let mut transaction =
            Transaction::new_with_payer(&[increment_instruction], Some(&payer.pubkey()));
        transaction.sign(&[&payer, &counter_keypair], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();

        // Check account data
        let account = banks_client
            .get_account(counter_keypair.pubkey())
            .await
            .expect("Failed to get counter account");

        if let Some(account_data) = account {
            let counter: CounterAccount = CounterAccount::try_from_slice(&account_data.data)
                .expect("Failed to deserialize counter data");
            assert_eq!(counter.count, 43);
            println!("✅ Counter incremented successfully to: {}", counter.count);
        }
    }
```

</AccordionItem>
</Accordion>

```rs filename="lib.rs"
#[cfg(test)]
mod test {
    use super::*;
    use solana_program_test::*;
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        signature::{Keypair, Signer},
        system_program,
        transaction::Transaction,
    };

    #[tokio::test]
    async fn test_counter_program() {
        let program_id = Pubkey::new_unique();
        let (mut banks_client, payer, recent_blockhash) = ProgramTest::new(
            "counter_program",
            program_id,
            processor!(process_instruction),
        )
        .start()
        .await;

        // Create a new keypair to use as the address for our counter account
        let counter_keypair = Keypair::new();
        let initial_value: u64 = 42;

        // Step 1: Initialize the counter
        println!("Testing counter initialization...");

        // Create initialization instruction
        let mut init_instruction_data = vec![0]; // 0 = initialize instruction
        init_instruction_data.extend_from_slice(&initial_value.to_le_bytes());

        let initialize_instruction = Instruction::new_with_bytes(
            program_id,
            &init_instruction_data,
            vec![
                AccountMeta::new(counter_keypair.pubkey(), true),
                AccountMeta::new(payer.pubkey(), true),
                AccountMeta::new_readonly(system_program::id(), false),
            ],
        );

        // Send transaction with initialize instruction
        let mut transaction =
            Transaction::new_with_payer(&[initialize_instruction], Some(&payer.pubkey()));
        transaction.sign(&[&payer, &counter_keypair], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();

        // Check account data
        let account = banks_client
            .get_account(counter_keypair.pubkey())
            .await
            .expect("Failed to get counter account");

        if let Some(account_data) = account {
            let counter: CounterAccount = CounterAccount::try_from_slice(&account_data.data)
                .expect("Failed to deserialize counter data");
            assert_eq!(counter.count, 42);
            println!(
                "✅ Counter initialized successfully with value: {}",
                counter.count
            );
        }

        // Step 2: Increment the counter
        println!("Testing counter increment...");

        // Create increment instruction
        let increment_instruction = Instruction::new_with_bytes(
            program_id,
            &[1], // 1 = increment instruction
            vec![AccountMeta::new(counter_keypair.pubkey(), true)],
        );

        // Send transaction with increment instruction
        let mut transaction =
            Transaction::new_with_payer(&[increment_instruction], Some(&payer.pubkey()));
        transaction.sign(&[&payer, &counter_keypair], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();

        // Check account data
        let account = banks_client
            .get_account(counter_keypair.pubkey())
            .await
            .expect("Failed to get counter account");

        if let Some(account_data) = account {
            let counter: CounterAccount = CounterAccount::try_from_slice(&account_data.data)
                .expect("Failed to deserialize counter data");
            assert_eq!(counter.count, 43);
            println!("✅ Counter incremented successfully to: {}", counter.count);
        }
    }
}
```

Example output:

```shell filename="Terminal" {6} {10}
running 1 test
[2024-10-29T20:51:13.783708000Z INFO  solana_program_test] "counter_program" SBF program from /counter_program/target/deploy/counter_program.so, modified 2 seconds, 169 ms, 153 µs and 461 ns ago
[2024-10-29T20:51:13.855204000Z DEBUG solana_runtime::message_processor::stable_log] Program 1111111QLbz7JHiBTspS962RLKV8GndWFwiEaqKM invoke [1]
[2024-10-29T20:51:13.856052000Z DEBUG solana_runtime::message_processor::stable_log] Program 11111111111111111111111111111111 invoke [2]
[2024-10-29T20:51:13.856135000Z DEBUG solana_runtime::message_processor::stable_log] Program 11111111111111111111111111111111 success
[2024-10-29T20:51:13.856242000Z DEBUG solana_runtime::message_processor::stable_log] Program log: Counter initialized with value: 42
[2024-10-29T20:51:13.856285000Z DEBUG solana_runtime::message_processor::stable_log] Program 1111111QLbz7JHiBTspS962RLKV8GndWFwiEaqKM consumed 3791 of 200000 compute units
[2024-10-29T20:51:13.856307000Z DEBUG solana_runtime::message_processor::stable_log] Program 1111111QLbz7JHiBTspS962RLKV8GndWFwiEaqKM success
[2024-10-29T20:51:13.860038000Z DEBUG solana_runtime::message_processor::stable_log] Program 1111111QLbz7JHiBTspS962RLKV8GndWFwiEaqKM invoke [1]
[2024-10-29T20:51:13.860333000Z DEBUG solana_runtime::message_processor::stable_log] Program log: Counter incremented to: 43
[2024-10-29T20:51:13.860355000Z DEBUG solana_runtime::message_processor::stable_log] Program 1111111QLbz7JHiBTspS962RLKV8GndWFwiEaqKM consumed 756 of 200000 compute units
[2024-10-29T20:51:13.860375000Z DEBUG solana_runtime::message_processor::stable_log] Program 1111111QLbz7JHiBTspS962RLKV8GndWFwiEaqKM success
test test::test_counter_program ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.08s
```

</Steps>
