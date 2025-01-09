---
title: IDL File
description:
  Learn about the Interface Definition Language (IDL) file in Anchor, its
  purpose, benefits, and how it simplifies program-client interactions
sidebarLabel: IDL File
sidebarSortOrder: 2
---

An Interface Definition Language (IDL) file provides a standardized JSON file
describing the program's instructions and accounts. This file simplifies the
process of integrating your on-chain program with client applications.

Key Benefits of the IDL:

- Standardization: Provides a consistent format for describing the program's
  instructions and accounts
- Client Generation: Used to generate client code to interact with the program

The `anchor build` command generates an IDL file located at
`/target/idl/<program-name>.json`.

The code snippets below highlights how the program, IDL, and client relate to
each other.

## Program Instructions

The `instructions` array in the IDL corresponds directly to the instructions
defined in your program. It specifies the required accounts and parameters for
each instruction.

<!-- prettier-ignore -->
<Tabs items={['Program', 'IDL', 'Client']}>
<Tab value="Program">

The program below includes an `initialize` instruction, specifying the accounts
and parameters it requires.

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

The generated IDL file includes the instruction in a standardized JSON format,
including its name, accounts, arguments, and discriminator.

```json filename="JSON" {11-12, 14-27, 30-33}
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

The IDL file is then used to generate a client for interacting with the program,
simplifying the process of invoking the program instruction.

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

The `accounts` array in the IDL corresponds to the structs in a program
annotated with the `#[account]` macro. These structs define the data stored in
accounts created by the program.

<!-- prettier-ignore -->
<Tabs items={['Program', 'IDL', 'Client']}>
<Tab value="Program">

The program below defines a `NewAccount` struct with a single `data` field of
type `u64`.

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

The generated IDL file includes the account in a standardized JSON format,
including its name, discriminator, and fields.

```json filename="JSON" {39-40, 45-54}
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

The IDL file is then used to generate a client for interacting with the program,
simplifying the process of fetching and deserializing account data.

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

Anchor assigns a unique 8 byte discriminator to each instruction and account
type in a program. These discriminators serve as identifiers to distinguish
between different instructions or account types.

The discriminator is generated using the first 8 bytes of the Sha256 hash of a
prefix combined with the instruction or account name. As of Anchor v0.30, these
discriminators are included in the IDL file.

Note that when working with Anchor, you typically won't need to interact
directly with these discriminators. This section is primarily to provide context
on how the discriminator is generated and used.

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
prefix `account` plus the account name.

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
<Tab value="Events">

The event discriminator is used to identify the specific event type when
deserializing on-chain data on event emission.

```json filename="IDL"  {4}
  "events": [
    {
      "name": "NewEvent",
      "discriminator": [113, 21, 185, 70, 164, 99, 232, 201]
    }
  ]
```

The discriminator for an event is the first 8 bytes of the Sha256 hash of the
prefix `event` plus the event name.

For example:

```
sha256("event:NewEvent")
```

Hexadecimal output:

```
71 15 b9 46 a4 63 e8 c9 2a 3c 4d 83 87 16 cd 9b 66 28 cb e2 cb 7c 5d 70 59 f3 42 2b dc 35 03 53
```

The first 8 bytes are used as the discriminator for the account.

Hex to decimal gives us:

```
71 = 113
15 = 21
b9 = 185
46 = 70
a4 = 164
63 = 99
e8 = 232
c9 = 201
```

You can find the implementation of the discriminator generation in the Anchor
codebase
[here](https://github.com/coral-xyz/anchor/blob/v0.30.1/lang/attribute/event/src/lib.rs#L23-L27).

Note that different programs using identical event names will generate the same
discriminator. When deserializing event data, Anchor programs will also check an
event is owned by the expected program for a specified event type.

</Tab>
</Tabs>
