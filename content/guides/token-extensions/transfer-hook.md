---
date: Jan 08, 2023
seoTitle: "Token Extensions: Transfer Hook"
title: How to use the Transfer Hook extension
description: "The Transfer Hook extension and Transfer Hook Interface introduce the ability to
create Mint Accounts that execute custom instruction logic on every token
transfer."
keywords:
  - token 2022
  - token extensions
  - token program
difficulty: intermediate
tags:
  - token 2022
  - token extensions
---

The Transfer Hook extension and Transfer Hook Interface introduce the ability to
create Mint Accounts that execute custom instruction logic on every token
transfer.

To achieve this, developers must build a program that implements the
[Transfer Hook Interface](https://github.com/solana-labs/solana-program-library/tree/master/token/transfer-hook/interface)
and initialize a Mint Account with the Transfer Hook extension enabled.

For every token transfer involving tokens from the Mint Account, the Token
Extensions program makes a Cross Program Invocation (CPI) to execute an
instruction on the Transfer Hook program.

<Callout type="info">

When the Token Extensions program CPIs to a Transfer Hook program, all accounts
from the initial transfer are converted to read-only accounts. This means the
signer privileges of the sender do not extend to the Transfer Hook program.

This design decision is made to prevent malicious use of Transfer Hook programs.

</Callout>

In this guide, we will create a Transfer Hook program using the Anchor
framework. This program will require the sender to pay a fee in wrapped SOL
(wSOL) on every token transfer. Here is the
[final program](https://beta.solpg.io/https://github.com/solana-developers/anchor-transfer-hook/tree/main).

## Transfer Hook Interface Overview

The Transfer Hook Interface provides a way for developers to implement custom
instruction logic that is executed on every token transfer for a specific Mint
Account.

The Transfer Hook Interface specifies the following
[instructions](https://github.com/solana-labs/solana-program-library/blob/master/token/transfer-hook/interface/src/instruction.rs):

- `Execute`: An instruction that the Token Extension program invokes on every
  token transfer.
- `InitializeExtraAccountMetaList` (optional): Creates an account that stores a
  list of additional accounts required by the custom `Execute` instruction.
- `UpdateExtraAccountMetaList` (optional): Updates the list of additional
  accounts by overwriting the existing list.

It is technically not required to implement the `InitializeExtraAccountMetaList`
instruction using the interface. The account can be created by any instruction
on a Transfer Hook program.

However, the Program Derived Address (PDA) for the account must be derived using
the following seeds:

- The hard coded string "extra-account-metas"
- The Mint Account address
- The Transfer Hook program ID

```js
const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
  program.programId, // transfer hook program ID
);
```

By storing the extra accounts required by the `Execute` instruction in the
predefined PDA, these accounts can be automatically added to a token transfer
instruction from the client.

## Program Overview

In this guide, we will build a Transfer Hook program using the Anchor framework.
This program will require the sender to pay a wSOL fee for every token transfer.

The wSOL transfers will be executed using a delegate that is a PDA derived from
the Transfer Hook program. This is necessary because the signature from the
initial sender of the token transfer instruction is not accessible in the
Transfer Hook program.

This program will only include 3 instructions:

1. `initialize_extra_account_meta_list`: Creates an account that stores a list
   of extra accounts required by the `transfer_hook` instruction.
2. `transfer_hook`: This instruction is invoked via CPI on every token transfer
   to perform a wrapped SOL token transfer.
3. `fallback`: The transfer hook interface instructions have specific
   discriminators (instruction identifiers). In an Anchor program, we can use a
   fallback instruction to manually match the instruction discriminator and
   invoke our custom `transfer_hook` instruction.

## Getting Started

Start by opening this Solana Playground
[link](https://beta.solpg.io/https://github.com/solana-developers/anchor-transfer-hook/tree/starter)
and then click the "Import" button to copy the project.

The starter code includes a `lib.rs` and `transfer-hook.test.ts` file which are
scaffolded for the program we will be creating. In the `lib.rs` file you should
see the following code:

```rust
use anchor_lang::{
    prelude::*,
    system_program::{create_account, CreateAccount},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};
use spl_tlv_account_resolution::{
    account::ExtraAccountMeta, seeds::Seed, state::ExtraAccountMetaList,
};
use spl_transfer_hook_interface::instruction::{ExecuteInstruction, TransferHookInstruction};

declare_id!("E6wu6Nykdra8gXs57Zqo7hY6DLaWugTmD3uuuBmX2Vxt");

#[program]
pub mod transfer_hook {
    use super::*;

    pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        Ok(())
    }

    pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
        Ok(())
    }

    pub fn fallback<'info>(
        program_id: &Pubkey,
        accounts: &'info [AccountInfo<'info>],
        data: &[u8],
    ) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList {}

#[derive(Accounts)]
pub struct TransferHook {}
```

Once you've imported the project, build the program by using the `build` command
in the Playground terminal.

```
build
```

This will update the value of `declare_id` in the `lib.rs` file with a newly
generated program ID.

## Initialize ExtraAccountMetas Account Instruction

In this step, we will implement the `initialize_extra_account_meta_list`
instruction for our Transfer Hook program. This instruction creates an
ExtraAccountMetas account, which will store the additional accounts required by
our `transfer_hook` instruction.

In this example, the `initialize_extra_account_meta_list` instruction requires 7
accounts:

- `payer`: The account used to pay for the creation of the ExtraAccountMetas
  account.
- `extra_account_meta_list`: The ExtraAccountMetas account created to store the
  list of accounts required by our `transfer_hook` instruction.
- `mint`: The Mint Account that points to this Transfer Hook program. The mint
  address is a required seed for deriving the `extra_account_meta_list` PDA.
- `wsol_mint`: The wrapped SOL mint.
- `token_program`: The original Token program ID
- `associated_token_program`: The Associated Token program ID.
- `system_program`: The system program, which is a required account when
  creating new accounts.

The addresses for `wsol_mint`, `wsol_mint`, and `associated_token_program` will
be used to derive the addresses for the wSOL Associated Token Accounts. These
accounts are required by the `transfer_hook` instruction and will be stored on
the ExtraAccountMetas account.

Update the `InitializeExtraAccountMetaList` struct by replacing the following
starter code:

```rust
#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList {}
```

With the code provided below:

```rust
#[derive(Accounts)]
pub struct InitializeExtraAccountMetaList<'info> {
    #[account(mut)]
    payer: Signer<'info>,

    /// CHECK: ExtraAccountMetaList Account, must use these seeds
    #[account(
        mut,
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    pub extra_account_meta_list: AccountInfo<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    pub wsol_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
```

Next, update the `initialize_extra_account_meta_list`instruction by replacing
the following starter code:

```rust
pub fn initialize_extra_account_meta_list(
    ctx: Context<InitializeExtraAccountMetaList>,
) -> Result<()> {
    Ok(())
}
```

With the code below:

```rust
pub fn initialize_extra_account_meta_list(
        ctx: Context<InitializeExtraAccountMetaList>,
    ) -> Result<()> {
        // index 0-3 are the accounts required for token transfer (source, mint, destination, owner)
        // index 4 is address of ExtraAccountMetaList account
        // The `addExtraAccountsToInstruction` JS helper function resolving incorrectly
        let account_metas = vec![
            // index 5, wrapped SOL mint
            ExtraAccountMeta::new_with_pubkey(&ctx.accounts.wsol_mint.key(), false, false)?,
            // index 6, token program
            ExtraAccountMeta::new_with_pubkey(&ctx.accounts.token_program.key(), false, false)?,
            // index 7, associated token program
            ExtraAccountMeta::new_with_pubkey(
                &ctx.accounts.associated_token_program.key(),
                false,
                false,
            )?,
            // index 8, delegate PDA
            ExtraAccountMeta::new_with_seeds(
                &[Seed::Literal {
                    bytes: "delegate".as_bytes().to_vec(),
                }],
                false, // is_signer
                false,  // is_writable
            )?,
            // index 9, delegate wrapped SOL token account
            ExtraAccountMeta::new_external_pda_with_seeds(
                7, // associated token program index
                &[
                    Seed::AccountKey { index: 8 }, // owner index (delegate PDA)
                    Seed::AccountKey { index: 6 }, // token program index
                    Seed::AccountKey { index: 5 }, // wsol mint index
                ],
                false, // is_signer
                true,  // is_writable
            )?,
            // index 10, sender wrapped SOL token account
            ExtraAccountMeta::new_external_pda_with_seeds(
                7, // associated token program index
                &[
                    Seed::AccountKey { index: 3 }, // owner index
                    Seed::AccountKey { index: 6 }, // token program index
                    Seed::AccountKey { index: 5 }, // wsol mint index
                ],
                false, // is_signer
                true,  // is_writable
            )?,
        ];

        // calculate account size
        let account_size = ExtraAccountMetaList::size_of(account_metas.len())? as u64;
        // calculate minimum required lamports
        let lamports = Rent::get()?.minimum_balance(account_size as usize);

        let mint = ctx.accounts.mint.key();
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"extra-account-metas",
            &mint.as_ref(),
            &[ctx.bumps.extra_account_meta_list],
        ]];

        // create ExtraAccountMetaList account
        create_account(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                CreateAccount {
                    from: ctx.accounts.payer.to_account_info(),
                    to: ctx.accounts.extra_account_meta_list.to_account_info(),
                },
            )
            .with_signer(signer_seeds),
            lamports,
            account_size,
            ctx.program_id,
        )?;

        // initialize ExtraAccountMetaList account with extra accounts
        ExtraAccountMetaList::init::<ExecuteInstruction>(
            &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
            &account_metas,
        )?;

        Ok(())
    }
```

Let's walk through the updated instruction logic. We begin by listing the
additional accounts that need to be stored on the ExtraAccountMetas account.

```rust
// index 0-3 are the accounts required for token transfer (source, mint, destination, owner)
// index 4 is address of ExtraAccountMetaList account
// The `addExtraAccountsToInstruction` JS helper function resolving incorrectly
let account_metas = vec![
    // index 5, wrapped SOL mint
    ExtraAccountMeta::new_with_pubkey(&ctx.accounts.wsol_mint.key(), false, false)?,
    // index 6, token program
    ExtraAccountMeta::new_with_pubkey(&ctx.accounts.token_program.key(), false, false)?,
    // index 7, associated token program
    ExtraAccountMeta::new_with_pubkey(
        &ctx.accounts.associated_token_program.key(),
        false,
        false,
    )?,
    // index 8, delegate PDA
    ExtraAccountMeta::new_with_seeds(
        &[Seed::Literal {
            bytes: "delegate".as_bytes().to_vec(),
        }],
        false, // is_signer
        true,  // is_writable
    )?,
    // index 9, delegate wrapped SOL token account
    ExtraAccountMeta::new_external_pda_with_seeds(
        7, // associated token program index
        &[
            Seed::AccountKey { index: 8 }, // owner index (delegate PDA)
            Seed::AccountKey { index: 6 }, // token program index
            Seed::AccountKey { index: 5 }, // wsol mint index
        ],
        false, // is_signer
        true,  // is_writable
    )?,
    // index 10, sender wrapped SOL token account
    ExtraAccountMeta::new_external_pda_with_seeds(
        7, // associated token program index
        &[
            Seed::AccountKey { index: 3 }, // owner index
            Seed::AccountKey { index: 6 }, // token program index
            Seed::AccountKey { index: 5 }, // wsol mint index
        ],
        false, // is_signer
        true,  // is_writable
    )?,
];
```

There are three methods for storing these accounts:

1. Directly store the account address:
   - Wrapped SOL mint address
   - Token Program ID
   - Associated Token Program ID

```rust
// index 5, wrapped SOL mint
ExtraAccountMeta::new_with_pubkey(&ctx.accounts.wsol_mint.key(), false, false)?,
// index 6, token program
ExtraAccountMeta::new_with_pubkey(&ctx.accounts.token_program.key(), false, false)?,
// index 7, associated token program
ExtraAccountMeta::new_with_pubkey(
    &ctx.accounts.associated_token_program.key(),
    false,
    false,
)?,

```

2. Store the seeds to derive a PDA for the Transfer Hook program:
   - Delegate PDA

```rust
// index 8, delegate PDA
ExtraAccountMeta::new_with_seeds(
    &[Seed::Literal {
        bytes: "delegate".as_bytes().to_vec(),
    }],
    false, // is_signer
    false,  // is_writable
)?,

```

3. Store the seeds to derive a PDA for a program other than the Transfer Hook
   program:
   - Delegate wSOL Associated Token Account
   - Sender wSOL Associated Token Account

```rust
// index 9, delegate wrapped SOL token account
ExtraAccountMeta::new_external_pda_with_seeds(
    7, // associated token program index
    &[
        Seed::AccountKey { index: 8 }, // owner index (delegate PDA)
        Seed::AccountKey { index: 6 }, // token program index
        Seed::AccountKey { index: 5 }, // wsol mint index
    ],
    false, // is_signer
    true,  // is_writable
)?,
// index 10, sender wrapped SOL token account
ExtraAccountMeta::new_external_pda_with_seeds(
    7, // associated token program index
    &[
        Seed::AccountKey { index: 3 }, // owner index
        Seed::AccountKey { index: 6 }, // token program index
        Seed::AccountKey { index: 5 }, // wsol mint index
    ],
    false, // is_signer
    true,  // is_writable
)?,
```

Next, we calculate the size and rent required to store the list of
ExtraAccountMetas.

```rust
// calculate account size
let account_size = ExtraAccountMetaList::size_of(account_metas.len())? as u64;
// calculate minimum required lamports
let lamports = Rent::get()?.minimum_balance(account_size as usize);
```

Next, we make a CPI to the System Program to create an account and set the
Transfer Hook Program as the owner. The PDA seeds are included as signer seeds
on the CPI because we are using the PDA as the address of the new account.

```rust
let mint = ctx.accounts.mint.key();
let signer_seeds: &[&[&[u8]]] = &[&[
    b"extra-account-metas",
    &mint.as_ref(),
    &[ctx.bumps.extra_account_meta_list],
]];

// create ExtraAccountMetaList account
create_account(
    CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        CreateAccount {
            from: ctx.accounts.payer.to_account_info(),
            to: ctx.accounts.extra_account_meta_list.to_account_info(),
        },
    )
    .with_signer(signer_seeds),
    lamports,
    account_size,
    ctx.program_id,
)?;
```

Once we’ve created the account, we initialize the account data to store the list
of ExtraAccountMetas.

```rust
// initialize ExtraAccountMetaList account with extra accounts
ExtraAccountMetaList::init::<ExecuteInstruction>(
    &mut ctx.accounts.extra_account_meta_list.try_borrow_mut_data()?,
    &account_metas,
)?;
```

<Callout type="info">

In this example, we are not using the Transfer Hook interface to create the
ExtraAccountMetas account.

</Callout>

## Custom Transfer Hook Instruction

Next, let’s implement the custom `transfer_hook` instruction. This is the
instruction the Token Extension program will invoke on every token transfer.

In this example, we will require a fee paid in wSOL for every token transfer.
For simplicity, the fee amount equals the token transfer amount.

Update the `TransferHook` struct by replacing the following starter code:

```rust
#[derive(Accounts)]
pub struct TransferHook {}
```

With the updated code below:

<Callout type="info">

Note that the order of accounts in this struct matters. This is the order in
which the Token Extensions program provides these accounts when it CPIs to this
Transfer Hook program.

</Callout>

```rust
// Order of accounts matters for this struct.
// The first 4 accounts are the accounts required for token transfer (source, mint, destination, owner)
// Remaining accounts are the extra accounts required from the ExtraAccountMetaList account
// These accounts are provided via CPI to this program from the token2022 program
#[derive(Accounts)]
pub struct TransferHook<'info> {
    #[account(
        token::mint = mint,
        token::authority = owner,
    )]
    pub source_token: InterfaceAccount<'info, TokenAccount>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        token::mint = mint,
    )]
    pub destination_token: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: source token account owner, can be SystemAccount or PDA owned by another program
    pub owner: UncheckedAccount<'info>,
    /// CHECK: ExtraAccountMetaList Account,
    #[account(
        seeds = [b"extra-account-metas", mint.key().as_ref()],
        bump
    )]
    pub extra_account_meta_list: UncheckedAccount<'info>,
    pub wsol_mint: InterfaceAccount<'info, Mint>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(
        seeds = [b"delegate"],
        bump
    )]
    pub delegate: SystemAccount<'info>,
    #[account(
        mut,
        token::mint = wsol_mint,
        token::authority = delegate,
    )]
    pub delegate_wsol_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = wsol_mint,
        token::authority = owner,
    )]
    pub sender_wsol_token_account: InterfaceAccount<'info, TokenAccount>,
}
```

The first 4 accounts are the accounts required by the initial token transfer.

```rust
#[account(
    token::mint = mint,
    token::authority = owner,
)]
pub source_token: InterfaceAccount<'info, TokenAccount>,
pub mint: InterfaceAccount<'info, Mint>,
#[account(
    token::mint = mint,
)]
pub destination_token: InterfaceAccount<'info, TokenAccount>,
/// CHECK: source token account owner, can be SystemAccount or PDA owned by another program
pub owner: UncheckedAccount<'info>,
```

The 5th account is the address of the ExtraAccountMeta account that stores the
list of extra accounts required by our `transfer_hook` instruction.

```rust
/// CHECK: ExtraAccountMetaList Account
#[account(
    seeds = [b"extra-account-metas", mint.key().as_ref()],
    bump
)]
pub extra_account_meta_list: UncheckedAccount<'info>,
```

The remaining accounts are the accounts listed in the ExtraAccountMetas account
in the order we defined them in the `initialize_extra_account_meta_list`
instruction.

```rust
pub wsol_mint: InterfaceAccount<'info, Mint>,
pub token_program: Interface<'info, TokenInterface>,
pub associated_token_program: Program<'info, AssociatedToken>,
#[account(
    mut,
    seeds = [b"delegate"],
    bump
)]
pub delegate: SystemAccount<'info>,
#[account(
    mut,
    token::mint = wsol_mint,
    token::authority = delegate,
)]
pub delegate_wsol_token_account: InterfaceAccount<'info, TokenAccount>,
#[account(
    mut,
    token::mint = wsol_mint,
    token::authority = owner,
)]
pub sender_wsol_token_account: InterfaceAccount<'info, TokenAccount>,
```

Next, update the `transfer_hook` instruction by replacing the following starter
code:

```rust
pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
    Ok(())
}
```

With the updated code below:

```rust
// Require SOL fee on transfer, lamport fee is equal to transfer amount
// If this fails, the initial token transfer fails
pub fn transfer_hook(ctx: Context<TransferHook>, amount: u64) -> Result<()> {
    msg!("Transfer WSOL using delegate PDA");

    let signer_seeds: &[&[&[u8]]] = &[&[b"delegate", &[ctx.bumps.delegate]]];

    // transfer WSOL from sender to delegate token account using delegate PDA
    transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.sender_wsol_token_account.to_account_info(),
                mint: ctx.accounts.wsol_mint.to_account_info(),
                to: ctx.accounts.delegate_wsol_token_account.to_account_info(),
                authority: ctx.accounts.delegate.to_account_info(),
            },
        )
        .with_signer(signer_seeds),
        amount,
        ctx.accounts.wsol_mint.decimals,
    )?;
    Ok(())
}
```

Within the instruction logic, we make a CPI to transfer wSOL from the sender's
wSOL token account. This transfer is signed for using the delegate PDA. For
every token transfer, the sender must first approve the delegate for the
transfer amount.

## Fallback Instruction

Lastly, we need to add a fallback instruction to the Anchor program to handle
the CPI from the Token Extensions program.

This step is required due to the difference in the way Anchor generates
instruction discriminators compared to the ones used in Transfer Hook interface
instructions. The instruction discriminator for the `transfer_hook` instruction
will not match the one for the Transfer Hook interface.

Update the `fallback` instruction by replacing the following starter code:

```rust
pub fn fallback<'info>(
    program_id: &Pubkey,
    accounts: &'info [AccountInfo<'info>],
    data: &[u8],
) -> Result<()> {
    Ok(())
}
```

With the updated code below:

```rust
// fallback instruction handler as workaround to anchor instruction discriminator check
pub fn fallback<'info>(
    program_id: &Pubkey,
    accounts: &'info [AccountInfo<'info>],
    data: &[u8],
) -> Result<()> {
    let instruction = TransferHookInstruction::unpack(data)?;

    // match instruction discriminator to transfer hook interface execute instruction
    // token2022 program CPIs this instruction on token transfer
    match instruction {
        TransferHookInstruction::Execute { amount } => {
            let amount_bytes = amount.to_le_bytes();

            // invoke custom transfer hook instruction on our program
            __private::__global::transfer_hook(program_id, accounts, &amount_bytes)
        }
        _ => return Err(ProgramError::InvalidInstructionData.into()),
    }
}
```

The fallback instruction checks if the instruction discriminator for an incoming
instruction matches the `Execute` instruction from the Transfer Hook interface.
If there is a successful match, it invokes the `transfer_hook` instruction in
our Anchor program.

<Callout type="info">

Currently, there is an unreleased Anchor feature that simplifies this process.
It would remove the need for the fallback instruction.

</Callout>

## Build and Deploy Program

The Transfer Hook program is now complete. Ensure that you have enough Devnet
SOL in your Playground wallet to deploy the program.

To build the program, use the following command:

```
build
```

Next, deploy the program using the command:

```
deploy
```

## Test File Overview

Next, let's test the program. Open the `transfer-hook.test.ts` file, and you
should see the following starter code:

```js
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TransferHook } from "../target/types/transfer_hook";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";
import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  getMintLen,
  createInitializeMintInstruction,
  createInitializeTransferHookInstruction,
  addExtraAccountsToInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
  createApproveInstruction,
  createSyncNativeInstruction,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  getAccount,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import assert from "assert";

describe("transfer-hook", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TransferHook as Program<TransferHook>;
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;

  // Generate keypair to use as address for the transfer-hook enabled mint
  const mint = new Keypair();
  const decimals = 9;

  // Sender token account address
  const sourceTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    wallet.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Recipient token account address
  const recipient = Keypair.generate();
  const destinationTokenAccount = getAssociatedTokenAddressSync(
    mint.publicKey,
    recipient.publicKey,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // ExtraAccountMetaList address
  // Store extra accounts required by the custom transfer hook instruction
  const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
    program.programId
  );

  // PDA delegate to transfer wSOL tokens from sender
  const [delegatePDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("delegate")],
    program.programId
  );

  // Sender wSOL token account address
  const senderWSolTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT, // mint
    wallet.publicKey // owner
  );

  // Delegate PDA wSOL token account address, to receive wSOL tokens from sender
  const delegateWSolTokenAccount = getAssociatedTokenAddressSync(
    NATIVE_MINT, // mint
    delegatePDA, // owner
    true // allowOwnerOffCurve
  );

  // Create the two WSol token accounts as part of setup
  before(async () => {
    // WSol Token Account for sender
    await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.payer,
      NATIVE_MINT,
      wallet.publicKey
    );

    // WSol Token Account for delegate PDA
    await getOrCreateAssociatedTokenAccount(
      connection,
      wallet.payer,
      NATIVE_MINT,
      delegatePDA,
      true
    );
  });

  it("Create Mint Account with Transfer Hook Extension", async () => {});

  it("Create Token Accounts and Mint Tokens", async () => {});

  it("Create ExtraAccountMetaList Account", async () => {});

  it("Transfer Hook with Extra Account Meta", async () => {});
});
```

First, we generate a keypair to use as the address for a new Mint Account. Using
the mint address, we derive the Associated Token Account (ATA) addresses that we
will use for the token transfer.

```js
// Generate keypair to use as address for the transfer-hook enabled mint
const mint = new Keypair();
const decimals = 9;

// Sender token account address
const sourceTokenAccount = getAssociatedTokenAddressSync(
  mint.publicKey,
  wallet.publicKey,
  false,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
);

// Recipient token account address
const recipient = Keypair.generate();
const destinationTokenAccount = getAssociatedTokenAddressSync(
  mint.publicKey,
  recipient.publicKey,
  false,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
);
```

Next, we derive the PDA for the ExtraAccountMetas account. This account is
created to store the additional accounts required by the custom transfer hook
instruction.

```js
// ExtraAccountMetaList address
// Store extra accounts required by the custom transfer hook instruction
const [extraAccountMetaListPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("extra-account-metas"), mint.publicKey.toBuffer()],
  program.programId,
);
```

We also derive the PDA that will be used as the delegate. The sender must
approve this address as a delegate for their wSOL token account. This delegate
PDA is used to "sign" for the wSOL transfer in the custom transfer hook
instruction.

```js
// PDA delegate to transfer wSOL tokens from sender
const [delegatePDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("delegate")],
  program.programId,
);
```

Additionally, we derive the addresses for the wSOL token accounts. The first
address is for the sender's wSOL token account, which needs to be funded to pay
for the transfer fee required by the transfer hook instruction. The second
address is for the wSOL token account owned by the delegate PDA. In this
example, all wSOL fees are sent to this account.

```js
// Sender wSOL token account address
const senderWSolTokenAccount = getAssociatedTokenAddressSync(
  NATIVE_MINT, // mint
  wallet.publicKey, // owner
);

// Delegate PDA wSOL token account address, to receive wSOL tokens from sender
const delegateWSolTokenAccount = getAssociatedTokenAddressSync(
  NATIVE_MINT, // mint
  delegatePDA, // owner
  true, // allowOwnerOffCurve
);
```

Finally, as part of the setup, we create the wSOL token accounts.

```js
// Create the two WSol token accounts as part of setup
before(async () => {
  // WSol Token Account for sender
  await getOrCreateAssociatedTokenAccount(
    connection,
    wallet.payer,
    NATIVE_MINT,
    wallet.publicKey,
  );

  // WSol Token Account for delegate PDA
  await getOrCreateAssociatedTokenAccount(
    connection,
    wallet.payer,
    NATIVE_MINT,
    delegatePDA,
    true,
  );
});
```

## Create Mint Account

To begin, build a transaction to create a new Mint Account with the Transfer
Hook extension enabled. In this transaction, make sure to specify our program as
the Transfer Hook program stored on the extension.

Enabling the Transfer Hook extension allows the Transfer Extension program to
determine which program to invoke on every token transfer.

Replace the placeholder test:

```js
it("Create Mint Account with Transfer Hook Extension", async () => {});
```

With the updated test below:

```js
it("Create Mint Account with Transfer Hook Extension", async () => {
  const extensions = [ExtensionType.TransferHook];
  const mintLen = getMintLen(extensions);
  const lamports =
    await provider.connection.getMinimumBalanceForRentExemption(mintLen);

  const transaction = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: mint.publicKey,
      space: mintLen,
      lamports: lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    createInitializeTransferHookInstruction(
      mint.publicKey,
      wallet.publicKey,
      program.programId, // Transfer Hook Program ID
      TOKEN_2022_PROGRAM_ID,
    ),
    createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      wallet.publicKey,
      null,
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  const txSig = await sendAndConfirmTransaction(
    provider.connection,
    transaction,
    [wallet.payer, mint],
  );
  console.log(`Transaction Signature: ${txSig}`);
});
```

## Creating Token Accounts

Next, as part of the setup, create the Associated Token Accounts for both the
sender and recipient. Also, fund the sender's account with some tokens.

Replace the placeholder test:

```js
it("Create Token Accounts and Mint Tokens", async () => {});
```

With the updated test below:

```js
// Create the two token accounts for the transfer-hook enabled mint
// Fund the sender token account with 100 tokens
it("Create Token Accounts and Mint Tokens", async () => {
  // 100 tokens
  const amount = 100 * 10 ** decimals;

  const transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      sourceTokenAccount,
      wallet.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createAssociatedTokenAccountInstruction(
      wallet.publicKey,
      destinationTokenAccount,
      recipient.publicKey,
      mint.publicKey,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    ),
    createMintToInstruction(
      mint.publicKey,
      sourceTokenAccount,
      wallet.publicKey,
      amount,
      [],
      TOKEN_2022_PROGRAM_ID,
    ),
  );

  const txSig = await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet.payer],
    { skipPreflight: true },
  );

  console.log(`Transaction Signature: ${txSig}`);
});
```

## Create ExtraAccountMeta Account

Before sending a token transfer, we need to create the ExtraAccountMetas account
to store all the additional accounts required by the transfer hook instruction.

To create this account, we invoke the instruction from our program.

Replace the placeholder test:

```js
it("Create ExtraAccountMetaList Account", async () => {});
```

With the updated test below:

```js
// Account to store extra accounts required by the transfer hook instruction
it("Create ExtraAccountMetaList Account", async () => {
  const initializeExtraAccountMetaListInstruction = await program.methods
    .initializeExtraAccountMetaList()
    .accounts({
      payer: wallet.publicKey,
      extraAccountMetaList: extraAccountMetaListPDA,
      mint: mint.publicKey,
      wsolMint: NATIVE_MINT,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .instruction();

  const transaction = new Transaction().add(
    initializeExtraAccountMetaListInstruction,
  );

  const txSig = await sendAndConfirmTransaction(
    provider.connection,
    transaction,
    [wallet.payer],
    { skipPreflight: true },
  );
  console.log("Transaction Signature:", txSig);
});
```

## Transfer Tokens

Finally, we are ready to send a token transfer. In addition to the transfer
instruction, there are a few additional instructions that need to be included.

- The sender must transfer SOL to their wSOL token account to cover the fee
  required by the transfer hook instruction.
- The sender must approve the delegate PDA for the amount of the wSOL fee.
- Include an instruction to sync the wSOL balance.
- The token transfer instruction must include all the extra accounts required by
  the transfer hook instruction.

Replace the placeholder test:

```js
it("Transfer Hook with Extra Account Meta", async () => {});
```

With the updated test below:

```js
it("Transfer Hook with Extra Account Meta", async () => {
  // 1 tokens
  const amount = 1 * 10 ** decimals;

  // Instruction for sender to fund their WSol token account
  const solTransferInstruction = SystemProgram.transfer({
    fromPubkey: wallet.publicKey,
    toPubkey: senderWSolTokenAccount,
    lamports: amount,
  });

  // Approve delegate PDA to transfer WSol tokens from sender WSol token account
  const approveInstruction = createApproveInstruction(
    senderWSolTokenAccount,
    delegatePDA,
    wallet.publicKey,
    amount,
    [],
    TOKEN_PROGRAM_ID,
  );

  // Sync sender WSol token account
  const syncWrappedSolInstruction = createSyncNativeInstruction(
    senderWSolTokenAccount,
  );

  // Standard token transfer instruction
  const transferInstruction = createTransferCheckedInstruction(
    sourceTokenAccount,
    mint.publicKey,
    destinationTokenAccount,
    wallet.publicKey,
    amount,
    decimals,
    [],
    TOKEN_2022_PROGRAM_ID,
  );

  // Automatic account resolution not working correctly for the WSol PDA
  // Manually add all the extra accounts required by the transfer hook instruction
  // Also include the address of the ExtraAccountMetaList account and Transfer Hook Program
  transferInstruction.keys.push(
    {
      pubkey: new PublicKey("So11111111111111111111111111111111111111112"),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: delegatePDA,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: delegateWSolTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: senderWSolTokenAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: program.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: extraAccountMetaListPDA,
      isSigner: false,
      isWritable: false,
    },
  );

  const transaction = new Transaction().add(
    solTransferInstruction,
    syncWrappedSolInstruction,
    approveInstruction,
    transferInstruction,
  );
  const txSig = await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet.payer],
    { skipPreflight: true },
  );
  console.log("Transfer Signature:", txSig);
});
```

The transfer instruction must include all additional AccountMetas, the address
of the ExtraAccountMetas account, and the address of the Transfer Hook program.

<Callout type="info">

In this example, we manually add the accounts to the transaction. The
`@solana/spl-token` library provides a helper function to automatically resolve
the necessary accounts. However, this function currently does not work if a seed
for a PDA is also included on the ExtraAccountMetas account.

</Callout>

## Run Test File

Once you have updated all the tests, the final step is to run the test.

To run the test file, use the following command in the terminal:

```
test
```

You should see output similar to the following:

```
Running tests...
  transfer-hook.test.ts:
  transfer-hook
    Transaction Signature: 5o12ZTvcSkV8YNqyeQpzRCq4zFSg9VqguQkT9ZSesioj8uzb8dWRheoknuPaRDDqEGdrUBqmRQ2veSUshUicWsqG
    ✔ Create Mint Account with Transfer Hook Extension (996ms)
    Transaction Signature: 4F4Vhi8s1h2reDr6jecvuQFF5XpoofWPpshgAMnfg7jtNZj4HtxbsksFTh28ZjYTaKFpjeturYZKxk5Cj4gBZoy
    ✔ Create Token Accounts and Mint Tokens (716ms)
    Transaction Signature: 3s4Nok6H4qexpGXup3AWC4nGuiqy567rm5rTWLFMXYKxZJensBVVZHCwVDzpwD3XtWjMFHm4TrvQXwKSsp47y5jx
    ✔ Create ExtraAccountMetaList Account (711ms)
    Transfer Signature: 53j9QV5LYUVgV7T7Z99GfYg1Xvp2qbQnHsJbzDK6BR5TPBo9s622KCf3W3BDEL4ECprkZFs5biDRDedfVj6zuDA6
    ✔ Transfer Hook with Extra Account Meta (925ms)
  4 passing (5s)
```

## Conclusion

The Transfer Hook extension and Transfer Hook Interface allow for the creation
of Mint Accounts that execute custom instruction logic on every token transfer.
This guide serves as a reference to help you create your own Transfer Hook
programs. Feel free to be creative and explore the capabilities of this new
functionality!
