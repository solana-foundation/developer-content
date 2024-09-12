---
date: March 18, 2024
difficulty: Intermediate
title: "Cash App on Solana"
description:
  "Solana developer quickstart guide to learn how to create a React Native
  mobile app that is both Android and iOS compatible. This app will mimic a cash
  app experience but run on the Solana blockchain, showcasing that web3 products
  can have the same user experience as web2 products. To build this, we will
  need to write an Anchor program, integrate the Solana Name Service SDK, and
  integrate Solana pay."
tags:
  - quickstart
  - dApp
  - mobile
  - anchor
  - rust
  - react-native
  - expo
keywords:
  - solana dapp
  - on-chain
  - rust
  - anchor program
  - mobile dapp
  - create dapp
  - create solana dapp
  - tutorial
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
---

In this guide, you will learn how to create a react-native mobile app that is
both Android and iOS compatible. This app will mimic a Cash App experience but
run on the Solana blockchain, showcasing that web3 products can have the same
user experience as web2 products. To build this, we will need to write an Anchor
program, integrate the Solana Name Service SDK, and integrate Solana Pay.

## What You Will Learn

- Setting up your environment
- Creating a Solana mobile dApp
- Anchor program development
- Anchor PDAs and accounts
- Deploying a Solana program
- Testing a Solana program
- Connecting an onchain program to a mobile React Native UI
- Solana Pay
- Solana Name Service

## What You Will Build

You will learn to build a finance application similar to Cash App. This will be
a web3 mobile app with a wallet adaptor, devnet deployed anchor program, and
custom UI to interact with the anchor program.

### Home Screen

![Cash Balance](/assets/guides/cash-app/HomeScreen.png)
![Cash Out Modal](/assets/guides/cash-app/CashOutModal.png)

### Payment Screen

![Payment Screen](/assets/guides/cash-app/PaymentScreen.png)
![Request Screen](/assets/guides/cash-app/RequestScreen.png)

### QR Screen

![QR Screen](/assets/guides/cash-app/QRScreen.png)
![QR Modal](/assets/guides/cash-app/QRModal.png)

### Activity Screen

![Activity Screen](/assets/guides/cash-app/ActivityScreen.png)

## Prerequisites

