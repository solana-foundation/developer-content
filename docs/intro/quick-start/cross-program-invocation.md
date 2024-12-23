---
sidebarLabel: Cross Program Invocation
title: Cross Program Invocation
sidebarSortOrder: 5
description:
  Learn how to implement Cross Program Invocations (CPIs) in Solana programs
  using the Anchor framework. This tutorial demonstrates how to transfer SOL
  between accounts, interact with the System Program, and handle Program Derived
  Addresses (PDAs) in CPIs. Perfect for developers looking to build composable
  Solana programs.
---

In this section, we'll update the CRUD program from the previous PDA section to
include Cross Program Invocations (CPIs). We'll modify the program to transfer
SOL between accounts in the `update` and `delete` instructions, demonstrating
how to interact with other programs (in this case, the System Program) from
within our program.

The purpose of this section is to walk through the process of implementing CPIs
in a Solana program using the Anchor framework, building upon the PDA concepts
we explored in the previous section. For more details, refer to the
[Cross Program Invocation](/docs/core/cpi) page.

<Steps>

### Modify Update Instruction

First, we'll implement a simple "pay-to-update" mechanism by modifying the
`Update` struct and `update` function.

Begin by updating the `lib.rs` file to bring into scope items from the
`system_program` module.

```rs filename="lib.rs"
use anchor_lang::system_program::{transfer, Transfer};
```

<Accordion>
<AccordionItem title="Diff">

```diff
  use anchor_lang::prelude::*;
+ use anchor_lang::system_program::{transfer, Transfer};
```

</AccordionItem>
</Accordion>

Next, update the `Update` struct to include an additional account called
`vault_account`. This account, controlled by our program, will receive SOL from
a user when they update their message account.

```rs filename="lib.rs"
#[account(
    mut,
    seeds = [b"vault", user.key().as_ref()],
    bump,
)]
pub vault_account: SystemAccount<'info>,
```

<Accordion>
<AccordionItem title="Diff">

```diff
#[derive(Accounts)]
#[instruction(message: String)]
pub struct Update<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

+   #[account(
+       mut,
+       seeds = [b"vault", user.key().as_ref()],
+       bump,
+   )]
+   pub vault_account: SystemAccount<'info>,
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

</AccordionItem>
<AccordionItem title="Explanation">

We're adding a new account called `vault_account` to our `Update` struct. This
account serves as a program-controlled "vault" that will receive SOL from users
when they update their messages.

By using a PDA for the vault, we create a program-controlled account unique to
each user, enabling us to manage user funds within our program's logic.

---

Key aspects of the `vault_account`:

- The address of the account is a PDA derived using seeds
  `[b"vault", user.key().as_ref()]`
- As a PDA, it has no private key, so only our program can "sign" for the
  address when performing CPIs
- As a `SystemAccount` type, it's owned by the System Program like regular
  wallet accounts

This setup allows our program to:

- Generate unique, deterministic addresses for each user's "vault"
- Control funds without needing a private key to sign for transactions.

In the `delete` instruction, we'll demonstrate how our program can "sign" for
this PDA in a CPI.

</AccordionItem>
</Accordion>

Next, implement the CPI logic in the `update` instruction to transfer 0.001 SOL
from the user's account to the vault account.

```rs filename="lib.rs"
let transfer_accounts = Transfer {
    from: ctx.accounts.user.to_account_info(),
    to: ctx.accounts.vault_account.to_account_info(),
};
let cpi_context = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),
    transfer_accounts,
);
transfer(cpi_context, 1_000_000)?;
```

<Accordion>
<AccordionItem title="Diff">

```diff
    pub fn update(ctx: Context<Update>, message: String) -> Result<()> {
        msg!("Update Message: {}", message);
        let account_data = &mut ctx.accounts.message_account;
        account_data.message = message;

+       let transfer_accounts = Transfer {
+           from: ctx.accounts.user.to_account_info(),
+           to: ctx.accounts.vault_account.to_account_info(),
+       };
+       let cpi_context = CpiContext::new(
+           ctx.accounts.system_program.to_account_info(),
+           transfer_accounts,
+       );
+       transfer(cpi_context, 1_000_000)?;
        Ok(())
    }
