---
title: Anchor CPIs and Errors
objectives:
  - Make Cross Program Invocations (CPIs) from an Anchor program
  - Use the `cpi` feature to generate helper functions for invoking instructions
    on existing Anchor programs
  - Use `invoke` and `invoke_signed` to make CPIs where CPI helper functions are
    unavailable
  - Create and return custom Anchor errors
description: "Invoke other Solana programs from your Anchor app. "
---

## Summary

- Anchor provides a simplified way to create CPIs using a **`CpiContext`**.
- Anchor's **`cpi`** feature generates CPI helper functions for invoking
  instructions on existing Anchor programs
- If you do not have access to CPI helper functions, you can still use `invoke`
  and `invoke_signed` directly
- Use the
  [**`error_code`**](https://docs.rs/anchor-lang/latest/anchor_lang/attr.error_code.html)
  macro to define custom Anchor errors.

## Lesson

Anchor simplifies invoking other Solana programs, especially Anchor programs
with accessible crates.

In this lesson, you'll learn how to construct a Cross Program Invocation (CPI)
using Anchor. You'll also learn how to create and return custom errors, enabling
you to build more advanced and robust Anchor programs.

### Cross Program Invocations (CPIs) with Anchor

Cross Program Invocations (CPIs) allow programs to invoke instruction from other
programs using `invoke` or `invoke_signed`, enabling new programs to build on
top of existing ones (this is called composability).

While CPIs can be done directly using `invoke` or `invoke_signed`, Anchor
simplifies the process with `CpiContext`. In this lesson, you'll use the
`anchor_spl` crate to make CPIs to the SPL Token Program. You can explore more
in the
[`anchor_spl` crate documentation](https://docs.rs/anchor-spl/latest/anchor_spl/#).

#### Using CpiContext

The first step in performing a CPI is to create an instance of `CpiContext`.
[`CpiContext`](<(https://docs.rs/anchor-lang/latest/anchor_lang/context/struct.CpiContext.html)>)
is similar to `Context`, which is the first argument type required by Anchor
instruction handlers. Both are declared in the same module and share similar
functionality.

The `CpiContext` type specifies non-argument inputs for cross program
invocations:

- `accounts` - The list of accounts required for the instruction being invoked
- `remaining_accounts` - Any additional accounts not specified in the main
  accounts struct
- `program` - The program ID of the program being invoked
- `signer_seeds` - If a PDA is signing, include the seeds required to derive the
  PDA

```rust
pub struct CpiContext<'a, 'b, 'c, 'info, T>
where
    T: ToAccountMetas + ToAccountInfos<'info>,
{
    pub accounts: T,
    pub remaining_accounts: Vec<AccountInfo<'info>>,
    pub program: AccountInfo<'info>,
    pub signer_seeds: &'a [&'b [&'c [u8]]],
}
```

Use `CpiContext::new` to create a new instance when passing the original
transaction signature.

```rust
CpiContext::new(cpi_program, cpi_accounts)
```

```rust
pub fn new(
        program: AccountInfo<'info>,
        accounts: T
    ) -> Self {
    Self {
        accounts,
        program,
        remaining_accounts: Vec::new(),
        signer_seeds: &[],
    }
}
```

Use `CpiContext::new_with_signer` to create a new instance when signing on
behalf of a PDA for the CPI.

```rust
CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
```

```rust
pub fn new_with_signer(
    program: AccountInfo<'info>,
    accounts: T,
    signer_seeds: &'a [&'b [&'c [u8]]],
) -> Self {
    Self {
        accounts,
        program,
        signer_seeds,
        remaining_accounts: Vec::new(),
    }
}
```

#### CPI accounts

One key benefit of `CpiContext` is that the `accounts` argument is a generic
type, allowing you to pass any object implementing the `ToAccountMetas` and
`ToAccountInfos<'info>` traits.

These traits are added by the `#[derive(Accounts)]` attribute macro you've used
before, to specify the accounts required by your instruction handlers. You can
use also use `#[derive(Accounts)]` structs with `CpiContext`.

This helps with code organization and type safety.

#### Invoke an instruction handler on another Anchor program

When calling another Anchor program with a published crate, Anchor can generate
instruction builders and CPI helper functions for you.

To declare your program's dependency on another program, add the following to
your program's [`Cargo.toml`](https://www.anchor-lang.com/docs/manifest):

```toml
[dependencies]
callee = { path = "../callee", features = ["cpi"] }
```

By adding `features = ["cpi"]`, you enable the `cpi` feature, granting your
program access to the `callee::cpi` module.

The `cpi` module exposes `callee`'s instructions as Rust functions. Each
function takes a `CpiContext` and any additional instruction data as arguments.
These functions follow the same format as the instruction handlers in your
Anchor programs, but use `CpiContext` instead of `Context`. The `cpi` module
also exposes the account structs required for calling the instructions.

For example, if `callee` has an instruction `do_something` (which is processed
by a corresponding instruction handler in the `callee` program), and this
instruction requires the accounts defined in the `DoSomething` struct, you could
invoke the `do_something` instruction using the Anchor-generated CPI function as
follows:

```rust
use anchor_lang::prelude::*;
use callee;
...

#[program]
pub mod lootbox_program {
    use super::*;

    pub fn call_another_program(ctx: Context<CallAnotherProgram>, params: InitUserParams) -> Result<()> {
        callee::cpi::do_something(
            CpiContext::new(
                ctx.accounts.callee.to_account_info(),
                callee::DoSomething {
                    user: ctx.accounts.user.to_account_info()
                }
            )
        )
        Ok(())
    }
}
...
```

Below are the details of each phase and action description:

| Phase           | Action                                                                           |
| --------------- | -------------------------------------------------------------------------------- |
| Setup           | Add dependency in `Cargo.toml` with "cpi" feature                                |
| Code Generation | Anchor build process generates CPI helper functions                              |
| Implementation  | Your program uses the generated CPI function (e.g., `callee::cpi::do_something`) |
| Preparation     | CPI function prepares `CpiContext` and instruction data                          |
| Execution       | Solana runtime executes Cross Program Invocation                                 |
| Processing      | Callee program processes instruction in corresponding instruction handler        |
| Completion      | Result is returned to your program                                               |

#### Invoke an instruction on a non-Anchor program

When the program you're calling is _not_ an Anchor program, there are two
possible options:

1. It's possible that the program maintainers have published a crate with their
   own helper functions for calling into their program. For example, the
   `anchor_spl` crate provides helper functions that are virtually identical
   from a call-site perspective to what you would get with the `cpi` module of
   an Anchor program. E.g. you can mint using the
   [`mint_to` helper function](https://docs.rs/anchor-spl/latest/src/anchor_spl/token.rs.html#36-58)
   and use the
   [`MintTo` accounts struct](https://docs.rs/anchor-spl/latest/anchor_spl/token/struct.MintTo.html).

   ```rust
   token::mint_to(
       CpiContext::new_with_signer(
           ctx.accounts.token_program.to_account_info(),
           token::MintTo {
               mint: ctx.accounts.mint_account.to_account_info(),
               to: ctx.accounts.token_account.to_account_info(),
               authority: ctx.accounts.mint_authority.to_account_info(),
           },
           &[&[
               "mint".as_bytes(),
               &[*ctx.bumps.get("mint_authority").unwrap()],
           ]]
       ),
       amount,
   )?;
   ```

2. If there's no helper module for the program whose instructions you need to
   invoke, you can use `invoke` and `invoke_signed` directly. The source code of
   the `mint_to` helper function demonstrates using `invoke_signed` with a
   `CpiContext`. You can follow a similar pattern if you choose to use an
   accounts struct and `CpiContext` to organize and prepare your CPI.

   ```rust
   pub fn mint_to<'_program, '_accounts, '_remaining, 'info>(
    ctx: CpiContext<'_program, '_accounts, '_remaining, 'info, MintTo<'info>>,
    amount: u64,
   ) -> Result<()> {
    let instruction = spl_token::instruction::mint_to(
        &spl_token::ID,
        ctx.accounts.mint.key,
        ctx.accounts.to.key,
        ctx.accounts.authority.key,
        &[],
        amount,
    )?;
    solana_program::program::invoke_signed(
        &instruction,
        &[
            ctx.accounts.to.clone(),
            ctx.accounts.mint.clone(),
            ctx.accounts.authority.clone(),
        ],
        ctx.signer_seeds,
    )
    .map_err(Into::into)
   }
   ```

### Throw errors in Anchor

When developing programs in Anchor, it's essential to understand how to create
custom errors.

While all Solana programs ultimately return the same error type,
[`ProgramError`](https://docs.rs/solana-program/latest/solana_program/program_error/enum.ProgramError.html),
Anchor provides an abstraction called
[`AnchorError`](https://docs.rs/anchor-lang/latest/anchor_lang/error/struct.AnchorError.html).
This abstraction enriches error handling by offering additional context when a
program fails, including:

- The error's name and code
- The code location where the error was triggered
- The account that caused a constraint violation

```rust
pub struct AnchorError {
    pub error_name: String,
    pub error_code_number: u32,
    pub error_msg: String,
    pub error_origin: Option<ErrorOrigin>,
    pub compared_values: Option<ComparedValues>,
}
```

Anchor Errors can be divided into:

- **Anchor Internal Errors**: Errors returned by the framework from within its
  own code.
- **Custom Errors**: Errors that developers create.

To define custom errors for your program, use the `error_code` attribute. Apply
this attribute to a custom `enum` type, and its variants can be used as errors
in your program. You can also add error messages using the `msg` attribute,
allowing clients to display a more detailed message when an error occurs.

```rust
#[error_code]
pub enum MyError {
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

To return a custom error, use the
[`err`](https://docs.rs/anchor-lang/latest/anchor_lang/macro.err.html) or
[`error`](https://docs.rs/anchor-lang/latest/anchor_lang/prelude/macro.error.html)
macros within an instruction handler. These macros log file and line
information, which is helpful for debugging.

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        if data.data >= 100 {
            return err!(MyError::DataTooLarge);
        }
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}

#[error_code]
pub enum MyError {
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

Alternatively, use the
[`require`](https://docs.rs/anchor-lang/latest/anchor_lang/macro.require.html)
macro to simplify returning errors. The code from the previous example can be
refactored as follows:

```rust
#[program]
mod hello_anchor {
    use super::*;
    pub fn set_data(ctx: Context<SetData>, data: MyAccount) -> Result<()> {
        require!(data.data < 100, MyError::DataTooLarge);
        ctx.accounts.my_account.set_inner(data);
        Ok(())
    }
}

#[error_code]
pub enum MyError {
    #[msg("MyAccount may only hold data below 100")]
    DataTooLarge
}
```

## Lab

Let's practice the concepts we've gone over in this lesson by building on top of
the Movie Review program from previous lessons.

In this lab, we'll update the program to mint tokens to users when they submit a
new movie review.

<Steps>

### Starter

To get started, we will be using the final state of the Anchor Movie Review
program from the previous lesson. So, if you just completed that lesson then
you're all set and ready to go. If you are just jumping in here, no worries, you
can [download the starter code](https://github.com/Unboxed-Software/anchor-movie-review-program/tree/solution-pdas).
We'll be using the `solution-pdas` branch as our starting point.

### Add dependencies to Cargo.toml

Before we get started we need to enable the `init-if-needed` feature and add the
`anchor-spl` crate to the dependencies in `Cargo.toml`. If you need to brush up
on the `init-if-needed` feature take a look at the
[Anchor PDAs and Accounts lesson](/content/courses/onchain-development/anchor-pdas.md)).

```rust
[dependencies]
anchor-lang = { version = "0.30.1", features = ["init-if-needed"] }
anchor-spl = "0.30.1"
```

### Initialize reward token

Next, navigate to `lib.rs` file and implement the `InitializeMint` context type,
and list the accounts and constraints the instruction requires. Here we
initialize a new `Mint` account using a PDA with the string "mint" as a seed.
Note that we can use the same PDA for both the address of the `Mint` account and
the Mint authority. Using a PDA as the mint authority enables our program to
sign for the minting of the tokens.

To initialize the `Mint` account, we'll need to include the `token_program`,
`rent`, and `system_program` in the list of accounts.

```rust
#[derive(Accounts)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        seeds = ["mint".as_bytes()],
        bump,
        payer = user,
        mint::decimals = 6,
        mint::authority = user,
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}
```

There may be some constraints above that you haven't seen yet. Adding
`mint::decimals` and `mint::authority` along with `init` ensures that the
account is initialized as a new token mint with the appropriate decimals and
mint authority set.

Now, create an instruction handler to initialize a new token mint. This will be
the token that is minted each time a user leaves a review. Note that we don't
need to include any custom instruction logic since the initialization can be
handled entirely through Anchor constraints.

```rust
pub fn initialize_token_mint(_ctx: Context<InitializeMint>) -> Result<()> {
    msg!("Token mint initialized");
    Ok(())
}
```

### Anchor Error

Next, let's create an Anchor Error that we'll use to validate the following:

- The `rating` passed to either the `add_movie_review` or `update_movie_review`
  instruction handler.
- The `title` passed to the `add_movie_review` instruction handler.
- The `description` passed to either the `add_movie_review` or
  `update_movie_review` instruction handler.

```rust
#[error_code]
enum MovieReviewError {
    #[msg("Rating must be between 1 and 5")]
    InvalidRating,
    #[msg("Movie Title too long")]
    TitleTooLong,
    #[msg("Movie Description too long")]
    DescriptionTooLong,
}
```

### Update add_movie_review Instruction Handler

Now that we've done some setup, let's update the `add_movie_review` instruction
handler and `AddMovieReview` context type to mint tokens to the reviewer.

Next, update the `AddMovieReview` context type to add the following accounts:

- `token_program` - we'll be using the Token Program to mint tokens
- `mint` - the mint account for the tokens that we'll mint to users when they
  add a movie review
- `token_account` - the associated token account for the aforementioned `mint`
  and reviewer
- `associated_token_program` - required because we'll be using the
  `associated_token` constraint on the `token_account`

```rust
#[derive(Accounts)]
#[instruction(title: String, description: String)]
pub struct AddMovieReview<'info> {
    #[account(
        init,
        seeds=[title.as_bytes(), initializer.key().as_ref()],
        bump,
        payer = initializer,
        space = DISCRIMINATOR + MovieAccountState::INIT_SPACE
    )]
    pub movie_review: Account<'info, MovieAccountState>,
    #[account(mut)]
    pub initializer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    #[account(
        seeds = ["mint".as_bytes()],
        bump,
        mut
    )]
    pub mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = initializer,
        associated_token::mint = mint,
        associated_token::authority = initializer
    )]
    pub token_account: Account<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
```

Again, some of the above constraints may be unfamiliar to you. The
`associated_token::mint` and `associated_token::authority` constraints along
with the `init_if_needed` constraint ensures that if the account has not already
been initialized, it will be initialized as an associated token account for the
specified mint and authority. Also, the payer for the costs related to the
account initialization will be set under the constraint `payer`.

If you're unfamiliar with the `INIT_SPACE` constant used for the `movie_review`
account space allocation, please refer to the
[`solution-pdas`](https://github.com/solana-foundation/developer-content/blob/4c8eada3053061e66b907c9b49701b064544681d/content/courses/onchain-development/anchor-pdas.md?plain=1#L467)
branch that is being used as our starting point. In there, we discuss the
implementation of the `Space` trait and the `INIT_SPACE` constant.

Next, let's update the `add_movie_review` instruction to do the following:

- Check that `rating` is valid. If it is not a valid rating, return the
  `InvalidRating` error.
- Check that `title` length is valid. If it is not a valid length, return the
  `TitleTooLong` error.
- Check that `description` length is valid. If it is not a valid length, return
  the `DescriptionTooLong` error.
- Make a CPI to the token program's `mint_to` instruction using the mint
  authority PDA as a signer. Note that we'll mint 10 tokens to the user but need
  to adjust for the mint decimals by making it `10*10^6`.

Fortunately, we can use the `anchor_spl` crate to access helper functions and
types like `mint_to` and `MintTo` for constructing our CPI to the Token Program.
`mint_to` takes a `CpiContext` and integer as arguments, where the integer
represents the number of tokens to mint. `MintTo` can be used for the list of
accounts that the mint instruction needs.

Update your `use` statements to include:

```rust
use anchor_spl::token::{mint_to, MintTo, Mint, TokenAccount, Token};
use anchor_spl::associated_token::AssociatedToken;
```

Next, update the `add_movie_review` instruction handler to:

```rust
pub fn add_movie_review(
    ctx: Context<AddMovieReview>,
    title: String,
    description: String,
    rating: u8
) -> Result<()> {
    // We require that the rating is between 1 and 5
    require!(
        rating >= MIN_RATING && rating <= MAX_RATING,
        MovieReviewError::InvalidRating
    );

    // We require that the title is not longer than 20 characters
    require!(
        title.len() <= MAX_TITLE_LENGTH,
        MovieReviewError::TitleTooLong
    );

    // We require that the description is not longer than 50 characters
    require!(
        description.len() <= MAX_DESCRIPTION_LENGTH,
        MovieReviewError::DescriptionTooLong
    );

    msg!("Movie review account created");
    msg!("Title: {}", title);
    msg!("Description: {}", description);
    msg!("Rating: {}", rating);

    let movie_review = &mut ctx.accounts.movie_review;
    movie_review.reviewer = ctx.accounts.initializer.key();
    movie_review.title = title;
    movie_review.description = description;
    movie_review.rating = rating;

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                authority: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.token_account.to_account_info(),
                mint: ctx.accounts.mint.to_account_info()
            },
            &[&[
                "mint".as_bytes(),
                &[ctx.bumps.mint]
            ]]
        ),
        10*10^6
    )?;

    msg!("Minted tokens");

    Ok(())
}
```

### Update update_movie_review Instruction Handler

Here we are only adding the check that `rating` and `description` are valid.

```rust
pub fn update_movie_review(
    ctx: Context<UpdateMovieReview>,
    title: String,
    description: String,
    rating: u8
) -> Result<()> {
    // We require that the rating is between 1 and 5
    require!(
        rating >= MIN_RATING && rating <= MAX_RATING,
        MovieReviewError::InvalidRating
    );

    // We require that the description is not longer than 50 characters
    require!(
        description.len() <= MAX_DESCRIPTION_LENGTH,
        MovieReviewError::DescriptionTooLong
    );

    msg!("Movie review account space reallocated");
    msg!("Title: {}", title);
    msg!("Description: {}", description);
    msg!("Rating: {}", rating);

    let movie_review = &mut ctx.accounts.movie_review;
    movie_review.description = description;
    movie_review.rating = rating;

    Ok(())
}
```

### Test

Those are all of the changes we need to make to the program! Now, let's update
our tests.

Start by making sure your imports and `describe` function look like this:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";
import { getAssociatedTokenAddress, getAccount } from "@solana/spl-token";
import { AnchorMovieReviewProgram } from "../target/types/anchor_movie_review_program";

describe("Anchor Movie Review Program", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorMovieReviewProgram as Program<AnchorMovieReviewProgram>;

  const movie = {
    title: "Just a test movie",
    description: "Wow what a good movie it was real great",
    rating: 5,
  };

  const [moviePda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from(movie.title), provider.wallet.publicKey.toBuffer()],
    program.programId
  );

  const [mint] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    program.programId
  );
...
}
```

