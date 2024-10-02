---
title: Program Derived Addresses (PDAs)
objectives:
  - Explain Program Derived Addresses (PDAs)
  - Explain various use cases of PDAs
  - Describe how PDAs are derived
  - Use PDA derivations to locate and retrieve data
description: "Get a deeper understanding of PDAs."
---

## Summary

- A **Program Derived Address** (PDA) is derived from a **program ID** and an
  optional list of **seeds**
- The program that derives PDAs owns and controls them.
- PDA derivation provides a deterministic way to find data based on the seeds
  used for the derivation
- Seeds can be used to map to the data stored in a separate PDA account
- A program can sign instructions on behalf of the PDAs derived from its ID

## Lesson

### What is a Program Derived Address?

Program Derived Addresses (PDAs) are addresses that, instead of being public
keys, are calculated (or 'found') based on a combination of:

- The program ID
- A set of "seeds" determined by the programmer.

More on this later, but these seeds will play a role in using PDAs for data
storage and retrieval.

PDAs serve two main functions:

1. Provide a deterministic way to find a given item of data for a program
2. Authorize the program that owns a PDA to sign on the PDAs behalf, just like a
   user signs for their own account using their secret key.

This lesson will focus on using PDAs to find and store data. We'll discuss
signing with a PDA more thoroughly in a future lesson, where we will cover
Cross-Program Invocations (CPIs).

### Finding PDAs

Technically, PDAs are _found_ or _derived_ based on a program ID and one or more
input seeds.

Unlike other Solana accounts, PDAs are not public keys and don't have secret
keys. Since public keys are on Solana's Ed25519 curve, PDAs are sometimes called
'off curve addresses'.

PDAs are found using a hashing function that deterministically generates a PDA
using the program ID and seeds. Both Solana frontend and backend code can
determine an address using the program ID and seeds, and the same program with
the same seeds always results in the same Program Derived Address.

### Seeds

"Seeds" are inputs in the `find_program_address` function. While you, the
developer, determine the seeds to pass into the `find_program_address` method,
`find_program_address` method adds an additional numeric seed called a bump seed
that is used to ensure the address is _off_ the Ed25519 curve, ie, is not a
valid public key and does not have a corresponding secret key.

`find_program_address` uses a loop to calculate the off curve address, starting
with the bump seed value 255 and checks if the output is a public key address
(on the curve) or not a valid public key (off the curve). If an an off-curve
address is not found, the method decrements the bump seed by subtracting one and
tries again (`255`, `254`, `253`, et cetera). When the method finds a valid PDA,
it returns the PDA and the canonical bump seed that derived it.

If the resulting PDA is on the Ed25519 curve, then an error
`PubkeyError::InvalidSeeds` is returned.

A PDA allows a maximum of `16` seeds, with each seed limited to `32` bytes in
length. If a seed exceeds this length or the number of seeds surpasses the
limit, the system returns the error `PubkeyError::MaxSeedLengthExceeded,`
indicating that the `Length of the seed is too long for address generation`.
Developers commonly use static strings and public keys as seeds.

