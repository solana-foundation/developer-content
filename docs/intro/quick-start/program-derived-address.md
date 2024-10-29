---
sidebarLabel: Program Derived Address
title: Program Derived Address
sidebarSortOrder: 4
description:
  Learn how to build a CRUD (Create, Read, Update, Delete) Solana program using
  Program Derived Addresses (PDAs) and the Anchor framework. This step-by-step
  guide demonstrates how to create, update, and delete on-chain message accounts
  using PDAs, implement account validation, and write tests. Perfect for
  developers looking to understand how to use PDAs in Solana programs.
---

In this section, we'll walk through how to build a basic CRUD (Create, Read,
Update, Delete) program. The program will store a user's message using a Program
Derived Address (PDA) as the account's address.

The purpose of this section is to guide you through the steps for building and
testing a Solana program using the Anchor framework and demonstrating how to use
PDAs within a program. For more details, refer to the
[Programs Derived Address](/docs/core/pda) page.

For reference, here is the
[final code](https://beta.solpg.io/668304cfcffcf4b13384d20a) after completing
both the PDA and CPI sections.

<Steps>

### Starter Code

Begin by opening this
[Solana Playground link](https://beta.solpg.io/66734b7bcffcf4b13384d1ad) with
the starter code. Then click the "Import" button, which will add the program to
your list of projects on Solana Playground.

![Import](/assets/docs/intro/quickstart/pg-import.png)

In the `lib.rs` file, you'll find a program scaffolded with the `create`,
`update`, and `delete` instructions we'll implement in the following steps.

```rs filename="lib.rs"
use anchor_lang::prelude::*;

declare_id!("8KPzbM2Cwn4Yjak7QYAEH9wyoQh86NcBicaLuzPaejdw");

#[program]
pub mod pda {
    use super::*;

    pub fn create(_ctx: Context<Create>) -> Result<()> {
        Ok(())
    }

    pub fn update(_ctx: Context<Update>) -> Result<()> {
        Ok(())
    }

    pub fn delete(_ctx: Context<Delete>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create {}

#[derive(Accounts)]
pub struct Update {}

#[derive(Accounts)]
pub struct Delete {}

#[account]
pub struct MessageAccount {}
```

Before we begin, run `build` in the Playground terminal to check the starter
program builds successfully.

```shell filename="Terminal"
build
```

<Accordion>
<AccordionItem title="Output">

```shell filename="Terminal"
$ build
Building...
Build successful. Completed in 3.50s.
```

</AccordionItem>
</Accordion>

### Define Message Account Type

First, let's define the structure for the message account that our program will
create. This is the data that we'll store in the account created by the program.

In `lib.rs`, update the `MessageAccount` struct with the following:

```rs filename="lib.rs"
#[account]
pub struct MessageAccount {
    pub user: Pubkey,
    pub message: String,
    pub bump: u8,
}
```

<Accordion>
<AccordionItem title="Diff">

```diff
- #[account]
- pub struct MessageAccount {}

+ #[account]
+ pub struct MessageAccount {
+    pub user: Pubkey,
+    pub message: String,
+    pub bump: u8,
+ }
```

</AccordionItem>
<AccordionItem title="Explanation">

The `#[account]` macro in an Anchor program is used to annotate structs that
represent account data (data type to store in the AccountInfo's data field).

In this example, we're defining a `MessageAccount` struct to store a message
created by users that contains three fields:

- `user` - A Pubkey representing the user who created the message account.
- `message` - A String containing the user's message.
- `bump` - A u8 storing the ["bump" seed](/docs/core/pda#canonical-bump) used in
  deriving the program derived address (PDA). Storing this value saves compute
  by eliminating the need to rederive it for each use in subsequent
  instructions. When an account is created, the `MessageAccount` data will be
  serialized and stored in the new account's data field.

Later, when reading from the account, this data can be deserialized back into
the `MessageAccount` data type. The process of creating and reading the account
data will be demonstrated in the testing section.

</AccordionItem>
</Accordion>

Build the program again by running `build` in the terminal.

```shell filename="Terminal"
build
```

We've defined what our message account will look like. Next, we'll implement the
program instructions.

### Implement Create Instruction

Now, let's implement the `create` instruction to create and initialize the
`MessageAccount`.

Start by defining the accounts required for the instruction by updating the
`Create` struct with the following:

```rs filename="lib.rs"
#[derive(Accounts)]
#[instruction(message: String)]
pub struct Create<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [b"message", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 4 + message.len() + 1
    )]
    pub message_account: Account<'info, MessageAccount>,
    pub system_program: Program<'info, System>,
}
```

<Accordion>
<AccordionItem title="Diff">

```diff
- #[derive(Accounts)]
- pub struct Create {}

+ #[derive(Accounts)]
+ #[instruction(message: String)]
+ pub struct Create<'info> {
+     #[account(mut)]
+     pub user: Signer<'info>,
+
+     #[account(
+         init,
+         seeds = [b"message", user.key().as_ref()],
+         bump,
+         payer = user,
+         space = 8 + 32 + 4 + message.len() + 1
+     )]
+     pub message_account: Account<'info, MessageAccount>,
+     pub system_program: Program<'info, System>,
+ }
```

</AccordionItem>
<AccordionItem title="Explanation">

The `#[derive(Accounts)]` macro in an Anchor program is used to annotate structs
that represent a list of accounts required by an instruction where each field in
the struct is an account.

Each account (field) in the struct is annotated with an account type (ex.
`Signer<'info>`) and can be further annotated with constraints (ex.
`#[account(mut)]`). The account type along with account constraints are used to
perform security checks on the accounts passed to the instruction.

The naming of each field is only for our understanding and has no effect on
account validation, however, it is recommended to use descriptive account names.

---

The `Create` struct defines the accounts required for the `create` instruction.

1. `user: Signer<'info>`

   - Represents the user creating the message account
   - Marked as mutable (`#[account(mut)]`) as it pays for the new account
   - Must be a signer to approve the transaction, as lamports are deducted from
     the account

2. `message_account: Account<'info, MessageAccount>`

   - The new account created to store the user's message
   - `init` constraint indicates the account will be created in the instruction
   - `seeds` and `bump` constraints indicate the address of the account is a
     Program Derived Address (PDA)
   - `payer = user` specifies the account paying for the creation of the new
     account
   - `space` specifies the number of bytes allocated to the new account's data
     field

3. `system_program: Program<'info, System>`

   - Required for creating new accounts
   - Under the hood, the `init` constraint invokes the System Program to create
     a new account allocated with the specified `space` and reassigns the
     program owner to the current program.

---

The `#[instruction(message: String)]` annotation enables the `Create` struct to
access the `message` parameter from the `create` instruction.

---

The `seeds` and `bump` constraints are used together to specify that an
account's address is a Program Derived Address (PDA).

```rs filename="lib.rs"
seeds = [b"message", user.key().as_ref()],
bump,
```

The `seeds` constraint defines the optional inputs used to derive the PDA.

- `b"message"` - A hardcoded string as the first seed.
- `user.key().as_ref()` - The public key of the `user` account as the second
  seed.

The `bump` constraint tells Anchor to automatically find and use the correct
bump seed. Anchor will use the `seeds` and `bump` to derive the PDA.

---

The `space` calculation (8 + 32 + 4 + message.len() + 1) allocates space for
`MessageAccount` data type:

- Anchor Account discriminator (identifier): 8 bytes
- User Address (Pubkey): 32 bytes
- User Message (String): 4 bytes for length + variable message length
- PDA Bump seed (u8): 1 byte

```rs filename="lib.rs"
#[account]
pub struct MessageAccount {
    pub user: Pubkey,
    pub message: String,
    pub bump: u8,
}
```

All accounts created through an Anchor program require 8 bytes for an account
discriminator, which is an identifier for the account type that is automatically
generated when the account is created.

A `String` type requires 4 bytes to store the length of the string, and the
remaining length is the actual data.

</AccordionItem>
</Accordion>

Next, implement the business logic for the `create` instruction by updating the
`create` function with the following:

```rs filename="lib.rs"
pub fn create(ctx: Context<Create>, message: String) -> Result<()> {
    msg!("Create Message: {}", message);
    let account_data = &mut ctx.accounts.message_account;
    account_data.user = ctx.accounts.user.key();
    account_data.message = message;
    account_data.bump = ctx.bumps.message_account;
    Ok(())
}
```

<Accordion>
<AccordionItem title="Diff">

```diff
- pub fn create(_ctx: Context<Create>) -> Result<()> {
-     Ok(())
- }

+ pub fn create(ctx: Context<Create>, message: String) -> Result<()> {
+     msg!("Create Message: {}", message);
+     let account_data = &mut ctx.accounts.message_account;
+     account_data.user = ctx.accounts.user.key();
+     account_data.message = message;
+     account_data.bump = ctx.bumps.message_account;
+     Ok(())
+ }
```

</AccordionItem>
<AccordionItem title="Explanation">

The `create` function implements the logic for initializing a new message
account's data. It takes two parameters:

1. `ctx: Context<Create>` - Provides access to the accounts specified in the
   `Create` struct.
2. `message: String` - The user's message to be stored.

The body of the function then performs the following logic:

1. Print a message to program logs using the `msg!()` macro.

   ```rs
   msg!("Create Message: {}", message);
   ```

2. Initializing Account Data:

   - Accesses the `message_account` from the context.

   ```rs
   let account_data = &mut ctx.accounts.message_account;
   ```

   - Sets the `user` field to the public key of the `user` account.

   ```rs
   account_data.user = ctx.accounts.user.key();
   ```

   - Sets the `message` field to the `message` from the function argument.

   ```rs
   account_data.message = message;
   ```

   - Sets the `bump` value used to derive the PDA, retrieved from
     `ctx.bumps.message_account`.

   ```rs
   account_data.bump = ctx.bumps.message_account;
   ```

</AccordionItem>
</Accordion>

Rebuild the program.

```shell filename="Terminal"
build
```

### Implement Update Instruction

Next, implement the `update` instruction to update the `MessageAccount` with a
new message.

Just as before, the first step is to specify the accounts required by the
`update` instruction.

Update the `Update` struct with the following:

```rs filename="lib.rs"
#[derive(Accounts)]
#[instruction(message: String)]
pub struct Update<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        realloc = 8 + 32 + 4 + message.len() + 1,
        realloc::payer = user,
        realloc::zero = true,
    )]
    pub message_account: Account<'info, MessageAccount>,
    pub system_program: Program<'info, System>,
}
```

<Accordion>
<AccordionItem title="Diff">

```diff
- #[derive(Accounts)]
- pub struct Update {}

+ #[derive(Accounts)]
+ #[instruction(message: String)]
+ pub struct Update<'info> {
+     #[account(mut)]
+     pub user: Signer<'info>,
+
+     #[account(
+         mut,
+         seeds = [b"message", user.key().as_ref()],
+         bump = message_account.bump,
+         realloc = 8 + 32 + 4 + message.len() + 1,
+         realloc::payer = user,
+         realloc::zero = true,
+     )]
+     pub message_account: Account<'info, MessageAccount>,
+     pub system_program: Program<'info, System>,
+ }
```

</AccordionItem>
<AccordionItem title="Explanation">

The `Update` struct defines the accounts required for the `update` instruction.

1. `user: Signer<'info>`

   - Represents the user updating the message account
   - Marked as mutable (`#[account(mut)]`) as it may pay for additional space
     for the `message_account` if needed
   - Must be a signer to approve the transaction

2. `message_account: Account<'info, MessageAccount>`

   - The existing account storing the user's message that will be updated
   - `mut` constraint indicates this account's data will be modified
   - `realloc` constraint allows for resizing the account's data
   - `seeds` and `bump` constraints ensure the account is the correct PDA

3. `system_program: Program<'info, System>`
   - Required for potential reallocation of account space
   - The `realloc` constraint invokes the System Program to adjust the account's
     data size

---

Note that the `bump = message_account.bump` constraint uses the bump seed stored
on the `mesesage_account`, rather than having Anchor recalculate it.

---

`#[instruction(message: String)]` annotation enables the `Update` struct to
access the `message` parameter from the `update` instruction.

</AccordionItem>
</Accordion>

Next, implement the logic for the `update` instruction.

```rs filename="lib.rs"
pub fn update(ctx: Context<Update>, message: String) -> Result<()> {
    msg!("Update Message: {}", message);
    let account_data = &mut ctx.accounts.message_account;
    account_data.message = message;
    Ok(())
}
```

<Accordion>
<AccordionItem title="Diff">

```diff
- pub fn update(_ctx: Context<Update>) -> Result<()> {
-     Ok(())
- }

+ pub fn update(ctx: Context<Update>, message: String) -> Result<()> {
+     msg!("Update Message: {}", message);
+     let account_data = &mut ctx.accounts.message_account;
+     account_data.message = message;
+     Ok(())
+ }
```

</AccordionItem>
<AccordionItem title="Explanation">

The `update` function implements the logic for modifying an existing message
account. It takes two parameters:

1. `ctx: Context<Update>` - Provides access to the accounts specified in the
   `Update` struct.
2. `message: String` - The new message to replace the existing one.

The body of the function then:

1. Print a message to program logs using the `msg!()` macro.

2. Updates Account Data:
   - Accesses the `message_account` from the context.
   - Sets the `message` field to the new `message` from the function argument.

</AccordionItem>
</Accordion>

Rebuild the program

```shell filename="Terminal"
build
```

### Implement Delete Instruction

Next, implement the `delete` instruction to close the `MessageAccount`.

Update the `Delete` struct with the following:

```rs filename="lib.rs"
#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        close= user,
    )]
    pub message_account: Account<'info, MessageAccount>,
}
```

<Accordion>
<AccordionItem title="Diff">

```diff
- #[derive(Accounts)]
- pub struct Delete {}

+ #[derive(Accounts)]
+ pub struct Delete<'info> {
+     #[account(mut)]
+     pub user: Signer<'info>,
+
+     #[account(
+         mut,
+         seeds = [b"message", user.key().as_ref()],
+         bump = message_account.bump,
+         close = user,
+     )]
+     pub message_account: Account<'info, MessageAccount>,
+ }
```

</AccordionItem>
<AccordionItem title="Explanation">

The `Delete` struct defines the accounts required for the `delete` instruction:

1. `user: Signer<'info>`

   - Represents the user closing the message account
   - Marked as mutable (`#[account(mut)]`) as it will receive the lamports from
     the closed account
   - Must be a signer to ensure only the correct user can close their message
     account

2. `message_account: Account<'info, MessageAccount>`

   - The account being closed
   - `mut` constraint indicates this account will be modified
   - `seeds` and `bump` constraints ensure the account is the correct PDA
   - `close = user` constraint specifies that this account will be closed and
     its lamports transferred to the `user` account

</AccordionItem>
</Accordion>

Next, implement the logic for the `delete` instruction.

```rs filename="lib.rs"
pub fn delete(_ctx: Context<Delete>) -> Result<()> {
    msg!("Delete Message");
    Ok(())
}
```

<Accordion>
<AccordionItem title="Diff">

```diff
- pub fn delete(_ctx: Context<Delete>) -> Result<()> {
-     Ok(())
- }

+ pub fn delete(_ctx: Context<Delete>) -> Result<()> {
+     msg!("Delete Message");
+     Ok(())
+ }
```

</AccordionItem>
<AccordionItem title="Explanation">

The `delete` function takes one parameter:

1. `_ctx: Context<Delete>` - Provides access to the accounts specified in the
   `Delete` struct. The `_ctx` syntax indicates we won't be using the Context in
   the body of the function.

The body of the function only prints a message to program logs using the
`msg!()` macro. The function does not require any additional logic because the
actual closing of the account is handled by the `close` constraint in the
`Delete` struct.

</AccordionItem>
</Accordion>

Rebuild the program.

```shell filename="Terminal"
build
```

### Deploy Program

The basic CRUD program is now complete. Deploy the program by running `deploy`
in the Playground terminal.

```shell filename="Terminal"
deploy
```

<Accordion>
<AccordionItem title="Output">

```bash
$ deploy
Deploying... This could take a while depending on the program size and network conditions.
Deployment successful. Completed in 17s.
```

</AccordionItem>
</Accordion>

### Set Up Test File

Included with the starter code is also a test file in `anchor.test.ts`.

```ts filename="anchor.test.ts"
import { PublicKey } from "@solana/web3.js";

describe("pda", () => {
  it("Create Message Account", async () => {});

  it("Update Message Account", async () => {});

  it("Delete Message Account", async () => {});
});
```

Add the code below inside `describe`, but before the `it` sections.

```ts filename="anchor.test.ts"
const program = pg.program;
const wallet = pg.wallet;

const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("message"), wallet.publicKey.toBuffer()],
  program.programId,
);
```

<Accordion>
<AccordionItem title="Diff">

```diff
  import { PublicKey } from "@solana/web3.js";

  describe("pda", () => {
+    const program = pg.program;
+    const wallet = pg.wallet;
+
+    const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
+      [Buffer.from("message"), wallet.publicKey.toBuffer()],
+      program.programId
+    );

    it("Create Message Account", async () => {});

    it("Update Message Account", async () => {});

    it("Delete Message Account", async () => {});
  });
```

</AccordionItem>
<AccordionItem title="Explanation">

In this section, we are simply setting up the test file.

Solana Playground removes some boilerplate setup where `pg.program` allows us to
access the client library for interacting with the program, while `pg.wallet` is
your playground wallet.

```ts filename="anchor.test.ts"
const program = pg.program;
const wallet = pg.wallet;
```

As part of the setup, we derive the message account PDA. This demonstrates how
to derive the PDA in Javascript using the seeds specified in the program.

```ts filename="anchor.test.ts"
const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("message"), wallet.publicKey.toBuffer()],
  program.programId,
);
```

</AccordionItem>
</Accordion>

Run the test file by running `test` in the Playground terminal to check the file
runs as expected. We will implement the tests in the following steps.

```shell filename="Terminal"
test
```

<Accordion>
<AccordionItem title="Output">

```bash
$ test
Running tests...
  anchor.test.ts:
  pda
    ✔ Create Message Account
    ✔ Update Message Account
    ✔ Delete Message Account
  3 passing (4ms)
```

</AccordionItem>
</Accordion>

### Invoke Create Instruction

Update the first test with the following:

```ts filename="anchor.test.ts"
it("Create Message Account", async () => {
  const message = "Hello, World!";
  const transactionSignature = await program.methods
    .create(message)
    .accounts({
      messageAccount: messagePda,
    })
    .rpc({ commitment: "confirmed" });

  const messageAccount = await program.account.messageAccount.fetch(
    messagePda,
    "confirmed",
  );

  console.log(JSON.stringify(messageAccount, null, 2));
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );
});
```

<Accordion>
<AccordionItem title="Diff">

```diff
- it("Create Message Account", async () => {});

+ it("Create Message Account", async () => {
+   const message = "Hello, World!";
+   const transactionSignature = await program.methods
+     .create(message)
+     .accounts({
+       messageAccount: messagePda,
+     })
+     .rpc({ commitment: "confirmed" });
+
+   const messageAccount = await program.account.messageAccount.fetch(
+     messagePda,
+     "confirmed"
+   );
+
+   console.log(JSON.stringify(messageAccount, null, 2));
+   console.log(
+     "Transaction Signature:",
+     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
+   );
+ });
```

</AccordionItem>
<AccordionItem title="Explanation">

First, we send a transaction that invokes the `create` instruction, passing in
"Hello, World!" as the message.

```ts filename="anchor.test.ts"
const message = "Hello, World!";
const transactionSignature = await program.methods
  .create(message)
  .accounts({
    messageAccount: messagePda,
  })
  .rpc({ commitment: "confirmed" });
```

Once the transaction is sent and the account is created, we then fetch the
account using its address (`messagePda`).

```ts filename="anchor.test.ts"
const messageAccount = await program.account.messageAccount.fetch(
  messagePda,
  "confirmed",
);
```

Lastly, we log the account data and a link to view the transaction details.

```ts filename="anchor.test.ts"
console.log(JSON.stringify(messageAccount, null, 2));
console.log(
  "Transaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

</AccordionItem>
</Accordion>

### Invoke Update Instruction

Update the second test with the following:

```ts filename="anchor.test.ts"
it("Update Message Account", async () => {
  const message = "Hello, Solana!";
  const transactionSignature = await program.methods
    .update(message)
    .accounts({
      messageAccount: messagePda,
    })
    .rpc({ commitment: "confirmed" });

  const messageAccount = await program.account.messageAccount.fetch(
    messagePda,
    "confirmed",
  );

  console.log(JSON.stringify(messageAccount, null, 2));
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );
});
```

<Accordion>
<AccordionItem title="Diff">

```diff
- it("Update Message Account", async () => {});

+ it("Update Message Account", async () => {
+   const message = "Hello, Solana!";
+   const transactionSignature = await program.methods
+     .update(message)
+     .accounts({
+       messageAccount: messagePda,
+     })
+     .rpc({ commitment: "confirmed" });
+
+   const messageAccount = await program.account.messageAccount.fetch(
+     messagePda,
+     "confirmed"
+   );
+
+   console.log(JSON.stringify(messageAccount, null, 2));
+   console.log(
+     "Transaction Signature:",
+     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
+   );
+ });
```

</AccordionItem>
<AccordionItem title="Explanation">

First, we send a transaction that invokes the `update` instruction, passing in
"Hello, Solana!" as the new message.

```ts filename="anchor.test.ts"
const message = "Hello, Solana!";
const transactionSignature = await program.methods
  .update(message)
  .accounts({
    messageAccount: messagePda,
  })
  .rpc({ commitment: "confirmed" });
```

Once the transaction is sent and the account is updated, we then fetch the
account using its address (`messagePda`).

```ts filename="anchor.test.ts"
const messageAccount = await program.account.messageAccount.fetch(
  messagePda,
  "confirmed",
);
```

Lastly, we log the account data and a link to view the transaction details.

```ts filename="anchor.test.ts"
console.log(JSON.stringify(messageAccount, null, 2));
console.log(
  "Transaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

</AccordionItem>
</Accordion>

### Invoke Delete Instruction

Update the third test with the following:

```ts filename="anchor.test.ts"
it("Delete Message Account", async () => {
  const transactionSignature = await program.methods
    .delete()
    .accounts({
      messageAccount: messagePda,
    })
    .rpc({ commitment: "confirmed" });

  const messageAccount = await program.account.messageAccount.fetchNullable(
    messagePda,
    "confirmed",
  );

  console.log("Expect Null:", JSON.stringify(messageAccount, null, 2));
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );
});
```

<Accordion>
<AccordionItem title="Diff">

```diff
- it("Delete Message Account", async () => {});

+ it("Delete Message Account", async () => {
+   const transactionSignature = await program.methods
+     .delete()
+     .accounts({
+       messageAccount: messagePda,
+     })
+     .rpc({ commitment: "confirmed" });
+
+   const messageAccount = await program.account.messageAccount.fetchNullable(
+     messagePda,
+     "confirmed"
+   );
+
+   console.log("Expect Null:", JSON.stringify(messageAccount, null, 2));
+   console.log(
+     "Transaction Signature:",
+     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
+   );
+ });
```

</AccordionItem>
<AccordionItem title="Explanation">

First, we send a transaction that invokes the `delete` instruction to close the
message account.

```ts filename="anchor.test.ts"
const transactionSignature = await program.methods
  .delete()
  .accounts({
    messageAccount: messagePda,
  })
  .rpc({ commitment: "confirmed" });
```

Once the transaction is sent and the account is closed, we attempt to fetch the
account using its address (`messagePda`) using `fetchNullable` since we expect
the return value to be null because the account is closed.

```ts filename="anchor.test.ts"
const messageAccount = await program.account.messageAccount.fetchNullable(
  messagePda,
  "confirmed",
);
```

Lastly, we log the account data and a link to view the transaction details where
the account data should be logged as null.

```ts filename="anchor.test.ts"
console.log(JSON.stringify(messageAccount, null, 2));
console.log(
  "Transaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

</AccordionItem>
</Accordion>

### Run Test

Once the tests are set up, run the test file by running `test` in the Playground
terminal.

```shell filename="Terminal"
test
```

<Accordion>
<AccordionItem title="Output">

```bash
$ test
Running tests...
  anchor.test.ts:
  pda
    {
  "user": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "message": "Hello, World!",
  "bump": 254
}
    Transaction Signature: https://solana.fm/tx/5oBT4jEdUR6CRYsFNGoqvyMBTRDvFqRWTAAmCGM9rEvYRBWy3B2bkb6GVFpVPKBnkr714UCFUurBSDKSa7nLHo8e?cluster=devnet-solana
    ✔ Create Message Account (1025ms)
    {
  "user": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "message": "Hello, Solana!",
  "bump": 254
}
    Transaction Signature: https://solana.fm/tx/42veGAsQjHbJP1SxWBGcfYF7EdRN9X7bACNv23NSZNe4U7w2dmaYgSv8UUWXYzwgJPoNHejhtWdKZModHiMaTWYK?cluster=devnet-solana
    ✔ Update Message Account (713ms)
    Expect Null: null
    Transaction Signature: https://solana.fm/tx/Sseog2i2X7uDEn2DyDMMJKVHeZEzmuhnqUwicwGhnGhstZo8URNwUZgED8o6HANiojJkfQbhXVbGNLdhsFtWrd6?cluster=devnet-solana
    ✔ Delete Message Account (812ms)
  3 passing (3s)
```

</AccordionItem>
</Accordion>

</Steps>
