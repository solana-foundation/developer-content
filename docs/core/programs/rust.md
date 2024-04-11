---
title: Native Rust
sidebarLabel: Native Rust
---

To develop Solana programs, we use the
[`solana_program`](https://docs.rs/solana-program/latest/solana_program/) crate.
This is the base library for writing on-chain programs in Rust.

For beginners, it is recommended to start with the
[Anchor framework](/docs/core/programs/anchor).

## Program

Below is a simple Solana program with a single instruction that creates a new
account. We'll walk through it to explain the basic structure of a Solana
program. Here is the program on
[Solana Playground](https://beta.solpg.io/661058a6cffcf4b13384d02a).

```rust filename="lib.rs"
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction::create_account,
    sysvar::Sysvar,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = Instructions::try_from_slice(instruction_data)?;
    match instruction {
        Instructions::Initialize { data } => process_initialize(program_id, accounts, data),
    }
}

pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let new_account = next_account_info(accounts_iter)?;
    let signer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let account_data = NewAccount { data };
    let size = account_data.try_to_vec()?.len();
    let lamports = (Rent::get()?).minimum_balance(size);

    invoke(
        &create_account(
            signer.key,
            new_account.key,
            lamports,
            size as u64,
            program_id,
        ),
        &[signer.clone(), new_account.clone(), system_program.clone()],
    )?;

    account_data.serialize(&mut *new_account.data.borrow_mut())?;
    msg!("Changed data to: {:?}!", data);
    Ok(())
}

#[derive(BorshSerialize, BorshDeserialize)]
pub enum Instructions {
    Initialize { data: u64 },
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NewAccount {
    pub data: u64,
}

```

### Entrypoint

Every Solana program includes a single
[entrypoint](https://github.com/solana-labs/solana/blob/master/sdk/program/src/entrypoint.rs#L125)
used to invoke the program. The
[process_instruction](https://github.com/solana-labs/solana/blob/master/sdk/program/src/entrypoint.rs#L28-L29)
function is then used to process the data passed into the entrypoint. This
function requires the following parameters:

- program_id: Address of the currently executing program
- accounts: Array of accounts needed to execute an instruction.
- instruction_data: Serialized data specific to an instruction.

```rust
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    ...
}
```

These parameters correspond to the details required for every
[instruction](/docs/core/transactions#instruction) on a transaction.

### Instructions

While there is only one entrypoint, program execution can follow different paths
depending on the `instruction_data`. It is common to define instructions as
variants within an
[enum](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html), where each
variant represents a distinct instruction on the program.

```rust {3}
#[derive(BorshSerialize, BorshDeserialize)]
pub enum Instructions {
    Initialize { data: u64 },
}
```

The `instruction_data` passed into the entrypoint is deserialized to determine
its corresponding enum variant.

```rust {6} /instruction_data/
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = Instructions::try_from_slice(instruction_data)?;
    match instruction {
        Instructions::Initialize { data } => process_initialize(program_id, accounts, data),
    }
}
```

A [match](https://doc.rust-lang.org/book/ch06-02-match.html) statement is then
used to invoke the function including the logic to process the identified
instruction.

```rust /process_initialize/
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = Instructions::try_from_slice(instruction_data)?;
    match instruction {
        Instructions::Initialize { data } => process_initialize(program_id, accounts, data),
    }
}

pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: u64,
) -> ProgramResult {
    ...
    Ok(())
}
```

### Process Instruction

For every instruction on a program, there exists a specific function that
implements the logic required to execute that instruction.

```rust
pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    let new_account = next_account_info(accounts_iter)?;
    let signer = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    let account_data = NewAccount { data };
    let size = account_data.try_to_vec()?.len();
    let lamports = (Rent::get()?).minimum_balance(size);

    invoke(
        &create_account(
            signer.key,
            new_account.key,
            lamports,
            size as u64,
            program_id,
        ),
        &[signer.clone(), new_account.clone(), system_program.clone()],
    )?;

    account_data.serialize(&mut *new_account.data.borrow_mut())?;
    msg!("Changed data to: {:?}!", data);
    Ok(())
}
```

To access the accounts provided to the program, use an
[iterator](https://doc.rust-lang.org/book/ch13-02-iterators.html) to iterate
over the list of accounts passed into the entrypoint through the `accounts`
argument.

```rust {1} /new_account/ /signer/ /system_program/
let accounts_iter = &mut accounts.iter();

let new_account = next_account_info(accounts_iter)?;
let signer = next_account_info(accounts_iter)?;
let system_program = next_account_info(accounts_iter)?;
```

Creating a new account requires invoking the
[`create_account`](https://github.com/solana-labs/solana/blob/master/programs/system/src/system_processor.rs#L145)
instruction on the [System Program](/docs/core/accounts#system-program). When
the System Program creates a new account, it can reassign the program owner of
the new account.

In this example, we use a [Cross Program Invocation](/docs/core/cpi) to invoke
the System Program, creating a new account with the executing program as the
owner.

```rust
let account_data = NewAccount { data };
let size = account_data.try_to_vec()?.len();
let lamports = (Rent::get()?).minimum_balance(size);

invoke(
    &create_account(
        signer.key,      // payer
        new_account.key, // new account address
        lamports,        // rent
        size as u64,     // space
        program_id,      // program owner address
    ),
    &[signer.clone(), new_account.clone(), system_program.clone()],
)?;
```

As part of the [Solana Account Model](/docs/core/accounts#accountinfo), only the
program designated as the owner of an account is allowed to modify the data on
the account.

After the account has been successfully created, the final step is to serialize
data into the new account's data field. This effectively initializes the account
data, storing the `data` passed into the program entrypoint.

```rust
account_data.serialize(&mut *new_account.data.borrow_mut())?;
```

### State

Structs are used to define the format of a custom data account type for a
program. Serialization and deserialization of account data is commonly done
using [Borsh](https://borsh.io/).

In this example, the `NewAccount` struct defines the structure of the data to
store on a new account.

```rust
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NewAccount {
    pub data: u64,
}
```

All Solana accounts include a [`data`](/docs/core/accounts#accountinfo) field
that can be used to store any arbitrary data as a byte array. This flexibility
enables programs to create and store customized data structures within new
accounts.

In the `process_initialize` function, the data passed into the entrypoint is
used to create an instance of the `NewAccount` struct. This instance is
serialized and stored in the data field of the newly created account.

```rust /data: u64/1 /account_data/ /NewAccount { data }/ /NewAccount/
pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: u64,
) -> ProgramResult {

    let account_data = NewAccount { data };

    invoke(
        ...
    )?;

    account_data.serialize(&mut *new_account.data.borrow_mut())?;
    msg!("Changed data to: {:?}!", data);
    Ok(())
}
...

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct NewAccount {
    pub data: u64,
}
```