The
[PublicKey](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#)
type has multiple methods that find a PDA within a Solana program:

1. `find_program_address`
2. `try_find_program_address`
3. `create_program_address`

These methods takes an optional list of "seeds" and a `program ID` as inputs and
can return the PDA and a bump seed or an error and a PDA.

### 1. find_program_address

The source code for `find_program_address`:

```rust
pub fn find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> (Pubkey, u8) {
    Self::try_find_program_address(seeds, program_id)
        .unwrap_or_else(|| panic!("Unable to find a viable program address bump seed"))
}
```

Under the hood, the `find_program_address` method passes the input `seeds` and
`program_id` to the `try_find_program_address` method.

### 2. try_find_program_address

The `try_find_program_address` method then introduces the `bump_seed`. The
`bump_seed` is a `u8` variable with a value between 0 and 255. Iterating over a
descending range starting from 255, a `bump_seed` is appended to the optional
input seeds passed to the `create_program_address` method. If the output of
`create_program_address` is not a valid PDA, the `bump_seed` is decreased by one
and continues the loop until it finds a valid PDA.

```rust
pub fn try_find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> Option<(Pubkey, u8)> {
    //..
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

    // ...
}
```

We can see that the `try_find_program_address` calls the
`create_program_address` method.

```rust
pub fn try_find_program_address(seeds: &[&[u8]], program_id: &Pubkey) -> Option<(Pubkey, u8)> {
    // ...
    for _ in 0..std::u8::MAX {
        {
            // `create_program_address` is called here
            match Self::create_program_address(&seeds_with_bump, program_id) {
               //...
            }
        }
        //...
    }
}

```

### 3. create_program_address

The `create_program_address` method performs a hashing operation over the seeds
and `program_id`. These operations compute a key and verify whether it lies on
the Ed25519 elliptic curve. If a valid PDA is found (i.e., an address that is
_off_ the curve), then either the PDA or an error is returned.

The source code for `create_program_address`:

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

    //..
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

    // ...
}
```

When an error occurs during the invocation of the `find_program_address` method,
it's essential to handle it effectively. Though statistically improbable, the
system returns the error `Unable to find a viable program address bump seed`
whenever it finds a PDA that lies on the curve. The `try_find_program_address`
method is used instead of panicking.

Locating a valid PDA off the Ed25519 curve can be time-consuming due to the
iterations on the canonical bump seed. This operation can consume a variable
amount of the program's compute budget. Developers can optimize the performance
and lower the compute budget of programs by passing the `bump_seed`(also called
the canonical bump), and the user-supplied seeds as part of the instruction
data, and then deserialize the seed and canonical bump. These deserialized
outputs can then be passed to the `create_program_address` method to derive the
PDA. It's important to note that the `create_program_address` method incurs a
fixed cost to the compute budget.

Address collisions can occur since the seeds are passed as a slice of bytes,
meaning that the seeds `{abcdef}`, `{abc, def}` and `{ab, cd, ef}` will result
in the same PDA being generated. In some cases, developers may wish to prevent
collisions by adding separator characters like hyphens.

In summary, the `find_program_address` method passes the input seeds and
`program_id` to the `try_find_program_address` method. The
`try_find_program_address` method starts with a `bump_seed` of 255, adds it to
the input seeds, and then repeatedly calls the `create_program_address` method
until it finds a valid PDA. Once found, both the PDA and the `bump_seed` are
returned.

Note that different valid bumps generate different valid PDAs for the same input
seeds. The `bump_seed` returned by `find_program_address` will always be the
first valid PDA found.

Using the canonical bump when generating a PDA onchain is crucial. Starting with
a `bump_seed` value of `255` and iterating downward to `0` ensures that the
returned seed will always be the most significant valid `8-bit` value possible.
This `bump_seed` is commonly known as the "_canonical bump_". It's a best
practice always to use the canonical bump and validate every PDA passed into
your program to ensure the integrity of the process.

One point to emphasize is that the `find_program_address` method only returns a
Program-Derived Address and the bump seed used to derive it. The method does not
initialize a new account, nor is any PDA returned by the method necessarily
associated with an account that stores data.

### Use PDA accounts to store data

Solana programs are stateless, so state is stored in separate accounts from
where the program's executable is stored. Although programs can use the System
Program to create non-PDA accounts for data storage, PDAs are the choice for
storing program-related data. This choice is popular because the seeds and
canonical bump directly map to the same PDA, and the program specified as the
program ID can sign on its behalf.

Program Derived Addresses (PDAs) are account keys only the program can sign on
its behalf. During cross-program invocations, the program can "sign" for the key
by calling `invoke_signed` and providing the same seeds used to generate the
address, along with the calculated bump seed. The runtime then verifies that the
program associated with the address is the caller and thus authorized to sign.

If you need a refresher on how to store data in PDAs, have a look at the
[State Management lesson](/content/courses/native-onchain-development/program-state-management).

### Map to data stored in PDA accounts

Storing data in PDA accounts is only half of the equation. Retrieving the data
is the other half. We'll talk about two approaches:

1. Creating a PDA "map" account that stores the addresses of various accounts
   where data is stored
2. Strategically using seeds to locate the appropriate PDA accounts and retrieve
   the necessary data

### Map to data using PDA "map" accounts

For example, imagine a note-taking app where the underlying program generates
PDA accounts using random seeds, with each account storing an individual note.
Additionally, the program derives a single global PDA account, called the "map"
account, using a static seed like "GLOBAL_MAPPING." This map account maintains a
mapping of users' public keys to the list of PDAs where their notes are stored.

To retrieve a user's notes, a lookup of the map account is performed to check
the list of addresses associated with a user's public key and retrieve the
account for each address.

While such a solution is more approachable for traditional web developers, it
has some drawbacks that are particular to web3 development. Since the map size
stored in the map account will grow over time, each time you create a new note,
you must either allocate more space than necessary when creating the account or
reallocate space. Additionally, you will eventually reach the account size limit
of 10 megabytes.

You can mitigate this issue to a certain degree by creating a separate map
account for each user. For example, you can construct a PDA map account per user
rather than having a single PDA map account for the entire program. These map
accounts are with the user's public key. You can then store the addresses for
each note inside the corresponding user's map account.

This approach reduces the size required for each map account but ultimately
still adds an unnecessary requirement to the process: having to read the
information on the map account _before_ being able to find the accounts with the
relevant note data.

There are instances where this approach is a viable choice for an application,
but it should be different from the default or recommended strategy.

### Map to data using PDA derivation

If you're strategic about the seeds you use to derive PDAs, you can embed the
required mappings into them. It is the natural evolution of the note-taking app
example we just discussed. If you start to use the note creator's public key as
a seed to create one map account per user, then why not use both the creator's
public key and some other known piece of information to derive a PDA for the
note?

We've been mapping seeds to accounts this entire course and have yet to discuss
it explicitly. Think about the Movie Review program we've built in previous
lessons. This program uses a review creator's public key and the title of the
movie they're reviewing to find the address that _should_ be used to store the
review. This approach lets the program create a unique address for every new
review while making it easy to locate a review when needed. When you want to
find a user's review of "Spiderman", you can derive the PDA account's address
using the user's public key and the text "Spiderman" as seeds.

```rust
let (pda, bump_seed) = Pubkey::find_program_address(
    &[initializer.key.as_ref(), title.as_bytes().as_ref()],
    program_id,
);
```

### Associated token account addresses

Another practical example of this mapping type is determining associated token
account (ATA) addresses. An ATA is an address used to hold the tokens for a
specific account - for example, Jane's USDC account. The ATA address is derived
using:

- the wallet address of the user
- the mint address of the token
- the token program used - either the older token program or the newer
  [token extensions program ID](https://docs.rs/spl-token-2022/latest/spl_token_2022/fn.id.html).

```toml
# ...
[dependencies]
spl-token-2022 = "<latest_version_here>"
spl-associated-token-account = "<latest_version_here>"
```

```rust
// Get the token extensions program ID
let token2022_program = spl_token_2022::id();
let associated_token_address = spl_associated_token_account::get_associated_token_address_with_program_id(&wallet_address, &token_mint_address, &token2022_program);
```

Under the hood, the associated token address is a PDA found using the
`wallet_address`, `token_program_id`, and `token_mint_address` as seeds,
providing a deterministic way to find a token account associated with any wallet
address for a specific token mint.

```rust
fn get_associated_token_address_and_bump_seed_internal(
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

The mappings between seeds and PDA accounts you use will depend highly on your
specific program. While this isn't a lesson on system design or architecture,
it's worth calling out a few guidelines:

- Use seeds known at the time of PDA derivation
- Be thoughtful about how you group data into a single account
- Be thoughtful about the data structure used within each account
- Simpler is usually better

## Lab

Let's practice with the Movie Review program we've worked on in previous
lessons. No worries if you're jumping into this lesson without doing the last
lesson - it should be possible to follow along either way.

As a refresher, the Movie Review program lets users create movie reviews. These
reviews are stored in an account using a PDA derived from the initializer's
public key and the movie title they are reviewing.

Previously, we finished implementing the ability to update a movie review
securely. In this lab, we'll add the ability for users to comment on a movie
review. We'll use building this feature as an opportunity to work through how to
structure the comment storage using PDA accounts.

### 1. Get the starter code

To begin, you can find
[the movie program starter code](https://github.com/solana-developers/movie-program/tree/starter)
on the `starter` branch.

If you've been following along with the Movie Review labs, you'll notice that
this is the program we've built out so far. Previously, we
used [Solana Playground](https://beta.solpg.io/) to write, build, and deploy our
code. In this lesson, we'll develop and deploy the program locally. Ensure that
`solana-test-validator` is running.

Open the folder, then run `cargo build-bpf` to build the program. The
`cargo build-bpf` command will output a shared library for deployment inside the
`./target/deploy/` path.

The `./target/deploy/` directory contains the shared library in the format
`<program_name_in_snake_case>.so` and the keypair that includes the public key
of the program in the format `<program_name_in_snake_case>-keypair.json`.

```sh
cargo build-bpf
```

Deploy the program by copying the output of `cargo build-bpf` and running the
`solana program deploy` command.

```sh
solana program deploy <PATH>
```

You can test the program by using the movie review
[frontend](https://github.com/solana-developers/movie-frontend/tree/solution-update-reviews)
and updating the program ID with the one you've just deployed. Make sure you use
the `solution-update-reviews` branch.

### 2. Plan out the account structure

Adding comments means we must make a few decisions about storing the data
associated with each comment. The criteria for a good structure here are:

- Not overly complicated
- Data is easily retrievable
- Each comment has something to link it to the review it's associated with

To do this, we'll create two new account types:

- Comment counter account
- Comment account

There will be one comment counter account per review, and one account linked to
each comment posted. The comment counter account will be linked to a given
review by using the review's address as a seed for finding the comment counter
PDA. It will also use the static string "comment" as a seed.

Link the comment account to a review in the same way. However, it will not
include the "comment" string as a seed; instead, it will use the _actual comment
count_ as a seed. That way, the client can easily retrieve comments for a given
review by doing the following:

1. Read the data on the comment counter account to determine the number of
   comments on a review.
2. Where `n` is the total number of comments on the review, loop `n` times. Each
   loop iteration will derive a PDA using the review address and the current
   number as seeds. The result is the `n` number of PDAs, each of which is the
   address of an account that stores a comment.
3. Fetch the accounts for each of the `n` PDAs and read the stored data.

Every one of our accounts can be deterministically retrieved using data that is
already known ahead of time.

To implement these changes, do the following:

- Define structs to represent the comment counter and comment accounts
- Update the existing `MovieAccountState` to contain a discriminator (more on
  this later)
- Add an instruction variant to represent the `add_comment` instruction
- Update the existing `add_movie_review` instruction processing function to
  include creating the comment counter account
- Create a new `add_comment` instruction processing function

### 3. Define MovieCommentCounter and MovieComment structs

Recall that the `state.rs` file defines the structs our program uses to populate
the data field of a new account.

We'll need to define two new structs to enable commenting.

1. `MovieCommentCounter` - to store a counter for the number of comments
   associated with a review
2. `MovieComment` - to store data associated with each comment

Let's define the structs we'll be using for our program. We add a
`discriminator` field to each struct, including the existing
`MovieAccountState`. Since we now have multiple account types, we only need a
way to fetch the account type we need from the client. This discriminator is a
string that will filter through accounts when we fetch our program accounts.

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
    pub counter: u64,
}

#[derive(BorshSerialize, BorshDeserialize)]
pub struct MovieComment {
    pub discriminator: String,
    pub is_initialized: bool,
    pub review: Pubkey,
    pub commenter: Pubkey,
    pub comment: String,
    pub count: u64,
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
account size calculation needs to change. Let's clean up some of our code. We'll
add an implementation for each of the three structs above that adds a constant
`DISCRIMINATOR` and either a constant `SIZE` or method `get_account_size` to
quickly get the size needed when initializing an account.

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

Now, we can use this implementation everywhere we need the discriminator or
account size and not risk unintentional typos.

### 4. Create AddComment instruction

Recall that the `instruction.rs` file defines the instructions our program will
accept and how to deserialize the data for each. We need to add a new
instruction variant for adding comments. Let's start by adding a new variant
`AddComment,` to the `MovieInstruction` enum.

```rust
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
}
```

Next, let's create a `CommentPayload` struct to represent the instruction data
associated with this new instruction. Most of the data we'll include in the
account are public keys associated with accounts passed into the program, so the
only thing we need here is a single field to represent the comment text.

```rust
#[derive(BorshDeserialize)]
struct CommentPayload {
    comment: String,
}
```

Now, update the unpacking of the instruction data. Notice that we've moved the
deserialization of instruction data into each matching case using the associated
payload struct for each instruction.

```rust
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        Ok(match variant {
            0 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::AddMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                }
            }
            1 => {
                let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
                Self::UpdateMovieReview {
                    title: payload.title,
                    rating: payload.rating,
                    description: payload.description,
                }
            }
            2 => {
                let payload = CommentPayload::try_from_slice(rest).unwrap();
                Self::AddComment {
                    comment: payload.comment,
                }
            }
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
```

Lastly, update the `process_instruction` function in `processor.rs` to use our
new instruction variant.

In `processor.rs`, import the new structs from `state.rs` into scope.

```rust
use crate::state::{MovieAccountState, MovieCommentCounter, MovieComment};
```

Then in `process_instruction`, match our deserialized `AddComment` instruction
data to the `add_comment` function we will be implementing shortly.

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

### 5. Update add_movie_review to create a comment counter account.

Before implementing the `add_comment` function, we need to update the
`add_movie_review` function to create the review's comment counter account.

Remember that this account will keep track of the total number of comments for
an associated review. Its address will be a PDA derived using the movie review
address and the word "comment" as seeds. Note that how we store the counter is
simply a design choice. We could add a "counter" field to the original movie
review account.

Within the `add_movie_review` function, let's add a `pda_counter` to represent
the new counter account we'll be initializing along with the movie review
account. Now, expect four accounts passed into the `add_movie_review` function
through the `accounts` argument.

```rust
let account_info_iter = &mut accounts.iter();

let initializer = next_account_info(account_info_iter)?;
let pda_account = next_account_info(account_info_iter)?;
let pda_counter = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;
```

Next, there's a check to ensure `total_len` is less than 1000 bytes, but
`total_len` is no longer accurate since we added the discriminator. Let's
replace `total_len` with a call to `MovieAccountState::get_account_size`:

```rust
let account_len: usize = 1000;

if MovieAccountState::get_account_size(title.clone(), description.clone()) > account_len {
    msg!("Data length is larger than 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into());
}
```

Remember to update the code within the `update_movie_review` function for that
instruction to work correctly.

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
`add_movie_review` function by:

1. Calculating the rent exemption amount for the counter account
2. Deriving the counter PDA using the review address and the string "comment" as
   seeds
3. Invoking the system program to create the account
4. Set the starting counter value
5. Serialize the account data and return from the function

Add these steps to the end of the `add_movie_review` function before the
`Ok(())`.

```rust
msg!("create comment counter");
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
msg!("comment counter created");

let mut counter_data =
    try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

msg!("checking if counter account is already initialized");
if counter_data.is_initialized() {
    msg!("Account already initialized");
    return Err(ProgramError::AccountAlreadyInitialized);
}

counter_data.discriminator = MovieCommentCounter::DISCRIMINATOR.to_string();
counter_data.counter = 0;
counter_data.is_initialized = true;
msg!("comment count: {}", counter_data.counter);
counter_data.serialize(&mut &mut pda_counter.data.borrow_mut()[..])?;
```

The function initializes two accounts whenever it creates a new review:

1. The first is the review account, which stores the review's contents. This is
   unchanged from the program's version we started with.
2. The second account stores the counter for comments

### 6. Implement add_comment

Finally, implement the `add_comment` function to create new comment accounts.

When creating a new comment for a review, the counter will be incremented on the
comment counter PDA account, and the PDA for the comment account will be derived
using the review address and current count.

Like other instruction processing functions, we'll start by iterating through
accounts passed into the program. Then, before we do anything else, we need to
deserialize the counter account, so we have access to the current comment count:

```rust
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String,
) -> ProgramResult {
    msg!("Adding Comment...");
    msg!("Comment: {}", comment);

    let account_info_iter = &mut accounts.iter();

    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let mut counter_data =
        try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

    Ok(())
}
```

Now that we have access to the counter data, we can continue with the remaining
steps:

1. Calculate the rent-exempt amount for the new comment account
2. Derive the PDA for the comment account using the review address and the
   current comment count as seeds
3. Invoke the System Program to create the new comment account
4. Set the appropriate values to the newly created account
5. Serialize the account data and return from the method

```rust
pub fn add_comment(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    comment: String,
) -> ProgramResult {
    msg!("Adding Comment...");
    msg!("Comment: {}", comment);

    let account_info_iter = &mut accounts.iter();

    let commenter = next_account_info(account_info_iter)?;
    let pda_review = next_account_info(account_info_iter)?;
    let pda_counter = next_account_info(account_info_iter)?;
    let pda_comment = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    let mut counter_data =
        try_from_slice_unchecked::<MovieCommentCounter>(&pda_counter.data.borrow()).unwrap();

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

    let mut comment_data =
        try_from_slice_unchecked::<MovieComment>(&pda_comment.data.borrow()).unwrap();

    msg!("checking if comment account is already initialized");
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

Build the updated program by running `cargo build-bpf`. Run the command
`solana program deploy <path-to-the-program>` to deploy the program.

You can test your program by submitting a transaction with the correct
instruction data. You can create your script or use
[this frontend](https://github.com/solana-developers/movie-frontend/tree/solution-add-comments).
Be sure to use the `solution-add-comments` branch and replace the
`MOVIE_REVIEW_PROGRAM_ID` in `utils/constants.ts` with your program's ID, or the
frontend won't work with your program.

Remember that we made breaking changes to the review accounts (i.e., adding a
discriminator). If you were to use the same program ID you've used before adding
the discriminator when deploying this program, none of the reviews you created
will show on this frontend due to a data mismatch.

If you need more time with this project to feel comfortable with these concepts,
have a look at
the [solution code](https://github.com/solana-developers/movie-program/tree/solution-add-comments)
before continuing. Note that the solution code is on the `solution-add-comments`
branch of the linked repository.

## Challenge

Now it's your turn to build something independently! Go ahead and work with the
Student Intro program that we've used in past lessons. The Student Intro program
is a Solana program that lets students introduce themselves. This program takes
a user's name and a short message as the `instruction_data` and creates an
account to store the data onchain. For this challenge, you should:

1. Add an instruction allowing other users to reply to an intro
2. Build and deploy the program locally

If you haven't been following along with past lessons or haven't saved your work
from before, feel free to use the starter code on the `starter` branch of
[solana-student-intro-program](https://github.com/solana-developers/student-intro-program/tree/starter).

Try to do this independently! If you get stuck, though, you can reference the
[solution code](https://github.com/solana-developers/student-intro-program/tree/solution-add-replies).
Note that the solution code is on the `solution-add-replies` branch and that
your code may look slightly different.

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and [tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=89d367b4-5102-4237-a7f4-4f96050fe57e)!
</Callout>
