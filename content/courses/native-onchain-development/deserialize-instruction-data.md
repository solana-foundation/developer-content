---
title: Create a Basic Program, Part 1 - Handle Instruction Data
objectives:
  - Assign mutable and immutable variables in Rust
  - Create and use Rust structs and enums
  - Use Rust match statements
  - Add implementations to Rust types
  - Deserialize instruction data into native Rust data types
  - Execute different program logic for different types of instructions
  - Explain the structure of a smart contract on Solana
description:
  "Learn how native programs distinguish instructions for different functions."
---

## Summary

- Most programs support **multiple discrete instruction handlers** (sometimes
  just referred to as 'instructions') - these are functions inside your program
- Rust **enums** are often used to represent each instruction handler
- You can use the `borsh` crate and the `derive` attribute to provide Borsh
  deserialization and serialization functionality to Rust structs
- Rust `match` expressions help create conditional code paths based on the
  provided instruction.

## Lesson

One of the fundamental elements of a Solana program is the logic for handling
instruction data. Most programs support multiple functions, also called
instruction handlers. For example, a program may have different instruction
handlers for creating a new piece of data versus deleting the same piece of
data. Programs use differences in instruction data to determine which
instruction handler to execute.

Since instruction data is provided to your program's entry point as a byte
array, it's common to create a Rust data type to represent instructions in a
more usable format throughout your code. This lesson will guide you through
setting up such a type, deserializing the instruction data into this format, and
executing the appropriate instruction handler based on the instruction passed
into the program's entry point.

### Rust Basics

Before diving into the specifics of a basic Solana program, let's cover the Rust
basics that will be used throughout this lesson.

#### Variables

Variable assignment in Rust is done using the `let` keyword.

```rust
let age = 33;
```

By default, variables in Rust are immutable, meaning their value cannot be
changed once set. To create a variable that can be changed later, use the `mut`
keyword. Defining a variable with this keyword allows its stored value to
change.

```rust
// Compiler will throw an error
let age = 33;
age = 34;

// This is allowed
let mut mutable_age = 33;
mutable_age = 34;
```

The Rust compiler ensures that immutable variables cannot change, so you don’t
have to track it yourself. This makes your code easier to reason through and
simplifies debugging.

#### Structs

A struct (short for structure) is a custom data type that lets you package
together and name multiple related values that make up a meaningful group. Each
piece of data in a struct can be of different types, and each has a name
associated with it. These pieces of data are called fields and behave similarly
to properties in other languages.

```rust
struct User {
    active: bool,
    email: String,
    age: u64
}
```

To use a struct after it’s defined, create an instance of the struct by
specifying concrete values for each of the fields.

```rust
let mut user1 = User {
    active: true,
    email: String::from("test@test.com"),
    age: 36
};
```

To get or set a specific value from a struct, use dot notation.

```rust
user1.age = 37;
```

You can check out the
[struct examples](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html)
for in depth understanding.

#### Enumerations

Enumerations (or Enums) are a data struct that allows you to define a type by
enumerating its possible variants. An example of an enum might look like:

```rust
enum LightStatus {
    On,
    Off
}
```

The `LightStatus` enum has two possible variants in this example: `On` or `Off`.

You can also embed values into enum variants, similar to adding fields to a
struct.

```rust
enum LightStatus {
    On {
        color: String
    },
    Off
}

let light_status = LightStatus::On { color: String::from("red") };
```

In this example, setting a variable to the `On` variant of `LightStatus`
requires also setting the value of `color`. You can check out more examples of
using enums in Rust by visiting
[this Rust by Example page on enums](https://doc.rust-lang.org/rust-by-example/custom_types/enum.html).

#### Match statements

Match statements are very similar to `switch` statements in other languages. The

[`match`](https://doc.rust-lang.org/rust-by-example/flow_control/match.html)
statement allows you to compare a value against a series of patterns and then
execute code based on which pattern matches the value. Patterns can be made of
literal values, variable names, wildcards, and more. The match statement must
include all possible scenarios; otherwise, the code will not compile.

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25
    }
}
```

#### Implementations

The [`impl`](https://doc.rust-lang.org/rust-by-example/trait/impl_trait.html)
keyword is used in Rust to define a type's implementations. Functions and
constants can both be defined in an implementation.

```rust
struct Example {
    number: i32
}

impl Example {
    fn boo() {
        println!("boo! Example::boo() was called!");
    }

    fn answer(&mut self) {
        self.number += 42;
    }

