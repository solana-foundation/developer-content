---
title: Type Cosplay
objectives:
  - Explain the security risks associated with not checking account types
  - Implement an account type discriminator using native Rust
  - Use Anchor's `init` constraint to initialize accounts
  - Use Anchor's `Account` type for account validation
description:
  "Understand the risks of using incorrect account types in instructions and how
  to mitigate them with account type checks."
---

## Summary

- **Discriminators** are 8-byte identifiers written to accounts that distinguish
  between different account types, ensuring programs interact with the correct
  data.
- **Implement a discriminator** in Rust by including a field in the account
  struct to represent the account type.

  ```rust
  #[derive(BorshSerialize, BorshDeserialize)]
  pub struct User {
      discriminant: AccountDiscriminant,
      user: Pubkey,
  }

  #[derive(BorshSerialize, BorshDeserialize, PartialEq)]
  pub enum AccountDiscriminant {
      User,
      Admin,
  }
  ```

- **Check the discriminator** in Rust to verify that the deserialized account
  data matches the expected value.

  ```rust
  if user.discriminant != AccountDiscriminant::User {
    return Err(ProgramError::InvalidAccountData.into());
  }
  ```

- **In Anchor**, program account types automatically implement the
  `Discriminator` trait, which creates an 8-byte unique identifier for a type.
- Use Anchor's `Account<'info, T>` type to automatically check the discriminator
  when deserializing the account data.

## Lesson

"Type cosplay" refers to using an unexpected account type in place of an
expected one. Under the hood, account data is stored as an array of bytes that a
program deserializes into a custom account type. Without a method to distinguish
between account types explicitly, data from an unexpected account could result
in instructions being used in unintended ways.

### Unchecked Account

In the example below, both the `AdminConfig` and `UserConfig` account types
store a single public key. The `admin_instruction` deserializes the
`admin_config` account as an `AdminConfig` type and then performs an owner check
and data validation check.

However, since the `AdminConfig` and `UserConfig` account types have the same
data structure, a `UserConfig` account type could be passed as the
`admin_config` account. As long as the public key stored on the account matches
the `admin` signing the transaction, the `admin_instruction` would process, even
if the signer isn't actually an admin.

Note that the names of the fields stored on the account types (`admin` and
`user`) make no difference when deserializing account data. The data is
serialized and deserialized based on the order of fields rather than their
names.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod type_cosplay_insecure {
    use super::*;

    pub fn admin_instruction(ctx: Context<AdminInstruction>) -> Result<()> {
        let account_data =
            AdminConfig::try_from_slice(&ctx.accounts.admin_config.data.borrow()).unwrap();
        if ctx.accounts.admin_config.owner != ctx.program_id {
            return Err(ProgramError::IllegalOwner.into());
        }
        if account_data.admin != ctx.accounts.admin.key() {
            return Err(ProgramError::InvalidAccountData.into());
        }
        msg!("Admin {}", account_data.admin);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AdminInstruction<'info> {
    /// CHECK: This account is not being validated by Anchor
    admin_config: UncheckedAccount<'info>,
    admin: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace)]
pub struct AdminConfig {
    admin: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace)]
pub struct UserConfig {
    user: Pubkey,
}
```

#### Add Account Discriminator

To resolve this, add a discriminant field for each account type and set the
discriminant when initializing an account.

<Callout>

