---
title: Duplicate Mutable Accounts
objectives:
  - Explain the security risks associated with instructions that require two
    mutable accounts of the same type and how to avoid them
  - Implement a check for duplicate mutable accounts using native Rust
  - Implement a check for duplicate mutable accounts using Anchor constraints
description:
  "Under vulnerabilities that can occur with instruction handlers that handle
  two mutable accounts, and how to mitigate them."
---

## Summary

- When an instruction requires two mutable accounts of the same type, an
  attacker can pass in the same account twice, leading to unintended mutations.
- To check for duplicate mutable accounts in Rust, simply compare the public
  keys of the two accounts and throw an error if they are the same.

### Checking for Duplicate Mutable Accounts in Rust

In Rust, you can simply compare the public keys of the accounts and return an
error if they are identical:

```rust
if ctx.accounts.account_one.key() == ctx.accounts.account_two.key() {
  return Err(ProgramError::InvalidArgument)
}
```

### Using Constraints in Anchor

In Anchor, you can add an explicit `constraint` to an account, ensuring it is
not the same as another account.

## Lesson

**Duplicate Mutable Accounts** occur when an instruction requires two mutable
accounts of the same type. If the same account is passed twice, it can be
mutated in unintended ways, potentially causing security vulnerabilities.

### No check

