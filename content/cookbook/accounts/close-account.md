---
title: How to Close an Account
sidebarSortOrder: 5
description:
  "When an account is no longer needed, you can close the account to reclaim the
  rent. Learn how to close accounts efficiently on Solana."
---

Closing accounts enables you to reclaim the SOL that was used to open the
account, but requires deleting of all information in the account. When an
account is closed, make sure that the data is zeroed out in the same instruction
to avoid people reopening the account in the same transaction and getting access
to the data. This is because the account is not actually closed until the
transaction is completed.

```rust filename="close-account.rs" {18-25}
use solana_program::{
    account_info::next_account_info, account_info::AccountInfo, entrypoint,
    entrypoint::ProgramResult, pubkey::Pubkey,
};

entrypoint!(process_instruction);

fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let source_account_info = next_account_info(account_info_iter)?;
    let dest_account_info = next_account_info(account_info_iter)?;

    let dest_starting_lamports = dest_account_info.lamports();
    **dest_account_info.lamports.borrow_mut() = dest_starting_lamports
        .checked_add(source_account_info.lamports())
        .unwrap();
    **source_account_info.lamports.borrow_mut() = 0;

    source_account_info.assign(&system_program::ID);
    source_account_info.realloc(0, false).map_err(Into::into)

    Ok(())
}
```
