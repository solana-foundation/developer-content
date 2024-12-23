---
title: Use Token Extensions in onchain programs
objectives:
  - Accept both token programs' accounts, and mints in your program
  - Explain the differences between the Token Program and Token Extension
    programs
  - Explain how to use Anchor Interfaces
description: "Use token extensions in onchain programs."
---

## Summary

- The `Token Extensions Program` is a superset of the `Token Program` with a
  different program id
- `token_program` is an Anchor account constraint allowing you to verify an
  account belongs to a specific token program
- Anchor introduced the concept of Interfaces to easily allow for programs to
  support interaction with both `Token Program` and `Token Extensions Program`

## Overview

The `Token Extensions Program` is a program on Solana mainnet that provides
additional functionality to Solana tokens and mints. The
`Token Extensions Program` is a superset of the `Token Program`. Essentially it
is a byte for byte recreation with additional functionality tagged on at the
end. However they are sill separate programs. With two types of Token Programs,
we must anticipate being sent the program type in instructions.

In this lesson, you'll learn how to design your program to accept
`Token Program` and `Token Extensions Program` accounts using Anchor. You will
also learn how to interact with `Token Extensions Program` accounts, identifying
which token program an account belongs to, and some differences between
`Token Program` and the `Token Extensions Program` onchain.

### Difference between legacy Token Program and Token Extensions Program

We must clarify that the `Token Extensions Program` is separate from the
original `Token Program`. The `Token Extensions Program` is a superset of the
original `Token Program`, meaning all the instructions and functionality in the
original `Token Program` come with the `Token Extensions Program`.

Previously, one primary program (the `Token Program`) was in charge of creating
accounts. As more and more use cases came to Solana, there was a need for new
token functionality. Historically, only way to add new token functionality was
to create a new type of token. A new token required its own program, and any
wallet or client that wanted to use this new token had to add specific logic to
support it. Fortunately the headache of supporting different types of tokens,
made this option not very popular. However, new functionality was still very
much needed, and the `Token Extensions Program` was built to address this.

As mentioned before, the `Token Extensions Program` is a strict superset of the
original token program and comes with all the previous functionality. The
`Token Extensions Program` development team chose this approach to ensure
minimal disruption to users, wallets, and dApps while adding new functionality.
The `Token Extensions Program` supports the same instruction set as the Token
program and is the same byte-for-byte throughout the very last instruction,
allowing existing programs to support `Token Extensions` out of the box. However
this does not mean that `Token Extensions Program` tokens and `Token Program`
tokens are interoperable - they are not. We'll have to handle each separately.

### How to determine which program owns a particular token

With Anchor managing the two different token programs is pretty straight
forward. Now when we work with tokens within our programs we'll check the
`token_program` constraint.

The two token programs `ID` are as follows:

```rust
use spl_token::ID; // Token Program
use anchor_spl::token_2022::ID; // Token Extensions Program
```

To check for the regular `Token Program` you'd use the following:

```rust
use spl_token::ID;

// verify given token/mint accounts belong to the spl-token program
#[account(
    mint::token_program = ID,
)]
pub token_a_mint: Box>,
#[account(
    token::token_program = ID,
)]
pub token_a_account: Box>,
```

You can do the same thing for the `Token Extensions Program`, just with a
different ID.

```rust
use anchor_spl::token_2022::ID;

// verify given token/mint accounts belong to the Token Extension program
#[account(
    mint::token_program = ID,
)]
pub token_a_mint: Box>,
#[account(
    token::token_program = ID,
)]
pub token_a_account: Box>,
```

If a client passed in the wrong token program account, the instruction would
fail. However, this raises a problem, what if we want to support both
`Token Program` and `Token Extensions Program`? If we hardcode the check for the
program `ID`, we'd need twice as many instructions. Fortunately, you can verify
that the token accounts passed into your program belong to a particular token
program. You would do this similarly to the previous examples. Instead of
passing in the static `ID` of the token program, you check the given
`token_program`.

```rust
// verify the given token and mint accounts match the given token_program
#[account(
    mint::token_program = token_program,
)]
pub token_a_mint: Box>,
#[account(
    token::token_program = token_program,
)]
pub token_a_account: Box>,
pub token_program: Interface<'info, token_interface::TokenInterface>,
```

You can do the same thing with an associated token account by supplying a
specific token program.

```rust
#[account(
    associated_token::token_program = token_program
)]
pub associated_token: Box>,
pub token_program: Interface<'info, token_interface::TokenInterface>,
```

If you'd like to check which token program a token account and mint belongs to
in your program logic, you can refer to the owner field on the `AccountInfo`
struct. The following code will log the owning program's ID. You could use this
field in a conditional to execute different logic for `spl-token` and
`Token Extensions Program` accounts.

```rust
msg!("Token Program Owner: {}", ctx.accounts.token_account.to_account_info().owner);
```

### Anchor Interfaces

Interfaces are Anchor's newest feature that simplifies working with
`Token Extensions` in a program. There are two relevant interface wrapper types
from the `anchor_lang` crate:

- [`Interface`](https://docs.rs/anchor-lang/latest/anchor_lang/accounts/interface/index.html)
- [`InterfaceAccount`](https://docs.rs/anchor-lang/latest/anchor_lang/accounts/interface_account/index.html)

And three corresponding Account Types from the `anchor_spl` crate:

- [`Mint`](https://docs.rs/anchor-spl/latest/anchor_spl/token_interface/struct.Mint.html)
- [`TokenAccount`](https://docs.rs/anchor-spl/latest/anchor_spl/token_interface/struct.TokenAccount.html)
- [`TokenInterface`](https://docs.rs/anchor-spl/latest/anchor_spl/token_interface/struct.TokenInterface.html)

In the previous section, we defined the `token_program` in our example as:

```rust
pub token_program: Interface<'info, token_interface::TokenInterface>,
```

This code makes use of `Interface` and `token_interface::TokenInterface`.

`Interface` is a wrapper over the original `Program` type, allowing multiple
possible program IDs. It's a type validating that the account is one of a set of
given programs. The `Interface` type checks the following:

- If the given account is executable
- If the given account is one of a set of expected accounts from the given
  interface type

You must use the `Interface` wrapper with a specific interface type. The
`anchor_lang` and `anchor_spl` crates provide the following `Interface` type of
out the box:

- [TokenInterface](https://docs.rs/anchor-spl/latest/anchor_spl/token_interface/struct.TokenInterface.html)

`TokenInterface` provides an interface type that expects the pubkey of the
account passed in to match either `spl_token::ID` or `spl_token_2022::ID`. These
program IDs are hard coded on the `TokenInterface` type in Anchor.

```rust
static IDS: [Pubkey; 2] = [spl_token::ID, spl_token_2022::ID];

#[derive(Clone)]
pub struct TokenInterface;

impl anchor_lang::Ids for TokenInterface {
    fn ids() -> &'static [Pubkey] {
        &IDS
    }
}
```

Anchor checks that the ID of the account passed in matches one of the two IDs
above. If the given account does not match either of these two, Anchor will
throw an `InvalidProgramId` error and prevent the transaction from executing.

```rust
impl<T: Ids> CheckId for T {
    fn check_id(id: &Pubkey) -> Result<()> {
        if !Self::ids().contains(id) {
            Err(error::Error::from(error::ErrorCode::InvalidProgramId).with_account_name(*id))
        } else {
            Ok(())
        }
    }
}

.
.
.

impl<'a, T: CheckId> TryFrom<&'a AccountInfo<'a>> for Interface<'a, T> {
    type Error = Error;
    /// Deserializes the given `info` into a `Program`.
    fn try_from(info: &'a AccountInfo<'a>) -> Result<Self> {
        T::check_id(info.key)?;
        if !info.executable {
            return Err(ErrorCode::InvalidProgramExecutable.into());
        }
        Ok(Self::new(info))
    }
}
```

The `InterfaceAccount` type is similar to the `Interface` type in that it is
also a wrapper, this time around `AccountInfo`. `InterfaceAccount` is used on
accounts; it verifies program ownership and deserializes the underlying data
into a Rust type. This lesson will focus on using the `InterfaceAccount` on
token and mint accounts. We can use the `InterfaceAccount` wrapper with the
`Mint` or `TokenAccount` types from the `anchor_spl::token_interface` crate we
mentioned. Here is an example:

```rust
use {
    anchor_lang::prelude::*,
    anchor_spl::{token_interface},
};

#[derive(Accounts)]
pub struct Example<'info>{
    // Token account
    #[account(
        token::token_program = token_program
    )]
    pub token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    // Mint account
    #[account(
        mut,
        mint::token_program = token_program
    )]
    pub mint_account: InterfaceAccount<'info, token_interface::Mint>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
}
```

If you're familiar with Anchor, then you may notice the `TokenAccount` and
`Mint` account types are not new. Although what is new is how they work with the
`InterfaceAccount` wrapper. The `InterfaceAccount` wrapper allows for either
`Token Program` or `Token Extensions Program` accounts to be passed in and
deserialized, just like the `Interface` and the `TokenInterface` types. These
wrappers and account types work together to provide a smooth and
straight-forward experience for developers, giving you the flexibility to
interact with both `Token Program` and the `Token Extensions Program` in your
program.

However, you cannot use any of these types from the `token_interface` module
with the regular Anchor `Program` and `Account` wrappers. These new types are
used with either the `Interface` or `InterfaceAccount` wrappers. For example,
the following would not be valid, and any transactions sent to an instruction
using this account deserialization would return an error.

```rust
// This is invalid, using as an example.
// Cannot wrap Account over a token_interface::* type.
pub token_account: Account<'info, token_interface::TokenAccount>
```

## Lab

Now let's get some hands-on experience with the `Token Extensions Program`
onchain by implementing a generalized token staking program that will accept
both `Token Program` and `Token Extensions Program` accounts. As far as staking
programs go, this will be a simple implementation with the following design:

- We'll create a stake pool account to hold all the staked tokens. There will
  only be one staking pool for a given token. The program will own the account.
- Every stake pool will have a state account that will hold information
  regarding the amount of tokens staked in the pool, etc.
- Users can stake as many tokens as they like, transferring them from their
  token account to the stake pool.
- Each user will have a state account created for each pool they stake in. This
  state account will keep track of how many tokens they have staked in this
  pool, when they last staked, etc.
- Users will be minted staking reward tokens upon unstaking. There is no
  separate claim process required.
- We'll determine a user's staking rewards using a simple algorithm.
- The program will accept both `Token Program` and `Token Extensions Program`
  accounts.

The program will have four instructions: `init_pool`, `init_stake_entry`,
`stake`, `unstake`.

This lab will utilize a lot of Anchor and Solana APIs that have been covered
previously in this course. We will not spend time explaining some of the
concepts we expect you to know. With that said, let's get started.

#### 1. Verify Solana/Anchor/Rust Versions

We will be interacting with the `Token Extension` program in this lab and that
requires you have solana cli version ≥ `1.18.0`.

To check your version run:

```bash
solana --version
```

If the version printed out after running `solana --version` is less than
`1.18.0` then you can update the
[cli version manually](/docs/intro/installation.md). Note, at the time of
writing this, you cannot simply run the `solana-install update` command. This
command will not update the CLI to the correct version for us, so we have to
explicitly download version `1.18.0`. You can do so with the following command:

```bash
solana-install init 1.18.0
```

If you run into the following error at any point attempting to build the
program, that likely means you do not have the correct version of the Solana CLI
installed.

```bash
anchor build
error: package `solana-program v1.18.0` cannot be built because it requires rustc 1.72.0 or newer, while the currently active rustc version is 1.68.0-dev
Either upgrade to rustc 1.72.0 or newer, or use
cargo update -p solana-program@1.18.0 --precise ver
where `ver` is the latest version of `solana-program` supporting rustc 1.68.0-dev
```

You will also want the latest version of the Anchor CLI installed. You can
follow along the steps listed here to update via avm
https://www.anchor-lang.com/docs/avm or simply run:

```bash
avm install latest
avm use latest
```

At the time of writing, the latest version of the Anchor CLI is `0.29.0`

Now, we can check our Rust version.

```bash
rustc --version
```

At the time of writing, version `1.26.0` was used for the Rust compiler. If you
would like to update, you can do so via `rustup`
https://doc.rust-lang.org/book/ch01-01-installation.html

```bash
rustup update
```

Now, we should have all the correct versions installed.

#### 2. Get starter code and add dependencies

Let's grab the starter branch.

```bash
git clone https://github.com/Unboxed-Software/token22-staking
cd token22-staking
git checkout starter
```

#### 3. Update Program ID and Anchor Keypair

Once in the starter branch, run `anchor keys list` to get your program ID.

Copy and paste this program ID in the `Anchor.toml` file:

```rust
// in Anchor.toml
[programs.localnet]
token_22_staking = "<YOUR-PROGRAM-ID-HERE>"
```

And in the `programs/token-22-staking/src/lib.rs` file:

```rust
declare_id!("<YOUR-PROGRAM-ID-HERE>");
```

Lastly set your developer keypair path in `Anchor.toml`.

```toml
[provider]
cluster = "Localnet"
wallet = "/YOUR/PATH/HERE/id.json"
```

If you don't know what your current keypair path is you can always run the
Solana cli to find out.

```bash
solana config get
```

#### 4. Confirm the program builds

Let's build the starter code to confirm we have everything configured correctly.
If it does not build, please revisit the steps above.

```bash
anchor build
```

You can safely ignore the warnings of the build script, these will go away as we
add in the necessary code.

Feel free to run the provided tests to make sure the rest of the development
environment is set up correctly. You'll have to install the node dependencies
using `npm` or `yarn`. The tests should run, but they'll all fail until we have
completed our program.

```bash
yarn install
anchor test
```

#### 5. Explore program design

Now that we have confirmed the program builds, let's take a look at the layout
of the program. You'll notice inside `/programs/token22-staking/src` there are a
few different files:

- `lib.rs`
- `error.rs`
- `state.rs`
- `utils.rs`

The `errors.rs` and `utils.rs` files are already filled out for you. `errors.rs`
is where we have defined our custom errors for our program. To do this, you just
have to create a public `enum` and define each error.

`utils.rs` is a file that only contains one function called
`check_token_program`. This is just a file where you can write helper functions
if you have the need. This function was written ahead of time and will be used
in our program to simply log the specific token program that was passed in the
instruction. We will be using both `Token Extensions Program` and `spl-token` in
this program, so this function will help clarify that distinction.

`lib.rs` is the entrypoint to our program, as is the common practice in all
Solana programs. Here we define our program ID using the `declare_id` Anchor
macro and the public `token_22_staking` module. This module is where we define
our publicly callable instructions, these can be thought of as our program's
API.

We have four separate instructions defined here:

- `init_pool`
- `init_stake_entry`
- `stake`
- `unstake`

Each of these instructions makes a call to a `handler` method that is defined
elsewhere. We do this to modularize the program, which helps keep the program
organized. This is generally a good idea when working with larger programs.

Each of these specific `handler` methods are defined in their own file in the
`instructions` directory. You'll notice there is a file corresponding to each
instruction, as well as an additional `mod.rs` file. Each of these instruction
files is where we will write the logic for each individual instruction. The
`mod.rs` file is what makes these `handler` methods callable from the `lib.rs`
file.

#### 6. Implement `state.rs`

Open up the `/src/state.rs` file. Here, we will define some state data
structures and a few constants that we will need throughout our program. Let's
start by bringing in the packages we'll need here.

```rust
use {
    anchor_lang::prelude::*,
    solana_program::{pubkey::Pubkey},
};
```

Next, we we will need a handful of seeds defined that will be referenced
throughout the program. These seeds will be used to derive different PDAs our
program will expect to receive.

```rust
pub const STAKE_POOL_STATE_SEED: &str = "state";
pub const VAULT_SEED: &str = "vault";
pub const VAULT_AUTH_SEED: &str = "vault_authority";
pub const STAKE_ENTRY_SEED: &str = "stake_entry";
```

Now, we'll define two data structs that will define the data of two different
accounts our program will use to hold state. The `PoolState` and `StakeEntry`
accounts.

The `PoolState` account is meant to hold information about a specific staking
pool.

```rust
#[account]
pub struct PoolState {
    pub bump: u8,
    pub amount: u64,
    pub token_mint: Pubkey,
    pub staking_token_mint: Pubkey,
    pub staking_token_mint_bump: u8,
    pub vault_bump: u8,
    pub vault_auth_bump: u8,
    pub vault_authority: Pubkey,
}
```

The `StakeEntry` account will hold information about a specific user's stake in
that pool.

```rust
#[account]
pub struct StakeEntry {
    pub user: Pubkey,
    pub user_stake_token_account: Pubkey,
    pub bump: u8,
    pub balance: u64,
    pub last_staked: i64,
}
```

#### 7. `init_pool` Instruction

Now that we understand our program's architecture, let's get started with the
first instruction `init_pool`.

Open `init_pool.rs` and you should see the following:

```rust
use {
    anchor_lang::prelude::*,
    crate::{state::*, utils::*},
    anchor_spl::{token_interface},
    std::mem::size_of
};

pub fn handler(ctx: Context<InitializePool>) -> Result <()> {
    check_token_program(ctx.accounts.token_program.key());

    Ok(())
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    pub token_program: Interface<'info, token_interface::TokenInterface>,
}
```

The `handler` method is defined and so is the `InitializePool` accounts struct.
The accounts struct simply expects to receive a `token_program` account and
that's it. The `handler` method calls the `check_token_program` method that is
defined in the `utils.rs` file. As it stands, this instruction does not really
do a whole lot.

To get started implementing the logic of this instruction, let's first think
about the accounts that will be required. We will need the following to
initialize a staking pool:

- `pool_authority` - PDA that is the authority over all staking pools. This will
  be a PDA derived with a specific seed.
- `pool_state` - State account created in this instruction at a PDA. This
  account will hold state regarding this specific staking pool like the amount
  of tokens staked, how many users have staked, etc.
- `token_mint` - The mint of tokens expected to be staked in this staking pool.
  There will be a unique staking pool for each token.
- `token_vault` - Token account of the same mint as `token_mint` at a PDA. This
  is a token account with the `pool_authority` PDA as the authority. This gives
  the program control over the token account. All tokens staked in this pool
  will be held in this token account.
- `staking_token_mint` - The reward token mint for staking in this pool.
- `payer` - Account responsible for paying for the creation of the staking pool.
- `token_program` - The token program associated with the given token and mint
  accounts. Should work for either the Token Extension or the Token program.
- `system_program` - System program.
- `rent` - Rent program.

Let's implement this accounts struct starting with the `pool_authority` account
and its constraints.

The `pool_authority` account is a PDA derived with the `VAULT_AUTH_SEED` that we
defined in the `state.rs` file. This account does not hold any state, so we do
not need to deserialize it into any specific account structure. For this reason,
we use the `UncheckedAccount` Anchor account type.

```rust
#[derive(Accounts)]
pub struct InitializePool<'info> {
    /// CHECK: PDA, auth over all token vaults
    #[account(
        seeds = [VAULT_AUTH_SEED.as_bytes()],
        bump
    )]
    pub pool_authority: UncheckedAccount<'info>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
}
```

Note that the `UncheckedAccount` is considered unsafe by Anchor because Anchor
does not do any additional verification under the hood. However, this is okay
here because we do verify that the account is the expected PDA and we do not
read or write from the account. However, the `/// CHECK:` comment is required
above an account utilizing the `UncheckedAccount` or `AccountInfo` structs.
Without that annotation, your program will throw the following error while
building:

```bash
Struct field "pool_authority" is unsafe, but is not documented.
Please add a `/// CHECK:` doc comment explaining why no checks through types are necessary.
See https://www.anchor-lang.com/docs/the-accounts-struct#safety-checks for more information.
```

Next, we'll define the `pool_state` account.

This account utilizes the `init` constraint, which indicates to Anchor that we
need to create the account. The account is expected to be a PDA derived with the
`token_mint` account key and `STAKE_POOL_STATE_SEED` as keys. `payer` is
required to pay the rent required to create this account. We allocate enough
space for the account to store the `PoolState` data struct that we defined in
the `state.rs` file. Lastly, we use the `Account` wrapper to deserialize the
given account into the `PoolState` struct.

```rust
// pool state account
#[account(
    init,
    seeds = [token_mint.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
    bump,
    payer = payer,
    space = 8 + size_of::<PoolState>()
)]
pub pool_state: Account<'info, PoolState>,
```

Moving on to the `token_mint` account.

We make use of two account constraints on this `token_mint` account.
`mint::token_program = <token_program>` verifies that the given account is a
mint created from the given `<token_program>`. Before the Token Extensions
Program, this was not really a concern as there was only one token program. Now,
there are two! The reason we verify the `token_mint` account belongs to the
given `token_program` is because token accounts and mints of one program are not
compatible with token accounts and mints from the other program. So, for every
instruction in our program, we will be verifying that all the given token
accounts and mints belong to the same `token_program`.

The second constraint `mint::authority = payer` verifies that the authority over
the mint passed in is the `payer` account, which will also be required to be a
signer. This may seem counterintuitive, but we do this because at the moment we
are inherently restricting the program to one staking pool per token due to the
PDA seeds we use for the `pool_state` account. We also allow the creator of the
pool to define what the reward token mint is for staking in that pool. Because
the program currently limits one pool per token, we wouldn't want to allow just
anybody to create a staking pool for a token. This gives the creator of the pool
control over what the reward is for staking here. Imagine if we did not require
the `mint::authority`, this would allow anyone to create the staking pool for
`Token X` and define what the reward is for everyone that stakes `Token X` with
this staking program. If they decide to define the reward token as the meme coin
`FooBar`, then everyone would be stuck with that staking pool in this program.
For this reason, we will only allow the `token_mint` authority to create a
staking pool for said `token_mint`. This program design would probably not be a
good choice for the real world, it does not scale very well. But, it serves as a
great example to help get the points across in this lesson while keeping things
relatively simple. This can also serve as a good exercise in program design. How
would you design this program to make it more scalable for mainnet?

Lastly, we utilize the `InterfaceAccount` struct to deserialize the given
account into `token_interface::Mint`. The `InterfaceAccount` type is a wrapper
around `AccountInfo` that verifies program ownership and deserializes underlying
data into a given Rust type. Used with the `token_interface::Mint` struct,
Anchor knows to deserialize this into a Mint account. The
`token_interface::Mint` struct provides support for both `Token Program` and
`Token Extensions Program` mints out of the box! This interface concept was
created specifically for this use case. You can read more about the
`InterfaceAccount` in the
[`anchor_lang` docs](https://docs.rs/anchor-lang/latest/anchor_lang/accounts/interface_account/struct.InterfaceAccount.html).

```rust
// Mint of token
#[account(
    mint::token_program = token_program,
    mint::authority = payer
)]
pub token_mint: InterfaceAccount<'info, token_interface::Mint>,
```

Looking at the `pool_token_vault` where the tokens staked in this pool will be
held.

We initialize the token account with the `init` constraint, create the token
account with mint = `token_mint`, authority = `pool_authority`, and
`token_program`. This token account is created at a PDA using the `token_mint`,
`pool_authority`, and `VAULT_SEED` as seeds. `pool_authority` is assigned as
authority over this token account so that the program has control over it.

```rust
// pool token account for Token Mint
    #[account(
        init,
        token::mint = token_mint,
        token::authority = pool_authority,
        token::token_program = token_program,
        // use token_mint, pool auth, and constant as seeds for token a vault
        seeds = [token_mint.key().as_ref(), pool_authority.key().as_ref(), VAULT_SEED.as_bytes()],
        bump,
        payer = payer,
    )]
    pub token_vault: InterfaceAccount<'info, token_interface::TokenAccount>,
```

Moving on to `staking_token_mint`

We just verify the mint belongs to the given `token_program`. Again, we are
using `InterfaceAccount` and `token_interface::Mint` here.

```rust
// Mint of staking token
#[account(
    mut,
    mint::token_program = token_program
)]
pub staking_token_mint: InterfaceAccount<'info, token_interface::Mint>,
```

Lastly, we have a few familiar accounts.

```rust
// payer, will pay for creation of pool vault
#[account(mut)]
pub payer: Signer<'info>,
pub token_program: Interface<'info, token_interface::TokenInterface>,
pub system_program: Program<'info, System>,
pub rent: Sysvar<'info, Rent>
```

Take a look at the `token_program`. This account uses the `Interface` and
`token_interface::TokenInterface` structs similar to the `TokenInterface` and
mint/token structs we used earlier. This follows the same idea as those, the
`Interface` and `token_interface::TokenInterface` structs allow for either token
program to be passed in here. This is why we must verify that all of the token
and mint accounts passed in belong to the given `token_program`.

Our accounts struct should look like this now:

```rust
#[derive(Accounts)]
pub struct InitializePool<'info> {
    /// CHECK: PDA, auth over all token vaults
    #[account(
        seeds = [VAULT_AUTH_SEED.as_bytes()],
        bump
    )]
    pub pool_authority: UncheckedAccount<'info>,
    // pool state account
    #[account(
        init,
        seeds = [token_mint.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump,
        payer = payer,
        space = 8 + size_of::<PoolState>()
    )]
    pub pool_state: Account<'info, PoolState>,
    // Mint of token
    #[account(
        mint::token_program = token_program,
        mint::authority = payer
    )]
    pub token_mint: InterfaceAccount<'info, token_interface::Mint>,
    // pool token account for Token Mint
    #[account(
        init,
        token::mint = token_mint,
        token::authority = pool_authority,
        token::token_program = token_program,
        // use token_mint, pool auth, and constant as seeds for token a vault
        seeds = [token_mint.key().as_ref(), pool_authority.key().as_ref(), VAULT_SEED.as_bytes()],
        bump,
        payer = payer,
    )]
    pub token_vault: InterfaceAccount<'info, token_interface::TokenAccount>,
    // Mint of staking token
    #[account(
        mut,
        mint::token_program = token_program
    )]
    pub staking_token_mint: InterfaceAccount<'info, token_interface::Mint>,
    // payer, will pay for creation of pool vault
    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}