    fn get_number(&self) -> i32 {
        self.number
    }
}
```

The `boo` function here can only be called on the type itself rather than an
instance of the type, like so:

```rust
Example::boo();
```

Meanwhile, `answer` requires a mutable instance of `Example` and can be called
with dot syntax:

```rust
let mut example = Example { number: 3 };
example.answer();
```

#### Traits and attributes

You won't be creating your own traits or attributes at this stage, so an
in-depth explanation isn't necessary. However, you will be using the `derive`
attribute macro and some traits provided by the `borsh` crate, so it's important
to have a high-level understanding of each.

[Traits](https://doc.rust-lang.org/rust-by-example/trait.html) describe an
abstract interface that types can implement. If a trait defines a function
`bark()` and a type adopts that trait, the type must implement the `bark()`
function.

[Attributes](https://doc.rust-lang.org/rust-by-example/attribute.html) add
metadata to a type and can be used for many different purposes.

When you add the
[`derive` attribute](https://doc.rust-lang.org/rust-by-example/trait/derive.html)
to a type and provide one or more supported traits, code is generated under the
hood to automatically implement the traits for that type. We'll provide a
concrete example of this shortly.

### Representing Instructions as a Rust Data Type

Now that we've covered the Rust basics, let's apply them to Solana programs.

More often than not, programs will have more than one instruction handler. For
example, you may have a program that acts as the backend for a note-taking app.
Assume this program accepts instructions for creating a new note, updating an
existing note, and deleting an existing note.

Since instructions have discrete types, they're usually a great fit for an enum
data type.

```rust
enum NoteInstruction {
    CreateNote {
        title: String,
        body: String,
        id: u64
    },
    UpdateNote {
        title: String,
        body: String,
        id: u64
    },
    DeleteNote {
        id: u64
    }
}
```

Notice that each variant of the `NoteInstruction` enum comes with embedded data
that will be used by the program to accomplish the tasks of creating, updating,
and deleting a note, respectively.

### Deserialize Instruction Data

Instruction data is passed to the program as a byte array, so you need a way to
deterministically convert that array into an instance of the instruction enum
type.

In previous units, we used Borsh for client-side serialization and
deserialization. To use Borsh program-side, we use the `borsh` crate. This crate
provides traits for `BorshDeserialize` and `BorshSerialize` that you can apply
to your types using the `derive` attribute.

To make deserializing instruction data simple, you can create a struct
representing the data and use the `derive` attribute to apply the
`BorshDeserialize` trait to the struct. This implements the methods defined in
`BorshDeserialize`, including the `try_from_slice` method that we'll be using to
deserialize the instruction data.

Remember, the struct itself needs to match the structure of the data in the byte
array.

```rust
#[derive(BorshDeserialize)]
struct NoteInstructionPayload {
    id: u64,
    title: String,
    body: String
}
```

Once this struct has been created, you can create an implementation for your
instruction enum to handle the logic associated with deserializing instruction
data. It's common to see this done inside a function called `unpack` that
accepts the instruction data as an argument and returns the appropriate instance
of the enum with the deserialized data.

It's standard practice to structure your program to expect the first byte (or
other fixed number of bytes) to be an identifier for which instruction handler
the program should run. This could be an integer or a string identifier. For
this example, we'll use the first byte and map integers 0, 1, and 2 to the
instruction handlers for create, update, and delete, respectively.

```rust
impl NoteInstruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        // Take the first byte as the variant to
        // determine which instruction handler to execute
        let (&variant, rest) = input.split_first().ok_or(ProgramError::InvalidInstructionData)?;
        // Use the temporary payload struct to deserialize
        let payload = NoteInstructionPayload::try_from_slice(rest)
            .map_err(|_| ProgramError::InvalidInstructionData)?;
        // Match the variant to determine which data struct is expected by
        // the function and return the TestStruct or an error
        match variant {
            0 => Ok(Self::CreateNote {
                title: payload.title,
                body: payload.body,
                id: payload.id,
            }),
            1 => Ok(Self::UpdateNote {
                title: payload.title,
                body: payload.body,
                id: payload.id,
            }),
            2 => Ok(Self::DeleteNote { id: payload.id }),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}
