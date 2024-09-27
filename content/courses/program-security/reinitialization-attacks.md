---
title: Reinitialization Attacks
objectives:
  - Explain security risks associated with a reinitialization vulnerability
  - Using Anchor's `init` constraint to initialize accounts, which automatically
    sets an account discriminator that is checked to prevent the
    reinitialization of an account
  - Use native Rust to check if an account has already been initialized
description:
  "Understand the security risks of account reinitialized attacks being used to
  override data, and how to prevent them."
---

## Summary

- **Prevent Account Reinitialization:** Use an account discriminator or
  initialization flag to prevent an account from being reinitialized and
  overwriting existing data.
- **Anchor Approach:** Simplify this by using Anchor's `init` constraint to
  create an account via a CPI to the system program, automatically setting its
  discriminator.
- **Native Rust Approach:** In native Rust, set an is_initialized flag during
  account initialization and check it before reinitializing:

  ```rust
  if account.is_initialized {
      return Err(ProgramError::AccountAlreadyInitialized.into());
  }
  ```

## Lesson

Initialization sets the data of a new account for the first time. It's essential
to check if an account has already been initialized to prevent overwriting
existing data. Note that creating and initializing an account are separate
actions. Creating an account involves invoking the `create_account` instruction
handler on the System Program, which allocates space, rent in lamports, and
assigns the program owner. Initialization sets the account data. These steps can
be combined into a single transaction.

### Missing Initialization Check

In the example below, there's no check on the `user` account. The `initialize`
instruction handler sets the `authority` field on the `User` account type and
serializes the data. Without checks, an attacker could reinitialize the account,
overwriting the existing `authority`.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod initialization_insecure {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.user.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    pub authority: Pubkey,
}
```

### Add is_initialized Check

To fix this, add an `is_initialized` field to the User account type and check it
before reinitializing:

```rust
if user.is_initialized {
    return Err(ProgramError::AccountAlreadyInitialized.into());
}
```

This ensures the `user` account is only initialized once. If `is_initialized` is
true, the transaction fails, preventing an attacker from changing the account
authority.

```rust
use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_error::ProgramError;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod initialization_secure {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let user = &mut ctx.accounts.user;

        if user.is_initialized {
            return Err(ProgramError::AccountAlreadyInitialized.into());
        }

        user.is_initialized = true;
        user.authority = ctx.accounts.authority.key();

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    pub is_initialized: bool,
    pub authority: Pubkey,
}
```

### Use Anchor's init Constraint

[Anchor's `init` constraint](https://www.anchor-lang.com/docs/account-constraints),
used with the `#[account(...)]` attribute, initializes an account, sets the
account discriminator, and ensures that the instruction handler can only be
called once per account. The `init` constraint must be used with `payer` and
`space` constraints to specify the account paying for initialization and the
amount of space required.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

const DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod initialization_recommended {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("GM");
        ctx.accounts.user.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = DISCRIMINATOR_SIZE + User::INIT_SPACE
    )]
    pub user: Account<'info, User>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    pub authority: Pubkey,
}
```

#### Anchor's init_if_needed Constraint

<Callout type="caution">

[Anchor's `init_if_needed` constraint](https://www.anchor-lang.com/docs/account-constraints),
guarded by a feature flag, should be used with caution.It initializes an account
only if it hasn't been initialized yet. If the account is already initialized,
the instruction handler will still execute, so
it's \***\*\*\*\***extremely\***\*\*\*\*** important to include checks in your
instruction handler to prevent resetting the account to its initial state.
</Callout>

For example, if the `authority` field is set in the instruction handler, ensure
that your instruction handler includes checks to prevent an attacker from
reinitializing it after it's already been set. Typically, it's safer to have a
separate instruction handler for initializing account data.

## Lab

In this lab, we'll create a simple Solana program with two instruction handlers:

- `insecure_initialization` - Initializes an account without checks, allowing
  reinitialization.
- `recommended_initialization` - Initializes an account using Anchor's `init`
  constraint, preventing reinitialization.

### 1. Starter

To get started, download the starter code from the
[`starter` branch of this repository](https://github.com/solana-developers/reinitialization-attacks/tree/starter).
The starter code includes a program with one instruction handler and the
boilerplate setup for the test file.

The `insecure_initialization` instruction handler initializes a new `user`
account that stores the public key of an `authority`. The account is expected to
be allocated client-side and then passed into the program instruction. However,
there are no checks to verify if the `user` account's initial state has already
been set. This means the same account can be passed in a second time, allowing
the `authority` to be overwritten.

```rust
use anchor_lang::prelude::*;

