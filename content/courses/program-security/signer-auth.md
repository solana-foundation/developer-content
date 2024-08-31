---
title: Signer Authorization
objectives:
  - Explain the security risks of not performing appropriate signer checks.
  - Implement signer checks using native Rust
  - Implement signer checks using Anchor’s `Signer` type
  - Implement signer checks using Anchor’s `#[account(signer)]` constraint
description:
  "Ensure instructions are only executed by authorized accounts by implementing
  signer checks."
---

## Summary

- **Signer Checks** are essential to verify that specific accounts have signed a
  transaction. Without proper signer checks, unauthorized accounts may execute
  instructions they shouldn't be allowed to perform.
- In Rust, implement a signer check by verifying that an account's `is_signer`
  property is `true`:

  ```rust
  if !ctx.accounts.authority.is_signer {
      return Err(ProgramError::MissingRequiredSignature.into());
  }
  ```

- In Anchor, you can use the `Signer` account type in your account validation
  struct to automatically perform a signer check on a given account.
- Anchor also provides the `#[account(signer)]` constraint, which automatically
  verifies that a specified account has signed the transaction.

## Lesson

**Signer checks** ensure that only authorized accounts can execute specific
instructions. Without these checks, any account might perform operations that
should be restricted, potentially leading to severe security vulnerabilities,
such as unauthorized access and control over program accounts.

### Missing Signer Check

Below is an oversimplified instruction that updates the `authority` field on a
program account. Notice that the `authority` field in the `UpdateAuthority`
account validation struct is of type `AccountInfo`. In Anchor, the `AccountInfo`
type indicates that no checks are performed on the account before executing the
instruction.

Although the `has_one` constraint ensures that the `authority` account passed to
the instruction matches the `authority` field on the `vault` account, there is
no verification that the `authority` account actually authorized the
transaction.