```

</AccordionItem>
<AccordionItem title="Explanation">

In the `update` instruction, we implement a Cross Program Invocation (CPI) to
invoke the System Program's `transfer` instruction. This demonstrates how to
perform a CPI from within our program, enabling the composability of Solana
programs.

The `Transfer` struct specifies the required accounts for the System Program's
transfer instruction:

- `from` - The user's account (source of funds)
- `to` - The vault account (destination of funds)

  ```rs filename="lib.rs"
  let transfer_accounts = Transfer {
      from: ctx.accounts.user.to_account_info(),
      to: ctx.accounts.vault_account.to_account_info(),
  };
  ```

The `CpiContext` specifies:

- The program to be invoked (System Program)
- The accounts required in the CPI (defined in the `Transfer` struct)

  ```rs filename="lib.rs"
  let cpi_context = CpiContext::new(
      ctx.accounts.system_program.to_account_info(),
      transfer_accounts,
  );
  ```

The `transfer` function then invokes the transfer instruction on the System
Program, passing in the:

- The `cpi_context` (program and accounts)
- The `amount` to transfer (1,000,000 lamports, equivalent to 0.001 SOL)

  ```rs filename="lib.rs"
  transfer(cpi_context, 1_000_000)?;
  ```

---

The setup for a CPI matches how client-side instructions are built, where we
specify the program, accounts, and instruction data for a particular instruction
to invoke. When our program's `update` instruction is invoked, it internally
invokes the System Program's transfer instruction.

</AccordionItem>
</Accordion>

Rebuild the program.

```shell filename="Terminal"
build
```

### Modify Delete Instruction

We'll now implement a "refund on delete" mechanism by modifying the `Delete`
struct and `delete` function.

First, update the `Delete` struct to include the `vault_account`. This allows us
to transfer any SOL in the vault back to the user when they close their message
account.

```rs filename="lib.rs"
#[account(
    mut,
    seeds = [b"vault", user.key().as_ref()],
    bump,
)]
pub vault_account: SystemAccount<'info>,
```

Also add the `system_program` as the CPI for the transfer requires invoking the
System Program.

```rs filename="lib.rs"
pub system_program: Program<'info, System>,
```

<Accordion>
<AccordionItem title="Diff">

```diff
#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

+   #[account(
+       mut,
+       seeds = [b"vault", user.key().as_ref()],
+       bump,
+   )]
+   pub vault_account: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        close= user,
    )]
    pub message_account: Account<'info, MessageAccount>,
+   pub system_program: Program<'info, System>,
}
```

</AccordionItem>
<AccordionItem title="Explanation">

The `vault_account` uses the same PDA derivation as in the Update struct.

Add the `vault_account` to the Delete struct enables our program to access the
user's vault account during the delete instruction to transfer any accumulated
SOL back to the user.

</AccordionItem>
</Accordion>

Next, implement the CPI logic in the `delete` instruction to transfer SOL from
the vault account back to the user's account.

```rs filename="lib.rs"
let user_key = ctx.accounts.user.key();
let signer_seeds: &[&[&[u8]]] =
    &[&[b"vault", user_key.as_ref(), &[ctx.bumps.vault_account]]];