Setup the following tools on your local development environment:

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/en/download)
- [Solana CLI & Anchor](https://solana.com/docs/intro/installation)
- [Android Studio and emulator set up](https://docs.solanamobile.com/getting-started/development-setup)
- [React Native Setup](https://reactnative.dev/docs/environment-setup?platform=android)
- [EAS CLI and Account Setup](https://docs.expo.dev/build/setup/)

For an introduction to Solana program development with the Anchor framework,
review this guide:

- [Basic CRUD dApp on Solana](https://github.com/solana-foundation/developer-content/blob/main/content/guides/dapps/journal.md#writing-a-solana-program-with-anchor)

For an introduction to Solana Mobile development, review the Solana Mobile docs:

- [Solana Mobile Introduction](https://docs.solanamobile.com/getting-started/intro)

## Project Design Overview

Let's start by quickly mapping out the entire dApp design. To create a clone of
Cash App, we want to have the following features:

1. Account creation
2. Deposit and withdraw funds
3. User-to-user money transfer
4. QR code generation
5. Connect with friends
6. Activity tracking
7. Send payment requests to friends

To enable these functionalities, we will do the following:

1. Write a Solana program that allows for users to initialize a new account
   on-chain and set up a user name _(similar to $Cashtag)_ with
   [Solana Name Service](https://sns.guide/). With the username being set via
   SNS, you can then get public key information directly from an account's
   username.
2. Add instructions to the Solana program for a user to be able to deposit funds
   from their wallet into their cash account and withdrawal funds from their
   cash account into their wallet.
3. Add instructions for a user to be able to directly send funds from their own
   cash account to another cash account, request funds from a specified cash
   account, and accept or decline payment requests.
4. Integrate [Solana Pay](https://docs.solanapay.com/) to enable QR code
   generation. Solana pay also allows you to specify the amount and memo for the
   requested transaction directly in the QR code.
5. Add an instruction for a user to be able to add friends by pushing the user
   provided public key to a friends vector saved to the user's account state,
   which can then be displayed on the front end similar to Cash App.
6. Add an activity tab that queries the cash account state of the connected user
   to show pending requests and pending payments.
7. Add in an additional account type for payment requests and write instructions
   for creating a request, accepting a request and processing the payment
   transfer, and declining the request and closing the pending request account.

## Solana Mobile App Template Set Up

Since this project will be a mobile app, we can get started with the Solana
mobile expo app template:

```shell
yarn create expo-app --template @solana-mobile/solana-mobile-expo-template
```

This is initializing a new project using the Expo framework that is specifically
designed for creating mobile applications that interact with the Solana
blockchain.

Name the project `cash-app-clone` then navigate into the directory.

Follow the
[Running the app](https://docs.solanamobile.com/react-native/expo#running-the-app)
guide to launch the template as a custom development build and get it running on
your Android emulator. Once you have built the program and are running a dev
client with expo, the emulator will automatically update every time you save
your code.

<Callout title="Reminder">
You must have
[fake wallet](https://github.com/solana-mobile/mobile-wallet-adapter/tree/main/android/fakewallet)
running on the same Android emulator to be able to test out transactions, as
explained in the
[Solana mobile development set up docs](https://docs.solanamobile.com/getting-started/development-setup)
or you must have a real wallet app, like Phantom or Solflare, installed and set
up on your emulator.
</Callout>

## Writing a Solana Program with Cash App Functionalities

### Initialize the Anchor Workspace

An Anchor workspace needs to be initialized to enable Solana program
development, deployment, and testing within this repository.

```shell
cd cash-app-clone

anchor init cash-app
```

Once the Anchor workspace has been initialized, navigate to to
`cash-app/programs/cash-app/src/lib.rs` to start writing the program code.

Your Anchor program should already be defined by initializing the Anchor work
space and should look as follows:

```rust
use anchor_lang::prelude::*;

declare_id!("3dQeymKBEWf32Uzyzxm3Qyopt6uyHJdXxtvrpJdk7vCE");

#[program]
pub mod cash_app {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

### Define Your Account State

```rust
#[account]
#[derive(InitSpace)]
pub struct CashAccount {
    pub owner: Pubkey,
    #[max_len(100)]
    pub friends: Vec<Pubkey>,
}
```

Since we are able to directly query the SOL balance of PDA accounts, we don't
have to keep track of the user's account balance here.

### Write Instructions

Now that the state is defined, we need to create an instruction to initialize an
account when a new user signs up for Cash App. This will initialize a new
`cash_account` and the PDA of this account will be derived from the string
`"cash-account"` and the public key of the user's wallet.

```rust
#[program]
pub mod cash_app {
    use super::*;

    pub fn initialize_account(ctx: Context<InitializeAccount>) -> Result<()> {
        let cash_account = &mut ctx.accounts.cash_account;
        cash_account.owner = *ctx.accounts.signer.key;
        cash_account.friends = Vec::new();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeAccount<'info> {
    #[account(
        init,
        seeds = [b"cash-account", signer.key().as_ref()],
        bump,
        payer = signer,
        space = 8 + CashAccount::INIT_SPACE
    )]
    pub cash_account: Account<'info, CashAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

```

Because the `InitSpace` macro was used when defining the `CashAccount` state, it
can be called to calculate the space that this program will take up on chain.
The space is needed in order to calculate how much rent the payer will need to
pay to hold the program on chain.

Next we will need to add an instruction to this program that allows a user to
deposit funds into their cash account:

```rust
#[program]
pub mod cash_app {
    use super::*;

    //...

    pub fn deposit_funds(ctx: Context<DepositFunds>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let ix = system_instruction::transfer(
            &ctx.accounts.signer.key(),
            ctx.accounts.cash_account.to_account_info().key,
            amount,
        );

        invoke(
            &ix,
            &[
                ctx.accounts.signer.clone(),
                ctx.accounts.cash_account.to_account_info(),
            ],
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct DepositFunds<'info> {
    #[account(
        mut,
        seeds = [b"cash-account", signer.key().as_ref()],
        bump,
    )]
    pub cash_account: Account<'info, CashAccount>,
    #[account(mut)]
    /// CHECK: This account is only used to transfer SOL, not for data storage.
    pub signer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided amount must be greater than zero.")]
    InvalidAmount,
}

```

The `deposit_funds` function constructs a system instruction to transfer SOL
from the user's wallet to the user's cash account PDA. Solana programs are
designed to be isolated for security reasons; they don't have direct access to
each other's state or functions. If one program needs to run an instruction
handler that is part of another program, it must do so through a cross-program
invocation (CPI). Since the funds are coming from the signer's wallet, which is
an account owned by the signer not the program, the function has to interact
with the System Program to modify the balance of the accounts. The transfer
instruction from the System Program is then executed using `invoke`, which
safely performs the CPI by taking in the transfer instruction and a slice of
accounts that the instruction will interact with.

`invoke` ensures that all operations are performed securely and in compliance
with the rules set by the Solana network and the specific programs involved. It
verifies that:

- Only authorized modifications to account data are performed.
- The necessary signatures for operations that require them are present.
- The operation does not violate the program's constraints or Solana's network
  rules.

Next, we need to add an instruction that allows a user to withdraw funds from
their cash account:

```rust
#[program]
pub mod cash_app {
    use super::*;

    //...

    pub fn withdraw_funds(ctx: Context<WithdrawFunds>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let cash_account = &mut ctx.accounts.cash_account.to_account_info();
        let wallet = &mut ctx.accounts.signer.to_account_info();

        require!(*cash_account.owner == ctx.accounts.signer.key(), ErrorCode::InvalidSigner);

        **cash_account.try_borrow_mut_lamports()? -= amount;
        **wallet.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct WithdrawFunds<'info> {
    #[account(
        mut,
        seeds = [b"cash-account", signer.key().as_ref()],
        bump,
    )]
    pub cash_account: Account<'info, CashAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The provided amount must be greater than zero.")]
    InvalidAmount,

    #[msg("Signer does not have access to call this instruction.")]
    InvalidSigner,
}
```

Unlike the `deposit_funds` instruction, the `withdraw_funds` instruction
directly adjusts the [Lamports](https://solana.com/docs/terminology#lamport)
`cash_account` and the user's wallet by using `try_borrow_mut_lamports()`. This
transfer of funds can be done without the overhead of a CPI because the
`cash_account` is owned by the same program executing the function. This is more
efficient but requires careful handling to ensure security.

When Solana Program transfers lamports from an account that it owns, the sender
account must be owned by the program but the recipient account does not have to
be owned by the program. Since lamports can not be created or destroyed when
changing account balances, any decrement performed needs to be balanced with an
equal increment somewhere else, otherwise you will get an error. In the above
`withdraw_funds` instruction, the program is transferring the exact same amount
of lamports from the cash account into the users wallet.

Since we are directly manipulating the lamports in an account, we want to ensure
that the signer of the instruction is the same as the owner of the account so
that only the owner can call this instruction. This is why the following
validation check was implemented:
`require!(cash_account.owner == ctx.accounts.signer, ErrorCode::InvalidSigner)`.

For error handling. the `#[error_code]` Anchor macro is used, which generates
`Error` and `type Result<T> = Result<T, Error> ` types to be used as return
types from Anchor instruction handlers. Importantly, the attribute implements
`From` on the `ErrorCode` to support converting from the user defined error enum
into the generated `Error`.

Now let's create an instruction for transferring funds from one user to another.

```rust
#[program]
pub mod cash_app {
    use super::*;

    //...

    pub fn transfer_funds(
        ctx: Context<TransferFunds>,
        _recipient: Pubkey,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);

        let from_cash_account = &mut ctx.accounts.from_cash_account.to_account_info();
        let to_cash_account = &mut ctx.accounts.to_cash_account.to_account_info();

        require!(*cash_account.owner == ctx.accounts.signer.key(), ErrorCode::InvalidSigner);

        **from_cash_account.try_borrow_mut_lamports()? -= amount;
        **to_cash_account.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(recipient: Pubkey)]
pub struct TransferFunds<'info> {
    #[account(
        mut,
        seeds = [b"cash-account", signer.key().as_ref()],
        bump,
    )]
    pub from_cash_account: Account<'info, CashAccount>,

    #[account(
        mut,
        seeds = [b"cash-account", recipient.key().as_ref()],
        bump,
    )]
    pub to_cash_account: Account<'info, CashAccount>,
    pub system_program: Program<'info, System>,
    pub signer: Signer<'info>,
}
```

In the above instruction, the `TransferFunds` Context data structure consists of
an additional account. The `Context` is a struct that includes references to all
the accounts needed for the operation. Since we need information from both the
sender and recipient accounts for this instruction, we need to include both
accounts in the `Context`.

We are once again directly transferring lamports between accounts, since the
program owns the `cash_account` account. The seeds for the cash account PDAs are
created from the public key of the cash account owner so the instruction needs
to take the recipient's public key as a parameter and pass that to the
`TransferFunds` Context data structure. Then the `cash_account` PDA can be
derived for both the `from_cash_account` and the `to_cash_account`.

Since both of the accounts are listed in the `#[derive(Accounts)]` macro, they
are deserialized and validated so you can simply call both of the accounts with
the Context `ctx` to get the account info and update the account balances from
there.

To be able to send funds to another user, similar to Cash App, both users must
have created an account. We're sending funds to the user's `cash_account` PDA,
not the user's wallet. So each user needs to initialize a cash account by
calling the `initialize_account` instruction to create their unique PDA derived
from their wallet public key. We'll need to keep this in mind when designing the
UI/UX of the onboarding process for this dApp later on to ensure every user
calls the `initialize_account` instruction when signing up for an account.

Now that the basic payment functionality is enabled, we want to be able to
interact with friends. So we need to add instructions for adding friends,
requesting payments from friends, and accepting/rejecting payment requests.

Adding a friend is as simple as just pushing a new public key to the `friends`
vector in the `CashAccount` state.

```rust
#[program]
pub mod cash_app {
    use super::*;

    //...
    pub fn add_friend(ctx: Context<AddFriend>, pubkey: Pubkey) -> Result<()> {
        let cash_account = &mut ctx.accounts.cash_account;
        cash_account.friends.push(pubkey);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AddFriend<'info> {
    #[account(
        mut,
        seeds = [b"cash-account", signer.key().as_ref()],
        bump,
    )]
    pub cash_account: Account<'info, CashAccount>,
    #[account(mut)]
    /// CHECK: This account is only used to transfer SOL, not for data storage.
    pub signer: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}
```

In the `add_friend` function, there is a design limitation. The `vec` of friends
has a limit to how many friends a user to can add. To enhance this program to
allow limitless friends, the way that friends are stored must be changed.

### Multiple Accounts Types in One Program

There are several different ways to approach requesting payments from friends.
In this example, we will make each payment request its own PDA account in order
to simplify querying active requests, deleting completed requests, and updating
both the sender and recipient cash accounts.

Each time a new payment request is created, the instruction will create a new
PDA account that holds data for the payment's sender, recipient, and amount.

To have multiple account types within one program, you just need to define the
data structure for each account type and have instructions to be able to
initialize each account type. We already have the state data structure and init
account instruction for the cash account, now we'll just add this for the
pending request account.

```rust
#[account]
#[derive(InitSpace)]
pub struct PendingRequest {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct InitializeRequest<'info> {
    #[account(
        init,
        seeds = [b"pending-request", signer.key().as_ref()],
        bump,
        payer = signer,
        space = 8 + PendingRequest::INIT_SPACE
    )]
    pub pending_request: Account<'info, PendingRequest>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[program]
pub mod cash_app {
    use super::*;

    //...

    pub fn new_request(ctx: Context<InitializeRequest>, sender: Pubkey, amount: u64) -> Result<()> {
        let pending_request = &mut ctx.accounts.pending_request;
        pending_request.recipient = *ctx.accounts.signer.key;
        pending_request.sender = sender;
        pending_request.amount = amount;
        Ok(())
    }
}
```

Now that we are able to send payment requests, we need to be able to accept or
decline those payments. So let's add in those instructions now.

```rust
#[program]
pub mod cash_app {
    use super::*;

    //...

    pub fn decline_request(_ctx: Context<DeclineRequest>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct DeclineRequest<'info> {
    #[account(
        mut,
        seeds = [b"pending-request", signer.key().as_ref()],
        bump,
        close = signer,
    )]
    pub pending_request: Account<'info, PendingRequest>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

To decline a request, the `pending_request` account needs to be closed. By
specifying the `close` constraint in the account macro for the `DeclineRequest`
data structure, the account simply closes when the correct signer signs the
`decline_request` instruction.

For `accept_request`, we also want the account to close upon completion of the
instruction but the requested funds need to be transferred to the correct
recipient first.

```rust
#[program]
pub mod cash_app {
    use super::*;

    //...

    pub fn accept_request(ctx: Context<AcceptRequest>) -> Result<()> {
        let amount = ctx.accounts.pending_request.amount;

        let from_cash_account = &mut ctx.accounts.from_cash_account.to_account_info();
        let to_cash_account = &mut ctx.accounts.to_cash_account.to_account_info();

        **from_cash_account.try_borrow_mut_lamports()? -= amount;
        **to_cash_account.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct AcceptRequest<'info> {
    #[account(
        mut,
        seeds = [b"pending-request", signer.key().as_ref()],
        bump,
        close = signer,
    )]
    pub pending_request: Account<'info, PendingRequest>,
    #[account(
        mut,
        seeds = [b"cash-account", pending_request.sender.key().as_ref()],
        bump,
    )]
    pub from_cash_account: Account<'info, CashAccount>,
    #[account(
        mut,
        seeds = [b"cash-account", pending_request.recipient.key().as_ref()],
        bump,
    )]
    pub to_cash_account: Account<'info, CashAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

The `AcceptRequest` struct has references to three accounts since we need all
three to complete the request. The `recipient` and `sender` public keys are
pulled from the `pending_request` account state and used to derive the two
`cash_account` accounts needed for this transaction.

We're now able to deposit funds, withdraw funds, send funds to another user,
request funds from another user, add friends, and accept/decline requests, which
covers all of the functionality in Cash App. We'll just add one optimization to
this program before testing.

### Integrating a Counter for Unique PDAs

Since a user can have multiple pending requests, we want each request to have a
unique PDA. So we can update the above code to include a counter in the PDA. The
counter will need to be tracked in the user's cash account state, so now
`ProcessRequest` needs to take in the cash account along with the pending
request account. So lets first update both account data structures.

```rust
#[account]
#[derive(InitSpace)]
pub struct CashAccount {
    pub signer: Pubkey,
    pub friends: Vec<Pubkey>,
    pub request_counter: u64,
}

#[account]
#[derive(InitSpace)]
pub struct PendingRequest {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub id: u64,
}
```

Now we need to update the `InitializeRequest`, `DeclineRequest`, and
`AcceptRequest` structs to include the requester's cash account so that the
counter can be queried and incremented and the `pending_request` account can use
the value of the counter in its PDA generation.

```rust
#[derive(Accounts)]
pub struct InitializeRequest<'info> {
    #[account(
        init,
        seeds = [b"pending-request", signer.key().as_ref(), cash_account.pending_request_counter.to_le_bytes().as_ref()],
        bump,
        payer = signer,
        space = 8 + PendingRequest::INIT_SPACE
    )]
    pub pending_request: Account<'info, PendingRequest>,
    #[account(
        mut,
        seeds = [b"cash-account", signer.key().as_ref()],
        bump,
        close = signer,
    )]
    pub cash_account: Account<'info, CashAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeclineRequest<'info> {
    #[account(
        mut,
        seeds = [b"pending-request", signer.key().as_ref(), pending_request.id.to_le_bytes().as_ref()],
        bump,
        close = signer,
    )]
    pub pending_request: Account<'info, PendingRequest>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptRequest<'info> {
    #[account(
        mut,
        seeds = [b"pending-request", signer.key().as_ref(), pending_request.id.to_le_bytes().as_ref()],
        bump,
        close = signer,
    )]
    pub pending_request: Account<'info, PendingRequest>,
    #[account(
        mut,
        seeds = [b"cash-account", pending_request.sender.key().as_ref()],
        bump,
    )]
    pub from_cash_account: Account<'info, CashAccount>,
    #[account(
        mut,
        seeds = [b"cash-account", pending_request.recipient.key().as_ref()],
        bump,
    )]
    pub to_cash_account: Account<'info, CashAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
```

Lastly, we need to update the initialization of each account. The
`pending_request_counter` should start at 0 and increment with each new request
sent from that specific cash account.

```rust
#[program]
pub mod cash_app {
    use super::*;

    //...

    pub fn initialize_account(ctx: Context<InitializeAccount>) -> Result<()> {
        let cash_account = &mut ctx.accounts.cash_account;
        cash_account.signer = *ctx.accounts.signer.key;
        cash_account.friends = Vec::new();
        cash_account.request_counter = 0;
        Ok(())
    }

    pub fn new_request(ctx: Context<InitializeAccount>, recipient: Pubkey, amount: u64) -> Result<()> {
        let cash_account = &mut ctx.accounts.cash_account;
        let pending_request = &mut ctx.accounts.pending_request;
        pending_request.sender = *ctx.accounts.signer.key;
        pending_request.recipient = recipient;
        pending_request.amount = amount;
        pending_request.id = cash_account.request_counter;
        cash_account.request_counter += 1;
        Ok(())
    }
}
```

Now your Solana program should match the final version
[here](https://github.com/solana-developers/cash-app-clone/blob/main/cash-app/anchor/cash-app/src/lib.rs):

### Build and Deploy the Program

First, we need to deploy the Anchor program. For testing purposes, you can
either deploy to your localnet or to devnet.

- `Devnet` is a public test network provided by Solana that more closely
  resembles mainnet. It operates with a broader set of validators and easily
  enables testing CPIs, oracles, and wallet services.
- `Localnet` is a private instance of the Solana blockchain running locally on
  your machine. It enables more control of the environment but doesn't
  completely mimic real-world conditions of the blockchain.

In the next section of this guide, you'll need the program deployed to localnet
to run the Anchor test suite, so deploy to localnet now.

Navigate to `cash-app-clone/cash-app` in your terminal.

```shell
solana-test-validator
```

This runs a local test validator to simulate the Solana blockchain environment
on your own machine. Note: You cannot deploy to localnet unless your test
validator is running.

```shell
anchor build
```

This builds your program's workspace. It targets Solana's BPF runtime and emits
each program's IDL in the `target/idl` folder and the corresponding typescript
types in the `target/types` folder. If your program is doesn't build, then there
is an error in your code that needs to be addressed.

```shell
anchor deploy --provider.cluster localnet
```

This command deploys your program to the specified cluster and generates a
program ID public key. If you choose to deploy to localnet, you must be running
`solana-test-validator` to be able to deploy.

```shell
anchor keys sync
```

This syncs the program's `declare_id!` pubkey with the program's actual pubkey.
It specifically updates the `lib.rs` and `Anchor.toml` files.

### Testing an Anchor Program

Testing Solana Anchor programs involves simulating the behavior of the Solana
program and ensuring it operates as expected. For the below test, we'll cover
the following:

- Creates Accounts for User A and User B
- Deposits funds into User A's account
- Withdraws funds from User A's account
- Transfers funds from User A's account to User B's account
- User A adds User B as a friend
- User A requests funds from User B
- User B accepts the request
- User A requests funds again from User B
- User B declines the request

When initializing an Anchor workspace, a file for TypeScript tests is generated.
Navigate to `cash-app-clone/cash-app/tests/cash-app.ts` to find the testing
template, which will already have the required modules imported.

First we need to set up our environment to interact with the Solana blockchain.

```tsx
describe("cash-app", () => {
  const provider = anchor.AnchorProvider.env();
  const program = anchor.workspace.CashApp as Program<CashApp>;
});
```

`provider` enables you to facilitate interactions between your application
(client-side) and the Solana blockchain, which includes a wallet that holds the
keypair used to sign transactions.

`program` now represents your Anchor program and can be used to call functions
defined in your on-chain program, pass in required accounts, and handle the
program's data. It simplifies interacting with the Solana blockchain by
abstracting many of the lower-level details.

Next, we need to define the wallet accounts that will be interacting with the
Solana program as well as their `cash_account` PDAs. `myWallet` is the
provider's wallet, meaning that it is already integrated with the
`AnchorProvider` and is configured when the `provider` is initialized. Since
`yourWallet` is a new wallet being generated, it will need to be funded with SOL
by requesting an airdrop.

```tsx
it("A to B user flow", async () => {
  const myWallet = provider.wallet as anchor.Wallet;
  const yourWallet = new anchor.web3.Keypair();

  const [myAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("cash-account"), myWallet.publicKey.toBuffer()],
    program.programId,
  );

  const [yourAccount] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("cash-account"), yourWallet.publicKey.toBuffer()],
    program.programId,
  );

  console.log("requesting airdrop");
  const airdropTx = await provider.connection.requestAirdrop(
    yourWallet.publicKey,
    5 * anchor.web3.LAMPORTS_PER_SOL,
  );
  await provider.connection.confirmTransaction(airdropTx);

  let yourBalance = await program.provider.connection.getBalance(
    yourWallet.publicKey,
  );
  console.log("Your wallet balance:", yourBalance);
});
```

Now we can interact with the Solana program. First we need to initialize each
user's `cash_account`.

```tsx
const initMe = await program.methods
  .initializeAccount()
  .accounts({
    cashAccount: myAccount,
    signer: myWallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .rpc();
console.log(`Use 'solana confirm -v ${initMe}' to see the logs`);

await anchor.getProvider().connection.confirmTransaction(initMe);

const initYou = await program.methods
  .initializeAccount()
  .accounts({
    cashAccount: yourAccount,
    signer: yourWallet.publicKey,
    systemProgram: anchor.web3.SystemProgram.programId,
  })
  .signers([yourWallet])
  .rpc();
console.log(`Initialized your account : ${initYou}' `);

await anchor.getProvider().connection.confirmTransaction(initYou);
```

By calling the program namespace `program.methods`, you're able to interact with
the instructions handlers of that program. When a transaction is sent using the
`provider` _(or methods derived from it, such as `program.rpc()`)_, the signing
by `myWallet` is implicitly handled. The `provider` automatically includes the
wallet configured with it _(myWallet in this case)_ as a signer for any
transactions it sends. This means you do not need to manually specify `myWallet`
in the `.signers()` array when constructing a transaction, because it's
inherently assumed to be a signer through the provider's configuration. However,
`yourWallet` is a new keypair which is not automatically associated with the
`provider`, so must explicitly tell Anchor to use yourWallet for signing any
transaction where it's required.

Since any other instruction call is handled exactly as described above, you can
complete this test example independently.

Lastly, run your test suite against your localnet.

```shell
anchor test
```

## Connecting a Solana Program to a React-Native Expo App

Now that we have a working Solana program, we need to integrate this with the UI
of the dApp.

### Android Emulator

Lets get the Android emulator running so we can see in real time the UI updates
that we will make throughout this guide.

You must have an EAS account and be logged into your account in the EAS CLI, to
set this up follow [the expo documentation](https://docs.expo.dev/build/setup/).

Navigate to the `cash-app-clone` directory in your terminal and run:

```shell
eas build --profile development --platform android
```

Then in a new terminal window run:

```shell
npx expo start --dev-client
```

Install the build on your Android emulator and keep it running in a separate
window. Every time you save a file, the emulator will refresh.

### Initial Program Connection

We can create a custom hook that accepts the public key of the user as a
parameter that is designed to interact with our deployed Solana program. By
providing the program ID, the rpc endpoint that the program was deployed to, the
IDL of the program, and the PDA of a specified user, we can create the logic
required to manage interactions with the Solana program. Create a new file under
`utils/useCashAppProgram.tsx`, to implement this function.

Since we want this app to be publicly available, deploy your program to devnet
and use that public key instead of `11111111111111111111111111111111`.

```tsx
export function UseCashAppProgramAccount(user: PublicKey) {
  const cashAppProgramId = new PublicKey("11111111111111111111111111111111");

  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com"),
  );

  const [cashAppPDA] = useMemo(() => {
    const accountSeed = [Buffer.from("cash_account"), user.toBuffer()];
    return PublicKey.findProgramAddressSync(accountSeed, cashAppProgramId);
  }, [cashAppProgramId]);

  const cashAppProgram = useMemo(() => {
    return new Program<CashAppProgram>(
      idl as CashAppProgram,
      cashAppProgramId,
      { connection },
    );
  }, [cashAppProgramId]);

  const value = useMemo(
    () => ({
      cashAppProgram: cashAppProgram,
      cashAppProgramId: cashAppProgramId,
      cashAppPDA: cashAppPDA,
    }),
    [cashAppProgram, cashAppProgramId, cashAppPDA],
  );

  return value;
}
```

Since there is only one `cash_account` account per public key, it is easy to
calculate the `cashAccountPDA` by taking in the user's public key as a parameter
and using that to calculate what the public key of the Cash App PDA for each
individual user is.

Since the IDL is generated as a JSON file when building the program, we can just
import it to this file.

This function returns:

- `cashAppPDA` - The connect user's Program Derived Address (PDA) for their cash
  account
- `cashAppProgramID` - The public key of the deployed Solana program on devnet
- `cashAppProgram` - The Cash App program which provides the IDL deserialized
  client representation of an Anchor program.

The `Program` class provides the IDL deserialized client representation of an
Anchor program. This API is a one stop shop for all things related to
communicating with on-chain programs. It enables sending transactions,
deserializing accounts, decoding instruction data, listening to events, etc.

The `cashAppProgram` object, created from the `Program` class, provides a set of
dynamically generated properties, known as `namespaces`. `Namespaces` map
one-to-one to program methods and accounts, which we will be using a lot later
in this project. The `namespace` is generally used as follows:
`program.<namespace>.<program-specific-method>`

To get information for specific `pending_request` accounts associated with a
specific public key, we'll need to take in the pending request ID as a
parameter.

```tsx
export function UsePendingRequestAccount(
  user: PublicKey,
  count: number,
  cashAppProgramId: PublicKey,
) {
  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com"),
  );

  bigNumber = new BN(count);
  const [pendingRequestPDA] = useMemo(() => {
    const pendingRequestSeed = [
      Buffer.from("cash_account"),
      user.toBuffer(),
      bigNumber.toBuffer(),
    ];
    return PublicKey.findProgramAddressSync(
      pendingRequestSeed,
      cashAppProgramId,
    );
  }, [cashAppProgramId]);

  const value = useMemo(
    () => ({
      pendingRequestPDA: pendingRequestPDA,
    }),
    [pendingRequestPDA],
  );

  return value;
}
```

### Styling and Themes

React Native uses a styling system that is based on the standard CSS properties,
but it's specifically tailored for mobile development. Styles are defined using
JavaScript objects, which enables dynamic generation of styles by leveraging
JavaScript's capabilities. To achieve a design that mimics the look and feel of
Cash App, we'll create a StyleSheet Object that will be use throughout this
dApp. This style sheet will feature a monochrome grayscale color palette, bold
text, and rounded shapes.

```jsx
import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    backgroundColor: "#1b1b1b",
    width: "100%",
    padding: 20,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  button: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 40,
  },
  buttonGroup: {
    flexDirection: "column",
    paddingVertical: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  cardContainer: {
    width: width - 40,
    backgroundColor: "#222",
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  modalView: {
    backgroundColor: "#444",
    padding: 35,
    alignItems: "center",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    width: "100%",
    height: "40%",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardContent: {
    fontSize: 16,
    color: "#666",
  },
});

export default styles;
```

Along with setting the `StyleSheet`, we also need to update the theme. A theme
creates a more uniform look and feel throughout the entire application. Navigate
to `App.tsx`, and update the code to only use `DarkTheme`.

### Navigation Bar and Pages Set up

To follow the UI/UX of Cash App, we'll need the following screens: Home, Pay,
Scan, and Activity.

Navigate to `HomeNavigator.tsx` and update the `<Tab.Navigator>` to include the
following screens:

```tsx
<PaperProvider theme={theme}>
  <Tab.Navigator
    screenOptions={({ route }) => ({
      header: () => <TopBar />,
      tabBarIcon: ({ focused, color, size }) => {
        switch (route.name) {
          case "Home":
            return (
              <MaterialCommunityIcon
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            );
          case "Pay":
            return (
              <MaterialCommunityIcon
                name={focused ? "currency-usd" : "currency-usd"}
                size={size}
                color={color}
              />
            );
          case "Scan":
            return (
              <MaterialCommunityIcon
                name={focused ? "qrcode-scan" : "qrcode-scan"}
                size={size}
                color={color}
              />
            );
          case "Activity":
            return (
              <MaterialCommunityIcon
                name={focused ? "clock-outline" : "clock-outline"}
                size={size}
                color={color}
              />
            );
        }
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Pay" component={PayScreen} />
    <Tab.Screen name="Scan" component={ScanScreen} />
    <Tab.Screen name="Activity" component={ActivityScreen} />
  </Tab.Navigator>
</PaperProvider>
```

In addition to this, you'll need to create new files for each of these screens.
Navigate to `src/screens` and create a file for `PayScreen.tsx`,
`ScanScreen.tsx`, and `ActivityScreen.tsx`.

Each file needs to have a function correlating to the screen name that follows
the same format as the HomeScreen in this template.

```tsx
export function HomeScreen() {
  return <View style={styles.screenContainer}></View>;
}
```

### Creating Components

Throughout this guide, we'll be using a modular approach to building features,
so we can focus on one component at a time.

#### Account Balance Component

Let's start with the home screen. To mimic Cash App, all we need is a container
that displays your account balance, a button to deposit funds into your account,
and a button to withdraw funds from your account.

In the expo template we are using, there is already similar functionality.
However, this code is for your connected wallet balance rather than the cash
account's balance. So we need to connect this feature to our deployed Solana
program and query the balance of the user's `cash_account` instead.

First simplify the home screen to just:

```tsx
export function HomeScreen() {
  const { selectedAccount } = useAuthorization();

  return (
    <View style={styles.screenContainer}>
      {selectedAccount ? (
        <>
          <AccountDetailFeature />
        </>
      ) : (
        <>
          <Text style={styles.headerTextLarge}>Solana Cash App</Text>
          <Text style={styles.text}>
            {" "}
            Sign in with Solana (SIWS) to link your wallet.
          </Text>
          <SignInFeature />
        </>
      )}
    </View>
  );
}
```

Then click into `AccountDetailFeature` and update the styling to use
`cardContainer`, add in a "Cash Balance" label for the card container, and
delete the `AccountTokens` component, as shown below:

```tsx
export function AccountDetailFeature() {
  const { selectedAccount } = useAuthorization();

  if (!selectedAccount) {
    return null;
  }
  const theme = useTheme();

  return (
    <>
      <View style={styles.cardContainer}>
        <Text variant="titleMedium" style={styles.headerText}>
          Cash Balance
        </Text>
        <View style={{ alignItems: "center" }}>
          <AccountBalance address={selectedAccount.publicKey} />
          <AccountButtonGroup address={selectedAccount.publicKey} />
        </View>
      </View>
    </>
  );
}
```

NOTE: The `StyleSheet` that we created earlier should be imported to every page.

Now click into the `AccountBalance` function. To update this query, we simply
need to change the public key that is being passed through the `useGetBalance`
function. We can grab the `cashAppPDA` from the `UseCashAppProgram` function we
created earlier.

```tsx
export function AccountBalance({ address }: { address: PublicKey }) {
  const { cashAppPDA } = UseCashAppProgram(address);

  const query = useGetBalance(cashAppPDA);
  const theme = {
    ...MD3DarkTheme,
    ...DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...DarkTheme.colors,
    },
  };

  return (
    <>
      <View style={styles.accountBalance}>
        <Text variant="displayMedium" theme={theme}>
          ${query.data ? lamportsToSol(query.data) : "0.00"}
        </Text>
      </View>
    </>
  );
}
```

#### Deposit and Withdraw Components

Next, we need to update the buttons to deposit and withdraw funds. Go to the
`AccountButtonGroup` function.

To be able to call and execute an instruction from the deployed Solana program,
we can use the program namespaces which map one-to-one to program methods and
accounts.

```tsx
const [connection] = useState(
  () => new Connection("https://api.devnet.solana.com"),
);

const depositFunds = useCallback(
  async (program: Program<CashApp>) => {
    let signedTransactions = await transact(
      async (wallet: Web3MobileWallet) => {
        const [authorizationResult, latestBlockhash] = await Promise.all([
          authorizeSession(wallet),
          connection.getLatestBlockhash(),
        ]);

        const depositInstruction = await program.methods
          .depositFunds(pubkey, newDepositAmount)
          .accounts({
            user: authorizationResult.publicKey,
            fromCashAccount: cashAppPDA,
          })
          .instruction();

        const depositTransaction = new Transaction({
          ...latestBlockhash,
          feePayer: authorizationResult.publicKey,
        }).add(depositInstruction);

        const signedTransactions = await wallet.signTransactions({
          transactions: [depositTransaction],
        });

        return signedTransactions[0];
      },
    );

    let txSignature = await connection.sendRawTransaction(
      signedTransactions.serialize(),
      {
        skipPreflight: true,
      },
    );

    const confirmationResult = await connection.confirmTransaction(
      txSignature,
      "confirmed",
    );

    if (confirmationResult.value.err) {
      throw new Error(JSON.stringify(confirmationResult.value.err));
    } else {
      console.log("Transaction successfully submitted!");
    }
  },
  [authorizeSession, connection, cashAppPDA],
);
```

This function uses React's `useCallback` hook to create a memoized callback
function that handles the process of depositing funds within the connected
Solana program. It accepts a `Program` parameter which is an Anchor program
interface for the `CashApp` dApp.

Since the `namespace` is generally used as follows:
`program.<namespace>.<program-specific-method>`, in the above code, we are
creating an `instruction` to `depositFunds` with the specified `accounts`.

Then this instruction can be added to a `Transaction` and signed with the
connected wallet.

Lastly, the signed transaction is then sent by using the `sendRawTransaction`
method from `connection` object.

The `connection` object is an instance of the `Connection` class from the
`solanaweb3.js` library, which is a connection to a fullnode JSON RPC endpoint.

Now that we have the function for `depositFunds`, you'll need to do follow the
same formate to create a `withdrawFunds` function using the program namespace
for the withdrawFunds instruction.

```tsx
const withdrawInstruction = await program.methods
  .withdrawFunds(pubkey, newDepositAmount)
  .accounts({
    user: authorizationResult.publicKey,
    fromCashAccount: cashAppPDA,
  })
  .instruction();
```

**Additional documentation:**

- [Transactions and Instructions](https://solana.com/docs/core/transactions)
- [Connection Class](https://solana-labs.github.io/solana-web3.js/classes/Connection.html)
- Library for
  [wallets](https://github.com/solana-mobile/mobile-wallet-adapter/tree/main/android/walletlib)
  to provide the Mobile Wallet Adapter transaction signing services to dapps

Npm packages to be installed and imported:

- @solana-mobile/mobile-wallet-adapter-protocol-web3js
- @coral-xyz/anchor
- @solana/web3.js

Now we can connect these functions to buttons on the UI.

We'll follow a very similar structure to the current `AccountButtonGroup`
function, but we need different functionality. So delete everything within the
function.

Since Cash App also uses modals when clicking on the "Add Cash" and "Cash Out"
buttons, we'll have a withdraw and deposit modal. We'll also need to take in a
user input value for the amount to be deposited or withdrawn. Lastly, we'll need
to call the `depositFunds` and `withdrawFunds` functions we just created.

```tsx
export function AccountButtonGroup({ address }: { address: PublicKey }) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [genInProgress, setGenInProgress] = useState(false);
  const [depositAmount, setDepositAmount] = useState(new anchor.BN(0));
  const newDepositAmount = new anchor.BN(depositAmount * 1000000000);
  const [withdrawAmount, setWithdrawAmount] = useState(new anchor.BN(0));
  const newWithdrawAmount = new anchor.BN(withdrawAmount * 1000000000);
  const { authorizeSession, selectedAccount } = useAuthorization();
  const { cashAppProgram } = UseCashAppProgram(address);

  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com"),
  );

  const DepositModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showDepositModal}
      onRequestClose={() => {
        setShowDepositModal(!showDepositModal);
      }}
    >
      <View style={styles.bottomView}>
        <View style={styles.modalView}>
          <Text style={styles.buttonText}>Add Cash</Text>
          <TextInput
            label="Amount"
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="numeric"
            mode="outlined"
            style={{
              marginBottom: 10,
              backgroundColor: "#ccc",
              width: "80%",
              marginTop: 10,
            }}
          />
          <Button
            mode="contained"
            style={styles.modalButton}
            onPress={async () => {
              setDepositModalVisible(!showDepositModal);
              if (genInProgress) {
                return;
              }
              setGenInProgress(true);
              try {
                if (!cashAppProgram || !selectedAccount) {
                  console.warn(
                    "Program/wallet is not initialized yet. Try connecting a wallet first.",
                  );
                  return;
                }
                const deposit = await depositFunds(cashAppProgram);

                alertAndLog(
                  "Funds deposited into cash account ",
                  "See console for logged transaction.",
                );
                console.log(deposit);
              } finally {
                setGenInProgress(false);
              }
            }}
          >
            Add
          </Button>
          <TouchableOpacity
            style={{ position: "absolute", bottom: 25 }}
            onPress={() => setDepositModalVisible(false)}
          >
            <Button>Close</Button>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const WithdrawModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showWithdrawModal}
      onRequestClose={() => {
        setShowWithdrawModal(!showWithdrawModal);
      }}
    >
      <View style={styles.bottomView}>
        <View style={styles.modalView}>
          <Text style={styles.buttonText}>Cash Out</Text>
          <TextInput
            label="Amount"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="numeric"
            mode="outlined"
            style={{
              marginBottom: 20,
              backgroundColor: "#ccc",
              width: "80%",
              marginTop: 50,
            }}
          />
          <Button
            mode="contained"
            style={styles.modalButton}
            onPress={async () => {
              setShowWithdrawModal(!withdrawModalVisible);
              if (genInProgress) {
                return;
              }
              setGenInProgress(true);
              try {
                if (!cashAppProgram || !selectedAccount) {
                  console.warn(
                    "Program/wallet is not initialized yet. Try connecting a wallet first.",
                  );
                  return;
                }
                const deposit = await withdrawFunds(cashAppProgram);

                alertAndLog(
                  "Funds withdrawn from cash account ",
                  "See console for logged transaction.",
                );
                console.log(deposit);
              } finally {
                setGenInProgress(false);
              }
            }}
          >
            Withdraw
          </Button>
          <TouchableOpacity
            style={{ position: "absolute", bottom: 25 }}
            onPress={() => setShowWithdrawModal(false)}
          >
            <Button>Close</Button>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  return (
    <>
      <View style={styles.buttonRow}>
        <DepositModal />
        <WithdrawModal />
      </View>
    </>
  );
}
```

That wraps up all the functionality we need on the home screen for a Cash App
clone. Now we can move onto the pay screen, which involves transferring funds
from one user to another.

#### Pay Component

For the pay page, we'll need to call the `transferFunds` function from the cash
app Solana program. To do this, we'll be using the same process that was
described for `depositFunds`. However, the `TransferFunds` struct described in
the CashApp Solana Program requires 2 `cash_account` accounts rather than the
one account that is required for `depositFunds`. So what needs to change is
simply to add calculations of the PDAs of both the sender account and the
recipient's account, as shown below:

```tsx
const [recipientPDA] = useMemo(() => {
  const recipientSeed = [Buffer.from("cash-account"), recipient.toBuffer()];
  return PublicKey.findProgramAddressSync([recipientSeed], cashAppProgramId);
}, [cashAppProgramId]);

const transferInstruction = await program.methods
  .transferFunds(pubkey, newTransferAmount)
  .accounts({
    user: authorizationResult.publicKey,
    fromCashAccount: cashAppPDA,
    toCashAccount: recipientPDA,
  })
  .instruction();
```

In order to calculate the recipient's PDA, the public key of the recipient must
be passed through as a parameter of the `transferFunds` function, along with the
amount to transfer and the public key of the signer.

#### Request Component

For the request page, we'll need to call the `newRequest` function from the cash
app Solana program. This function also requires multiple accounts. Here you'll
need the `pending_request` account and the `cash_account` of the signer.

```tsx
const [pendingRequestPDA] = useMemo(() => {
  const pendingRequestSeed = [
    Buffer.from("pending-request"),
    requester.toBuffer(),
  ];
  return PublicKey.findProgramAddressSync(
    [pendingRequestSeed],
    cashAppProgramId,
  );
}, [cashAppProgramId]);

const requestInstruction = await program.methods
  .newPendingRequest(pubkey, requestAmount)
  .accounts({
    user: authorizationResult.publicKey,
    pendingRequest: pendingRequestPDA,
    cashAccount: cashAppPDA,
  })
  .instruction();
```

#### Accept and Decline Request Components

A user will interact with their pending payment requests on the activity page.

```tsx
const acceptInstruction = await program.methods
  .acceptRequest()
  .accounts({
    user: authorizationResult.publicKey,
    pendingRequest: pendingRequestPDA,
    toCashAccount: recipientPDA,
    fromCashAccount: cashAppPDA,
  })
  .instruction();

const declineInstruction = await program.methods
  .declineRequest()
  .accounts({
    user: authorizationResult.publicKey,
    pendingRequest: pendingRequestPDA,
  })
  .instruction();
```

### Creating Screens

#### Payment Screen

In Cash App, the payment screen is simply a key pad with `request` and `pay`
buttons that take the user input value and redirects you to another screen.

So the pay screen is mainly some UI work. We need to be able to type in a
numerical value via a keyboard, handle the input value, select currency via a
small modal, and navigate to the request and pay pages via buttons. Here is the
code below:

```tsx
type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

type Props = {
  navigation: HomeScreenNavigationProp;
};

const App: React.FC<Props> = ({ navigation }) => {
  const [inputValue, setInputValue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const handleInput = (value: string) => {
    setInputValue(inputValue + value);
  };

  const handleBackspace = () => {
    setInputValue(inputValue.slice(0, -1));
  };

  type NumberButtonProps = {
    number: string;
  };

  const NumberButton: React.FC<NumberButtonProps> = ({ number }) => (
    <TouchableOpacity style={styles.button} onPress={() => handleInput(number)}>
      <Text style={styles.buttonText}>{number}</Text>
    </TouchableOpacity>
  );

  const CurrencySelectorModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.bottomView}>
        <View style={styles.modalView}>
          <Text style={styles.buttonText}>Select Currency</Text>
          <View style={styles.centeredView}>
            <TouchableOpacity
              style={styles.fullWidthButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.currencyText}>
                {" "}
                <MaterialCommunityIcon
                  name="currency-usd"
                  size={30}
                  color="white"
                />
                US Dollars
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fullWidthButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.currencyText}>
                {" "}
                <MaterialCommunityIcon name="bitcoin" size={30} color="white" />
                Bitcoin
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{ position: "absolute", bottom: 25 }}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.mediumButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <CurrencySelectorModal />
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>${inputValue || "0"}</Text>
        <TouchableOpacity
          style={{ position: "relative", marginTop: 15 }}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.smallButtonText}>
            USD{" "}
            <MaterialCommunityIcon
              name="chevron-down"
              size={15}
              color="white"
            />
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.keypad}>
        <View style={styles.row}>
          {[1, 2, 3].map(number => (
            <NumberButton key={number} number={number.toString()} />
          ))}
        </View>
        <View style={styles.row}>
          {[4, 5, 6].map(number => (
            <NumberButton key={number} number={number.toString()} />
          ))}
        </View>
        <View style={styles.row}>
          {[7, 8, 9].map(number => (
            <NumberButton key={number} number={number.toString()} />
          ))}
        </View>
        <View style={styles.row}>
          <NumberButton number="." />
          <NumberButton number="0" />
          <TouchableOpacity style={styles.button} onPress={handleBackspace}>
            <Text style={styles.buttonText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          style={styles.sideButton}
          onPress={() => navigation.navigate("Receive", { inputValue })}
        >
          Request
        </Button>
        <Button
          mode="contained"
          style={styles.sideButton}
          onPress={() => navigation.navigate("Send", { inputValue })}
        >
          Pay
        </Button>
      </View>
    </View>
  );
};
```

In the above code, the `Request` and `Pay` buttons redirect you to new pages to
complete your transaction, similar to the Cash App UX.

#### Request and Pay Screens

The `Request` and `Pay` Screens need to take in your input value from the
previous Payment screen and use it to execute the `transferFunds` and
`newPaymentRequest` instructions.

```tsx
const PayScreen: React.FC<Props> = ({ route, navigation }) => {
  const [reason, setReason] = useState("");
  const { inputValue } = route.params;
  const [genInProgress, setGenInProgress] = useState(false);
  const [userName, setUserName] = useState("");
  const newAmount = new anchor.BN(inputValue);

  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com"),
  );
  const { authorizeSession, selectedAccount } = useAuthorization();
  const user = selectedAccount.publicKey;
  const { cashAppProgram, cashAppPDA } = UseCashAppProgram(user);

  const transferFunds = useCallback(
    async (program: Program<CashApp>) => {
      let signedTransactions = await transact(
        async (wallet: Web3MobileWallet) => {
          const [authorizationResult, latestBlockhash] = await Promise.all([
            authorizeSession(wallet),
            connection.getLatestBlockhash(),
          ]);

          const { pubkey } = getDomainKeySync(userName);
          console.log(pubkey);
          console.log(newAmount);

          const transferInstruction = await program.methods
            .transferFunds(pubkey, newAmount)
            .accounts({
              user: authorizationResult.publicKey,
              fromCashAccount: cashAppPDA,
            })
            .instruction();

          const transferTransaction = new Transaction({
            ...latestBlockhash,
            feePayer: authorizationResult.publicKey,
          }).add(transferInstruction);

          const signedTransactions = await wallet.signTransactions({
            transactions: [transferTransaction],
          });

          return signedTransactions[0];
        },
      );

      let txSignature = await connection.sendRawTransaction(
        signedTransactions.serialize(),
        {
          skipPreflight: true,
        },
      );

      const confirmationResult = await connection.confirmTransaction(
        txSignature,
        "confirmed",
      );

      if (confirmationResult.value.err) {
        throw new Error(JSON.stringify(confirmationResult.value.err));
      } else {
        console.log("Transaction successfully submitted!");
      }
    },
    [authorizeSession, connection, cashAppPDA],
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>${inputValue}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            if (genInProgress) {
              return;
            }
            setGenInProgress(true);
            try {
              if (!cashAppProgram || !selectedAccount) {
                console.warn(
                  "Program/wallet is not initialized yet. Try connecting a wallet first.",
                );
                return;
              }
              const deposit = await transferFunds(cashAppProgram);

              alertAndLog(
                "Funds deposited into cash account ",
                "See console for logged transaction.",
              );
              console.log(deposit);
            } finally {
              setGenInProgress(false);
            }
          }}
        >
          <Text style={styles.buttonText}>Pay</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>To:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setUserName}
          value={userName}
          placeholder="User"
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>For:</Text>
        <TextInput
          style={styles.input}
          onChangeText={setReason}
          value={reason}
          placeholder="Memo"
          placeholderTextColor="#999"
        />
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.regular}>Enable purchase protection:</Text>
        <Switch
          value={purchaseProtection}
          onValueChange={setPurchaseProtection}
          trackColor={{ false: "#767577", true: "#7F5AF0" }}
          thumbColor={purchaseProtection ? "#7F5AF0" : "#f4f3f4"}
        />
      </View>
    </View>
  );
};

