---
sidebarSortOrder: 2
sidebarLabel: Quick Start
title: Solana Quick Start Guide
---

Welcome to the Solana Quick Start Guide! This hands-on guide will introduce you
to the core concepts for building on Solana, regardless of your prior
experience. By the end of this tutorial, you'll have a basic foundation in
Solana development and be ready to explore more advanced topics.

## What You'll Learn

In this tutorial, you'll learn about:

- Understanding Accounts: Explore how data is stored on the Solana network.
- Sending Transactions: Learn to interact with the Solana network by sending
  transactions.
- Building and Deploying Programs: Create your first Solana program and deploy
  it to the network.
- Program Derived Addresses (PDAs): Learn how to use PDAs to create
  deterministic addresses for accounts.
- Cross-Program Invocations (CPIs): Learn how to make your programs interact
  with other programs on Solana.

The best part? You don't need to install anything! We'll be using Solana
Playground, a browser-based development environment, for all our examples. This
means you can follow along, copy and paste code, and see results immediately,
all from your web browser. Basic programming knowledge is helpful but not
required.

Let's dive in and start building on Solana!

## Solana Playground

Solana Playground (Solpg) is a browser-based development environment that allows
you to quickly develop, deploy, and test Solana programs!

Open a new tab in your web browser and navigate to https://beta.solpg.io/.

### 1. Create Playground Wallet

If you're new to Solana Playground, the first step is to create your Playground
Wallet. This wallet will allow you to interact with the Solana network right
from your browser.

#### Step 1. Connect to Playground

Click the "Not connected" button at the bottom left of the screen.

![Not Connected](/assets/docs/intro/quickstart/pg-not-connected.png)

#### Step 2. Create Your Wallet

You'll see an option to save your wallet's keypair. Optionally, save your
wallet's keypair for backup and then click "Continue".

![Create Playground Wallet](/assets/docs/intro/quickstart/pg-create-wallet.png)

You should now see your wallet's address, SOL balance, and connected cluster
(devnet by default) at the bottom of the window.

![Connected](/assets/docs/intro/quickstart/pg-connected.png)

<Callout>
  Your Playground Wallet will be saved in your browser's local storage. Clearing
  your browser cache will remove your saved wallet.
</Callout>

### 2. Get Devnet SOL

Before we start building, we first need some devnet SOL.

From a developer's perspective, SOL is required for two main use cases:

- To create accounts where we can store data or deploy programs
- To pay for transaction fees when we interact with the network

Below are two methods to fund your wallet with devnet SOL:

#### Option 1: Using the Playground Terminal

To fund your Playground wallet with devnet SOL. In the Playground terminal, run:

```shell filename="Terminal"
solana airdrop 5
```

#### Option 2: Using the Devnet Faucet

