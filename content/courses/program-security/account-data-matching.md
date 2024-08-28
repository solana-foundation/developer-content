---
title: Account Data Matching
objectives:
  - Explain the security risks associated with missing data validation checks
  - Implement data validation checks using native Rust
  - Implement data validation checks using Anchor constraints
description:
  Learn how to properly validate account data in Solana programs to prevent
  security vulnerabilities.
---

# Account Data Matching

## Summary

- **Data validation checks** are crucial for verifying that account data matches
  expected values. Without proper checks, malicious users could exploit your
  program using unexpected accounts.
- Implement data validation in native Rust by comparing account data to expected
  values:
  ```rust
  if ctx.accounts.user.key() != ctx.accounts.user_data.user {
      return Err(ProgramError::InvalidAccountData.into());
  }
  ```
- Use [Anchor constraints](https://www.anchor-lang.com/docs/account-constraints) to simplify the process:
  - Use `constraint` to evaluate custom expressions
  - Use `has_one` to check that a field on one account matches the key of
    another account

## Lesson

Account data matching involves implementing data validation checks to ensure
that the  
data stored on an account matches expected values. This is essential for
preventing unauthorized access and maintaining the integrity of your program's
state.

### Why Account Data Matching Matters

Without proper data validation, your program becomes vulnerable to various
attacks:

1. Unauthorized access: malicious users could pass in unexpected accounts,  
   gaining access to functionality they shouldn't have
2. State manipulation: attackers might alter the program's state in unintended  
   ways, compromising its integrity
3. Fund theft: in programs dealing with tokens or SOL, inadequate checks could  
   lead to unauthorized withdrawals

Let's look at an example to illustrate the importance of account data matching.

### Example: Insecure Admin Update

Consider a program with an `update_admin` instruction that changes the admin of
a configuration account:

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod insecure_admin {
    use super::*;

    pub fn update_admin(ctx: Context<UpdateAdmin>) -> Result<()> {
        ctx.accounts.admin_config.admin = ctx.accounts.new_admin.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    #[account(mut)]
    pub admin_config: Account<'info, AdminConfig>,
    pub current_admin: Signer<'info>,
    /// CHECK: This account is not read or written in this instruction
    pub new_admin: UncheckedAccount<'info>,
}

#[account]
pub struct AdminConfig {
    admin: Pubkey,
}
```

This instruction is insecure because it doesn't verify that the `current_admin`
signer matches the `admin` stored in the `admin_config` account. Any signer
could potentially update the admin!

### Implementing Data Validation Checks

Let's secure this instruction using two methods: native Rust and Anchor
constraints.

#### Native Rust Approach

In native Rust, we can add a simple comparison:

```rust
pub fn update_admin(ctx: Context<UpdateAdmin>) -> Result<()> {
    if ctx.accounts.current_admin.key() != ctx.accounts.admin_config.admin {
        return Err(ProgramError::InvalidAccountData.into());
    }
    ctx.accounts.admin_config.admin = ctx.accounts.new_admin.key();
    Ok(())
}
```

This check ensures that only the current admin can update the admin_config
account.

#### Anchor Constraints

Anchor provides a more declarative way to implement these checks using
[account constraints](https://www.anchor-lang.com/docs/account-constraints):

```rust
#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    #[account(
        mut,
        has_one = current_admin @ MyError::InvalidAdmin
    )]
    pub admin_config: Account<'info, AdminConfig>,
    pub current_admin: Signer<'info>,
    /// CHECK: This account is not read or written in this instruction
    pub new_admin: UncheckedAccount<'info>,
}
```

The `has_one = current_admin` constraint checks that the `current_admin`
account's key matches the `admin` field in the `AdminConfig` account. If it
doesn't match, Anchor will return the custom `InvalidAdmin` error.

Alternatively, you can use the `constraint` attribute for more complex checks:

```rust
#[derive(Accounts)]
pub struct UpdateAdmin<'info> {
    #[account(
        mut,
        constraint = admin_config.admin == current_admin.key() @ MyError::InvalidAdmin
    )]
    pub admin_config: Account<'info, AdminConfig>,
    pub current_admin: Signer<'info>,
    /// CHECK: This account is not read or written in this instruction
    pub new_admin: UncheckedAccount<'info>,
}
```

This approach allows for more flexibility in your validation logic.

<Callout type="info">
  Remember to define your custom errors in your program's error enum:

```rust
#[error_code]
pub enum MyError {
    #[msg("Only the current admin can perform this action")]
    InvalidAdmin,
}
```

</Callout>

By implementing these checks, you ensure that only the rightful admin can update
the 'admin_config' account, significantly improving your program's security.

## Lab: Securing a Vault Program

In this lab, we'll create a simple "vault" program to demonstrate the importance
of account data matching. We'll implement both an insecure and a secure version
of a withdraw instruction to highlight the difference.

### 1. Setup

Clone the starter code from the `starter` branch of
[this repository](https://github.com/Unboxed-Software/solana-account-data-matching).

The starter code includes a program with two instructions and a boilerplate test
file:

1. `initialize_vault`: Creates a new `Vault` account and a `tokenAccount`.
2. `insecure_withdraw`: Transfers tokens from the vault's token account to a
   destination account.

<Callout type="warning">
  The `insecure_withdraw` instruction has a critical flaw. Can you spot it before we implement the fix?
</Callout>

### 2. Understand the Insecure Withdraw Instruction

Let's examine the `insecure_withdraw` instruction:

```rust
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

