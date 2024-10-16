---
title: Create a Basic Program, Part 3 - Basic Security and Validation
objectives:
  - Understand why "thinking like an attacker" is essential in securing Solana
    programs.
  - Learn and implement core security practices to protect your program.
  - Perform owner and signer checks to verify account ownership and transaction
    authenticity.
  - Validate the accounts passed into your program to ensure they are what you
    expect.
  - Conduct basic data validation to prevent invalid or malicious input from
    compromising your program.
description:
  "Learn how to secure your Solana program with ownership, signer, and account
  validation checks."
---

## Summary

- **Thinking like an attacker** involves understanding how to exploit weaknesses,
  bypass defenses, avoid detection, and manipulate systems or people to achieve
  a goal.
- Perform **owner checks** to ensure that the provided account is owned by the
  public key you expect, for example, ensuring that an account you expect to be
  a PDA is owned by `program_id`
- Perform **signer checks** to ensure that any account modification has been
  signed by the right party or parties
- **Account validation** entails ensuring that provided accounts are the
  accounts you expect them to be, for example, deriving PDAs with the expected
  seeds to make sure the address matches the provided account
- **Data validation** entails ensuring that any provided data meets the criteria
  required by the program

## Lesson

In the last two lessons, we worked through building a Movie Review program
together. The end result is pretty cool! It's exciting to get something working
in a new development environment.

Proper program development, however, doesn't end at "get it working." It's
crucial to carefully consider potential points of failure in your code and take
steps to mitigate them. Failure points are where undesirable behavior in your
code could potentially occur. Whether the undesirable behavior happens due to
users interacting with your program unexpectedly or bad actors intentionally
trying to exploit your program, anticipating failure points is essential to
secure program development.

Remember, **once your program is deployed, you have no control over the
transactions sent to it**. You can only control how your program handles them.
While this lesson is far from a comprehensive overview of program security,
we'll cover some basic pitfalls to look out for.

### Think like an attacker