If the airdrop command doesn't work (due to rate limits or errors), you can use
the [Web Faucet](https://faucet.solana.com/).

- Enter your wallet address (found at the bottom of the Playground screen) and
  select an amount
- Click "Confirm Airdrop" to receive your devnet SOL

![Faucet Airdrop](/assets/docs/intro/quickstart/faucet-airdrop.gif)

## Reading from network

Now, let's explore how to read data from the Solana network. We'll fetch a few
different accounts to understand the structure of a Solana account.

On Solana, all data is contained in what we call "accounts". You can think of
data on Solana as a public database with a single "Accounts" table, where each
entry in this table is an individual account.

Accounts on Solana can store "state" or "executable" programs, all of which can
be thought of as entries in the same "Accounts" table. Each account has an
"address" (public key) that serves as its unique ID used to locate its
corresponding on-chain data.

Solana accounts contain either:

- State: This is data that's meant to be read from and persisted. It could be
  information about tokens, user data, or any other type of data defined within
  a program.
- Executable Programs: These are accounts that contain the actual code of Solana
  programs. They contain the instructions that can be executed on the network.

This separation of program code and program state is a key feature of Solana's
Account Model. For more details, refer to the
[Solana Account Model](/docs/core/accounts) page.

### 1. Fetch Playground Wallet

Let's start by looking at a familiar account - your own Playground Wallet! We'll
fetch this account and examine its structure to understand what a basic Solana
account looks like.

#### Step 1: Open the Example

Click this [link](https://beta.solpg.io/6671c5e5cffcf4b13384d198) to open the
example in Solana Playground. You'll see this code:

```ts filename="client.ts"
const address = pg.wallet.publicKey;
const accountInfo = await pg.connection.getAccountInfo(address);

console.log(JSON.stringify(accountInfo, null, 2));
```

<details>
{<summary>Explanation</summary>}

This code does three simple things:

- Gets your Playground wallet's address

  ```ts
  const address = pg.wallet.publicKey;
  ```

- Fetches the `AccountInfo` for the account at that address

  ```ts
  const accountInfo = await pg.connection.getAccountInfo(address);
  ```

- Prints out the `AccountInfo` to the Playground terminal

  ```ts
  console.log(JSON.stringify(accountInfo, null, 2));
  ```

</details>

#### Step 2: Run the Code

In the Playground terminal, type the `run` command and hit enter:

```shell filename="Terminal"
run
```

You should see details about your wallet account, including its balance in
lamports, with output similar to the following:

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
$ run
Running client...
  client.ts:
    {
  "data": {
    "type": "Buffer",
    "data": []
  },
  "executable": false,
  "lamports": 5000000000,
  "owner": "11111111111111111111111111111111",
  "rentEpoch": 18446744073709552000,
  "space": 0
}
```

</details>

<details>
{<summary>Explanation</summary>}

Your wallet is actually just an account owned by the System Program, where the
main purpose of the wallet account is to store your SOL balance (amount in the
`lamports` field).

---

At its core, all Solana accounts are represented in a standard format called the
`AccountInfo`. The
[AccountInfo](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/account_info.rs#L19-L36)
data type is the base data structure for all Solana Accounts.

Let's break down the fields in the output:

- `data` - This field contains what we generally refer to as the account "data".
  For a wallet, it's empty (0 bytes), but other accounts use this field to store
  any arbitrary data as a serialized buffer of bytes.
- `executable` - A flag that indicates whether the account is an executable
  program. For wallets and any accounts that store state, this is `false`.
- `owner` - This field shows which program controls the account. For wallets,
  it's always the System Program, with the address
  `11111111111111111111111111111111`.
- `lamports` - The account's balance in lamports (1 SOL = 1,000,000,000
  lamports).
- `rentEpoch` - A legacy field related to Solana's deprecated rent collection
  mechanism (currently not in use).
- `space` - Indicates byte capacity (length) of the `data` field, but is not a
  field in the `AccountInfo` type

</details>

### 2. Fetch Token Program

Next, we'll examine the Token Extensions program, an executable program for
interacting with tokens on Solana.

#### Step 1: Open the Example

Click this [link](https://beta.solpg.io/6671c6e7cffcf4b13384d199) to open the
example in Solana Playground. You'll see this code:

```ts filename="client.ts" {3}
import { PublicKey } from "@solana/web3.js";

const address = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");
const accountInfo = await pg.connection.getAccountInfo(address);

console.log(JSON.stringify(accountInfo, null, 2));
```

Instead of fetching your Playground wallet, here we fetch the address of the
Token Extensions Program account.

#### Step 2: Run the Code

Run the code using the `run` command in the terminal.

```shell filename="Terminal"
run
```

Examine the output and how this program account differs from your wallet
account.

<details>
{<summary>Output</summary>}

```shell filename="Terminal" {15, 17}
$ run
Running client...
  client.ts:
    {
  "data": {
    "type": "Buffer",
    "data": [
      2,
      0,
      //... additional bytes
      86,
      51
    ]
  },
  "executable": true,
  "lamports": 1141440,
  "owner": "BPFLoaderUpgradeab1e11111111111111111111111",
  "rentEpoch": 18446744073709552000,
  "space": 36
}
```

</details>

<details>
{<summary>Explanation</summary>}

The Token Extensions program is an executable program account, but note that it
has the same `AccountInfo` structure.

Key differences in the `AccountInfo`:

- `executable` - Set to `true`, indicating this account represents an executable
  program.
- `data` - Contains serialized data (unlike the empty data in a wallet account).
  The data for a program account stores the address of another account (Program
  Executable Data Account) that contains the program's bytecode.
- `owner` - The account is owned by the Upgradable BPF Loader
  (`BPFLoaderUpgradeab1e11111111111111111111111`), a special program that
  manages executable accounts.

---

You can inspect the Solana Explorer for the
[Token Extensions Program Account](https://explorer.solana.com/address/TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb)
and its corresponding
[Program Executable Data Account](https://explorer.solana.com/address/DoU57AYuPFu2QU514RktNPG22QhApEjnKxnBcu4BHDTY).

The Program Executable Data Account contains the compiled bytecode for the Token
Extensions Program
[source code](https://github.com/solana-labs/solana-program-library/tree/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program-2022/src).

</details>

### 3. Fetch Mint Account

In this step, we'll examine a Mint account, which represents a unique token on
the Solana network.

#### Step 1: Open the Example

Click this [link](https://beta.solpg.io/6671c9aecffcf4b13384d19a) to open the
example in Solana Playground. You'll see this code:

```ts filename="client.ts" {3}
import { PublicKey } from "@solana/web3.js";

const address = new PublicKey("C33qt1dZGZSsqTrHdtLKXPZNoxs6U1ZBfyDkzmj6mXeR");
const accountInfo = await pg.connection.getAccountInfo(address);

console.log(JSON.stringify(accountInfo, null, 2));
```

In this example, we'll fetch the address of an existing Mint account on devnet.

#### Step 2: Run the Code

Run the code using the `run` command.

```shell filename="Terminal"
run
```

<details>
{<summary>Output</summary>}

```shell filename="Terminal" {17}
$ run
Running client...
  client.ts:
    {
  "data": {
    "type": "Buffer",
    "data": [
      1,
      0,
      //... additional bytes
      0,
      0
    ]
  },
  "executable": false,
  "lamports": 4176000,
  "owner": "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  "rentEpoch": 18446744073709552000,
  "space": 430
}
```

</details>

<details>
{<summary>Explanation</summary>}

Key differences in the `AccountInfo`:

- `owner` - The mint account is owned by the Token Extensions program
  (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`).
- `executable` - Set to `false`, as this account stores state rather than
  executable code.
- `data`: Contains serialized data about the token (mint authority, supply,
  decimals, etc.).

</details>

#### 3. Deserialize Mint Account Data

To read the `data` field from any account, you need to deserialize the data
buffer into the expected data type. This is often done using helper functions
from client libraries for a particular program.

Open this next [example](https://beta.solpg.io/6671cd8acffcf4b13384d19b) in
Solana Playground. You'll see this code:

```ts filename="client.ts"
import { PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

const address = new PublicKey("C33qt1dZGZSsqTrHdtLKXPZNoxs6U1ZBfyDkzmj6mXeR");
const mintData = await getMint(
  pg.connection,
  address,
  "confirmed",
  TOKEN_2022_PROGRAM_ID,
);

console.log(mintData);
```

This example uses the `getMint` helper function to automatically deserialize the
data field of the Mint account.

Run the code using the `run` command.

```shell filename="Terminal"
run
```

You should see the following deserialized Mint account data.

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
Running client...
  client.ts:
  { address: { _bn: { negative: 0, words: [Object], length: 10, red: null } },
  mintAuthority: { _bn: { negative: 0, words: [Object], length: 10, red: null } },
  supply: {},
  decimals: 2,
  isInitialized: true,
  freezeAuthority: null,
  tlvData: <Buffer 12 00 40 00 2c 5b 90 b2 42 0c 89 a8 fc 3b 2f d6 15 a8 9d 1e 54 4f 59 49 e8 9e 35 8f ab 88 64 9f 5b db 9c 74 a3 f6 ee 9f 21 a9 76 43 8a ee c4 46 43 3d ... > }
```

</details>

<details>
{<summary>Explanation</summary>}

The `getMint` function deserializes the account data into the
[Mint](https://github.com/solana-labs/solana-program-library/blob/b1c44c171bc95e6ee74af12365cb9cbab68be76c/token/program/src/state.rs#L18-L32)
data type defined in the Token Extensions program source code.

- `address` - The Mint account's address
- `mintAuthority` - The authority allowed to mint new tokens
- `supply` - The total supply of tokens
- `decimals` - The number of decimal places for the token
- `isInitialized` - Whether the Mint data has been initialized
- `freezeAuthority` - The authority allowed to freeze token accounts
- `tlvData` - Additional data for Token Extensions (requires further
  deserialization)

You can view the fully deserialized
[Mint Account](https://explorer.solana.com/address/C33qt1dZGZSsqTrHdtLKXPZNoxs6U1ZBfyDkzmj6mXeR?cluster=devnet)
data, including enabled Token Extensions, on the Solana Explorer.

</details>

## Writing to network

Now that we've explored reading from the Solana network, let's learn how to
write data to it. On Solana, we interact with the network by sending
transactions made up of instructions. These instructions are defined by
programs, which contain the business logic for how accounts should be updated.

Let's walk through two common operations, transferring SOL and creating a token,
to demonstrate how to build and send transactions. For more details, refer to
the [Transactions and Instructions](/docs/core/transactions) and
[Fees on Solana](/docs/core/fees) pages.

### 1. Transfer SOL

We'll start with a simple SOL transfer from your wallet to another account. This
requires invoking the transfer instruction on the System Program.

Click this [link](https://beta.solpg.io/6671d85ecffcf4b13384d19e) to open the
example in Solana Playground. You'll see this code:

```ts filename="client.ts"
import {
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  Keypair,
} from "@solana/web3.js";

const sender = pg.wallet.keypair;
const receiver = new Keypair();

const transferInstruction = SystemProgram.transfer({
  fromPubkey: sender.publicKey,
  toPubkey: receiver.publicKey,
  lamports: 0.01 * LAMPORTS_PER_SOL,
});

const transaction = new Transaction().add(transferInstruction);

const transactionSignature = await sendAndConfirmTransaction(
  pg.connection,
  transaction,
  [sender],
);

console.log(
  "Transaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

<details>
{<summary>Explanation</summary>}

This script does the following:

- Sets your Playground wallet as the sender

  ```ts
  const sender = pg.wallet.keypair;
  ```

- Creates a new keypair as the receiver

  ```ts
  const receiver = new Keypair();
  ```

- Constructs a transfer instruction to transfer 0.01 SOL

  ```ts
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: sender.publicKey,
    toPubkey: receiver.publicKey,
    lamports: 0.01 * LAMPORTS_PER_SOL,
  });
  ```

- Builds a transaction including the transfer instruction

  ```ts
  const transaction = new Transaction().add(transferInstruction);
  ```

- Sends and confirms the transaction

  ```ts
  const transactionSignature = await sendAndConfirmTransaction(
    pg.connection,
    transaction,
    [sender],
  );
  ```

- Prints out a link to the SolanaFM explorer in the Playground terminal to view
  the transaction details

  ```ts
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );
  ```

</details>

Run the code using the `run` command.

```shell filename="Terminal"
run
```

Click on the output link to view the transaction details on the SolanaFM
explorer.

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
Running client...
  client.ts:
    Transaction Signature: https://solana.fm/tx/he9dBwrEPhrfrx2BaX4cUmUbY22DEyqZ837zrGrFRnYEBmKhCb5SvoaUeRKSeLFXiGxC8hFY5eDbHqSJ7NYYo42?cluster=devnet-solana
```

</details>

![Transfer SOL](/assets/docs/intro/quickstart/transfer-sol.png)

You've just sent your first transaction on Solana! Notice how we created an
instruction, added it to a transaction, and then sent that transaction to the
network. This is the basic process for building any transaction.

### 2. Create a Token

Now, let's create a new token by creating and initializing a Mint account. This
requires two instructions:

- Invoke the System Program to create a new account
- Invoke the Token Extensions Program

Click this [link](https://beta.solpg.io/6671da4dcffcf4b13384d19f) to open the
example in Solana Playground. You'll see the following code:

```ts filename="client.ts"
import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_2022_PROGRAM_ID,
  createInitializeMint2Instruction,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";

const wallet = pg.wallet;
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Generate keypair to use as address of mint account
const mint = new Keypair();

// Calculate minimum lamports for space required by mint account
const rentLamports = await getMinimumBalanceForRentExemptMint(connection);

// Instruction to create new account with space for new mint account
const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: wallet.publicKey,
  newAccountPubkey: mint.publicKey,
  space: MINT_SIZE,
  lamports: rentLamports,
  programId: TOKEN_2022_PROGRAM_ID,
});

// Instruction to initialize mint account
const initializeMintInstruction = createInitializeMint2Instruction(
  mint.publicKey,
  2, // decimals
  wallet.publicKey, // mint authority
  wallet.publicKey, // freeze authority
  TOKEN_2022_PROGRAM_ID,
);

// Build transaction with instructions to create new account and initialize mint account
const transaction = new Transaction().add(
  createAccountInstruction,
  initializeMintInstruction,
);

const transactionSignature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [
    wallet.keypair, // payer
    mint, // mint address keypair
  ],
);