declare_id!("HLhxJzFYjtXCET4HxnSzv27SpXg16FWNDi2LvrNmSvzH");

#[program]
pub mod initialization {
    use super::*;

    pub fn insecure_initialization(ctx: Context<Unchecked>) -> Result<()> {
        let user = &mut ctx.accounts.user;
        let mut user_data = User::try_from_slice(&user.data.borrow())?;
        user_data.authority = ctx.accounts.authority.key();
        user_data.serialize(&mut *user.data.borrow_mut())?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Unchecked<'info> {
    #[account(mut)]
    /// CHECK: This account will be initialized in the instruction
    pub user: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    pub authority: Pubkey,
}
```

### 2. Test insecure_initialization Instruction Handler

The test file includes the setup to create an account by invoking the system
program and then invokes the `insecure_initialization` instruction handler twice
using the same account.

Since there are no checks in the `insecure_initialization` instruction handler
to verify that the account data has not already been initialized, this
instruction handler will execute successfully both times, even with a
_different_ authority account.

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Initialization } from "../target/types/initialization";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  SendTransactionError,
} from "@solana/web3.js";
import { expect } from "chai";
import { airdropIfRequired } from "@solana-developers/helpers";

describe("Initialization", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Initialization as Program<Initialization>;

  const walletAuthority = provider.wallet as anchor.Wallet;
  const secondWallet = Keypair.generate();

  const insecureUserAccount = Keypair.generate();
  const recommendedUserAccount = Keypair.generate();

  const ACCOUNT_SPACE = 32;
  const AIRDROP_AMOUNT = 1 * LAMPORTS_PER_SOL;
  const MINIMUM_BALANCE_FOR_RENT_EXEMPTION = 1 * LAMPORTS_PER_SOL;

  before(async () => {
    try {
      const rentExemptionAmount =
        await provider.connection.getMinimumBalanceForRentExemption(
          ACCOUNT_SPACE,
        );

      const createAccountInstruction = SystemProgram.createAccount({
        fromPubkey: walletAuthority.publicKey,
        newAccountPubkey: insecureUserAccount.publicKey,
        space: ACCOUNT_SPACE,
        lamports: rentExemptionAmount,
        programId: program.programId,
      });

      const transaction = new Transaction().add(createAccountInstruction);

      await anchor.web3.sendAndConfirmTransaction(
        provider.connection,
        transaction,
        [walletAuthority.payer, insecureUserAccount],
      );

      await airdropIfRequired(
        provider.connection,
        secondWallet.publicKey,
        AIRDROP_AMOUNT,
        MINIMUM_BALANCE_FOR_RENT_EXEMPTION,
      );
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  });

  it("performs insecure initialization", async () => {
    try {
      await program.methods
        .insecureInitialization()
        .accounts({
          user: insecureUserAccount.publicKey,
          authority: walletAuthority.publicKey,
        })
        .signers([walletAuthority.payer])
        .rpc();
    } catch (error) {
      console.error("Insecure initialization failed:", error);
      throw error;
    }
  });

  it("re-invokes insecure initialization with different authority", async () => {
    try {
      const transaction = await program.methods
        .insecureInitialization()
        .accounts({
          user: insecureUserAccount.publicKey,
          authority: secondWallet.publicKey,
        })
        .signers([secondWallet])
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(
        provider.connection,
        transaction,
        [secondWallet],
      );
    } catch (error) {
      console.error("Re-invocation of insecure initialization failed:", error);
      throw error;
    }
  });
});
```

Run `anchor test` to verify that the `insecure_initialization` instruction
handler executes successfully in both invocations.

```bash
Initialization
    ✔ performs insecure initialization (420ms)
    ✔ re-invokes insecure initialization with different authority (419ms)
```

### 3. Add recommended_initialization Instruction Handler

Now, let's create a new instruction handler called `recommended_initialization`
that addresses the issue. Unlike the insecure instruction handler, this one will
handle both the creation and initialization of the user's account using Anchor's
`init` constraint.

This constraint ensures the account is created via a CPI to the system program,
and the discriminator is set. This way, any subsequent invocation with the same
user account will fail, preventing reinitialization.

```rust
use anchor_lang::prelude::*;
use borsh::{BorshDeserialize, BorshSerialize};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod initialization {
    use super::*;
    ...
    pub fn recommended_initialization(ctx: Context<Checked>) -> Result<()> {
        ctx.accounts.user.authority = ctx.accounts.authority.key();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Checked<'info> {
    #[account(
        init,
        payer = authority,
        space = DISCRIMINATOR_SIZE + User::INIT_SPACE
    )]
    user: Account<'info, User>,
    #[account(mut)]
    authority: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct User {
    pub authority: Pubkey,
}
```

### 4. Test recommended_initialization Instruction Handler

To test the `recommended_initialization` instruction handler, invoke it twice as
before. This time, the transaction should fail when attempting to initialize the
same account a second time.

```typescript
describe("Initialization", () => {
  ...
  it("performs recommended initialization", async () => {
    try {
      await program.methods
        .recommendedInitialization()
        .accounts({
          user: recommendedUserAccount.publicKey,
        })
        .signers([recommendedUserAccount])
        .rpc();
    } catch (error) {
      console.error("Recommended initialization failed:", error);
      throw error;
    }
  });

  it("fails to re-invoke recommended initialization with different authority", async () => {
    try {
      const transaction = await program.methods
        .recommendedInitialization()
        .accounts({
          user: recommendedUserAccount.publicKey,
          authority: secondWallet.publicKey,
        })
        .transaction();

      await anchor.web3.sendAndConfirmTransaction(
        provider.connection,
        transaction,
        [secondWallet, recommendedUserAccount],
        { commitment: "confirmed" }
      );

      throw new Error("Re-invocation succeeded unexpectedly");
    } catch (error) {
      if (error.message === "Re-invocation succeeded unexpectedly") {
        throw error;
      }

      if (error instanceof SendTransactionError) {
        console.log("Transaction failed as expected");
      } else {
        console.error("Unexpected error:", error);
      }
      console.log(error)
      expect(error).to.exist;
    }
  });
});
```

Run `anchor test` to confirm that the second transaction fails with an error
indicating the account is already in use.

```bash
'Program HLhxJzFYjtXCET4HxnSzv27SpXg16FWNDi2LvrNmSvzH invoke [1]',
'Program log: Instruction: RecommendedInitialization',
'Program 11111111111111111111111111111111 invoke [2]',
'Allocate: account Address { address: FcW7tG71GKuRgxEbgFuuNQNV3HVSMmVyKATo74iCK4yi, base: None } already in use',
'Program 11111111111111111111111111111111 failed: custom program error: 0x0',
'Program HLhxJzFYjtXCET4HxnSzv27SpXg16FWNDi2LvrNmSvzH consumed 3330 of 200000 compute units',
'Program HLhxJzFYjtXCET4HxnSzv27SpXg16FWNDi2LvrNmSvzH failed: custom program error: 0x0'
```

Using Anchor's `init` constraint is usually sufficient to protect against
reinitialization attacks. While the fix for these security exploits is
straightforward, it is crucial. Every time you initialize an account, ensure
that you're either using the `init` constraint or implementing another check to
prevent resetting an existing account's initial state.

For the final solution code, refer to the
[`solution` branch of this repository](https://github.com/solana-developers/reinitialization-attacks/tree/solution).

## Challenge

Your challenge is to audit your own or other programs to practice avoiding this
security exploit.

Take some time to review at least one program and confirm that instruction
handlers are adequately protected against reinitialization attacks.

If you find a bug or exploit in another program, alert the developer. If you
find one in your own program, patch it immediately.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=652c68aa-18d9-464c-9522-e531fd8738d5)!
</Callout>
