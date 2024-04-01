---
title: "Tokens on Solana"
sidebarSortOrder: 6
---

// TODO add example snippets

This section will cover the basics of how tokens are represented on Solana. You
can think of tokens as a counter in a database that also keeps track of the
ownership for each unit of the count.

On Solana, these are referred to as SPL
([Solana Program Library](https://github.com/solana-labs/solana-program-library))
Tokens.

- The [Token Program](/docs/core/tokens#token-program) stores all the
  instruction logic for interacting with tokens on the network (both fungible
  and non-fungible).

- A [Mint Account](/docs/core/tokens#mint-account) is a global counter that
  represents a specific type of token, and stores global metadata about the
  token such as the total supply and mint authority (address authorized to
  create new units of a token).

- A [Token Account](/docs/core/tokens#token-account) is an individual counter
  that keeps track of how many units of a specific type of token (mint account)
  are owned by a specific address.

<Callout>
  There are currently two versions of the Token Program. The original [Token Program](https://github.com/solana-labs/solana-program-library/tree/master/token/program) and the [Token Extensions Program](https://github.com/solana-labs/solana-program-library/tree/master/token/program-2022) (Token2022). The Token Extensions
  Program functions the same as the original Token Program, but with additional
  features and improvements. The Token Extensions Program is the recommended
  version to use for creating new tokens (mint accounts).
</Callout>

## Token Program

The
[Token Program](https://github.com/solana-labs/solana-program-library/tree/master/token/program)
stores all the instruction logic for interacting with tokens on the network
(both fungible and non-fungible). All tokens on Solana are effectively
[data accounts](/docs/core/accounts#data-account) owned by the Token Program.

You can find the full list of Token Program instructions
[here](https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/instruction.rs).

![Token Program](/assets/docs/core/tokens/token-program.svg)

A few commonly used instructions include:

- `InitializeMint`: Create a new mint account to represent a new type of token.
- `InitializeAccount`: Create a new token account to hold units of a specific
  type of token (mint).
- `MintTo`: Create new units of a specific type of token and add them to a token
  account. This increases the supply of the token and can only be done by the
  mint authority of the mint account.
- `Transfer`: Transfer units of a specific type of token from one token account
  to another.

## Mint Account

Tokens on Solana are uniquely identified by the address of a “Mint Account”
owned by the Token Program. This account is effectively a global counter for a
specific token, and stores data such as:

- Supply: Total supply of the token
- Decimals: Decimal precision of the token
- Mint authority: The account authorized to create new units of the token, thus
  increasing the supply
- Freeze authority: The account authorized to freeze tokens from being
  transferred from "token accounts"

![Mint Account](/assets/docs/core/tokens/mint-account.svg)

The full details stored on each Mint Account include the following
[data](https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/state.rs#L18-L32):

```rust
pub struct Mint {
    /// Optional authority used to mint new tokens. The mint authority may only
    /// be provided during mint creation. If no mint authority is present
    /// then the mint has a fixed supply and no further tokens may be
    /// minted.
    pub mint_authority: COption<Pubkey>,
    /// Total supply of tokens.
    pub supply: u64,
    /// Number of base 10 digits to the right of the decimal place.
    pub decimals: u8,
    /// Is `true` if this structure has been initialized
    pub is_initialized: bool,
    /// Optional authority to freeze token accounts.
    pub freeze_authority: COption<Pubkey>,
}
```

For reference, here is a Solana Explorer link to the USDC
[Mint Account](https://explorer.solana.com/address/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v).

## Token Account

To hold units of a specific token, another type of data account owned by the
Token Program must be created. This account is referred to as a "Token Account".

The most commonly referenced data stored on the Token Account include the
following:

- Mint: The type of token the Token Account holds units of
- Owner: The account authorized to transfer tokens out of the Token Account
- Amount: Units of the token the Token Account currently holds

![Token Account](/assets/docs/core/tokens/token-account.svg)

The full details stored on each Token Account includes the following
[data](https://github.com/solana-labs/solana-program-library/blob/master/token/program/src/state.rs#L89-L110):

```rust
pub struct Account {
    /// The mint associated with this account
    pub mint: Pubkey,
    /// The owner of this account.
    pub owner: Pubkey,
    /// The amount of tokens this account holds.
    pub amount: u64,
    /// If `delegate` is `Some` then `delegated_amount` represents
    /// the amount authorized by the delegate
    pub delegate: COption<Pubkey>,
    /// The account's state
    pub state: AccountState,
    /// If is_native.is_some, this is a native token, and the value logs the
    /// rent-exempt reserve. An Account is required to be rent-exempt, so
    /// the value is used by the Processor to ensure that wrapped SOL
    /// accounts do not drop below this threshold.
    pub is_native: COption<u64>,
    /// The amount delegated
    pub delegated_amount: u64,
    /// Optional authority to close the account.
    pub close_authority: COption<Pubkey>,
}
```

For a wallet to own units of a certain token, it needs to create a token account
for a specific type of token (mint) that designates the wallet as the owner of
the token account. A wallet can create multiple token accounts for the same type
of token, but each token account can only be owned by one wallet and hold units
of one type of token.

![Account Relationship](/assets/docs/core/tokens/token-account-relationship.svg)

Note that each Token Account's data includes an “owner" field used to identify
who has authority over that specific Token Account. This is separate from the
program owner specified in the AccountInfo, which is the Token Program for all
Token Accounts.

## Associated Token Account

To simplify the process of locating a token account's address for a specific
mint and owner, we often use Associated Token Accounts.

An Associated Token Account is a token account whose address is
deterministically derived using the owner's address and the mint account's
address. You can think of the Associated Token Account as the "default" token
account for a specific mint and owner.

It's important to understand that an Associated Token Account isn't a different
type of token account. It's just a token account with a specific address.

![Associated Token Account](/assets/docs/core/tokens/associated-token-account.svg)

This introduces a key concept in Solana development: Program Derived Address
(PDA). Conceptually, a PDA provides a deterministic way to generate an address
using some predefined inputs. This enables us to easily find the address of an
account at a later time.

Here is a [Solana Playground](https://beta.solpg.io/656a2dd0fb53fa325bfd0c41)
example that derives the USDC Associated Token Account address and owner. It
will always generate the
[same address](https://explorer.solana.com/address/4kokFKCFMxpCpG41yLYkLEqXW8g1WPfCt2NC9KGivY6N)
for the same mint and owner.

```ts
const associatedTokenAccountAddress = getAssociatedTokenAddressSync(
  USDC_MINT_ADDRESS,
  OWNER_ADDRESS,
);
```

Specifically, the address for an Associated Token Account is derived using the
following inputs. Here is a
[Solana Playground](https://beta.solpg.io/656a31d0fb53fa325bfd0c42) example that
generates the same address as the previous example.

```ts
const [PDA, bump] = PublicKey.findProgramAddressSync(
  [
    OWNER_ADDRESS.toBuffer(),
    TOKEN_PROGRAM_ID.toBuffer(),
    USDC_MINT_ADDRESS.toBuffer(),
  ],
  ASSOCIATED_TOKEN_PROGRAM_ID,
);
```

For two wallets to hold units of the same type of token, each wallet needs its
own token account for the specific mint account.

![Accounts Relationship Expanded](/assets/docs/core/tokens/token-account-relationship-ata.svg)

## Metadata Account

// TODO add token extensions metadata extensions

Token metadata, such as name and image, are not directly supported by the Token
Program. Instead, the
[Metaplex Token Metadata Program](https://github.com/metaplex-foundation/mpl-token-metadata)
is used to create an additional on-chain account called the "Token Metadata
Account" to associate additional metadata to a Mint Account. You can refer to
the
[Metaplex documentation](https://docs.metaplex.com/programs/token-metadata/overview)
to better understand the relationship between various accounts.

// TODO, token extensions