console.log(
  "\nTransaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);

console.log(
  "\nMint Account:",
  `https://solana.fm/address/${mint.publicKey}?cluster=devnet-solana`,
);
```

<details>
{<summary>Explanation</summary>}

This script performs the following steps:

- Sets up your Playground wallet and a connection to the Solana devnet

  ```ts
  const wallet = pg.wallet;
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  ```

- Generates a new keypair for the mint account

  ```ts
  const mint = new Keypair();
  ```

- Calculates the minimum lamports needed for a Mint account

  ```ts
  const rentLamports = await getMinimumBalanceForRentExemptMint(connection);
  ```

- Creates an instruction to create a new account for the mint, specifying the
  Token Extensions program (`TOKEN_2022_PROGRAM_ID`) as the owner of the new
  account

  ```ts
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: mint.publicKey,
    space: MINT_SIZE,
    lamports: rentLamports,
    programId: TOKEN_2022_PROGRAM_ID,
  });
  ```

- Creates an instruction to initialize the mint account data

  ```ts
  const initializeMintInstruction = createInitializeMint2Instruction(
    mint.publicKey,
    2,
    wallet.publicKey,
    wallet.publicKey,
    TOKEN_2022_PROGRAM_ID,
  );
  ```

- Adds both instructions to a single transaction

  ```ts
  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeMintInstruction,
  );
  ```

- Sends and confirms the transaction. Both the wallet and mint keypair are
  passed in as signers on the transaction. The wallet is required to pay for the
  creation of the new account. The mint keypair is required because we are using
  its publickey as the address of the new account.

  ```ts
  const transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet.keypair, mint],
  );
  ```

- Prints out links to view the transaction and mint account details on SolanaFM

  ```ts
  console.log(
    "\nTransaction Signature:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );

  console.log(
    "\nMint Account:",
    `https://solana.fm/address/${mint.publicKey}?cluster=devnet-solana`,
  );
  ```

</details>

Run the code using the `run` command.

```shell filename="Terminal"
run
```

You'll see two links printed to the Playground terminal:

- One for the transaction details
- One for the newly created mint account

Click the links to inspect the transaction details and the newly created mint
account on SolanaFM.

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
Running client...
  client.ts:

Transaction Signature: https://solana.fm/tx/3BEjFxqyGwHXWSrEBnc7vTSaXUGDJFY1Zr6L9iwLrjH8KBZdJSucoMrFUEJgWrWVRYzrFvbjX8TmxKUV88oKr86g?cluster=devnet-solana

Mint Account: https://solana.fm/address/CoZ3Nz488rmATDhy1hPk5fvwSZaipCngvf8rYBYVc4jN?cluster=devnet-solana
```

</details>

![Create Token](/assets/docs/intro/quickstart/create-token.png)

![Mint Account](/assets/docs/intro/quickstart/mint-account.png)

Notice how we built a transaction with multiple instructions this time. We first
created a new account and then initialized its data as a mint. This is how you
build more complex transactions that involve instructions from multiple
programs.

## Deploying Your First Solana Program

In this section, we'll build, deploy, and test a simple Solana program using the
Anchor framework. By the end, you'll have deployed your first program to the
Solana blockchain!

The purpose of this section is to familiarize you with the Solana Playground.
We'll walk through a more detailed example in the PDA and CPI sections. For more
details, refer to the [Programs on Solana](/docs/core/programs) page.

### 1. Create Anchor Project

First, open https://beta.solpg.io in a new browser tab.

- Click the "Create a new project" button on the left-side panel.

- Enter a project name, select Anchor as the framework, then click the "Create"
  button.

![New Project](/assets/docs/intro/quickstart/pg-new-project.gif)

You'll see a new project created with the program code in the `src/lib.rs` file.

```rust filename="lib.rs"
use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data); // Message will show up in the tx logs
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 8 bytes come from NewAccount.data being type u64.
    // (u64 = 64 bits unsigned integer = 8 bytes)
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64
}
```

<details>
{<summary>Explanation</summary>}

For now, we'll only cover the high-level overview of the program code:

- The `declare_id!` macro specifies the on-chain address of your program. It
  will be automatically updated when we build the program in the next step.

  ```rs
  declare_id!("11111111111111111111111111111111");
  ```

- The `#[program]` macro annotates a module containing functions that represent
  the program's instructions.

  ```rs
  #[program]
  mod hello_anchor {
      use super::*;
      pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> {
          ctx.accounts.new_account.data = data;
          msg!("Changed data to: {}!", data); // Message will show up in the tx logs
          Ok(())
      }
  }
  ```

  In this example, the `initialize` instruction takes two parameters:

  1. `ctx: Context<Initialize>` - Provides access to the accounts required for
     this instruction, as specified in the `Initialize` struct.
  2. `data: u64` - An instruction parameter that will be passed in when the
     instruction is invoked.

  The function body sets the `data` field of `new_account` to the provided
  `data` argument and then prints a message to the program logs.

- The `#[derive(Accounts)]` macro is used to define a struct that specifies the
  accounts required for a particular instruction, where each field represents a
  separate account.

  The field types (ex. `Signer<'info>`) and constraints (ex. `#[account(mut)]`)
  are used by Anchor to automatically handle common security checks related to
  account validation.

  ```rs
  #[derive(Accounts)]
  pub struct Initialize<'info> {
      #[account(init, payer = signer, space = 8 + 8)]
      pub new_account: Account<'info, NewAccount>,
      #[account(mut)]
      pub signer: Signer<'info>,
      pub system_program: Program<'info, System>,
  }
  ```

- The `#[account]` macro is used to define a struct that represents the data
  structure of an account created and owned by the program.

  ```rs
  #[account]
  pub struct NewAccount {
    data: u64
  }
  ```

</details>

### 2. Build and Deploy Program

To build the program, simply run `build` in the terminal.

```shell filename="Terminal"
build
```

Notice that the address in `declare_id!()` has been updated. This is your
program's on-chain address.

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
$ build
Building...
Build successful. Completed in 1.46s.
```

</details>

Once the program is built, run `deploy` in the terminal to deploy the program to
the network (devnet by default). To deploy a program, SOL must be allocated to
the on-chain account that stores the program.

Before deployment, ensure you have enough SOL. You can get devnet SOL by either
running `solana airdrop 5` in the Playground terminal or using the
[Web Faucet](https://faucet.solana.com/).

```shell filename="Terminal"
deploy
```

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
$ deploy
Deploying... This could take a while depending on the program size and network conditions.
Warning: 1 transaction not confirmed, retrying...
Deployment successful. Completed in 19s.
```

</details>

Alternatively, you can also use the `Build` and `Deploy` buttons on the
left-side panel.

![Build and Deploy](/assets/docs/intro/quickstart/pg-build-deploy.png)

Once the program is deployed, you can now invoke its instructions.

### 3. Test Program

Included with the starter code is a test file found in `tests/anchor.test.ts`.
This file demonstrates how to invoke the `initialize` instruction on the starter
program from the client.

```ts filename="anchor.test.ts"
// No imports needed: web3, anchor, pg and more are globally available

describe("Test", () => {
  it("initialize", async () => {
    // Generate keypair for the new account
    const newAccountKp = new web3.Keypair();

    // Send transaction
    const data = new BN(42);
    const txHash = await pg.program.methods
      .initialize(data)
      .accounts({
        newAccount: newAccountKp.publicKey,
        signer: pg.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([newAccountKp])
      .rpc();
    console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

    // Confirm transaction
    await pg.connection.confirmTransaction(txHash);

    // Fetch the created account
    const newAccount = await pg.program.account.newAccount.fetch(
      newAccountKp.publicKey,
    );

    console.log("On-chain data is:", newAccount.data.toString());

    // Check whether the data on-chain is equal to local 'data'
    assert(data.eq(newAccount.data));
  });
});
```

To run the test file once the program is deployed, run `test` in the terminal.

```shell filename="Terminal"
test
```

You should see an output indicating that the test passed successfully.

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
$ test
Running tests...
  hello_anchor.test.ts:
  hello_anchor
    Use 'solana confirm -v 3TewJtiUz1EgtT88pLJHvKFzqrzDNuHVi8CfD2mWmHEBAaMfC5NAaHdmr19qQYfTiBace6XUmADvR4Qrhe8gH5uc' to see the logs
    On-chain data is: 42
    ✔ initialize (961ms)
  1 passing (963ms)
```

</details>

You can also use the `Test` button on the left-side panel.

![Run Test](/assets/docs/intro/quickstart/pg-test.png)

You can then view the transaction logs by running the `solana confirm -v`
command and specifying the transaction hash (signature) from the test output:

```shell filename="Terminal"
solana confirm -v [TxHash]
```

For example:

```shell filename="Terminal"
solana confirm -v 3TewJtiUz1EgtT88pLJHvKFzqrzDNuHVi8CfD2mWmHEBAaMfC5NAaHdmr19qQYfTiBace6XUmADvR4Qrhe8gH5uc
```

<details>
{<summary>Output</summary>}

```shell filename="Terminal" {29-35}
$ solana confirm -v 3TewJtiUz1EgtT88pLJHvKFzqrzDNuHVi8CfD2mWmHEBAaMfC5NAaHdmr19qQYfTiBace6XUmADvR4Qrhe8gH5uc
RPC URL: https://api.devnet.solana.com
Default Signer: Playground Wallet
Commitment: confirmed

Transaction executed in slot 308150984:
  Block Time: 2024-06-25T12:52:05-05:00
  Version: legacy
  Recent Blockhash: 7AnZvY37nMhCybTyVXJ1umcfHSZGbngnm4GZx6jNRTNH
  Signature 0: 3TewJtiUz1EgtT88pLJHvKFzqrzDNuHVi8CfD2mWmHEBAaMfC5NAaHdmr19qQYfTiBace6XUmADvR4Qrhe8gH5uc
  Signature 1: 3TrRbqeMYFCkjsxdPExxBkLAi9SB2pNUyg87ryBaTHzzYtGjbsAz9udfT9AkrjSo1ZjByJgJHBAdRVVTZv6B87PQ
  Account 0: srw- 3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R (fee payer)
  Account 1: srw- c7yy8zdP8oeZ2ewbSb8WWY2yWjDpg3B43jk3478Nv7J
  Account 2: -r-- 11111111111111111111111111111111
  Account 3: -r-x 2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r
  Instruction 0
    Program:   2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r (3)
    Account 0: c7yy8zdP8oeZ2ewbSb8WWY2yWjDpg3B43jk3478Nv7J (1)
    Account 1: 3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R (0)
    Account 2: 11111111111111111111111111111111 (2)
    Data: [175, 175, 109, 31, 13, 152, 155, 237, 42, 0, 0, 0, 0, 0, 0, 0]
  Status: Ok
    Fee: ◎0.00001
    Account 0 balance: ◎5.47001376 -> ◎5.46900152
    Account 1 balance: ◎0 -> ◎0.00100224
    Account 2 balance: ◎0.000000001
    Account 3 balance: ◎0.00139896
  Log Messages:
    Program 2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r invoke [1]
    Program log: Instruction: Initialize
    Program 11111111111111111111111111111111 invoke [2]
    Program 11111111111111111111111111111111 success
    Program log: Changed data to: 42!
    Program 2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r consumed 5661 of 200000 compute units
    Program 2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r success

Confirmed
```

</details>

Alternatively, you can view the transaction details on
[SolanaFM](https://solana.fm/) or
[Solana Explorer](https://explorer.solana.com/?cluster=devnet) by searching for
the transaction signature (hash).

<Callout>
  Reminder to update the cluster (network) connection on the Explorer you are
  using to match Solana Playground. Solana Playground's default cluster is devnet.
</Callout>

### 4. Close Program

Lastly, the SOL allocated to the on-chain program can be fully recovered by
closing the program.

You can close a program by running the following command and specifying the
program address found in `declare_id!()`:

```shell filename="Terminal"
solana program close [ProgramID]
```

For example:

```shell filename="Terminal"
solana program close 2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r
```

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
$ solana program close 2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r
Closed Program Id 2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r, 2.79511512 SOL reclaimed
```

</details>

<details>
{<summary>Explanation</summary>}

Only the upgrade authority of the program can close it. The upgrade authority is
set when the program is deployed, and it's the only account with permission to
modify or close the program. If the upgrade authority is revoked, then the
program becomes immutable and can never be closed or upgraded.

When deploying programs on Solana Playground, your Playground wallet is the
upgrade authority for all your programs.

</details>

Congratulations! You've just built and deployed your first Solana program using
the Anchor framework!

## Program Derived Address

In this section, we'll walk through how to build a basic CRUD (Create, Read,
Update, Delete) program. The program will store a user's message using a Program
Derived Address (PDA) as the account's address.

