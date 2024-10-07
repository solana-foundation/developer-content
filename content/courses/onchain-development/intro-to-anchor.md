---
title: Intro to Anchor development
objectives:
  - Use the Anchor framework to build a basic Solana program
  - Describe the basic structure of an Anchor program
  - Explain how to implement basic account validation and security checks with
    Anchor
description: "Create your first Solana onchain program in Anchor."
---

## Summary

- **Programs** on Solana have **instruction handlers**, which are functions that
  take arguments from incoming instructions. They are the entry point for any
  operation in a program.
- **Rust** is the most common language for building Solana programs. The
  **Anchor** framework takes care of common grunt work - like reading data from
  incoming instructions, and checking the right accounts are provided - so you
  can focus on building your Solana program.

## Lesson

Before we begin, make sure you have Anchor installed. You can follow this lesson
on [local-setup](/content/onchain-development/local-setup.md).

Solana's capacity to execute arbitrary code is a key part of its power. Solana
programs, (sometimes called "smart contracts"), are the very foundation of the
Solana ecosystem. And as developers and creators continuously conceive and
deploy new programs, the collection of Solana programs continues to expand
daily.

Every popular Solana exchange, borrow-lend app, digital art auction house, perps
platform, and prediction market is a program.

This lesson will give you a basic introduction to writing and deploying a Solana
program using the Rust programming language and the Anchor framework.

