---
date: 2024-04-25T00:00:00Z
difficulty: intermediate
title: Dynamic metadata NFTs using Token Extensions
description:
  Using the metadata token extension it is possible to save dynamic metadata,
  like level and XP, directly in the mint of an NFT.
tags:
  - games
  - anchor
  - program
  - web3js
  - token extensions
  - token 2022
  - NFTs
  - rust
keywords:
  - tutorial
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - anchor
  - games
  - example
  - NFTs
  - metadata
  - token extensions
  - token 2022
---

With the
[Token Extension program](https://solana.com/developers/guides/token-extensions/getting-started),
you can create NFTs and digital assets using the metadata extensions. Together,
these extensions
([metadata pointer and token metadata](https://solana.com/developers/guides/token-extensions/metadata-pointer))
allow you to put any desired metadata natively on-chain. All within a
customizable key-value data store directly on the token's mint account, reducing
costs and complexity.

These can be especially great for
[web3 games](https://solana.com/solutions/games-tooling) since we can now have
these "additional metadata fields" within an on-chain key-value store, allowing
games to save/access unique state within the NFT itself (like for a game
character's stats or inventory).

## Building the on-chain program

In this developer guide, we will demonstrate how to build these Token Extension
based NFTs and custom metadata using an [Anchor program](/docs/programs/anchor).
This program will save the level and the collected resources of a game player
within an NFT.

This NFT will be created by the Anchor program so it is very easy to mint from
the JavaScript client. Each NFT will have some basic structure provided via the
Token Metadata interface:

- default on-chain fields - `name`, `symbol` and `uri`
  - the `uri` is a link to an offchain json file which contains the off chain
    metadata of the NFT
- we will also have custom "additional fields" that we define

All of these fields are saved using the metadata extension which is pointed to
the NFT's mint account, making them accessible to anyone or any program.

<Callout title="Video and Source Code">

You can find a video walkthrough of this example on the Solana Foundation
Youtube channel:

- [Video Walkthrough](https://www.youtube.com/watch?v=n-ym1utpzhk)
- [Full Source Code](https://github.com/solana-developers/program-examples/tree/main/tokens/token-2022/NFT-meta-data-pointer/anchor)

</Callout>

### Other use case within games

These types of NFTs with customizable on-chain metadata open up many interesting
possibilities for game developers. Especially since this metadata can be
directly interacted with or managed by an
[on-chain program](/docs/core/programs.md).

Some of these gaming related use cases include:

- save the level and XP of the player
- the current weapon and armor
- the current quest
- the list goes on!

## Minting the NFT

In order to create the NFT we need to perform a following steps:

1. Create a mint account
2. Initialize the mint account
3. Create a metadata pointer account
4. Initialize the metadata pointer account
5. Create the metadata account
6. Initialize the metadata account
7. Create the associated token account
8. Mint the token to the associated token account
9. Freeze the mint authority

### Rust program code

Here is the rust code used to mint the NFT using the Token extension program:

```rust name="Program"
// calculate the space need for the mint account with the desired extensions
let space = ExtensionType::try_calculate_account_len::<Mint>(
    &[ExtensionType::MetadataPointer])
    .unwrap();

// This is the space required for the metadata account.
// We put the metadata into the mint account at the end so we
// don't need to create and additional account.
// Then the metadata pointer points back to the mint account.
// Using this technique, only one account is needed for both the mint
// information and the metadata.

let meta_data_space = 250;

let lamports_required = (Rent::get()?).minimum_balance(space + meta_data_space);

msg!(
    "Create Mint and metadata account size and cost: {} lamports: {}",
    space as u64,
    lamports_required
);

system_program::create_account(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        system_program::CreateAccount {
            from: ctx.accounts.signer.to_account_info(),
            to: ctx.accounts.mint.to_account_info(),
        },
    ),
    lamports_required,
    space as u64,
    &ctx.accounts.token_program.key(),
)?;

// Assign the mint to the token program
system_program::assign(
    CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        system_program::Assign {
            account_to_assign: ctx.accounts.mint.to_account_info(),
        },
    ),
    &token_2022::ID,
)?;

// Initialize the metadata pointer (Need to do this before initializing the mint)
let init_meta_data_pointer_ix =
spl_token_2022::extension::metadata_pointer::instruction::initialize(
    &Token2022::id(),
    &ctx.accounts.mint.key(),
    Some(ctx.accounts.nft_authority.key()),
    Some(ctx.accounts.mint.key()),
)
.unwrap();

invoke(
    &init_meta_data_pointer_ix,
    &[
        ctx.accounts.mint.to_account_info(),
        ctx.accounts.nft_authority.to_account_info()
    ],
)?;

// Initialize the mint cpi
let mint_cpi_ix = CpiContext::new(
    ctx.accounts.token_program.to_account_info(),
    token_2022::InitializeMint2 {
        mint: ctx.accounts.mint.to_account_info(),
    },
);

token_2022::initialize_mint2(
    mint_cpi_ix,
    0,
    &ctx.accounts.nft_authority.key(),
    None).unwrap();

// We use a PDA as a mint authority for the metadata account because
// we want to be able to update the NFT from the program.
let seeds = b"nft_authority";
let bump = ctx.bumps.nft_authority;
let signer: &[&[&[u8]]] = &[&[seeds, &[bump]]];

msg!("Init metadata {0}", ctx.accounts.nft_authority.to_account_info().key);

// Init the metadata account
let init_token_meta_data_ix =
&spl_token_metadata_interface::instruction::initialize(
    &spl_token_2022::id(),
    ctx.accounts.mint.key,
    ctx.accounts.nft_authority.to_account_info().key,
    ctx.accounts.mint.key,
    ctx.accounts.nft_authority.to_account_info().key,
    "Beaver".to_string(),
    "BVA".to_string(),
    "https://arweave.net/MHK3Iopy0GgvDoM7LkkiAdg7pQqExuuWvedApCnzfj0".to_string(),
);

invoke_signed(
    init_token_meta_data_ix,
    &[ctx.accounts.mint.to_account_info().clone(), ctx.accounts.nft_authority.to_account_info().clone()],
    signer,
)?;

// Update the metadata account with an additional metadata field in this case the player level
invoke_signed(
    &spl_token_metadata_interface::instruction::update_field(
        &spl_token_2022::id(),
        ctx.accounts.mint.key,
        ctx.accounts.nft_authority.to_account_info().key,
        spl_token_metadata_interface::state::Field::Key("level".to_string()),
        "1".to_string(),
    ),
    &[
        ctx.accounts.mint.to_account_info().clone(),
        ctx.accounts.nft_authority.to_account_info().clone(),
    ],
    signer
)?;

// Create the associated token account
associated_token::create(
    CpiContext::new(
    ctx.accounts.associated_token_program.to_account_info(),
    associated_token::Create {
        payer: ctx.accounts.signer.to_account_info(),
        associated_token: ctx.accounts.token_account.to_account_info(),
        authority: ctx.accounts.signer.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
    },
))?;

// Mint one token to the associated token account of the player
token_2022::mint_to(
    CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token_2022::MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.nft_authority.to_account_info(),
        },
        signer
    ),
    1,
)?;

// Freeze the mint authority so no more tokens can be minted to make it an NFT
token_2022::set_authority(
    CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        token_2022::SetAuthority {
            current_authority: ctx.accounts.nft_authority.to_account_info(),
            account_or_mint: ctx.accounts.mint.to_account_info(),
        },
        signer
    ),
    AuthorityType::MintTokens,
    None,
)?;
```

### JavaScript client code

Calling mint NFT from the client is very easy:

```js name="Client"
const nftAuthority = PublicKey.findProgramAddressSync(
  [Buffer.from("nft_authority")],
  program.programId,
);

const mint = new Keypair();

const destinationTokenAccount = getAssociatedTokenAddressSync(
  mint.publicKey,
  publicKey,
  false,
  TOKEN_2022_PROGRAM_ID,
);

const transaction = await program.methods
  .mintNft()
  .accounts({
    signer: publicKey,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_2022_PROGRAM_ID,
    tokenAccount: destinationTokenAccount,
    mint: mint.publicKey,
    rent: web3.SYSVAR_RENT_PUBKEY,
    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    nftAuthority: nftAuthority[0],
  })
  .signers([mint])
  .transaction();

console.log("transaction", transaction);

const txSig = await sendTransaction(transaction, connection, {
  signers: [mint],
  skipPreflight: true,
});

console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
```

## Quickstart example

The example above is based on the Solana Games Preset, which generates you a
scaffold that includes a JavaScript and Unity client for this game, including
the configuration for interacting with the Solana Anchor program.

You can run it yourself with the following command:

```shell
npx create-solana-game gameName
```

### Setup your local environment

In order to run this example locally, you will need to make sure you have
[setup your local environment](/docs/intro/installation) for Solana development,
including installing and configuring the Anchor CLI. If you do not already, you
can follow the previously linked setup guide to do so.

### Project structure

The Anchor project is structured like this:

The entry point is in the lib.rs file. Here we define the program id and the
instructions. The instructions are defined in the instructions folder. The state
is defined in the state folder.

So the calls arrive in the lib.rs file and are then forwarded to the
instructions. The instructions then call the state to get the data and update
it.

You can find the mint NFT instruction in the instructions folder.

```shell
├── src
│   ├── instructions
│   │   ├── chop_tree.rs
│   │   ├── init_player.rs
│   │   ├── mint_nft.rs
│   │   └── update_energy.rs
│   ├── state
│   │   ├── game_data.rs
│   │   ├── mod.rs
│   │   └── player_data.rs
│   ├── lib.rs
│   └── constants.rs
│   └── errors.rs

```

### Anchor program

To finish setting up the Anchor program generated from the `create-solana-game`
tool:

1. `cd program` to end the program directory
2. Run `anchor build` to build the program
3. Run `anchor deploy` to deploy the program
4. Copy the program id from the terminal into the `lib.rs`, `anchor.toml` and
   within the Unity project in the `AnchorService` and if you use JavaScript in
   the `anchor.ts` file
5. Build and deploy again

### NextJS client

To finish setting up the NextJS client generated from the `create-solana-game`
tool:

1. Copy the `programId` into `app/utils/anchor.ts`
2. `cd app` to end the app directory
3. Run `yarn install` to install the Node dependencies
4. Run `yarn dev` to start the client
5. After doing changes to the Anchor program make sure to copy over the types
   from the program into the client so you can use them. You can find the
   TypeScript types in the `target/idl` folder.

## Run this example locally

Using Anchor's `test` command with the `--detach` flag will start and configure
your Solana local test validator to have the program deployed (and keep the
validator running after the tests complete):

```shell
cd program
anchor test --detach
```

Then you can set the [Solana Explorer](https://explorer.solana.com/) to use your
local test validator (which starts when running the `anchor test` command) so
you can look at the transactions:

```
https://explorer.solana.com/?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899
```

The program is also already deployed to net so you can try it out on `devnet`.
The JavaScript client also has a button to mint the NFT. Starting the JavaScript
client:

```shell
cd app
yarn install
yarn dev
```

### Open the Unity project

First open the Unity project with Unity Version 2021.3.32.f1 (or similar), then
open the `GameScene` or `LoginScene` and hit play. Use the editor login button
in the bottom left.

If you can't get devnet SOL you can copy your address from the console and
follow the instructions on this guide on
[how to get devnet SOL](https://solana.com/developers/guides/getstarted/solana-token-airdrop-and-faucets)

### Connect to the Solana test validator in Unity

If you want to avoid having to worry about maintaining devnet SOL, you can
connect to your running local test validator from within Unity. Simply add these
links on the wallet holder game object:

```shell
http://localhost:8899
ws://localhost:8900
```

### Run the JavaScript client

To start the JavaScript client and be able to interact with the game and program
using your web browser:

- open the `app` directory within the repo
- install the Node dependencies
- run the `dev` command to start the development server

```shell
cd app
yarn install
yarn dev
```

To start changing the program and connecting to your own program follow the
steps below.