The purpose of this section is to guide you through the steps for building and
testing a Solana program using the Anchor framework and demonstrating how to use
PDAs within a program. For more details, refer to the
[Programs Derived Address](/docs/core/pda) page.

For reference, here is the
[final code](https://beta.solpg.io/668304cfcffcf4b13384d20a) after completing
both PDA and CPI sections.

### 1. Starter Code

Begin by opening this
[Solana Playground link](https://beta.solpg.io/66734b7bcffcf4b13384d1ad) with
the starter code. Then click the "Import" button, which will add the program to
your list of projects on Solana Playground.

![Import](/assets/docs/intro/quickstart/pg-import.png)

In the `lib.rs` file, you'll find a program scaffolded with the `create`,
`update`, and `delete` instructions we'll implement in the following steps.

```rs filename="lib.rs"
use anchor_lang::prelude::*;

declare_id!("8KPzbM2Cwn4Yjak7QYAEH9wyoQh86NcBicaLuzPaejdw");

#[program]
pub mod pda {
    use super::*;

    pub fn create(_ctx: Context<Create>) -> Result<()> {
        Ok(())
    }

    pub fn update(_ctx: Context<Update>) -> Result<()> {
        Ok(())
    }

    pub fn delete(_ctx: Context<Delete>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Create {}

#[derive(Accounts)]
pub struct Update {}

#[derive(Accounts)]
pub struct Delete {}

#[account]
pub struct MessageAccount {}
```

Before we begin, run `build` in the Playground terminal to check the starter
program builds successfully.

```shell filename="Terminal"
build
```

<details>
{<summary>Output</summary>}

```shell filename="Terminal"
$ build
Building...
Build successful. Completed in 3.50s.
```

</details>

### 2. Define Message Account Type

First, let's define the structure for the message account that our program will
create. This is the data that we'll store in the account created by the program.

In `lib.rs`, update the `MessageAccount` struct with the following:

```rs filename="lib.rs"
#[account]
pub struct MessageAccount {
    pub user: Pubkey,
    pub message: String,
    pub bump: u8,
}
```

<details>
{<summary>Diff</summary>}

```diff
- #[account]
- pub struct MessageAccount {}

+ #[account]
+ pub struct MessageAccount {
+    pub user: Pubkey,
+    pub message: String,
+    pub bump: u8,
+ }
```

</details>

<details>
{<summary>Explanation</summary>}

The `#[account]` macro in an Anchor program is used to annotate structs that
represent account data (data type to store in the AccountInfo's data field).

In this example, we're defining a `MessageAccount` struct to store a message
created by users that contains three fields:

- `user`: A Pubkey representing the user who created the message account.
- `message`: A String containing the user's message.
- `bump`: A u8 storing the "bump" seed used in deriving the program derived
  address (PDA). Storing this value saves compute by eliminating the need to
  rederive it for each use in subsequent instructions.
- `user` - A Pubkey representing the user who created the message account.
- `message` - A String containing the user's message.
- `bump` - A u8 storing the ["bump" seed](/docs/core/pda#canonical-bump) used in
  deriving the program derived address (PDA). Storing this value saves compute
  by eliminating the need to rederive it for each use in subsequent
  instructions. When an account is created, the `MessageAccount` data will be
  serialized and stored in the new account's data field.

Later, when reading from the account, this data can be deserialized back into
the `MessageAccount` data type. The process of creating and reading the account
data will be demonstrated in the testing section.

</details>

Build the program again by running `build` in the terminal.

```shell filename="Terminal"
build
```

We've defined what our message account will look like. Next, we'll implement the
program instructions.

### 3. Implement Create Instruction

Now, let's implement the `create` instruction to create and initialize the
`MessageAccount`.

Start by defining the accounts required for the instruction by updating the
`Create` struct with the following:

```rs filename="lib.rs"
#[derive(Accounts)]
#[instruction(message: String)]
pub struct Create<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [b"message", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 4 + message.len() + 1
    )]
    pub message_account: Account<'info, MessageAccount>,
    pub system_program: Program<'info, System>,
}
```

<details>
{<summary>Diff</summary>}

```diff
- #[derive(Accounts)]
- pub struct Create {}

+ #[derive(Accounts)]
+ #[instruction(message: String)]
+ pub struct Create<'info> {
+     #[account(mut)]
+     pub user: Signer<'info>,
+
+     #[account(
+         init,
+         seeds = [b"message", user.key().as_ref()],
+         bump,
+         payer = user,
+         space = 8 + 32 + 4 + message.len() + 1
+     )]
+     pub message_account: Account<'info, MessageAccount>,
+     pub system_program: Program<'info, System>,
+ }
```

</details>

<details>
{<summary>Explanation</summary>}

The `#[derive(Accounts)]` macro in an Anchor program is used to annotate structs
that represent a list of accounts required by an instruction where each field in
the struct is an account.

Each account (field) in the struct is annotated with an account type (ex.
`Signer<'info>`) and can be further annotated with constraints (ex.
`#[account(mut)]`). The account type along with account constraints are used to
perform security checks on the accounts passed to the instruction.

The naming of each field is only for our understanding and has no effect on
account validation, however, it is recommended to use descriptive account names.

---

The `Create` struct defines the accounts required for the `create` instruction.

1. `user: Signer<'info>`

   - Represents the user creating the message account
   - Marked as mutable (`#[account(mut)]`) as it pays for the new account
   - Must be a signer to approve the transaction, as lamports are deducted from
     the account

2. `message_account: Account<'info, MessageAccount>`

   - The new account being created to store the user's message
   - `init` constraint indicates the account will be created in the instruction
   - `seeds` and `bump` constraints indicate the address of the account is a
     Program Derived Address (PDA)
   - `payer = user` specifies the account paying for the creation of the new
     account
   - `space` specifies the number of bytes allocated to the new account's data
     field

3. `system_program: Program<'info, System>`

   - Required for creating new accounts
   - Under the hood, the `init` constraint invokes the System Program to create
     a new account allocated with the specified `space` and reassigns the
     program owner to the current program.

---

The `#[instruction(message: String)]` annotation enables the `Create` struct to
access the `message` parameter from the `create` instruction.

---

The `seeds` and `bump` constraints are used together to specify that an
account's address is a Program Derived Address (PDA).

```rs filename="lib.rs"
seeds = [b"message", user.key().as_ref()],
bump,
```

The `seeds` constraint defines the optional inputs used to derive the PDA.

- `b"message"` - A hardcoded string as the first seed.
- `user.key().as_ref()` - The public key of the `user` account as the second
  seed.

The `bump` constraint tells Anchor to automatically find and use the correct
bump seed. Anchor will use the `seeds` and `bump` to derive the PDA.

---

The `space` calculation (8 + 32 + 4 + message.len() + 1) allocates space for
`MessageAccount` data type:

- Anchor Account discriminator (identifier): 8 bytes
- User Address (Pubkey): 32 bytes
- User Message (String): 4 bytes for length + variable message length
- PDA Bump seed (u8): 1 byte

```rs filename="lib.rs"
#[account]
pub struct MessageAccount {
    pub user: Pubkey,
    pub message: String,
    pub bump: u8,
}
```

All accounts created through an Anchor program require 8 bytes for an account
discriminator, which is an identifier for the account type that is automatically
generated when the account is created.

A `String` type requires 4 bytes to store the length of the string, and
remaining length is the actual data.

</details>

Next, implement the business logic for the `create` instruction by updating the
`create` function with the following:

```rs filename="lib.rs"
pub fn create(ctx: Context<Create>, message: String) -> Result<()> {
    msg!("Create Message: {}", message);
    let account_data = &mut ctx.accounts.message_account;
    account_data.user = ctx.accounts.user.key();
    account_data.message = message;
    account_data.bump = ctx.bumps.message_account;
    Ok(())
}
```

<details>
{<summary>Diff</summary>}

```diff
- pub fn create(_ctx: Context<Create>) -> Result<()> {
-     Ok(())
- }

+ pub fn create(ctx: Context<Create>, message: String) -> Result<()> {
+     msg!("Create Message: {}", message);
+     let account_data = &mut ctx.accounts.message_account;
+     account_data.user = ctx.accounts.user.key();
+     account_data.message = message;
+     account_data.bump = ctx.bumps.message_account;
+     Ok(())
+ }
```

</details>

<details>
{<summary>Explanation</summary>}

The `create` function implements the logic for initializing a new message
account's data. It takes two parameters:

1. `ctx: Context<Create>` - Provides access to the accounts specified in the
   `Create` struct.
2. `message: String` - The user's message to be stored.

The body of the function then performs the following logic:

1. Print a message to program logs using the `msg!()` macro.

   ```rs
   msg!("Create Message: {}", message);
   ```

2. Initializing Account Data:

   - Accesses the `message_account` from the context.

   ```rs
   let account_data = &mut ctx.accounts.message_account;
   ```

   - Sets the `user` field to the public key of the `user` account.

   ```rs
   account_data.user = ctx.accounts.user.key();
   ```

   - Sets the `message` field to the `message` from the function argument.

   ```rs
   account_data.message = message;
   ```

   - Sets the `bump` value used to derive the PDA, retrieved from
     `ctx.bumps.message_account`.

   ```rs
   account_data.bump = ctx.bumps.message_account;
   ```

</details>

Rebuild the program.

```shell filename="Terminal"
build
```

### 4. Implement Update Instruction

Next, implement the `update` instruction to update the `MessageAccount` with a
new message.

Just as before, the first step is to specify the accounts required by the
`update` instruction.

Update the `Update` struct with the following:

```rs filename="lib.rs"
#[derive(Accounts)]
#[instruction(message: String)]
pub struct Update<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        realloc = 8 + 32 + 4 + message.len() + 1,
        realloc::payer = user,
        realloc::zero = true,
    )]
    pub message_account: Account<'info, MessageAccount>,
    pub system_program: Program<'info, System>,
}
```

<details>
{<summary>Diff</summary>}

```diff
- #[derive(Accounts)]
- pub struct Update {}

+ #[derive(Accounts)]
+ #[instruction(message: String)]
+ pub struct Update<'info> {
+     #[account(mut)]
+     pub user: Signer<'info>,
+
+     #[account(
+         mut,
+         seeds = [b"message", user.key().as_ref()],
+         bump = message_account.bump,
+         realloc = 8 + 32 + 4 + message.len() + 1,
+         realloc::payer = user,
+         realloc::zero = true,
+     )]
+     pub message_account: Account<'info, MessageAccount>,
+     pub system_program: Program<'info, System>,
+ }
```

</details>

<details>
{<summary>Explanation</summary>}

The `Update` struct defines the accounts required for the `update` instruction.

1. `user: Signer<'info>`

   - Represents the user updating the message account
   - Marked as mutable (`#[account(mut)]`) as it may pay for additional space
     for the `message_account` if needed
   - Must be a signer to approve the transaction

2. `message_account: Account<'info, MessageAccount>`

   - The existing account storing the user's message that will be updated
   - `mut` constraint indicates this account's data will be modified
   - `realloc` constraint allows for resizing the account's data
   - `seeds` and `bump` constraints ensure the account is the correct PDA

3. `system_program: Program<'info, System>`
   - Required for potential reallocation of account space
   - The `realloc` constraint invokes the System Program to adjust the account's
     data size

---

Note that the `bump = message_account.bump` constraint uses the bump seed stored
on the `mesesage_account`, rather than having Anchor recalculate it.

---

`#[instruction(message: String)]` annotation enables the `Update` struct to
access the `message` parameter from the `update` instruction.

</details>

Next, implement the logic for the `update` instruction.

```rs filename="lib.rs"
pub fn update(ctx: Context<Update>, message: String) -> Result<()> {
    msg!("Update Message: {}", message);
    let account_data = &mut ctx.accounts.message_account;
    account_data.message = message;
    Ok(())
}
```

<details>
{<summary>Diff</summary>}

```diff
- pub fn update(_ctx: Context<Update>) -> Result<()> {
-     Ok(())
- }

+ pub fn update(ctx: Context<Update>, message: String) -> Result<()> {
+     msg!("Update Message: {}", message);
+     let account_data = &mut ctx.accounts.message_account;
+     account_data.message = message;
+     Ok(())
+ }
```

</details>

<details>
{<summary>Explanation</summary>}

The `update` function implements the logic for modifying an existing message
account. It takes two parameters:

1. `ctx: Context<Update>` - Provides access to the accounts specified in the
   `Update` struct.
2. `message: String` - The new message to replace the existing one.

The body of the function then:

1. Print a message to program logs using the `msg!()` macro.

2. Updates Account Data:
   - Accesses the `message_account` from the context.
   - Sets the `message` field to the new `message` from the function argument.

</details>

Rebuld the program

```shell filename="Terminal"
build
```

### 5. Implement Delete Instruction

Next, implement the `delete` instruction to close the `MessageAccount`.

Update the `Delete` struct with the following:

```rs filename="lib.rs"
#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        close= user,
    )]
    pub message_account: Account<'info, MessageAccount>,
}
```

<details>
{<summary>Diff</summary>}

```diff
- #[derive(Accounts)]
- pub struct Delete {}

+ #[derive(Accounts)]
+ pub struct Delete<'info> {
+     #[account(mut)]
+     pub user: Signer<'info>,
+
+     #[account(
+         mut,
+         seeds = [b"message", user.key().as_ref()],
+         bump = message_account.bump,
+         close = user,
+     )]
+     pub message_account: Account<'info, MessageAccount>,
+ }
```

</details>

<details>
{<summary>Explanation</summary>}

The `Delete` struct defines the accounts required for the `delete` instruction:

1. `user: Signer<'info>`

   - Represents the user closing the message account
   - Marked as mutable (`#[account(mut)]`) as it will receive the lamports from
     the closed account
   - Must be a signer to ensure only the correct user can close their message
     account

2. `message_account: Account<'info, MessageAccount>`

   - The account being closed
   - `mut` constraint indicates this account will be modified
   - `seeds` and `bump` constraints ensure the account is the correct PDA
   - `close = user` constraint specifies that this account will be closed and
     its lamports transferred to the `user` account

</details>

Next, implement the logic for the `update` instruction.

```rs filename="lib.rs"
pub fn delete(_ctx: Context<Delete>) -> Result<()> {
    msg!("Delete Message");
    Ok(())
}
```

<details>
{<summary>Diff</summary>}

```diff
- pub fn delete(_ctx: Context<Delete>) -> Result<()> {
-     Ok(())
- }

+ pub fn delete(_ctx: Context<Delete>) -> Result<()> {
+     msg!("Delete Message");
+     Ok(())
+ }
```

</details>

<details>
{<summary>Explanation</summary>}

The `delete` function takes one parameter:

1. `_ctx: Context<Delete>` - Provides access to the accounts specified in the
   `Delete` struct. The `_ctx` syntax indicates we won't be using the Context in
   the body of the function.

The body of the function only prints a message to program logs using the
`msg!()` macro. The function does not require any additional logic because the
actual closing of the account is handled by the `close` constraint in the
`Delete` struct.

</details>

Rebuild the program.

```shell filename="Terminal"
build
```

### 6. Deploy Program

The basic CRUD program is now complete. Deploy the program by running `deploy`
in the Playground terminal.

```shell filename="Terminal"
deploy
```

<details>
{<summary>Output</summary>}

```bash
$ deploy
Deploying... This could take a while depending on the program size and network conditions.
Deployment successful. Completed in 17s.
```

</details>

### 7. Set Up Test File

Included with the starter code is also a test file in `anchor.test.ts`.

```ts filename="anchor.test.ts"
import { PublicKey } from "@solana/web3.js";

describe("pda", () => {
  it("Create Message Account", async () => {});

  it("Update Message Account", async () => {});

  it("Delete Message Account", async () => {});
});
```

Add the code below inside `describe`, but before the `it` sections.

```ts filename="anchor.test.ts"
const program = pg.program;
const wallet = pg.wallet;

const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("message"), wallet.publicKey.toBuffer()],
  program.programId,
);
```

<details>
{<summary>Diff</summary>}

```diff
  import { PublicKey } from "@solana/web3.js";

  describe("pda", () => {
+    const program = pg.program;
+    const wallet = pg.wallet;
+
+    const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
+      [Buffer.from("message"), wallet.publicKey.toBuffer()],
+      program.programId
+    );

    it("Create Message Account", async () => {});

    it("Update Message Account", async () => {});

    it("Delete Message Account", async () => {});
  });
```

</details>

<details>
{<summary>Explanation</summary>}

In this section, we are simply setting up the test file.

Solana Playground removes some boilerplate setup where `pg.program` allows us to
access the client library for interacting with the program, while `pg.wallet` is
your playground wallet.

```ts filename="anchor.test.ts"
const program = pg.program;
const wallet = pg.wallet;
```

As part of the setup, we derive the message account PDA. This demonstrates how
to derive the PDA in Javascript using the seeds specified in the program.

```ts filename="anchor.test.ts"
const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("message"), wallet.publicKey.toBuffer()],
  program.programId,
);
```

</details>

Run the test file by running `test` in the Playground terminal to check the file
runs as expected. We will implement the tests in the following steps.

```shell filename="Terminal"
test
```

<details>
{<summary>Output</summary>}

```bash
$ test
Running tests...
  anchor.test.ts:
  pda
    ✔ Create Message Account
    ✔ Update Message Account
    ✔ Delete Message Account
  3 passing (4ms)
```

</details>

### 8. Invoke Create Instruction

Update the first test with the following:

```ts filename="anchor.test.ts"
it("Create Message Account", async () => {
  const message = "Hello, World!";
  const transactionSignature = await program.methods
    .create(message)
    .accounts({
      messageAccount: messagePda,
    })
    .rpc({ commitment: "confirmed" });

  const messageAccount = await program.account.messageAccount.fetch(
    messagePda,
    "confirmed",
  );

  console.log(JSON.stringify(messageAccount, null, 2));
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );
});
```

<details>
{<summary>Diff</summary>}

```diff
- it("Create Message Account", async () => {});

+ it("Create Message Account", async () => {
+   const message = "Hello, World!";
+   const transactionSignature = await program.methods
+     .create(message)
+     .accounts({
+       messageAccount: messagePda,
+     })
+     .rpc({ commitment: "confirmed" });
+
+   const messageAccount = await program.account.messageAccount.fetch(
+     messagePda,
+     "confirmed"
+   );
+
+   console.log(JSON.stringify(messageAccount, null, 2));
+   console.log(
+     "Transaction Signature:",
+     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
+   );
+ });
```

</details>

<details>
{<summary>Explanation</summary>}

First, we send a transaction that invokes the `create` instruction, passing in
"Hello, World!" as the message.

```ts filename="anchor.test.ts"
const message = "Hello, World!";
const transactionSignature = await program.methods
  .create(message)
  .accounts({
    messageAccount: messagePda,
  })
  .rpc({ commitment: "confirmed" });
```

Once the transaction is sent and the account is created, we then fetch the
account using its address (`messagePda`).

```ts filename="anchor.test.ts"
const messageAccount = await program.account.messageAccount.fetch(
  messagePda,
  "confirmed",
);
```

Lastly, we log the account data and a link to view the transaction details.

```ts filename="anchor.test.ts"
console.log(JSON.stringify(messageAccount, null, 2));
console.log(
  "Transaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

</details>

### 9. Invoke Update Instruction

Update the second test with the following:

```ts filename="anchor.test.ts"
it("Update Message Account", async () => {
  const message = "Hello, Solana!";
  const transactionSignature = await program.methods
    .update(message)
    .accounts({
      messageAccount: messagePda,
    })
    .rpc({ commitment: "confirmed" });

  const messageAccount = await program.account.messageAccount.fetch(
    messagePda,
    "confirmed",
  );

  console.log(JSON.stringify(messageAccount, null, 2));
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );
});
```

<details>
{<summary>Diff</summary>}

```diff
- it("Update Message Account", async () => {});

+ it("Update Message Account", async () => {
+   const message = "Hello, Solana!";
+   const transactionSignature = await program.methods
+     .update(message)
+     .accounts({
+       messageAccount: messagePda,
+     })
+     .rpc({ commitment: "confirmed" });
+
+   const messageAccount = await program.account.messageAccount.fetch(
+     messagePda,
+     "confirmed"
+   );
+
+   console.log(JSON.stringify(messageAccount, null, 2));
+   console.log(
+     "Transaction Signature:",
+     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
+   );
+ });
```

</details>

<details>
{<summary>Explanation</summary>}

First, we send a transaction that invokes the `update` instruction, passing in
"Hello, Solana!" as the new message.

```ts filename="anchor.test.ts"
const message = "Hello, Solana!";
const transactionSignature = await program.methods
  .update(message)
  .accounts({
    messageAccount: messagePda,
  })
  .rpc({ commitment: "confirmed" });
```

Once the transaction is sent and the account is updated, we then fetch the
account using its address (`messagePda`).

```ts filename="anchor.test.ts"
const messageAccount = await program.account.messageAccount.fetch(
  messagePda,
  "confirmed",
);
```

Lastly, we log the account data and a link to view the transaction details.

```ts filename="anchor.test.ts"
console.log(JSON.stringify(messageAccount, null, 2));
console.log(
  "Transaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

</details>

### 10. Invoke Delete Instruction

Update the third test with the following:

```ts filename="anchor.test.ts"
it("Delete Message Account", async () => {
  const transactionSignature = await program.methods
    .delete()
    .accounts({
      messageAccount: messagePda,
    })
    .rpc({ commitment: "confirmed" });

  const messageAccount = await program.account.messageAccount.fetchNullable(
    messagePda,
    "confirmed",
  );

  console.log("Expect Null:", JSON.stringify(messageAccount, null, 2));
  console.log(
    "Transaction Signature:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
  );
});
```

<details>
{<summary>Diff</summary>}

```diff
- it("Delete Message Account", async () => {});

+ it("Delete Message Account", async () => {
+   const transactionSignature = await program.methods
+     .delete()
+     .accounts({
+       messageAccount: messagePda,
+     })
+     .rpc({ commitment: "confirmed" });
+
+   const messageAccount = await program.account.messageAccount.fetchNullable(
+     messagePda,
+     "confirmed"
+   );
+
+   console.log("Expect Null:", JSON.stringify(messageAccount, null, 2));
+   console.log(
+     "Transaction Signature:",
+     `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
+   );
+ });
```

</details>

<details>
{<summary>Explanation</summary>}

First, we send a transaction that invokes the `delete` instruction to close the
message account.

```ts filename="anchor.test.ts"
const transactionSignature = await program.methods
  .delete()
  .accounts({
    messageAccount: messagePda,
  })
  .rpc({ commitment: "confirmed" });
```

Once the transaction is sent and the account is closed, we attempt to fetch the
account using its address (`messagePda`) using `fetchNullable` since we expect
the return value to be to be null because the account is closed.

```ts filename="anchor.test.ts"
const messageAccount = await program.account.messageAccount.fetchNullable(
  messagePda,
  "confirmed",
);
```

Lastly, we log the account data and a link to view the transaction details where
the account data should be logged as null.

```ts filename="anchor.test.ts"
console.log(JSON.stringify(messageAccount, null, 2));
console.log(
  "Transaction Signature:",
  `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`,
);
```

</details>

### 11. Run Test

Once the tests are set up, run the test file by running `test` in the Playground
terminal.

```shell filename="Terminal"
test
```

<details>
{<summary>Output</summary>}

```bash
$ test
Running tests...
  anchor.test.ts:
  pda
    {
  "user": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "message": "Hello, World!",
  "bump": 254
}
    Transaction Signature: https://solana.fm/tx/5oBT4jEdUR6CRYsFNGoqvyMBTRDvFqRWTAAmCGM9rEvYRBWy3B2bkb6GVFpVPKBnkr714UCFUurBSDKSa7nLHo8e?cluster=devnet-solana
    ✔ Create Message Account (1025ms)
    {
  "user": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "message": "Hello, Solana!",
  "bump": 254
}
    Transaction Signature: https://solana.fm/tx/42veGAsQjHbJP1SxWBGcfYF7EdRN9X7bACNv23NSZNe4U7w2dmaYgSv8UUWXYzwgJPoNHejhtWdKZModHiMaTWYK?cluster=devnet-solana
    ✔ Update Message Account (713ms)
    Expect Null: null
    Transaction Signature: https://solana.fm/tx/Sseog2i2X7uDEn2DyDMMJKVHeZEzmuhnqUwicwGhnGhstZo8URNwUZgED8o6HANiojJkfQbhXVbGNLdhsFtWrd6?cluster=devnet-solana
    ✔ Delete Message Account (812ms)
  3 passing (3s)
```

</details>

## Cross Program Invocation

In this section, we'll update our existing CRUD program to include Cross Program
Invocations (CPIs). We'll modify the program to transfer SOL between accounts in
the `update` and `delete` instructions, demonstrating how to interact with other
programs (in this case, the System Program) from within our program.

The purpose of this section is to walk through the process of implementing CPIs
in a Solana program using the Anchor framework, building upon the PDA concepts
we explored in the previous section. For more details, refer to the
[Cross Program Invocation](/docs/core/cpi) page.

Begin by updating the `lib.rs` file to bring into scope items from the
`system_program` module.

```rs filename="lib.rs"
use anchor_lang::system_program::{transfer, Transfer};
```

<details>
{<summary>Diff</summary>}

```diff
  use anchor_lang::prelude::*;
+ use anchor_lang::system_program::{transfer, Transfer};
```

</details>

### 1. Modify Update Instruction

First, we'll implement a simple "pay-to-update" mechanism by modifying the
`Update` struct and `update` function.

Begin by updating the `Update` struct to include an additional account called
`vault_account`. This account, controlled by our program, will receive SOL from
a user when they update their message account.

```rs filename="lib.rs"
#[account(
    mut,
    seeds = [b"vault", user.key().as_ref()],
    bump,
)]
pub vault_account: SystemAccount<'info>,
```

<details>
{<summary>Diff</summary>}

```diff
#[derive(Accounts)]
#[instruction(message: String)]
pub struct Update<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

