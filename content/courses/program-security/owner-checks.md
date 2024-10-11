---
title: Owner Checks
objectives:
  - Explain the security risks associated with not performing appropriate owner
    checks
  - Use Anchor's `Account<'info, T>` wrapper and an account type to automate
    owner checks
  - Use Anchor's `#[account(owner = <expr>)]` constraint to explicitly define an
    external program that should own an account
  - Implement owner checks using native Rust
description:
  "Understand the use of account owner checks when processing incoming
  instructions."
---

## Summary

- **Owner checks** ensure that accounts are owned by the expected program.
  Without owner checks, accounts owned by other programs can be used in an
  instruction handler.
- Anchor program account types implement the `Owner` trait, allowing
  `Account<'info, T>` to automatically verify program ownership.
- You can also use Anchor's
  [`#[account(owner = <expr>)]`](https://www.anchor-lang.com/docs/account-constraints)
  constraint to define an account's owner when it's external to the current
  program.
- To implement an owner check in native Rust, verify that the account's owner
  matches the expected program ID.

```rust
if ctx.accounts.account.owner != ctx.program_id {
    return Err(ProgramError::IncorrectProgramId.into());
}
```

## Lesson

Owner checks are used to verify that an account passed into an instruction
handler is owned by the expected program, preventing exploitation by accounts
from different programs.

The `AccountInfo` struct contains several fields, including the `owner`, which
represents the **program** that owns the account. Owner checks ensure that this
`owner` field in the `AccountInfo` matches the expected program ID.

```rust
/// Account information
#[derive(Clone)]
pub struct AccountInfo<'a> {
    /// Public key of the account
    pub key: &'a Pubkey,
    /// Was the transaction signed by this account's public key?
    pub is_signer: bool,
    /// Is the account writable?
    pub is_writable: bool,
    /// The lamports in the account.  Modifiable by programs.
    pub lamports: Rc<RefCell<&'a mut u64>>,
    /// The data held in this account.  Modifiable by programs.
    pub data: Rc<RefCell<&'a mut [u8]>>,
    /// Program that owns this account
    pub owner: &'a Pubkey,
    /// This account's data contains a loaded program (and is now read-only)
    pub executable: bool,
    /// The epoch at which this account will next owe rent
    pub rent_epoch: Epoch,
}
```

### Missing owner check

In the following example, an `admin_instruction` is intended to be restricted to
an `admin` account stored in the `admin_config` account. However, it fails to
check whether the program owns the `admin_config` account. Without this check,
an attacker can spoof the account.

```rust
use anchor_lang::prelude::*;

declare_id!("Cft4eTTrt4sJU4Ar35rUQHx6PSXfJju3dixmvApzhWws");

#[program]
pub mod owner_check {
    use super::*;
    ...

    pub fn admin_instruction(ctx: Context<Unchecked>) -> Result<()> {
        let account_data = ctx.accounts.admin_config.try_borrow_data()?;
        let mut account_data_slice: &[u8] = &account_data;
        let account_state = AdminConfig::try_deserialize(&mut account_data_slice)?;

        if account_state.admin != ctx.accounts.admin.key() {
            return Err(ProgramError::InvalidArgument.into());
        }
        msg!("Admin: {}", account_state.admin.to_string());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Unchecked<'info> {
    /// CHECK: This account will not be checked by Anchor
    admin_config: UncheckedAccount<'info>,
    admin: Signer<'info>,
}

#[account]
pub struct AdminConfig {
    admin: Pubkey,
}
```

### Add owner check

To resolve this issue in native Rust, compare the `owner` field with the program
ID:

```rust
if ctx.accounts.admin_config.owner != ctx.program_id {
    return Err(ProgramError::IncorrectProgramId.into());
}
```

Adding an `owner` check ensures that accounts from other programs cannot be
passed into the instruction handler.

```rust
use anchor_lang::prelude::*;

declare_id!("Cft4eTTrt4sJU4Ar35rUQHx6PSXfJju3dixmvApzhWws");

#[program]
pub mod owner_check {
    use super::*;
    ...
    pub fn admin_instruction(ctx: Context<Unchecked>) -> Result<()> {
        if ctx.accounts.admin_config.owner != ctx.program_id {
            return Err(ProgramError::IncorrectProgramId.into());
        }

        let account_data = ctx.accounts.admin_config.try_borrow_data()?;
        let mut account_data_slice: &[u8] = &account_data;
        let account_state = AdminConfig::try_deserialize(&mut account_data_slice)?;

        if account_state.admin != ctx.accounts.admin.key() {
            return Err(ProgramError::InvalidArgument.into());
        }
        msg!("Admin: {}", account_state.admin.to_string());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Unchecked<'info> {
    /// CHECK: This account will not be checked by Anchor
    admin_config: UncheckedAccount<'info>,
    admin: Signer<'info>,
}

#[account]
pub struct AdminConfig {
    admin: Pubkey,
}
```

### Use Anchor's `Account<'info, T>`

Anchor simplifies owner checks with the `Account` type, which wraps
`AccountInfo` and automatically verifies ownership.

In the following example, `Account<'info, AdminConfig>` validates the
`admin_config` account, and the `has_one` constraint checks that the admin
account matches the `admin` field in `admin_config`.

```rust
use anchor_lang::prelude::*;

declare_id!("Cft4eTTrt4sJU4Ar35rUQHx6PSXfJju3dixmvApzhWws");

#[program]
pub mod owner_check {
    use super::*;
    ...
    pub fn admin_instruction(ctx: Context<Checked>) -> Result<()> {
        msg!("Admin: {}", ctx.accounts.admin_config.admin.to_string());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Checked<'info> {
    #[account(
        has_one = admin,
    )]
    admin_config: Account<'info, AdminConfig>,
    admin: Signer<'info>,
}

#[account]
pub struct AdminConfig {
    admin: Pubkey,
}
```

### Use Anchor's `#[account(owner = <expr>)]` constraint

In addition to the `Account` type, you can use the Anchor's
[`owner` constraint](https://www.anchor-lang.com/docs/account-constraints) to
specify the program that should own an account when it differs from the
executing program. This is particularly useful when an instruction handler
expects an account to be a PDA created by another program. By using the `seeds`
and `bump` constraints along with the `owner`, you can properly derive and
verify the account's address.

To apply the `owner` constraint, you need access to the public key of the
program expected to own the account. This can be provided either as an
additional account or by hard-coding the public key within your program.

```rust
use anchor_lang::prelude::*;

declare_id!("Cft4eTTrt4sJU4Ar35rUQHx6PSXfJju3dixmvApzhWws");

#[program]
pub mod owner_check {
    use super::*;
    ...
    pub fn admin_instruction(ctx: Context<Checked>) -> Result<()> {
        msg!("Admin: {}", ctx.accounts.admin_config.admin.to_string());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Checked<'info> {
    #[account(
        has_one = admin,
    )]
    admin_config: Account<'info, AdminConfig>,
    admin: Signer<'info>,
    #[account(
            seeds = b"test-seed",
            bump,
            owner = token_program.key()
    )]
    pda_derived_from_another_program: AccountInfo<'info>,
    token_program: Program<'info, Token>
}

#[account]
pub struct AdminConfig {
    admin: Pubkey,
}
```

## Lab

In this lab, we'll demonstrate how the absence of an owner check can allow a
malicious actor to drain tokens from a simplified token vault. This is similar
to the lab from the
[Signer Authorization lesson](/content/courses/program-security/signer-auth.md).

We'll use two programs to illustrate this:

1. One program lacks an owner check on the vault account it withdraws tokens
   from.
2. The second program is a clone created by a malicious user to mimic the first
   program's vault account.

Without the owner check, the malicious user can pass in their vault account
owned by a fake program, and the original program will still execute the
withdrawal.

### 1. Starter

Begin by downloading the starter code from the
[`starter` branch of this repository](https://github.com/solana-developers/owner-checks/tree/starter).
The starter code includes two programs: `clone` and `owner_check`, and the setup
for the test file.

The `owner_check` program includes two instruction handlers:

- `initialize_vault`: Initializes a simplified vault account storing the
  addresses of a token account and an authority account.
- `insecure_withdraw`: Withdraws tokens from the token account but lacks an
  owner check for the vault account.

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("3uF3yaymq1YBmDDHpRPwifiaBf4eK8M2jLgaMcCTg9n9");

pub const DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod owner_check {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        ctx.accounts.vault.token_account = ctx.accounts.token_account.key();
        ctx.accounts.vault.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn insecure_withdraw(ctx: Context<InsecureWithdraw>) -> Result<()> {
        let account_data = ctx.accounts.vault.try_borrow_data()?;
        let mut account_data_slice: &[u8] = &account_data;
        let account_state = Vault::try_deserialize(&mut account_data_slice)?;

        if account_state.authority != ctx.accounts.authority.key() {
            return Err(ProgramError::InvalidArgument.into());
        }

        let amount = ctx.accounts.token_account.amount;

        let seeds = &[
            b"token".as_ref(),
            &[ctx.bumps.token_account],
        ];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.withdraw_destination.to_account_info(),
            },
            &signer,
        );

        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = DISCRIMINATOR_SIZE + Vault::INIT_SPACE,
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = token_account,
        seeds = [b"token"],
        bump,
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct InsecureWithdraw<'info> {
    /// CHECK: This account will not be checked by anchor
    pub vault: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [b"token"],
        bump,
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub withdraw_destination: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(Default, InitSpace)]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

The `clone` program includes a single instruction handler:

- `initialize_vault`: Initializes a fake vault account that mimics the vault
  account of the `owner_check` program, allowing the malicious user to set their
  own authority.

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;

declare_id!("2Gn5MFGMvRjd548z6vhreh84UiL7L5TFzV5kKGmk4Fga");

pub const DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod clone {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        ctx.accounts.vault.token_account = ctx.accounts.token_account.key();
        ctx.accounts.vault.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeVault<'info> {
    #[account(
        init,
        payer = authority,
        space = DISCRIMINATOR_SIZE + Vault::INIT_SPACE,
    )]
    pub vault: Account<'info, Vault>,
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default, InitSpace)]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