```

Setting up the account struct is the bulk of the logic for this instruction. All
we have to do inside the `handler` function, is to initialize all of the
`pool_state` fields.

The `handler` function should be:

```rust
pub fn handler(ctx: Context<InitializePool>) -> Result <()> {
    check_token_program(ctx.accounts.token_program.key());

    // initialize pool state
    let pool_state = &mut ctx.accounts.pool_state;
    pool_state.bump = ctx.bumps.pool_state;
    pool_state.amount = 0;
    pool_state.vault_bump = ctx.bumps.token_vault;
    pool_state.vault_auth_bump = ctx.bumps.pool_authority;
    pool_state.token_mint = ctx.accounts.token_mint.key();
    pool_state.staking_token_mint = ctx.accounts.staking_token_mint.key();
    pool_state.vault_authority = ctx.accounts.pool_authority.key();

    msg!("Staking pool created!");

    Ok(())
}
```

After that, save your work and build to make sure there are no issues with your
program at this point.

```bash
anchor build
```

#### 8. `init_stake_entry` Instruction

Now we can move on to the `init_stake_entry.rs` file. This instruction creates a
staking account for a user to keep track of some state while they stake their
tokens. The `StakeEntry` account is required to exist before a user can stake
tokens. The `StakeEntry` account struct was defined in the `state.rs` file
earlier.

Let's get started with the accounts required for this instruction. We will need
the following:

- `user` - The user that is creating the `stake_entry` account. This account
  must sign the transaction and will need to pay for the rent required to create
  the `stake_entry` account.
- `user_stake_entry` - State account that will be created at a PDA derived from
  the user, mint the staking pool was created for, and the `STAKE_ENTRY_SEED` as
  seeds.
- `user_stake_token_account` - User's associated token account for the staking
  reward token.
- `staking_token_mint` - Mint of the staking reward token of this pool.
- `pool_state` - `PoolState` account for this staking pool.
- `token_program` - Token Program.
- `associated_token_program` - Associated token program.
- `system_program` - System Program.

Let's start by adding in the `user` account to the `InitializeStakeEntry`
account struct.

It's necessary to verify that the user account has the authority to sign,
indicating ownership, and is also changeable, as they are the payer of the
transaction (which will mutate their balance).

```rust
#[derive(Accounts)]
pub struct InitializeStakeEntry<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
}
```

The `user_stake_entry` account requires a few more constraints. We need to
initialize the account, derive the address using the expected seeds, define who
is paying for the creation of the account, and allocate enough space for the
`StakeEntry` data struct. We deserialize the given account into the `StakeEntry`
account.

```rust
#[account(
    init,
    seeds = [user.key().as_ref(), pool_state.token_mint.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
    bump,
    payer = user,
    space = 8 + size_of::<StakeEntry>()
)]
pub user_stake_entry: Account<'info, StakeEntry>,
```

The `user_stake_token_account` is, again, the account where the user's staking
rewards will eventually be sent. We create the account in this instruction so we
don't have to worry about it later on when it's time to dole out the staking
rewards. Because we initialize this account in this instruction, it puts a limit
on the number of pools a user can stake in with the same reward token. This
current design would prevent a user from creating another `user_stake_entry`
account for another pool with the same `staking_token_mint`. This is another
design choice that probably would not scale in production. Think about how else
this could be designed.

We use some similar Anchor SPL constraints as in the previous instruction, this
time targeting the associated token program. With the `init` constraint, these
tell Anchor what mint, authority, and token program to use while initializing
this associated token account.

```rust
#[account(
    init,
    associated_token::mint = staking_token_mint,
    associated_token::authority = user,
    associated_token::token_program = token_program,
    payer = user,
)]
pub user_stake_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
```

<Callout type="note">We are using the `InterfaceAccount` and
`token_interface::TokenAccount` types here. The `token_interface::TokenAccount`
type can only be used in conjunction with `InterfaceAccount`.</Callout>

Next, we add the `staking_token_mint` account. Notice we are using our first
custom error here. This constraint verifies that the pubkey on the
`staking_token_mint` account is equal to the pubkey stored in the
`staking_token_mint` field of the given `PoolState` account. This field was
initialized in the `handler` method of the `inti_pool` instruction in the
previous step.

```rust
#[account(
    constraint = staking_token_mint.key() == pool_state.staking_token_mint
    @ StakeError::InvalidStakingTokenMint,
    mint::token_program = token_program
)]
pub staking_token_mint: InterfaceAccount<'info, token_interface::Mint>,
```

The `pool_state` account is pretty much the same here as in the `init_pool`
instruction. However, in the `init_pool` instruction we saved the bump used to
derive this account so we don't actually have to re-calculate it every time we
want to verify the PDA. We can conveniently call `bump = pool_state.bump` and
this will use the bump stored in this account.

```rust
#[account(
        seeds = [pool_state.token_mint.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool_state.bump
    )]
    pub pool_state: Account<'info, PoolState>,
