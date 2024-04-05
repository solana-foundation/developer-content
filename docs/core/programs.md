---
title: Programs
sidebarLabel: Programs on Solana
sidebarSortOrder: 3
---

In the Solana ecosystem, what are commonly known as "smart contracts" are called
programs. Each
[program](http://localhost:3002/docs/core/accounts#program-account) is an
on-chain account that contains executable logic, organized into specific
functions known as
[instructions](http://localhost:3002/docs/core/transactions#instruction).

Solana programs are predominantly written in the
[Rust](https://doc.rust-lang.org/book/) programming language, with two common
approaches for development:

- [Anchor](/docs/core/programs#anchor-framework): A framework designed
  specifically for Solana program development. It provides a faster and simpler
  way to write programs, using Rust macros to significantly reducing boilerplate
  code.

- [Native Rust](/docs/core/programs#native-rust): This approach involves writing
  Solana programs directly in Rust without leveraging any frameworks. It offers
  more flexibility but comes with increased complexity.

## Anchor Framework

[Anchor](https://www.anchor-lang.com/) uses Rust macros to reduce boilerplate
code and simplify the implementation of common security checks associated with
writing Solana programs. The main macros include:

- [`declare_id`](/docs/core/programs#declare_id): Specifies the program's
  on-chain address
- [`#[program]`](/docs/core/programs#program): Specifies the module containing
  the program’s instruction logic
- [`#[derive(Accounts)]`](/docs/core/programs#program): Applied to structs to
  indicate a list of accounts required for an instruction
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
macro is used to specify the on-chain address of the program (i.e. the program
ID). When you build an Anchor program for the first time, the framework will
generate a new keypair. This becomes the default keypair used to deploy the
program unless specified otherwise. The public key from this keypair should be
used as the program ID in the `declare_id` macro.

```rust filename="lib.rs" {3}
use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");
```

### #[program]

The
[`#[program]`](https://github.com/coral-xyz/anchor/blob/master/lang/attribute/program/src/lib.rs#L12)
macro specifies the module containing all of your program's instructions. Each
public function in the module represents a separate instruction for the program.

In every function, the initial parameter is always of the `Context` type.
Subsequent parameters, which are optional, define instruction data required by
the instruction.

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
type provides the instruction with access to the following information:

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
struct that implements to the `Accounts` trait (e.g. `Context<Initialize>`).

This context parameter allows the instruction to access:

- `ctx.accounts`: The instruction's accounts
- `ctx.program_id`: The executing program's ID
- `ctx.remaining_accounts`: All remaining accounts provided to the instruction
  but not specified in the `Accounts` struct
- `ctx.bumps`: Bump seeds for any Program Derived Address (PDA) accounts
  specified in the `Accounts` struct

### #[derive(Accounts)]

The
[`#[derive(Accounts)]`](https://github.com/coral-xyz/anchor/blob/master/lang/derive/accounts/src/lib.rs#L631)
macro is used to annotate a struct which specifies a set of accounts required
for a particular instruction.

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

Each field in the struct represents an account that must be provided by the
client. The naming of each field is arbitrary, but it is recommended to use a
descriptive name that indicates the purpose of the account.

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

- **Account Constraints**: Constraints define additional conditions that an
  account must satisfy to be considered valid for the instruction. Constraints
  are applied using the `#[account(..)]` attribute, which is placed above an
  account field in the `Accounts` struct.

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

- **Account Types**: Anchor provides various account types to help ensure that
  the account provided by the client matches with what the program expects.

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

When an instruction in an Anchor program is called, the program performs the
following checks:

- **Account Type Verification**: It verifies that the accounts passed into the
  instruction correspond to the account types defined in the Accounts struct in
  the Context.

- **Constraint Checks**: It checks the accounts against any additional
  constraints specified.

This helps ensure that the accounts provided by the client are valid. If any
checks fail, then the instruction fails with an error before reaching the main
logic of the function.

For more detailed examples, refer to the
[constraints](https://www.anchor-lang.com/docs/account-constraints) and
[account types](https://www.anchor-lang.com/docs/account-types) sections in the
Anchor documentation.

### #[account]

The
[`#[account]`](https://github.com/coral-xyz/anchor/blob/master/lang/attribute/account/src/lib.rs#L66)
macro is applied to structs defining the format of a custom data account type
within a program. Each field in the struct represents a field that will be
stored in the account data.

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

The discriminator is used during the following two scenarios:

- Initialization: During the initialization of an account, the discriminator is
  set with the account type's discriminator.
- Deserialization: When account data is deserialized, the discriminator within
  the data is checked against the expected discriminator of the account type.

If there's a mismatch, it indicates that the client has provided an unexpected
account. This mechanism serves as an account validation check in Anchor
programs, ensuring the correct and expected accounts are used.

## Native Rust