let transfer_accounts = Transfer {
    from: ctx.accounts.vault_account.to_account_info(),
    to: ctx.accounts.user.to_account_info(),
};
let cpi_context = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),
    transfer_accounts,
).with_signer(signer_seeds);
transfer(cpi_context, ctx.accounts.vault_account.lamports())?;
```

Note that we updated `_ctx: Context<Delete>` to `ctx: Context<Delete>` as we'll
be using the context in the body of the function.

<Accordion>
<AccordionItem title="Diff">

```diff
-    pub fn delete(_ctx: Context<Delete>) -> Result<()> {
+    pub fn delete(ctx: Context<Delete>) -> Result<()> {
         msg!("Delete Message");

+        let user_key = ctx.accounts.user.key();
+        let signer_seeds: &[&[&[u8]]] =
+            &[&[b"vault", user_key.as_ref(), &[ctx.bumps.vault_account]]];
+
+        let transfer_accounts = Transfer {
+            from: ctx.accounts.vault_account.to_account_info(),
+            to: ctx.accounts.user.to_account_info(),
+        };
+        let cpi_context = CpiContext::new(
+            ctx.accounts.system_program.to_account_info(),
+            transfer_accounts,
+        ).with_signer(signer_seeds);
+        transfer(cpi_context, ctx.accounts.vault_account.lamports())?;
         Ok(())
     }

```

</AccordionItem>
<AccordionItem title="Explanation">

In the delete instruction, we implement another Cross Program Invocation (CPI)
to invoke the System Program's transfer instruction. This CPI demonstrates how
to make a transfer that requires a Program Derived Address (PDA) signer.

First, we define the signer seeds for the vault PDA:

```rs filename="lib.rs"
let user_key = ctx.accounts.user.key();
let signer_seeds: &[&[&[u8]]] =
    &[&[b"vault", user_key.as_ref(), &[ctx.bumps.vault_account]]];
```

The `Transfer` struct specifies the required accounts for the System Program's
transfer instruction:

- from: The vault account (source of funds)
- to: The user's account (destination of funds)

  ```rs filename="lib.rs"
  let transfer_accounts = Transfer {
      from: ctx.accounts.vault_account.to_account_info(),
      to: ctx.accounts.user.to_account_info(),
  };
  ```

The `CpiContext` specifies:

- The program to be invoked (System Program)
- The accounts involved in the transfer (defined in the Transfer struct)
- The signer seeds for the PDA

  ```rs filename="lib.rs"
  let cpi_context = CpiContext::new(
      ctx.accounts.system_program.to_account_info(),
      transfer_accounts,
  ).with_signer(signer_seeds);
  ```

The transfer function then invokes the transfer instruction on the System
Program, passing:

- The `cpi_context` (program, accounts, and PDA signer)
- The amount to transfer (the entire balance of the vault account)

  ```rs filename="lib.rs"
  transfer(cpi_context, ctx.accounts.vault_account.lamports())?;
  ```

This CPI implementation demonstrates how programs can utilize PDAs to manage
funds. When our program's delete instruction is invoked, it internally calls the
System Program's transfer instruction, signing for the PDA to authorize the
transfer of all funds from the vault back to the user.

</AccordionItem>
</Accordion>

Rebuild the program.

```shell filename="Terminal"
build
```

### Redeploy Program

After making these changes, we need to redeploy our updated program. This
ensures that our modified program is available for testing. On Solana, updating
a program simply requires deploying the compiled program at the same program ID.

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
<AccordionItem title="Explanation">

Only the upgrade authority of the program can update it. The upgrade authority
is set when the program is deployed, and it's the only account with permission
to modify or close the program. If the upgrade authority is revoked, then the
program becomes immutable and can never be closed or upgraded.

When deploying programs on Solana Playground, your Playground wallet is the
upgrade authority for all your programs.

</AccordionItem>
</Accordion>

### Update Test File

Next, we'll update our `anchor.test.ts` file to include the new vault account in
our instructions. This requires deriving the vault PDA and including it in our
update and delete instruction calls.

#### Derive Vault PDA

First, add the vault PDA derivation:

```ts filename="anchor.test.ts"
const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), wallet.publicKey.toBuffer()],
  program.programId,
);
```

<Accordion>
<AccordionItem title="Diff">

```diff
describe("pda", () => {
  const program = pg.program;
  const wallet = pg.wallet;

  const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("message"), wallet.publicKey.toBuffer()],
    program.programId
  );

+  const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
+    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
+    program.programId
+  );

  // ...tests
  });
