### Intro to Security

---
title: How to approach the Program Security module objectives:
objectives:
- Understand how to approach the Program Security Module
- Learn about common security vulnerabilities in Solana programs
- Understand the importance of proper account validation and constraint checks
- Gain insight into Anchor's security features and best practices
- Learn about advanced testing techniques for program security description:
description:
  "Learn how to think intelligently about security for your on-chain programs,
  whether developing in Anchor or Native Rust, and understand common attack
  vectors and mitigation strategies."
---

## Overview

The goal of this course is to expose you to a wide variety of common security
exploits that are unique to Solana development. We’ve modeled this course
heavily after Coral’s
[Sealevel Attacks](https://github.com/coral-xyz/sealevel-attacks) repository,
focusing on program security in both **Anchor** and **native Rust**.

This module will expand on the core concepts taught in the on-chain development
courses, focusing on:

1. Expanding awareness of the Solana programming model and areas to focus on for
   closing security loopholes.
2. Exploring tools provided by **Anchor** to help secure your programs.

## Key Security Concepts

### Program Entry & Dispatch

Anchor uses attribute macros like `#[program]` and `#[account]` to streamline
instruction dispatch and account validation. The **entry function** checks if
the program ID is correct and extracts an 8-byte discriminator from incoming
instructions to route to the correct instruction handler.  
**Example**:

```rust
fn try_entry<'info>(
    program_id: &Pubkey,
    accounts: &'info [AccountInfo<'info>],
    data: &[u8],
) -> anchor_lang::Result<()> {
    if *program_id != ID {
        return Err(anchor_lang::error::ErrorCode::DeclaredProgramIdMismatch.into());
    }
    dispatch(program_id, accounts, data)
}
```

Understanding this flow is essential for securing Solana programs, as missing or
incorrect dispatch logic can lead to **discriminators** being bypassed,
potentially allowing unauthorized instructions.

---

### Account Validation

**Proper account validation** is a cornerstone of security. Anchor’s
`#[account]` macro simplifies this, but it’s crucial to understand how to use
constraints like `mut`, `has_one`, and `seeds` for security:

- **Checking Ownership**: Verifying that accounts are owned by the correct
  program is crucial to prevent unauthorized access. For example:

  ```rust
  #[account(
    has_one = authority,
    seeds = [b"my_seed", authority.key().as_ref()],
    bump
  )]
  pub data_account: Account<'info, DataAccount>,
  ```

- **Unchecked Accounts**: Using unchecked accounts (`AccountInfo<'info>`) can be
  dangerous if improperly validated. It's important to minimize their use unless
  absolutely necessary.

---

### Constraint Checks

Anchor's constraint system can enforce validation rules on accounts, helping you
avoid manually checking for common issues.

```rust
#[account(mut, has_one = authority)]
pub data_account: Account<'info, DataAccount>,
#[account(signer)]
pub authority: AccountInfo<'info>,
```

Constraints like these automatically ensure that the correct **signer** is
present and that the `data_account` belongs to the correct authority. Anchor’s
**Discriminator** also ensures that account types are correctly matched,
preventing attacks like using the wrong account type in a function.

---

### Cross-Program Invocation (CPI) Security

**CPIs** are a powerful feature in Solana, but they introduce security risks.
Ensure that CPIs are tightly controlled:

- Validate the program ID being invoked during CPIs to avoid unintended calls.
- When using CPIs, validate inputs thoroughly to avoid injecting malicious
  accounts into your program’s flow.

```rust
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke;

invoke(
    &instruction,
    &[
        account_info.clone(),
        // Add any CPI-specific accounts here
    ]
)?;
```

---

### Reinitialization Attacks

Anchor helps guard against reinitialization attacks with its `#[account(init)]`
and `#[account(init_if_needed)]` constraints, but you must be cautious. Always
verify that accounts are properly initialized before reinitializing them to
avoid resetting critical data.

---

### Anchor’s Security Features

Anchor provides many features that automate and enhance security:

- **Account Constraints**: These ensure accounts conform to specific criteria
  like being a signer or owning a certain account.
- **Typed Accounts**: Using typed accounts in Rust helps prevent errors due to
  mismatches between expected data structures.

  ```rust
  pub struct MyAccount {
      pub data: u64,
      pub authority: Pubkey,
  }
  ```

- **PDA Derivation**: Ensure **Program Derived Addresses (PDAs)** are securely
  created using proper seeds and validated with Anchor’s `#[account(seeds)]`
  constraint.

  ```rust
  #[account(
    seeds = [b"my_seed", authority.key().as_ref()],
    bump,
  )]
  pub my_pda: Account<'info, MyPdaAccount>,
  ```

- **Error Handling**: Anchor’s `#[error_code]` macro allows for more descriptive
  error messages and precise handling of edge cases.

---

## Testing for Security

**Testing** is key to ensuring program security. This module covers how to write
tests that can simulate potential attack scenarios and validate program
behavior.

### Integration Tests vs Unit Tests

We focus on **integration tests** that simulate real-world scenarios, but unit
tests are also important for verifying smaller components.

| **Context**        | **Unit Tests**                            | **Integration Tests**                                          |
| ------------------ | ----------------------------------------- | -------------------------------------------------------------- |
| **Scope**          | Focused on specific functions or modules. | Broad, covers multiple components and external dependencies.   |
| **Execution Time** | Fast.                                     | Slower, involves more components and real Solana environments. |

> **Tip**: Use **cargo test-sbf** for Rust tests, and **anchor test** for
> testing in TypeScript.

### Advanced Testing Techniques

You can forward the clock in your tests to simulate time passing, which is
crucial when testing features that depend on **timeouts or deadlines**:

```rust
pub async fn forward_time(program_test_context: &mut ProgramTestContext, seconds: i64) {
    let mut clock = program_test_context.banks_client.get_sysvar::<Clock>().await.unwrap();
    clock.unix_timestamp += seconds;
    program_test_context.set_sysvar(&clock);
}
```

In TypeScript tests, you can either use **Bankrun** or other frameworks to
simulate these scenarios. For example:

```typescript
const now = clock.unixTimestamp;
const inFuture7Days = now + BigInt(7 * 24 * 60 * 60);
testEnv.context.setClock({ ...clock, unixTimestamp: inFuture7Days });
```

### Simulating Attacks

Tests should include scenarios that simulate common attacks such as
**unauthorized CPI**, **reinitialization attempts**, or missing signers. Write
robust tests that cover both expected behavior and potential edge cases.

```typescript
it("Prevents unauthorized access", async () => {
  try {
    await program.methods
      .sensitiveOperation()
      .accounts({
        dataAccount: dataAccount.publicKey,
        authority: wrongAuthority.publicKey,
      })
      .signers([wrongAuthority])
      .rpc();
    assert.fail("Expected error not thrown");
  } catch (err) {
    assert.equal(err.error.errorMessage, "A has_one constraint was violated");
  }
});
```

---

### Conclusion

Security is an ongoing process. Anchor provides many powerful tools, but it’s
essential to stay updated on the latest security best practices. Thorough
testing, validation, and account constraint enforcement are critical for
building secure Solana programs.
