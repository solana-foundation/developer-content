---
title: Anchor Program Structure
description:
  Learn about the structure of Anchor programs, including key macros and their
  roles in simplifying Solana program development
sidebarLabel: Program Structure
sidebarSortOrder: 1
---

The [Anchor framework](https://www.anchor-lang.com/) uses
[Rust macros](https://doc.rust-lang.org/book/ch19-06-macros.html) to reduce
boilerplate code and simplify the implementation of common security checks
required for writing Solana programs.

The main macros found in an Anchor program include:

- [`declare_id`](#declare-id-macro): Specifies the program's on-chain address
- [`#[program]`](#program-macro): Specifies the module containing the program’s
  instruction logic
- [`#[derive(Accounts)]`](#derive-accounts-macro): Applied to structs to
  indicate a list of accounts required by an instruction
- [`#[account]`](#account-macro): Applied to structs to create custom account
  types for the program

## Example Program

Let's examine a simple program that demonstrates the usage of the macros
mentioned above to understand the basic structure of an Anchor program.

The example program below creates a new account (`NewAccount`) that stores a
`u64` value passed to the `initialize` instruction.

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

## declare_id! macro

The
[`declare_id`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/account/src/lib.rs#L430)
macro specifies the on-chain address of the program, known as the program ID.

```rust filename="lib.rs" {3}
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");
```

By default, the program ID is the public key of the keypair generated at
`/target/deploy/your_program_name.json`.

To update the value of the program ID in the `declare_id` macro with the public
key of the keypair in the `/target/deploy/your_program_name.json` file, run the
following command:

```shell filename="Terminal"
anchor keys sync
```

The `anchor keys sync` command is useful to run when cloning a repository where
the value of the program ID in a cloned repo's `declare_id` macro won't match
the one generated when you run `anchor build` locally.

## #[program] macro

The
[`#[program]`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/program/src/lib.rs#L12)
macro defines the module that contains all the instruction handlers for your
program. Each public function within this module corresponds to an instruction
that can be invoked.

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

### Instruction Context

Instruction handlers are functions that define the logic executed when an
instruction is invoked. The first parameter of each handler is a `Context<T>`
type, where `T` is a struct implementing the `Accounts` trait and specifies the
accounts the instruction requires.

The
[`Context`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/src/context.rs#L24)
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

The `Context` fields can be accessed in an instruction using dot notation:

- `ctx.accounts`: The accounts required for the instruction
- `ctx.program_id`: The program's public key (address)
- `ctx.remaining_accounts`: Additional accounts not specified in the `Accounts`
  struct.
- `ctx.bumps`: Bump seeds for any
  [Program Derived Address (PDA)](/docs/core/pda.md) accounts specified in the
  `Accounts` struct

Additional parameters are optional and can be included to specify arguments that
must be provided when the instruction is invoked.

```rust filename="lib.rs" /Context/ /data/1
pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
    ctx.accounts.new_account.data = data;
    msg!("Changed data to: {}!", data);
    Ok(())
}
```

In this example, the `Initialize` struct implements the `Accounts` trait where
each field in the struct represents an account required by the `initialize`
instruction.

```rust filename="lib.rs" /Initialize/ /Accounts/
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
```

## #[derive(Accounts)] macro

The
[`#[derive(Accounts)]`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/derive/accounts/src/lib.rs#L630)
macro is applied to a struct to specify the accounts that must be provided when
an instruction is invoked. This macro implements the
[`Accounts`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/src/lib.rs#L105)
trait, which simplifies account validation and serialization and deserialization
of account data.

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

Each field in the struct represents an account required by an instruction. The
naming of each field is arbitrary, but it is recommended to use a descriptive
name that indicates the purpose of the account.

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

### Account Validation

To prevent security vulnerabiliies, it's important to verify that accounts
provided to an instruction are the expected accounts. Accounts are validated in
Anchor programs in two ways that are generally used together:

- [Account Constraints](https://www.anchor-lang.com/docs/account-constraints):
  Constraints define additional conditions that an account must satisfy to be
  considered valid for the instruction. Constraints are applied using the
  `#[account(..)]` attribute, which is placed above a field in a struct that
  implements the `Accounts` trait.

  You can find the implementation of the constraints
  [here](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/syn/src/parser/accounts/constraints.rs).

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

- [Account Types](https://www.anchor-lang.com/docs/account-types): Anchor
  provides various account types to help ensure that the account provided by the
  client matches what the program expects.

  You can find the implementation of the account types
  [here](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/src/accounts).

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

When an instruction in an Anchor program is invoked, the program first validates
the accounts provided before executing the instruction's logic. After
validation, these accounts can be accessed within the instruction using the
`ctx.accounts` syntax.

```rust filename="lib.rs"  /ctx.accounts.new_account/ /new_account/ /Initialize/
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

## #[account] macro

The
[`#[account]`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/account/src/lib.rs#L66)
macro is applied to structs that define the data stored in custom accounts
created by your program.

```rust
#[account]
pub struct NewAccount {
    data: u64,
}
```

This macro implements various traits
[detailed here](https://docs.rs/anchor-lang/latest/anchor_lang/attr.account.html).
The key functionalities of the `#[account]` macro include:

- [Assign Program Owner](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/account/src/lib.rs#L119-L132):
  When creating an account, the program owner of the account is automatically
  set to the program specified in `declare_id`.
- [Set Discriminator](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/account/src/lib.rs#L101-L117):
  A unique 8 byte discriminator, specific to the account type, is added as the
  first 8 bytes of account data during its initialization. This helps in
  differentiating account types and is used for account validation.
- [Data Serialization and Deserialization](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/account/src/lib.rs#L202-L246):
  Account data is automatically serialized and deserialized as the account type.

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

### Account Discriminator

An account discriminator in an Anchor program refers to an 8 byte identifier
unique to each account type. It's derived from the first 8 bytes of the SHA256
hash of the string `account:<AccountName>`. This discriminator is stored as the
first 8 bytes of account data when an account is created.

When creating an account in an Anchor program, 8 bytes must be allocated for the
discriminator.

```rust /8/1
#[account(init, payer = signer, space = 8 + 8)]
pub new_account: Account<'info, NewAccount>,
```

The discriminator is used during the following two scenarios:

- Initialization: When an account is created, the discriminator is set as the
  first 8 bytes of the account's data.
- Deserialization: When account data is deserialized, the first 8 bytes of
  account data is checked against the discriminator of the expected account
  type.

If there's a mismatch, it indicates that the client has provided an unexpected
account. This mechanism serves as an account validation check in Anchor
programs.