```

The remaining accounts are ones that we are familiar with already and there are
not any special constraints on them.

```rust
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>
```

The final `InitializeStakeEntry` account struct should be:

```rust
#[derive(Accounts)]
pub struct InitializeStakeEntry<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        seeds = [user.key().as_ref(), pool_state.token_mint.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
        bump,
        payer = user,
        space = 8 + size_of::<StakeEntry>()
    )]
    pub user_stake_entry: Account<'info, StakeEntry>,
    #[account(
        init,
        associated_token::mint = staking_token_mint,
        associated_token::authority = user,
        associated_token::token_program = token_program,
        payer = user,
    )]
    pub user_stake_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    #[account(
        constraint = staking_token_mint.key() == pool_state.staking_token_mint
        @ StakeError::InvalidStakingTokenMint,
        mint::token_program = token_program
    )]
    pub staking_token_mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        seeds = [pool_state.token_mint.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool_state.bump
    )]
    pub pool_state: Account<'info, PoolState>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>
}
```

The `handler` method is also very straight-forward in this instruction. All we
need to is initialize the state of the newly created `user_stake_entry` account.

```rust
pub fn handler(ctx: Context<InitializeStakeEntry>) -> Result<()> {
    check_token_program(ctx.accounts.token_program.key());

    // initialize user stake entry state
    let user_entry = &mut ctx.accounts.user_stake_entry;
    user_entry.user = ctx.accounts.user.key();
    user_entry.user_stake_token_account = ctx.accounts.user_stake_token_account.key();
    user_entry.bump = ctx.bumps.user_stake_entry;
    user_entry.balance = 0;

    Ok(())
}
```

Save your work and build to verify there are no compilation errors.

```bash
anchor build
```

#### 9. `stake` Instruction

The `stake` instruction is what is called when users actually want to stake
their tokens. This instruction should transfer the amount of tokens the user
wants to stake from their token account to the pool vault account that is owned
by the program. There's a lot of validation in this instruction to prevent any
potentially malicious transactions from succeeding.

The accounts required are:

- `pool_state` - State account of the staking pool.
- `token_mint` - Mint of the token being staked. This is required for the
  transfer.
- `pool_authority` - PDA given authority over all staking pools.
- `token_vault` - Token vault account where the tokens staked in this pool are
  held.
- `user` - User attempting to stake tokens.
- `user_token_account` - User owned token account where the tokens they would
  like to stake will be transferred from.
- `user_stake_entry` - User `StakeEntry` account created in the previous
  instruction
- `token_program`
- `system_program`

Again, let's build the `Stake` account struct first.

First taking a look at the `pool_state` account. This is the same account we
have used in previous instructions, derived with the same seeds and bump.

```rust
#[derive(Accounts)]
pub struct Stake<'info> {
    // pool state account
    #[account(
        mut,
        seeds = [token_mint.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool_state.bump,
    )]
    pub pool_state: Account<'info, PoolState>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
}
```

Next, is the `token_mint` which is required for the transfer CPI in this
instruction. This is the mint of the token that is being staked. We verify that
the given mint is of the given `token_program` to make sure we are not mixing
any `spl-token` and `Token Extensions Program` accounts.

```rust
// Mint of token to stake
#[account(
    mut,
    mint::token_program = token_program
)]
pub token_mint: InterfaceAccount<'info, token_interface::Mint>,
```

The `pool_authority` account is again the PDA that is the authority over all of
the staking pools.

```rust
/// CHECK: PDA, auth over all token vaults
#[account(
    seeds = [VAULT_AUTH_SEED.as_bytes()],
    bump
)]
pub pool_authority: UncheckedAccount<'info>,
```

Now we have the `token_vault` which is where the tokens will be held while they
are staked. This account MUST be verified since this is where the tokens are
transferred to. Here, we verify the given account is the expected PDA derived
from the `token_mint`, `pool_authority`, and `VAULT_SEED` seeds. We also verify
the token account belongs to the given `token_program`. We use
`InterfaceAccount` and `token_interface::TokenAccount` here again to support
either `spl-token` or `Token Extensions Program` accounts.

```rust
// pool token account for Token Mint
#[account(
    mut,
    // use token_mint, pool auth, and constant as seeds for token a vault
    seeds = [token_mint.key().as_ref(), pool_authority.key().as_ref(), VAULT_SEED.as_bytes()],
    bump = pool_state.vault_bump,
    token::token_program = token_program
)]
pub token_vault: InterfaceAccount<'info, token_interface::TokenAccount>,
```

The `user` account is marked as mutable and must sign the transaction. They are
the ones initiating the transfer and they are the owner of the tokens being
transferred, so their signature is a requirement for the transfer to take place.

```rust
#[account(
    mut,
    constraint = user.key() == user_stake_entry.user
    @ StakeError::InvalidUser
)]
pub user: Signer<'info>,
```

<Callout type="note">We also verify that the given user is the same pubkey
stored in the given `user_stake_entry` account. If it is not, our program will
throw the `InvalidUser` custom error. </Callout>

The `user_token_account` is the token account where the tokens being transferred
to be staked should be currently held. The mint of this token account must match
the mint of the staking pool. If it does not, a custom `InvalidMint` error will
be thrown. We also verify the given token account matches the given
`token_program`.

```rust
#[account(
    mut,
    constraint = user_token_account.mint == pool_state.token_mint
    @ StakeError::InvalidMint,
    token::token_program = token_program
)]
pub user_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
```

The last three accounts are ones we are familiar with by now.

```rust
#[account(
    mut,
    seeds = [user.key().as_ref(), pool_state.token_mint.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
    bump = user_stake_entry.bump,

)]
pub user_stake_entry: Account<'info, StakeEntry>,
pub token_program: Interface<'info, token_interface::TokenInterface>,
pub system_program: Program<'info, System>
```

The full `Stake` accounts struct should look like:

```rust
#[derive(Accounts)]
pub struct Stake<'info> {
    // pool state account
    #[account(
        mut,
        seeds = [token_mint.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool_state.bump,
    )]
    pub pool_state: Account<'info, PoolState>,
    // Mint of token to stake
    #[account(
        mut,
        mint::token_program = token_program
    )]
    pub token_mint: InterfaceAccount<'info, token_interface::Mint>,
    /// CHECK: PDA, auth over all token vaults
    #[account(
        seeds = [VAULT_AUTH_SEED.as_bytes()],
        bump
    )]
    pub pool_authority: UncheckedAccount<'info>,
    // pool token account for Token Mint
    #[account(
        mut,
        // use token_mint, pool auth, and constant as seeds for token a vault
        seeds = [token_mint.key().as_ref(), pool_authority.key().as_ref(), VAULT_SEED.as_bytes()],
        bump = pool_state.vault_bump,
        token::token_program = token_program
    )]
    pub token_vault: InterfaceAccount<'info, token_interface::TokenAccount>,
    #[account(
        mut,
        constraint = user.key() == user_stake_entry.user
        @ StakeError::InvalidUser
    )]
    pub user: Signer<'info>,
    #[account(
        mut,
        constraint = user_token_account.mint == pool_state.token_mint
        @ StakeError::InvalidMint,
        token::token_program = token_program
    )]
    pub user_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    #[account(
        mut,
        seeds = [user.key().as_ref(), pool_state.token_mint.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
        bump = user_stake_entry.bump,

    )]
    pub user_stake_entry: Account<'info, StakeEntry>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub system_program: Program<'info, System>
}
```

That is it for the accounts struct. Save your work and verify your program still
compiles.

```bash
anchor build
```

Next, we are going to implement a helper function to assist with the transfer
CPI that we will have to make. We'll add the skeleton for the implementation of
a `transfer_checked_ctx` method on our `Stake` data struct. Below the `Stake`
accounts struct we just built, add the following:

```rust
impl<'info> Stake <'info> {
    // transfer_checked for Token2022
    pub fn transfer_checked_ctx(&self) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {

    }
}
```

This method takes `&self` as an argument, which gives us access to members of
the `Stake` struct inside of the method by calling `self`. This method is
expected to return a `CpiContext`,
[which is an Anchor primitive](https://docs.rs/anchor-lang/latest/anchor_lang/context/struct.CpiContext.html).

A `CpiContext` is defined as:

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

Where `T` is the accounts struct for the instruction you are invoking.

This is very similar to the `Context` object that traditional Anchor
instructions expect as input (i.e. `ctx: Context<Stake>`). This is the same
concept here, except we are defining one for a Cross-Program Invocation instead!

In our case, we will be invoking the `transfer_checked` instruction in either
token programs, hence the `transfer_checked_ctx` method name and the
`TransferChecked` type in the returned `CpiContext`. The regular `transfer`
instruction has been deprecated in the `Token Extensions Program` and it is
suggested you use `transfer_checked` going forward.

Now that we know what the goal of this method is, we can implement it! First, we
will need to define the program we will be invoking. This should be the
`token_program` that was passed into our accounts struct.

```rust
impl<'info> Stake <'info> {
    // transfer_checked for spl-token or Token2022
    pub fn transfer_checked_ctx(&self) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {
        let cpi_program = self.token_program.to_account_info();
    }
}
```

Notice how we are simply able to reference the accounts in the `Stake` data
struct by calling `self`.

Then, we need to define the accounts we'll be passing in the CPI. We can do this
via the `TransferChecked` data type, which we are importing from the
[`anchor_spl::token_2022` crate](https://docs.rs/anchor-spl/latest/anchor_spl/token_2022/struct.TransferChecked.html)
at the top of our file. This data type is defined as:

```rust
pub struct TransferChecked<'info> {
    pub from: AccountInfo<'info>,
    pub mint: AccountInfo<'info>,
    pub to: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}
