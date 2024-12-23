---
title: PDA Sharing
objectives:
  - Explain the security risks associated with PDA sharing
  - Derive PDAs that have discrete authority domains
  - Use Anchor's `seeds` and `bump` constraints to validate PDA accounts
description:
  "Understand the potential problems of reusing PDAs by using user and domain
  specific PDAs."
---

## Summary

- Using the same PDA for multiple authority domains opens your program up to the
  possibility of users accessing data and funds that don't belong to them
- Prevent the same PDA from being used for multiple accounts by using seeds that
  are user and/or domain-specific
- Use Anchor's `seeds` and `bump` constraints to validate that a PDA is derived
  using the expected seeds and bump

## Lesson

PDA sharing refers to using the same PDA as a signer across multiple users or
domains. Especially when using PDAs for signing, it may seem appropriate to use
a global PDA to represent the program. However, this opens up the possibility of
account validation passing but a user being able to access funds, transfers, or
data not belonging to them.

### Insecure Global PDA

In the example below, the `authority` of the `vault` account is a PDA derived
using the `mint` address stored on the `pool` account. This PDA is passed into
the instruction handler as the `authority` account to sign for the transfer of
tokens from the `vault` to the `withdraw_destination`.

Using the `mint` address as a seed to derive the PDA to sign for the `vault` is
insecure because multiple `pool` accounts could be created for the same `vault`
token account, but with different `withdraw_destination` accounts. By using the
`mint` as a `seed` to derive the PDA for signing token transfers, any `pool`
account could sign for the transfer of tokens from a `vault` token account to an
arbitrary `withdraw_destination`.

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("ABQaKhtpYQUUgZ9m2sAY7ZHxWv6KyNdhUJW8Dh8NQbkf");

#[program]
pub mod pda_sharing_insecure {
    use super::*;

    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>) -> Result<()> {
        let amount = ctx.accounts.vault.amount;
        let seeds = &[ctx.accounts.pool.mint.as_ref(), &[ctx.accounts.pool.bump]];
        token::transfer(get_transfer_ctx(&ctx.accounts).with_signer(&[seeds]), amount)
    }
}

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(has_one = vault, has_one = withdraw_destination)]
    pool: Account<'info, TokenPool>,
    vault: Account<'info, TokenAccount>,
    withdraw_destination: Account<'info, TokenAccount>,
    /// CHECK: This is the PDA that signs for the transfer
    authority: UncheckedAccount<'info>,
    token_program: Program<'info, Token>,
}

pub fn get_transfer_ctx<'accounts, 'remaining, 'cpi_code, 'info>(
    accounts: &'accounts WithdrawTokens<'info>,
) -> CpiContext<'accounts, 'remaining, 'cpi_code, 'info, token::Transfer<'info>> {
    CpiContext::new(
        accounts.token_program.to_account_info(),
        token::Transfer {
            from: accounts.vault.to_account_info(),
            to: accounts.withdraw_destination.to_account_info(),
            authority: accounts.authority.to_account_info(),
        },
    )
}

#[account]
#[derive(InitSpace)]
pub struct TokenPool {
    pub vault: Pubkey,
    pub mint: Pubkey,
    pub withdraw_destination: Pubkey,
    pub bump: u8,
}
```

### Secure account specific PDA

One approach to create an account specific PDA is to use the
`withdraw_destination` as a seed to derive the PDA used as the authority of the
`vault` token account. This ensures the PDA signing for the CPI in the
`withdraw_tokens` instruction handler is derived using the intended
`withdraw_destination` token account. In other words, tokens from a `vault`
token account can only be withdrawn to the `withdraw_destination` that was
originally initialized with the `pool` account.

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod pda_sharing_secure {
    use super::*;

    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>) -> Result<()> {
        let amount = ctx.accounts.vault.amount;
        let seeds = &[
            ctx.accounts.pool.withdraw_destination.as_ref(),
            &[ctx.accounts.pool.bump],
        ];
        token::transfer(get_transfer_ctx(&ctx.accounts).with_signer(&[seeds]), amount)
    }
}

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(has_one = vault, has_one = withdraw_destination)]
    pool: Account<'info, TokenPool>,
    vault: Account<'info, TokenAccount>,
    withdraw_destination: Account<'info, TokenAccount>,
    /// CHECK: This is the PDA that signs for the transfer
    authority: UncheckedAccount<'info>,
    token_program: Program<'info, Token>,
}

pub fn get_transfer_ctx<'accounts, 'remaining, 'cpi_code, 'info>(
    accounts: &'accounts WithdrawTokens<'info>,
) -> CpiContext<'accounts, 'remaining, 'cpi_code, 'info, token::Transfer<'info>> {
    CpiContext::new(
        accounts.token_program.to_account_info(),
        token::Transfer {
            from: accounts.vault.to_account_info(),
            to: accounts.withdraw_destination.to_account_info(),
            authority: accounts.authority.to_account_info(),
        },
    )
}

#[account]
#[derive(InitSpace)]
pub struct TokenPool {
    pub vault: Pubkey,
    pub mint: Pubkey,
    pub withdraw_destination: Pubkey,
    pub bump: u8,
}
```