While they sound similar, a
[Rust **discriminant**](https://doc.rust-lang.org/std/mem/fn.discriminant.html)
isn't the same thing as an
[Anchor **discriminator**](https://book.anchor-lang.com/anchor_bts/discriminator.html)!

- **Rust discriminant**: This is an internal value that Rust uses to keep track
  of which variant an enum currently represents. It's like a behind-the-scenes
  label for enum variants.

- **Anchor discriminator**: This is a unique 8-byte identifier that Anchor adds
  to the beginning of each account's data. It helps Solana programs quickly
  recognize what type of account they're dealing with.

In simple terms:

- Discriminants are Rust's way of organizing enum variants.
- Discriminators are Anchor's way of labeling different account types in Solana.
  </Callout>

The example below updates the `AdminConfig` and `UserConfig` account types with
a `discriminant` field. The `admin_instruction` now includes an additional data
validation check for the `discriminant` field.

```rust
if account_data.discriminant != AccountDiscriminant::Admin {
    return Err(ProgramError::InvalidAccountData.into());
}
```

If the `discriminant` field of the account passed into the instruction as the
`admin_config` account does not match the expected `AccountDiscriminant`, the
transaction will fail. Ensure that the appropriate value for `discriminant` is
set when initializing each account, and then include these checks in every
subsequent instruction.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod type_cosplay_secure {
    use super::*;

    pub fn admin_instruction(ctx: Context<AdminInstruction>) -> Result<()> {
        let account_data =
            AdminConfig::try_from_slice(&ctx.accounts.admin_config.data.borrow()).unwrap();
        if ctx.accounts.admin_config.owner != ctx.program_id {
            return Err(ProgramError::IllegalOwner.into());
        }
        if account_data.admin != ctx.accounts.admin.key() {
            return Err(ProgramError::InvalidAccountData.into());
        }
        if account_data.discriminant != AccountDiscriminant::Admin {
            return Err(ProgramError::InvalidAccountData.into());
        }
        msg!("Admin {}", account_data.admin);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AdminInstruction<'info> {
    /// CHECK: This account is not being validated by Anchor
    admin_config: UncheckedAccount<'info>,
    admin: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace)]
pub struct AdminConfig {
    discriminant: AccountDiscriminant,
    admin: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, InitSpace)]
pub struct UserConfig {
    discriminant: AccountDiscriminant,
    user: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, InitSpace)]
pub enum AccountDiscriminant {
    Admin,
    User,
}
```

### Use Anchor's Account Wrapper

Implementing these checks for every account in every instruction can be tedious.
Fortunately, Anchor provides a `#[account]` attribute macro for automatically
implementing traits that every account should have.

Structs marked with `#[account]` can then be used with `Account` to validate
that the passed-in account is indeed the type you expect. When initializing an
account whose struct representation has the `#[account]` attribute, the first 8
bytes are automatically reserved for a discriminator unique to the account type.
When deserializing the account data, Anchor will automatically check if the
discriminator matches the expected account type and throw an error if it does
not.

In the example below, `Account<'info, AdminConfig>` specifies that the
`admin_config` account should be of type `AdminConfig`. Anchor then
automatically checks that the first 8 bytes of account data match the
discriminator of the `AdminConfig` type.

