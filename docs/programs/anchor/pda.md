---
title: PDAs with Anchor
sidebarLabel: PDAs with Anchor
sidebarSortOrder: 4
---

[Program Derived Addresses (PDA)](/docs/core/pda) refer to a feature of Solana
development that allows you to create a unique address derived deterministically
from optional pre-defined inputs (seeds) and a program ID.

This section will cover basic examples of how to use PDAs in an Anchor program.

## Anchor PDA Constraints

When using PDAs in an Anchor program, you generally use Anchor's account
constraints to define the seeds that are used to derive the PDA. Defining the
seeds serves as a security check to ensure that correct address is derived.

The constraints used to define the PDA seeds include:

- `seeds`: The optional seeds used to derive the PDA
- `bump`: The bump seed used to derive the PDA
- `seeds::program` - The program ID used to derive the PDA address. This
  constraint is only used to derive a PDA where the program ID is not the
  current program.

The `seeds` and `bump` constraints are required to be used together.

### Usage Examples

<!-- prettier-ignore -->
<Tabs items={['seeds', 'bump', 'seeds::program']}>
<Tab value="seeds">

The `seeds` constraint specifies the optional values used to derive the PDA.

#### No Optional Seeds

- Use an empty array `[]` to define a PDA without optional seeds.

```rs
#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(
        seeds = [],
        bump,
    )]
    pub pda_account: SystemAccount<'info>,
}
```

#### Single Static Seed

- Specify optional seeds in the `seeds` constraint.

```rs
#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(
        seeds = [b"hello_world"],
        bump,
    )]
    pub pda_account: SystemAccount<'info>,
}
```

#### Multiple Seeds and Account References

- Multiple seeds can be specified in the `seeds` constraint. The `seeds`
  constraint can also reference other account addresses or account data.

```rs
#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"hello_world", signer.key().as_ref()],
        bump,
    )]
    pub pda_account: SystemAccount<'info>,
}
```

The example above uses both a static seed (`b"hello_world"`) and a dynamic seed
(the signer's public key).

</Tab>
<Tab value="bump">

The `bump` constraint specifies the bump seed used to derive the PDA.

#### Automatic Bump Calculation

When using the `bump` constraint without an value, the bump is automatically
calculated each time the instruction is invoked.

```rs
#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(
        seeds = [b"hello_world"],
        bump,
    )]
    pub pda_account: SystemAccount<'info>,
}
```

#### Specify Bump Value

You can specify the bump seed value, which can be stored on an account. This
assumes that the account is already created and the bump seed is stored as a
field in the account's data.

```rs
#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(
        seeds = [b"hello_world"],
        bump = pda_account.bump_seed,
    )]
    pub pda_account: Account<'info, CustomAccount>,
}

#[account]
pub struct CustomAccount {
    pub bump_seed: u8,
}
```

Specifying the bump seed value can reduce Compute Units (CU) usage when the
instruction is invoked. This is because the program does not need to derive the
PDA to determine the correct bump. The saved bump value can be stored on the
account itself or another account.

</Tab>
<Tab value="seeds::program">

The `seeds::program` constraint specifies the program ID used to derive the PDA.
This constraint is only used when deriving a PDA for a program other than the
current one.

Use this constraint when your instruction needs to interact with PDA accounts
created by another program.

```rs
#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(
        seeds = [b"hello_world"],
        bump,
        seeds::program = other_program.key(),
    )]
    pub pda_account: SystemAccount<'info>,
    pub other_program: Program<'info, OtherProgram>,
}
```

</Tab>
</Tabs>

The `init` constraint is commonly used with `seeds` and `bump` to create a new
account with an address that is a PDA. Under the hood, the `init` constraint
invokes the System Program to create the account.

```rs
#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        seeds = [b"hello_world", signer.key().as_ref()],
        bump,
        payer = signer,
        space = 8 + 1,
    )]
    pub pda_account: Account<'info, CustomAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct CustomAccount {
    pub bump_seed: u8,
}
```

## PDA seeds in IDL

Program Derived Address (PDA) seeds defined in the `seeds` constraint are
included in the program's IDL file. This enables the Anchor client to
automatically resolve accounts using the seeds specified in the IDL when
constructing an instruction.

This example below demonstrates how to define a PDA with both static and dynamic
seeds in an Anchor program, showing the relationship between the program, IDL,
and client.

<!-- prettier-ignore -->
<Tabs items={['Program', 'IDL', 'Client']}>
<Tab value="Program">

The program defines a `pda_account` using a static seed (`b"hello_world"`) and
the signer's public key as a dynamic seed.

```rs {18} /signer/
use anchor_lang::prelude::*;

declare_id!("BZLiJ62bzRryYp9mRobz47uA66WDgtfTXhhgM25tJyx5");

#[program]
mod hello_anchor {
    use super::*;
    pub fn test_instruction(ctx: Context<InstructionAccounts>) -> Result<()> {
        msg!("PDA: {}", ctx.accounts.pda_account.key());
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InstructionAccounts<'info> {
    pub signer: Signer<'info>,
    #[account(
        seeds = [b"hello_world", signer.key().as_ref()],
        bump,
    )]
    pub pda_account: SystemAccount<'info>,
}
```

</Tab>
<Tab value="IDL">

The program's IDL file includes the PDA seeds defined in the `seeds` constraint.

- The static seed `b"hello_world"` is converted to byte values.
- The dynamic seed is specified as an account reference to the signer.

```json {22-29}
{
  "address": "BZLiJ62bzRryYp9mRobz47uA66WDgtfTXhhgM25tJyx5",
  "metadata": {
    "name": "hello_anchor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "test_instruction",
      "discriminator": [33, 223, 61, 208, 32, 193, 201, 79],
      "accounts": [
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "pda_account",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [104, 101, 108, 108, 111, 95, 119, 111, 114, 108, 100]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        }
      ],
      "args": []
    }
  ]
}
```

</Tab>
<Tab value="Client">

The Anchor client can automatically resolve the PDA address using the IDL file.
This means the PDA does not need to be explicitly specified when the instruction
is built.

```ts {13}
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";

describe("hello_anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.testInstruction().rpc();
    console.log("Your transaction signature", tx);
  });
});
```

When the instruction is invoked, the PDA is printed to program logs as defined
in the program instruction.

```{3}
Program BZLiJ62bzRryYp9mRobz47uA66WDgtfTXhhgM25tJyx5 invoke [1]
Program log: Instruction: TestInstruction
Program log: PDA: 3Hikt5mpKaSS4UNA5Du1TZJ8tp4o8VC8YWW6X9vtfVnJ
Program BZLiJ62bzRryYp9mRobz47uA66WDgtfTXhhgM25tJyx5 consumed 18505 of 200000 compute units
Program BZLiJ62bzRryYp9mRobz47uA66WDgtfTXhhgM25tJyx5 success
```

</Tab>
</Tabs>