```

This data type expects four different `AccountInfo` objects, all of which should
have been passed into our program. Just like with the `cpi_program`, we can
build this `TransferChecked` data struct by referencing `self` which gives us
access to all of the accounts defined in the `Stake` data structure. Note, this
is only possible because `transfer_checked_ctx` is being implemented on the
`Stake` data type with this line `impl<'info> Stake <'info>`. Without it, there
is no self to reference.

```rust
impl<'info> Stake <'info> {
    // transfer_checked for spl-token or Token2022
    pub fn transfer_checked_ctx(&self) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from: self.user_token_account.to_account_info(),
            to: self.token_vault.to_account_info(),
            authority: self.user.to_account_info(),
            mint: self.token_mint.to_account_info()
        };
    }
}
```

So we have our `cpi_program` and `cpi_accounts` defined, but this method is
supposed to return a `CpiContext` object. To do that, we simply need to pass
these two into the `CpiContext` constructor `CpiContext::new`.

```rust
impl<'info> Stake <'info> {
    // transfer_checked for Token2022
    pub fn transfer_checked_ctx(&self) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = TransferChecked {
            from: self.user_token_account.to_account_info(),
            to: self.token_vault.to_account_info(),
            authority: self.user.to_account_info(),
            mint: self.token_mint.to_account_info()
        };

