---
title: Bump Seed Canonicalization
objectives:
  - Explain the vulnerabilities associated with using PDAs derived without the
    canonical bump
  - Initialize a PDA using Anchor's `seeds` and `bump` constraints to
    automatically use the canonical bump
  - Use Anchor's `seeds` and `bump` constraints to ensure the canonical bump is
    always used in future instructions when deriving a PDA
description:
  "Understand the need for consistent PDA calculation by storing and reusing the
  canonical bump."
---

## Summary

- The
  [**`create_program_address`**](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.create_program_address)
  function derives a PDA but does so without searching for the canonical bump.
  It allows multiple valid bumps to produce different addresses. While this can
  still generate a valid PDA, it lacks determinism, as multiple bumps may yield
  different addresses for the same set of seeds.
- Using
  [**`find_program_address`**](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.find_program_address)
  ensures that the **highest valid bump**, often referred to as the **canonical
  bump**, is used in the PDA derivation. This provides a deterministic way to
  compute an address for a given set of seeds, ensuring consistency across the
  program.
- In Anchor, you can specify the `seeds` and the `bump` to ensure that PDA
  derivations in your account validation struct always align with the correct
  canonical bump.
- Anchor also allows you to specify a bump directly in the validation struct
  using the `bump = <some_bump>` constraint. This ensures that the correct bump
  is used when verifying the PDA.
- Using `find_program_address` can be computationally expensive due to the
  process of searching for the highest valid bump. It's considered best practice
  to store the derived bump in an account's data field upon initialization. This
  allows the bump to be referenced in subsequent instruction handlers, avoiding
  the need to repeatedly call `find_program_address` to re-derive the PDA.

  ```rust
  #[derive(Accounts)]
  pub struct VerifyAddress<'info> {
      #[account(
          seeds = [DATA_PDA_SEED.as_bytes()],
          bump = data.bump
      )]
      data: Account<'info, Data>,
  }
  ```

- In summary, while `create_program_address` can generate a PDA,
  `find_program_address` ensures consistency and reliability by always producing
  the canonical bump, which is critical for deterministic program execution.
  This helps maintain integrity in onchain apps, especially when validating PDAs
  across multiple instruction handlers.

## Lesson

Bump seeds are a number between 0 and 255, inclusive, used to ensure that an
address derived using
[`create_program_address`](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.create_program_address)
is a valid PDA. The **canonical bump** is the highest bump value that produces a
valid PDA. The standard in Solana is to _always use the canonical bump_ when
deriving PDAs, both for security and convenience.

### Insecure PDA Derivation using create_program_address

Given a set of seeds, the `create_program_address` function will produce a valid
PDA about 50% of the time. The bump seed is an additional byte added as a seed
to "bump" the derived address into a valid territory. Since there are 256
possible bump seeds and the function produces valid PDAs approximately 50% of
the time, there are many valid bumps for a given set of input seeds.

You can imagine that this could cause confusion in locating accounts when using
seeds as a way of mapping between known pieces of information to accounts. Using
the canonical bump as the standard ensures that you can always find the right
account. More importantly, it avoids security exploits caused by the open-ended
nature of allowing multiple bumps.

In the example below, the `set_value` instruction handler uses a `bump` that was
passed in as instruction data to derive a PDA. The instruction handler then
derives the PDA using `create_program_address` function and checks that the
`address` matches the public key of the `data` account.

```rust
use anchor_lang::prelude::*;

declare_id!("ABQaKhtpYQUUgZ9m2sAY7ZHxWv6KyNdhUJW8Dh8NQbkf");

#[program]
pub mod bump_seed_canonicalization_insecure {
    use super::*;

    // Insecure PDA Derivation using create_program_address
    pub fn set_value(ctx: Context<BumpSeed>, key: u64, new_value: u64, bump: u8) -> Result<()> {
        let address =
            Pubkey::create_program_address(&[key.to_le_bytes().as_ref(), &[bump]], ctx.program_id)
                .unwrap();
        if address != ctx.accounts.data.key() {
            return Err(ProgramError::InvalidArgument.into());
        }

        ctx.accounts.data.value = new_value;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct BumpSeed<'info> {
    #[account(mut)]
    pub data: Account<'info, Data>,
}

#[account]
pub struct Data {
    pub value: u64,
}
```

