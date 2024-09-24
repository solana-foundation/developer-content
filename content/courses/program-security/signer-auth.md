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
- In Anchor, you can use the `Signer` account type in your account validation
  struct to automatically perform a signer check on a given account.
- Anchor also provides the
  [`#[account(signer)]`](https://www.anchor-lang.com/docs/account-constraints)
  constraint, which automatically verifies that a specified account has signed
  the transaction.
- In native Rust, implement a signer check by verifying that an account's
  `is_signer` property is `true`:

  ```rust
  if !ctx.accounts.authority.is_signer {
      return Err(ProgramError::MissingRequiredSignature.into());
  }
  ```

## Lesson

**Signer checks** ensure that only authorized accounts can execute specific
instructions. Without these checks, any account might perform operations that
should be restricted, potentially leading to severe security vulnerabilities,
such as unauthorized access and control over program accounts.

### Missing Signer Check

Below is an oversimplified instruction handler that updates the `authority`
field on a program account. Notice that the `authority` field in the
`UpdateAuthority` account validation struct is of type `UncheckedAccount`. In
Anchor, the
[`UncheckedAccount`](https://docs.rs/anchor-lang/latest/anchor_lang/accounts/unchecked_account/struct.UncheckedAccount.html)
type indicates that no checks are performed on the account before executing the
instruction handler.

Although the `has_one` constraint ensures that the `authority` account passed to
the instruction handler matches the `authority` field on the `vault` account,
there is no verification that the `authority` account actually authorized the
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
    /// CHECK: This account will not be checked by Anchor
    pub new_authority: UncheckedAccount<'info>,
    /// CHECK: This account will not be checked by Anchor
    pub authority: UncheckedAccount<'info>,
}

#[account]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

### Adding Signer Authorization Checks

To validate that the `authority` account signed the transaction, add a signer
check within the instruction handler:

```rust
if !ctx.accounts.authority.is_signer {
    return Err(ProgramError::MissingRequiredSignature.into());
}
```

By adding this check, the instruction handler will only proceed if the
`authority` account has signed the transaction. If the account is not signed,
the transaction will fail.

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
    /// CHECK: This account will not be checked by Anchor
    pub new_authority: UncheckedAccount<'info>,
    /// CHECK: This account will not be checked by Anchor
    pub authority: UncheckedAccount<'info>,
}

#[account]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

### Use Anchor’s Signer Account Type

