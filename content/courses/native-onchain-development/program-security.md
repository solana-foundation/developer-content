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

- **Thinking like an attacker** is about shifting your mindset to proactively
  identify potential security gaps by asking, "How do I break this?"
- **Owner checks** ensure that an account is controlled by the expected public
  key, such as verifying that a PDA (Program Derived Address) is owned by the
  program.
- **Signer checks** confirm that the right parties have signed the transaction,
  allowing for safe modifications to accounts.
- **Account validation** is used to ensure that the accounts passed into your
  program match your expectations, like checking the correctness of a PDA's
  derivation.
- **Data validation** verifies that the instruction data provided to your
  program adheres to specific rules or constraints, ensuring it doesn't lead to
  unintended behavior.

## Lesson

In the previous lessons
[deserialize instruction data](/content/courses/native-onchain-development/deserialize-instruction-data.md)
and
[program state management](/content/courses/native-onchain-development/program-state-management.md),
we built a Movie Review program, and while getting it to function was exciting,
secure development doesn't stop at "just working." It's critical to understand
potential failure points and take proactive steps to secure your program against
both accidental misuse and intentional exploitation.

Remember, **you have no control over the transactions that will be sent to your
program once it's deployed**. You can only control how your program handles
them. While this lesson is far from a comprehensive overview of program
security, we'll cover some of the basic pitfalls to look out for.

### Think Like an Attacker

A fundamental principle in secure programming is adopting an "attacker's
mindset." This means considering every possible angle someone might use to break
or exploit your program.

