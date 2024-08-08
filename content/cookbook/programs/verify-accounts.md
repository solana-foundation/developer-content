---
title: How to verify accounts in a Solana program
sidebarSortOrder: 6
description: "Learn how to verify accounts in a Solana program."
---

Since programs in Solana are stateless, we as a program creator have to make
sure the accounts passed are validated as much as possible to avoid any
malicious account entry. The basic checks one can do are

1. Check if the expected signer account has actually signed
2. Check if the expected state account's have been checked as writable
3. Check if the expected state account's owner is the called program id
4. If initializing the state for the first time, check if the account's already
   been initialized or not.
5. Check if any cross program ids passed (whenever needed) are as expected.

A basic instruction which initializes a hero state account, but with the above
mentioned checks is defined below

```rust filename="verify-accounts.rs"
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_program::ID as SYSTEM_PROGRAM_ID,
    sysvar::Sysvar,
};

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct HelloState {
    is_initialized: bool,
}

// Accounts required
/// 1. [signer] Payer
/// 2. [writable] Hello state account
/// 3. [] System Program
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    // Payer account
    let payer_account = next_account_info(accounts_iter)?;
    // Hello state account
    let hello_state_account = next_account_info(accounts_iter)?;
    // System Program
    let system_program = next_account_info(accounts_iter)?;

    let rent = Rent::get()?;

    // Checking if payer account is the signer
    if !payer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Checking if hello state account is rent exempt
    if !rent.is_exempt(hello_state_account.lamports(), 1) {
        return Err(ProgramError::AccountNotRentExempt);
    }

    // Checking if hello state account is writable
    if !hello_state_account.is_writable {
        return Err(ProgramError::InvalidAccountData);
    }

    // Checking if hello state account's owner is the current program
    if hello_state_account.owner.ne(&program_id) {
        return Err(ProgramError::IllegalOwner);
    }

    // Checking if the system program is valid
    if system_program.key.ne(&SYSTEM_PROGRAM_ID) {
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut hello_state = HelloState::try_from_slice(&hello_state_account.data.borrow())?;

    // Checking if the state has already been initialized
    if hello_state.is_initialized {
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    hello_state.is_initialized = true;
    hello_state.serialize(&mut &mut hello_state_account.data.borrow_mut()[..])?;
    msg!("Account initialized :)");

    Ok(())
}
```