### 2. Test insecure_withdraw Instruction Handler

The test file contains tests that initialize a vault in both programs. We'll add
a test to invoke the `insecure_withdraw` instruction handler, showing how the
lack of an owner check allows token withdrawal from the original program's
vault.

```typescript
describe("Owner Check", () => {
    ...
    it("performs insecure withdraw", async () => {
    try {
      const transaction = await program.methods
        .insecureWithdraw()
        .accounts({
          vault: vaultCloneAccount.publicKey,
          tokenAccount: tokenPDA,
          withdrawDestination: unauthorizedWithdrawDestination,
          authority: unauthorizedWallet.publicKey,
        })
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(connection, transaction, [
        unauthorizedWallet,
      ]);

      const tokenAccountInfo = await getAccount(connection, tokenPDA);
      expect(Number(tokenAccountInfo.amount)).to.equal(0);
    } catch (error) {
      console.error("Insecure withdraw failed:", error);
      throw error;
    }
  });
})
```

Run an `anchor test` to verify that the `insecure_withdraw` is complete
successfully.

```bash
owner-check
  ✔ initializes vault (866ms)
  ✔ initializes fake vault (443ms)
  ✔ performs insecure withdraw (444ms)
```

<Callout>

The `vaultCloneAccount` deserializes successfully due to both programs using the
same discriminator, derived from the identical `Vault` struct name. </Callout>