In their presentation at Breakpoint 2021,
[Neodyme](https://workshop.neodyme.io/) emphasized that secure program
development isn't just about identifying when something is broken; it's about
exploring how it can be broken. By asking, "How do I break this?" you shift from
simply testing expected functionality to uncovering potential weaknesses in the
implementation itself.

All programs, regardless of complexity, can be exploited. The goal isn't to
achieve absolute security (which is impossible) but to make it as difficult as
possible for malicious actors to exploit weaknesses. By adopting this mindset,
you're better prepared to identify and close gaps in your program's security.

#### All Programs Can Be Broken

Every program has vulnerabilities. The question isn't whether it can be broken,
but how much effort it takes. As developers, our goal is to close as many
security gaps as possible and increase the effort required to break our code.
For example, while our Movie Review program creates accounts to store reviews,
there may be unintentional behaviors that could be caught by thinking like an
attacker. In this lesson, we'll explore these issues and how to address them.

### Error handling

Before we dive into some of the common security pitfalls and how to avoid them,
it's important to know how to use errors in your program. Security issues in a
Solana program often requires terminating the execution with a meaningful error.
Not all errors are catastrophic, but some should result in stopping the program
and returning an appropriate error code to prevent further processing.

#### Creating Custom Errors

Solana's
[`solana_program`](https://docs.rs/solana-program/latest/solana_program/) crate
provides a generic
[`ProgramError`](https://docs.rs/solana-program/latest/solana_program/program_error/enum.ProgramError.html)
enum for error handling. However, custom errors allow you to provide more
detailed, context-specific information that helps during debugging and testing.

We can define our own errors by creating an enum type listing the errors we want
to use. For example, the `NoteError` contains variants `Forbidden` and
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
custom error unless we have a way to convert it into this type. The following
implementation handles conversion between our custom error and the
`ProgramError` type.

```rust
impl From<NoteError> for ProgramError {
    fn from(e: NoteError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

To return the custom error from the program, simply use the `into()` method to
convert the error into an instance of `ProgramError`.

```rust
if pda != *note_pda.key {
    return Err(NoteError::Forbidden.into());
}
```

This ensures the program gracefully handles errors and provides meaningful
feedback when things go wrong.

### Basic Security Checks

To ensure your Solana program is resilient against common vulnerabilities, you
should incorporate key security checks. These are critical for detecting invalid
accounts or unauthorized transactions and preventing undesired behavior.

#### Ownership checks

An ownership check verifies that an account is owned by the expected program.
For instance, if your program relies on PDAs (Program Derived Addresses), you
want to ensure that those PDAs are controlled by your program and not by an
external party.

Let's use the note-taking app example that we've referenced in the
[deserialize instruction data](/content/courses/native-onchain-development/deserialize-instruction-data.md)
and
[program state management](/content/courses/native-onchain-development/program-state-management.md)
lessons. In this app, users can create, update, and delete notes that are stored
by the program in PDA accounts.

When a user invokes the `update` instruction handler, they also provide a
`pda_account`. We presume the provided `pda_account` is for the particular note
they want to update, but the user can input any instruction data they want. They
could even potentially send data that matches the data format of a note account
but was not also created by the note-taking program. This security vulnerability
is one potential way to introduce malicious code.

The simplest way to avoid this problem is to always check that the owner of an
account is the public key you expect it to be. In this case, we expect the note
account to be a PDA account owned by the program itself. When this is not the
case, we can report it as an error accordingly.

Here's how you can perform an ownership check to verify that an account is owned
by the program:

```rust
if note_pda.owner != program_id {
    return Err(ProgramError::InvalidNoteAccount);
}
```

In this example, we check if the `note_pda` is owned by the program itself
(denoted by `program_id`). Ownership checks like these prevent unauthorized
entities from tampering with critical accounts.

<Callout>

PDAs are often considered to be trusted stores of a program's state. Ensuring
the correct program owns the PDAs is a fundamental way to prevent malicious
behavior.</Callout>

#### Signer Checks

Signer checks confirm that a transaction has been signed by the correct parties.
In the note-taking app, for example, we want to verify that only the note
creator can update the note. Without this check, anyone could attempt to modify
another user's note by passing in their public key.

```rust
if !initializer.is_signer {
    msg!("Missing required signature");
    return Err(ProgramError::MissingRequiredSignature)
}
```

By verifying that the initializer has signed the transaction, we ensure that
only the legitimate owner of the account can perform actions on it.

#### Account Validation

Account validation checks that the accounts passed into the program are correct
and valid. This is often done by deriving the expected account using known seeds
(for PDAs) and comparing it to the passed account.

For instance, in the note-taking app, you can derive the expected PDA using the
creator's public key and note ID, and then validate that it matches the provided
account:

```rust
let (expected_pda, bump_seed) = Pubkey::find_program_address(
    &[
        note_creator.key.as_ref(),
        id.as_bytes().as_ref(),
    ],
    program_id
);

if expected_pda != *note_pda.key {
    msg!("Invalid seeds for PDA");
    return Err(ProgramError::InvalidArgument)
}
```

This check prevents a user from accidentally (or maliciously) passing the wrong
PDA or one that belongs to someone else. By validating the PDA's derivation, you
ensure the program is acting on the correct account.

### Data Validation

Data validation ensures that the input provided to your program meets the
expected criteria. This is crucial for avoiding incorrect or malicious data that
could cause the program to behave unpredictably.

For example, let's say your program allows users to allocate points to a
character's attributes, but each attribute has a maximum allowed value. Before
making any updates, you should check that the new allocation does not exceed the
defined limit:

```rust
if character.agility + new_agility > 100 {
    msg!("Attribute points cannot exceed 100");
    return Err(AttributeError::TooHigh.into())
}
```

Similarly, you should check that the user is not exceeding their allowed number
of points:

```rust
if attribute_allowance < new_agility {
    msg!("Trying to allocate more points than allowed");
    return Err(AttributeError::ExceedsAllowance.into())
}
```

Without these validations, the program could end up in an undefined state or be
exploited by malicious actors, potentially causing financial loss or
inconsistent behavior.

For example, imagine that the character referenced in these examples is an NFT.
Further, imagine that the program allows the NFT to be staked to earn token
rewards proportional to the NFTs number of attribute points. Failure to
implement these data validation checks would allow a bad actor to assign an
obscenely high number of attribute points and quickly drain your treasury of all
the rewards that were meant to be spread more evenly amongst a larger pool of
stakers.

#### Integer overflow and underflow

One of the common pitfalls when working with integers in Rust (and in Solana
programs) is handling integer overflow and underflow. Rust integers have fixed
sizes and can only hold values within a certain range. When a value exceeds that
range, it wraps around, leading to unexpected results.

For example, with a `u8` (which holds values between 0 and 255), adding 1 to 255
results in a value of 0 (overflow). To avoid this, you should use checked math
functions like
[`checked_add()`](https://doc.rust-lang.org/std/primitive.u8.html#method.checked_add)
and
[`checked_sub()`](https://doc.rust-lang.org/std/primitive.u8.html#method.checked_sub):

To avoid integer overflow and underflow, either:

1. Have logic in place that ensures overflow or underflow _cannot_ happen or
2. Use checked math like `checked_add()` instead of `+`

   ```rust
   let first_int: u8 = 5;
   let second_int: u8 = 255;
   let sum = first_int.checked_add(second_int)
    .ok_or(ProgramError::ArithmeticOverflow)?;
   ```

## Lab

In this lab, we will build upon the Movie Review program that allows users to
store movie reviews in PDA accounts. If you haven't completed the previous
lessons
[deserialize instruction data](/content/courses/native-onchain-development/deserialize-instruction-data.md)
and
[program state management](/content/courses/native-onchain-development/program-state-management.md),
don't worry—this guide is self-contained.

The Movie Review program lets users add and update reviews in PDA accounts. In
previous lessons, we implemented basic functionality for adding reviews. Now,
we'll add security checks and implement an update feature in a secure manner.
We'll use [Solana Playground](https://beta.solpg.io/) to write, build, and
deploy our program.

### 1. Get the starter code

To begin, you can find
[the movie review starter code](https://beta.solpg.io/62b552f3f6273245aca4f5c9).
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
of code that will let this lab be more focused on security without having you
write unnecessary boilerplate.

Since we'll be allowing updates to movie reviews, we also changed `account_len`
in the `add_movie_review()` function (now in `processor.rs`). Instead of
calculating the size of the review and setting the account length to only as
large as it needs to be, we're simply going to allocate 1000 bytes to each
review account. This way, we don't have to worry about reallocating size or
re-calculating rent when a user updates their movie review.

We went from this:

```rust
let account_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());
```

To this:

```rust
let account_len: usize = 1000;
```

The [realloc](https://docs.rs/solana-sdk/latest/solana_sdk/account_info/struct.AccountInfo.html#method.realloc) method
was just recently enabled by Solana Labs which allows you to dynamically change
the size of your accounts. We will not be using this method for this lab, but
it's something to be aware of.

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

Before moving on, make sure you have a solid grasp of the current state of the
program. Look through the code and spend some time thinking through any spots
that are confusing to you. It may be helpful to compare the starter code to the
[solution code from the previous lesson](https://beta.solpg.io/62b23597f6273245aca4f5b4).

### 2. Custom Errors

We'll define custom errors to handle cases like uninitialized accounts, invalid
PDA matches, exceeding data limits, and invalid ratings (ratings must be between
1 and 5). These errors will be added to the `error.rs` file:

The starter code includes an empty `error.rs` file. Open that file and add
errors for each of the above cases.

```rust filename="error.rs"
use solana_program::{program_error::ProgramError};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ReviewError{
    // Error 0
    #[error("Account not initialized yet")]
    UninitializedAccount,
    // Error 1
    #[error("PDA derived does not equal PDA passed in")]
    InvalidPDA,
    // Error 2
    #[error("Input data exceeds max length")]
    InvalidDataLength,
    // Error 3
    #[error("Rating greater than 5 or less than 1")]
    InvalidRating,
}

impl From<ReviewError> for ProgramError {
    fn from(e: ReviewError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
```

Note that in addition to adding the error cases, we also added an implementation
that lets us convert our error into a `ProgramError` type as needed.

After adding the errors, import `ReviewError` in `processor.rs` to use them.

```rust filename="processor.rs"
use crate::error::ReviewError;
```

### 3. Add Security Checks to add_movie_review

Now that we have errors to use, let's implement some security checks to our
`add_movie_review` function.

#### Signer check

The first thing we should do is ensure that the `initializer` of a review is
also a signer on the transaction. This ensures that you can't submit movie
reviews impersonating somebody else. We'll put this check right after iterating
through the accounts.

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

Next, let's make sure the `pda_account` passed in by the user is the `pda` we
expect. Recall we derived the `pda` for a movie review using the `initializer`
and `title` as seeds. Within our instruction, we'll derive the `pda` again and
then check if it matches the `pda_account`. If the addresses do not match, we'll
return our custom `InvalidPDA` error.

```rust filename="processor.rs"
// Derive PDA and check that it matches client
let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), account_data.title.as_bytes().as_ref(),], program_id);

if pda != *pda_account.key {
    msg!("Invalid seeds for PDA");
    return Err(ReviewError::InvalidPDA.into())
}
```

#### Data validation

Now let's perform some data validation.

We'll start by making sure `rating` falls within the 1 to 5 scale. If the rating
provided by the user outside of this range, we'll return our custom
`InvalidRating` error.

```rust filename="processor.rs"
if rating > 5 || rating < 1 {
    msg!("Rating cannot be higher than 5");
    return Err(ReviewError::InvalidRating.into())
}
```

Next, let's check that the content of the review does not exceed the 1000 bytes
we've allocated for the account. If the size exceeds 1000 bytes, we'll return
our custom `InvalidDataLength` error.

```rust filename="processor.rs"
let total_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());
if total_len > 1000 {
    msg!("Data length is larger than 1000 bytes");
    return Err(ReviewError::InvalidDataLength.into())
}
```

Lastly, let's check if the account has already been initialized by calling the
`is_initialized` function we implemented for our `MovieAccountState`. If the
account already exists, then we will return an error.

```rust filename="processor.rs"
if account_data.is_initialized() {
    msg!("Account already initialized");
    return Err(ProgramError::AccountAlreadyInitialized);
}
```

Altogether, the `add_movie_review()` function should look something like this:

```rust filename="processor.rs"
pub fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
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
        msg!("Invalid seeds for PDA");
        return Err(ProgramError::InvalidArgument)
    }

    if rating > 5 || rating < 1 {
        msg!("Rating cannot be higher than 5");
        return Err(ReviewError::InvalidRating.into())
    }

    let total_len: usize = 1 + 1 + (4 + title.len()) + (4 + description.len());
    if total_len > 1000 {
        msg!("Data length is larger than 1000 bytes");
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
    msg!("borrowed account data");

    msg!("checking if movie account is already initialized");
    if account_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    account_data.title = title;
    account_data.rating = rating;
    account_data.description = description;
    account_data.is_initialized = true;

    msg!("serializing account");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}
