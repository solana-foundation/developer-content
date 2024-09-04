---
title: Anchor Program Structure
description: Program Structure
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
  types specific to the program

## Example Program

Below is a simple Anchor program that creates an account (`NewAccount` type)
which stores a `u64` value passed to the `initialize` instruction.

We'll use this example to walk through the basic structure of an Anchor program.

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

## declare_id macro

The
[`declare_id`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/account/src/lib.rs#L430)
macro is used to specify the on-chain address of the program (program ID).

By default, the keypair generated for the program ID is found in
`/target/deploy/your_program_name.json`.

```rust filename="lib.rs" {3}
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");
```

To update the value of the program ID in the `declare_id` macro with the public
key of the keypair in the `/target/deploy/your_program_name.json` file, run the
following command:

```shell filename="Terminal"
anchor keys sync
```

The `anchor keys sync` command is useful after cloning a Github repo since the
value of the program ID in a cloned repo's `declare_id` macro won't match the
one generated when you run `anchor build` locally.

## program macro

The
[`#[program]`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/program/src/lib.rs#L12)
macro specifies the module containing all of your program's instructions. Each
public function in the module represents a separate instruction for the program.
The body of the function is the logic that is executed when the instruction is
invoked.

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

Every instruction in an Anchor program must have a `Context<T>` type as its
first parameter, where `T` is a struct you define that implements the `Accounts`
trait and specifies the accounts the instruction requires.

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

The `Context` fields can be used in an instruction using dot notation:

- `ctx.accounts`: The instruction's accounts
- `ctx.program_id`: The address of the program itself
- `ctx.remaining_accounts`: All accounts provided to the instruction but not
  specified in the `Accounts` struct
- `ctx.bumps`: Bump seeds for any
  [Program Derived Address (PDA)](/docs/core/pda.md) accounts specified in the
  `Accounts` struct

Additional parameters are optional and define any additional arguments that need
to be provided when the instruction is invoked.

```rust filename="lib.rs" /Context/
pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
    ctx.accounts.new_account.data = data;
    msg!("Changed data to: {}!", data);
    Ok(())
}
```

In this example, the `Initialize` struct implements the `Accounts` trait and
specifies the accounts the `initialize` instruction requires.

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

## derive(Accounts) macro

The
[`#[derive(Accounts)]`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/derive/accounts/src/lib.rs#L630)
macro is applied to a struct and implements the
[`Accounts`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/src/lib.rs#L105)
trait. A struct annotated with `#[derive(Accounts)]` is used to specify accounts
required for a particular instruction.

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
  [here](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/src/accounts.rs).

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

When an Anchor program instruction is invoked, the program first validates the
accounts passed into the instruction before executing the instruction's logic.
Accounts are then accessible in an instruction using the `ctx.accounts` syntax.

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

## account macro

The
[`#[account]`](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/account/src/lib.rs#L66)
macro is applied to structs to defines the data structure for custom accounts
the program can create.

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
  A unique 8-byte discriminator, specific to the account type, is added as the
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

For accounts created in an Anchor program, the account discriminator refers to
an 8-byte identifier, unique to each account type. This identifier is derived
using the first 8 bytes of the SHA256 hash of the string
`account:<account_name>`. The first 8 bytes in an account's data are
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
programs.