+   #[account(
+       mut,
+       seeds = [b"vault", user.key().as_ref()],
+       bump,
+   )]
+   pub vault_account: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        realloc = 8 + 32 + 4 + message.len() + 1,
        realloc::payer = user,
        realloc::zero = true,
    )]
    pub message_account: Account<'info, MessageAccount>,
    pub system_program: Program<'info, System>,
}
```

</details>

<details>
{<summary>Explanation</summary>}

We're adding a new account called `vault_account` to our `Update` struct. This
account serves as a program-controlled "vault" that will receive SOL from users
when they update their messages.

By using a PDA for the vault, we create a program-controlled account unique to
each user, enabling us to manage user funds within our program's logic.

---

Key aspects of the `vault_account`:

- The address of the account is a PDA derived using seeds
  `[b"vault", user.key().as_ref()]`
- As a PDA, it has no private key, so only our program can "sign" for the
  address when performing CPIs
- As a `SystemAccount` type, it's owned by the System Program like regular
  wallet accounts

This setup allows our program to:

- Generate unique, deterministic addresses for each user's "vault"
- Control funds without needing a private key to sign for transactions.

In the `delete` instruction, we'll demonstrate how our program can "sign" for
this PDA in a CPI.

</details>

Next, implement the CPI logic in the `update` instruction to transfer 0.001 SOL
from the user's account to the vault account.

```rs filename="lib.rs"
let transfer_accounts = Transfer {
    from: ctx.accounts.user.to_account_info(),
    to: ctx.accounts.vault_account.to_account_info(),
};
let cpi_context = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),
    transfer_accounts,
);
transfer(cpi_context, 1_000_000)?;
```

<details>
{<summary>Diff</summary>}

```diff
    pub fn update(ctx: Context<Update>, message: String) -> Result<()> {
        msg!("Update Message: {}", message);
        let account_data = &mut ctx.accounts.message_account;
        account_data.message = message;

+       let transfer_accounts = Transfer {
+           from: ctx.accounts.user.to_account_info(),
+           to: ctx.accounts.vault_account.to_account_info(),
+       };
+       let cpi_context = CpiContext::new(
+           ctx.accounts.system_program.to_account_info(),
+           transfer_accounts,
+       );
+       transfer(cpi_context, 1_000_000)?;
        Ok(())
    }