```

### 4. Support Movie Review Updates in MovieInstruction

Next, we'll modify `instruction.rs` to add support for updating movie reviews.
We'll introduce a new `UpdateMovieReview()` variant in `MovieInstruction`:

```rust filename="instruction.rs"
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

The payload struct can stay the same since aside from the variant type, the
instruction data is the same as what we used for `AddMovieReview()`.

We'll also update the `unpack()` function to handle `UpdateMovieReview()`.

```rust filename="instruction.rs"
// Inside instruction.rs
impl MovieInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        let payload = MovieReviewPayload::try_from_slice(rest).unwrap();
        Ok(match variant {
            0 => Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description },
            1 => Self::UpdateMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description },
            _ => return Err(ProgramError::InvalidInstructionData)
        })
    }
}
```

### 5. Define update_movie_review Function

Now that we can unpack our `instruction_data` and determine which instruction of
the program to run, we can add `UpdateMovieReview()` to the match statement in
the `process_instruction()` function in the `processor.rs` file.

```rust filename="processor.rs"
// Inside processor.rs
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // Unpack instruction data
    let instruction = MovieInstruction::unpack(instruction_data)?;
    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            add_movie_review(program_id, accounts, title, rating, description)
        },
        // Add UpdateMovieReview to match against our new data structure
        MovieInstruction::UpdateMovieReview { title, rating, description } => {
            // Make call to update function that we'll define next
            update_movie_review(program_id, accounts, title, rating, description)
        }
    }
}
```