        CpiContext::new(cpi_program, cpi_accounts)
    }
}
```

With this defined, we can call `transfer_checked_ctx` at any point in our
`handler` method and it will return a `CpiContext` object that we can use to
execute a CPI.

Moving on to the `handler` function, we'll need to do a couple of things here.
First, we need to use our `transfer_checked_ctx` method to create the correct
`CpiContext` and make the CPI. Then, we have some critical updates to make to
our two state accounts. As a reminder, we have two state accounts `PoolState`
and `StakeEntry`. The former holds information regarding current state of the
overall staking pool, while the latter is in charge of keeping an accurate
recording of the a specific user's stake in a pool. With that in mind, any time
there is an update to the staking pool we should be updating both the
`PoolState` and a given user's `StakeEntry` accounts in some way.

For starters, let's implement the actual CPI. Since we defined the program and
accounts required for the CPI ahead of time in the `transfer_checked_ctx()`
method, the actual CPI is very straight-forward. We'll make use of another
helper function from the `anchor_spl::token_2022` crate, specifically the
`transfer_checked` function. This is
[defined as the following](https://docs.rs/anchor-spl/latest/anchor_spl/token_2022/fn.transfer_checked.html):

```rust
pub fn transfer_checked<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, TransferChecked<'info>>,
    amount: u64,
    decimals: u8
) -> Result<()>
```

It takes three input parameters:

- `CpiContext`
- amount
- decimals

The `CpiContext` is exactly what is returned in our `transfer_checked_ctx()`
method, so for this first argument we can simply call the method with
`ctx.accounts.transfer_checked_ctx()`.

The amount is simply the amount of tokens to transfer, which our `handler`
method expects as an input parameter.

Lastly, the `decimals` argument is the amount of decimals on the token mint of
what is being transferred. This is a requirement of the transfer checked
instruction. Since the `token_mint` account is passed in, you can actually fetch
the decimals on the token mint in this instruction. Then, we just pass that in
as the third argument.

All in all, it should look something like this:

```rust
pub fn handler(ctx: Context<Stake>, stake_amount: u64) -> Result <()> {
    check_token_program(ctx.accounts.token_program.key());

    msg!("Pool initial total: {}", ctx.accounts.pool_state.amount);
    msg!("User entry initial balance: {}", ctx.accounts.user_stake_entry.balance);

    let decimals = ctx.accounts.token_mint.decimals;
    // transfer_checked for either spl-token or the Token Extension program
    transfer_checked(ctx.accounts.transfer_checked_ctx(), stake_amount, decimals)?;

    Ok(())
}
```

The `transfer_checked` method builds a `transfer_checked` instruction object and
actually invokes the program in the `CpiContext` under the hood. We are just
utilizing Anchor's wrapper over the top of this process. If you're curious,
[here is the source code](https://docs.rs/anchor-spl/latest/src/anchor_spl/token_2022.rs.html#35-61).

```rust
pub fn transfer_checked<'info>(
    ctx: CpiContext<'_, '_, '_, 'info, TransferChecked<'info>>,
    amount: u64,
    decimals: u8,
) -> Result<()> {
    let ix = spl_token_2022::instruction::transfer_checked(
        ctx.program.key,
        ctx.accounts.from.key,
        ctx.accounts.mint.key,
        ctx.accounts.to.key,
        ctx.accounts.authority.key,
        &[],
        amount,
        decimals,
    )?;
    solana_program::program::invoke_signed(
        &ix,
        &[
            ctx.accounts.from,
            ctx.accounts.mint,
            ctx.accounts.to,
            ctx.accounts.authority,
        ],
        ctx.signer_seeds,
    )
    .map_err(Into::into)
}
```

Using Anchor's `CpiContext` wrapper is much cleaner and it abstracts a lot away,
but it's important you understand what's going on under the hood.

Once the `transfer_checked` function has completed, we can start updating our
state accounts because that means the transfer has taken place. The two accounts
we'll want to update are the `pool_state` and `user_entry` accounts, which
represent the overall staking pool data and this specific user's data regarding
their stake in this pool.

Since this is the `stake` instruction and the user is transferring tokens into
the pool, both values representing the amount the user has staked and the total
amount staked in the pool should increase by the `stake_amount`.

To do this, we will deserialize the `pool_state` and `user_entry` accounts as
mutable and increase the `pool_state.amount` and `user_enry.balance` fields by
the `stake_amount` using `checked_add()`. `CheckedAdd` is a Rust feature that
allows you to safely perform mathematical operations without worrying about
buffer overflow. `checked_add()` adds two numbers, checking for overflow. If
overflow happens, `None` is returned.

Lastly, we'll also update the `user_entry.last_staked` field with the current
unix timestamp from the `Clock`. This is just meant to keep track of the most
recent time a specific user staked tokens.

Add this after `transfer_checked` and before `Ok(())` in the `handler` function.

```rust
let pool_state = &mut ctx.accounts.pool_state;
let user_entry = &mut ctx.accounts.user_stake_entry;