```

</details>

<details>
{<summary>Explanation</summary>}

In the `update` instruction, we implement a Cross Program Invocation (CPI) to
invoke the System Program's `transfer` instruction. This demonstrates how to
perform a CPI from within our program, enabling the composability of Solana
programs.

The `Transfer` struct specifies the required accounts for the System Program's
transfer instruction:

- `from` - The user's account (source of funds)
- `to` - The vault account (destination of funds)

  ```rs filename="lib.rs"
  let transfer_accounts = Transfer {
      from: ctx.accounts.user.to_account_info(),
      to: ctx.accounts.vault_account.to_account_info(),
  };
  ```

The `CpiContext` specifies:

- The program to be invoked (System Program)
- The accounts required in the CPI (defined in the `Transfer` struct)

  ```rs filename="lib.rs"
  let cpi_context = CpiContext::new(
      ctx.accounts.system_program.to_account_info(),
      transfer_accounts,
  );
  ```

The `transfer` function then invokes the transfer instruction on the System
Program, passing in the:

- The `cpi_context` (program and accounts)
- The `amount` to transfer (1,000,000 lamports, equivalent to 0.001 SOL)

  ```rs filename="lib.rs"
  transfer(cpi_context, 1_000_000)?;
  ```

---

The setup for a CPI matches how client-side instructions are built, where we
specify the program, accounts, and instruction data for a particular instruction
to invoke. When our program's `update` instruction is invoked, it internally
invokes the System Program's transfer instruction.

</details>

Rebuild the program.

```shell filename="Terminal"
build
```

### 2. Modify Delete Instruction

We'll now implement a "refund on delete" mechanism by modifying the `Delete`
struct and `delete` function.

First, update the `Delete` struct to include the `vault_account`. This allows us
to transfer any SOL in the vault back to the user when they close their message
account.

```rs filename="lib.rs"
#[account(
    mut,
    seeds = [b"vault", user.key().as_ref()],
    bump,
)]
pub vault_account: SystemAccount<'info>,
```

Also add the `system_program` as the CPI for the transfer requires invoking the
System Program.

```rs filename="lib.rs"
pub system_program: Program<'info, System>,
```

<details>
{<summary>Diff</summary>}

```diff
#[derive(Accounts)]
pub struct Delete<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

