---
title: Cross Program Invocations
objectives:
  - Explain Cross-Program Invocations (CPIs)
  - Describe how to construct and use CPIs
  - Explain how a program provides a signature for a PDA
  - Avoid common pitfalls and troubleshoot common errors associated with CPIs
description: "Learn how to invoke functions in other Solana programs."
---

## Summary

- A **Cross-Program Invocation (CPI)** is when one program calls another,
  targeting a specific instruction in the called program.
- CPIs are performed using the commands `invoke` or `invoke_signed`, with the
  latter enabling programs to sign on behalf of Program Derived Addresses (PDAs)
  they own.
- CPIs enable Solana programs to be fully interoperable, allowing any
  instruction handler to be invoked by another program via a CPI.
- CPIs are commonly used. For example, if your program transfers tokens, it will
  perform a CPI to the Token or Token Extensions programs to execute the
  transfer.
- Since the calling program in a CPI does not have control over the accounts or
  data passed to the invoked program, it's crucial for the invoked program to
  verify all parameters. This ensures that malicious or incorrect data doesn't
  compromise program security.

## Lesson

### What is a CPI?

A **Cross-Program Invocation (CPI)** is when one program directly calls another
program's instruction, similar to how a client makes calls to programs using the
JSON RPC API. In a CPI, your program can call native programs, third-party
programs, or programs you've created. CPIs allow for seamless interaction
between programs, effectively making the entire Solana ecosystem one large API
for developers.

To invoke an instruction on another program, you need to construct the
instruction correctly. The process of creating a CPI is similar to creating
instructions on the client side, but there are important distinctions when using
`invoke` or `invoke_signed`. We'll dive into both methods later in this lesson.

### Making a Cross-Program Invocation (CPI)