```rust
#[account]
#[derive(Default, InitSpace)]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

### 3. Add secure_withdraw Instruction Handler

We'll now close the security loophole by adding a `secure_withdraw` instruction
handler with an `Account<'info, Vault>` type to ensure an owner check is
performed.

In the `lib.rs` file of the `owner_check` program, add a `secure_withdraw`
instruction handler and a `SecureWithdraw` accounts struct. The `has_one`
constraint will be used to ensure that the `token_account` and `authority`
passed into the instruction handler match the values stored in the `vault`
account.

```rust
#[program]
pub mod owner_check {
    use super::*;
    ...

    pub fn secure_withdraw(ctx: Context<SecureWithdraw>) -> Result<()> {
        let amount = ctx.accounts.token_account.amount;

        let seeds = &[
            b"token".as_ref(),
            &[*ctx.bumps.get("token_account").unwrap()],
        ];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.token_account.to_account_info(),
                to: ctx.accounts.withdraw_destination.to_account_info(),
            },
            &signer,
        );

        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}
...

#[derive(Accounts)]
pub struct SecureWithdraw<'info> {
    #[account(
       has_one = token_account,
       has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        mut,
        seeds = [b"token"],
        bump,
    )]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub withdraw_destination: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub authority: Signer<'info>,
}
```