+   #[account(
+       mut,
+       seeds = [b"vault", user.key().as_ref()],
+       bump,
+   )]
+   pub vault_account: SystemAccount<'info>,
    #[account(
        mut,
        seeds = [b"message", user.key().as_ref()],
        bump = message_account.bump,
        close= user,
    )]
    pub message_account: Account<'info, MessageAccount>,
+   pub system_program: Program<'info, System>,
}
```

</details>

<details>
{<summary>Explanation</summary>}

The `vault_account` uses the same PDA derivation as in the Update struct.

Add the `vault_account` to the Delete struct enables our program to access the
user's vault account during the delete instruction to transfer any accumulated
SOL back to the user.

</details>

Next, implement the CPI logic in the `delete` instruction to transfer SOL from
the vault account back to the user's account.

```rs filename="lib.rs"
let user_key = ctx.accounts.user.key();
let signer_seeds: &[&[&[u8]]] =
    &[&[b"vault", user_key.as_ref(), &[ctx.bumps.vault_account]]];

let transfer_accounts = Transfer {
    from: ctx.accounts.vault_account.to_account_info(),
    to: ctx.accounts.user.to_account_info(),
};
let cpi_context = CpiContext::new(
    ctx.accounts.system_program.to_account_info(),
    transfer_accounts,
).with_signer(signer_seeds);
transfer(cpi_context, ctx.accounts.vault_account.lamports())?;
```

Note that we updated `_ctx: Context<Delete>` to `ctx: Context<Delete>` as we'll
be using the context in the body of the function.

<details>
{<summary>Diff</summary>}

```diff
-    pub fn delete(_ctx: Context<Delete>) -> Result<()> {
+    pub fn delete(ctx: Context<Delete>) -> Result<()> {
         msg!("Delete Message");

+        let user_key = ctx.accounts.user.key();
+        let signer_seeds: &[&[&[u8]]] =
+            &[&[b"vault", user_key.as_ref(), &[ctx.bumps.vault_account]]];
+
+        let transfer_accounts = Transfer {
+            from: ctx.accounts.vault_account.to_account_info(),
+            to: ctx.accounts.user.to_account_info(),
+        };
+        let cpi_context = CpiContext::new(
+            ctx.accounts.system_program.to_account_info(),
+            transfer_accounts,
+        ).with_signer(signer_seeds);
+        transfer(cpi_context, ctx.accounts.vault_account.lamports())?;
         Ok(())
     }

```

</details>

<details>
{<summary>Explanation</summary>}

In the delete instruction, we implement another Cross Program Invocation (CPI)
to invoke the System Program's transfer instruction. This CPI demonstrates how
to make a transfer that requires a Program Derived Address (PDA) signer.

First, we define the signer seeds for the vault PDA:

```rs filename="lib.rs"
let user_key = ctx.accounts.user.key();
let signer_seeds: &[&[&[u8]]] =
    &[&[b"vault", user_key.as_ref(), &[ctx.bumps.vault_account]]];
```

The `Transfer` struct specifies the required accounts for the System Program's
transfer instruction:

- from: The vault account (source of funds)
- to: The user's account (destination of funds)

  ```rs filename="lib.rs"
  let transfer_accounts = Transfer {
      from: ctx.accounts.vault_account.to_account_info(),
      to: ctx.accounts.user.to_account_info(),
  };
  ```

The `CpiContext` specifies:

- The program to be invoked (System Program)
- The accounts involved in the transfer (defined in the Transfer struct)
- The signer seeds for the PDA

  ```rs filename="lib.rs"
  let cpi_context = CpiContext::new(
      ctx.accounts.system_program.to_account_info(),
      transfer_accounts,
  ).with_signer(signer_seeds);
  ```

The transfer function then invokes the transfer instruction on the System
Program, passing:

- The `cpi_context` (program, accounts, and PDA signer)
- The amount to transfer (the entire balance of the vault account)

  ```rs filename="lib.rs"
  transfer(cpi_context, ctx.accounts.vault_account.lamports())?;
  ```

This CPI implementation demonstrates how programs can utilize PDAs to manage
funds. When our program's delete instruction is invoked, it internally calls the
System Program's transfer instruction, signing for the PDA to authorize the
transfer of all funds from the vault back to the user.

</details>

Rebuild the program.

```shell filename="Terminal"
build
```

### 3. Redeploy Program

After making these changes, we need to redeploy our updated program. This
ensures that our modified program is available for testing. On Solana, updating
a program simply requires deploying the compiled program at the same program ID.

```shell filename="Terminal"
deploy
```

<details>
{<summary>Output</summary>}

```bash
$ deploy
Deploying... This could take a while depending on the program size and network conditions.
Deployment successful. Completed in 17s.
```

</details>

<details>
{<summary>Explanation</summary>}

Only the upgrade authority of the program can update it. The upgrade authority
is set when the program is deployed, and it's the only account with permission
to modify or close the program. If the upgrade authority is revoked, then the
program becomes immutable and can never be closed or upgraded.

When deploying programs on Solana Playground, your Playground wallet is the
upgrade authority for all your programs.

</details>

### 4. Update Test File

Next, we'll update our `anchor.test.ts` file to include the new vault account in
our instructions. This requires deriving the vault PDA and including it in our
update and delete instruction calls.

#### Derive Vault PDA

First, add the vault PDA derivation:

```ts filename="anchor.test.ts"
const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault"), wallet.publicKey.toBuffer()],
  program.programId,
);
```

<details>
{<summary>Diff</summary>}

```diff
describe("pda", () => {
  const program = pg.program;
  const wallet = pg.wallet;

  const [messagePda, messageBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("message"), wallet.publicKey.toBuffer()],
    program.programId
  );

+  const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync(
+    [Buffer.from("vault"), wallet.publicKey.toBuffer()],
+    program.programId
+  );

  // ...tests
  });