#[derive(Accounts)]
pub struct InsecureWithdraw<'info> {
    #[account(
        seeds = [b"vault"],
        bump,
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

The critical flaw here is that while the instruction requires an `authority`
signer, it doesn't verify whether the `authority` account passed to the
instruction matches the `authority` stored in the `Vault` account. This means
that any signer could potentially withdraw funds from the vault, even if they're
not the authorized user.

### 3. Test the Insecure Withdraw Instruction

Let's write a test to demonstrate this vulnerability. Add the following test to
your `tests/account-data-matching.ts` file:

```typescript
test("Insecure withdraw allows unauthorized access", async () => {
  // Setup: Initialize vault and mint some tokens to it
  // ... (initialization code here)

  // Attempt unauthorized withdrawal
  // Note: unauthorizedWallet represents an unauthorized wallet trying to withdraw funds
  const tx = await program.methods
    .insecureWithdraw()
    .accounts({
      vault: vaultPDA,
      tokenAccount: tokenPDA,
      withdrawDestination: unauthorizedWalletWithdrawDestination,
      authority: unauthorizedWallet.publicKey,
    })
    .transaction();

  await anchor.web3.sendAndConfirmTransaction(connection, tx, [
    unauthorizedWallet,
  ]);

  // Check that the withdrawal succeeded (it shouldn't have!)
  const balance = await connection.getTokenAccountBalance(tokenPDA);
  expect(balance.value.uiAmount).to.eq(0);
});
```

Run `anchor test` to see that this unauthorized withdrawal succeeds,
demonstrating the security flaw.

### 4. Implement a Secure Withdraw Instruction

Now, let's implement a secure version of the withdraw instruction:

```rust
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

#[derive(Accounts)]
pub struct SecureWithdraw<'info> {
    #[account(
        seeds = [b"vault"],
        bump,
        has_one = authority,
        has_one = token_account,
        has_one = withdraw_destination,
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

The key difference here is the use of a
[`has_one` constraint](https://www.anchor-lang.com/docs/account-constraints) in
the `SecureWithdraw` struct. These ensure that the `authority`, `token_account`,
and `withdraw_destination` passed to the instruction match those stored in the
`Vault` account.

### 5. Test the Secure Withdraw Instruction

Now, let's test our secure instruction:

```typescript
test("Secure withdraw prevents unauthorized access", async () => {
  // Setup: Initialize vault and mint some tokens to it
  // ... (initialization code here)

  // Attempt unauthorized withdrawal
  // Note: unauthorizedWallet represents an unauthorized wallet trying to withdraw funds
  try {
    await program.methods
      .secureWithdraw()
      .accounts({
        vault: vaultPDA,
        tokenAccount: tokenPDA,
        withdrawDestination: unauthorizedWalletWithdrawDestination,
        authority: unauthorizedWallet.publicKey,
      })
      .rpc();

    // If we reach here, the test failed
    assert.fail("Expected an error, but withdrawal succeeded");
  } catch (error) {
    // Check that it's the error we expect
    expect(error.error.errorCode.code).to.equal("ConstraintHasOne");
  }

  // Check that the balance hasn't changed
  const balance = await connection.getTokenAccountBalance(tokenPDA);
  expect(balance.value.uiAmount).to.eq(100); // Assuming 100 tokens were initially minted
});

test("Secure withdraw allows authorized access", async () => {
  // Perform authorized withdrawal
  await program.methods
    .secureWithdraw()
    .accounts({
      vault: vaultPDA,
      tokenAccount: tokenPDA,
      withdrawDestination: withdrawDestination,
      authority: wallet.publicKey,
    })
    .rpc();

  // Check that the withdrawal succeeded
  const balance = await connection.getTokenAccountBalance(tokenPDA);
  expect(balance.value.uiAmount).to.eq(0);
});
```

Run `anchor test` again. You should see that the unauthorized withdrawal now
fails, while the authorized one succeeds.

### Conclusion

By implementing proper account data matching, we've significantly improved the
security of our vault program. The secure version ensures that only the
authorized user can withdraw funds, preventing potential exploits.

Remember, as your programs grow in complexity, it becomes increasingly important
to implement thorough data validation checks. Always consider what assumptions
your program is making about its inputs. Validate these assumptions explicitly.

Now that you've seen how to implement account data matching, take some time to
review one of your existing programs. Look for places where you might be making
assumptions about account data without explicitly checking it. Implement
appropriate checks using the techniques you've learned in this lesson.

Remember, if you find a security vulnerability in someone else's program,  
[responsibly disclose](https://en.wikipedia.org/wiki/Coordinated_vulnerability_disclosure)  
it to the program's maintainers. If you find one in your own program, patch it
as soon as possible!

After completing this lab and challenge, you'll have gained practical experience
in identifying and fixing security vulnerabilities related to account data
matching. This skill is crucial for developing secure Solana programs.

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=a107787e-ad33-42bb-96b3-0592efc1b92f)!