### Anchor's seeds and bump Constraints

PDAs can be used as both the address of an account and allow programs to sign
for the PDAs they own.

The example below uses a PDA derived using the `withdraw_destination` as both
the address of the `pool` account and the owner of the `vault` token account.
This means that only the `pool` account associated with the correct `vault` and
`withdraw_destination` can be used in the `withdraw_tokens` instruction handler.

You can use Anchor's `seeds` and `bump` constraints with the
[`#[account(...)]`](https://www.anchor-lang.com/docs/account-constraints)
attribute to validate the `pool` account PDA. Anchor derives a PDA using the
`seeds` and `bump` specified and compares it against the account passed into the
instruction handler as the `pool` account. The `has_one` constraint is used to
further ensure that only the correct accounts stored on the `pool` account are
passed into the instruction handler.

```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};

declare_id!("ABQaKhtpYQUUgZ9m2sAY7ZHxWv6KyNdhUJW8Dh8NQbkf");

#[program]
pub mod pda_sharing_recommended {
    use super::*;

    pub fn withdraw_tokens(ctx: Context<WithdrawTokens>) -> Result<()> {
        let amount = ctx.accounts.vault.amount;
        let seeds = &[
            ctx.accounts.pool.withdraw_destination.as_ref(),
            &[ctx.accounts.pool.bump],
        ];
        token::transfer(get_transfer_ctx(&ctx.accounts).with_signer(&[seeds]), amount)
    }
}

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(
        seeds = [withdraw_destination.key().as_ref()],
        bump = pool.bump,
        has_one = vault,
        has_one = withdraw_destination,
    )]
    pool: Account<'info, TokenPool>,
    #[account(mut)]
    vault: Account<'info, TokenAccount>,
    #[account(mut)]
    withdraw_destination: Account<'info, TokenAccount>,
    token_program: Program<'info, Token>,
}

pub fn get_transfer_ctx<'accounts, 'remaining, 'cpi_code, 'info>(
    accounts: &'accounts WithdrawTokens<'info>,
) -> CpiContext<'accounts, 'remaining, 'cpi_code, 'info, token::Transfer<'info>> {
    CpiContext::new(
        accounts.token_program.to_account_info(),
        token::Transfer {
            from: accounts.vault.to_account_info(),
            to: accounts.withdraw_destination.to_account_info(),
            authority: accounts.pool.to_account_info(),
        },
    )
}

#[account]
#[derive(InitSpace)]
pub struct TokenPool {
    pub vault: Pubkey,
    pub mint: Pubkey,
    pub withdraw_destination: Pubkey,
    pub bump: u8,
}
```

## Lab

Let's practice by creating a simple program to demonstrate how PDA sharing can
allow an attacker to withdraw tokens that don't belong to them. This lab expands
on the examples above by including the instruction handlers to initialize the
required program accounts.

### 1. Starter

To get started, download the starter code on the
[`starter` branch of this repository](https://github.com/solana-developers/pda-sharing/tree/starter).
The starter code includes a program with two instruction handlers and the
boilerplate setup for the test file.

The `initialize_pool` instruction handler initializes a new `TokenPool` that
stores a `vault`, `mint`, `withdraw_destination`, and `bump`. The `vault` is a
token account where the authority is set as a PDA derived using the `mint`
address.

The `withdraw_insecure` instruction handler will transfer tokens in the `vault`
token account to a `withdraw_destination` token account.

However, as written the seeds used for signing are not specific to the vault's
withdrawal destination, thus opening up the program to security exploits. Take a
minute to familiarize yourself with the code before continuing on.

### 2. Test withdraw_insecure Instruction Handler

The test file includes the code to invoke the `initialize_pool` instruction
handler and then mint 100 tokens to the `vault` token account. It also includes
a test to invoke the `withdraw_insecure` using the intended
`withdraw_destination`. This shows that the instruction handlers can be used as
intended.

After that, there are two more tests to show how the instruction handlers are
vulnerable to exploit.

The first test invokes the `initialize_pool` instruction handler to create a
"fake" `pool` account using the same `vault` token account, but a different
`withdraw_destination`.

The second test withdraws from this pool, stealing funds from the vault.

```typescript
it("allows insecure initialization with incorrect vault", async () => {
  try {
    await program.methods
      .initializePool(insecureAuthorityBump)
      .accounts({
        pool: insecurePoolFake.publicKey,
        mint: tokenMint,
        vault: insecureVault.address,
        withdrawDestination: fakeWithdrawDestination,
      })
      .signers([insecurePoolFake])
      .rpc();

    await mintTo(
      connection,
      wallet.payer,
      tokenMint,
      insecureVault.address,
      wallet.payer,
      INITIAL_MINT_AMOUNT,
    );

    const vaultAccount = await getAccount(connection, insecureVault.address);
    expect(Number(vaultAccount.amount)).to.equal(INITIAL_MINT_AMOUNT);
  } catch (error) {
    throw new Error(`Test failed: ${error.message}`);
  }
});

it("allows insecure withdrawal to incorrect destination", async () => {
  try {
    await program.methods
      .withdrawInsecure()
      .accounts({
        pool: insecurePoolFake.publicKey,
        authority: insecureAuthority,
      })
      .rpc();

    const vaultAccount = await getAccount(connection, insecureVault.address);
    expect(Number(vaultAccount.amount)).to.equal(0);
  } catch (error) {
    throw new Error(`Test failed: ${error.message}`);
  }
});
```

Run `anchor test` to see that the transactions complete successfully and the
`withdraw_instrucure` instruction handler allows the `vault` token account to be
drained to a fake withdraw destination stored on the fake `pool` account.

### 3. Add initialize_pool_secure Instruction Handler

Now let's add a new instruction handler to the program for securely initializing
a pool.

This new `initialize_pool_secure` instruction handler will initialize a `pool`
account as a PDA derived using the `withdraw_destination`. It will also
initialize a `vault` token account with the authority set as the `pool` PDA.

```rust
pub fn initialize_pool_secure(ctx: Context<InitializePoolSecure>) -> Result<()> {
    ctx.accounts.pool.vault = ctx.accounts.vault.key();
    ctx.accounts.pool.mint = ctx.accounts.mint.key();
    ctx.accounts.pool.withdraw_destination = ctx.accounts.withdraw_destination.key();
    ctx.accounts.pool.bump = ctx.bumps.pool;
    Ok(())
}
...

#[derive(Accounts)]
pub struct InitializePoolSecure<'info> {
    #[account(
        init,
        payer = payer,
        space = DISCRIMINATOR_SIZE + TokenPool::INIT_SPACE,
        seeds = [withdraw_destination.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, TokenPool>,
    pub mint: Account<'info, Mint>,
    #[account(
        init,
        payer = payer,
        token::mint = mint,
        token::authority = pool,
    )]
    pub vault: Account<'info, TokenAccount>,
    pub withdraw_destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}
```

### 4. Add withdraw_secure Instruction Handler

Next, add a `withdraw_secure` instruction handler. This instruction handler will
withdraw tokens from the `vault` token account to the `withdraw_destination`.
The `pool` account is validated using the `seeds` and `bump` constraints to
ensure the correct PDA account is provided. The `has_one` constraints check that
the correct `vault` and `withdraw_destination` token accounts are provided.

```rust
pub fn withdraw_secure(ctx: Context<WithdrawTokensSecure>) -> Result<()> {
    let amount = ctx.accounts.vault.amount;
    let seeds = &[
        ctx.accounts.pool.withdraw_destination.as_ref(),
        &[ctx.accounts.pool.bump],
    ];
    token::transfer(
        get_secure_transfer_ctx(&ctx.accounts).with_signer(&[seeds]),
        amount,
    )
}

...

#[derive(Accounts)]
pub struct WithdrawTokensSecure<'info> {
    #[account(
        has_one = vault,
        has_one = withdraw_destination,
        seeds = [withdraw_destination.key().as_ref()],
        bump = pool.bump,
    )]
    pub pool: Account<'info, TokenPool>,
    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,
    #[account(mut)]
    pub withdraw_destination: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn get_secure_transfer_ctx<'accounts, 'remaining, 'cpi_code, 'info>(
    accounts: &'accounts WithdrawTokensSecure<'info>,
) -> CpiContext<'accounts, 'remaining, 'cpi_code, 'info, token::Transfer<'info>> {
    CpiContext::new(
        accounts.token_program.to_account_info(),
        token::Transfer {
            from: accounts.vault.to_account_info(),
            to: accounts.withdraw_destination.to_account_info(),
            authority: accounts.pool.to_account_info(),
        },
    )
}
```

### 5. Test withdraw_secure Instruction Handler

Finally, return to the test file to test the `withdraw_secure` instruction
handler and show that by narrowing the scope of our PDA signing authority, we've
removed the vulnerability.

Before we write a test showing the vulnerability has been patched let's write a
test that simply shows that the initialization and withdraw instruction handlers
work as expected:

```typescript
it("performs secure pool initialization and withdrawal correctly", async () => {
  try {
    const initialWithdrawBalance = await getAccount(
      connection,
      withdrawDestination,
    );

    await program.methods
      .initializePoolSecure()
      .accounts({
        mint: tokenMint,
        vault: recommendedVault.publicKey,
        withdrawDestination: withdrawDestination,
      })
      .signers([recommendedVault])
      .rpc();

    await new Promise(resolve => setTimeout(resolve, 1000));

    await mintTo(
      connection,
      wallet.payer,
      tokenMint,
      recommendedVault.publicKey,
      wallet.payer,
      INITIAL_MINT_AMOUNT,
    );

    await program.methods
      .withdrawSecure()
      .accounts({
        vault: recommendedVault.publicKey,
        withdrawDestination: withdrawDestination,
      })
      .rpc();

    const finalWithdrawBalance = await getAccount(
      connection,
      withdrawDestination,
    );

    expect(
      Number(finalWithdrawBalance.amount) -
        Number(initialWithdrawBalance.amount),
    ).to.equal(INITIAL_MINT_AMOUNT);
  } catch (error) {
    throw new Error(`Test failed: ${error.message}`);
  }
});
```

Now, we'll test that the exploit no longer works. Since the `vault` authority is
the `pool` PDA derived using the intended `withdraw_destination` token account,
there should no longer be a way to withdraw to an account other than the
intended `withdraw_destination`.

Add a test that shows you can't call `withdraw_secure` with the wrong withdrawal
destination. It can use the pool and vault created in the previous test.

```typescript
it("prevents secure withdrawal to incorrect destination", async () => {
  try {
    await program.methods
      .withdrawSecure()
      .accounts({
        vault: recommendedVault.publicKey,
        withdrawDestination: fakeWithdrawDestination,
      })
      .signers([recommendedVault])
      .rpc();

    throw new Error("Expected an error but withdrawal succeeded");
  } catch (error) {
    expect(error).to.exist;
    console.log("Error message:", error.message);
  }
});
```

Lastly, since the `pool` account is a PDA derived using the
`withdraw_destination` token account, we can't create a fake `pool` account
using the same PDA. Add one more test showing that the new
`initialize_pool_secure` instruction handler won't let an attacker put in the
wrong vault.

```typescript
it("prevents secure pool initialization with incorrect vault", async () => {
  try {
    await program.methods
      .initializePoolSecure()
      .accounts({
        mint: tokenMint,
        vault: insecureVault.address,
        withdrawDestination: withdrawDestination,
      })
      .signers([recommendedVault])
      .rpc();

    throw new Error("Expected an error but initialization succeeded");
  } catch (error) {
    expect(error).to.exist;
    console.log("Error message:", error.message);
  }
});
```

Run `anchor test` to see that the new instruction handlers don't allow an
attacker to withdraw from a vault that isn't theirs.

```bash
 PDA sharing
    ✔ allows insecure initialization with incorrect vault (852ms)
    ✔ allows insecure withdrawal to incorrect destination (425ms)
    ✔ performs secure pool initialization and withdrawal correctly (2150ms)
Error message: unknown signer: BpaG3NbsvLUqyFLZo9kWPwda3iPM8abJYkBfwBsASsgi
    ✔ prevents secure withdrawal to incorrect destination
Error message: unknown signer: BpaG3NbsvLUqyFLZo9kWPwda3iPM8abJYkBfwBsASsgi
    ✔ prevents secure pool initialization with incorrect vault
```

And that's it! Unlike some of the other security vulnerabilities we've
discussed, this one is more conceptual and can't be fixed by simply using a
particular Anchor type. You'll need to think through the architecture of your
program and ensure that you aren't sharing PDAs across different domains.

If you want to take a look at the final solution code you can find it on the
[`solution` branch of the same repository](https://github.com/solana-developers/pda-sharing/tree/solution).

## Challenge

Just as with other lessons in this unit, your opportunity to practice avoiding
this security exploit lies in auditing your own or other programs.

Take some time to review at least one program and look for potential
vulnerabilities in its PDA structure. PDAs used for signing should be narrow and
focused on a single domain as much as possible.

Remember, if you find a bug or exploit in somebody else's program, please alert
them! If you find one in your own program, be sure to patch it right away.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=5744079f-9473-4485-9a14-9be4d31b40d1)!
</Callout>
