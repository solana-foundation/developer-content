---
title: Program Derived Addresses (PDAs)
objectives:
  - Explain Program Derived Addresses (PDAs)
  - Identify various use cases for PDAs
  - Describe how PDAs are derived
  - Utilize PDA derivations to locate and retrieve data
description: "Gain a deeper understanding of PDAs."
---

## Summary

- A **Program Derived Address** (PDA) is derived from a **program ID** and an
  optional list of **seeds**.
- PDAs are owned and controlled exclusively by the program from which they are
  derived.
- PDA derivation provides a deterministic method to locate data based on the
  specific seeds used for the derivation.
- Seeds can map to data stored in a separate PDA account.
- A program can sign instructions on behalf of the PDAs derived from its ID.

## Lesson

### What is a Program Derived Address?

Program Derived Addresses (PDAs) are special account addresses that a program,
not a secret key, signs for. PDAs are derived from a program ID, and optionally,
a set of **seeds**. These seeds will be essential in using PDAs to store and
retrieve data, as we’ll explore in more detail later.

PDAs serve two key purposes:

1. They provide a **deterministic way** for a program to locate a specific piece
   of data.
2. They allow the program to sign for the PDA like a user signs with their
   secret key.

In this lesson, we’ll focus on using PDAs to store and retrieve data. We will
discuss how PDAs sign on behalf of programs in the next lesson that covers
[**Cross Program Invocations (CPIs)**](/content/courses/native-onchain-development/cross-program-invocations.md).

### Finding PDAs

Program Derived Addresses (PDAs) are not technically created; instead, they are
**found** or **derived** based on a program ID and one or more input seeds.

Solana keypairs are based on the Ed25519 Elliptic Curve (Ed25519), a
deterministic signature scheme used to generate corresponding public and secret
keys—together known as keypairs.

In contrast, PDAs are addresses that exist **off** the Ed25519 curve. This means
PDAs are not public keys and do not have secret keys. This characteristic is
crucial, as it enables programs to sign on behalf of PDAs, a concept we’ll
explore more in a future lesson.

To find a PDA in a Solana program, we use the
[`find_program_address()`](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.find_program_address)
function. This function accepts an optional list of "seeds" and a program ID as
inputs, returning both the PDA and a bump seed:

```rust
let (pda, bump_seed) = Pubkey::find_program_address(&[user.key.as_ref(), user_input.as_bytes().as_ref(), "SEED".as_bytes()], program_id)
```

#### Seeds

"Seeds" are optional inputs used in the `find_program_address()` function to
derive a PDA. These seeds can be a combination of public keys, user-provided
inputs, or hardcoded values. A PDA can even be derived using only the program ID
without any additional seeds. By using seeds, however, you can create multiple
distinct accounts that your program can control.

As the developer, you define the seeds to pass into the `find_program_address()`
function. The function itself adds a special numeric seed called a **bump
seed**. This bump seed ensures that the derived key is not on the Ed25519 curve,
as about 50% of the results lie on the curve, which would mean the PDA has a
secret key. Since PDAs should not have secret keys, the bump seed is used to
prevent this.

The function starts by testing with the value `255` as the bump seed. If the
resulting address is not valid, the function decreases the bump seed value
(`255`, `254`, `253`, etc.) until a valid PDA is found. Once a valid PDA is
derived, the function returns both the PDA and the bump seed used to generate
it.

#### Under the hood of find_program_address

Let's take a closer look at the source code behind the `find_program_address()`
function:

```rust
pub fn find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> (Pubkey, u8) {
    Self::try_find_program_address(seeds, program_id)
        .unwrap_or_else(|| panic!("Unable to find a viable program address bump seed"))
}
```

The `find_program_address()` function internally calls
[`try_find_program_address()`](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.try_find_program_address),
passing the input `seeds` and `program_id`.

The `try_find_program_address()` function introduces the `bump_seed`, a `u8`
variable that ranges from 0 to 255. The process begins by iterating over a
descending range starting at 255. A `bump_seed` is appended to the optional
input seeds and passed to the
[`create_program_address()`](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.create_program_address)
function. If the resulting address is not a valid PDA, the `bump_seed` is
decreased by 1, and the function continues to try again until it finds a valid
PDA.