The data validation check for the `admin` field is also moved from the
instruction logic to the account validation struct using the `has_one`
constraint. `#[account(has_one = admin)]` specifies that the `admin_config`
account's `admin` field must match the `admin` account passed into the
instruction. Note that for the `has_one` constraint to work, the naming of the
account in the struct must match the naming of the field on the account you are
validating.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod type_cosplay_recommended {
    use super::*;

    pub fn admin_instruction(ctx: Context<AdminInstruction>) -> Result<()> {
        msg!("Admin {}", ctx.accounts.admin_config.admin);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AdminInstruction<'info> {
    #[account(has_one = admin)]
    admin_config: Account<'info, AdminConfig>,
    admin: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct AdminConfig {
    admin: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct UserConfig {
    user: Pubkey,
}
```

This vulnerability is something you generally don't have to worry about when
using Anchor—that's the whole point! However, after exploring how this issue can
arise in native Rust programs, you should now have a better understanding of the
importance of the account discriminator in an Anchor account. Anchor's automatic
discriminator checks mean that developers can focus more on their product, but
it's still crucial to understand what Anchor is doing behind the scenes to build
robust Solana programs.

## Lab

In this lab, you'll create two programs to demonstrate a type cosplay
vulnerability:

- The first program initializes accounts without a discriminator.
- The second program initializes accounts using Anchor's `init` constraint,
  which automatically sets an account discriminator.

### 1. Starter

To get started, download the starter code from the starter branch of
[this repository](https://github.com/solana-developers/type-cosplay/tree/starter).
The starter code includes a program with three instructions and some tests.

The three instructions are:

1. `initialize_admin`- Initializes an admin account and sets the admin authority
   of the program.
2. `initialize_user` - Initializes a standard user account.
3. `update_admin` - Allows the existing admin to update the admin authority of
   the program.

Review the instructions in the `lib.rs` file. The last instruction should only
be callable by the account matching the `admin` field on the admin account
initialized using the `initialize_admin` instruction.

### 2. Test Insecure update_admin Instruction

Both the `AdminConfig` and `User` account types have the same fields and field
types:

```rust
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AdminConfig {
    admin: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct User {
    user: Pubkey,
}
```

Because of this, it's possible to pass a `User` account in place of the `admin`
account in the `update_admin` instruction, bypassing the requirement that only
an admin can call this instruction.

Take a look at the `solana-type-cosplay.ts` file in the `tests` directory. It
contains a basic setup and two tests: one initializes a user account, and the
other invokes `update_admin` with the user account instead of an admin account.

Run `anchor test` to see that invoking `update_admin` completes successfully:

```bash
  type-cosplay
    ✔ Initialize User Account (223ms)
    ✔ Invoke update admin instruction with user account (442ms)
```

### 3. Create type-checked Program

Next, create a new program called `type-checked` by running
`anchor new type-checked` from the root of the existing anchor program.

Now, in your `programs` folder, you will have two programs. Run
`anchor keys list` to see the program ID for the new program. Add it to the
`lib.rs` file of the `type-checked` program and to the `Anchor.toml` file.

Update the test file's setup to include the new program and two new keypairs for
the accounts to be initialized:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TypeCosplay } from "../target/types/type_cosplay";
import { TypeChecked } from "../target/types/type_checked";
import { expect } from "chai";

describe("type-cosplay", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TypeCosplay as Program<TypeCosplay>;
  const programChecked = anchor.workspace.TypeChecked as Program<TypeChecked>;

  const userAccount = anchor.web3.Keypair.generate();
  const newAdmin = anchor.web3.Keypair.generate();

  const userAccountChecked = anchor.web3.Keypair.generate();
  const adminAccountChecked = anchor.web3.Keypair.generate();
});
```

### 4. Implement the type-checked Program

In the `type_checked` program, add two instructions using the `init` constraint
to initialize an `AdminConfig` account and a `User` account. Anchor will
automatically set the first 8 bytes of account data as a unique discriminator
for the account type.

Add an `update_admin` instruction that validates the `admin_config` account as
an `AdminConfig` account type using Anchor's `Account` wrapper. Anchor will
automatically check that the account discriminator matches the expected account
type:

```rust
use anchor_lang::prelude::*;

declare_id!("G36iNpB591wxFeaeq55qgTwHKJspBrETmgok94oyqgcc");

const DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod type_checked {
    use super::*;

    pub fn initialize_admin(ctx: Context<InitializeAdmin>) -> Result<()> {
        ctx.accounts.admin_config.admin = ctx.accounts.admin.key();
        Ok(())
    }

    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        ctx.accounts.user_account.user = ctx.accounts.user.key();
        Ok(())
    }

    pub fn update_admin(ctx: Context<UpdateAdmin>) -> Result<()> {
        ctx.accounts.admin_config.admin = ctx.accounts.admin.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAdmin<'info> {
    #[account(
        init,
        payer = admin,
        space = DISCRIMINATOR_SIZE + AdminConfig::INIT_SPACE
    )]
    pub admin_config: Account<'info, AdminConfig>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = user,
        space = DISCRIMINATOR_SIZE + User::INIT_SPACE
    )]
    pub user_account: Account<'info, User>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    #[account(
        mut,
        has_one = admin
    )]
    pub admin_config: Account<'info, AdminConfig>,
    pub new_admin: SystemAccount<'info>,
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct AdminConfig {
    admin: Pubkey,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    user: Pubkey,
}
```

### 5. Test Secure update_admin Instruction

In the test file, initialize an `AdminConfig` account and a `User` account from
the `type_checked` program. Then, invoke the `updateAdmin` instruction twice,
passing in the newly created accounts:

```typescript
describe("type-cosplay", () => {
    ...

  it("Initialize type checked AdminConfig Account", async () => {
    try {
      await programChecked.methods
        .initializeAdmin()
        .accounts({
          adminConfig: adminAccountChecked.publicKey,
        })
        .signers([adminAccountChecked])
        .rpc();
    } catch (error) {
      throw new Error(
        `Initializing type checked AdminConfig Account failed: ${error.message}`
      );
    }
  });

  it("Initialize type checked User Account", async () => {
    try {
      await programChecked.methods
        .initializeUser()
        .accounts({
          userAccount: userAccountChecked.publicKey,
          user: provider.wallet.publicKey,
        })
        .signers([userAccountChecked])
        .rpc();
    } catch (error) {
      throw new Error(
        `Initializing type checked User Account failed: ${error.message}`
      );
    }
  });

  it("Invoke update instruction using User Account", async () => {
    try {
      await programChecked.methods
        .updateAdmin()
        .accounts({
          adminConfig: userAccountChecked.publicKey,
          newAdmin: newAdmin.publicKey,
          admin: provider.wallet.publicKey,
        })
        .rpc();
    } catch (error) {
      expect(error);
      console.log(error);
    }
  });

  it("Invoke update instruction using AdminConfig Account", async () => {
    try {
      await programChecked.methods
        .updateAdmin()
        .accounts({
          adminConfig: adminAccountChecked.publicKey,
          newAdmin: newAdmin.publicKey,
          admin: provider.wallet.publicKey,
        })
        .rpc();
    } catch (error) {
      throw new Error(
        `Invoking update instruction using AdminConfig Account failed: ${error.message}`
      );
    }
  });
})
```

Run `anchor test`. For the transaction where we pass in the User account type,
we expect the instruction to return an Anchor Error due to the account not being
of type AdminConfig:

```bash
'Program G36iNpB591wxFeaeq55qgTwHKJspBrETmgok94oyqgcc invoke [1]',
'Program log: Instruction: UpdateAdmin',
'Program log: AnchorError caused by account: admin_config. Error Code: AccountDiscriminatorMismatch. Error Number: 3002. Error Message: 8 byte discriminator did not match what was expected.',
'Program G36iNpB591wxFeaeq55qgTwHKJspBrETmgok94oyqgcc consumed 3506 of 200000 compute units',
'Program G36iNpB591wxFeaeq55qgTwHKJspBrETmgok94oyqgcc failed: custom program error: 0xbba'
```

Following Anchor's best practices ensures that your programs avoid this
vulnerability. Always use the `#[account]` attribute when creating account
structs, use the `init` constraint when initializing accounts, and use the
`Account` type in your account validation structs.

For the final solution code, you can find it on the `solution` branch of
[the repository](https://github.com/solana-developers/type-cosplay/tree/solution).

## Challenge

As with other lessons in this unit, practice avoiding this security exploit by
auditing your own or other programs.

Review at least one program and ensure that account types have a discriminator
and that these are checked for each account and instruction. Since standard
Anchor types handle this check automatically, you're more likely to find a
vulnerability in a native program.

Remember, if you find a bug or exploit in somebody else's program, please alert
them. If you find one in your own program, patch it immediately.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=37ebccab-b19a-43c6-a96a-29fa7e80fdec)!
</Callout>