```

There's a lot in this example so let's take it one step at a time:

1. This function starts by using the `split_first` function on the `input`
   parameter to return a tuple. The first element, `variant`, is the first byte
   from the byte array and the second element, `rest`, is the rest of the byte
   array.
2. The function then uses the `try_from_slice` method on
   `NoteInstructionPayload` to deserialize the rest of the byte array into an
   instance of `NoteInstructionPayload` called `payload`
3. Finally, the function uses a `match` statement on `variant` to create and
   return the appropriate enum instance using information from `payload`. Each
   valid variant (0, 1, 2) corresponds to a specific NoteInstruction variant,
   while any other value results in an error.

<Callout>

There is Rust syntax in this function that we haven't explained yet. The
`ok_or`, `map_err`, and `?` operators are used for error handling:

- [`ok_or`](https://doc.rust-lang.org/std/option/enum.Option.html#method.ok_or):
  Converts an `Option` to a `Result`. If the `Option` is `None`, it returns the
  provided error. Otherwise, it returns the `Some` value as `Ok`.

- [`map_err`](https://doc.rust-lang.org/std/result/enum.Result.html#method.map_err):
  Transforms the error of a `Result` by applying a function to the error. It
  leaves the `Ok` value unchanged.

- [`?` operator](https://doc.rust-lang.org/rust-by-example/error/result/enter_question_mark.html):
  Unwraps a `Result` or `Option`. If it’s `Ok` or `Some`, it returns the value.
  If it’s an `Err` or `None`, it propagates the error up to the calling
  function. </Callout>

### Program logic

With a method to deserialize instruction data into a custom Rust type, you can
use appropriate control flow to execute different code paths in your program
based on the instruction passed into the program's entry point.

```rust
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Note program entrypoint");
    // Call unpack to deserialize instruction_data
    let instruction = NoteInstruction::unpack(instruction_data)?;
    // Match the returned data struct to what you expect
    match instruction {
        NoteInstruction::CreateNote { title, body, id } => {
             msg!("Instruction: Create Note");
            // Execute program code to create a note
        },
        NoteInstruction::UpdateNote { title, body, id } => {
            msg!("Instruction: Update Note");
            // Execute program code to update a note
        },
        NoteInstruction::DeleteNote { id } => {
            msg!("Instruction: Delete Note");
            // Execute program code to delete a note
        }
    }
}
```

For simple programs with one or two instructions, placing logic inside the
`match` statement may suffice. However, for programs with many instructions, it
is advisable to write the logic for each instruction handler in a separate
function and call it from within the `match` statement.

### Program File Structure

The
[Hello World lesson](/content/courses/native-onchain-development/hello-world-program.md)
demonstrated a program simple enough to be confined to one file. As program
complexity grows, maintaining a readable and extensible project structure
becomes crucial. This involves encapsulating code into functions and data
structures, and grouping related code into separate files.

For instance, instruction definition and deserialization code should reside in
its own file, separate from the entry point. This approach might result in two
files: one for the program entry point and another for the instruction handler.

- **lib.rs**
- **instruction.rs**

When splitting your program into multiple files, register all files in a central
location, typically in `lib.rs`. Each file must be registered this way.

```rust filename="lib.rs"
// Inside lib.rs
pub mod instruction;
```

Additionally, use the `pub` keyword to make declarations available for `use`
statements in other files.

```rust
pub enum NoteInstruction { ... }
```

## Lab

For this lesson’s lab, you'll build the first half of the Movie Review program
from Module 1, focusing on deserializing instruction data. The next lesson will
cover the remaining implementation.

### 1. Entry point

Using [Solana Playground](https://beta.solpg.io/), clear everything in the
current `lib.rs` file if it's still populated from the previous lesson. Then,
bring in the following crates and define the program's entry point using the
entrypoint macro.

```rust filename="lib.rs"
use solana_program::{
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg,
    account_info::AccountInfo,
};

// Entry point is a function call process_instruction
entrypoint!(process_instruction);

// Inside lib.rs
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {

    Ok(())
}
```

#### 2. Deserialize instruction data

Define your supported instructions and implement a deserialization function.
Create a new file called `instruction.rs`, and add `use` statements for
`BorshDeserialize` and `ProgramError`, and create a `MovieInstruction` enum with
an `AddMovieReview` variant that includes `title`, `rating`, and `description`
values.

```rust filename="instruction.rs"
use borsh::{BorshDeserialize};
use solana_program::program_error::ProgramError;