Consider a program that updates a data field for `user_a` and `user_b` in a
single instruction. If the same account is passed for both `user_a` and
`user_b`, the program will overwrite the data field with the second value,
potentially leading to unintended side effects.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod duplicate_mutable_accounts_insecure {
    use super::*;

    pub fn update(ctx: Context<Update>, a: u64, b: u64) -> Result<()> {
        ctx.accounts.user_a.data = a;
        ctx.accounts.user_b.data = b;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub user_a: Account<'info, User>,
    #[account(mut)]
    pub user_b: Account<'info, User>,
}

#[account]
#[derive(Default)]
pub struct User {
    pub data: u64,
}
```

#### Adding a check in Rust

To avoid this, add a check in the instruction logic to ensure the accounts are
different:

```rust
if ctx.accounts.user_a.key() == ctx.accounts.user_b.key() {
    return Err(ProgramError::InvalidArgument)
}
```

This check ensures that `user_a` and `user_b` are not the same account.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod duplicate_mutable_accounts_secure {
    use super::*;

    pub fn update(ctx: Context<Update>, a: u64, b: u64) -> Result<()> {
        if ctx.accounts.user_a.key() == ctx.accounts.user_b.key() {
            return Err(ProgramError::InvalidArgument)
        }
        ctx.accounts.user_a.data = a;
        ctx.accounts.user_b.data = b;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub user_a: Account<'info, User>,
    #[account(mut)]
    pub user_b: Account<'info, User>,
}

#[account]
#[derive(Default)]
pub struct User {
    pub data: u64,
}
```

#### Using Anchor Constraint

An even better solution in Anchor is to use
[the `constraint` keyword](https://www.anchor-lang.com/docs/account-constraints)
in the account validation struct.

You can use the #[account(..)] attribute macro and the constraint keyword to add
a manual constraint to an account. The constraint keyword will check whether the
expression that follows evaluates to true or false, returning an error if the
expression evaluates to false.

This ensures the check is performed automatically during account validation:

```rust
use anchor_lang::prelude::*;

declare_id!("AjBhRphs24vC1V8zZM25PTuLJhJJXFnYbimsZF8jpJAS");

#[program]
pub mod duplicate_mutable_accounts_recommended {
    use super::*;

    pub fn update(ctx: Context<Update>, a: u64, b: u64) -> Result<()> {
        ctx.accounts.user_a.data = a;
        ctx.accounts.user_b.data = b;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(
        mut,
        constraint = user_a.key() != user_b.key())]
    pub user_a: Account<'info, User>,
    #[account(mut)]
    pub user_b: Account<'info, User>,
}

#[account]
#[derive(Default)]
pub struct User {
    pub data: u64,
}
```

## Lab

Let's practice by creating a simple Rock Paper Scissors program to demonstrate
how failing to check for duplicate mutable accounts can cause undefined behavior
within your program.

This program will initialize “player” accounts and have a separate instruction
that requires two player accounts to represent starting a game of rock, paper
and scissors.

- An `initialize` instruction to initialize a `PlayerState` account
- A `rock_paper_scissors_shoot_insecure` instruction that requires two
  `PlayerState` accounts, but does not check that the accounts passed into the
  instruction are different
- A `rock_paper_scissors_shoot_secure` instruction that is the same as the
  `rock_paper_scissors_shoot_insecure` instruction but adds a constraint that
  ensures the two player accounts are different

### Starter

To get started, download the starter code on the `starter` branch
of [this repository](https://github.com/solana-developers/duplicate-mutable-accounts/tree/starter).
The starter code includes a program with two instructions and the boilerplate
setup for the test file.

The `initialize` instruction initializes a new `PlayerState` account that stores
the public key of a player and a `choice` field that is set to `None`.

The `rock_paper_scissors_shoot_insecure` instruction requires two `PlayerState`
accounts and requires a choice from the `RockPaperScissors` enum for each
player, but does not check that the accounts passed into the instruction are
different. This means a single account can be used for both `PlayerState`
accounts in the instruction.

```rust filename="constants.rs"
pub const DISCRIMINATOR_SIZE: usize = 8;
```

```rust filename="lib.rs"
use anchor_lang::prelude::*;

mod constants;
use constants::DISCRIMINATOR_SIZE;

declare_id!("Lo5sj2wWy4BHbe8kCSUvgdhzFbv9c6CEERfgAXusBj9");

#[program]
pub mod duplicate_mutable_accounts {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.new_player.player = ctx.accounts.payer.key();
        ctx.accounts.new_player.choice = None;
        Ok(())
    }

    pub fn rock_paper_scissors_shoot_insecure(
        ctx: Context<RockPaperScissorsInsecure>,
        player_one_choice: RockPaperScissors,
        player_two_choice: RockPaperScissors,
    ) -> Result<()> {
        ctx.accounts.player_one.choice = Some(player_one_choice);
        ctx.accounts.player_two.choice = Some(player_two_choice);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = DISCRIMINATOR_SIZE + PlayerState::INIT_SPACE
    )]
    pub new_player: Account<'info, PlayerState>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RockPaperScissorsInsecure<'info> {
    #[account(mut)]
    pub player_one: Account<'info, PlayerState>,
    #[account(mut)]
    pub player_two: Account<'info, PlayerState>,
}

#[account]
#[derive(Default, InitSpace)]
pub struct PlayerState {
    pub player: Pubkey,
    pub choice: Option<RockPaperScissors>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum RockPaperScissors {
    Rock,
    Paper,
    Scissors,
}
```

### Test rock_paper_scissors_shoot_insecure instruction

The test file includes the code to invoke the `initialize` instruction twice to
create two player accounts.

Add a test to invoke the `rock_paper_scissors_shoot_insecure` instruction by
passing in the `playerOne.publicKey` for as both `playerOne` and `playerTwo`.

```typescript
describe("duplicate-mutable-accounts", () => {
    ...
    it("Invokes insecure instruction", async () => {
        await program.methods
        .rockPaperScissorsShootInsecure({ rock: {} }, { scissors: {} })
        .accounts({
            playerOne: playerOne.publicKey,
            playerTwo: playerOne.publicKey,
        })
        .rpc()

        const p1 = await program.account.playerState.fetch(playerOne.publicKey)
        assert.equal(JSON.stringify(p1.choice), JSON.stringify({ scissors: {} }))
        assert.notEqual(JSON.stringify(p1.choice), JSON.stringify({ rock: {} }))
    })
})
```

Run `anchor test` to see that the transactions are completed successfully, even
though the same account is used as two accounts in the instruction. Since the
`playerOne` account is used as both players in the instruction, note the
`choice` stored on the `playerOne` account is also overridden and set
incorrectly as `scissors`.

```bash
duplicate-mutable-accounts
  ✔ Initialized Player One (461ms)
  ✔ Initialized Player Two (404ms)
  ✔ Invoke insecure instruction (406ms)
```

Not only does allowing duplicate accounts do not make a whole lot of sense for
the game, but it also causes undefined behavior. If we were to build out this
program further, the program only has one chosen option and therefore can't be
compared against a second option. The game would end in a draw every time. It's
also unclear to a human whether `playerOne`'s choice should be rock or scissors,
so the program behavior is strange.

### Add rock_paper_scissors_shoot_secure instruction

Next, return to `lib.rs` and add a `rock_paper_scissors_shoot_secure`
instruction that uses the `#[account(...)]` macro to add an additional
`constraint` to check that `player_one` and `player_two` are different accounts.

```rust
#[program]
pub mod duplicate_mutable_accounts {
    use super::*;
        ...
        pub fn rock_paper_scissors_shoot_secure(
            ctx: Context<RockPaperScissorsSecure>,
            player_one_choice: RockPaperScissors,
            player_two_choice: RockPaperScissors,
        ) -> Result<()> {
            ctx.accounts.player_one.choice = Some(player_one_choice);
            ctx.accounts.player_two.choice = Some(player_two_choice);
            Ok(())
        }
}

#[derive(Accounts)]
pub struct RockPaperScissorsSecure<'info> {
    #[account(
        mut,
        constraint = player_one.key() != player_two.key()
    )]
    pub player_one: Account<'info, PlayerState>,
    #[account(mut)]
    pub player_two: Account<'info, PlayerState>,
}
```

### Test rock_paper_scissors_shoot_secure instruction

To test the `rock_paper_scissors_shoot_secure` instruction, we'll invoke the
instruction twice. First, we'll invoke the instruction using two different
player accounts to check that the instruction works as intended. Then, we'll
invoke the instruction using the `playerOne.publicKey` as both player accounts,
which we expect to fail.

```typescript
describe("duplicate-mutable-accounts", () => {
    ...
    it("Invokes secure instruction", async () => {
        await program.methods
        .rockPaperScissorsShootSecure({ rock: {} }, { scissors: {} })
        .accounts({
            playerOne: playerOne.publicKey,
            playerTwo: playerTwo.publicKey,
        })
        .rpc()

        const p1 = await program.account.playerState.fetch(playerOne.publicKey)
        const p2 = await program.account.playerState.fetch(playerTwo.publicKey)
        assert.equal(JSON.stringify(p1.choice), JSON.stringify({ rock: {} }))
        assert.equal(JSON.stringify(p2.choice), JSON.stringify({ scissors: {} }))
    })

    it("Invoke secure instruction - expect error", async () => {
        try {
        await program.methods
            .rockPaperScissorsShootSecure({ rock: {} }, { scissors: {} })
            .accounts({
                playerOne: playerOne.publicKey,
                playerTwo: playerOne.publicKey,
            })
            .rpc()
        } catch (err) {
            expect(err)
            console.log(err)
        }
    })
})
```

Run `anchor test` to see that the instruction works as intended and using the
`playerOne` account twice returns the expected error.

```bash
'Program Lo5sj2wWy4BHbe8kCSUvgdhzFbv9c6CEERfgAXusBj9 invoke [1]',
'Program log: Instruction: RockPaperScissorsShootSecure',
'Program log: AnchorError caused by account: player_one. Error Code: ConstraintRaw. Error Number: 2003. Error Message: A raw constraint was violated.',
'Program Lo5sj2wWy4BHbe8kCSUvgdhzFbv9c6CEERfgAXusBj9 consumed 3414 of 200000 compute units',
'Program Lo5sj2wWy4BHbe8kCSUvgdhzFbv9c6CEERfgAXusBj9 failed: custom program error: 0x7d3'
```

The simple constraint is all it takes to close this loophole. While somewhat
contrived, this example illustrates the odd behavior that can occur if you write
your program under the assumption that two same-typed accounts will be different
instances of an account but don't explicitly write that constraint into your
program. Always think about the behavior you're expecting from the program and
whether that is explicit.

If you want to take a look at the final solution code you can find it on the
`solution` branch of
[the repository](https://github.com/solana-developers/duplicate-mutable-accounts/tree/solution).

## Challenge

Just as with other lessons in this unit, your opportunity to practice avoiding
this security exploit lies in auditing your own or other programs.

Take some time to review at least one program and ensure that any instructions
with two same-typed mutable accounts are properly constrained to avoid
duplicates.

Remember, if you find a bug or exploit in somebody else's program, please alert
them! If you find one in your own program, be sure to patch it right away.

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=9b759e39-7a06-4694-ab6d-e3e7ac266ea7)!
</Callout>