export default PayScreen;
```

For the RequestScreen, you'll follow the same process except you will use the
`newPaymentRequest` instruction instead of the `transferFunds` instruction.

Try this out, then check your work here:

#### Activity Screen

The Activity Screen will allow you to add friends, see pending payment requests,
accept requests, and decline requests.

For the Add Friend Feature, you'll want a text box for a user to input the
pubkey of the friend they want to add and a button that calls the add friend
instruction.

```tsx
export function AddFriend({ address }: { address: PublicKey }) {
  const [pubkey, setPubkey] = useState("");
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [connection] = useState(
    () => new Connection("https://api.devnet.solana.com"),
  );
  const { authorizeSession, selectedAccount } = useAuthorization();
  const { cashAppProgram, cashAppPDA, friends } = UseCashAppProgram(address);
  const user = friends.data?.balance;

  const addFriend = useCallback(
    async (program: Program<CashApp>) => {
      let signedTransactions = await transact(
        async (wallet: Web3MobileWallet) => {
          const [authorizationResult, latestBlockhash] = await Promise.all([
            authorizeSession(wallet),
            connection.getLatestBlockhash(),
          ]);

          const addFriendIX = await program.methods
            .addFriend(pubkey)
            .accounts({
              user: authorizationResult.publicKey,
              cashAccount: cashAppPDA,
            })
            .instruction();

          const addFriendTX = new Transaction({
            ...latestBlockhash,
            feePayer: authorizationResult.publicKey,
          }).add(addFriendIX);

          const signedTransactions = await wallet.signTransactions({
            transactions: [addFriendTX],
          });

          return signedTransactions[0];
        },
      );

      let txSignature = await connection.sendRawTransaction(
        signedTransactions.serialize(),
        {
          skipPreflight: true,
        },
      );

      const confirmationResult = await connection.confirmTransaction(
        txSignature,
        "confirmed",
      );

      if (confirmationResult.value.err) {
        throw new Error(JSON.stringify(confirmationResult.value.err));
      } else {
        console.log("Transaction successfully submitted!");
      }
    },
    [authorizeSession, connection, cashAppPDA],
  );

  return (
    <View
      style={{
        padding: 5,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Text
        variant="titleMedium"
        style={{
          color: "white",
          marginBottom: 10,
        }}
      >
        {" "}
        Add New Friend:
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TextInput
          value={pubkey}
          onChangeText={setPubkey}
          style={{
            marginBottom: 10,
            marginTop: 10,
            backgroundColor: "#f0f0f0",
            height: 40,
            padding: 10,
            fontSize: 18,
            width: "60%",
            marginLeft: 20,
            marginRight: 20,
          }}
        />
        <Button
          mode="contained"
          disabled={signingInProgress}
          onPress={async () => {
            if (signingInProgress) {
              return;
            }
            setSigningInProgress(true);
            try {
              const signedTransaction = await addFriend(cashAppProgram);
              alertAndLog(
                "Transaction signed",
                "View recent transactions for more information.",
              );
              console.log(signedTransaction);
            } catch (err: any) {
              alertAndLog(
                "Error during signing",
                err instanceof Error ? err.message : err,
              );
            } finally {
              setSigningInProgress(false);
            }
          }}
        >
          Add
        </Button>
      </View>
    </View>
  );
}
```

To accept and decline requests, you'll follow a very similar method. Try this
out yourself and then check the code here to review your work
[here](https://github.com/solana-developers/cash-app-clone/blob/main/cash-app/src/components/solana-pay/solana-pay-ui.tsx):

## Enabling QR Code functionality with Solana Pay

To mimic the QR code functionality in Cash App, you can simply use the
`@solana/pay` JavaScript SDK. For more information, refer to the
[Solana Pay API Reference](https://docs.solanapay.com/api/core).

The `encodeURL` function takes in an amount and a memo to encode a Solana Pay
URL for a specific transaction.

Typically, this function is paired with `createQR` to generate a QR code with
the Solana Pay URL. As of today, Solana Pay's current version of the `createQR`
function is not compatible with react-native, so we will need to use a different
QR code generator that is react-native compatible. In this guide, we'll input
the url into `QRCode` from `react-native-qrcode-svg`. It does not have the same
QR code styling as the Solana Pay `createQR`, but it still correctly generates
the needed QR code.

For simplicity, this functionality will live on its own screen, which we already
defined earlier as the Scan Screen. Similarly to the home screen, navigate to
`ScanScreen.tsx` and set up the following function:

```tsx
export function ScanScreen() {
  const { selectedAccount } = useAuthorization();

  return (
    <View style={styles.container}>
      {selectedAccount ? (
        <View style={styles.container}>
          <SolanaPayButton address={selectedAccount.publicKey} />
        </View>
      ) : (
        <>
          <Text style={styles.headerTextLarge}>Solana Cash App</Text>
          <Section description="Sign in with Solana (SIWS) to link your wallet." />
          <SignInFeature />
        </>
      )}
    </View>
  );
}
```

Now we need to create the `SolanaPayButton` component. Create a file under
`src/components/solana-pay/solana-pay-ui.tsx`. In Cash App, the QR code is just
a link to the users Cash App profile and is a static image in the app. However,
the solana pay QR code is actually uniquely generated for each requested
transaction, so the QR displayed includes the amount, memo, and the recipient's
public key information. So our UI/UX will function slightly different than cash
app in this section.

To still follow the look and feel of Cash App, we'll allow most of the screen to
display the QR code and have a button at the bottom for a modal that has amount
and memo input fields and a generate QR code button. On clicking the "Create QR"
button, we'll want to generate a new Solana Pay URL and send that value outside
of the modal to the Scan Screen so that the screen will render and display the
new QR code.

We can do this with the Solana Pay API, state handling, conditional rendering,
and data submission between the two components, as shown below:

```tsx
export function SolanaPayButton({ address }: { address: PublicKey }) {
  const [showPayModal, setShowPayModal] = useState(false);

  const [url, setUrl] = useState("");

  return (
    <>
      <View>
        <View
          style={{
            height: 200,
            width: 200,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
            marginBottom: 200,
            marginTop: 200,
          }}
        >
          {url ? (
            <>
              <View
                style={{
                  height: 350,
                  width: 350,
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "center",
                  backgroundColor: "#333",
                  borderRadius: 25,
                }}
              >
                <QRCode
                  value={url}
                  size={300}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            </>
          ) : (
            <View
              style={{
                height: 350,
                width: 350,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#ccc",
                backgroundColor: "#333",
                borderRadius: 25,
              }}
            >
              <Text style={styles.text2}> Generate a QR Code to display. </Text>
            </View>
          )}
          <Text style={styles.text}> Scan to Pay </Text>
        </View>
        <SolanaPayModal
          hide={() => setShowPayModal(false)}
          show={showPayModal}
          address={address}
          setParentUrl={setUrl}
        />
        <Button
          mode="contained"
          onPress={() => setShowPayModal(true)}
          style={styles.button}
        >
          Create New QR Code
        </Button>
      </View>
    </>
  );
}

export function SolPayModal({
  hide,
  show,
  address,
  setParentUrl,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
  setParentUrl: (url: string) => void;
}) {
  const [memo, setMemo] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    const number = BigNumber(amount);
    const newUrl = encodeURL({
      recipient: address,
      amount: number,
      memo,
    }).toString();
    setParentUrl(newUrl);
    hide();
  };

  return (
    <AppModal
      title="Pay"
      hide={hide}
      show={show}
      submit={handleSubmit}
      submitLabel="Create QR"
      submitDisabled={!memo || !amount}
    >
      <View style={{ padding: 20 }}>
        <TextInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={{ marginBottom: 20, backgroundColor: "#f0f0f0" }}
        />
        <TextInput
          label="Memo"
          value={memo}
          onChangeText={setMemo}
          mode="outlined"
          style={{ marginBottom: 5, backgroundColor: "#f0f0f0" }}
        />
      </View>
    </AppModal>
  );
}
```

## Connecting User Names with Public Keys via Solana Name Service

Solana Name Service _(SNS)_ enables a human-readable name to be mapped to a
Solana address. By implementing SNS, we can easily prompt a user to create a
user name _(which will become their SNS name behind the scenes)_ and that name
will directly map to the users wallet address.

Solana Name Service has two functions that we can implement throughout this dapp
to simplify a lot of the front end:

- `getDomainKeySync` - a function that returns the public key associated with
  the provided domain name. This can be implemented anywhere there is a user
  input for a public key. Now the user only needs to type in a username when
  searching for an account, exactly as you do with Cash App. This is what SNS
  calls a
  [direct lookup](https://sns.guide/domain-name/domain-direct-lookup.html).

- `reverseLookup` - an asynchronous function that returns the domain name of the
  provided public key.This can be implemented anywhere in the UI where you want
  to display the username. This is what SNS calls a
  [reverse lookup](https://sns.guide/domain-name/domain-reverse-lookup.html)

To showcase this, lets update the transfers funds function to now accept a user
name as a parameter rather than a public key and integrate the SNS API.

```tsx
const transferFunds = useCallback(
  async (program: Program<CashApp>) => {
    let signedTransactions = await transact(
      async (wallet: Web3MobileWallet) => {
        const [authorizationResult, latestBlockhash] = await Promise.all([
          authorizeSession(wallet),
          connection.getLatestBlockhash(),
        ]);

        const { pubkey } = getDomainKeySync(userName);

        const [recipientPDA] = useMemo(() => {
          const recipientSeed = pubkey.toBuffer();
          return PublicKey.findProgramAddressSync(
            [recipientSeed],
            cashAppProgramId,
          );
        }, [cashAppProgramId]);

        const transferInstruction = await program.methods
          .transferFunds(pubkey, newTransferAmount)
          .accounts({
            user: authorizationResult.publicKey,
            fromCashAccount: cashAppPDA,
            toCashAccount: recipientPDA,
          })
          .instruction();

        const transferTransaction = new Transaction({
          ...latestBlockhash,
          feePayer: authorizationResult.publicKey,
        }).add(transferInstruction);

        const signedTransactions = await wallet.signTransactions({
          transactions: [transferTransaction],
        });

        return signedTransactions[0];
      },
    );

    let txSignature = await connection.sendRawTransaction(
      signedTransactions.serialize(),
      {
        skipPreflight: true,
      },
    );

    const confirmationResult = await connection.confirmTransaction(
      txSignature,
      "confirmed",
    );

    if (confirmationResult.value.err) {
      throw new Error(JSON.stringify(confirmationResult.value.err));
    } else {
      console.log("Transaction successfully submitted!");
    }
  },
  [authorizeSession, connection, cashAppPDA],
);
```

This implementation can be integrated everywhere in the application where an
input requires a public key, enabling the user experience to be identical to
that of a web2 application.

## Final thoughts

Congrats on completing a a web3 mobile application! By completing this tutorial
you have learned how to build an expo mobile app with a wallet adapter, write
and deploy an anchor solana program, and connect a mobile UI to a deployed
solana program.

To build on this knowledge here are a few more resources to look into:

- [The Anchor Book](https://book.anchor-lang.com/)
- [Solana Guides](https://solana.com/developers/guides)
- [Program Examples](https://github.com/solana-developers/program-examples)