While the instruction handler derives the PDA and checks the passed-in account,
which is good, it allows the caller to pass in an arbitrary bump. Depending on
the context of your program, this could result in undesired behavior or
potential exploit.

If the seed mapping was meant to enforce a one-to-one relationship between PDA
and user, for example, this program would not properly enforce that. A user
could call the program multiple times with many valid bumps, each producing a
different PDA.

### Recommended Derivation using find_program_address

A simple way around this problem is to have the program expect only the
canonical bump and use `find_program_address` to derive the PDA.

The
[`find_program_address`](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.find_program_address)
_always uses the canonical bump_. This function iterates by calling
`create_program_address`, starting with a bump of 255 and decrementing the bump
by one with each iteration. As soon as a valid address is found, the function
returns both the derived PDA and the canonical bump used to derive it.

This ensures a one-to-one mapping between your input seeds and the address they
produce.

```rust
pub fn set_value_secure(
    ctx: Context<BumpSeed>,
    key: u64,
    new_value: u64,
    bump: u8,
) -> Result<()> {
    let (address, expected_bump) =
        Pubkey::find_program_address(&[key.to_le_bytes().as_ref()], ctx.program_id);

    if address != ctx.accounts.data.key() {
        return Err(ProgramError::InvalidArgument.into());
    }
    if expected_bump != bump {
        return Err(ProgramError::InvalidArgument.into());
    }

    ctx.accounts.data.value = new_value;
    Ok(())
}
```

### Use Anchor's seeds and bump Constraints

Anchor provides a convenient way to derive PDAs in the account validation struct
using the `seeds` and `bump` constraints. These can even be combined with the
`init` constraint to initialize the account at the intended address. To protect
the program from the vulnerability we've been discussing throughout this lesson,
Anchor does not even allow you to initialize an account at a PDA using anything
but the canonical bump. Instead, it uses `find_program_address` to derive the
PDA and subsequently performs the initialization.

```rust
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

pub const DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod bump_seed_canonicalization_recommended {
    use super::*;

    pub fn set_value(ctx: Context<BumpSeed>, _key: u64, new_value: u64) -> Result<()> {
        ctx.accounts.data.value = new_value;
        Ok(())
    }
}
// Initialize account at PDA
#[derive(Accounts)]
#[instruction(key: u64)]
pub struct BumpSeed<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        seeds = [key.to_le_bytes().as_ref()],
        // Derives the PDA using the canonical bump
        bump,
        payer = payer,
        space = DISCRIMINATOR_SIZE + Data::INIT_SPACE
    )]
    pub data: Account<'info, Data>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Data {
    pub value: u64,
}
```

If you aren't initializing an account, you can still validate PDAs with the
`seeds` and `bump` constraints. This simply rederives the PDA and compares the
derived address with the address of the account passed in.

In this scenario, Anchor _does_ allow you to specify the bump to use to derive
the PDA with `bump = <some_bump>`. The intent here is not for you to use
arbitrary bumps, but rather to let you optimize your program. The iterative
nature of `find_program_address` makes it expensive, so best practice is to
store the canonical bump in the PDA account's data upon initializing a PDA,
allowing you to reference the bump stored when validating the PDA in subsequent
instruction handlers.

When you specify the bump to use, Anchor uses `create_program_address` with the
provided bump instead of `find_program_address`. This pattern of storing the
bump in the account data ensures that your program always uses the canonical
bump without degrading performance.