To make a CPI, use either the
[`invoke`](https://docs.rs/solana-program/latest/solana_program/program/fn.invoke.html)
or
[`invoke_signed`](https://docs.rs/solana-program/latest/solana_program/program/fn.invoke_signed.html)
functions from the `solana_program` crate.

- Use `invoke` to pass through the original transaction signature that was
  submitted to your program.
- Use `invoke_signed` when your program needs to "sign" for its Program Derived
  Addresses (PDAs).

```rust
// Used when no signatures are required for PDAs
pub fn invoke(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>]
) -> ProgramResult

// Used when a program must provide a 'signature' for a PDA, utilizing the signer_seeds parameter
pub fn invoke_signed(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>],
    // An array of signing PDAs, each with an array of seeds, which are an array of `u8` bytes.
    signers_seeds: &[&[&[u8]]]
) -> ProgramResult
```

When you make a Cross-Program Invocation (CPI), the privileges of the invoking
program are extended to the invoked program. If the invoking program's
instruction handler had accounts marked as a signer or writable when calling the
invoked program, those accounts retain their signer or writable status in the
invoked program.

<Callout>

As the developer, you have full control over which accounts are passed into the
CPI. You can think of constructing a CPI as building a new instruction from
scratch, but only with the data that was passed into your program. </Callout>

#### CPI with invoke function

```rust
invoke(
    &Instruction {
        program_id: calling_program_id,
        accounts: accounts_meta,
        data,
    },
    &account_infos[account1.clone(), account2.clone(), account3.clone()],
)?;
```

- `program_id` - The public key of the program you're invoking.
- `account` - A list of account metadata as a vector. Include every account the
  invoked program will read or write.
- `data` - A byte buffer representing the data passed to the invoked program as
  a vector.

The `Instruction` struct has the following definition:

```rust
pub struct Instruction {
    pub program_id: Pubkey,
    pub accounts: Vec<AccountMeta>,
    pub data: Vec<u8>,
}
```

Depending on the program you're calling, there may be a crate available with
helper functions for creating the `Instruction` object. Many individuals and
organizations provide publicly available crates alongside their programs that
expose these functions, simplifying program interaction.

For example, in this lesson's lab, we'll be using the `spl_token` crate to
create minting instructions. In cases where no such crate is available, you'll
need to manually create the `Instruction` instance.

While the `program_id` field is straightforward, the `accounts` and `data`
fields require further explanation.

Both the `accounts` and `data` fields are of type `Vec` (vector). You can use
the [`vec`](https://doc.rust-lang.org/std/macro.vec.html) macro to construct a
vector using array notation, as shown below:

```rust
let v = vec![1, 2, 3];
assert_eq!(v[0], 1);
assert_eq!(v[1], 2);
assert_eq!(v[2], 3);
```

The `accounts` field of the `Instruction` struct expects a vector of type
[`AccountMeta`](https://docs.rs/solana-program/latest/solana_program/instruction/struct.AccountMeta.html).
The `AccountMeta` struct has the following definition:

```rust
pub struct AccountMeta {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}
```

Putting these two pieces together looks like this:

```rust
use solana_program::instruction::AccountMeta;

vec![
    AccountMeta::new(account1_pubkey, true), // metadata for a writable, signer account
    AccountMeta::read_only(account2_pubkey, false), // metadata for a read-only, non-signer account
    AccountMeta::read_only(account3_pubkey, true), // metadata for a read-only, signer account
    AccountMeta::new(account4_pubkey, false), // metadata for a writable, non-signer account
]
```

The final field of the `Instruction` object is the data, represented as a byte
buffer. In Rust, you can create this buffer by using
[`Vec::with_capacity()`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.with_capacity)
to allocate space, and then populate the vector by pushing values or extending
it with slices. This allows you to construct the byte buffer incrementally,
similar to how you would on the client side.

Determine the data required by the invoked program and the serialization format
used, then write your code to match. Feel free to read up on some of the
[features of the `vec` macro](https://doc.rust-lang.org/alloc/vec/struct.Vec.html#).

```rust
let mut vec = Vec::with_capacity(3);
vec.push(1);
vec.push(2);
vec.extend_from_slice(&number_variable.to_le_bytes());
```

The
[`extend_from_slice`](https://doc.rust-lang.org/alloc/vec/struct.Vec.html#method.extend_from_slice)
method is probably new to you. It's a method on vectors that takes a slice as
input, iterates over the slice, clones each element, and then appends it to the
`Vec`.

#### Pass a list of accounts

In addition to the instruction, both `invoke` and `invoke_signed` also require a
list of `account_info` objects. Just like the list of `AccountMeta` objects you
added to the instruction, you must include all the accounts that the program
you're invoking will read or write.

By the time you make a CPI in your program, you should have already grabbed all
the `account_info` objects that were passed into your program and stored them in
variables. You'll construct your list of `account_info` objects for the CPI by
selecting which of these accounts to copy and send along.

You can copy each `account_info` object you need to pass into the CPI using the
[`Clone`](https://docs.rs/solana-program/1.10.19/solana_program/account_info/struct.AccountInfo.html#impl-Clone)
trait implemented on the `account_info` struct in the `solana_program` crate.
This `Clone` trait returns a copy of the
[`account_info`](https://docs.rs/solana-program/1.10.19/solana_program/account_info/struct.AccountInfo.html)
instance.

```rust
&[first_account.clone(), second_account.clone(), third_account.clone()]
```

#### CPI with invoke

With both the instruction and the list of accounts created, you can perform a
call to `invoke`.

```rust
invoke(
    &Instruction {
        program_id: calling_program_id,
        accounts: accounts_meta,
        data,
    },
    &[account1.clone(), account2.clone(), account3.clone()],
)?;
```

There's no need to include a signature because the Solana runtime passes along
the original signature provided to your program. Remember, `invoke` won't work
if a signature is required on behalf of a PDA. In that case, you'll need to use
`invoke_signed`.

#### CPI with invoke_signed

Using `invoke_signed` is slightly different because there is an additional field
that requires the seeds used to derive any PDAs that must sign the transaction.
You may recall from previous lessons that PDAs do not lie on the Ed25519 curve
and, therefore, do not have a corresponding secret key. You've learned that
programs can provide signatures for their PDAs, but haven't yet learned how this
works—until now. Programs provide signatures for their PDAs with the
`invoke_signed` function.

The first two fields of `invoke_signed` are the same as `invoke`, but an
additional `signers_seeds` field is required here.

```rust
invoke_signed(
    &instruction,
    accounts,
    &[&["First addresses seed"],
        &["Second addresses first seed",
        "Second addresses second seed"]],
)?;
```

While PDAs have no secret keys of their own, they can be used by a program to
issue an instruction that includes the PDA as a signer. The only way for the
runtime to verify that the PDA belongs to the calling program is for the calling
program to supply the seeds used to generate the address in the `signers_seeds`
field.

The Solana runtime will internally call
[`create_program_address`](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.create_program_address)
using the seeds provided and the `program_id` of the calling program. It will
then compare the result against the addresses supplied in the instruction. If
any of the addresses match, the runtime knows that the program associated with
the address is the invoking and is authorized to be a signer.

### Best practices and common pitfalls

#### Security checks

There are some common mistakes and important things to remember when utilizing
CPIs to ensure your program's security and robustness. First, keep in mind that
we have no control over the information passed into our programs. Therefore,
it's crucial to always verify the `program_id`, accounts, and data passed into
the CPI. Without these security checks, someone could submit a transaction that
invokes an instruction on a completely different program than expected, which is
a significant security risk.

Fortunately, the `invoke_signed` function performs inherent checks on the
validity of any PDAs marked as signers. However, all other accounts and
`instruction_data` should be verified in your program code before making the
CPI. It's also important to ensure that you're targeting the intended
instruction in the program you're invoking. The simplest way to do this is to
review the source code of the program you're invoking, just as you would when
constructing an instruction from the client side.

#### Common errors

There are common errors you might encounter when executing a CPI, which usually
indicate that you're constructing the CPI with incorrect information. For
example, you may come across an error message similar to this:

```text
EF1M4SPfKcchb6scq297y8FPCaLvj5kGjwMzjTM68wjA's signer privilege escalated
Program returned error: "Cross-program invocation with unauthorized signer or writable account"
```

This message can be misleading because "signer privilege escalated" might not
initially seem like an issue, but it actually means you are incorrectly signing
for the address in the message. If you're using `invoke_signed` and receive this
error, it's likely that the seeds you're providing are incorrect. You can check
[an example transaction that failed with this error](https://explorer.solana.com/tx/3mxbShkerH9ZV1rMmvDfaAhLhJJqrmMjcsWzanjkARjBQurhf4dounrDCUkGunH1p9M4jEwef9parueyHVw6r2Et?cluster=devnet).

Another similar error occurs when an account is written to isn't marked as
`writable` in the `AccountMeta` struct.

```text
2qoeXa9fo8xVHzd2h9mVcueh6oK3zmAiJxCTySM5rbLZ's writable privilege escalated
Program returned error: "Cross-program invocation with unauthorized signer or writable account"
```

<Callout>

Remember, any account whose data may be mutated by the program during execution
must be specified as `writable`. During execution, attempting to write to an
account that was not marked as `writable` will cause the transaction to fail.
Similarly, writing to an account not owned by the program will also cause the
transaction to fail.

Any account whose lamport balance may be mutated by the program during execution
must also be specified as `writable`. Mutating the lamports of an account that
was not marked as `writable` will cause the transaction to fail. While
subtracting lamports from an account not owned by the program will cause the
transaction to fail, adding lamports to any account is allowed, as long as it is
mutable.

To see this in action, view this
[transaction in the explorer](https://explorer.solana.com/tx/ExB9YQJiSzTZDBqx4itPaa4TpT8VK4Adk7GU5pSoGEzNz9fa7PPZsUxssHGrBbJRnCvhoKgLCWnAycFB7VYDbBg?cluster=devnet).
</Callout>

### Why CPIs matter?

Cross-Program Invocations (CPIs) are a crucial feature of the Solana ecosystem
because they make all deployed programs interoperable. With CPIs, there's no
need to reinvent the wheel during development, as they enable new protocols and
applications to be built on top of existing ones, much like building blocks or
Lego bricks. CPIs make composability possible, allowing developers to integrate
or build on top of your programs. If you build something cool and useful, other
developers can leverage your protocol in their projects. Composability is one of
the unique aspects of Web3, and CPIs enable this on Solana.

Another important aspect of CPIs is that they allow programs to sign for their
PDAs. As you've likely noticed, PDAs are frequently used in Solana development
because they allow programs to control specific addresses in a way that prevents
external users from generating valid transactions with signatures for those
addresses. This feature is _extremely_ useful in many Web3 applications, such as
DeFi and NFTs. Without CPIs, PDAs would be far less useful since programs
wouldn't be able to sign transactions involving them—effectively turning them
into black holes where assets sent to a PDA couldn't be retrieved without CPIs!

## Lab

Now let's get some hands-on experience with CPIs by making some additions to the
Movie Review program. If you're dropping into this lesson without going through
the prior ones, the Movie Review program allows users to submit movie reviews,
which are stored in PDA accounts.

In the
[program derived addresses lesson](/content/courses/native-onchain-development/program-derived-addresses.md),
we added the ability to leave comments on movie reviews using PDAs. In this
lesson, we'll work on having the program mint tokens to reviewers or commenters
whenever a review or comment is submitted.

To implement this, we'll invoke the SPL Token Program's `MintTo` instruction
using a CPI. If you need a refresher on tokens, token mints, and minting new
tokens, check out the
[Token Program lesson](/content/courses/tokens-and-nfts/token-program.md) before
moving forward with this lab.

### 1. Get starter code and add dependencies

To get started, we'll be using the final state of the Movie Review program from
the
[previous PDA lesson](/content/courses/native-onchain-development/program-derived-addresses.md).
If you just completed that lesson, you're all set and ready to go. If you're
jumping in at this point, no worries! You can download the
[starter code from the `solution-add-comments` branch](https://github.com/solana-developers/movie-program/tree/solution-add-comments).

### 2. Add dependencies to Cargo.toml

Before we get started we need to add two new dependencies to the `Cargo.toml`
file underneath `[dependencies]`. We'll be using the `spl-token` and
`spl-associated-token-account` crates in addition to the existing dependencies.

```toml
spl-token = { version="6.0.0", features = [ "no-entrypoint" ] }
spl-associated-token-account = { version="5.0.1", features = [ "no-entrypoint" ] }
```

After adding the above, run `cargo check` in your console to have cargo resolve
your dependencies and ensure that you are ready to continue. Depending on your
setup you may need to modify crate versions before moving on.

### 3. Add necessary accounts to add_movie_review

Because we want users to be minted tokens upon creating a review, it makes sense
to add minting logic inside the `add_movie_review` function. Since we'll be
minting tokens, the `add_movie_review` instruction handler requires a few new
accounts to be passed in:

- `token_mint` - the mint address of the token
- `mint_auth` - address of the authority of the token mint
- `user_ata` - user's associated token account for this mint (where the tokens
  will be minted)
- `token_program` - address of the token program

We'll start by adding these new accounts to the area of the function that
iterates through the passed in accounts:

```rust filename="processor.rs"
// Inside add_movie_review
msg!("Adding movie review...");
msg!("Title: {}", title);
msg!("Rating: {}", rating);
msg!("Description: {}", description);

let account_info_iter = &mut accounts.iter();

let initializer = next_account_info(account_info_iter)?;
let pda_account = next_account_info(account_info_iter)?;
let token_mint = next_account_info(account_info_iter)?;
let mint_auth = next_account_info(account_info_iter)?;
let user_ata = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
```

There is no additional `instruction_data` required for the new functionality, so
no changes need to be made to how data is deserialized. The only additional
information that's needed is the extra accounts.

### 4. Mint tokens to the reviewer in add_movie_review

Before we dive into the minting logic, let's import the address of the Token
program and the constant `LAMPORTS_PER_SOL` at the top of the file.

```rust filename="processor.rs"
// Inside processor.rs
use solana_program::native_token::LAMPORTS_PER_SOL;
use spl_associated_token_account::get_associated_token_address;
use spl_token::{instruction::initialize_mint, ID as TOKEN_PROGRAM_ID};
```

Now we can move on to the logic that handles the actual minting of the tokens!
We'll be adding this to the very end of the `add_movie_review` function right
before `Ok(())` is returned.

Minting tokens requires a signature by the mint authority. Since the program
needs to be able to mint tokens, the mint authority needs to be an account that
the program can sign for. In other words, it needs to be a PDA account owned by
the program.

We'll also be structuring our token mint such that the mint account is a PDA
account that we can derive deterministically. This way we can always verify that
the `token_mint` account passed into the program is the expected account.

Let's go ahead and derive the token mint and mint authority addresses using the
`find_program_address` function with the seeds “token_mint” and "token_auth,"
respectively.

```rust filename="processor.rs"
// Mint tokens for adding a review
msg!("Deriving mint authority");
let (mint_pda, _mint_bump) = Pubkey::find_program_address(&[b"token_mint"], program_id);
let (mint_auth_pda, mint_auth_bump) =
    Pubkey::find_program_address(&[b"token_auth"], program_id);
```

Next, we'll perform security checks against each of the new accounts passed into
the program. Always remember to verify accounts!

```rust filename="processor.rs"
if *token_mint.key != mint_pda {
    msg!("Incorrect token mint");
    return Err(ReviewError::IncorrectAccountError.into());
}

if *mint_auth.key != mint_auth_pda {
    msg!("Mint passed in and mint derived do not match");
    return Err(ReviewError::InvalidPDA.into());
}

if *user_ata.key != get_associated_token_address(initializer.key, token_mint.key) {
    msg!("Incorrect associated token account for initializer");
    return Err(ReviewError::IncorrectAccountError.into());
}

if *token_program.key != TOKEN_PROGRAM_ID {
    msg!("Incorrect token program");
    return Err(ReviewError::IncorrectAccountError.into());
}
```

Finally, we can issue a CPI to the `mint_to` function of the token program with
the correct accounts using `invoke_signed`. The `spl_token` crate provides a
`mint_to` helper function for creating the minting instruction. This is great
because it means we don't have to manually build the entire instruction from
scratch. Rather, we can simply pass in the arguments required by the function.
Here's the function signature:

```rust filename="processor.rs"
// Inside the token program, returns an Instruction object
pub fn mint_to(
    token_program_id: &Pubkey,
    mint_pubkey: &Pubkey,
    account_pubkey: &Pubkey,
    owner_pubkey: &Pubkey,
    signer_pubkeys: &[&Pubkey],
    amount: u64,
) -> Result<Instruction, ProgramError>
```

Then we provide copies of the `token_mint`, `user_ata`, and `mint_auth`
accounts. And, most relevant to this lesson, we provide the seeds used to find
the `token_mint` address, including the bump seed.

```rust filename="processor.rs"
msg!("Minting 10 tokens to User associated token account");
invoke_signed(
    // Instruction
    &spl_token::instruction::mint_to(
        token_program.key,
        token_mint.key,
        user_ata.key,
        mint_auth.key,
        &[],
        10 * LAMPORTS_PER_SOL,
    )?,
    // Account_infos
    &[token_mint.clone(), user_ata.clone(), mint_auth.clone()],
    // Seeds
    &[&[b"token_auth", &[mint_auth_bump]]],
)?;

Ok(())
```

Note that we are using `invoke_signed` and not `invoke` here. The Token program
requires the `mint_auth` account to sign for this transaction. Since the
`mint_auth` account is a PDA, only the program it was derived from can sign on
its behalf. When `invoke_signed` is called, the Solana runtime calls
`create_program_address` with the seeds and bump provided and then compares the
derived address with all of the addresses of the provided `AccountInfo` objects.
If any of the addresses match the derived address, the runtime knows that the
matching account is a PDA of this program and that the program is signing this
transaction for this account.

At this point, the `add_movie_review` instruction handler should be fully
functional and will mint ten tokens to the reviewer when a review is created.

### 5. Repeat for add_comment

Our updates to the `add_comment` function will be almost identical to what we
did for the `add_movie_review` function above. The only difference is that we'll
change the number of tokens minted for comment from ten to five so that adding
reviews is weighted above commenting. First, update the accounts with the same
four additional accounts as in the `add_movie_review` function.

```rust filename="processor.rs"
// Inside add_comment
let account_info_iter = &mut accounts.iter();

let commenter = next_account_info(account_info_iter)?;
let pda_review = next_account_info(account_info_iter)?;
let pda_counter = next_account_info(account_info_iter)?;
let pda_comment = next_account_info(account_info_iter)?;
let token_mint = next_account_info(account_info_iter)?;
let mint_auth = next_account_info(account_info_iter)?;
let user_ata = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;
let token_program = next_account_info(account_info_iter)?;
```

Next, move to the bottom of the `add_comment` function just before the `Ok(())`.
Then derive the token mint and mint authority accounts. Remember, both are PDAs
derived from seeds "token_mint" and "token_authority" respectively.

```rust filename="processor.rs"
// Mint tokens here
msg!("Deriving mint authority");
let (mint_pda, _mint_bump) = Pubkey::find_program_address(&[b"token_mint"], program_id);
let (mint_auth_pda, mint_auth_bump) =
    Pubkey::find_program_address(&[b"token_auth"], program_id);
```

Next, verify that each of the new accounts is the correct account.

```rust filename="processor.rs"
if *token_mint.key != mint_pda {
    msg!("Incorrect token mint");
    return Err(ReviewError::IncorrectAccountError.into());
}

if *mint_auth.key != mint_auth_pda {
    msg!("Mint passed in and mint derived do not match");
    return Err(ReviewError::InvalidPDA.into());
}

if *user_ata.key != get_associated_token_address(commenter.key, token_mint.key) {
    msg!("Incorrect associated token account for commenter");
    return Err(ReviewError::IncorrectAccountError.into());
}

if *token_program.key != TOKEN_PROGRAM_ID {
    msg!("Incorrect token program");
    return Err(ReviewError::IncorrectAccountError.into());
}
```

Finally, use `invoke_signed` to send the `mint_to` instruction to the Token
program, sending five tokens to the commenter.

```rust filename="processor.rs"
msg!("Minting 5 tokens to User associated token account");
invoke_signed(
    // Instruction
    &spl_token::instruction::mint_to(
        token_program.key,
        token_mint.key,
        user_ata.key,
        mint_auth.key,
        &[],
        5 * LAMPORTS_PER_SOL,
    )?,
    // Account_infos
    &[token_mint.clone(), user_ata.clone(), mint_auth.clone()],
    // Seeds
    &[&[b"token_auth", &[mint_auth_bump]]],
)?;

Ok(())
```

### 6. Set up the token mint

We've written all the code needed to mint tokens to reviewers and commenters,
but all of it assumes that there is a token mint at the PDA derived with the
seed "token_mint." For this to work, we're going to set up an additional
instruction for initializing the token mint. It will be written such that it can
only be called once and it doesn't particularly matter who calls it.

Given that throughout this lesson we've already hammered home all of the
concepts associated with PDAs and CPIs multiple times, we're going to walk
through this bit with less explanation than the prior steps. Start by adding a
fourth instruction variant to the `MovieInstruction` enum in `instruction.rs`.

```rust filename="instruction.rs"
pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String,
    },
    UpdateMovieReview {
        title: String,
        rating: u8,
        description: String,
    },
    AddComment {
        comment: String,
    },
    InitializeMint,
}
```

Be sure to add it to the `match` statement in the `unpack` function in the same
file under the discriminator `3`.

```rust filename="instruction.rs"
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&discriminator, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        match discriminator {
            0 => {
                let payload = MovieReviewPayload::try_from_slice(rest)
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
                Ok(Self::AddMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                })
            }
            1 => {
                let payload = MovieReviewPayload::try_from_slice(rest)
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
                Ok(Self::UpdateMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                })
            }
            2 => {
                let payload = CommentPayload::try_from_slice(rest)
                    .map_err(|_| ProgramError::InvalidInstructionData)?;
                Ok(Self::AddComment {
                    comment: payload.comment,
                })
            }
            3 => Ok(Self::InitializeMint),
            _ => return Err(ProgramError::InvalidInstructionData),
        }
    }
}
```

In the `process_instruction` function in the `processor.rs` file, add the new
instruction to the `match` statement and call a function
`initialize_token_mint`.

```rust filename="processor.rs"
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = MovieInstruction::unpack(instruction_data)?;
    match instruction {
        MovieInstruction::AddMovieReview {
            title,
            rating,
            description,
        } => add_movie_review(program_id, accounts, title, rating, description),
        MovieInstruction::UpdateMovieReview {
            title,
            rating,
            description,
        } => update_movie_review(program_id, accounts, title, rating, description),
        MovieInstruction::AddComment { comment } => add_comment(program_id, accounts, comment),
        MovieInstruction::InitializeMint => initialize_token_mint(program_id, accounts),
    }
}
```

Lastly, declare and implement the `initialize_token_mint` function. This
function will derive the token mint and mint authority PDAs, create the token
mint account, and then initialize the token mint. We won't explain all of this
in detail, but it's worth reading through the code, especially given that the
creation and initialization of the token mint both involve CPIs. Again, if you
need a refresher on tokens and mints, have a look at the
[Token Program lesson](/content/courses/tokens-and-nfts/token-program.md).

```rust filename="processor.rs"
pub fn initialize_token_mint(program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let token_mint = next_account_info(account_info_iter)?;
    let mint_auth = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    let token_program = next_account_info(account_info_iter)?;
    let sysvar_rent = next_account_info(account_info_iter)?;

    let (mint_pda, mint_bump) = Pubkey::find_program_address(&[b"token_mint"], program_id);
    let (mint_auth_pda, _mint_auth_bump) =
        Pubkey::find_program_address(&[b"token_auth"], program_id);

    msg!("Token mint: {:?}", mint_pda);
    msg!("Mint authority: {:?}", mint_auth_pda);

    if mint_pda != *token_mint.key {
        msg!("Incorrect token mint account");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    if *token_program.key != TOKEN_PROGRAM_ID {
        msg!("Incorrect token program");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    if *mint_auth.key != mint_auth_pda {
        msg!("Incorrect mint auth account");
        return Err(ReviewError::IncorrectAccountError.into());
    }

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(82);

    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            token_mint.key,
            rent_lamports,
            82,
            token_program.key,
        ),
        &[
            initializer.clone(),
            token_mint.clone(),
            system_program.clone(),
        ],
        &[&[b"token_mint", &[mint_bump]]],
    )?;

    msg!("Created token mint account");

    invoke_signed(
        &initialize_mint(
            token_program.key,
            token_mint.key,
            mint_auth.key,
            Option::None,
            9,
        )?,
        &[token_mint.clone(), sysvar_rent.clone(), mint_auth.clone()],
        &[&[b"token_mint", &[mint_bump]]],
    )?;

    msg!("Initialized token mint");

    Ok(())
}
```

### 7. Build and Deploy

Now we're ready to build and deploy our program! You can build the program by
running `cargo build-sbf`.

```sh
cargo build-sbf
```

Then deploy the program by running the `solana program deploy` command.

```sh
solana program deploy target/deploy/<your_program_name>.so
```

Upon successful deployment, you'll receive a Program ID. For example:

```sh
Program Id: AzKatnACpNwQxWRs2YyPovsGhgsYVBiTmC3TL4t72eJW
```

If you encounter an "insufficient funds" error during deployment, you may need
to add SOL to your deployment wallet. Use the Solana CLI to request an airdrop:

```sh
solana airdrop 2
```

After receiving the airdrop, attempt the deployment again.

<Callout>

Ensure your Solana CLI is configured for the correct network (`Localnet`,
`devnet`, `testnet`, or `mainnet-beta`) before deploying or requesting airdrops.
</Callout>

If you encounter the following error during program deployment, it indicates
that your program size needs to be extended:

```sh
Error: Deploying program failed: RPC response error -32002: Transaction simulation failed: Error processing Instruction 0: account data too small for instruction [3 log messages ]
```

To resolve this, if you're using Solana CLI version 1.18 or later, run the
following command:

```sh
solana program extend PROGRAM_ID 20000 -u d -k KEYPAIR_FILE_PATH
```

Replace `PROGRAM_ID` and `KEYPAIR_FILE_PATH` with your own values. For example:

```sh
 solana program extend HMDRWmYvL2A9xVKZG8iA1ozxi4gMKiHQz9mFkURKrG4 20000 -u d -k ~/.config/solana/id.json
```

<Callout>

Ensure you are passing the correct Solana's JSON RPC or moniker URL parameter in
the command.

```bash
-u, --url <URL_OR_MONIKER>  URL for Solana's JSON RPC or moniker (or their first letter): [mainnet-beta, testnet, devnet, localhost]
```

</Callout>

Before testing whether adding a review or comment sends tokens, you need to
initialize the program's token mint.

First, create and initialize an empty NPM project, then change into the project
directory:

```bash
mkdir movie-token-client
cd movie-token-client
npm init -y
```

Install all the required dependencies.

```bash
npm i @solana/web3.js@1 @solana-developers/helpers@2.5.2

npm i --save-dev esrun
```

Create a new file named `initialize-review-token-mint.ts`:

```bash
touch initialize-review-token-mint.ts
```

Copy the code below into the newly created file.

```typescript filename="initialize-review-token-mint.ts"
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  initializeKeypair,
  airdropIfRequired,
  getExplorerLink,
} from "@solana-developers/helpers";

const PROGRAM_ID = new PublicKey(
  "AzKatnACpNwQxWRs2YyPovsGhgsYVBiTmC3TL4t72eJW",
);

const LOCALHOST_RPC_URL = "http://localhost:8899";
const AIRDROP_AMOUNT = 2 * LAMPORTS_PER_SOL;
const MINIMUM_BALANCE_FOR_RENT_EXEMPTION = 1 * LAMPORTS_PER_SOL;

const connection = new Connection(LOCALHOST_RPC_URL);
const userKeypair = await initializeKeypair(connection);

await airdropIfRequired(
  connection,
  userKeypair.publicKey,
  AIRDROP_AMOUNT,
  MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
);

const [tokenMintPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_mint")],
  PROGRAM_ID,
);

const [tokenAuthPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("token_auth")],
  PROGRAM_ID,
);

const INITIALIZE_MINT_INSTRUCTION = 3;

const initializeMintInstruction = new TransactionInstruction({
  keys: [
    { pubkey: userKeypair.publicKey, isSigner: true, isWritable: false },
    { pubkey: tokenMintPDA, isSigner: false, isWritable: true },
    { pubkey: tokenAuthPDA, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ],
  programId: PROGRAM_ID,
  data: Buffer.from([INITIALIZE_MINT_INSTRUCTION]),
});

const transaction = new Transaction().add(initializeMintInstruction);

try {
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [userKeypair],
  );
  const explorerLink = getExplorerLink("transaction", transactionSignature);

  console.log(`Transaction submitted: ${explorerLink}`);
} catch (error) {
  if (error instanceof Error) {
    throw new Error(
      `Failed to initialize program token mint: ${error.message}`,
    );
  } else {
    throw new Error("An unknown error occurred");
  }
}
```

Replace `PROGRAM_ID` in `initialize-review-token-mint.ts` with your program ID.
Then run the file with:

```bash
npx esrun initialize-review-token-mint.ts
```

Your token mint will now be initialized. The script assumes you're deploying to
localnet. If you're deploying to devnet, update the script accordingly.

Once you've initialized your token mint, you can use the
[Movie Review frontend](https://github.com/Unboxed-Software/solana-movie-frontend/tree/solution-add-tokens)
to test adding reviews and comments. Again, the code assumes you're on Devnet so
please act accordingly.

After submitting a review, you should see 10 new tokens in your wallet! When you
add a comment, you should receive 5 tokens. They won't have a fancy name or
image since we didn't add any metadata to the token, but you get the idea.

If you need more time with the concepts from this lesson or got stuck along the
way, feel free to take a look at the
[solution code in `solution-add-tokens` branch](https://github.com/solana-developers/movie-program/tree/solution-add-tokens).

## Challenge

To apply what you've learned about CPIs in this lesson, think about how you
could incorporate them into the Student Intro program. You could do something
similar to what we did in the lab here and add some functionality to mint tokens
to users when they introduce themselves. Or if you're feeling really ambitious,
think about how you could take all that you have learned so far in the course
and create something completely new from scratch.

A great example would be to build a decentralized Stack Overflow. The program
could use tokens to determine a user's overall rating, mint tokens when
questions are answered correctly, allow users to upvote answers, etc. All of
that is possible and you now have the skills and knowledge to go and build
something like it on your own!

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=ade5d386-809f-42c2-80eb-a6c04c471f53)!
</Callout>