### 4. Test secure_withdraw Instruction Handler

To test the `secure_withdraw` instruction handler, we'll invoke it twice. First,
we'll use the `vaultCloneAccount` account, expecting it to fail. Then, we'll
invoke the instruction handler with the correct `vaultAccount` account to verify
the instruction handler works as intended.

```typescript
describe("Owner Check", () => {
    ...
    it("fails secure withdraw with incorrect authority", async () => {
    try {
      const transaction = await program.methods
        .secureWithdraw()
        .accounts({
          vault: vaultCloneAccount.publicKey,
          tokenAccount: tokenPDA,
          withdrawDestination: unauthorizedWithdrawDestination,
          authority: unauthorizedWallet.publicKey,
        })
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(connection, transaction, [
        unauthorizedWallet,
      ]);
      throw new Error("Expected transaction to fail, but it succeeded");
    } catch (error) {
      expect(error).to.be.an("error");
      console.log("Error message:", error.message);
    }
  });

  it("performs secure withdraw successfully", async () => {
    try {
      await mintTo(
        connection,
        walletAuthority.payer,
        tokenMint,
        tokenPDA,
        walletAuthority.payer,
        INITIAL_TOKEN_AMOUNT
      );

      await program.methods
        .secureWithdraw()
        .accounts({
          vault: vaultAccount.publicKey,
          tokenAccount: tokenPDA,
          withdrawDestination: authorizedWithdrawDestination,
          authority: walletAuthority.publicKey,
        })
        .rpc();

      const tokenAccountInfo = await getAccount(connection, tokenPDA);
      expect(Number(tokenAccountInfo.amount)).to.equal(0);
    } catch (error) {
      console.error("Secure withdraw failed:", error);
      throw error;
    }
  });
})
```

Running `anchor test` will show that the transaction using the
`vaultCloneAccount` account fails, while the transaction using the
`vaultAccount` account withdraws successfully.

```bash
"Program 3uF3yaymq1YBmDDHpRPwifiaBf4eK8M2jLgaMcCTg9n9 invoke [1]",
"Program log: Instruction: SecureWithdraw",
"Program log: AnchorError caused by account: vault. Error Code: AccountOwnedByWrongProgram. Error Number: 3007. Error Message: The given account is owned by a different program than expected.",
"Program log: Left:",
"Program log: 2Gn5MFGMvRjd548z6vhreh84UiL7L5TFzV5kKGmk4Fga",
"Program log: Right:",
"Program log: 3uF3yaymq1YBmDDHpRPwifiaBf4eK8M2jLgaMcCTg9n9",
"Program 3uF3yaymq1YBmDDHpRPwifiaBf4eK8M2jLgaMcCTg9n9 consumed 4449 of 200000 compute units",
"Program 3uF3yaymq1YBmDDHpRPwifiaBf4eK8M2jLgaMcCTg9n9 failed: custom program error: 0xbbf"
```

Here we see how using Anchor's `Account<'info, T>` type simplifies the account
validation process by automating ownership checks. Additionally, Anchor errors
provide specific details, such as which account caused the error. For example,
the log indicates `AnchorError caused by account: vault`, which aids in
debugging.

```bash
✔ fails secure withdraw with incorrect authority
✔ performs secure withdraw successfully (847ms)
```

Ensuring account ownership checks is critical to avoid security vulnerabilities.
This example demonstrates how simple it is to implement proper validation, but
it's vital to always verify which accounts are owned by specific programs.

If you'd like to review the final solution code, it's available on the
[`solution` branch of the repository](https://github.com/solana-developers/owner-checks/tree/solution).

## Challenge

As with other lessons in this unit, practice preventing security exploits by
auditing your own or other programs.

Take time to review at least one program to confirm that ownership checks are
properly enforced on all accounts passed into each instruction handler.

If you find a bug or exploit in another program, notify the developer. If you
find one in your own program, patch it immediately.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=e3069010-3038-4984-b9d3-2dc6585147b1)!
</Callout>