> This and the further lessons in this course will give a good base to start
> building Solana programs with Anchor, however if you want to get more into
> Anchor, we would recommend checking out the
> [The Anchor Book](https://book.anchor-lang.com/).

### What is Anchor?

Anchor makes writing Solana programs easier, faster, and more secure, making it
the "go-to" framework for Solana development. It makes it easier to organize and
reason about your code, implements common security checks automatically, and
removes a significant amount of boilerplate code that is otherwise associated
with writing a Solana program.

### Anchor program structure

Anchor uses macros and traits to simplify Rust code for you. These provide a
clear structure to your program so you can focus more on its functionality.

Some important macros provided by Anchor are:

> From here on out, you'll see a lot of Rust. We assume that you are familiar
> with Rust, if not, we recommend you to check out
> [The Rust Book](https://doc.rust-lang.org/book/).

- `declare_id!` - a macro for declaring the program’s onchain address Anchor
  uses macros and traits to generate boilerplate Rust code for you. These
  provide a clear structure to your program so you can more easily reason about
  your code. The main high-level macros and attributes are:

- `declare_id` - a macro for declaring the program’s onchain address
- `#[program]` - an attribute macro used to denote the module containing the
  program’s instruction handlers.
- `Accounts` - a trait applied to structs representing the list of accounts
  required for an instruction.
- `#[account]` - an attribute macro used to define custom account types for the
  program.

Let's talk about each of them before putting all the pieces together.

### Declare your program ID

The `declare_id` macro sets the onchain address of the Anchor program (i.e. the
`programId`). When you create a new Anchor program, the framework generates a
default keypair. This keypair is used to deploy the program unless specified
otherwise. The public key of this keypair is used as the `programId` in the
`declare_id!` macro.

```rust
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");
```

### Define instruction logic

The `#[program]` attribute macro defines the module containing all of your
program's instruction handlers. This is where you implement the business logic
for each operation in your program.

Each public function in the module with the `#[program]` attribute will be
treated as a separate instruction handler.

Each instruction handler (function) requires a parameter of type `Context` and
can include more parameters as needed. Anchor will automatically handle
instruction data deserialization so that you can work with instruction data as
Rust types.

```rust
#[program]
mod program_module_name {
    use super::*;

    pub fn instruction_one(ctx: Context<InstructionAccounts>, instruction_data: u64) -> Result<()> {
		ctx.accounts.account_name.data = instruction_data;
        Ok(())
    }
}
```

- The `#[program]` attribute macro is used to denote the module containing the
  program’s instruction logic.
- `use super::*;` is used to bring all the items from the parent module into
  scope, which are needed to define the instruction logic.
- Next, there is the instruction handler function. This function just writes
  some data (`instruction_data` in this case) to an account.

### Instruction `Context`

The `Context` type exposes instruction metadata and accounts to your instruction
logic.

```rust
pub struct Context<'a, 'b, 'c, 'info, T: Bumps> {
    /// Currently executing program id.
    pub program_id: &'a Pubkey,
    /// Deserialized accounts.
    pub accounts: &'b mut T,
    /// Remaining accounts given but not deserialized or validated.
    /// Be very careful when using this directly.
    pub remaining_accounts: &'c [UncheckedAccount<'info>],
    /// Bump seeds found during constraint validation. This is provided as a
    /// convenience so that handlers don't have to recalculate bump seeds or
    /// pass them in as arguments.
    /// Type is the bumps struct generated by #[derive(Accounts)]
    pub bumps: T::Bumps,
}
```

`Context` is a generic type where `T` defines the list of accounts an
instruction handler requires. When you use `Context`, you specify the concrete
type of `T` as a struct that adopts the `Accounts` trait.

The first argument of every instruction handler must be `Context`. `Context`
takes a generic of your `Accounts` struct, eg, if `AddMovieReview` was the
struct holding the accounts, the context for the `add_movie_review()` function
would be `Context<AddMovieReview>`.

> Yes, the Accounts struct is typically named the same thing as the instruction
> handler, just in TitleCase. Eg, the struct with the accounts for
> add_movie_review() is called AddMovieReview!

Through this context argument the instruction can then access:

- The accounts passed into the instruction (`ctx.accounts`)
- The program ID (`ctx.program_id`) of the executing program
- The remaining accounts (`ctx.remaining_accounts`). The `remaining_accounts` is
  a vector that contains all accounts that were passed into the instruction
  handler but are not declared in the `Accounts` struct.
- The bumps for any PDA accounts in the `Accounts` struct (`ctx.bumps`)
- The seeds for any PDA accounts in tha `Accounts` struct (`ctx.seeds`)

> The design of Contexts can be different across different programs to serve
> their purpose; and the name of the context could be anything (not limited to
> Context) to better reflect it's usage. This example is to help understand how
> contexts work in Anchor.

### Define instruction accounts

The `Accounts` trait:

- Defines a structure of validated accounts for an instruction handler
- Makes accounts accessible through an instruction handler's `Context`
- Is typically applied using `#[derive(Accounts)]`
- Implements an `Accounts` deserializer on the struct
- Performs constraint checks for secure program execution

Example:

- `instruction_one` requires a `Context<InstructionAccounts>`
- `InstructionAccounts` struct is implemented with `#[derive(Accounts)]`
- It includes accounts like `account_name`, `user`, and `system_program`
- Constraints are specified using the `#account(..)` attribute

```rust
#[program]
mod program_module_name {
    use super::*;
    pub fn instruction_one(ctx: Context<InstructionAccounts>, instruction_data: u64) -> Result<()> {
		...
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(
        init,
        payer = user,
        space = DISCRIMINATOR + AccountStruct::INIT_SPACE
    )]
    pub account_name: Account<'info, AccountStruct>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,

}
```

When `instruction_one` is invoked, the program:

- Checks that the accounts passed into the instruction handler match the account
  types specified in the `InstructionAccounts` struct
- Checks the accounts against any additional constraints specified

> If any accounts passed into `instruction_one` fail the account validation or
> security checks specified in the `InstructionAccounts` struct, then the
> instruction fails before even reaching the program logic.

### Account validation

You may have noticed in the previous example that one of the accounts in
`InstructionAccounts` was of type `Account`, one was of type `Signer`, and one
was of type `Program`.

Anchor provides a number of account types that can be used to represent
accounts. Each type implements different account validation. We’ll go over a few
of the common types you may encounter, but be sure to look through the
[full list of account types](https://docs.rs/anchor-lang/latest/anchor_lang/accounts/index.html).

#### `Account`

`Account` is a wrapper around `UncheckedAccount` that verifies program ownership
and deserializes the underlying data into a Rust type.

```rust
// Deserializes this info
pub struct UncheckedAccount<'a> {
    pub key: &'a Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
    pub lamports: Rc<RefCell<&'a mut u64>>,
    pub data: Rc<RefCell<&'a mut [u8]>>,    // <---- deserializes account data
    pub owner: &'a Pubkey,    // <---- checks owner program
    pub executable: bool,
    pub rent_epoch: u64,
}
```

Recall the previous example where `InstructionAccounts` had a field
`account_name`:

```rust
pub account_name: Account<'info, AccountStruct>
```

The `Account` wrapper here does the following:

- Deserializes the account `data` in the format of type `AccountStruct`
- Checks that the program owner of the account matches the program owner
  specified for the `AccountStruct` type.

When the account type specified in the `Account` wrapper is defined within the
same crate using the `#[account]` attribute macro, the program ownership check
is against the `programId` defined in the `declare_id!` macro.

The following are the checks performed:

```rust
// Checks
Account.info.owner == T::owner()
!(Account.info.owner == SystemProgram && Account.info.lamports() == 0)
```

#### `Signer`

The `Signer` type validates that the given account signed the transaction. No
other ownership or type checks are done. You should only use the `Signer` when
the underlying account data is not required in the instruction.

For the `user` account in the previous example, the `Signer` type specifies that
the `user` account must be a signer of the instruction.

The following check is performed for you:

```rust
// Checks
Signer.info.is_signer == true
```

#### `Program`

The `Program` type validates that the account is a certain program.

For the `system_program` account in the previous example, the `Program` type is
used to specify the program should be the system program. Anchor provides a
`System` type which includes the `programId` of the system program to check
against.

The following checks are performed for you:

```rust
//Checks
account_info.key == expected_program
account_info.executable == true
```

### Add constraints with `#[account(..)]`

The `#[account(..)]` attribute macro is used to apply constraints to accounts.
We'll go over a few constraint examples in this and future lessons, but at some
point be sure to look at the full
[list of possible constraints](https://docs.rs/anchor-lang/latest/anchor_lang/derive.Accounts.html).

Recall again the `account_name` field from the `InstructionAccounts` example.

```rust
#[account(
    init,
    payer = user,
    space = DISCRIMINATOR + AccountStruct::INIT_SPACE
)]
pub account_name: Account<'info, AccountStruct>,
#[account(mut)]
pub user: Signer<'info>,
```

Notice that the `#[account(..)]` attribute contains three comma-separated
values:

- `init` - creates the account via a CPI to the system program and initializes
  it (sets its account discriminator)
- `payer` - specifies the payer for the account initialization to be the `user`
  account defined in the struct
- `space`- the space allocated on the blockchain to store the account.
  - `DISCRIMINATOR` is the first 8 bytes of an account, which Anchor uses to
    save the type of the account.
  - `AccountStruct::INIT_SPACE` is the total size of space required for all the
    items in the `AccountStruct`.
  - The very need of using this `space` constraint can be eliminated by using
    `#[derive(InitSpace)]` macro. We'll see how to use that further in this
    lesson.

For `user` we use the `#[account(..)]` attribute to specify that the given
account is mutable. The `user` account must be marked as mutable because
lamports will be deducted from the account to pay for the initialization of
`account_name`.

```rust
#[account(mut)]
pub user: Signer<'info>,
```

Note that the `init` constraint placed on `account_name` automatically includes
a `mut` constraint so that both `account_name` and `user` are mutable accounts.

### `#[account]`

The `#[account]` attribute is applied to structs representing the data structure
of a Solana account. It implements the following traits:

- `AccountSerialize`
- `AccountDeserialize`
- `AnchorSerialize`
- `AnchorDeserialize`
- `Clone`
- `Discriminator`
- `Owner`

You can read more about the
[details of each trait](https://docs.rs/anchor-lang/latest/anchor_lang/attr.account.html).
However, mostly what you need to know is that the `#[account]` attribute enables
serialization and deserialization, and implements the discriminator and owner
traits for an account.

The discriminator is an 8-byte unique identifier for an account type derived
from the first 8 bytes of the SHA256 hash of the account type's name. The first
8 bytes are reserved for the account discriminator when implementing account
serialization traits (which is almost always in an Anchor program).

As a result, any calls to `AccountDeserialize`’s `try_deserialize` will check
this discriminator. If it doesn’t match, an invalid account was given, and the
account deserialization will exit with an error.

The `#[account]` attribute also implements the `Owner` trait for a struct using
the `programId` declared by `declareId` of the crate `#[account]` is used in. In
other words, all accounts initialized using an account type defined using the
`#[account]` attribute within the program are also owned by the program.

As an example, let's look at `AccountStruct` used by the `account_name` of
`InstructionAccounts`

```rust
#[derive(Accounts)]
pub struct InstructionAccounts {
    #[account(init,
        payer = user,
        space = DISCRIMINATOR + AnchorStruct::INIT_SPACE
    )]
    pub account_name: Account<'info, AccountStruct>,
    ...
}

#[account]
#[derive(InitSpace)]
pub struct AccountStruct {
    data: u64
}

const DISCRIMINATOR: usize = 8;
```

The `#[account]` attribute ensures that it can be used as an account in
`InstructionAccounts`.

When the `account_name` account is initialized:

- The first 8 bytes is set as the `AccountStruct` discriminator using the
  `DISCRIMINATOR` constant.
- The data field of the account will match `AccountStruct`
- The account owner is set as the `programId` from `declare_id`

> It is considered a good practice to use the `#[derive(InitSpace)]` macro which
> makes the code more readable and maintainable.

### Bring it all together

When you combine all of these Anchor types you end up with a complete program.
Below is an example of a basic Anchor program with a single instruction that:

- Initializes a new account
- Updates the data field on the account with the instruction data passed into
  the instruction

```rust
// Use this import to gain access to common anchor features
use anchor_lang::prelude::*;

// Program onchain address
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

// Instruction logic
#[program]
mod program_module_name {
    use super::*;
    pub fn instruction_one(ctx: Context<InstructionAccounts>, instruction_data: u64) -> Result<()> {
        ctx.accounts.account_name.data = instruction_data;
        Ok(())
    }
}

// Validate incoming accounts for instructions
#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(init,
        payer = user,
        space = DISCRIMINATOR + AccountStruct::INIT_SPACE
    )]
    pub account_name: Account<'info, AccountStruct>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// Define custom program account type
#[account]
#[derive(InitSpace)]
pub struct AccountStruct {
    data: u64
}

const DISCRIMINATOR: usize = 8;
```

#### Key takeaways:

- The whole program structure can be broadly divided into three parts:
  1. Account constraints: define the accounts required for the instructions, as
     well as rules to apply to them - e.g., whether they need to sign the
     transaction, if they should be created on demand, how addresses for PDAs,
     etc.
  2. Instruction handlers: implement program logic, as functions inside
     the`#[program]` module.
  3. Accounts: define the format used for data accounts.

You are now ready to build your own Solana program using the Anchor framework!

## Lab

### Making an Anchor v0.30.1 counter program for Solana

We'll put the information from this course into practice by creating a basic
counter program for Solana.

#### Setting up the development environment

`solana-cli` can be installed by following this
[installation guide](https://solana.com/docs/intro/installation).

> Our counter program will use the `agave` fork of `solana`, found at
> https://github.com/anza-xyz/agave. The latest mainnet-beta release as of
> 9/25/2024 is v1.18.23. To install it on any Linux distribution, you can follow
> these commands below:

```shell
curl -O https://raw.githubusercontent.com/anza-xyz/agave/v1.18.23/scripts/agave-install-init-x86_64-unknown-linux-gnu
chmod +x agave-install-init-x86_64-unknown-linux-gnu
./agave-install-init-x86_64-unknown-linux-gnu v1.18.23
solana --version
# if solana --version isn't recognized, try adding agave to your path:
echo 'export PATH="$HOME/.agave/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Go to your terminal and ensure that the following commands output usable
versions. Anchor will fail to create the tests directory if you don't have npm
installed on your OS, so ensure npm is installed alongside the other
dependencies:

```shell
node --version
npm --version
yarn --version
solana --version
rustc --version
```

> The Anchor documentation doesn't mention
> [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), but
> it is critical for `anchor init` to generate the tests directory and the
> package.json.

The output for the latest versions as of 09/25/24 is:

```shell
v22.9.0
10.8.3
1.22.22
solana-cli 1.18.18 (src:83047136; feat:4215500110, client:SolanaLabs)
# if you're using agave, the latest version of solana-cli should show as of 09/25/24:
solana-cli 1.18.23 (src:e5d267d9; feat:4215500110, client:Agave)
rustc 1.81.0 (eeb90cda1 2024-09-04)
```

To install anchor, follow the
[instructions](https://www.anchor-lang.com/docs/installation).

> The most recent version of anchor (v0.30.1) has a minor conflict with rust
> versions ^1.79.0, so it might be necessary to follow this
> [solution](https://github.com/coral-xyz/anchor/issues/3131#issuecomment-2264178262)
> during installation. Don't worry, it's an extremely fast and easy fix.

If you'd rather just downgrade rust, you can set the development environment's
rust version to 1.79.0 using rustup:

```shell
rustup install 1.79.0
rustup default 1.79.0
```

Verify you've installed avm and the latest anchor versions:

```shell
avm --version
anchor --version
```

The outputs should be similar to:

```shell
avm 0.30.1
anchor-cli 0.30.1
```

#### Creating a new Anchor project with the multiple files template

```shell
anchor init anchor-counter --template multiple
```

This will create the anchor-counter directory with the necessary files, which
we'll adjust to work as a counter program.

#### Writing the code for the counter program

The resulting `tree` (excluding the `node_modules` directory) from the above
command will be:

```shell
tree -I 'node_modules'
.
├── Anchor.toml
├── app
├── Cargo.toml
├── migrations
│   └── deploy.ts
├── package.json
├── programs
│   └── anchor-counter
│       ├── Cargo.toml
│       ├── src
│       │   ├── constants.rs
│       │   ├── error.rs
│       │   ├── instructions
│       │   │   ├── initialize.rs
│       │   │   └── mod.rs
│       │   ├── lib.rs
│       │   └── state
│       │       └── mod.rs
│       └── Xargo.toml
├── target
│   └── deploy
│       └── anchor_counter-keypair.json
├── tests
│   └── anchor-counter.ts
├── tsconfig.json
└── yarn.lock

11 directories, 16 files
```

The `app` directory is where you can add frontend code for your program, if
you'd like. The `migrations` directory is where you can add scripts to deploy
your program. The `tests` directory is where you can add tests for your program.
The `programs` directory is where the bulk of the anchor code will go.

#### Writing the program code

Let's navigate to the `programs/anchor-counter` directory, and open the
src/lib.rs file.

Anchor build will generate a keypair for your new program - the keys are saved
in the `target/deploy` directory.

```shell
cd anchor-counter
anchor build
```

Keep your declare_id! line as is, because that is specific to your instance of
the program.

To ensure that your program ID is correctly set, you can run the following
command:

```shell
anchor keys sync
```

This will update your Anchor.toml and src/lib.rs files with the correct program
ID.

Update the src/lib.rs file with the following (but keep your declare_id as it is
after running `anchor keys sync`):

```rust
use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod constants;

use instructions::*;

declare_id!("GHmQT2iEwiw3hZvWsYt94mWtEDhK5kBktYhhddLH1e4c");

#[program]
pub mod anchor_counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize::handler(ctx)
    }

    pub fn increment(ctx: Context<IncrementUpdate>) -> Result<()> {
        instructions::increment::increment_handler(ctx)
    }

    pub fn decrement(ctx: Context<DecrementUpdate>) -> Result<()> {
        instructions::decrement::decrement_handler(ctx)
    }
}
```

Let's use the `#[account]` attribute to define a new `Counter` account type. The
`Counter` struct defines one `count` field of type `u64`. This means that we can
expect any new accounts initialized as a `Counter` type to have a matching data
structure. The `#[account]` attribute also automatically sets the discriminator
for a new account and sets the owner of the account as the `programId` from the
`declare_id!` macro.

Now, let's update the `state/mod.rs` file. Note the use of the InitSpace
attribute, which automatically calculates the lamports needed for the account:

```rust
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Counter {
    pub count: u64,
}
```

This Counter struct will be used to define the counter account's data
structure - a simple u64 count.

Next, let's update the `instructions/mod.rs` file, which defines the modules for
each instruction and allows them to be imported into the lib.rs file:

```rust
pub mod initialize;
pub mod increment;
pub mod decrement;

pub use initialize::*;
pub use increment::*;
pub use decrement::*;
```

Now we'll implement `Context` type `Initialize` to handle the initialization of
our counter.

Using the `#[derive(Accounts)]` macro, let’s implement the `Initialize` type
that lists and validates the accounts used by the `initialize` instruction.
It'll need the following accounts:

- `counter` - the counter account initialized in the instruction
- `user` - payer for the initialization
- `system_program` - the system program is required for the initialization of
  any new accounts

> You'll see `INIT_SPACE` accessed here, thanks to the `derive(InitSpace)` macro
> from earlier. You can read more about the mechanics of space allocation from
> the official [anchor documentation](https://www.anchor-lang.com/docs/space).

Inside of `instructions/initialize.rs`, adjust the code to match the following:

```rust
use crate::state::Counter;
use anchor_lang::prelude::*;

const DISCRIMINATOR: usize = 8;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = DISCRIMINATOR + Counter::INIT_SPACE)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<Initialize>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = 0;
    msg!("Counter initialized. Initial count: {}.", counter.count);
    Ok(())
}

```

Within instructions/increment.rs, let’s implement an `increment` instruction
handler to increment the `count` once a `counter` account is initialized by the
first instruction handler. This instruction handler requires a `Context` of type
`Update` (implemented in a previous step) and takes no additional instruction
data. In the instruction handler's logic, we are simply tracking the current
state, and then incrementing the existing `counter` account’s `count` field by
`1`.

```rust
use crate::state::Counter;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct IncrementUpdate<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}

pub fn increment_handler(ctx: Context<IncrementUpdate>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    let previous_count = counter.count;
    counter.count += 1;
    msg!(
        "Counter incremented. Previous count: {}; New count: {}.",
        previous_count,
        counter.count
    );
    Ok(())
}
```

Finally, let's create the `instructions/decrement.rs` file to handle
decrementing the counter, which functions in the same way as the incrementation
instruction handler, but to subtract 1 instead.

We'll be using the `#[derive(Accounts)]` macro again to create the
`DecrementUpdate` type that lists the accounts that the `decrement` instruction
handler requires. It'll need the following accounts:

- `counter` - an existing counter account to increment
- `user` - payer for the transaction fee

Just like in the previous step with the increment instruction handler, we’ll
need to specify any constraints using the `#[account(..)]` attribute:

```rust
use crate::state::Counter;
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct DecrementUpdate<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    pub user: Signer<'info>,
}

pub fn decrement_handler(ctx: Context<DecrementUpdate>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    let previous_count = counter.count;
    counter.count -= 1;
    msg!(
        "Counter decremented. Previous count: {}; New count: {}.",
        previous_count,
        counter.count
    );
    Ok(())
}
```

Now, we can navigate back to the `anchor-counter` directory and build the
completed program:

```shell
anchor build
```

This will create a `target` directory with the build artifacts.

You can validate the program ID matches your keypair by running the following
command:

```shell
anchor keys list
```

Then go to the root Anchor.toml and src/lib.rs to ensure that the program ID
matches the output of `anchor keys list`.

#### Setting up the test environment

Navigate to the root `anchor-counter` directory and run the following commands:

```shell
yarn install
```

This will install the dependencies for testing with typescript.

Let's also update the tsconfig.json to use commonjs and node's module
resolution, as well as ES2022.

```json
{
  "compilerOptions": {
    "types": ["mocha", "chai"],
    "typeRoots": ["./node_modules/@types"],
    "lib": ["ES2022", "DOM"],
    "module": "commonjs",
    "target": "ES2022",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@coral-xyz/anchor": ["node_modules/@coral-xyz/anchor"]
    }
  },
  "include": ["tests/**/*"],
  "exclude": ["node_modules"]
}
```

Then, go to anchor-counter/tests/anchor-counter.ts and update the code:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorCounter } from "../target/types/anchor_counter";
import { expect } from "chai";

describe("anchor-counter", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorCounter as Program<AnchorCounter>;
  const counterKeypair = anchor.web3.Keypair.generate();

  it("Initializes the counter", async () => {
    const tx = await program.methods
      .initialize()
      .accounts({
        counter: counterKeypair.publicKey,
        user: provider.wallet.publicKey,
      })
      .signers([counterKeypair])
      .rpc();

    const account = await program.account.counter.fetch(
      counterKeypair.publicKey,
    );
    expect(account.count.toNumber()).to.equal(0);
  });

  it("Increments the counter", async () => {
    await program.methods
      .increment()
      .accounts({
        counter: counterKeypair.publicKey,
        user: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.counter.fetch(
      counterKeypair.publicKey,
    );
    expect(account.count.toNumber()).to.equal(1);
  });

  it("Decrements the counter", async () => {
    await program.methods
      .decrement()
      .accounts({
        counter: counterKeypair.publicKey,
        user: provider.wallet.publicKey,
      })
      .rpc();

    const account = await program.account.counter.fetch(
      counterKeypair.publicKey,
    );
    expect(account.count.toNumber()).to.equal(0);
  });
});
```

This creates a provider using the environment's wallet, sets the localnet
(localhost) provider for anchor, and creates a program instance using the
workspace. It also generates a keypair for the counter. This will allow
`anchor test` to run the tests where we check that the counter is initializing,
incrementing, and decrementing as expected.

Let's try running them now! Get back to your root `anchor-counter` directory and
run the following command:

```shell
anchor test
```

If all goes well, you should see the following output:

```shell
  anchor-counter
    ✔ Initializes the counter (151ms)
    ✔ Increments the counter (410ms)
    ✔ Decrements the counter (401ms)
```

#### Conclusion and deployment

Congratulations! You've created a basic counter program for Solana using Anchor!

When you're ready to deploy a Solana program, run the following command:

```shell
anchor deploy
```

Keep in mind, this will require SOL to pay for rent and transaction fees
associated with the deployment. You can check which cluster you're connected to
by running `solana config get`. If you're not connected to the devnet, you can
connect to it by running
`solana config set --url https://api.devnet.solana.com`.

## Challenge

Now it’s your turn to build something independently. Because we're starting with
simple programs, yours will look almost identical to what we just created. It's
useful to try to get to the point where you can write it from scratch without
referencing prior code, so try not to copy and paste here.

1. Write a new program that initializes a `counter` account
2. Implement both an `increment` and `decrement` instruction for intervals of
   both 1 and 5
3. Build and deploy your program like we did in the lab
4. Test your newly deployed program and use Solana Explorer to check the program
   logs

As always, get creative with these challenges and take them beyond the basic
instructions if you want - and have fun!

Try to do this independently if you can! But if you get stuck, feel free to
the [solution code](https://github.com/shawazi/anchor-counter).

> Push your code to GitHub and
> [tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=334874b7-b152-4473-b5a5-5474c3f8f3f1)!