[Neodyme](https://workshop.neodyme.io/) gave a presentation at Breakpoint 2021
entitled "Think Like An Attacker: Bringing Smart Contracts to Their Break(ing)
Point." If there's one thing you take away from this lesson, it should be that
you now think like an attacker.

In this lesson, we can't cover every potential issue that could arise with your
programs. Ultimately, every program will have different security risks
associated with it. While understanding common pitfalls is _essential_ to
engineering good programs, it is _insufficient_ for deploying secure ones. To
ensure complete security coverage, you must approach your code with the right
mindset.

As Neodyme mentioned in their presentation, the right mindset requires moving
from "Is this broken?" to "How do I break this?" Grasping this concept is the
first and most essential step in understanding what your code _does_ rather than
what you wrote it to do.

#### Every Program Can Be Compromised

It's not a question of "if."

Instead, it's a question of "how much effort and dedication would it take."

Our job as developers is to close as many holes as possible and increase the
effort and dedication required to break our code. For instance, in the Movie
Review program created in the past two lessons, we implemented code to set up
new accounts for managing movie reviews. If we examine the code more closely,
we'll see how the program inadvertently enables various issues, which may be
uncovered by considering, 'How do I break this? We'll dig into some of these
problems and how to fix them in this lesson, but remember that memorizing a few
pitfalls isn't sufficient. It's up to you to change your mindset toward
security.

### Error handling

Before we dive into some of the common security pitfalls and how to avoid them,
it's crucial to know how to use errors in your program. While your code can
handle some issues gracefully, other issues will require that your program stop
execution and return a program error.

#### Creating Custom Errors

Solana's
[`solana_program`](https://docs.rs/solana-program/latest/solana_program/) crate
provides a generic
[`ProgramError`](https://docs.rs/solana-program/latest/solana_program/program_error/enum.ProgramError.html)
enum for error handling. However, custom errors allow you to provide more
detailed, context-specific information that helps during debugging and testing.

We can define our error types by creating an enum listing the errors we want to
use. For example, the `NoteError` contains variants `Forbidden` and
`InvalidLength`. The enum is made into a Rust `Error` type by using the `derive`
attribute macro to implement the `Error` trait from the
[`thiserror`](https://docs.rs/thiserror/latest/thiserror/) library. Each error
type also has its own `#[error("...")]` notation. This lets you provide an error
message for each particular error type.

Here's an example of how you can define custom errors in your program:

```rust
use solana_program::program_error::ProgramError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum NoteError {
    #[error("Unauthorized access - You don't own this note.")]
    Forbidden,

    #[error("Invalid note length - The text exceeds the allowed limit.")]
    InvalidLength,
}
```

In this example, we create custom errors for unauthorized access and invalid
data input (such as note length). Defining custom errors gives us greater
flexibility when debugging or explaining what went wrong during execution.

#### Returning Errors

The compiler expects errors returned by the program to be of type `ProgramError`
from the `solana_program` crate. That means we won't be able to return our
custom error unless we can convert it to this type. The following implementation
handles conversion between our custom error and the `ProgramError` type:

```rust
impl From<NoteError> for ProgramError {
    fn from(e: NoteError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

To return the custom error from the program, directly use the `into()` method to
convert the error into an instance of `ProgramError`:

```rust
if pda != *note_pda.key {
    return Err(NoteError::Forbidden.into());
}
```

### Basic security checks

While these won't comprehensively secure your program, there are a few security
checks you can keep in mind to fill in some of the gaps in your code:

- Ownership checks - verify that an account is owned by the program, ensuring
  proper authorization
- Signer checks - used to verify that an account has signed a transaction
- General Account Validation - used to verify that an account is the expected
  account
- Data Validation - used to verify the inputs provided by a user

#### Ownership checks

An ownership check validates that an account is associated with the correct
public key. Let's use the note-taking app example that we've referenced in
previous lessons. In this app, users can create, update, and delete notes stored
by the program in PDA accounts.

When a user invokes the `update` instruction, they are required to provide a
`pda_account`. We presume the provided `pda_account` is for the particular note
they want to update, but the user can input any instruction data they want. They
could even send data that matches the data format of a note account but was not
created by the note-taking program. This security vulnerability is one potential
way to introduce malicious code.

The simplest way to avoid this problem is to check that the owner of an account
is the public key you expect it to be. In this case, we expect the note account
to be a PDA account owned by the program. When this is not the case, we can
report it as an error accordingly.

```rust
if note_pda.owner != program_id {
    return Err(ProgramError::InvalidNoteAccount);
}
```

As a side note, using PDAs whenever possible is more secure than trusting
externally owned accounts, even if they are owned by the transaction signer. The
only accounts the program has complete control over are PDA accounts, making
them the most secure.

#### Signer checks

A signer check verifies that the intended parties have signed a transaction. In
the note-taking app, for example, we would want to verify that the note creator
signed the transaction before we process the `update` instruction. Otherwise,
anyone can update another user's notes by simply passing in the user's public
key as the initializer.

```rust
if !initializer.is_signer {
    msg!("Missing required signature");
    return Err(ProgramError::MissingRequiredSignature);
}
```

#### General account validation

In addition to checking the signers and owners of accounts, it's crucial to
ensure that the provided accounts are what your code expects them to be. For
example, you should validate that the provided PDA account's address is derived
from the correct seeds. Doing this confirms that the account you expected is the
one you need. In the note-taking app example, that would mean ensuring that you
can derive a matching PDA using the note creator's public key and the ID as
seeds (that's what we're assuming was used when creating the note). That way, a
user couldn't accidentally pass in a PDA account for the wrong note, or more
importantly, the user isn't passing in a PDA account that represents somebody
else's note entirely.

```rust
let (pda, bump_seed) = Pubkey::find_program_address(
    &[note_creator.key.as_ref(), id.as_bytes().as_ref(),],
    program_id,
);

if expected_pda != *note_pda.key {
    msg!("Invalid seeds for PDA");
    return Err(ProgramError::InvalidArgument);
}
```

### Data validation

Similar to validating accounts, you should also validate any data submitted by
the user.

For example, you may have a game program where a user can allocate character
attribute points to various categories. You may have a maximum limit in each
category of 100, in which case you would want to verify that the existing
allocation of points plus the new allocation doesn't exceed the maximum.

```rust
if character.agility + new_agility > 100 {
    msg!("Total attribute points for agility cannot exceed 100");
    return Err(AttributeError::TooHigh.into());
}
```

Or, the character may have an allowance of attribute points they can allocate,
and you should ensure they don't exceed that allowance.

```rust
if attribute_allowance < new_agility {
    msg!("Trying to allocate more points than allowed");
    return Err(AttributeError::ExceedsAllowance.into());
}
```

Without these checks, program behavior would differ from what you expect. In
some cases, however, it's more than just an issue of undefined behavior.
Sometimes, failure to validate data can result in financially devastating
security loopholes.

For example, consider that the character in these examples is an NFT. Suppose
the program permits the NFT to earn token rewards based on its attribute points.
Without proper data validation, a malicious actor could assign an excessively
high number of attribute points and rapidly deplete your treasury of rewards
designed to be distributed more fairly among a larger pool of staked NFTs.

#### Integer overflow and underflow

Rust integers have fixed sizes. Such a limitation means they can only support a
specific range of numbers. An arithmetic operation that results in a higher or
lower value than what is supported by the range will cause the resulting value
to wrap around. For example, a `u8` only supports numbers 0-255, so the result
of addition that would be 256 would be 0, 257 would be 1, etc. It is crucial to
consider this, especially when dealing with any code involving real value, such
as depositing and withdrawing tokens.

To avoid integer overflow and underflow, either:

1. Have logic in place that ensures overflow or underflow _cannot_ happen or
2. Use checked math like `checked_add` instead of `+`

   ```rust
   let first_int: u8 = 5;
   let second_int: u8 = 255;
   match first_int.checked_add(second_int) {
    Some(sum) => println!("Sum: {}", sum),
    None => println!("Overflow occurred"),
   }

   ```

## Lab

We will practice with the Movie Review program we worked on in previous lessons.
No worries if you are jumping into this lesson without having done the earlier
lesson - it should be possible to follow along either way.

As a reminder, the Movie Review program allows users to store movie reviews in
their PDA accounts. In our previous lesson, we finished implementing the basic
functionality of adding a movie review. Now, we'll add some security checks to
the functionality we already created and add the ability to update a movie
review securely.

We'll use [Solana Playground](https://beta.solpg.io/) to write, build, and
deploy our code.

### 1. Get the starter code

To begin working, you can find
[the movie review starter code](https://beta.solpg.io/62b552f3f6273245aca4f5c9).
If you've been following along with the Movie Review labs, you'll notice that
we've refactored our program.

The refactored starter code is almost the same as what it was before. Since
`lib.rs` was getting rather large and unwieldy, we've separated its code into 3
files: `lib.rs`, `entrypoint.rs`, and `processor.rs`. `lib.rs` now _only_
registers the code's modules, `entrypoint.rs` _only_ defines and sets the
program's entrypoint, and `processor.rs` handles the program logic for
processing instructions. We've also added an `error.rs` file where we'll be
defining custom errors. The complete file structure is as follows:

- **lib.rs** - register modules
- **entrypoint.rs -** entry point to the program
- **instruction.rs -** serialize and deserialize instruction data
- **processor.rs -** program logic to process instructions
- **state.rs -** serialize and deserialize state
- **error.rs -** custom program errors

In addition to some changes to the file structure, we've updated a small amount
of code that will let this lab focus on security without having you write
unnecessary boilerplate.

Since we will be allowing updates to movie reviews, we also changed
`account_len` in the `add_movie_review` function (now in `processor.rs`).
Instead of calculating the size of the review and setting the account length to
only as large as it needs to be, we are simply going to allocate 1000 bytes to
each review account. This approach eliminates the requirement to reallocate
space or recalculate rent when a movie review is updated.

We went from this:

```rust
let account_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());
```

To this:

```rust
let account_len: usize = 1000;
```

The [realloc](https://docs.rs/solana-sdk/latest/solana_sdk/account_info/struct.AccountInfo.html#method.realloc) method
has recently been introduced by Solana Labs, allowing you to adjust the size of
your accounts. We will not use this method for this lab, but it is something to
be aware of.

Finally, we've also implemented some additional functionality for our
`MovieAccountState` struct in `state.rs` using the `impl` keyword.

For our movie reviews, we want the ability to check whether an account has
already been initialized. To do this, we create an `is_initialized` function
that checks the `is_initialized` field on the `MovieAccountState` struct.

`Sealed` is Solana's version of Rust's `Sized` trait. This simply specifies that
`MovieAccountState` has a known size and provides for some compiler
optimizations.

```rust filename="state.rs"
impl Sealed for MovieAccountState {}

impl IsInitialized for MovieAccountState {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}
```

Before proceeding, ensure you fully understand the program's current state. Look
through the code and spend some time thinking through any spots that are
confusing to you. It may be helpful to compare the starter code to the
[solution code from the previous lesson](https://beta.solpg.io/62b23597f6273245aca4f5b4).

### 2. Custom Errors

Let's begin by writing our custom program errors. We'll need mistakes that we
can use in the following situations:

- The update instruction has been invoked on an account that hasn't been
  initialized yet
- The provided PDA doesn't match the expected or derived PDA
- The input data is larger than the program allows
- The rating provided does not fall in the 1-5 range

The starter code includes an empty `error.rs` file. Open that file and add
errors for each of the above cases.

```rust filename="error.rs"
use solana_program::{program_error::ProgramError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ReviewError{
    // Error 0
    #[error("Account not initialized yet")]
    UninitializedAccount = 100,
    // Error 1
    #[error("PDA derived does not equal PDA passed in")]
    InvalidPDA = 101,
    // Error 2
    #[error("Input data exceeds max length")]
    InvalidDataLength = 102,
    // Error 3
    #[error("Rating greater than 5 or less than 1")]
    InvalidRating = 103,
}

impl From<ReviewError> for ProgramError {
    fn from(e: ReviewError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

Note that in addition to adding the error cases, we also added an implementation
that lets us convert our error into a `ProgramError` type as needed.

Before moving on, let’s bring `ReviewError` into scope in the `processor.rs`. We
will be using these errors shortly when we add our security checks.

```rust filename="processor.rs"
use crate::error::ReviewError;
```

### 3. Add Security Checks to add_movie_review

Now that we have custom errors, let's implement some security checks to our
`add_movie_review` function.

#### Signer check

The first step is to verify that the `initializer` of a review is also a signer
on the transaction. Doing this ensures that you can't submit movie reviews
impersonating somebody else. We'll put this check right after iterating through
the accounts.

```rust filename="processor.rs"
let account_info_iter = &mut accounts.iter();

let initializer = next_account_info(account_info_iter)?;
let pda_account = next_account_info(account_info_iter)?;
let system_program = next_account_info(account_info_iter)?;

if !initializer.is_signer {
    msg!("Missing required signature");
    return Err(ProgramError::MissingRequiredSignature)
}
```

#### Account validation

Next, let us ensure the `pda_account` passed in by the user is the `pda` we
expect. Recall we derived the `pda` for a movie review using the `initializer`
and `title` as seeds. Within our instruction, we’ll derive the `pda` again and
then check if it matches the `pda_account`. If the addresses do not match, we’ll
return our custom `InvalidPDA` error.

```rust
// Derive the expected PDA for the movie review
let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), account_data.title.as_bytes().as_ref(),], program_id);

// Ensure the provided PDA account matches the expected PDA
if pda != *pda_account.key {
    msg!("Invalid PDA: expected {} but got {}", pda, pda_account.key);
    return Err(ReviewError::InvalidPDA.into())
}
```

#### Data validation

Now, let us perform some data validation.

We will start by making sure `rating` falls within the 1 to 5 scale. If the
rating submitted by the user is not within this range, we will return our custom
`InvalidRating` error.

```rust filename="processor.rs"
if rating > 5 || rating < 1 {
    msg!("Rating must be between 1 and 5");
    return Err(ReviewError::InvalidRating.into())
}
```

Next, let's check that the content of the review does not exceed the 1000 bytes
we've allocated for the account. If the size exceeds 1000 bytes, we'll return
our custom `InvalidDataLength` error.

```rust
// Calculate total length of data:
// 1 byte for the prefix, 1 byte for the padding,
// 4 bytes for the length prefix of the title, length of the title,
// 4 bytes for the length prefix of the description, length of the description.
let total_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());
if total_len > 1000 {
    msg!("Data length exceeds the maximum allowed size of 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into())
}
```

Lastly, let's check if the account has already been initialized by calling the
`is_initialized` function we implemented for our `MovieAccountState`. If the
Lastly, let's check if the account has already been initialized by calling the
`is_initialized` function we implemented for our `MovieAccountState`. If the
account already exists, then we will return an error.

```rust
//check if the account has been initialized
if account_data.is_initialized() {
    msg!("The account is already initialized");
    return Err(ProgramError::AccountAlreadyInitialized);
}
```

Altogether, the `add_movie_review` function should look something like this:

```rust filename="processor.rs"
pub fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[UncheckedAccount],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("Adding movie review...");
    msg!("Title: {}", title);
    msg!("Rating: {}", rating);
    msg!("Description: {}", description);

    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !initializer.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature)
    }

    let (pda, bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), title.as_bytes().as_ref(),], program_id);
    if pda != *pda_account.key {
        msg!("Invalid PDA: expected {} but got {}", pda, pda_account.key);
        return Err(ReviewError::InvalidPDA.into())
    }

    if rating > 5 || rating < 1 {
        msg!("Rating must be between 1 and 5");
        return Err(ReviewError::InvalidRating.into())
    }

    let total_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());
    if total_len > 1000 {
        msg!("Data length exceeds the maximum allowed size of 1000 bytes");
        return Err(ReviewError::InvalidDataLength.into())
    }

    let account_len: usize = 1000;

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    invoke_signed(
        &system_instruction::create_account(
        initializer.key,
        pda_account.key,
        rent_lamports,
        account_len.try_into().unwrap(),
        program_id,
        ),
        &[initializer.clone(), pda_account.clone(), system_program.clone()],
        &[&[initializer.key.as_ref(), title.as_bytes().as_ref(), &[bump_seed]]],
    )?;

    msg!("PDA created: {}", pda);

    msg!("unpacking state account");
    let mut account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()).unwrap();
    msg!("Account data borrowed");

    msg!("checking if movie account is already initialized");
    if account_data.is_initialized() {
        msg!("The account is already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    account_data.title = title;
    account_data.rating = rating;
    account_data.description = description;
    account_data.is_initialized = true;

    msg!("serializing account data");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("Account data serialized successfully");

    Ok(())
}
```

### 4. Support movie review updates in `MovieInstruction`

Now that `add_movie_review` is more secure, let us turn our attention to
supporting the ability to update a movie review.

Let’s begin by updating `instruction.rs`. We’ll start by adding an
`UpdateMovieReview` variant to `MovieInstruction` that includes embedded data
for the new title, rating, and description.

```rust
// inside instruction.rs
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
    }
}
```

The payload struct can stay the same since, aside from the variant type, the
instruction data is the same as what we used for `AddMovieReview`.

We'll also update the `unpack()` function to handle `UpdateMovieReview()`.

```rust filename="instruction.rs"
// Inside instruction.rs
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Ensure there is at least one byte to determine the variant
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;

        // Attempt to deserialize the rest of the input into a MovieReviewPayload
        let payload = MovieReviewPayload::try_from_slice(rest)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        // Match the variant to the correct instruction
        match variant {
            0 => Ok(Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description,
            }),
            1 => Ok(Self::UpdateMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description,
            }),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}
```

### 5. Define update_movie_review Function

Now that we can unpack our `instruction_data` and determine which program
instruction to run, we can add `UpdateMovieReview` to the match statement in
the `process_instruction` function in the `processor.rs` file.

```rust filename="processor.rs"
// Inside processor.rs
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[UncheckedAccount],
    instruction_data: &[u8]
) -> ProgramResult {
    // unpack the instruction data
    let instruction = MovieInstruction::unpack(instruction_data)?;

    // Match the instruction to the appropriate handler function
    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            add_movie_review(program_id, accounts, title, rating, description)
        },
        // Handle the UpdateMovieReview instruction
        MovieInstruction::UpdateMovieReview { title, rating, description } => {
            update_movie_review(program_id, accounts, title, rating, description)
        },
        // Return an error for unsupported instructions
        _ => Err(ProgramError::InvalidInstructionData)
    }
}
```

Next, we can define the new `update_movie_review()` function. The definition
should have the same parameters as the definition of `add_movie_review`.

```rust filename="processor.rs"
pub fn update_movie_review(
    program_id: &Pubkey,
    accounts: &[UncheckedAccount],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {

}
```

### 6. Implement update_movie_review Function

All that's left now is to fill in the logic for updating a movie review. Only
let's make it secure from the start.

Just like the `add_movie_review()` function, let's start by iterating through
the accounts. The only accounts we'll need are the first two: `initializer` and
`pda_account`.

```rust filename="processor.rs"
pub fn update_movie_review(
    program_id: &Pubkey,
    accounts: &[UncheckedAccount],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("Updating movie review...");

    // Get Account iterator
    let account_info_iter = &mut accounts.iter();

    // Get accounts
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;

}
```

#### Ownership Check

Before we continue, let's implement some basic security checks. We will begin by
verifying that `pda_account` is owned by our program. If it isn't, we'll return
an `InvalidOwner` error.

```rust filename="processor.rs"
if pda_account.owner != program_id {
    return Err(ProgramError::InvalidOwner)
}
```

Next, let us perform a signer check to verify that the `initializer` of the
update instruction has also signed the transaction. Since we are updating the
data for a movie review, we want to ensure that the original `initializer` of
the review has approved the changes by signing the transaction. Return an error
if the `initializer` did not sign the transaction.

```rust filename="processor.rs"
if !initializer.is_signer {
    msg!("Required signature is missing");
    return Err(ProgramError::MissingRequiredSignature);
}
```

#### Account Validation

Next, let us check that the `pda_account` passed in by the user is the PDA we
expect by deriving the PDA using `initializer` and `title` as seeds. If the
addresses do not match, we will return our custom `InvalidPDA` error. We'll
implement this similarly to the approach used in the `add_movie_review`
function.

```rust filename="processor.rs"
// Derive PDA and check that it matches client
let (pda, _bump_seed) = Pubkey::find_program_address(
    &[initializer.key.as_ref(), account_data.title.as_bytes().as_ref(),],
    program_id
);

if pda != *pda_account.key {
    msg!("Derived PDA does not match the expected PDA");
    return Err(ReviewError::InvalidPDA.into())
}
```

#### Unpack pda_account and Perform Data Validation

Now that our code ensures we can trust the passed-in accounts, let's unpack the
`pda_account` and perform some data validation. We'll start by unpacking
`pda_account` and assigning it to a mutable variable called `account_data`.

```rust
msg!("Attempting to unpack state account");
let mut account_data = match try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()) {
    Ok(data) => data,
    Err(_) => {
        msg!("Failed to unpack state account");
        return Err(ProgramError::InvalidAccountData);
    }
};
msg!("State account unpacked successfully");
```

With access to the account and its fields, the first step is to ensure the
account is initialized. Since an uninitialized account can't be updated, the
program must return our custom `UninitializedAccount` error.

```rust
if !account_data.is_initialized() {
    msg!("The account has not been initialized");
    return Err(ReviewError::UninitializedAccount.into());
}
```

Next, we need to validate the `rating`, `title`, and `description` data like in
the `add_movie_review` function. We will restrict the `rating` to a scale of 1
to 5 and ensure that the total size of the review does not exceed 1000 bytes. If
the user's rating falls outside the valid range, the program will return our
custom `InvalidRating` error. If the review is too long, we will return our
custom `InvalidDataLength` error.

```rust filename="processor.rs"
if rating > 5 || rating < 1 {
    msg!("Rating must be between 1 and 5");
    return Err(ReviewError::InvalidRating.into())
}

// calculate total length of review data
let total_len: usize = 1 + 1 + (4 + account_data.title.len()) + (4 + description.len());
if total_len > 1000 {
    msg!("Review data exceeds 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into())
}
```

#### Update the movie review account

Now that we've implemented all of the security checks, we can finally update the
movie review account by updating `account_data` and re-serializing it. At that
point, we can return `Ok` from our program.

```rust filename="processor.rs"
account_data.rating = rating;
account_data.description = description;

account_data.serialize(&mut pda_account.data.borrow_mut()[..])?;

Ok(())
```

In conclusion, the `update_movie_review` function should appear as shown in the
code snippet below. We've included some additional logging for clarity in
debugging.

```rust filename="processor.rs"
pub fn update_movie_review(
    program_id: &Pubkey,
    accounts: &[UncheckedAccount],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("Starting update of movie review...");

    // Get account iterator
    let account_info_iter = &mut accounts.iter();
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;

    // Check if the PDA account is owned by the expected program
    if pda_account.owner != program_id {
        msg!("PDA account is not owned by the expected program");
        return Err(ProgramError::IllegalOwner)
    }

    // Verify that the initializer has signed the transaction
    if !initializer.is_signer {
        msg!("The initializer must sign the transaction");
        return Err(ProgramError::MissingRequiredSignature)
    }

    // Unpack the PDA account data
    msg!("Unpacking PDA account data");
    let account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow())
        .map_err(|_| {
            msg!("Failed to deserialize PDA account data");
            ProgramError::InvalidAccountData
        })?;
    msg!("Unpacked review title: {}", account_data.title);

    // Derive the PDA and validate it against the provided PDA account
    let (expected_pda, _bump_seed) = Pubkey::find_program_address(
        &[initializer.key.as_ref(), account_data.title.as_bytes().as_ref()],
        program_id
    );
    if expected_pda != *pda_account.key {
        msg!("Derived PDA does not match the provided PDA account");
        return Err(ReviewError::InvalidPDA.into())
    }

    // Ensure the account is initialized
    if !account_data.is_initialized() {
        msg!("Cannot update uninitialized account");
        return Err(ReviewError::UninitializedAccount.into());
    }

    // Validate the rating
    if rating > 5 || rating < 1 {
        msg!("Rating must be between 1 and 5");
        return Err(ReviewError::InvalidRating.into())
    }

    // Check the length of the review data
    let update_len: usize = 1 + 1 + (4 + description.len()) + account_data.title.len();
    if update_len > 1000 {
        msg!("Review data length exceeds the 1000-byte limit");
        return Err(ReviewError::InvalidDataLength.into())
    }

    // Log the review data before the update
    msg!("Review before update:");
    msg!("Title: {}", account_data.title);
    msg!("Rating: {}", account_data.rating);
    msg!("Description: {}", account_data.description);

    // Update the review fields
    account_data.rating = rating;
    account_data.description = description;

    // Log the review data after the update
    msg!("Review after update:");
    msg!("Title: {}", account_data.title);
    msg!("Rating: {}", account_data.rating);
    msg!("Description: {}", account_data.description);

    // Serialize the updated account data
    msg!("Serializing updated account data");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])
        .map_err(|_| {
            msg!("Failed to serialize updated account data");
            ProgramError::AccountDataTooSmall
        })?;
    msg!("PDA account data successfully serialized");

    Ok(())
}
```

### 7. Build and upgrade

We're ready to build and upgrade our program! You can test your program by
submitting a transaction with the correct instruction data. For this, you can
use the
[frontend](https://github.com/Unboxed-Software/solana-movie-frontend/tree/solution-update-reviews).
Ensure you're testing the right program as you'll need to replace
`MOVIE_REVIEW_PROGRAM_ID` with your program ID in `Form.tsx` and
`MovieCoordinator.ts`.

If you need more time with this project to feel comfortable with these concepts,
have a look at the
[solution code](https://beta.solpg.io/62c8c6dbf6273245aca4f5e7) before
continuing.

## Challenge

Now it’s your turn to build something independently by extending the Student
Intro program from previous lessons. If you missed the previous lessons or did
not save your code, use
[this starter code](https://beta.solpg.io/62b11ce4f6273245aca4f5b2).

The Student Intro program is a Solana Program that lets students introduce
themselves. The program takes a user's name and a short message as the
instruction_data and creates an account to store the data onchain.

Using what you have learned in this lesson, try applying what you have learned
to the Student Intro Program. The program should:

1. Add an instruction allowing students to update their message
2. Implement the basic security checks we learned in this lesson

Try to do this independently if you can! But if you get stuck, reference the
[solution code](https://beta.solpg.io/62c9120df6273245aca4f5e8). Note that your
code may look slightly different than the solution code per the checks you
implement and the errors you write.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=3dfb98cc-7ba9-463d-8065-7bdb1c841d43)!
</Callout>
