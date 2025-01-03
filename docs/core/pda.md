---
title: Program Derived Address (PDA)
sidebarLabel: Program Derived Address
sidebarSortOrder: 5
description:
  Learn about Program Derived Addresses (PDAs) on Solana - deterministic account
  addresses that enable secure program signing. Understand PDA derivation,
  canonical bumps, and how to create PDA accounts.
---

Program Derived Addresses (PDAs) provide developers on Solana with two main use
cases:

- **Deterministic Account Addresses**: PDAs provide a mechanism to
  deterministically derive an address using a combination of optional "seeds"
  (predefined inputs) and a specific program ID.
- **Enable Program Signing**: The Solana runtime enables programs to "sign" for
  PDAs which are derived from its program ID.

You can think of PDAs as a way to create hashmap-like structures on-chain from a
predefined set of inputs (e.g. strings, numbers, and other account addresses).
This makes them particularly useful for organizing and accessing program state in a
predictable manner.

The benefit of this approach is that it eliminates the need to keep track of an
exact address. Instead, you simply need to recall the specific inputs used for
its derivation, making it more maintainable and less error-prone.

![Program Derived Address](/assets/docs/core/pda/pda.svg)

It's important to understand that simply deriving a Program Derived Address
(PDA) does not automatically create an on-chain account at that address.
Accounts with a PDA as the on-chain address must be explicitly created through
the program used to derive the address. Think of deriving a PDA like finding a
plot of land on a map - having the coordinates doesn't mean there's a building
there yet.

> This section will cover the details of deriving PDAs. The details on how
> programs use PDAs for signing will be addressed in the section on
> [Cross Program Invocations (CPIs)](/docs/core/cpi) as it requires context
> for both concepts.

## Key Points

- PDAs are addresses derived deterministically using a combination of
  user-defined seeds, a bump seed, and a program's ID.

- PDAs are addresses that fall off the Ed25519 curve and have no corresponding
  private key, making them secure for program-controlled accounts.

- Solana programs can programmatically "sign" on behalf of PDAs that are derived
  using its program ID, enabling secure cross-program interactions.

- Deriving a PDA does not automatically create an on-chain account - it only
  provides the address where an account can be created.

- An account using a PDA as its address must be explicitly created through a
  dedicated instruction within a Solana program.

## What is a PDA

PDAs are addresses that are deterministically derived and look like standard
public keys, but have no associated private keys. This means that no external
user can generate a valid signature for the address. However, the Solana runtime
enables programs to programmatically "sign" for PDAs without needing a private
key.