```rust
use anchor_lang::prelude::*;

declare_id!("CVwV9RoebTbmzsGg1uqU1s4a3LvTKseewZKmaNLSxTqc");

// Constant for account space calculation
pub const DISCRIMINATOR_SIZE: usize = 8;

#[program]
pub mod bump_seed_canonicalization_recommended {
    use super::*;

    // Instruction handler to set a value and store the bump
    pub fn set_value(ctx: Context<BumpSeed>, _key: u64, new_value: u64) -> Result<()> {
        ctx.accounts.data.value = new_value;

        // Store the canonical bump on the account
        // This bump is automatically derived by Anchor
        ctx.accounts.data.bump = ctx.bumps.data;

        Ok(())
    }

    // Instruction handler to verify the PDA address
    pub fn verify_address(ctx: Context<VerifyAddress>, _key: u64) -> Result<()> {
        msg!("PDA confirmed to be derived with canonical bump: {}", ctx.accounts.data.key());
        Ok(())
    }
}

// Account validation struct for initializing the PDA account
#[derive(Accounts)]
#[instruction(key: u64)]
pub struct BumpSeed<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        seeds = [key.to_le_bytes().as_ref()],
        bump,  // Anchor automatically uses the canonical bump
        payer = payer,
        space = DISCRIMINATOR_SIZE + Data::INIT_SPACE
    )]
    pub data: Account<'info, Data>,

    pub system_program: Program<'info, System>
}

// Account validation struct for verifying the PDA address
#[derive(Accounts)]
#[instruction(key: u64)]
pub struct VerifyAddress<'info> {
    #[account(
        seeds = [key.to_le_bytes().as_ref()],
        bump = data.bump  // Use the stored bump, guaranteed to be canonical
    )]
    pub data: Account<'info, Data>,
}

// Data structure for the PDA account
#[account]
#[derive(InitSpace)]
pub struct Data {
    pub value: u64,
    pub bump: u8  // Stores the canonical bump
}
```

If you don't specify the bump on the `bump` constraint, Anchor will still use
`find_program_address` to derive the PDA using the canonical bump. As a
consequence, your instruction handler will incur a variable amount of compute
budget. Programs that are already at risk of exceeding their compute budget
should use this with care since there is a chance that the program's budget may
be occasionally and unpredictably exceeded.

On the other hand, if you only need to verify the address of a PDA passed in
without initializing an account, you'll be forced to either let Anchor derive
the canonical bump or expose your program to unecessary risks. In that case,
please use the canonical bump despite the slight mark against performance.

## Lab

To demonstrate the security exploits possible when you don't check for the
canonical bump, let's work with a program that lets each program user "claim"
rewards on time.

### 1. Setup