Incorporating the
[`signer`](https://docs.rs/anchor-lang/latest/anchor_lang/accounts/signer/struct.Signer.html)
check directly within the instruction handler logic can blur the separation
between account validation and instruction handler execution. To maintain this
separation, use Anchor's `Signer` account type. By changing the `authority`
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
    /// CHECK: This account will not be checked by Anchor
    pub new_authority: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

<Callout>
When you use the `Signer` type, no other ownership or type checks are
performed.
</Callout>

### Using Anchor’s `#[account(signer)]` Constraint

While the `Signer` account type is useful, it doesn't perform other ownership or
type checks, limiting its use in instruction handler logic. The
[anchor's `#[account(signer)]`](https://www.anchor-lang.com/docs/account-constraints)
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
    /// CHECK: This account will not be checked by Anchor
    pub new_authority: UncheckedAccount<'info>,
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
[`starter` branch of this repository](https://github.com/solana-developers/signer-auth/tree/starter).
The starter code includes a program with two instruction handlers and the
boilerplate setup for the test file.

The `initialize_vault` instruction handler sets up two new accounts: `Vault` and
`TokenAccount`. The `Vault` account is initialized using a Program Derived
Address (PDA) and stores the address of a token account and the vault's
authority. The `vault` PDA will be the authority of the token account, enabling
the program to sign off on token transfers.

The `insecure_withdraw` instruction handler transfers tokens from the `vault`
account’s token account to a `withdraw_destination` token account. However, the
`authority` account in the `InsecureWithdraw` struct is of type
`UncheckedAccount`, a wrapper around `AccountInfo` that explicitly indicates the
account is unchecked.

Without a signer check, anyone can provide the public key of the `authority`
account that matches the `authority` stored on the `vault` account, and the
`insecure_withdraw` instruction handler will continue processing.

Although this example is somewhat contrived, as any DeFi program with a vault
would be more sophisticated, it effectively illustrates how the lack of a signer
check can lead to unauthorized token withdrawals.

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};

declare_id!("FeKh59XMh6BcN6UdekHnaFHsNH9NVE121GgDzSyYPKKS");

pub const DISCRIMINATOR_SIZE: usize = 8;

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

        let seeds = &[b"vault".as_ref(), &[ctx.bumps.vault]];
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
        space = DISCRIMINATOR_SIZE + Vault::INIT_SPACE,
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
#[derive(Default, InitSpace)]
pub struct Vault {
    token_account: Pubkey,
    authority: Pubkey,
}
```

### 2. Test insecure_withdraw Instruction Handler

The test file includes code to invoke the `initialize_vault` instruction
handler, using `walletAuthority` as the `authority` on the vault. The code then
mints 100 tokens to the `vaultTokenAccount` token account. Ideally, only the
`walletAuthority` key should be able to withdraw these 100 tokens from the
vault.

Next, we'll add a test to invoke `insecure_withdraw` on the program to
demonstrate that the current version allows a third party to withdraw those 100
tokens.

In the test, we'll use the `walletAuthority` public key as the `authority`
account but sign and send the transaction with a different keypair.

```typescript
describe("Signer Authorization", () => {
    ...
    it("performs insecure withdraw", async () => {
    try {
      const transaction = await program.methods
        .insecureWithdraw()
        .accounts({
          vault: vaultPDA,
          tokenAccount: vaultTokenAccount.publicKey,
          withdrawDestination: unauthorizedWithdrawDestination,
          authority: walletAuthority.publicKey,
        })
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(connection, transaction, [
        unauthorizedWallet,
      ]);

      const tokenAccountInfo = await getAccount(
        connection,
        vaultTokenAccount.publicKey
      );
      expect(Number(tokenAccountInfo.amount)).to.equal(0);
    } catch (error) {
      console.error("Insecure withdraw failed:", error);
      throw error;
    }
  });
})
```

Run `anchor test` to confirm that both transactions will be completed
successfully.

```bash
Signer Authorization
    ✔ initializes vault and mints tokens (882ms)
    ✔ performs insecure withdraw (435ms)
```

The `insecure_withdraw` instruction handler demonstrates a security
vulnerability. Since there is no signer check for the `authority` account, this
handler will transfer tokens from the `vaultTokenAccount` to the
`unauthorizedWithdrawDestination`, as long as the public key of the `authority`
account matches the `walletAuthority.publicKey` stored in the `vault` account's
`authority` field.

In the test, we use the `unauthorizedWallet` to sign the transaction, while
still specifying the `walletAuthority.publicKey` as the authority in the
instruction accounts. This mismatch between the signer and the specified
`authority` would normally cause a transaction to fail. However, due to the lack
of a proper signer check in the `insecure_withdraw` handler, the transaction
succeeds.

### 3. Add secure_withdraw Instruction Handler

To fix this issue, we'll create a new instruction handler called
`secure_withdraw`. This instruction handler will be identical to
`insecure_withdraw`, but we'll use the `Signer` type in the Accounts struct to
validate the authority account in the `SecureWithdraw` struct. If the
`authority` account isn't a signer on the transaction, the transaction should
fail with an error.

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

        let seeds = &[b"vault".as_ref(), &[ctx.bumps.vault]];
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

### 4. Test secure_withdraw Instruction Handler

With the new instruction handler in place, return to the test file to test the
`secureWithdraw` instruction handler. Invoke the `secureWithdraw` instruction
handler, using the `walletAuthority.publicKey` as the `authority` account, and
use the `unauthorizedWallet` keypair as the signer. Set the
`unauthorizedWithdrawDestination` as the withdraw destination.

Since the `authority` account is validated using the `Signer` type, the
transaction should fail with a signature verification error. This is because the
`unauthorizedWallet` is attempting to sign the transaction, but it doesn't match
the `authority` specified in the instruction (which is
`walletAuthority.publicKey`).

The test expects this transaction to fail, demonstrating that the secure
withdraw function properly validates the signer. If the transaction unexpectedly
succeeds, the test will throw an error indicating that the expected security
check did not occur.

```typescript
describe("Signer Authorization", () => {
    ...
    it("fails to perform secure withdraw with incorrect signer", async () => {
    try {
      const transaction = await program.methods
        .secureWithdraw()
        .accounts({
          vault: vaultPDA,
          tokenAccount: vaultTokenAccount.publicKey,
          withdrawDestination: unauthorizedWithdrawDestination,
          authority: walletAuthority.publicKey,
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
})
```

Run `anchor test` to see that the transaction now returns a signature
verification error.

```bash
signer-authorization
Error message: Signature verification failed.
Missing signature for public key [`GprrWv9r8BMxQiWea9MrbCyK7ig7Mj8CcseEbJhDDZXM`].
    ✔ fails to perform secure withdraw with incorrect signer
```

This example shows how important it is to think through who should authorize
instructions and ensure that each is a signer on the transaction.

To review the final solution code, you can find it on the
[`solution` branch of the repository](https://github.com/solana-developers/signer-auth/tree/solution).

## Challenge

Now that you've worked through the labs and challenges in this course, it's time
to apply your knowledge in a practical setting. For this challenge and those
that follow on security vulnerabilities, audit your own programs for the
specific vulnerability discussed in each lesson.

### Steps

1. **Audit Your Program or Find an Open Source Project**:

   - Begin by auditing your own code for missing signer checks, or find an open
     source Solana program to audit. A great place to start is with the
     [program examples](https://github.com/solana-developers/program-examples)
     repository.

2. **Look for Signer Check Issues**:

   - Focus on instruction handlers where signer authorization is crucial,
     especially those that transfer tokens or modify sensitive account data.
   - Review the program for any `UncheckedAccount` types where signer validation
     should be enforced.
   - Ensure that any accounts that should require user authorization are defined
     as `Signer` in the instruction handler.

3. **Patch or Report**:
   - If you find a bug in your own code, fix it by using the `Signer` type for
     accounts that require signer validation.
   - If the issue exists in an open source project, notify the project
     maintainers or submit a pull request.

<Callout type="success" title="Completed the lab?">

After completing the challenge, push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=26b3f41e-8241-416b-9cfa-05c5ab519d80)!
</Callout>
