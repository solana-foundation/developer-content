---
sidebarLabel: Reading from Network
title: Reading from Network
sidebarSortOrder: 1
description:
  Learn how to read data from the Solana blockchain network. This guide covers
  fetching wallet accounts, program accounts, and token mint accounts using
  JavaScript/TypeScript, with practical examples using the Solana web3.js
  library.
---

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

## Fetch Playground Wallet

Let's start by looking at a familiar account - your own Playground Wallet! We'll
fetch this account and examine its structure to understand what a basic Solana
account looks like.

<Steps>

### Open Example 1

Click this [link](https://beta.solpg.io/6671c5e5cffcf4b13384d198) to open the
example in Solana Playground. You'll see this code:

```ts filename="client.ts"
const address = pg.wallet.publicKey;
const accountInfo = await pg.connection.getAccountInfo(address);

console.log(JSON.stringify(accountInfo, null, 2));
```

<Accordion>
<AccordionItem title="Explanation">

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

</AccordionItem>
</Accordion>

### Run Example 1

In the Playground terminal, type the `run` command and hit enter:

```shell filename="Terminal"
run
```

You should see details about your wallet account, including its balance in
lamports, with output similar to the following:

<Accordion>
<AccordionItem title="Output">

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

</AccordionItem>
<AccordionItem title="Explanation">

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

> When data is "buffered" in this way, it maintains its integrity and can be
> later deserialized back into its original form for use in applications. This
> process is widely used in blockchain for efficient data handling.

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

</AccordionItem>
</Accordion>

</Steps>

## Fetch Token Program

Next, we'll examine the Token Extensions program, an executable program for
interacting with tokens on Solana.

<Steps>

### Open Example 2

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

### Run Example 2

Run the code using the `run` command in the terminal.

```shell filename="Terminal"
run
```

Examine the output and how this program account differs from your wallet
account.

<Accordion>
<AccordionItem title="Output">

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

</AccordionItem>
<AccordionItem title="Explanation">

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

</AccordionItem>
</Accordion>

</Steps>

## Fetch Mint Account

In this step, we'll examine a Mint account, which represents a unique token on
the Solana network.

<Steps>

### Open Example 3

Click this [link](https://beta.solpg.io/6671c9aecffcf4b13384d19a) to open the
example in Solana Playground. You'll see this code:

```ts filename="client.ts" {3}
import { PublicKey } from "@solana/web3.js";

const address = new PublicKey("C33qt1dZGZSsqTrHdtLKXPZNoxs6U1ZBfyDkzmj6mXeR");
const accountInfo = await pg.connection.getAccountInfo(address);

console.log(JSON.stringify(accountInfo, null, 2));
```

In this example, we'll fetch the address of an existing Mint account on devnet.

### Run Example 3

Run the code using the `run` command.

```shell filename="Terminal"
run
```

<Accordion>
<AccordionItem title="Output">

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

</AccordionItem>
<AccordionItem title="Explanation">

Key differences in the `AccountInfo`:

- `owner` - The mint account is owned by the Token Extensions program
  (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`).
- `executable` - Set to `false`, as this account stores state rather than
  executable code.
- `data`: Contains serialized data about the token (mint authority, supply,
  decimals, etc.).

</AccordionItem>
</Accordion>

### Deserialize Mint Account Data

To read the `data` field from any account, you need to deserialize the data
buffer into the expected data type. This is often done using helper functions
from client libraries for a particular program.

**Deserialization** is the process of converting data from a stored format (like
raw bytes or JSON) back into a usable, structured format in a program. In
blockchain, it involves taking raw, encoded data from the network and
transforming it back into objects, classes, or readable structures so developers
can access and manipulate specific information within a program. Deserialization
is essential for interpreting account or transaction data received from a
network in a form that a program can process and display meaningfully.

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

<Accordion>
<AccordionItem title="Output">

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

</AccordionItem>
<AccordionItem title="Explanation">

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

</AccordionItem>
</Accordion>

</Steps>