```rust
pub fn try_find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> Option<(Pubkey, u8)> {
    let mut bump_seed = [u8::MAX];
    for _ in 0..u8::MAX {
        {
            let mut seeds_with_bump = seeds.to_vec();
            seeds_with_bump.push(&bump_seed);
            match Self::create_program_address(&seeds_with_bump, program_id) {
                Ok(address) => return Some((address, bump_seed[0])),
                Err(PubkeyError::InvalidSeeds) => (),
                _ => break,
            }
        }
        bump_seed[0] -= 1;
    }
    None
}
```

The `create_program_address()` function performs a series of hash operations on
the seeds and `program_id`. These operations compute a key, and the function
checks whether the computed key lies on the Ed25519 elliptic curve. If the
result is a valid **Program Derived Address** (PDA) (i.e., an address that lies
**off** the curve), the PDA is returned. If the computed key lies **on** the
curve, indicating it's not a valid PDA, an error is returned.

```rust
pub fn create_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> Result<Pubkey, PubkeyError> {
    if seeds.len() > MAX_SEEDS {
        return Err(PubkeyError::MaxSeedLengthExceeded);
    }
    for seed in seeds.iter() {
        if seed.len() > MAX_SEED_LEN {
            return Err(PubkeyError::MaxSeedLengthExceeded);
        }
    }
    let mut hasher = crate::hash::Hasher::default();
    for seed in seeds.iter() {
        hasher.hash(seed);
    }
    hasher.hashv(&[program_id.as_ref(), PDA_MARKER]);
    let hash = hasher.result();

    if bytes_are_curve_point(hash) {
        return Err(PubkeyError::InvalidSeeds);
    }

    Ok(Pubkey::from(hash.to_bytes()))
}
```

In summary, the `find_program_address()` function passes the input seeds and
`program_id` to the `try_find_program_address()` function. The
`try_find_program_address()` function appends a `bump_seed` (starting from 255)
to the input seeds, then calls the `create_program_address()` function until it
finds a valid PDA. Once a valid PDA is found, both the PDA and the `bump_seed`
are returned.

For the same input seeds, different valid bumps will generate different valid
PDAs. The `bump_seed` returned by `find_program_address()` will always be the
first valid PDA found. Since the function starts with a `bump_seed` value of 255
and iterates downward to zero, the `bump_seed` that gets returned is always the
largest valid 8-bit value possible. This `bump_seed` is referred to as the
**canonical bump**. To avoid confusion, it’s recommended to _always use the
canonical bump and validate every PDA passed into your program._

<Callout>

It's important to note that the `find_program_address()` function only returns a
Program Derived Address and the bump seed used to derive it. The function does
not initialize a new account, nor does it ensure the PDA is associated with an
account that stores data. </Callout>

### Use PDA accounts to store data

Since programs are stateless, the program state is managed through external
accounts. Given that seeds can be used for mapping and that programs can sign on
behalf of PDAs, using PDA accounts to store program-related data is a common
design choice. While programs can invoke the System Program to create non-PDA
accounts for data storage, PDAs are generally preferred.

If you need a refresher on how to store data in PDAs, check out the
[State Management lesson](/content/courses/native-onchain-development/program-state-management.md).

### Map to data stored in PDA accounts

Storing data in PDA accounts is only part of the process. You also need a way to
retrieve that data. There are two common approaches:

1. Creating a PDA "map" account that stores the addresses of accounts where data
   is stored.
2. Strategically using seeds to locate and retrieve data from the appropriate
   PDA accounts.

#### Map to data using PDA map accounts

One approach is to store clusters of related data in separate PDAs and maintain
a separate PDA account that acts as a "map" for where all of the data is stored.

For example, consider a note-taking app that uses random seeds to generate PDAs
for storing notes, where each note is in its own PDA. The program could also
have a global PDA "map" account that stores a mapping of users' public keys to
the list of PDAs holding their notes. This map account could be derived using a
static seed, such as "GLOBAL_MAPPING."

When retrieving a user's notes, the program would look at the map account to see
which addresses are associated with the user's public key and then fetch the
data from each of those addresses.

While this method is intuitive for developers familiar with traditional web
development, it presents some challenges unique to web3 development. Since the
size of the map account grows over time, you would either need to allocate more
space upfront or reallocate space as needed. However, there’s a 10 MB account
size limit, which could eventually be an issue.

One potential solution is to create a separate map account for each user,
derived using their public key. Each user’s map account would then store the
addresses for their notes. This reduces the size needed for each map account,
but it adds a step: having to read the map account _before_ finding the accounts
with the actual note data.