Start by getting the code on the
[`starter` branch of this repository](https://github.com/solana-developers/bump-seed-canonicalization/tree/starter).

Notice that there are two instruction handlers on the program and a single test
in the `tests` directory.

The instruction handlers on the program are:

1. `create_user_insecure`
2. `claim_insecure`

The `create_user_insecure` instruction handler simply creates a new account at a
PDA derived using the signer's public key and a passed-in bump.

The `claim_insecure` instruction handler mints 10 tokens to the user and then
marks the account's rewards as claimed so that they can't claim again.

However, the program doesn't explicitly check that the PDAs in question are
using the canonical bump.

Have a look at the program to understand what it does before proceeding.

### 2. Test Insecure Instruction Handlers

Since the instruction handlers don't explicitly require the `user` PDA to use
the canonical bump, an attacker can create multiple accounts per wallet and
claim more rewards than should be allowed.

The test in the `tests` directory creates a new keypair called `attacker` to
represent an attacker. It then loops through all possible bumps and calls
`create_user_insecure` and `claim_insecure`. By the end, the test expects that
the attacker has been able to claim rewards multiple times and has earned more
than the 10 tokens allotted per user.

```typescript
it("allows attacker to claim more than reward limit with insecure instruction handlers", async () => {
  try {
    const attacker = Keypair.generate();
    await airdropIfRequired(
      connection,
      attacker.publicKey,
      1 * LAMPORTS_PER_SOL,
      0.5 * LAMPORTS_PER_SOL,
    );
    const ataKey = await getAssociatedTokenAddress(mint, attacker.publicKey);

    let successfulClaimCount = 0;

    for (let i = 0; i < 256; i++) {
      try {
        const pda = anchor.web3.PublicKey.createProgramAddressSync(
          [attacker.publicKey.toBuffer(), Buffer.from([i])],
          program.programId,
        );
        await program.methods
          .createUserInsecure(i)
          .accounts({
            user: pda,
            payer: attacker.publicKey,
          })
          .signers([attacker])
          .rpc();
        await program.methods
          .claimInsecure(i)
          .accounts({
            user: pda,
            mint,
            payer: attacker.publicKey,
            userAta: ataKey,
            mintAuthority,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([attacker])
          .rpc();

        successfulClaimCount += 1;
      } catch (error) {
        if (
          error instanceof Error &&
          !error.message.includes(
            "Invalid seeds, address must fall off the curve",
          )
        ) {
          console.error(error);
        }
      }
    }

    const ata = await getAccount(connection, ataKey);

    console.log(
      `Attacker claimed ${successfulClaimCount} times and got ${Number(
        ata.amount,
      )} tokens`,
    );

    expect(successfulClaimCount).to.be.greaterThan(1);
    expect(Number(ata.amount)).to.be.greaterThan(10);
  } catch (error) {
    throw new Error(`Test failed: ${error.message}`);
  }
});
```

Run `anchor test` to see that this test passes, showing that the attacker is
successful. Since the test calls the instruction handlers for every valid bump,
it takes a bit to run, so be patient.

```bash
  Bump seed canonicalization
Attacker claimed 121 times and got 1210 tokens
    ✔ allows attacker to claim more than reward limit with insecure instructions (119994ms)
```

### 3. Create Secure Instruction Handler

Let's demonstrate patching the vulnerability by creating two new instruction
handlers:

1. `create_user_secure`
2. `claim_secure`

Before we write the account validation or instruction handler logic, let's
create a new user type, `UserSecure`. This new type will add the canonical bump
as a field on the struct.

```rust
// Secure user account structure
#[account]
#[derive(InitSpace)]
pub struct UserSecure {
    pub auth: Pubkey,
    pub bump: u8,
    pub rewards_claimed: bool,
}
```

Next, let's create account validation structs for each of the new instruction
handlers. They'll be very similar to the insecure versions but will let Anchor
handle the derivation and deserialization of the PDAs.

```rust
// Account validation struct for securely creating a user account
#[derive(Accounts)]
pub struct CreateUserSecure<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = DISCRIMINATOR_SIZE + UserSecure::INIT_SPACE,
        seeds = [payer.key().as_ref()],
        bump
    )]
    pub user: Account<'info, UserSecure>,
    pub system_program: Program<'info, System>,
}

// Account validation struct for secure claiming of rewards
#[derive(Accounts)]
pub struct SecureClaim<'info> {
    #[account(
        mut,
        seeds = [payer.key().as_ref()],
        bump = user.bump,
        constraint = !user.rewards_claimed @ ClaimError::AlreadyClaimed,
        constraint = user.auth == payer.key()
    )]
    pub user: Account<'info, UserSecure>,
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer
    )]
    pub user_ata: Account<'info, TokenAccount>,
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    /// CHECK: This is the mint authority PDA, checked by seeds constraint
    #[account(seeds = [b"mint"], bump)]
    pub mint_authority: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}
```

Finally, let's implement the instruction handler logic for the two new
instruction handlers. The `create_user_secure` instruction handler simply needs
to set the `auth`, `bump` and `rewards_claimed` fields on the `user` account
data.

```rust
// Secure instruction to create a user account
pub fn create_user_secure(ctx: Context<CreateUserSecure>) -> Result<()> {
    ctx.accounts.user.set_inner(UserSecure {
        auth: ctx.accounts.payer.key(),
        bump: ctx.bumps.user,
        rewards_claimed: false,
    });
    Ok(())
}
```

The `claim_secure` instruction handler needs to mint 10 tokens to the user and
set the `user` account's `rewards_claimed` field to `true`.

```rust
// Secure instruction to claim rewards
pub fn claim_secure(ctx: Context<SecureClaim>) -> Result<()> {
    // Mint tokens to the user's associated token account
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),
                to: ctx.accounts.user_ata.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
            },
            &[&[b"mint", &[ctx.bumps.mint_authority]]],
        ),
        10,
    )?;

    // Mark rewards as claimed
    ctx.accounts.user.rewards_claimed = true;

    Ok(())
}
```

### 4. Test Secure Instruction Handlers

Let's go ahead and write a test to show that the attacker can no longer claim
more than once using the new instruction handlers.

Notice that if you start to loop through using multiple PDAs like the old test,
you can't even pass the non-canonical bump to the instruction handlers. However,
you can still loop through using the various PDAs and at the end check that only
1 claim happened for a total of 10 tokens. Your final test will look something
like this:

```typescript
it("allows attacker to claim only once with secure instruction handlers", async () => {
  try {
    const attacker = Keypair.generate();
    await airdropIfRequired(
      connection,
      attacker.publicKey,
      1 * LAMPORTS_PER_SOL,
      0.5 * LAMPORTS_PER_SOL,
    );
    const ataKey = await getAssociatedTokenAddress(mint, attacker.publicKey);
    const [userPDA] = anchor.web3.PublicKey.findProgramAddressSync(
      [attacker.publicKey.toBuffer()],
      program.programId,
    );

    await program.methods
      .createUserSecure()
      .accounts({
        payer: attacker.publicKey,
        user: userPDA,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([attacker])
      .rpc();

    await program.methods
      .claimSecure()
      .accounts({
        payer: attacker.publicKey,
        user: userPDA,
        userAta: ataKey,
        mint,
        mintAuthority,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([attacker])
      .rpc();

    let successfulClaimCount = 1;

    for (let i = 0; i < 256; i++) {
      try {
        const pda = anchor.web3.PublicKey.createProgramAddressSync(
          [attacker.publicKey.toBuffer(), Buffer.from([i])],
          program.programId,
        );
        await program.methods
          .createUserSecure()
          .accounts({
            user: pda,
            payer: attacker.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([attacker])
          .rpc();

        await program.methods
          .claimSecure()
          .accounts({
            payer: attacker.publicKey,
            user: pda,
            userAta: ataKey,
            mint,
            mintAuthority,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          })
          .signers([attacker])
          .rpc();

        successfulClaimCount += 1;
      } catch (error) {
        if (
          error instanceof Error &&
          !error.message.includes("Error Number: 2006") &&
          !error.message.includes(
            "Invalid seeds, address must fall off the curve",
          )
        ) {
          // Comment console error logs to see the test outputs properly
          console.error(error);
        }
      }
    }

    const ata = await getAccount(connection, ataKey);

    console.log(
      `Attacker claimed ${successfulClaimCount} times and got ${Number(
        ata.amount,
      )} tokens`,
    );

    expect(Number(ata.amount)).to.equal(10);
    expect(successfulClaimCount).to.equal(1);
  } catch (error) {
    throw new Error(`Test failed: ${error.message}`);
  }
});
```

```bash
  Bump seed canonicalization
Attacker claimed 119 times and got 1190 tokens
    ✔ allows attacker to claim more than reward limit with insecure instruction handlers (117370ms)
Attacker claimed 1 times and got 10 tokens
    ✔ allows attacker to claim only once with secure instruction handlers (16362ms)
```

If you use Anchor for all of the PDA derivations, this particular exploit is
pretty simple to avoid. However, if you end up doing anything "non-standard," be
careful to design your program to explicitly use the canonical bump!

If you want to take a look at the final solution code you can find it on the
[`solution` branch of the same repository](https://github.com/solana-developers/bump-seed-canonicalization/tree/solution).

## Challenge

Just as with other lessons in this unit, your opportunity to practice avoiding
this security exploit lies in auditing your own or other programs.

Take some time to review at least one program and ensure that all PDA
derivations and checks are using the canonical bump.

Remember, if you find a bug or exploit in somebody else's program, please alert
them! If you find one in your own program, be sure to patch it right away.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=d3f6ca7a-11c8-421f-b7a3-d6c08ef1aa8b)!
</Callout>