This omission allows an attacker to pass in the `authority` account’s public key
and their own public key as the `new_authority` account, effectively reassigning
themselves as the new authority of the `vault` account. Once they have control,
they can interact with the program as the new authority.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod insecure_update{
    use super::*;
        ...
        pub fn update_authority(ctx: Context<UpdateAuthority>) -> Result<()> {
        ctx.accounts.vault.authority = ctx.accounts.new_authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
   #[account(
        mut,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    pub new_authority: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}

#[account]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

### Adding Signer Authorization Checks

To validate that the `authority` account signed the transaction, add a signer
check within the instruction:

```typescript
if !ctx.accounts.authority.is_signer {
    return Err(ProgramError::MissingRequiredSignature.into());
}
```

By adding this check, the instruction will only proceed if the `authority`
account has signed the transaction. If the account did not sign, the transaction
will fail.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod secure_update{
    use super::*;
        ...
        pub fn update_authority(ctx: Context<UpdateAuthority>) -> Result<()> {
            if !ctx.accounts.authority.is_signer {
            return Err(ProgramError::MissingRequiredSignature.into());
        }

        ctx.accounts.vault.authority = ctx.accounts.new_authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    pub new_authority: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}

#[account]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

### Use Anchor’s Signer Account Type

Incorporating the `signer` check directly within the instruction logic can blur
the separation between account validation and instruction execution. To maintain
this separation, use Anchor's `Signer` account type. By changing the `authority`
account's type to `Signer` in the validation struct, Anchor automatically checks
at runtime that the specified account signed the transaction.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod secure_update{
    use super::*;
        ...
        pub fn update_authority(ctx: Context<UpdateAuthority>) -> Result<()> {
        ctx.accounts.vault.authority = ctx.accounts.new_authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    pub new_authority: AccountInfo<'info>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

Note that when you use the `Signer` type, no other ownership or type checks are
performed.

### Using Anchor’s `#[account(signer)]` Constraint

While the `Signer` account type is useful, it doesn't perform other ownership or
type checks, limiting its use in instruction logic. The `#[account(signer)]`
constraint addresses this by verifying that the account signed the transaction
while allowing access to its underlying data.

For example, if you expect an account to be both a signer and a data source,
using the `Signer` type would require manual deserialization, and you wouldn't
benefit from automatic ownership and type checking. Instead, the
`#[account(signer)]` constraint allows you to access the data and ensure the
account signed the transaction.

In this example, you can safely interact with the data stored in the `authority`
account while ensuring that it signed the transaction.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod secure_update{
    use super::*;
        ...
        pub fn update_authority(ctx: Context<UpdateAuthority>) -> Result<()> {
        ctx.accounts.vault.authority = ctx.accounts.new_authority.key();

        // access the data stored in authority
        msg!("Total number of depositors: {}", ctx.accounts.authority.num_depositors);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateAuthority<'info> {
    #[account(
        mut,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    pub new_authority: AccountInfo<'info>,
    #[account(signer)]
    pub authority: Account<'info, AuthState>
}

#[account]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
#[account]
pub struct AuthState{
    amount: u64,
    num_depositors: u64,
    num_vaults: u64
}
```

## Lab

In this lab, we'll create a simple program to demonstrate how a missing signer
check can allow an attacker to withdraw tokens that don't belong to them. This
program initializes a simplified token `vault` account and shows how the absence
of a signer check could result in the vault being drained.

### 1. Starter

To get started, download the starter code from the
[`starter` branch of this repository](https://github.com/Unboxed-Software/solana-signer-auth/tree/starter).
The starter code includes a program with two instructions and the boilerplate
setup for the test file.

The `initialize_vault` instruction sets up two new accounts: `Vault` and
`TokenAccount`. The `Vault` account is initialized using a Program Derived
Address (PDA) and stores the address of a token account and the vault's
authority. The `vault` PDA will be the authority of the token account, enabling
the program to sign off on token transfers.

The `insecure_withdraw` instruction transfers tokens from the `vault` account’s
token account to a `withdraw_destination` token account. However, the
`authority` account in the `InsecureWithdraw` struct is of type
`UncheckedAccount`, a wrapper around `AccountInfo` that explicitly indicates the
account is unchecked.

Without a signer check, anyone can provide the public key of the `authority`
account that matches the `authority` stored on the `vault` account, and the
`insecure_withdraw` instruction will continue processing.

Although this example is somewhat contrived, as any DeFi program with a vault
would be more sophisticated, it effectively illustrates how the lack of a signer
check can lead to unauthorized token withdrawals.

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod signer_authorization {
    use super::*;

    pub fn initialize_vault(ctx: Context<InitializeVault>) -> Result<()> {
        ctx.accounts.vault.token_account = ctx.accounts.token_account.key();
        ctx.accounts.vault.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn insecure_withdraw(ctx: Context<InsecureWithdraw>) -> Result<()> {
        let amount = ctx.accounts.token_account.amount;

        let seeds = &[b"vault".as_ref(), &[*ctx.bumps.get("vault").unwrap()]];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
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
        space = 8 + 32 + 32,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, Vault>,
    #[account(
        init,
        payer = authority,
        token::mint = mint,
        token::authority = vault,
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
    #[account(
        seeds = [b"vault"],
        bump,
        has_one = token_account,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub withdraw_destination: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    /// CHECK: demo missing signer check
    pub authority: UncheckedAccount<'info>,
}

#[account]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

#### 2. Test `insecure_withdraw` instruction

The test file includes the code to invoke the `initialize_vault` instruction
using `wallet` as the `authority` on the vault. The code then mints 100 tokens
to the `vault` token account. Theoretically, the `wallet` key should be the only
one that can withdraw the 100 tokens from the vault.

Now, let’s add a test to invoke `insecure_withdraw` on the program to show that
the current version of the program allows a third party to in fact withdraw
those 100 tokens.

In the test, we’ll still use the public key of `wallet` as the `authority`
account, but we’ll use a different keypair to sign and send the transaction.

```typescript
describe("signer-authorization", () => {
    ...
    it("Insecure withdraw", async () => {
    const tx = await program.methods
      .insecureWithdraw()
      .accounts({
        vault: vaultPDA,
        tokenAccount: tokenAccount.publicKey,
        withdrawDestination: withdrawDestinationFake,
        authority: wallet.publicKey,
      })
      .transaction()

    await anchor.web3.sendAndConfirmTransaction(connection, tx, [walletFake])

    const balance = await connection.getTokenAccountBalance(
      tokenAccount.publicKey
    )
    expect(balance.value.uiAmount).to.eq(0)
  })
})
```

Run `anchor test` to see that both transactions will complete successfully.

```bash
signer-authorization
  ✔ Initialize Vault (810ms)
  ✔ Insecure withdraw  (405ms)
```

Since there is no signer check for the `authority` account, the
`insecure_withdraw` instruction will transfer tokens from the `vault` token
account to the `withdrawDestinationFake` token account as long as the public key
of the`authority` account matches the public key stored on the authority field
of the `vault` account. Clearly, the `insecure_withdraw` instruction is as
insecure as the name suggests.

#### 3. Add `secure_withdraw` instruction

Let’s fix the problem in a new instruction called `secure_withdraw`. This
instruction will be identical to the `insecure_withdraw` instruction, except
we’ll use the `Signer` type in the Accounts struct to validate the `authority`
account in the `SecureWithdraw` struct. If the `authority` account is not a
signer on the transaction, then we expect the transaction to fail and return an
error.

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod signer_authorization {
    use super::*;
    ...
    pub fn secure_withdraw(ctx: Context<SecureWithdraw>) -> Result<()> {
        let amount = ctx.accounts.token_account.amount;

        let seeds = &[b"vault".as_ref(), &[*ctx.bumps.get("vault").unwrap()]];
        let signer = [&seeds[..]];

        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.vault.to_account_info(),
                to: ctx.accounts.withdraw_destination.to_account_info(),
            },
            &signer,
        );

        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct SecureWithdraw<'info> {
    #[account(
        seeds = [b"vault"],
        bump,
        has_one = token_account,
        has_one = authority
    )]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub withdraw_destination: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    pub authority: Signer<'info>,
}
```

#### 4. Test `secure_withdraw` instruction

With the instruction in place, return to the test file to test the
`secure_withdraw` instruction. Invoke the `secure_withdraw` instruction, again
using the public key of `wallet` as the `authority` account and the
`withdrawDestinationFake` keypair as the signer and withdraw destination. Since
the `authority` account is validated using the `Signer` type, we expect the
transaction to fail the signer check and return an error.

```typescript
describe("signer-authorization", () => {
    ...
	it("Secure withdraw", async () => {
    try {
      const tx = await program.methods
        .secureWithdraw()
        .accounts({
          vault: vaultPDA,
          tokenAccount: tokenAccount.publicKey,
          withdrawDestination: withdrawDestinationFake,
          authority: wallet.publicKey,
        })
        .transaction()

      await anchor.web3.sendAndConfirmTransaction(connection, tx, [walletFake])
    } catch (err) {
      expect(err)
      console.log(err)
    }
  })
})
```

Run `anchor test` to see that the transaction will now return a signature
verification error.

```bash
Error: Signature verification failed
```

That’s it! This is a fairly simple thing to avoid, but incredibly important.
Make sure to always think through who should who should be authorizing
instructions and make sure that each is a signer on the transaction.

If you want to take a look at the final solution code you can find it on the
`solution` branch of
[the repository](https://github.com/Unboxed-Software/solana-signer-auth/tree/solution).

## Challenge

At this point in the course, we hope you've started to work on programs and
projects outside the labs and Challenges provided in these lessons. For this and
the remainder of the lessons on security vulnerabilities, the Challenge for each
lesson will be to audit your own code for the security vulnerability discussed
in the lesson.

Alternatively, you can find open source programs to audit. There are plenty of
programs you can look at. A good start if you don't mind diving into native Rust
would be the
[SPL programs](https://github.com/solana-labs/solana-program-library).

So for this lesson, take a look at a program (whether yours or one you've found
online) and audit it for signer checks. If you find a bug in somebody else's
program, please alert them! If you find a bug in your own program, be sure to
patch it right away.

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=26b3f41e-8241-416b-9cfa-05c5ab519d80)!
</Callout>
