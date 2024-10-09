---
date: 2024-03-18T00:00:00Z
difficulty: intro
title: "How to create a CRUD dApp on Solana"
description:
  "Solana developer quickstart guide to learn how to create a basic CRUD dApp on
  the Solana blockchain with a simple journal program and interact with the
  program via a UI."
tags:
  - quickstart
  - dApp
  - crud
  - anchor
  - rust
  - react
  - program
keywords:
  - solana dapp
  - on-chain
  - rust
  - anchor program
  - crud dapp
  - create dapp
  - create solana dapp
  - tutorial
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - web3 crud app
---

In this guide, you will learn how to create and deploy both the Solana program
and UI for a basic on-chain CRUD dApp. This dApp will allow you to create
journal entries, update journal entries, read journal entries, and delete
journal entries all through on-chain transactions.

## What you will learn

- Setting up your environment
- Using `npx create-solana-dapp`
- Anchor program development
- Anchor PDAs and accounts
- Deploying a Solana program
- Testing an on-chain program
- Connecting an on-chain program to a React UI

## Prerequisites

For this guide, you will need to have your local development environment setup
with a few tools:

- [Rust](https://www.rust-lang.org/tools/install)
- [Node JS](https://nodejs.org/en/download)
- [Solana CLI & Anchor](https://solana.com/docs/intro/installation)

## Setting up the project

```shell
npx create-solana-dapp
```

This CLI command enables quick Solana dApp creation. You can find the source
code [here](https://github.com/solana-developers/create-solana-dapp).

Now respond to the prompts as follows:

- Enter project name: `my-journal-dapp`
- Select a preset: `Next.js`
- Select a UI library: `Tailwind`
- Select an Anchor template: `counter` program

By selecting `counter` for the Anchor template, a simple counter
[program](/docs/terminology.md#program), written in rust using the Anchor
framework, will be generated for you. Before we start editing this generated
template program, let's make sure everything is working as expected:

```shell
cd my-journal-dapp

npm install

npm run dev
```

## Writing a Solana program with Anchor

If you're new to Anchor,
[The Anchor Book](https://book.anchor-lang.com/introduction/introduction.html)
and [Anchor Examples](https://examples.anchor-lang.com/) are great references to
help you learn.

In `my-journal-dapp`, navigate to `anchor/programs/journal/src/lib.rs`. There
will already be template code generated in this folder. Let's delete it and
start from scratch so we can walk through each step.

### Define your Anchor program

```rust
use anchor_lang::prelude::*;

// This is your program's public key and it will update automatically when you build the project.
declare_id!("7AGmMcgd1SjoMsCcXAAYwRgB9ihCyM8cZqjsUqriNRQt");

#[program]
pub mod journal {
    use super::*;
}
```

### Define your program state

The state is the data structure used to define the information you want to save
to the account. Since Solana onchain programs do not have storage, the data is
stored in accounts that live on the blockchain.

When using Anchor, the `#[account]` attribute macro is used to define your
program state.

```rust
#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
    pub owner: Pubkey,
    #[max_len(50)]
    pub title: String,
     #[max_len(1000)]
    pub message: String,
}
```

For this journal dApp, we will be storing:

- the journal's owner
- the title of each journal entry, and
- the message of each journal entry

Note: Space must be defined when initializing an account. The `InitSpace` macro
used in the above code will help calculate the space needed when initializing an
account. For more information on space, read
[here](https://www.anchor-lang.com/docs/space#the-init-space-macro).

### Create a journal entry

Now, let's add an
[instruction handler](/docs/terminology.md#instruction-handler) to this program
that creates a new journal entry. To do this, we will update the `#[program]`
code that we already defined earlier to include an instruction for
`create_journal_entry`.

When creating a journal entry, the user will need to provide the `title` and
`message` of the journal entry. So we need to add those two variables as
additional arguments.

When calling this instruction handler function, we want to save the `owner` of
the account, the journal entry `title`, and the journal entry `message` to the
account's `JournalEntryState`.

```rust
#[program]
mod journal {
    use super::*;

    pub fn create_journal_entry(
        ctx: Context<CreateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        msg!("Journal Entry Created");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.owner = ctx.accounts.owner.key();
        journal_entry.title = title;
        journal_entry.message = message;
        Ok(())
    }
}
```

With the Anchor framework, every instruction takes a `Context` type as its first
argument. The `Context` macro is used to define a struct that encapsulates
accounts that will be passed to a given instruction handler. Therefore, each
`Context` must have a specified type with respect to the instruction handler. In
our case, we need to define a data structure for `CreateEntry`:

```rust
#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct CreateEntry<'info> {
    #[account(
        init_if_needed,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        payer = owner,
        space = 8 + JournalEntryState::INIT_SPACE
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

In the above code, we used the following macros:

- `#[derive(Accounts)]` macro is used to deserialize and validate the list of
  accounts specified within the struct
- `#[instruction(...)]` attribute macro is used to access the instruction data
  passed into the instruction handler
- `#[account(...)]` attribute macro then specifies additional constraints on the
  accounts

Each journal entry is a Program Derived Address ( [PDA](/docs/core/pda.md)) that
stores the entries state on-chain. Since we are creating a new journal entry
here, it needs to be initialized using the `init_if_needed` constraint.

With Anchor, a PDA is initialized with the `seeds`, `bumps`, and
`init_if_needed` constraints. The `init_if_needed` constraint also requires the
`payer` and `space` constraints to define who is paying the
[rent](/docs/terminology.md#rent) to hold this account's data on-chain and how
much space needs to be allocated for that data.

Note: By using the `InitSpace` macro in the `JournalEntryState`, we are able to
calculate space by using the `INIT_SPACE` constant and adding `8` to the space
constraint for Anchor's internal discriminator.

### Updating a journal entry

Now that we can create a new journal entry, let's add an `update_journal_entry`
instruction handler with a context that has an `UpdateEntry` type.

To do this, the instruction will need to rewrite/update the data for a specific
PDA that was saved to the `JournalEntryState` of the account when the owner of
the journal entry calls the `update_journal_entry` instruction.

```rust
#[program]
mod journal {
    use super::*;

    ...

    pub fn update_journal_entry(
        ctx: Context<UpdateEntry>,
        title: String,
        message: String,
    ) -> Result<()> {
        msg!("Journal Entry Updated");
        msg!("Title: {}", title);
        msg!("Message: {}", message);

        let journal_entry = &mut ctx.accounts.journal_entry;
        journal_entry.message = message;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String, message: String)]
pub struct UpdateEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        realloc = 8 + 32 + 1 + 4 + title.len() + 4 + message.len(),
        realloc::payer = owner,
        realloc::zero = true,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

In the above code, you should notice that it is very similar to creating a
journal entry but there are a couple key differences. Since
`update_journal_entry` is editing an already existing PDA, we do not need to
initialize it. However, the message being passed to the instruction handler
could have a different space size required to store it (i.e. the `message` could
be shorter or longer), so we will need to use a few specific `realloc`
constraints to reallocate the space for the account on-chain:

- `realloc` - sets the new space required
- `realloc::payer` - defines the account that will either pay or be refunded
  based on the newly required lamports
- `realloc::zero` - defines that the account may be updated multiple times when
  set to `true`

The `seeds` and `bump` constraints are still needed to be able to find the
specific PDA we want to update.

The `mut` constraints allows us to mutate/change the data within the account.
Because how the Solana blockchain handles reading from accounts and writing to
accounts differently, we must explicitly define which accounts will be mutable
so the Solana runtime can correctly process them.

Note: In Solana, when you perform a reallocation, which changes the account's
size, the transaction must cover the rent for the new account size. The
realloc::payer = owner attribute indicates that the owner account will pay for
the rent. For an account to be able to cover the rent, it typically needs to be
a signer (to authorize the deduction of funds), and in Anchor, it also needs to
be mutable so that the runtime can deduct the lamports to cover the rent from
the account.

### Delete a journal entry

Lastly, we will add a `delete_journal_entry` instruction handler with a context
that has a `DeleteEntry` type.

To do this, we will simply need to close the account for the specified journal
entry.

```rust
#[program]
mod journal {
    use super::*;

    ...

    pub fn delete_journal_entry(_ctx: Context<DeleteEntry>, title: String) -> Result<()> {
        msg!("Journal entry titled {} deleted", title);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteEntry<'info> {
    #[account(
        mut,
        seeds = [title.as_bytes(), owner.key().as_ref()],
        bump,
        close = owner,
    )]
    pub journal_entry: Account<'info, JournalEntryState>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

In the above code, we use the `close` constraint to close out the account
on-chain and refund the rent back to the journal entry's owner.

The `seeds` and `bump` constraints are needed to validate the account.

### Build and deploy your Anchor program

```shell
npm run anchor build
npm run anchor deploy
```

## Connecting a Solana program to a UI

`create-solana-dapp` already sets up a UI with a wallet connector for you. All
we need to do is simply modify if to fit your newly created program.

Since this journal program has the three instructions, we will need components
in the UI that will be able to call each of these instructions:

- create entry
- update entry
- delete entry

Within your project's repo, open the
`web/components/journal/journal-data-access.tsx` to add code to be able to call
each of our instructions.

Update the `useJournalProgram` function to be able to create an entry:

```typescript
const createEntry = useMutation<string, Error, CreateEntryArgs>({
  mutationKey: ["journalEntry", "create", { cluster }],
  mutationFn: async ({ title, message, owner }) => {
    const [journalEntryAddress] = await PublicKey.findProgramAddress(
      [Buffer.from(title), owner.toBuffer()],
      programId,
    );

    return program.methods
      .createJournalEntry(title, message)
      .accounts({
        journalEntry: journalEntryAddress,
      })
      .rpc();
  },
  onSuccess: signature => {
    transactionToast(signature);
    accounts.refetch();
  },
  onError: error => {
    toast.error(`Failed to create journal entry: ${error.message}`);
  },
});
```

Then update the `useJournalProgramAccount` function to be able to update and
delete entries:

```typescript
const updateEntry = useMutation<string, Error, CreateEntryArgs>({
  mutationKey: ["journalEntry", "update", { cluster }],
  mutationFn: async ({ title, message, owner }) => {
    const [journalEntryAddress] = await PublicKey.findProgramAddress(
      [Buffer.from(title), owner.toBuffer()],
      programId,
    );

    return program.methods
      .updateJournalEntry(title, message)
      .accounts({
        journalEntry: journalEntryAddress,
      })
      .rpc();
  },
  onSuccess: signature => {
    transactionToast(signature);
    accounts.refetch();
  },
  onError: error => {
    toast.error(`Failed to update journal entry: ${error.message}`);
  },
});

const deleteEntry = useMutation({
  mutationKey: ["journal", "deleteEntry", { cluster, account }],
  mutationFn: (title: string) =>
    program.methods
      .deleteJournalEntry(title)
      .accounts({ journalEntry: account })
      .rpc(),
  onSuccess: tx => {
    transactionToast(tx);
    return accounts.refetch();
  },
});
```

Next, update the UI in `web/components/journal/journal-ui.tsx` to take in user
input values for the `title` and `message` of when creating a journal entry:

```tsx
export function JournalCreate() {
  const { createEntry } = useJournalProgram();
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const isFormValid = title.trim() !== "" && message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="input input-bordered w-full max-w-xs"
      />
      <textarea
        placeholder="Message"
        value={message}
        onChange={e => setMessage(e.target.value)}
        className="textarea textarea-bordered w-full max-w-xs"
      />
      <br></br>
      <button
        type="button"
        className="btn btn-xs lg:btn-md btn-primary"
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
      >
        Create Journal Entry {createEntry.isPending && "..."}
      </button>
    </div>
  );
}
```

Lastly, update the UI in `journal-ui.tsx` to take in a user input values for the
`message` of when updating a journal entry:

```tsx
function JournalCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useJournalProgramAccount({
    account,
  });
  const { publicKey } = useWallet();
  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== "";

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return <p>Connect your wallet</p>;
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2
            className="card-title justify-center text-3xl cursor-pointer"
            onClick={() => accountQuery.refetch()}
          >
            {accountQuery.data?.title}
          </h2>
          <p>{accountQuery.data?.message}</p>
          <div className="card-actions justify-around">
            <textarea
              placeholder="Update message here"
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="textarea textarea-bordered w-full max-w-xs"
            />
            <button
              className="btn btn-xs lg:btn-md btn-primary"
              onClick={handleSubmit}
              disabled={updateEntry.isPending || !isFormValid}
            >
              Update Journal Entry {updateEntry.isPending && "..."}
            </button>
          </div>
          <div className="text-center space-y-4">
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
            <button
              className="btn btn-xs btn-secondary btn-outline"
              onClick={() => {
                if (
                  !window.confirm(
                    "Are you sure you want to close this account?",
                  )
                ) {
                  return;
                }
                const title = accountQuery.data?.title;
                if (title) {
                  return deleteEntry.mutateAsync(title);
                }
              }}
              disabled={deleteEntry.isPending}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Resources

- Journal dApp:
  [solana-journal-eight.vercel.app](https://solana-journal-eight.vercel.app)
- Example code:
  [https://github.com/solana-foundation/CRUD-dApp](https://github.com/solana-foundation/CRUD-dApp)