// update pool state amount
pool_state.amount = pool_state.amount.checked_add(stake_amount).unwrap();
msg!("Current pool stake total: {}", pool_state.amount);

// update user stake entry
user_entry.balance = user_entry.balance.checked_add(stake_amount).unwrap();
msg!("User stake balance: {}", user_entry.balance);
user_entry.last_staked = Clock::get().unwrap().unix_timestamp;
```

Now that was a lot and we covered some new stuff, so feel free to go back
through and make sure it all makes sense. Check out all of the external
resources that are linked for any of the new topics. Once you're ready to move
on, save your work and verify the program still builds!

```bash
anchor build
```

#### 10. `unstake` Instruction

Lastly, the `unstake` transaction will be pretty similar to the `stake`
transaction. We'll need to transfer tokens out of the stake pool to the user,
this is also when the user will receive their staking rewards. Their staking
rewards will be minted to the user in this same transaction.

Something to note here, we are not going to allow the user to determine how many
tokens are unstaked, we will simply unstake all of the tokens that they
currently have staked. Additionally, we are not going to implement a very
realistic algorithm to determine how many reward tokens they have accrued. We'll
simply take their stake balance and multiply by 10 to get the amount of reward
tokens to mint them. We do this again to simplify the program and remain focused
on the goal of the lesson, the `Token Extensions Program`.

The account structure will be very similar to the `stake` instruction, but there
are a few differences. We'll need:

- `pool_state`
- `token_mint`
- `pool_authority`
- `token_vault`
- `user`
- `user_token_account`
- `user_stake_entry`
- `staking_token_mint`
- `user_stake_token_account`
- `token_program`
- `system_program`

The main difference between the required accounts in `stake` and `unstake` is
that we need the `staking_token_mint` and `user_stake_token_account` for this
instruction to mint the user their staking rewards. We won't cover each account
individually because the struct is the exact same as the previous instruction,
just with the addition of these two new accounts.

First, the `staking_token_mint` account is the mint of the staking reward token.
The mint authority must be the `pool_authority` PDA so that the program has the
ability to mint tokens to users. The given `staking_token_mint` account also
must match the given `token_program`. We'll add a custom constraint verifying
that this account matches the pubkey stored in the `staking_token_mint` field of
the `pool_state` account, if not we will return the custom
`InvalidStakingTokenMint` error.

```rust
// Mint of staking token
    #[account(
        mut,
        mint::authority = pool_authority,
        mint::token_program = token_program,
        constraint = staking_token_mint.key() == pool_state.staking_token_mint
        @ StakeError::InvalidStakingTokenMint
    )]
    pub staking_token_mint: InterfaceAccount<'info, token_interface::Mint>,
```

The `user_stake_token_account` follows a similar vein. It must match the mint
`staking_token_mint`, the `user` must be the authority since these are their
staking rewards, and this account must match what we have stored on the
`user_stake_entry` account as their stake token account.

```rust
#[account(
        mut,
        token::mint = staking_token_mint,
        token::authority = user,
        token::token_program = token_program,
        constraint = user_stake_token_account.key() == user_stake_entry.user_stake_token_account
        @ StakeError::InvalidUserStakeTokenAccount
    )]
    pub user_stake_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