While this method might be suitable for some applications, it's not generally
recommended as your primary strategy.

#### Map to data using PDA derivation

A more efficient method is to strategically use seeds to embed the required
mappings directly in the PDAs. Returning to the note-taking app example, if you
use the creator's public key as a seed to create one map account per user, you
could also use both the creator's public key and some additional known
information to derive a PDA for the note itself.

In essence, this is the approach we've been using throughout this course.
Consider the Movie Review program from previous lessons: it uses a review
creator's public key and the movie title as seeds to find the address where the
review should be stored. This method generates a unique address for each review
and makes it easy to locate the review later. For instance, to find a user’s
review of "Spiderman," the program derives the PDA account using the user's
public key and "Spiderman" as seeds.

```rust
let (pda, bump_seed) = Pubkey::find_program_address(&[
        initializer.key.as_ref(),
        title.as_bytes().as_ref()
    ],
    program_id)
```

#### Associated token account addresses

A practical example of mapping using seeds is how associated token account (ATA)
addresses are derived. Tokens are often held in an ATA, which is created based
on a wallet address and the mint address of a specific token. The ATA's address
can be found using the
[`get_associated_token_address()`](https://docs.rs/spl-associated-token-account/latest/spl_associated_token_account/fn.get_associated_token_address.html)
function, which takes both the `wallet_address` and `token_mint_address` as
inputs.

```rust
let associated_token_address = get_associated_token_address(&wallet_address, &token_mint_address);
```

Under the hood, the associated token address is a PDA derived using the
`wallet_address`, `token_program_id`, and `token_mint_address` as seeds. This
provides a deterministic way to locate a token account associated with any
wallet address for a specific token mint.

```rust
pub fn get_associated_token_address_and_bump_seed_internal(
    wallet_address: &Pubkey,
    token_mint_address: &Pubkey,
    program_id: &Pubkey,
    token_program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[
            &wallet_address.to_bytes(),
            &token_program_id.to_bytes(),
            &token_mint_address.to_bytes(),
        ],
        program_id,
    )
}
```

The mappings between seeds and PDA accounts that you create will depend heavily
on your specific program's design. While this isn't a lesson on system
architecture, it's important to follow a few guidelines:

- Use seeds that will be known at the time of PDA derivation.
- Be deliberate in how you group data into a single account.
- Choose your data structure wisely for storing information within each account.
- Simplicity is usually best.

## Lab

Let's continue with the Movie Review program we've worked on in previous
lessons. If you're just joining this lesson, don't worry—you'll be able to
follow along.

As a quick refresher, the Movie Review program allows users to create movie
reviews, which are stored in an account using a PDA. This PDA is derived from
the review creator's public key and the movie title.

Previously, we implemented the ability to securely update a movie review. Now,
in this lab, we'll add a new feature allowing users to comment on a movie
review. We'll use this opportunity to explore how to structure comment storage
using PDA accounts.

### 1. Get the starter code

To begin, you can find
[the movie program starter code](https://github.com/Unboxed-Software/solana-movie-program/tree/starter)
on the `starter` branch.

If you've been following along with the Movie Review labs, you'll notice that
this is the program we've built out so far. Previously, we
used [Solana Playground](https://beta.solpg.io/) to write, build, and deploy our
code. In this lesson, we'll build and deploy the program locally.

Navigate to the program folder and build the program using the Solana Binary
Format (SBF) build tool:

```sh
cargo build-sbf
```

Deploy your program to the Solana blockchain using the Solana CLI:

```sh
solana program deploy target/deploy/<your_program_name>.so
```

Upon successful deployment, you'll receive a Program ID. For example:

```sh
Program Id: 8aK2C2xyYDTiBTEYu7Q2ShSmQozNQSMoqFpUmsJLVDW9
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

You can test the program by using the movie review
[frontend](https://github.com/Unboxed-Software/solana-movie-frontend/tree/solution-update-reviews)
and updating the program ID with the one you've just deployed. Make sure you use
the `solution-update-reviews` branch.

### 2. Plan out the account structure

Adding comments means we need to make a few decisions about how to store the
data associated with each comment. The criteria for a good structure here are:

- Not overly complicated
- Data is easily retrievable
- Each comment has something to link it to the review it's associated with

To do this, we'll create two new account types:

- Comment counter account
- Comment account

There will be one comment counter account per review and one comment account per
comment. The comment counter account will be linked to a given review by using a
review's address as a seed for finding the comment counter PDA. It will also use
the static string "comment" as a seed.

The comment account will be linked to a review in the same way. However, it will
not include the "comment" string as a seed and will instead use the _actual
comment count_ as a seed. That way the client can easily retrieve comments for a
given review by doing the following:

1. Read the data on the comment counter account to determine the number of
   comments on a review.
2. Where `n` is the total number of comments on the review, loop `n` times. Each
   iteration of the loop will derive a PDA using the review address and the
   current number as seeds. The result is `n` number of PDAs, each of which is
   the address of an account that stores a comment.
3. Fetch the accounts for each of the `n` PDAs and read the data stored in each.

This ensures that every one of our accounts can be deterministically retrieved
using data that is already known ahead of time.

To implement these changes, we'll need to do the following:

- Define structs to represent the comment counter and comment accounts
- Update the existing `MovieAccountState` to contain a discriminator (more on
  this later)
- Add an instruction variant to represent the `add_comment` instruction handler
- Update the existing `add_movie_review` instruction handler to include creating
  the comment counter account
- Create a new `add_comment` instruction handler

### 3. Define MovieCommentCounter and MovieComment structs

Recall that the `state.rs` file defines the structs our program uses to populate
the data field of a new account.

We'll need to define two new structs to enable commenting.

1. `MovieCommentCounter` - to store a counter for the number of comments
   associated with a review
2. `MovieComment` - to store data associated with each comment

To start, let's define the structs we'll be using for our program. Note that we
are adding a `discriminator` field to each struct, including the existing
`MovieAccountState`. Since we now have multiple account types, we need a way to
only fetch the account type we need from the client. This discriminator is a
string that can be used to filter through accounts when we fetch our program
accounts.

```rust
#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieAccountState {
    pub discriminator: String,
    pub is_initialized: bool,
    pub reviewer: Pubkey,
    pub rating: u8,
    pub title: String,
    pub description: String,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieCommentCounter {
    pub discriminator: String,
    pub is_initialized: bool,
    pub counter: u64
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieComment {
    pub discriminator: String,
    pub is_initialized: bool,
    pub review: Pubkey,
    pub commenter: Pubkey,
    pub comment: String,
    pub count: u64
}

impl Sealed for MovieAccountState {}

impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for MovieCommentCounter {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl IsInitialized for MovieComment {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
```

Since we've added a new `discriminator` field to our existing struct, the
account size calculation needs to change. Let's use this as an opportunity to
clean up some of our code a bit. We'll add an implementation for each of the
three structs above that adds a constant `DISCRIMINATOR` and either a constant
`SIZE` or function `get_account_size` so we can quickly get the size needed when
initializing an account.

```rust
impl MovieAccountState {
    pub const DISCRIMINATOR: &'static str = "review";

    pub fn get_account_size(title: String, description: String) -> usize {
        return (4 + MovieAccountState::DISCRIMINATOR.len())
            + 1
            + 1
            + (4 + title.len())
            + (4 + description.len());
    }
}

impl MovieCommentCounter {
    pub const DISCRIMINATOR: &'static str = "counter";
    pub const SIZE: usize = (4 + MovieCommentCounter::DISCRIMINATOR.len()) + 1 + 8;
}

impl MovieComment {
    pub const DISCRIMINATOR: &'static str = "comment";

    pub fn get_account_size(comment: String) -> usize {
        return (4 + MovieComment::DISCRIMINATOR.len()) + 1 + 32 + 32 + (4 + comment.len()) + 8;
    }
}
```

Now everywhere we need the discriminator or account size we can use this
implementation and not risk unintentional typos.

### 4. Create AddComment Instruction Handler

Recall that the `instruction.rs` file defines the instructions our program will
accept and how to deserialize the data for each. We need to add a new
instruction variant for adding comments. Let's start by adding a new variant
`AddComment` to the `MovieInstruction` enum.

```rust
pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String
    },
    UpdateMovieReview {
        title: String,
        rating: u8,
        description: String
    },
    AddComment {
        comment: String
    }
}
```

Next, let's create a `CommentPayload` struct to represent the instruction data
associated with this new instruction. Most of the data we'll include in the
account are public keys associated with accounts passed into the program, so the
only thing we actually need here is a single field to represent the comment
text.

```rust
#[derive(BorshDeserialize)]
struct CommentPayload {
    comment: String
}
```

Now let's update how we unpack the instruction data. Notice that we've moved the
deserialization of instruction data into each matching case using the associated
payload struct for each instruction.

```rust
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
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}
```

Lastly, let's update the `process_instruction` function in `processor.rs` to use
the new instruction variant we've created.

In `processor.rs`, bring into scope the new structs from `state.rs`.

```rust
use crate::state::{MovieAccountState, MovieComment, MovieCommentCounter};
```

Then in `process_instruction` let's match our deserialized `AddComment`
instruction data to the `add_comment` function we'll be implementing shortly.

```rust
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
    }
}
```

### 5. Update add_movie_review to create comment counter account

Before we implement the `add_comment` function, we need to update the
`add_movie_review` function to create the review's comment counter account.

Remember that this account will keep track of the total number of comments that
exist for an associated review. It's address will be a PDA derived using the
movie review address and the word “comment” as seeds. Note that how we store the
counter is simply a design choice. We could also add a “counter” field to the
original movie review account.

Within the `add_movie_review` function, let's add a `pda_counter` to represent
the new counter account we'll be initializing along with the movie review
account. This means we now expect four accounts to be passed into
the `add_movie_review` function through the `accounts` argument.

```rust
let account_info_iter = &mut accounts.iter();

let initializer = next_account_info(account_info_iter)?;
let pda_account = next_account_info(account_info_iter)?;
let pda_counter = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;
```

Next, there's a check to make sure `total_len` is less than 1000 bytes, but
`total_len` is no longer accurate since we added the discriminator. Let's
replace `total_len` with a call to `MovieAccountState::get_account_size`:

```rust
let account_len: usize = 1000;

if MovieAccountState::get_account_size(title.clone(), description.clone()) > account_len {
    msg!("Data length is larger than 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into());
}
```

Note that this also needs to be updated in the `update_movie_review` function
for that instruction handler to work properly.

Once we've initialized the review account, we'll also need to update the
`account_data` with the new fields we specified in the `MovieAccountState`
struct.

```rust
account_data.discriminator = MovieAccountState::DISCRIMINATOR.to_string();
account_data.reviewer = *initializer.key;
account_data.title = title;
account_data.rating = rating;
account_data.description = description;
account_data.is_initialized = true;
```

Finally, let's add the logic to initialize the counter account within the
`add_movie_review` function. This means:

1. Calculating the rent exemption amount for the counter account
2. Deriving the counter PDA using the review address and the string "comment" as
   seeds
3. Invoking the system program to create the account
4. Set the starting counter value
5. Serialize the account data and return from the function

All of this should be encapsulated in the `create_comment_counter()` function,
which should be called at the end of the `add_movie_review()` function, just
before the `Ok(())`.

```rust
fn create_comment_counter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    pda: Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let initializer = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let rent = Rent::get()?;
    let counter_rent_lamports = rent.minimum_balance(MovieCommentCounter::SIZE);

    let (counter, counter_bump) =
        Pubkey::find_program_address(&[pda.as_ref(), "comment".as_ref()], program_id);
    if counter != *pda_counter.key {
        msg!("Invalid seeds for PDA");
        return Err(ProgramError::InvalidArgument);
    }

    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            pda_counter.key,
            counter_rent_lamports,
            MovieCommentCounter::SIZE.try_into().unwrap(),
            program_id,
        ),
        &[
            initializer.clone(),
            pda_counter.clone(),
            system_program.clone(),
        ],
        &[&[pda.as_ref(), "comment".as_ref(), &[counter_bump]]],
    )?;
    msg!("Comment counter created");

    let mut counter_data = MovieCommentCounter::try_from_slice(&pda_counter.data.borrow())?;
    if counter_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    counter_data.discriminator = MovieCommentCounter::DISCRIMINATOR.to_string();
    counter_data.counter = 0;
    counter_data.is_initialized = true;
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    Ok(())
}
```

Now when a new review is created, two accounts are initialized:

1. The first is the review account that stores the contents of the review. This
   is unchanged from the version of the program we started with.
2. The second account stores the counter for comments

### 6. Implement add_comment

Finally, let's implement our `add_comment` function to create new comment
accounts.

When a new comment is created for a review, we will increment the count on the
comment counter PDA account and derive the PDA for the comment account using the
review address and current count.

Like in other instruction handlers, we'll start by iterating through accounts
passed into the program. Then before we do anything else we need to deserialize
the counter account so we have access to the current comment count:

```rust
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String,
) -> ProgramResult {
    msg!("Adding Comment: {}", comment);

    let account_info_iter = &mut accounts.iter();
    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let mut counter_data = MovieCommentCounter::try_from_slice(&pda_counter.data.borrow())?;

    Ok(())
}
```

Now that we have access to the counter data, we can continue with the remaining
steps:

1. Calculate the rent exempt amount for the new comment account
2. Derive the PDA for the comment account using the review address and the
   current comment count as seeds
3. Invoke the System Program to create the new comment account
4. Set the appropriate values to the newly created account
5. Serialize the account data and return from the function

```rust
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String,
) -> ProgramResult {
    msg!("Adding Comment: {}", comment);

    let account_info_iter = &mut accounts.iter();
    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let mut counter_data = MovieCommentCounter::try_from_slice(&pda_counter.data.borrow())?;
    let account_len = MovieComment::get_account_size(comment.clone());

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    let (pda, bump_seed) = Pubkey::find_program_address(
        &[
            pda_review.key.as_ref(),
            counter_data.counter.to_be_bytes().as_ref(),
        ],
        program_id,
    );
    if pda != *pda_comment.key {
        msg!("Invalid seeds for PDA");
        return Err(ReviewError::InvalidPDA.into());
    }

    invoke_signed(
        &system_instruction::create_account(
            commenter.key,
            pda_comment.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id,
        ),
        &[
            commenter.clone(),
            pda_comment.clone(),
            system_program.clone(),
        ],
        &[&[
            pda_review.key.as_ref(),
            counter_data.counter.to_be_bytes().as_ref(),
            &[bump_seed],
        ]],
    )?;
    msg!("Created Comment Account");

    let mut comment_data = MovieComment::try_from_slice(&pda_comment.data.borrow())?;
    if comment_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    comment_data.discriminator = MovieComment::DISCRIMINATOR.to_string();
    comment_data.review = *pda_review.key;
    comment_data.commenter = *commenter.key;
    comment_data.comment = comment;
    comment_data.is_initialized = true;
    comment_data.serialize(&mut &mut pda_comment.data.borrow_mut()[..])?;

    msg!("Comment Count: {}", counter_data.counter);
    counter_data.counter += 1;
    counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;

    Ok(())
}
```

### 7. Build and deploy

We're ready to build and deploy our program!

Build the updated program by running `cargo build-sbf`.

```sh
cargo build-sbf
```

Then deploy the program by running the `solana program deploy` command.

```sh
solana program deploy target/deploy/<your_program_name>.so
```

For additional deployment information, refer to the deployment details outlined
in [step 1](#1-get-the-starter-code).

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

You can test your program by submitting a transaction with the right instruction
data. You can create your own script or feel free to use
[this frontend](https://github.com/Unboxed-Software/solana-movie-frontend/tree/solution-add-comments).
Be sure to use the `solution-add-comments` branch and replace the
`MOVIE_REVIEW_PROGRAM_ID` in `utils/constants.ts` with your program's ID or the
frontend won't work with your program.

<Callout>

Keep in mind that we made breaking changes to the review accounts (i.e. adding a
discriminator). If you were to use the same program ID that you've used
previously when deploying this program, none of the reviews you created
previously will show on this frontend due to a data mismatch. </Callout>

If you need more time with this project to feel comfortable with these concepts,
have a look at
the [`solution-add-comments` branch of the movie program repository](https://github.com/Unboxed-Software/solana-movie-program/tree/solution-add-comments)
before continuing.

## Challenge

Now it's your turn to build something independently! Go ahead and work with the
Student Intro program that we've used in past lessons. The Student Intro program
is a Solana program that lets students introduce themselves. This program takes
a user's name and a short message as the `instruction_data` and creates an
account to store the data onchain. For this challenge, you should:

1. Add an instruction handler allowing other users to reply to an intro
2. Build and deploy the program locally

If you haven't been following along with past lessons or haven't saved your work
from before, feel free to use the starter code on the
[`starter` branch of the student intro program repository](https://github.com/Unboxed-Software/solana-student-intro-program/tree/starter).

Try to do this independently if you can! If you get stuck though, feel free to
reference the solution code in the
[`solution-add-replies` branch of the same repository](https://github.com/Unboxed-Software/solana-student-intro-program/tree/solution-add-replies).
Note that your code may look slightly different.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=89d367b4-5102-4237-a7f4-4f96050fe57e)!
</Callout>