```

</AccordionItem>
</Accordion>

#### Modify Update Test

Then, update the update instruction to include the `vaultAccount`.

```ts filename="anchor.test.ts"  {5}
const transactionSignature = await program.methods
  .update(message)
  .accounts({
    messageAccount: messagePda,
    vaultAccount: vaultPda,
  })
  .rpc({ commitment: "confirmed" });
```

<Accordion>
<AccordionItem title="Diff">

```diff
    const transactionSignature = await program.methods
      .update(message)
      .accounts({
        messageAccount: messagePda,
+       vaultAccount: vaultPda,
      })
      .rpc({ commitment: "confirmed" });
```

</AccordionItem>
</Accordion>

#### Modify Delete Test

Then, update the delete instruction to include the `vaultAccount`.

```ts filename="anchor.test.ts"  {5}
const transactionSignature = await program.methods
  .delete()
  .accounts({
    messageAccount: messagePda,
    vaultAccount: vaultPda,
  })
  .rpc({ commitment: "confirmed" });
```

<Accordion>
<AccordionItem title="Diff">

```diff
    const transactionSignature = await program.methods
      .delete()
      .accounts({
        messageAccount: messagePda,
+       vaultAccount: vaultPda,
      })
      .rpc({ commitment: "confirmed" });
```

</AccordionItem>
</Accordion>

### Rerun Test

After making these changes, run the tests to ensure everything is working as
expected:

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
    Transaction Signature: https://solana.fm/tx/qGsYb87mUUjeyh7Ha7r9VXkACw32HxVBujo2NUxqHiUc8qxRMFB7kdH2D4JyYtPBx171ddS91VyVrFXypgYaKUr?cluster=devnet-solana
    ✔ Create Message Account (842ms)
    {
  "user": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "message": "Hello, Solana!",
  "bump": 254
}
    Transaction Signature: https://solana.fm/tx/3KCDnNSfDDfmSy8kpiSrJsGGkzgxx2mt18KejuV2vmJjeyenkSoEfs2ghUQ6cMoYYgd9Qax9CbnYRcvF2zzumNt8?cluster=devnet-solana
    ✔ Update Message Account (946ms)
    Expect Null: null
    Transaction Signature: https://solana.fm/tx/3M7Z7Mea3TtQc6m9z386B9QuEgvLKxD999mt2RyVtJ26FgaAzV1QA5mxox3eXie3bpBkNpDQ4mEANr3trVHCWMC2?cluster=devnet-solana
    ✔ Delete Message Account (859ms)
  3 passing (3s)
```

</AccordionItem>
</Accordion>

You can then inspect the SolanFM links to view the transaction details, where
you'll find the CPIs for the transfer instructions within the update and delete
instructions.

![Update CPI](/assets/docs/intro/quickstart/cpi-update.png)

![Delete CPI](/assets/docs/intro/quickstart/cpi-delete.png)

If you encounter any errors, you can reference the
[final code](https://beta.solpg.io/668304cfcffcf4b13384d20a).

</Steps>

## Next Steps

You've completed the Solana Quickstart guide! You've learned about accounts,
transactions, PDAs, CPIs, and deployed your own programs.

Visit the [Core Concepts](/docs/core/accounts) pages for more comprehensive
explanations of the topics covered in this guide.

Additional learning resources can be found on the
[Developer Resources](/developers) page.

### Explore More Examples

If you prefer learning by example, check out the
[Program Examples Repository](https://github.com/solana-developers/program-examples)
for a variety of example programs.

Solana Playground offers a convenient feature allowing you to import or view
projects using their GitHub links. For example, open this
[Solana Playground link](https://beta.solpg.io/https://github.com/solana-developers/program-examples/tree/main/basics/hello-solana/anchor)
to view the Anchor project from this
[Github repo](https://github.com/solana-developers/program-examples/tree/main/basics/hello-solana/anchor).

Click the `Import` button and enter a project name to add it to your list of
projects in Solana Playground. Once a project is imported, all changes are
automatically saved and persisted within the Playground environment.
