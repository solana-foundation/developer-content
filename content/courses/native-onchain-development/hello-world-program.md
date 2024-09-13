---
title: Hello World
objectives:
  - Use the Rust module system
  - Define a function in Rust
  - Explain the `Result` type
  - Explain the entry point to a Solana program
  - Build and deploy a basic Solana program
  - Submit a transaction to invoke our “Hello, world!” program
description:
  "Create an onchain program for Solana using native Rust, without Anchor."
---

## Summary

- Native Solana programs have a single **entry point** to process instructions.
- A program processes an instruction using the **program_id**, a list of
  **accounts**, and **instruction_data** included with the instruction.

## Lesson

<Callout type="info">

The following guide assumes you are familiar with Solana program basics. If not,
check out
[Introduction to Onchain Programming](/content/courses/onchain-development/intro-to-onchain.md).
</Callout>

This lesson will introduce you to writing and deploying a Solana program using
the Rust programming language without any framework. This approach offers
greater control but requires you to handle much of the foundational work of
creating an onchain program yourself.

To avoid the distractions of setting up a local development environment, we'll
be using a browser-based IDE called Solana Playground.

### Rust Basics

Before diving into building our "Hello, world!" program, let's review some Rust
basics. For a deeper dive into Rust, check out the
[Rust Language Book](https://doc.rust-lang.org/book/ch00-00-introduction.html).

#### Module System

Rust organizes code using what is collectively referred to as the “module
system.” This includes:

- **Modules**: Separates code into logical units to provide isolated namespaces
  for organization, scope, and privacy of paths.
- **Crates**: Either a library or an executable program. The source code for a
  crate is usually subdivided into multiple modules.
- **Packages**: A collection of crates along with a manifest file that specifies
  metadata and dependencies between packages.

Throughout this lesson, we'll focus on using crates and modules.

#### Paths and Scope

Crates contain modules that can be shared across multiple projects. If we want
to access an item within a module, we need to know its "path," similar to
navigating a filesystem.

Think of the crate structure as a tree where the crate is the base and modules
are branches, each potentially having submodules or items as additional
branches. The path to a particular module or item is the name of each step from
the crate to that module, separated by `::`.

For example:

1. The base crate is `solana_program`.
2. `solana_program` contains a module named `account_info`.
3. `account_info` contains a struct named `AccountInfo`.

The path to `AccountInfo` would be `solana_program::account_info::AccountInfo`.

Absent any other keywords, you would need to reference this entire path to use
`AccountInfo` in your code. However, with the
[`use`](https://doc.rust-lang.org/stable/book/ch07-04-bringing-paths-into-scope-with-the-use-keyword.html)
keyword, you can bring an item into scope so it can be reused throughout a file
without specifying the full path each time. It's common to see a series of `use`
commands at the top of a Rust file.

```rust
use solana_program::account_info::AccountInfo
```

#### Declaring Functions in Rust

Functions in Rust are defined using the `fn` keyword, followed by a function
name and a set of parentheses.

```rust
fn process_instruction()
```

We can add arguments to our function by including variable names and specifying
their corresponding data types within the parentheses.

Rust is a "statically typed" language, meaning every value in Rust has a
specific "data type" known at compile time. In cases where multiple types are
possible, we must add a type annotation to our variables.

In the example below, we create a function named `process_instruction` that
requires the following arguments:

- `program_id` - required to be of type `&Pubkey`.
- `accounts` - required to be of type `&[AccountInfo]`.
- `instruction_data` - required to be of type `&[u8]`.

Note the `&` in front of the type for each argument listed in the
`process_instruction` function. In Rust, `&` represents a "reference" to another
variable, allowing you to refer to some value without taking ownership of it.
The reference is guaranteed to point to a valid value of a particular type. The
action of creating a reference in Rust is called “borrowing.”

In this example, when the `process_instruction` function is called, a user must
pass in values for the required arguments. The `process_instruction` function
then references the values passed in by the user, guaranteeing that each value
is the correct data type specified in the function.

Additionally, note the brackets `[]` around `&[AccountInfo]` and `&[u8]`. This
indicates that the `accounts` and `instruction_data` arguments expect "slices"
of types `AccountInfo` and `u8`, respectively. A “slice” is similar to an array
(a collection of objects of the same type), except the length is not known at
compile time. In other words, the `accounts` and `instruction_data` arguments
expect inputs of unknown length.

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
)
```

We can also have our functions return values by declaring the return type using
an arrow -> after the function.

In the example below, the `process_instruction` function will now return a value
of type `ProgramResult`. We'll go over this in the next section.

```rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult
```

#### Result Enum

`Result` is a standard library type representing two discrete outcomes: success
(`Ok`) or failure (`Err`). We'll discuss enums more in a future lesson, but
you'll see `Ok` used later in this lesson, so it's important to cover the
basics.

When using `Ok` or `Err`, you must include a value, the type of which is
determined by the code's context. For example, a function that requires a return
value of type `Result<String, i64>` can either return `Ok` with an embedded
string value or `Err` with an embedded integer. In this example, the integer is
an error code that can be used to handle the error appropriately.

To return a success case with a string value, you would do the following:

```rust
Ok(String::from("Success!"));
```

To return an error with an integer, you would do the following:

```rust
Err(404);
```

### Solana Programs

Recall that all data stored on the Solana network are contained in what are
referred to as accounts. Each account has its own unique address, which is used
to identify and access the account data. Solana programs are a specific type of
Solana account that stores and executes instructions.

#### Solana Program Crate

To write Solana programs with Rust, we use the solana_program library crate. The
solana_program crate acts as a standard library for Solana programs. This
standard library contains the modules and macros we'll use to develop our Solana
programs. For more details, check out the
[`solana_program` crate documentation](https://docs.rs/solana-program/latest/solana_program/index.html).

For a basic program, we need to bring the following items from the
`solana_program` crate into scope:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};
```

- `AccountInfo` - A struct that allows us to access account information like
  account addresses, owners, lamport balances, data length, executable status,
  rent epoch, and whether the account was signed or writable in the current
  transaction.
- `entrypoint` - A macro that defines a function that receives incoming
  instructions and routes them to the appropriate instruction handler.
- `ProgramResult` - A type within the `entrypoint` module that returns either a
  `Result` or `ProgramError`.
- `Pubkey` - A struct within the `pubkey` module that allows us to access
  addresses as public keys.
- `msg` - A macro that allows us to print messages to the program log.

#### Solana Program Entry Point

Solana programs require a single entry point to process program instructions.
The entry point is declared using the `entrypoint!` macro.

The entry point to a Solana program requires a `process_instruction` function
with the following arguments:

- `program_id` - The address of the account where the program is stored.
- `accounts` - The list of accounts required to process the instruction.
- `instruction_data` - The serialized, instruction-specific data.

```rust
entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult;
```

Recall that Solana program accounts only store the logic to process
instructions. This means program accounts are "read-only" and “stateless.” The
“state” (the set of data) that a program requires to process an instruction is
stored in data accounts separate from the program account.

To process an instruction, the data accounts required by the instruction must be
explicitly passed into the program through the `accounts` argument. Any
additional inputs must be passed in through the `instruction_data` argument.

Following program execution, the program must return a value of type
`ProgramResult`. This type is a `Result` where the embedded value of a success
case is `()` and the embedded value of a failure case is `ProgramError`. `()` is
an empty value, and `ProgramError` is an error type defined in the
`solana_program` crate.

...and there you have it—you now know the foundations of creating a Solana
program using Rust. Let's practice what we've learned so far!

## Lab

We're going to build a "Hello, World!" program using Solana Playground. Solana
Playground is a tool that allows you to write and deploy Solana programs
directly from your browser.

### 1. Setup

First, open the [Solana Playground](https://beta.solpg.io/). Once you're in,
delete all the existing code in the `lib.rs` file. Then, create a new wallet
within the Playground.

![Gif Solana Playground Create Wallet](/public/assets/courses/unboxed/hello-world-create-wallet.gif)

### 2. Solana Program Crate

We'll begin by importing the necessary components from the `solana_program`
crate.

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};
```

Next, we'll set up the entry point of our program using the `entrypoint!` macro
and define the `process_instruction` function. We'll use the `msg!` macro to
print “Hello, world!” to the program log when the program is invoked.

### 3. Entry Point

```rust
entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello, world!");

    Ok(())
}
```

Putting it all together, our complete “Hello, world!” program looks like this:

```rust
use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    msg
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello, world!");

    Ok(())
}
```

### 4. Build and Deploy

Now, let's build and deploy our program using Solana Playground.

![Gif Solana Playground Build and Deploy](/public/assets/courses/unboxed/hello-world-build-deploy.gif)

### 5. Invoke Program

Finally, let's invoke our program from the client side. The main focus of this
lesson is building our Solana program, so we've provided
[the client code to invoke our “Hello, world!” program](https://github.com/solana-developers/hello-world-client)
for you to download.

This code includes a `sayHello` helper function that constructs and submits the
transaction. In the `index.ts` file, you'll find a variable named `programId`.
Update this with the program ID of the “Hello, world!” program you just deployed
using Solana Playground.

```typescript
let programId = new web3.PublicKey("<YOUR_PROGRAM_ID>");
```

You can find the program ID on Solana Playground as shown below.

![Gif Solana Playground Program ID](/public/assets/courses/unboxed/hello-world-program-id.gif)

Next, install the Node modules by running `npm i`.

Afterwards, execute `npm start`. This command will:

1. Generate a new keypair and create a `.env` file if it doesn't already exist.
2. Airdrop some SOL onto this account on devnet.
3. Invoke the “Hello, world!” program.
4. Output a transaction URL that you can view on Solana Explorer.

Copy the transaction URL from the console into your browser. Scroll down to the
Program Instruction Logs section to see “Hello, world!” displayed.

![Screenshot Solana Explorer Program Log](/public/assets/courses/unboxed/hello-world-program-log.png)

Congratulations! You've successfully built and deployed a Solana program!

## Challenge

Now it's your turn to build something independently. Since we're starting with
very simple programs, your task will closely resemble what we've just created.
The goal is to practice writing the code from scratch without referencing prior
examples, so try to avoid copying and pasting.

1. Write a new program that uses the `msg!` macro to print your own custom
   message to the program log.
2. Build and deploy your program just like we did in the lab.
3. Invoke your newly deployed program and use Solana Explorer to confirm that
   your message was printed in the program log.

As always, feel free to get creative with these challenges and go beyond the
basic instructions if you want — most importantly, have fun!

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=5b56c69c-1490-46e4-850f-a7e37bbd79c2)!
</Callout>