For context, Solana
[Keypairs](https://docs.solana.com/developing/programming-model/accounts#keypair) 
are points on the Ed25519 curve (elliptic-curve cryptography) which have a
public key and corresponding private key. We often use public keys as the unique
IDs for new on-chain accounts and private keys for signing.

![On Curve Address](/assets/docs/core/pda/address-on-curve.svg)

A PDA is a point that is intentionally derived to fall off the Ed25519 curve
using a predefined set of inputs. A point that is not on the Ed25519 curve does
not have a valid corresponding private key and cannot be used for cryptographic
operations (signing).

A PDA can then be used as the address (unique identifier) for an on-chain
account, providing a method to easily store, map, and fetch program state.

![Off Curve Address](/assets/docs/core/pda/address-off-curve.svg)

## How to derive a PDA

The derivation of a PDA requires 3 inputs:

- **Optional seeds**: Predefined inputs (e.g. string, number, other account
  addresses) used to derive a PDA. These inputs are converted to a buffer of
  bytes.
- **Bump seed**: An additional input (with a value between 255-0) that is used
  to guarantee that a valid PDA (off curve) is generated. This bump seed
  (starting with 255) is appended to the optional seeds when generating a PDA to
  "bump" the point off the Ed25519 curve.
- **Program ID**: The address of the program the PDA is derived from. This is
  also the program that can "sign" on behalf of the PDA

![PDA Derivation](/assets/docs/core/pda/pda-derivation.svg)

The examples below include links to Solana Playground, where you can run the
examples in an in-browser editor.

### FindProgramAddress

To derive a PDA, we can use the
[`findProgramAddressSync`](https://solana-labs.github.io/solana-web3.js/classes/PublicKey.html#findProgramAddressSync)
method from [`@solana/web3.js`](https://www.npmjs.com/package/@solana/web3.js).
There are equivalents of this function in other programming languages (e.g.
[Rust](https://docs.rs/solana-program/latest/solana_program/pubkey/struct.Pubkey.html#method.find_program_address)),
but in this section, we will walk through examples using Javascript.

When using the `findProgramAddressSync` method, we pass in:

- the predefined optional seeds converted to a buffer of bytes, and
- the program ID (address) used to derive the PDA

Once a valid PDA is found, `findProgramAddressSync` returns both the address
(PDA) and bump seed used to derive the PDA.

Here's a simple example that derives a PDA without providing any optional seeds:

```typescript
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("11111111111111111111111111111111");

const [PDA, bump] = PublicKey.findProgramAddressSync([], programId);

console.log(`PDA: ${PDA}`);
console.log(`Bump: ${bump}`);
```

You can run this example on
[Solana Playground](https://beta.solpg.io/). The PDA and
bump seed output will always be the same:

```
PDA: Cu7NwqCXSmsR5vgGA3Vw9uYVViPi3kQvkbKByVQ8nPY9
Bump: 255
```

Let's look at another example that adds an optional seed "helloWorld":

```typescript
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("11111111111111111111111111111111");
const string = "helloWorld";

const [PDA, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from(string)],
  programId,
);

console.log(`PDA: ${PDA}`);
console.log(`Bump: ${bump}`);
```

The output will be:

```
PDA: 46GZzzetjCURsdFPb7rcnspbEMnCBXe9kpjrsZAkKb6X
Bump: 254
```

Note that the bump seed is 254. This means that 255 derived a point on the
Ed25519 curve, and is not a valid PDA.

The bump seed returned by `findProgramAddressSync` is the first value (between
255-0) for the given combination of optional seeds and program ID that derives a
valid PDA.

> This first valid bump seed is referred to as the "canonical bump". For program
> security, it is recommended to only use the canonical bump when working with
> PDAs.

### CreateProgramAddress

Under the hood, `findProgramAddressSync` will iteratively append an additional
bump seed (nonce) to the seeds buffer and call the
[`createProgramAddressSync`](https://solana-labs.github.io/solana-web3.js/classes/PublicKey.html#createProgramAddressSync)
method. The bump seed starts with a value of 255 and is decreased by 1 until a
valid PDA (off curve) is found.

Here's how to use `createProgramAddressSync` with an explicit bump seed:

```typescript
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("11111111111111111111111111111111");
const string = "helloWorld";
const bump = 254;

const PDA = PublicKey.createProgramAddressSync(
  [Buffer.from(string), Buffer.from([bump])],
  programId,
);

console.log(`PDA: ${PDA}`);
```

### Canonical Bump

The "canonical bump" refers to the first bump seed (starting from 255 and
decrementing by 1) that derives a valid PDA. For program security, it is
recommended to only use PDAs derived from a canonical bump.

Here's an example that demonstrates finding all valid PDAs for a given set of seeds:

```typescript
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("11111111111111111111111111111111");
const string = "helloWorld";

// Loop through all bump seeds for demonstration
for (let bump = 255; bump >= 0; bump--) {
  try {
    const PDA = PublicKey.createProgramAddressSync(
      [Buffer.from(string), Buffer.from([bump])],
      programId,
    );
    console.log("bump " + bump + ": " + PDA);
  } catch (error) {
    console.log("bump " + bump + ": Invalid - falls on curve");
  }
}
```

<Callout type="warning">
  When building Solana programs, it is crucial to include security checks that
  validate a PDA passed to the program is derived using the canonical bump.
  Failing to do so may introduce vulnerabilities that allow for unexpected
  accounts to be provided to a program.
</Callout>

## Create PDA Accounts

Here's a complete example using Anchor that demonstrates how to create and
initialize an account using a PDA:

```rust
use anchor_lang::prelude::*;

declare_id!("75GJVCJNhaukaa2vCCqhreY31gaphv7XTScBChmr1ueR");

#[program]
pub mod pda_account {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let account_data = &mut ctx.accounts.pda_account;
        // Store the address of the user
        account_data.user = *ctx.accounts.user.key;
        // Store the canonical bump
        account_data.bump = ctx.bumps.pda_account;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [b"data", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + DataAccount::INIT_SPACE
    )]
    pub pda_account: Account<'info, DataAccount>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct DataAccount {
    pub user: Pubkey,
    pub bump: u8,
}
```

And here's how to interact with this program using TypeScript:

```typescript
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

// First, derive the PDA
const [PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("data"), user.publicKey.toBuffer()],
  program.programId
);

// Then create the account
const tx = await program.methods
  .initialize()
  .accounts({
    user: user.publicKey,
    pdaAccount: PDA,
  })
  .rpc();

// Finally, fetch the created account
const pdaAccount = await program.account.dataAccount.fetch(PDA);
console.log(JSON.stringify(pdaAccount, null, 2));
```

## Best Practices

1. Always use the canonical bump when creating PDA accounts
2. Validate PDAs in your program instructions
3. Keep your seeds consistent and well-documented
4. Consider using constants for seed strings
5. Include proper error handling for PDA derivation

## Additional Resources

- [Solana Cookbook - PDAs](https://solanacookbook.com/core-concepts/pdas.html)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Program Security Guidelines](https://docs.solana.com/developing/programming-model/security)
