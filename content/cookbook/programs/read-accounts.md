---
title: How to read accounts in a program
sidebarSortOrder: 6
description: "Learn how to read accounts in a Solana program."
---

Almost all instructions in Solana require at least 2 - 3 accounts, and they  
would be mentioned over the instruction handlers on what order it's expecting
those set of accounts. It's fairly simple if we take advantage of the `iter()`
method in Rust, instead of manually indicing the accounts. The
`next_account_info` method basically slices the first index of the iterable and
returning the account present inside the accounts array. Let's see a simple
instruction which expects a bunch of accounts and requiring to parse each of
them.

```rust filename="read-accounts.rs"
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct HelloState {
    is_initialized: bool,
}

// Accounts required
/// 1. [signer] Payer
/// 2. [writable] Hello state account
/// 3. [] Rent account
/// 4. [] System Program
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    // Fetching all the accounts as a iterator (facilitating for loops and iterations)
    let accounts_iter = &mut accounts.iter();
    // Payer account
    let payer_account = next_account_info(accounts_iter)?;
    // Hello state account
    let hello_state_account = next_account_info(accounts_iter)?;
    // Rent account
    let rent_account = next_account_info(accounts_iter)?;
    // System Program
    let system_program = next_account_info(accounts_iter)?;

    Ok(())
}
```