```

Here is what the final `Unstake` struct should look like:

```rust
#[derive(Accounts)]
pub struct Unstake<'info> {
    // pool state account
    #[account(
        mut,
        seeds = [token_mint.key().as_ref(), STAKE_POOL_STATE_SEED.as_bytes()],
        bump = pool_state.bump,
    )]
    pub pool_state: Account<'info, PoolState>,
    // Mint of token
    #[account(
        mut,
        mint::token_program = token_program
    )]
    pub token_mint: InterfaceAccount<'info, token_interface::Mint>,
    /// CHECK: PDA, auth over all token vaults
    #[account(
        seeds = [VAULT_AUTH_SEED.as_bytes()],
        bump
    )]
    pub pool_authority: UncheckedAccount<'info>,
    // pool token account for Token Mint
    #[account(
        mut,
        // use token_mint, pool auth, and constant as seeds for token a vault
        seeds = [token_mint.key().as_ref(), pool_authority.key().as_ref(), VAULT_SEED.as_bytes()],
        bump = pool_state.vault_bump,
        token::token_program = token_program
    )]
    pub token_vault: InterfaceAccount<'info, token_interface::TokenAccount>,
    // require a signature because only the user should be able to unstake their tokens
    #[account(
        mut,
        constraint = user.key() == user_stake_entry.user
        @ StakeError::InvalidUser
    )]
    pub user: Signer<'info>,
    #[account(
        mut,
        constraint = user_token_account.mint == pool_state.token_mint
        @ StakeError::InvalidMint,
        token::token_program = token_program
    )]
    pub user_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    #[account(
        mut,
        seeds = [user.key().as_ref(), pool_state.token_mint.key().as_ref(), STAKE_ENTRY_SEED.as_bytes()],
        bump = user_stake_entry.bump,

    )]
    pub user_stake_entry: Account<'info, StakeEntry>,
    // Mint of staking token
    #[account(
        mut,
        mint::authority = pool_authority,
        mint::token_program = token_program,
        constraint = staking_token_mint.key() == pool_state.staking_token_mint
        @ StakeError::InvalidStakingTokenMint
    )]
    pub staking_token_mint: InterfaceAccount<'info, token_interface::Mint>,
    #[account(
        mut,
        token::mint = staking_token_mint,
        token::authority = user,
        token::token_program = token_program,
        constraint = user_stake_token_account.key() == user_stake_entry.user_stake_token_account
        @ StakeError::InvalidUserStakeTokenAccount
    )]
    pub user_stake_token_account: InterfaceAccount<'info, token_interface::TokenAccount>,
    pub token_program: Interface<'info, token_interface::TokenInterface>,
    pub system_program: Program<'info, System>
}
```

Now, we have two different CPIs to make in this instruction - a transfer and a
mint. We are going to be using a `CpiContext` for both in this instruction as
well. There is a catch however, in the `stake` instruction we did not require a
"signature" from a PDA but in this instruction we do. So, we cannot follow the
exact same pattern as before but we can do something very similar.

Again, let's create two skeleton helper functions implemented on the `Unstake`
data struct: `transfer_checked_ctx` and `mint_to_ctx`.

```rust
impl<'info> Unstake <'info> {
    // transfer_checked for Token2022
    pub fn transfer_checked_ctx<'a>(&'a self, seeds: &'a [&[&[u8]]]) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {

    }

    // mint_to
    pub fn mint_to_ctx<'a>(&'a self, seeds: &'a [&[&[u8]]]) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {

    }
}
```

We'll work on `transfer_checked_ctx` first, the implementation of this method is
almost exactly the same as in the `stake` instruction. The main difference is
here we have two arguments: `self` and `seeds`. The second argument will be the
vector of PDA signature seeds that we would normally pass into `invoke_signed`
ourselves. Since we need to sign with a PDA, instead of calling the
`CpiContext::new` constructor, we'll call `CpiContext::new_with_signer` instead.

`new_with_signer` is defined as:

```rust
pub fn new_with_signer(
    program: AccountInfo<'info>,
    accounts: T,
    signer_seeds: &'a [&'b [&'c [u8]]]
) -> Self
```

Additionally, the `from` and `to` accounts in our `TransferChecked` struct will
be reversed from before.

```rust
// transfer_checked for spl-token or Token2022
pub fn transfer_checked_ctx<'a>(&'a self, seeds: &'a [&[&[u8]]]) -> CpiContext<'_, '_, '_, 'info, TransferChecked<'info>> {

    let cpi_program = self.token_program.to_account_info();
    let cpi_accounts = TransferChecked {
        from: self.token_vault.to_account_info(),
        to: self.user_token_account.to_account_info(),
        authority: self.pool_authority.to_account_info(),
        mint: self.token_mint.to_account_info()
    };

    CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
}
```

Check out the
[`anchor_lang` crate docs to learn more about `CpiContext`](https://docs.rs/anchor-lang/latest/anchor_lang/context/struct.CpiContext.html#method.new_with_signer).

Moving on to the `mint_to_ctx` function, we need to do the exact same thing we
just did with `transfer_checked_ctx` but target the `mint_to` instruction
instead! To do this, we'll need to use the `MintTo` struct instead of
`TransferChecked`. `MintTo` is defined as:

```rust
pub struct MintTo<'info> {
    pub mint: AccountInfo<'info>,
    pub to: AccountInfo<'info>,
    pub authority: AccountInfo<'info>,
}
```

[`anchor_spl::token_2022::MintTo` rust crate docs](https://docs.rs/anchor-spl/latest/anchor_spl/token_2022/struct.MintTo.html).

With this in mind, we can implement `mint_to_ctx` the same exact way we did
`transfer_checked_ctx`. We'll be targeting the exact same `token_program` with
this CPI, so `cpi_program` should be the same as before. We construct the
`MinTo` struct the same as we did the `TransferChecked` struct, just passing the
appropriate accounts here. The `mint` is the `staking_token_mint` because that
is the mint we will be minting to the user, `to` is the user's
`user_stake_token_account`, and `authority` is the `pool_authority` because this
PDA should have sole authority over this mint.

Lastly, the function returns a `CpiContext` object constructed using the signer
seeds passed into it.

```rust
// mint_to
pub fn mint_to_ctx<'a>(&'a self, seeds: &'a [&[&[u8]]]) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
    let cpi_program = self.token_program.to_account_info();
    let cpi_accounts = MintTo {
        mint: self.staking_token_mint.to_account_info(),
        to: self.user_stake_token_account.to_account_info(),
        authority: self.pool_authority.to_account_info()
    };

    CpiContext::new_with_signer(cpi_program, cpi_accounts, seeds)
}
```

Now we can move on to the logic of our `handler` function. This instruction will
need to update both the pool and user state accounts, transfer all of the user's
staked tokens, and mint the user their reward tokens. To get started, we are
going to log some info and determine how many tokens to transfer to the user.

We have kept track of the user's stake amount in the `user_stake_entry` account,
so we know exactly how many tokens this user has staked at this point in time.
We can fetch this amount from the `user_entry.balance` field. Then, we'll log
some information so that we can inspect this later. We'll also verify that the
amount to transfer out is _not_ greater than the amount that is stored in the
pool as an extra safety measure. If so, we will return a custom `OverdrawError`
and prevent the user from draining the pool.

```rust
pub fn handler(ctx: Context<Unstake>) -> Result <()> {
    check_token_program(ctx.accounts.token_program.key());

    let user_entry = &ctx.accounts.user_stake_entry;
    let amount = user_entry.balance;
    let decimals = ctx.accounts.token_mint.decimals;

    msg!("User stake balance: {}", user_entry.balance);
    msg!("Withdrawing all of users stake balance. Tokens to withdraw: {}", amount);
    msg!("Total staked before withdrawal: {}", ctx.accounts.pool_state.amount);

    // verify user and pool have >= requested amount of tokens staked
    if amount > ctx.accounts.pool_state.amount {
        return Err(StakeError::OverdrawError.into())
    }

    // More code to come

    Ok(())
}
```

Next, we will fetch the signer seeds needed for the PDA signature. The
`pool_authority` is what will be required to sign in these CPIs, so we use that
account's seeds.

```rust
// program signer seeds
let auth_bump = ctx.accounts.pool_state.vault_auth_bump;
let auth_seeds = &[VAULT_AUTH_SEED.as_bytes(), &[auth_bump]];
let signer = &[&auth_seeds[..]];
```

Once we have those seeds stored in the `signer` variable, we can easily pass it
into the `transfer_checked_ctx()` method. At the same time, we'll call the
`transfer_checked` helper function from the Anchor crate to acually invoke the
CPI behind the scenes.

```rust
// transfer staked tokens
transfer_checked(ctx.accounts.transfer_checked_ctx(signer), amount, decimals)?;
```

Next, we'll calculate how many reward tokens to mint the user and invoke the
`mint_to` instruction using our `mint_to_ctx` function. Remember, we are just
taking the amount of tokens the user has staked and multiplying it by 10 to get
their reward amount. This is a very simple algorithm that would not make sense
to use in production, but it works here as an example.

Notice we use `checked_mul()` here, similar to how we used `checked_add` in the
`stake` instruction. Again, this is to prevent buffer overflow.

```rust
// mint users staking rewards, 10x amount of staked tokens
let stake_rewards = amount.checked_mul(10).unwrap();

// mint rewards to user
mint_to(ctx.accounts.mint_to_ctx(signer), stake_rewards)?;
```

Lastly, we will need to update our state accounts by subtracting the amount that
was unstaked from both the pool and user's balances. We'll be using
`checked_sub()` for this.

```rust
// borrow mutable references
let pool_state = &mut ctx.accounts.pool_state;
let user_entry = &mut ctx.accounts.user_stake_entry;

// subtract transferred amount from pool total
pool_state.amount = pool_state.amount.checked_sub(amount).unwrap();
msg!("Total staked after withdrawal: {}", pool_state.amount);

// update user stake entry
user_entry.balance = user_entry.balance.checked_sub(amount).unwrap();
user_entry.last_staked = Clock::get().unwrap().unix_timestamp;
```

Putting that all together gives us our final `handler` function:

```rust
pub fn handler(ctx: Context<Unstake>) -> Result <()> {
    check_token_program(ctx.accounts.token_program.key());

    let user_entry = &ctx.accounts.user_stake_entry;
    let amount = user_entry.balance;
    let decimals = ctx.accounts.token_mint.decimals;

    msg!("User stake balance: {}", user_entry.balance);
    msg!("Withdrawing all of users stake balance. Tokens to withdraw: {}", amount);
    msg!("Total staked before withdrawal: {}", ctx.accounts.pool_state.amount);

    // verify user and pool have >= requested amount of tokens staked
    if amount > ctx.accounts.pool_state.amount {
        return Err(StakeError::OverdrawError.into())
    }

    // program signer seeds
    let auth_bump = ctx.accounts.pool_state.vault_auth_bump;
    let auth_seeds = &[VAULT_AUTH_SEED.as_bytes(), &[auth_bump]];
    let signer = &[&auth_seeds[..]];

    // transfer staked tokens
    transfer_checked(ctx.accounts.transfer_checked_ctx(signer), amount, decimals)?;

    // mint users staking rewards, 10x amount of staked tokens
    let stake_rewards = amount.checked_mul(10).unwrap();

    // mint rewards to user
    mint_to(ctx.accounts.mint_to_ctx(signer), stake_rewards)?;

    // borrow mutable references
    let pool_state = &mut ctx.accounts.pool_state;
    let user_entry = &mut ctx.accounts.user_stake_entry;

    // subtract transferred amount from pool total
    pool_state.amount = pool_state.amount.checked_sub(amount).unwrap();
    msg!("Total staked after withdrawal: {}", pool_state.amount);

    // update user stake entry
    user_entry.balance = user_entry.balance.checked_sub(amount).unwrap();
    user_entry.last_staked = Clock::get().unwrap().unix_timestamp;

    Ok(())
}
```

That is it for our staking program! There has been an entire test suite written
ahead of time for you to run against this program. Go ahead and install the
needed packages for testing and run the tests:

```bash
npm install
anchor test
```

If you run into problems feel free to checkout the
[solution branch](https://github.com/Unboxed-Software/token22-staking/tree/solution).

## Challenge

Create your own program that is Token Program and Token Extensions Program
agnostic.
