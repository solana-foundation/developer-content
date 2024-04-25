---
title: How to Sign with a PDA's Account
sidebarSortOrder: 4
description:
  "A main feature of accounts at Program Derived Addresses is the ability for
  programs to sign using those accounts. Learn how to sign with PDA accounts on
  Solana."
---

Program derived addresses (PDA) can be used to have accounts owned by programs
that can sign. This is useful if you want a program to own a token account and
you want the program to transfer tokens from one account to another.

```rust filename="sign-with-pda.rs" {22-34}
use solana_program::{
    account_info::next_account_info, account_info::AccountInfo, entrypoint,
    entrypoint::ProgramResult, program::invoke_signed, pubkey::Pubkey, system_instruction,
};

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let pda_account_info = next_account_info(account_info_iter)?;
    let to_account_info = next_account_info(account_info_iter)?;
    let system_program_account_info = next_account_info(account_info_iter)?;

    // pass bump seed for saving compute budget
    let bump_seed = instruction_data[0];

    invoke_signed(
        &system_instruction::transfer(
            &pda_account_info.key,
            &to_account_info.key,
            100_000_000, // 0.1 SOL
        ),
        &[
            pda_account_info.clone(),
            to_account_info.clone(),
            system_program_account_info.clone(),
        ],
        &[&[b"escrow", &[bump_seed]]],
    )?;

    Ok(())
}

```