```

</details>

#### Modify Update Test

Then, update the update instruction to include the `vaultAccount`.

```ts filename="anchor.test.ts"  {5}
const transactionSignature = await program.methods
  .update(message)
  .accounts({
    messageAccount: messagePda,
    vaultAccount: vaultPda,
  })
  .rpc({ commitment: "confirmed" });
```

<details>
{<summary>Diff</summary>}

```diff
    const transactionSignature = await program.methods
      .update(message)
      .accounts({
        messageAccount: messagePda,
+       vaultAccount: vaultPda,
      })
      .rpc({ commitment: "confirmed" });
```

</details>

#### Modify Delete Test

Then, update the delete instruction to include the `vaultAccount`.

```ts filename="anchor.test.ts"  {5}
const transactionSignature = await program.methods
  .delete()
  .accounts({
    messageAccount: messagePda,
    vaultAccount: vaultPda,
  })
  .rpc({ commitment: "confirmed" });
```

<details>
{<summary>Diff</summary>}

```diff
    const transactionSignature = await program.methods
      .delete()
      .accounts({
        messageAccount: messagePda,
+       vaultAccount: vaultPda,
      })
      .rpc({ commitment: "confirmed" });
```

</details>

### 8. Rerun Test

After making these changes, run the tests to ensure everything is working as
expected:

```shell filename="Terminal"
test
```

<details>
{<summary>Output</summary>}

```bash
$ test
Running tests...
  anchor.test.ts:
  pda
    {
  "user": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "message": "Hello, World!",
  "bump": 254
}
    Transaction Signature: https://solana.fm/tx/qGsYb87mUUjeyh7Ha7r9VXkACw32HxVBujo2NUxqHiUc8qxRMFB7kdH2D4JyYtPBx171ddS91VyVrFXypgYaKUr?cluster=devnet-solana
    ✔ Create Message Account (842ms)
    {
  "user": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R",
  "message": "Hello, Solana!",
  "bump": 254
}
    Transaction Signature: https://solana.fm/tx/3KCDnNSfDDfmSy8kpiSrJsGGkzgxx2mt18KejuV2vmJjeyenkSoEfs2ghUQ6cMoYYgd9Qax9CbnYRcvF2zzumNt8?cluster=devnet-solana
    ✔ Update Message Account (946ms)
    Expect Null: null
    Transaction Signature: https://solana.fm/tx/3M7Z7Mea3TtQc6m9z386B9QuEgvLKxD999mt2RyVtJ26FgaAzV1QA5mxox3eXie3bpBkNpDQ4mEANr3trVHCWMC2?cluster=devnet-solana
    ✔ Delete Message Account (859ms)
  3 passing (3s)
```

</details>

You can then inspect the SolanFM links to view the transaction details, where
you’ll find the CPIs for the transfer instructions within the update and delete
instructions.

![Update CPI](/assets/docs/intro/quickstart/cpi-update.png)

![Delete CPI](/assets/docs/intro/quickstart/cpi-delete.png)

If you encounter any errors, you can reference the
[final code](https://beta.solpg.io/668304cfcffcf4b13384d20a).

## Next Steps

You've completed the Solana Quickstart guide! You've learned about accounts,
transactions, PDAs, CPIs, and deployed your own programs.

Visit the [Core Concepts](/docs/core/accounts) pages for more comprehensive
explanations of the topics covered in this guide.

### Explore More Examples

If you prefer learning by example, check out the
[Program Examples Repository](https://github.com/solana-developers/program-examples)
for a variety of example programs.

Solana Playground offers a convenient feature allowing you to import or view
projects using their GitHub links. For example, open this
[Solana Playground link](https://beta.solpg.io/https://github.com/solana-developers/program-examples/tree/main/basics/hello-solana/anchor)
to view the Anchor project from this
[Github repo](https://github.com/solana-developers/program-examples/tree/main/basics/hello-solana/anchor).

Click the `Import` button and enter a project name to add it to your list of
projects in Solana Playground. Once a project is imported, all changes are
automatically saved and persisted within the Playground environment.