pub enum MovieInstruction {
    AddMovieReview {
        title: String,
        rating: u8,
        description: String
    }
}
```

Next, define a `MovieReviewPayload` struct as an intermediary type for
deserialization. Use the derive attribute macro to provide a default
implementation for the `BorshDeserialize` trait.

```rust
#[derive(BorshDeserialize)]
struct MovieReviewPayload {
    title: String,
    rating: u8,
    description: String
}
```

Finally, implement the `MovieInstruction` enum by defining a `unpack` function
that takes a byte array and returns a `Result` type. This function should:

1. Split the first byte from the array using `split_first`.
2. Deserialize the remaining array into a `MovieReviewPayload` instance.
3. Use a `match` statement to return the `AddMovieReview` variant of
   `MovieInstruction` if the first byte is 0, otherwise return a program error.

```rust
impl MovieInstruction {
    // Unpack inbound buffer to associated Instruction
    // The expected format for input is a Borsh serialized vector
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
         // Ensure the input is not empty and split off the first byte (instruction variant)
        let (&variant, rest) = input.split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        // Attempt to deserialize the remaining input into a MovieReviewPayload
        let payload = MovieReviewPayload::try_from_slice(rest)
            .map_err(|_| ProgramError::InvalidInstructionData)?;
        // Match on the instruction variant to construct the appropriate MovieInstruction
        match variant {
            0 => Ok(Self::AddMovieReview {
                title: payload.title,
                rating: payload.rating,
                description: payload.description,
            }),
            // If the variant doesn't match any known instruction, return an error
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }
}
```

#### 3. Program logic

Return to `lib.rs` to handle the program logic now that instruction
deserialization is set up. Register the `instruction.rs` file in `lib.rs` and
bring the `MovieInstruction` type into scope.

```rust
pub mod instruction;
use instruction::{MovieInstruction};
```

Next, define an `add_movie_review` function that takes `program_id`, `accounts`,
`title`, `rating`, and `description` as arguments, and returns a
`ProgramResult`. For now, log these values, and we'll revisit the function
implementation in the next lesson.

```rust
pub fn add_movie_review(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    title: String,
    rating: u8,
    description: String
) -> ProgramResult {

    // Logging instruction data that was passed in
    msg!("Adding movie review...");
    msg!("Title: {}", title);
    msg!("Rating: {}", rating);
    msg!("Description: {}", description);

    Ok(())
}
```

Finally, call `add_movie_review` from `process_instruction`, unpack the
instruction using the `unpack` method, and use a `match` statement to ensure the
instruction is the `AddMovieReview` variant.

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    // Unpack called
    let instruction = MovieInstruction::unpack(instruction_data)?;
    // Match against the data struct returned into `instruction` variable
    match instruction {
        MovieInstruction::AddMovieReview { title, rating, description } => {
            // Make a call to `add_move_review` function
            add_movie_review(program_id, accounts, title, rating, description)
        }
    }
}
```

With this, your program should now log the instruction data when a transaction
is submitted. Build and deploy your program from Solana Playground as in the
last lesson. If your program ID hasn't changed, it will deploy to the same ID.
To deploy to a different address, generate a new program ID before deploying.

Build and deploy your program from Solana Program just like in the last lesson.
If you haven't changed the program ID since going through the last lesson, it
will automatically deploy to the same ID. If you'd like it to have a separate
address, you can generate a new program ID from the playground before deploying.

You can test your program by submitting a transaction with the right instruction
data. For that, feel free to use
[this script](https://github.com/solana-developers/movie-review-program-client)
or [the frontend](https://github.com/solana-developers/movie-review-frontend) we
built in the
[Serialize Custom Instruction Data lesson](/content/courses/native-onchain-development/serialize-instruction-data-frontend.md).
In both cases, make sure you copy and paste the program ID for your program into
the appropriate area of the source code to make sure you're testing the right
program.

Take your time with this lab before moving on, and feel free to reference the
[solution code](https://beta.solpg.io/62aa9ba3b5e36a8f6716d45b) if you get
stuck.

## Challenge

Replicate the Student Intro program from Module 1 for this lesson's challenge.
The program takes a user's name and a short message as `instruction_data` and
creates an account to store the data on-chain.

Using what you've learned, build the Student Intro program to the point where it
prints the `name` and `message` to the program logs when invoked.

You can test your program by building the
[frontend](https://github.com/solana-developers/student-intro-frontend/tree/solution-serialize-instruction-data)
we created in the
[Serialize Custom Instruction Data lesson](/content/courses/native-onchain-development/serialize-instruction-data-frontend.md)
and checking the program logs on Solana Explorer. Replace the program ID in the
frontend code with your deployed program ID.

Try to do this independently if you can! But if you get stuck, feel free to
reference the [solution code](https://beta.solpg.io/62b0ce53f6273245aca4f5b0).

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=74a157dc-01a7-4b08-9a5f-27aa51a4346c)!
</Callout>