Next, we can define the new `update_movie_review()` function. The definition
should have the same parameters as the definition of `add_movie_review`.

```rust filename="processor.rs"
pub fn update_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
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
    accounts: &[AccountInfo],
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

Before we continue, let's implement some basic security checks. We'll start with
an ownership check on for `pda_account` to verify that it is owned by our
program. If it isn't, we'll return an `InvalidOwner` error.

```rust filename="processor.rs"
if pda_account.owner != program_id {
    return Err(ProgramError::InvalidOwner)
}
```

#### Signer Check

Next, let's perform a signer check to verify that the `initializer` of the
update instruction has also signed the transaction. Since we are updating the
data for a movie review, we want to ensure that the original `initializer` of
the review has approved the changes by signing the transaction. If the
`initializer` did not sign the transaction, we'll return an error.

```rust filename="processor.rs"
if !initializer.is_signer {
    msg!("Missing required signature");
    return Err(ProgramError::MissingRequiredSignature)
}
```

#### Account Validation

Next, let's check that the `pda_account` passed in by the user is the PDA we
expect by deriving the PDA using `initializer` and `title` as seeds. If the
addresses do not match, we'll return our custom `InvalidPDA` error. We'll
implement this the same way we did in the `add_movie_review()` function.

```rust filename="processor.rs"
// Derive PDA and check that it matches client
let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), account_data.title.as_bytes().as_ref(),], program_id);

