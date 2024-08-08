---
title: Reading Multiple Instructions
sidebarSortOrder: 6
description:
  "Learn how to read multiple instructions from a transaction in a Solana
  program."
---

Solana allows us to take a peek at all of the instructions in the current
transaction. We can store them in a variable and iterate over them. We can do
many things with this, like checking for suspicious transactions.

```rust filename="read-multiple-instructions.rs"
use anchor_lang::{
    prelude::*,
    solana_program::{
        sysvar,
        serialize_utils::{read_pubkey,read_u16}
    }
};

declare_id!("8DJXJRV8DBFjJDYyU9cTHBVK1F1CTCi6JUBDVfyBxqsT");

#[program]
pub mod cookbook {
    use super::*;

    pub fn read_multiple_instruction<'info>(ctx: Context<ReadMultipleInstruction>, creator_bump: u8) -> Result<()> {
        let instruction_sysvar_account = &ctx.accounts.instruction_sysvar_account;

        let instruction_sysvar_account_info = instruction_sysvar_account.to_account_info();

        let id = "8DJXJRV8DBFjJDYyU9cTHBVK1F1CTCi6JUBDVfyBxqsT";

        let instruction_sysvar = instruction_sysvar_account_info.data.borrow();

        let mut idx = 0;

        let num_instructions = read_u16(&mut idx, &instruction_sysvar)
        .map_err(|_| MyError::NoInstructionFound)?;

        for index in 0..num_instructions {
            let mut current = 2 + (index * 2) as usize;
            let start = read_u16(&mut current, &instruction_sysvar).unwrap();

            current = start as usize;
            let num_accounts = read_u16(&mut current, &instruction_sysvar).unwrap();
            current += (num_accounts as usize) * (1 + 32);
            let program_id = read_pubkey(&mut current, &instruction_sysvar).unwrap();

            if program_id != id
            {
                msg!("Transaction had ix with program id {}", program_id);
                return Err(MyError::SuspiciousTransaction.into());
            }
        }

        Ok(())
    }

}

#[derive(Accounts)]
#[instruction(creator_bump:u8)]
pub struct ReadMultipleInstruction<'info> {
    #[account(address = sysvar::instructions::id())]
    instruction_sysvar_account: UncheckedAccount<'info>
}

#[error_code]
pub enum MyError {
    #[msg("No instructions found")]
    NoInstructionFound,
    #[msg("Suspicious transaction detected")]
    SuspiciousTransaction
}
```