You can run `npm install @solana/spl-token --save-dev` if you don't have it
installed.

With that done, add a test for the `initializeTokenMint` instruction handler:

```typescript
it("initializes the reward token", async () => {
  try {
    await program.methods.initializeTokenMint().rpc();
  } catch (error) {
    console.error("Error initializing token mint:", error);
    throw error;
  }
});
```

Notice that we didn't have to add `.accounts` because they can be inferred,
including the `mint` account (assuming you have seed inference enabled).

Next, update the test for the `addMovieReview` instruction handler. The primary
additions are:

1. To get the associated token address that needs to be passed into the
   instruction as an account that cannot be inferred
2. Check at the end of the test that the associated token account has 10 tokens

```typescript
it("adds a movie review", async () => {
  try {
    await program.methods
      .addMovieReview(movie.title, movie.description, movie.rating)
      .accounts({
        tokenAccount: tokenAccount,
      })
      .rpc();

    const account = await program.account.movieAccountState.fetch(moviePda);
    expect(account.title).to.equal(movie.title);
    expect(account.rating).to.equal(movie.rating);
    expect(account.description).to.equal(movie.description);
    expect(account.reviewer.toString()).to.equal(
      provider.wallet.publicKey.toString(),
    );

    const userAta = await getAccount(provider.connection, tokenAccount);
    expect(Number(userAta.amount)).to.equal((10 * 10) ^ 6);
  } catch (error) {
    console.error("Error adding movie review:", error);
    throw error;
  }
});
```

After that, neither the test for `updateMovieReview` nor the test for
`deleteMovieReview` needs any changes.

At this point, run `anchor test` and you should see the following output

```shell
Anchor Movie Review Program
    ✔ initializes the reward token (148ms)
    ✔ adds a movie review (425ms)
    ✔ updates a movie review (429ms)
    ✔ deletes a movie review (439ms)


  4 passing (1s)
```

</Steps>

If you need more time with the concepts from this lesson or got stuck along the
way, feel free to take a look at the
[solution code](https://github.com/Unboxed-Software/anchor-movie-review-program/tree/solution-add-tokens).
Note that the solution to this lab is on the `solution-add-tokens` branch.

## Challenge

To apply what you've learned about CPIs in this lesson, think about how you
could incorporate them into the Student Intro program. You could do something
similar to what we did in the lab here and add some functionality to mint tokens
to users when they introduce themselves.

Try to do this independently if you can! But if you get stuck, feel free to
reference
this [solution code](https://github.com/Unboxed-Software/anchor-student-intro-program/tree/cpi-challenge).
Note that your code may look slightly different than the solution code depending
on your implementation.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=21375c76-b6f1-4fb6-8cc1-9ef151bc5b0a)!
</Callout>