if pda != *pda_account.key {
    msg!("Invalid seeds for PDA");
    return Err(ReviewError::InvalidPDA.into())
}
```

#### Unpack pda_account and Perform Data Validation

Now that our code ensures we can trust the passed in accounts, let's unpack the
`pda_account` and perform some data validation. We'll start by unpacking
`pda_account` and assigning it to a mutable variable `account_data`.

```rust filename="processor.rs"
msg!("unpacking state account");
let mut account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()).unwrap();
msg!("borrowed account data");
```

Now that we have access to the account and its fields, the first thing we need
to do is verify that the account has already been initialized. An uninitialized
account can't be updated so the program should return our custom
`UninitializedAccount` error.

```rust
if !account_data.is_initialized() {
    msg!("Account is not initialized");
    return Err(ReviewError::UninitializedAccount.into());
}
```

Next, we need to validate the `rating`, `title`, and `description` data just
like in the `add_movie_review()` function. We want to limit the `rating` to a
scale of 1 to 5 and limit the overall size of the review to be fewer than 1000
bytes. If the rating provided by the user is outside of this range, then we'll
return our custom `InvalidRating` error. If the review is too long, then we'll
return our custom `InvalidDataLength` error.

```rust filename="processor.rs"
if rating > 5 || rating < 1 {
    msg!("Rating cannot be higher than 5");
    return Err(ReviewError::InvalidRating.into())
}

let total_len: usize = 1 + 1 + (4 + account_data.title.len()) + (4 + description.len());
if total_len > 1000 {
    msg!("Data length is larger than 1000 bytes");
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

account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;

Ok(())
```

All together, the `update_movie_review()` function should look something like
the code snippet below. We've included some additional logging for clarity in
debugging.

```rust filename="processor.rs"
pub fn update_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {
    msg!("Updating movie review...");

    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;

    if pda_account.owner != program_id {
      return Err(ProgramError::IllegalOwner)
    }

    if !initializer.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature)
    }

    msg!("unpacking state account");
    let mut account_data = try_from_slice_unchecked::<MovieAccountState>(&pda_account.data.borrow()).unwrap();
    msg!("review title: {}", account_data.title);

    let (pda, _bump_seed) = Pubkey::find_program_address(&[initializer.key.as_ref(), account_data.title.as_bytes().as_ref(),], program_id);
    if pda != *pda_account.key {
        msg!("Invalid seeds for PDA");
        return Err(ReviewError::InvalidPDA.into())
    }

    msg!("checking if movie account is initialized");
    if !account_data.is_initialized() {
        msg!("Account is not initialized");
        return Err(ReviewError::UninitializedAccount.into());
    }

    if rating > 5 || rating < 1 {
        msg!("Invalid Rating");
        return Err(ReviewError::InvalidRating.into())
    }

    let update_len: usize = 1 + 1 + (4 + description.len()) + account_data.title.len();
    if update_len > 1000 {
        msg!("Data length is larger than 1000 bytes");
        return Err(ReviewError::InvalidDataLength.into())
    }

    msg!("Review before update:");
    msg!("Title: {}", account_data.title);
    msg!("Rating: {}", account_data.rating);
    msg!("Description: {}", account_data.description);

    account_data.rating = rating;
    account_data.description = description;

    msg!("Review after update:");
    msg!("Title: {}", account_data.title);
    msg!("Rating: {}", account_data.rating);
    msg!("Description: {}", account_data.description);

    msg!("serializing account");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}
```

### 7. Build and upgrade

We're ready to build and upgrade our program! You can test your program by
submitting a transaction with the right instruction data. For that, feel free to
use this
[frontend](https://github.com/solana-developers/movie-frontend/tree/solution-update-reviews).
Remember, to make sure you're testing the right program you'll need to replace
`MOVIE_REVIEW_PROGRAM_ID` with your program ID in `Form.tsx` and
`MovieCoordinator.ts`.

If you need more time with this project to feel comfortable with these concepts,
have a look at the
[solution code](https://beta.solpg.io/62c8c6dbf6273245aca4f5e7) before
continuing.

## Challenge

Now it's your turn to build something independently by building on top of the
Student Intro program that you've used in previous lessons. If you haven't been
following along or haven't saved your code before, feel free to use
[this starter code](https://beta.solpg.io/62b11ce4f6273245aca4f5b2).

The Student Intro program is a Solana Program that lets students introduce
themselves. The program takes a user's name and a short message as the
instruction_data and creates an account to store the data onchain.

Using what you've learned in this lesson, try applying what you've learned to
the Student Intro Program. The program should:

1. Add an instruction allowing students to update their message
2. Implement the basic security checks we've learned in this lesson

Try to do this independently if you can! But if you get stuck, feel free to
reference the [solution code](https://beta.solpg.io/62c9120df6273245aca4f5e8).
Note that your code may look slightly different than the solution code depending
on the checks you implement and the errors you write.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=3dfb98cc-7ba9-463d-8065-7bdb1c841d43)!
</Callout>
