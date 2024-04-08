---
title: Programs
sidebarLabel: Programs on Solana
sidebarSortOrder: 3
---

In the Solana ecosystem, "smart contracts" are called programs. Each
[program](http://localhost:3002/docs/core/accounts#program-account) is an
on-chain account that stores executable logic, organized into specific functions
referred to as
[instructions](http://localhost:3002/docs/core/transactions#instruction).

Solana programs are predominantly written in the
[Rust](https://doc.rust-lang.org/book/) programming language, with two common
approaches for development:

- [Anchor](/docs/core/programs#anchor-framework): A framework designed for
  Solana program development. It provides a faster and simpler way to write
  programs, using Rust macros to significantly reduce boilerplate code.

- [Native Rust](/docs/core/programs#native-rust): This approach involves writing
  Solana programs directly in Rust without leveraging any frameworks. It offers
  more flexibility but comes with increased complexity.

## Anchor Framework

[Anchor](https://www.anchor-lang.com/) uses Rust macros to reduce boilerplate
code and simplify the implementation of common security checks required for
writing Solana programs. The main macros include:

- [`declare_id`](/docs/core/programs#declare_id): Specifies the program's
  on-chain address
- [`#[program]`](/docs/core/programs#program): Specifies the module containing
  the program’s instruction logic
- [`#[derive(Accounts)]`](/docs/core/programs#derive-accounts): Applied to
  structs to indicate a list of accounts required for an instruction
- [`#[account]`](/docs/core/programs#account): Applied to structs to create
  custom account types specific to the program

Below is a simple Anchor program with a single instruction that creates a new
account. We'll walk through it to explain the basic structure of an Anchor
program. Here is the program on
[Solana Playground](https://beta.solpg.io/660f3a86cffcf4b13384d022).

```rust filename="lib.rs"
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
}
```

### declare_id!()

The
[`declare_id`](https://github.com/coral-xyz/anchor/blob/master/lang/attribute/account/src/lib.rs#L430)
macro is used to specify the on-chain address of the program (program ID).

```rust filename="lib.rs" {3}
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");
```

When you build an Anchor program for the first time, the framework generates a
new keypair used to deploy the program (unless specified otherwise). The public
key from this keypair should be used as the program ID in the `declare_id`
macro.

### #[program]

The
[`#[program]`](https://github.com/coral-xyz/anchor/blob/master/lang/attribute/program/src/lib.rs#L12)
macro specifies the module containing all of your program's instructions. Each
public function in the module represents a separate instruction for the program.

In every function, the first parameter is always a `Context` type. Subsequent
parameters, which are optional, define instruction data required by the
instruction.

```rust filename="lib.rs" {5, 8-12}
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
}
```

The
[`Context`](https://github.com/coral-xyz/anchor/blob/master/lang/src/context.rs#L24)
type provides the instruction with access to the following non-argument inputs:

```rust
pub struct Context<'a, 'b, 'c, 'info, T> {
    /// Currently executing program id.
    pub program_id: &'a Pubkey,
    /// Deserialized accounts.
    pub accounts: &'b mut T,
    /// Remaining accounts given but not deserialized or validated.
    /// Be very careful when using this directly.
    pub remaining_accounts: &'c [AccountInfo<'info>],
    /// Bump seeds found during constraint validation. This is provided as a
    /// convenience so that handlers don't have to recalculate bump seeds or
    /// pass them in as arguments.
    pub bumps: BTreeMap<String, u8>,
}
```

`Context` is a generic type where `T` represents the set of accounts required by
an instruction. When defining the instruction's `Context`, the `T` type is a
struct that implements to the `Accounts` trait (`Context<Initialize>`).

This context parameter allows the instruction to access:

- `ctx.accounts`: The instruction's accounts
- `ctx.program_id`: The address of the program itself
- `ctx.remaining_accounts`: All remaining accounts provided to the instruction
  but not specified in the `Accounts` struct
- `ctx.bumps`: Bump seeds for any Program Derived Address (PDA) accounts
  specified in the `Accounts` struct

### #[derive(Accounts)]

The
[`#[derive(Accounts)]`](https://github.com/coral-xyz/anchor/blob/master/lang/derive/accounts/src/lib.rs#L631)
macro is applied a struct and implements the
[`Accounts`](https://github.com/coral-xyz/anchor/blob/master/lang/src/lib.rs#L104)
trait. This is used to specify and validate a set of accounts required for a
particular instruction.

```rust /Accounts/ {1}
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

Each field in the struct represents an account that is required by an
instruction. The naming of each field is arbitrary, but it is recommended to use
a descriptive name that indicates the purpose of the account.

```rust /signer/2 /new_account/ /system_program/
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

When building Solana programs, it's essential to validate the accounts provided
by the client. This validation is achieved in Anchor through account constraints
and specifying appropriate account types:

- **[Account Constraints](https://github.com/coral-xyz/anchor/blob/master/lang/syn/src/parser/accounts/constraints.rs)**:
  Constraints define additional conditions that an account must satisfy to be
  considered valid for the instruction. Constraints are applied using the
  `#[account(..)]` attribute, which is placed above an account field in the
  `Accounts` struct.

  ```rust {3, 5}
  #[derive(Accounts)]
  pub struct Initialize<'info> {
      #[account(init, payer = signer, space = 8 + 8)]
      pub new_account: Account<'info, NewAccount>,
      #[account(mut)]
      pub signer: Signer<'info>,
      pub system_program: Program<'info, System>,
  }
  ```

- **[Account Types](https://github.com/coral-xyz/anchor/tree/master/lang/src/accounts)**:
  Anchor provides various account types to help ensure that the account provided
  by the client matches what the program expects.

  ```rust /Account/2 /Signer/ /Program/
  #[derive(Accounts)]
  pub struct Initialize<'info> {
      #[account(init, payer = signer, space = 8 + 8)]
      pub new_account: Account<'info, NewAccount>,
      #[account(mut)]
      pub signer: Signer<'info>,
      pub system_program: Program<'info, System>,
  }
  ```

Accounts within the `Accounts` struct are accessible in an instruction through
the `Context`, using the `ctx.accounts` syntax.

```rust filename="lib.rs"  /ctx.accounts.new_account/ /new_account/ /Initialize/ {15-22}
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
}
```

When an instruction in an Anchor program is invoked, the program performs the
following checks as specified the in `Accounts` struct:

- **Account Type Verification**: It verifies that the accounts passed into the
  instruction correspond to the account types defined in the instruction
  Context.

- **Constraint Checks**: It checks the accounts against any additional
  constraints specified.

This helps ensure that the accounts passed to the instruction from the client
are valid. If any checks fail, then the instruction fails with an error before
reaching the main logic of the function.

For more detailed examples, refer to the
[constraints](https://www.anchor-lang.com/docs/account-constraints) and
[account types](https://www.anchor-lang.com/docs/account-types) sections in the
Anchor documentation.

### #[account]

The
[`#[account]`](https://github.com/coral-xyz/anchor/blob/master/lang/attribute/account/src/lib.rs#L66)
macro is applied to structs to define the format of a custom data account type
for a program. Each field in the struct represents a field that will be stored
in the account data.

```rust {3}
#[account]
pub struct NewAccount {
    data: u64,
}
```

This macro implements various traits
[detailed here](https://docs.rs/anchor-lang/latest/anchor_lang/attr.account.html).
The key functionalities of the `#[account]` macro include:

- [Assign Ownership](https://github.com/coral-xyz/anchor/blob/master/lang/attribute/account/src/lib.rs#L119-L132):
  When creating an account, the ownership of the account is automatically
  assigned to the program specified in the `declare_id`.
- [Set Discriminator](https://github.com/coral-xyz/anchor/blob/master/lang/attribute/account/src/lib.rs#L101-L117):
  A unique 8-byte discriminator, specific to the account type, is added as the
  first 8 bytes of account data during its initialization. This helps in
  differentiating account types and account validation.
- [Data Serialization and Deserialization](https://github.com/coral-xyz/anchor/blob/master/lang/attribute/account/src/lib.rs#L202-L246):
  The account data corresponding to the account type is automatically serialized
  and deserialized.

```rust filename="lib.rs" /data/2,6 /NewAccount/ {24-27}
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
}
```

In Anchor, an account discriminator is an 8-byte identifier, unique to each
account type. This identifier is derived from the first 8 bytes of the SHA256
hash of the account type's name. The first 8 bytes in an account's data are
specifically reserved for this discriminator.

```rust /8/1
#[account(init, payer = signer, space = 8 + 8)]
pub new_account: Account<'info, NewAccount>,
```

The discriminator is used during the following two scenarios:

- Initialization: During the initialization of an account, the discriminator is
  set with the account type's discriminator.
- Deserialization: When account data is deserialized, the discriminator within
  the data is checked against the expected discriminator of the account type.

If there's a mismatch, it indicates that the client has provided an unexpected
account. This mechanism serves as an account validation check in Anchor
programs, ensuring the correct and expected accounts are used.

## Native Rust

To develop Solana programs, we use the
[`solana_program`](https://docs.rs/solana-program/latest/solana_program/) crate.
This is the base library for writing on-chain programs in Rust.

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
data into the new account's data field. This effective initializes the account
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
