---
title: IDL File
description: IDL File
sidebarLabel: IDL File
sidebarSortOrder: 2
---

The `anchor build` command generates an Interface Description Language (IDL)
JSON file which can be found at `/target/idl/<program-name>.json`. This IDL
file:

- Provides a standardized format for describing the program's instructions and
  accounts
- Is used to generate the client to interact with the program

The code snippets below highlights how the program, IDL, and client relate to
each other.

## Program Instructions

The `instructions` array in the IDL corresponds with the instructions on the
program and specify the required accounts and parameters for each instruction.

<!-- prettier-ignore -->
<Tabs items={['Program', 'IDL', 'Client']}>
<Tab value="Program">

```rust {8-12, 15-22}
use anchor_lang::prelude::*;

declare_id!("BYFW1vhC1ohxwRbYoLbAWs86STa25i9sD5uEusVjTYNd");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
}
```

</Tab>
<Tab value="IDL">

```json filename="JSON" {11, 14-27, 30-33}
{
  "address": "BYFW1vhC1ohxwRbYoLbAWs86STa25i9sD5uEusVjTYNd",
  "metadata": {
    "name": "hello_anchor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237],
      "accounts": [
        {
          "name": "new_account",
          "writable": true,
          "signer": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "NewAccount",
      "discriminator": [176, 95, 4, 118, 91, 177, 125, 232]
    }
  ],
  "types": [
    {
      "name": "NewAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "u64"
          }
        ]
      }
    }
  ]
}
```

</Tab>
<Tab value="Client">

```ts {19-26}
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";
import { Keypair } from "@solana/web3.js";
import assert from "assert";

describe("hello_anchor", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;

  it("initialize", async () => {
    // Generate keypair for the new account
    const newAccountKp = new Keypair();

    // Send transaction
    const data = new BN(42);
    const transactionSignature = await program.methods
      .initialize(data)
      .accounts({
        newAccount: newAccountKp.publicKey,
        signer: wallet.publicKey,
      })
      .signers([newAccountKp])
      .rpc();

    // Fetch the created account
    const newAccount = await program.account.newAccount.fetch(
      newAccountKp.publicKey,
    );

    console.log("Transaction signature: ", transactionSignature);
    console.log("On-chain data is:", newAccount.data.toString());
    assert(data.eq(newAccount.data));
  });
});
```

</Tab>
</Tabs>

## Program Accounts

The `accounts` array in the IDL corresponds with structs in the program
annotated with the `#[account]` macro. These structs define the data structure
for information stored in accounts that the program can create.

In other words, when the program creates an account, the account's AccountInfo
data field will store and serialize this data structure, which can later be
deserialized to read the data back into the same structure.

<!-- prettier-ignore -->
<Tabs items={['Program', 'IDL', 'Client']}>
<Tab value="Program">

```rust {24-27}
use anchor_lang::prelude::*;

declare_id!("BYFW1vhC1ohxwRbYoLbAWs86STa25i9sD5uEusVjTYNd");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64,
}
```

</Tab>
<Tab value="IDL">

```json filename="JSON" {39, 45-54}
{
  "address": "BYFW1vhC1ohxwRbYoLbAWs86STa25i9sD5uEusVjTYNd",
  "metadata": {
    "name": "hello_anchor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237],
      "accounts": [
        {
          "name": "new_account",
          "writable": true,
          "signer": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "NewAccount",
      "discriminator": [176, 95, 4, 118, 91, 177, 125, 232]
    }
  ],
  "types": [
    {
      "name": "NewAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "u64"
          }
        ]
      }
    }
  ]
}
```

</Tab>
<Tab value="Client">

```ts {29-31}
import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { HelloAnchor } from "../target/types/hello_anchor";
import { Keypair } from "@solana/web3.js";
import assert from "assert";

describe("hello_anchor", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const wallet = provider.wallet as anchor.Wallet;
  const program = anchor.workspace.HelloAnchor as Program<HelloAnchor>;

  it("initialize", async () => {
    // Generate keypair for the new account
    const newAccountKp = new Keypair();

    // Send transaction
    const data = new BN(42);
    const transactionSignature = await program.methods
      .initialize(data)
      .accounts({
        newAccount: newAccountKp.publicKey,
        signer: wallet.publicKey,
      })
      .signers([newAccountKp])
      .rpc();

    // Fetch the created account
    const newAccount = await program.account.newAccount.fetch(
      newAccountKp.publicKey,
    );

    console.log("Transaction signature: ", transactionSignature);
    console.log("On-chain data is:", newAccount.data.toString());
    assert(data.eq(newAccount.data));
  });
});
```

</Tab>
</Tabs>

## Discriminators

Anchor assigns a unique 8-byte discriminator to each instruction and account
type in a program. These discriminators serve as identifiers to distinguish
between different instructions or account types.

Note that when working with Anchor, you typically won't need to interact
directly with these discriminators. This section is primarily to provide context
on how the discriminator is generated and used.

The discriminator is generated using the first 8 bytes of the Sha256 hash of a
prefix combined with the instruction or account name. As of Anchor v0.30, these
discriminators are included in the IDL file.

<!-- prettier-ignore -->
<Tabs items={['Instructions', 'Accounts']}>
<Tab value="Instructions">

The instruction discriminator is used by the program to determine which specific
instruction to execute when called.

When an Anchor program instruction is invoked, the discriminator is included as
the first 8 bytes of the instruction data. This is done automatically by the
Anchor client.

```json filename="IDL"  {4}
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237],
       ...
    }
  ]
```

The discriminator for an instruction is the first 8 bytes of the Sha256 hash of
the prefix `global` plus the instruction name.

For example:

```
sha256("global:initialize")
```

Hexadecimal output:

```
af af 6d 1f 0d 98 9b ed d4 6a 95 07 32 81 ad c2 1b b5 e0 e1 d7 73 b2 fb bd 7a b5 04 cd d4 aa 30
```

The first 8 bytes are used as the discriminator for the instruction.

```
af = 175
af = 175
6d = 109
1f = 31
0d = 13
98 = 152
9b = 155
ed = 237
```

You can find the implementation of the discriminator generation in the Anchor
codebase
[here](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/syn/src/codegen/program/common.rs#L5-L19),
which is used
[here](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/syn/src/codegen/program/instruction.rs#L27).

</Tab>
<Tab value="Accounts">

The account discriminator is used to identify the specific account type when
deserializing on-chain data and is set when the account is created.

```json filename="IDL"  {4}
  "accounts": [
    {
      "name": "NewAccount",
      "discriminator": [176, 95, 4, 118, 91, 177, 125, 232]
    }
  ]
```

The discriminator for an account is the first 8 bytes of the Sha256 hash of the
prefix 'account' plus the account name.

For example:

```
sha256("account:NewAccount")
```

Hexadecimal output:

```
b0 5f 04 76 5b b1 7d e8 a1 93 57 2a d3 5e b1 ae e5 f0 69 e2 09 7e 5c d2 64 56 55 2a cb 4a e9 57
```

The first 8 bytes are used as the discriminator for the account.

```
b0 = 176
5f = 95
04 = 4
76 = 118
5b = 91
b1 = 177
7d = 125
e8 = 232
```

You can find the implementation of the discriminator generation in the Anchor
codebase
[here](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/account/src/lib.rs#L101-L117).

Note that different programs using identical account names will generate the
same discriminator. When deserializing account data, Anchor programs will also
check an account is owned by the expected program for a specified account type.

</Tab>
</Tabs>
