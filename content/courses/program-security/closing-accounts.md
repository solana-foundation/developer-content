---
title: Closing Accounts and Revival Attacks
objectives:
  - Explain the various security vulnerabilities associated with closing program
    accounts incorrectly
  - Close program accounts safely and securely using native Rust
  - Close program accounts safely and securely using the Anchor `close`
    constraint
description:
  "How to close program accounts safely and securely in Anchor and native Rust."
---

## Summary

- **Closing an account** improperly creates an opportunity for
  reinitialization/revival attacks
- The Solana runtime **garbage collects accounts** when they are no longer rent
  exempt. Closing accounts involves transferring the lamports stored in the
  account for rent exemption to another account of your choosing.
- You can use the Anchor
  [`#[account(close = <address_to_send_lamports>)]`](https://www.anchor-lang.com/docs/account-constraints)
  constraint to securely close accounts.

  ```rust
  #[account(mut, close = receiver)]
  pub data_account: Account<'info, MyData>,
  #[account(mut)]
  pub receiver: SystemAccount<'info>
  ```

## Lesson

While it sounds simple, closing accounts properly can be tricky. There are a
number of ways an attacker could circumvent having the account closed if you
don't follow specific steps.

To get a better understanding of these attack vectors, let’s explore each of
these scenarios in depth.

### Insecure Account Closing

At its core, closing an account involves transferring its lamports to a separate
account, thus triggering the Solana runtime to garbage collect the first
account. This resets the owner from the owning program to the system program.

Take a look at the example below. The instruction handler requires two accounts:

1. `account_to_close` - the account to be closed
2. `destination` - the account that should receive the closed account’s lamports

The program logic is intended to close an account by simply increasing the
`destination` account’s lamports by the amount stored in the `account_to_close`
and setting the `account_to_close` lamports to 0. With this program, after a
full transaction is processed, the `account_to_close` will be garbage collected
by the runtime.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod closing_accounts_insecure {
    use super::*;

    pub fn close(ctx: Context<Close>) -> ProgramResult {
        let dest_starting_lamports = ctx.accounts.destination.lamports();

        **ctx.accounts.destination.lamports.borrow_mut() = dest_starting_lamports
            .checked_add(ctx.accounts.account_to_close.to_account_info().lamports())
            .unwrap();
        **ctx.accounts.account_to_close.to_account_info().lamports.borrow_mut() = 0;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Close<'info> {
    account_to_close: Account<'info, Data>,
    destination: AccountInfo<'info>,
}

#[account]
pub struct Data {
    data: u64,
}
```

However, garbage collection doesn't occur until the transaction is completed.
And since there can be multiple instructions in a transaction, this creates an
opportunity for an attacker to invoke the instruction handler to close the
account but also include in the transaction a transfer to refund the account's
rent exemption lamports. The result is that the account _will not_ be garbage
collected, opening up a path for the attacker to cause unintended behavior in
the program and even drain a protocol.

### Secure Account Closing

When closing accounts in Solana programs, it's crucial to prevent their
unintended reuse. This involves two key steps:

1. Transfer all lamports from the account being closed to a destination account.
2. Properly "delete" the account by reassigning its ownership and zeroing out
   its data.

While we no longer use an account discriminator to mark accounts as closed, the
approach we use achieves similar security benefits:

1. **Zero Lamports:** By transferring all lamports out, the account can't pay
   rent and will be garbage collected.
2. **System Program Ownership:** Reassigning to the System Program prevents
   direct data modification by your program.
3. **Zero Data:** Reallocating to 0 bytes removes all previously stored
   information.

This method effectively prevents the account from being reused because:

- It has no lamports to pay rent.
- It's not owned by your program, so you can't modify its data directly.
- It has no data to access or misuse.

However, it's important to note that a PDA with zeroed data could still be
derived and potentially misused for verification purposes. Therefore, additional
checks in your instruction handlers are crucial.

To further secure your program:

- Implement thorough account validation in all instruction handlers.
- Verify both the owner (should be System Program for closed accounts) and data
  size (should be 0 for closed accounts).
- Return an error if a closed account is passed to an instruction handler.

The example below demonstrates this secure closing method:

```rust
use anchor_lang::prelude::*;
use solana_program::system_program;

declare_id!("ABQaKhtpYQUUgZ9m2sAY7ZHxWv6KyNdhUJW8Dh8NQbkf");

#[program]
pub mod closing_accounts_insecure_still {
    use super::*;

    pub fn close(ctx: Context<Close>) -> Result<()> {
        let account_info = ctx.accounts.account.to_account_info();
        let destination_info = ctx.accounts.destination.to_account_info();

        // Transfer lamports
        let dest_starting_lamports = destination_info.lamports();
        let account_lamports = account_info.lamports();

        **destination_info.lamports.borrow_mut() = dest_starting_lamports
            .checked_add(account_lamports)
            .ok_or(error!(ErrorCode::ArithmeticError))?;
        **account_info.lamports.borrow_mut() = 0;

        // Delete the account
        delete_account(&account_info)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Close<'info> {
    #[account(mut)]
    pub account: Account<'info, Data>,
    #[account(mut)]
    pub destination: SystemAccount<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Data {
    pub data: u64,
}

/// Helper function to delete an account onchain
fn delete_account(account_info: &AccountInfo) -> Result<()> {
    account_info.assign(&system_program::id());
    account_info.realloc(0, false)?;
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic error occurred")]
    ArithmeticError,
}
```

<Callout>

The example above demonstrates a manual approach to closing accounts in Solana
programs. Instead of using Anchor's deprecated `CLOSED_ACCOUNT_DISCRIMINATOR`,
it employs two key steps:

Transferring all lamports from the account being closed to a destination
account. Using a helper function delete_account that:

- Reassigns the account's ownership to the System Program.
- Reallocates the account's data to 0 bytes.

This approach effectively "closes" the account by resetting it to an
uninitialized state. However, it's important to note that in Solana, accounts
are never truly deleted, just reset.

While this manual method provides more control over the closing process, in most
cases, it's recommended to use Anchor's `#[account(close = <target_account>)]`
constraint. This constraint automatically handles the account closing process in
a safe and efficient manner.

To prevent unintentional processing of closed accounts, it's crucial to
implement proper account validation checks in your instruction handlers. These
checks should verify the account's owner and data size to ensure that closed (or
uninitialized) accounts are not processed. </Callout>

### Manual Force Defund

While our current method of closing accounts (zeroing out data and reassigning
to the System Program) significantly reduces security risks, there's still a
potential edge case. A user could theoretically refund the account's lamports
before the end of an instruction handler, preventing the account from being
garbage collected. This could result in accounts existing in a "limbo" state -
unusable but not garbage collected.

To address this edge case, we can implement an instruction handler that allows
anyone to defund accounts that have been closed but somehow still have lamports.
Here's how we can implement this:

```rust
use anchor_lang::prelude::*;
use solana_program::system_program;

declare_id!("ABQaKhtpYQUUgZ9m2sAY7ZHxWv6KyNdhUJW8Dh8NQbkf");

#[program]
pub mod closing_accounts_with_force_defund {
    use super::*;

    // ... existing close function ...

    pub fn force_defund(ctx: Context<ForceDefund>) -> Result<()> {
        let account = &ctx.accounts.account;
        let destination = &ctx.accounts.destination;

        // Ensure the account is owned by the System Program (indicating it's closed)
        if account.owner != &system_program::ID {
            return Err(error!(ErrorCode::AccountNotClosed));
        }

        // Ensure the account has no data
        if account.data_len() != 0 {
            return Err(error!(ErrorCode::AccountNotProperlyClosed));
        }

        // Transfer any remaining lamports
        let account_lamports = account.lamports();
        **account.lamports.borrow_mut() = 0;
        **destination.lamports.borrow_mut() = destination
            .lamports()
            .checked_add(account_lamports)
            .ok_or(error!(ErrorCode::ArithmeticError))?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ForceDefund<'info> {
    /// CHECK: This account will not be checked by anchor
    #[account(mut)]
    pub account: UncheckedAccount<'info>,
    #[account(mut)]
    pub destination: SystemAccount<'info>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Arithmetic error occurred")]
    ArithmeticError,
    #[msg("Account is not closed")]
    AccountNotClosed,
    #[msg("Account is not properly closed")]
    AccountNotProperlyClosed,
}
```

In this implementation:

1. We check that the account is owned by the System Program, which indicates it
   has been closed using our `delete_account()` function.
2. We verify that the account has no data, another indicator that it has been
   properly closed.
3. If these conditions are met, we transfer any remaining lamports to the
   destination account.

This `force_defund` instruction handler can be called by anyone, serving as a
deterrent to attempted revival attacks. An attacker might pay for account rent
exemption, but anyone else can claim the lamports in a refunded account. While
not strictly necessary, this approach helps eliminate the waste of space and
lamports associated with these "limbo" accounts. It provides a cleanup mechanism
for accounts that may have been improperly handled during the closing process.

<Callout>

This force defund mechanism is an additional safety measure. In most cases,
properly implemented account closing (as shown in the previous example) should
be sufficient. The force defund option is primarily for handling edge cases and
providing an extra layer of protection against potential misuse of closed
accounts. </Callout>

### Using the Anchor close Constraint

Fortunately, Anchor makes all of this much simpler with the
[`#[account(close = <target_account>)]`](https://www.anchor-lang.com/docs/account-constraints)
constraint. This constraint handles everything required to securely close an
account by:

1. Transferring the account’s lamports to the specified account
   `<target_account>`
2. Zeroing out(resetting) the data of the account
3. Assigning the owner to the System Program

All you have to do is add it in the account validation struct to the account you
want closed:

```rust
#[derive(Accounts)]
pub struct CloseAccount {
    #[account(
        mut,
        close = receiver
    )]
    pub data_account: Account<'info, MyData>,
    #[account(mut)]
    pub receiver: SystemAccount<'info>
}
```

<Callout>

The `force_defund` instruction handler is an optional addition that you’ll have
to implement on your own if you’d like to utilize it. </Callout>

## Lab

To clarify how an attacker might take advantage of a revival attack, let's work
with a simple lottery program that uses a program account state to manage a
user's participation in the lottery.

### 1. Setup

Start by getting the code on the
[`starter` branch from this repo](https://github.com/solana-developers/closing-accounts/tree/starter).

The code has two instruction handlers on the program and two tests in the
`tests` directory.

The program instruction handlers are:

1. `enter_lottery`
2. `redeem_rewards_insecure`

When a user calls `enter_lottery`, the program will initialize an account to
store some state about the user's lottery entry.

Since this is a simplified example rather than a fully-fledge lottery program,
once a user has entered the lottery they can call the `redeem_rewards_insecure`
instruction handler at any time. This instruction handler will mint the user a
number of Reward tokens proportional to the number of times the user has entered
the lottery. After minting the rewards, the program closes the user's lottery
entry.

Take a minute to familiarize yourself with the program code. The `enter_lottery`
instruction handler simply creates an account at a PDA mapped to the user and
initializes some state on it.

The `redeem_rewards_insecure` instruction handler performs some account and data
validation, mints tokens to the given token account, then closes the lottery
account by removing its lamports.

However, notice the `redeem_rewards_insecure` instruction handler _only_
transfers out the account's lamports, leaving the account open to revival
attacks.

### 2. Test Insecure Program

An attacker that successfully keeps their account from closing can then call
`redeem_rewards_insecure` multiple times, claiming more rewards than they are
owed.

Some starter tests have already been written that showcase this vulnerability.
Take a look at the `closing-accounts.ts` file in the `tests` directory. There is
some setup in the `before` function, then a test that simply creates a new
lottery entry for `attacker`.

Finally, there's a test that demonstrates how an attacker can keep the account
alive even after claiming rewards and then claim rewards again. That test looks
like this:

```typescript
it("allows attacker to close + refund lottery account + claim multiple rewards", async () => {
  try {
    const [attackerLotteryEntry] = PublicKey.findProgramAddressSync(
      [Buffer.from("test-seed"), authority.publicKey.toBuffer()],
      program.programId,
    );

    // Claim multiple times
    for (let i = 0; i < 2; i++) {
      const tx = new anchor.web3.Transaction();

      // Instruction claims rewards, program will try to close account
      tx.add(
        await program.methods
          .redeemWinningsInsecure()
          .accounts({
            userAta: attackerAta,
            rewardMint: rewardMint,
            user: authority.publicKey,
          })
          .signers([authority])
          .instruction(),
      );

      // User adds instruction to refund dataAccount lamports
      const rentExemptLamports =
        await provider.connection.getMinimumBalanceForRentExemption(82);
      tx.add(
        SystemProgram.transfer({
          fromPubkey: authority.publicKey,
          toPubkey: attackerLotteryEntry,
          lamports: rentExemptLamports,
        }),
      );

      // Send transaction
      await provider.sendAndConfirm(tx, [authority]);

      // Wait for 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    const tokenAcct = await getAccount(provider.connection, attackerAta);
    const lotteryEntry =
      await program.account.lotteryAccount.fetch(attackerLotteryEntry);

    expect(Number(tokenAcct.amount)).to.equal(
      lotteryEntry.timestamp.toNumber() * 10 * 2,
    );
  } catch (error) {
    throw new Error(`Test failed: ${error.message}`);
  }
});
```

This test does the following:

1. Calls `redeem_rewards_insecure` to redeem the user's rewards
2. In the same transaction, add an instruction to refund the user's
   `lottery_entry` before it can be closed
3. Successfully repeat steps 1 and 2, redeeming rewards for a second time.

You can theoretically repeat steps 1-2 infinitely until either a) the program
has no more rewards to give or b) someone notices and patches the exploit. This
would be a severe problem in any real program as it allows a malicious attacker
to drain an entire rewards pool.

### 3. Create a redeem_rewards_secure Instruction Handler

To prevent this from happening we're going to create a new instruction handler
that closes the lottery account securely using the Anchor `close` constraint.
Feel free to try this out on your own if you'd like.

The new account validation struct called `RedeemWinningsSecure` should look like
this:

```rust
#[derive(Accounts)]
pub struct RedeemWinningsSecure<'info> {
    // Verifying lottery entry PDA and closing it
    #[account(
        mut,
        seeds = [DATA_PDA_SEED,user.key.as_ref()],
        bump = lottery_entry.bump,
        close = user
    )]
    pub lottery_entry: Account<'info, LotteryAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        constraint = user_ata.key() == lottery_entry.user_ata
    )]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        constraint = reward_mint.key() == user_ata.mint
    )]
    pub reward_mint: Account<'info, Mint>,
    /// CHECKED: Mint authority PDA, checked by seeds constraint
    #[account(
        seeds = [MINT_SEED],
        bump
    )]
    /// CHECKED: This account will not be checked by anchor
    pub mint_auth: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
}
```

It should be the same as the original `RedeemWinnings` account validation
struct, except there is an additional `close = user` constraint on the
`lottery_entry` account. This will tell Anchor to close the account by zeroing
out the data, transferring its lamports to the `user` account, and assigning the
owner to the System Program. This last step is what will prevent the account
from being used again if the program has attempted to close it already.

Then, we can create a `mint_ctx` method on the new `RedeemWinningsSecure` struct
to help with the minting CPI to the token program.

```Rust
impl<'info> RedeemWinningsSecure<'info> {
    pub fn mint_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            MintTo {
                mint: self.reward_mint.to_account_info(),
                to: self.user_ata.to_account_info(),
                authority: self.mint_auth.to_account_info(),
            },
        )
    }
}
```

Finally, the logic for the new secure instruction handler should look like this:

```rust
pub fn redeem_winnings_secure(ctx: Context<RedeemWinningsSecure>) -> Result<()> {
    msg!("Calculating winnings");
    let amount = ctx.accounts.lottery_entry.timestamp as u64 * 10
    msg!("Minting {} tokens in rewards", amount);
    // Program signer seeds
    let auth_bump = ctx.bumps.mint_auth;
    let auth_seeds = &[MINT_SEED, &[auth_bump]];
    let signer = &[&auth_seeds[..]]
    // Redeem rewards by minting to user
    mint_to(ctx.accounts.mint_ctx().with_signer(signer), amount)?
    Ok(())
}
```

This logic simply calculates the rewards for the claiming user and transfers the
rewards. However, because of the `close` constraint in the account validation
struct, the attacker shouldn't be able to call this instruction handler multiple
times.

### 4. Test the Program

To test our new secure instruction handler, let's create a new test that tries
to call `redeemingWinningsSecure` twice. We expect the second call to throw an
error.

```typescript
it("prevents attacker from claiming multiple rewards with secure claim", async () => {
  try {
    const [attackerLotteryEntry] = PublicKey.findProgramAddressSync(
      [Buffer.from("test-seed"), attacker.publicKey.toBuffer()],
      program.programId,
    );

    // First claim
    const tx = new anchor.web3.Transaction();
    tx.add(
      await program.methods
        .redeemWinningsSecure()
        .accounts({
          user: attacker.publicKey,
          userAta: attackerAta,
          rewardMint: rewardMint,
        })
        .instruction(),
    );

    // User adds instruction to refund dataAccount lamports
    const rentExemptLamports =
      await provider.connection.getMinimumBalanceForRentExemption(82);
    tx.add(
      SystemProgram.transfer({
        fromPubkey: attacker.publicKey,
        toPubkey: attackerLotteryEntry,
        lamports: rentExemptLamports,
      }),
    );

    // Send first transaction
    await provider.sendAndConfirm(tx, [attacker]);

    // Attempt second claim
    try {
      await program.methods
        .redeemWinningsSecure()
        .accounts({
          user: attacker.publicKey,
          userAta: attackerAta,
          rewardMint: rewardMint,
        })
        .signers([attacker])
        .rpc();

      // If we reach here, the transaction didn't throw as expected
      expect.fail("Expected an error but transaction succeeded");
    } catch (error) {
      console.log(error.message);
      expect(error).to.exist;
    }
  } catch (error) {
    throw new Error(`Test failed: ${error.message}`);
  }
});
```

Run `anchor test` to see that the test passes. The output will look something
like this:

```bash
   Closing accounts
    ✔ enters lottery successfully (412ms)
    ✔ allows attacker to close + refund lottery account + claim multiple rewards (10580ms)
AnchorError caused by account: lottery_entry. Error Code: AccountOwnedByWrongProgram. Error Number: 3007. Error Message: The given account is owned by a different program than expected.
Program log: Left:
Program log: 11111111111111111111111111111111
Program log: Right:
Program log: 2Ckbi1jrknS2q1CY5SXeq1GR2YMRGJsi99AZJiL8WE4g
    ✔ prevents attacker from claiming multiple rewards with secure claim (146ms)
```

<Callout>

This does not prevent the malicious user from refunding their account
altogether - it just protects our program from accidentally re-using the account
when it should be closed.</Callout>

We haven't implemented a `force_defund` instruction handler so far, but we
could. If you're feeling up for it, give it a try yourself!

The simplest and most secure way to close accounts is using Anchor's `close`
constraint. If you ever need more custom behavior and can't use this constraint,
make sure to replicate its functionality to ensure your program is secure.

If you want to take a look at the final solution code you can find it on the
[`solution` branch of the same repository](https://github.com/solana-developers/closing-accounts/tree/solution).

## Challenge

Just as with other lessons in this unit, your opportunity to practice avoiding
this security exploit lies in auditing your own or other programs.

Take some time to review at least one program and ensure that when accounts are
closed they're not susceptible to revival attacks.

Remember, if you find a bug or exploit in somebody else's program, please alert
them! If you find one in your own program, be sure to patch it right away.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=e6b99d4b-35ed-4fb2-b9cd-73eefc875a0f)!
</Callout>
