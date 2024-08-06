---
title: Use Token Extensions from a Client
objectives:
  - Learn how to effectively integrate multiple Solana token programs within
    client applications
  - Become proficient in utilizing the SPL TypeScript library for comprehensive
    token operations
description:
  "Use mints with Token Extensions program from TS in web and mobile apps."
---

## Summary

- The `Token Extensions Program` has all of the same functions as the
  `Token Program`, with added `extensions`
- These two token programs: `Token Program` and `Token Extensions Program` use
  separate addresses and are not directly compatible
- Supporting both requires specifying the correct program ID in client-side
  functions
- By default, the SPL program library uses the original **`Token Program`**
  unless another is specified
- The `Token Extensions Program` may also be referred to as it's technical spec
  name `Token22`

## Overview

The `Token Extensions Program` enhances the original `Token Program` by
incorporating additional features known as extensions. These extensions are
designed to address specific scenarios that previously necessitated developers
to fork and alter the Solana Program Library, leading to split ecosystems and
challenges in adoption. The introduction of the Token Extensions Program allows
for these scenarios to be effectively handled.

Since the `Token Program` and `Token Extensions Program` are different onchain
programs, they are not interoperable. For example, a token minted with
`Token Extensions Program` may not be transferred with the `Token Program`. As a
result, we'll have to support both programs in any client-side applications that
need to display or otherwise support all SPL tokens. This means we'll want to
explicitly handle mints from both the original Token Program (address:
`TOKEN_PROGRAM_ID`) and the Extension Program (address:
`TOKEN_2022_PROGRAM_ID`).

Fortunately, the interfaces for the two programs remain consistent, allowing the
use of `spl-token` helper functions in either program by simply swapping the
program ID (the function uses the original Token Program by default if no
program ID is provided). Most of the time, end users are not concerned with the
specific token program being used. As such, implementing additional logic to
track, assemble, and merge details from both token varieties is essential to
guarantee a smooth user experience.

Lastly, "Token 22" is often used as the technical name. If you see someone refer
to the Token 22 Program, they are referring to the Token Extensions Program.

### Differences between working with Token Program Tokens and Token Extensions Tokens

When interacting with mints and tokens, we need to be sure we're using the
correct Token Program. To create a `Token Program` mint, use `Token Program`; to
create a mint with extensions, use the `Token Extensions Program`.

Fortunately, the `spl-token` package makes it simple to do this. It provides
both the `TOKEN_PROGRAM_ID` and `TOKEN_2022_PROGRAM_ID` constants, along with
all of its helper functions for creating and minting tokens that take a program
ID as input.

<Callout type="note">`spl-token` defaults to using the `TOKEN_PROGRAM_ID` unless
otherwise specified. Make sure to explicitly pass the `TOKEN_2022_PROGRAM_ID`
for all function calls related to the Token Extensions Program. Otherwise, you
will get the following error: `TokenInvalidAccountOwnerError`. </Callout>

### Considerations when working with both Token and Extension Tokens

Although the interfaces for both of these programs remain consistent, they are
two different programs. The program IDs for these programs are unique and
non-interchangeable, resulting in distinct addresses when utilized. If you want
to support both `Token Program` tokens and `Token Extensions Program` tokens,
you must add extra logic on the client side.

### Associated Token Accounts (ATA)

An Associated Token Account (ATA) is a Token Account whose address is derived
using the wallet's public key, the token's mint, and the token program. This
mechanism provides a deterministic Token Account address for each mint per user.
The ATA account is usually the default account for most holders. Fortunately,
ATAs are handled the same way with both token programs.

We can use the ATA helper functions for each token program by providing the
desired program ID.

If we want to use the Token Extensions Program when we call
`getOrCreateAssociatedTokenAccount` Extension Tokens, we can pass in
`TOKEN_2022_PROGRAM_ID` for the `tokenProgramId` parameter:

```ts
const tokenProgramId = TOKEN_2022_PROGRAM_ID;

const tokenAccount = await getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mintAddress,
  payer.publicKey,
  true,
  "finalized",
  { commitment: "finalized" },
  tokenProgramId, // TOKEN_PROGRAM_ID for Token Program tokens and TOKEN_2022_PROGRAM_ID for Token Extensions Program tokens
);
```

To re-create the ATA's address from scratch, we can use the
`findProgramAddressSync` function by providing the correct seeds:

```ts
function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      walletAddress.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(), // replace TOKEN_PROGRAM_ID with TOKEN_2022_PROGRAM_ID for Token22 tokens
      tokenMintAddress.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}
```

### How to fetch tokens

There is no difference between tokens made with Token Program or Token
Extensions Program. That means, when it comes to fetching tokens, there is no
difference between how we fetch Token Program or Token Extensions Program
tokens. All we have to do is provide the correct token program:

```ts
const tokenAccounts = await connection.getTokenAccountsByOwner(
  walletPublicKey,
  { programId: TOKEN_PROGRAM_ID }, // or TOKEN_2022_PROGRAM_ID
);
```

If we want to fetch all of the tokens for a particular owner, we can use a
function like `getTokenAccountsByOwner`, and then call it twice, once with
`TOKEN_PROGRAM_ID` and another with `TOKEN_2022_PROGRAM_ID`.

```ts
const allOwnedTokens = [];
const tokenAccounts = await connection.getTokenAccountsByOwner(
  wallet.publicKey,
  { programId: TOKEN_PROGRAM_ID },
);
const tokenExtensionAccounts = await connection.getTokenAccountsByOwner(
  wallet.publicKey,
  { programId: TOKEN_2022_PROGRAM_ID },
);

allOwnedTokens.push(...tokenAccounts, ...tokenExtensionAccounts);
```

<Callout type="note">It's likely you'll want to store and associate the token
program with the token upon fetching.</Callout>

#### Check owning program

You may run into a scenario where you don't know the token program for a given
account. Fortunately, `getParsedAccountInfo` will allow us to determine the
owning program:

```typescript
const accountInfo = await connection.getParsedAccountInfo(mintAddress);
if (accountInfo.value === null) {
  throw new Error("Account not found");
}

const programId = accountInfo.value.owner; // will return TOKEN_PROGRAM_ID for Token Program mint address and TOKEN_2022_PROGRAM_ID for Token Extensions Program mint address

//we now use the programId to fetch the tokens
const tokenAccounts = await connection.getTokenAccountsByOwner(
  wallet.publicKey,
  { programId },
);
```

<Callout type="note">After you fetch the owning program, it may be a good idea
to save that owner and associate it with the mints/tokens you are
handling.</Callout>

## Lab - Add Extension Token support to a script

Let's work through a holistic example where we add Token Extensions support to
an existing script. This lab will lead us through the necessary adjustments and
expansions to embrace the capabilities and nuances of both the original Token
Program and its extension counterpart.

By the end of this lab, we'll have navigated the complexities of supporting
these two distinct but related token systems, ensuring our script can interact
smoothly with both.

#### 1. Clone the starter code

To get started, clone
[this lab's repository](https://github.com/Unboxed-Software/solana-lab-token22-in-the-client/)
and checkout the `starter` branch. This branch contains a couple of helper files
and some boilerplate code to get you started.

```bash
git clone https://github.com/Unboxed-Software/solana-lab-token22-in-the-client.git
cd solana-lab-token22-in-the-client
git checkout starter
```

Run `npm install` to install the dependencies.

#### 2. Get familiar with the starter code

The starter code comes with the following files:

- `print-helpers.ts`
- `index.ts`

The **`print-helpers.ts`** file contains a function called **`printTableData`**,
which is designed to output data to the console in a structured format. This
function is capable of accepting any object as its argument, and it utilizes the
**`console.table`** method, a feature provided by NodeJS, to display the data in
an easily readable table format.

Lastly, `index.ts` contains our main script. It currently only creates a
connection and calls `initializeKeypair` to generate the keypair for `payer`.

#### 3. Run validator node (Optional)

Optionally, you may want to run your own local validator instead of using
devnet. This a good way around any issues with airdropping.

In a separate terminal, run the following command: `solana-test-validator`. This
will run the node and also log out some keys and values. The value we need to
retrieve and use in our connection is the JSON RPC URL, which in this case is
`http://127.0.0.1:8899`. We then use that in the connection to specify to use
the local RPC URL.

```typescript
const connection = new Connection("http://127.0.0.1:8899", "confirmed");
```

If you'd like to use Devnet and provide you're own devnet wallet, you still
can - just reconfigure the `Connection` and the keypair path input to
`initializeKeypair`.

```typescript
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
```

Let's test that it all works so far by running `npm run start`. You should see
the `payer` public key logged out in your terminal.

#### 4. Create Token Program and Token Extensions Program mints

Let's start by creating new token mints using both the `Token Program` and the
`Token Extensions Program`.

Create a new file called `create-and-mint-token.ts`. In this file we will create
a function called `createAndMintToken`. As the name suggests it will create a
mint, token account (ATA) and then mint some amount of tokens to that account.

Within this `createAndMintToken` function we will be call `createMint`,
`getOrCreateAssociatedTokenAccount` and `mintTo`. This function is designed to
be indifferent to the specific token program being used, allowing for the
creation of tokens from either the `Token Program` or the
`Token Extensions Program`. This capability is achieved by accepting a program
ID as a parameter, enabling the function to adapt its behavior based on the
provided ID.

Here are the arguments we'll be passing into this function:

- `connection` - The connection object to use
- `tokenProgramId` - The token program to point to
- `payer` - The keypair paying for the transaction
- `decimals` - The number of decimals to include for the mint
- `mintAmount` - The amount of tokens to mint to the payer

And this is what the function will do:

- Create a new mint using **`createMint`**
- Fetch mint information using **`getMint`**
- Log mint information using **`printTableData`**
- Create an associated token account with
  **`getOrCreateAssociatedTokenAccount`**
- Log the address of the associated token account
- Mint tokens to the associated token account with **`mintTo`**

All put together this is what the final `createAndMintToken` function looks
like:

```ts
import {
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import printTableData from "./print-helpers";

export async function createAndMintToken(
  connection: Connection,
  tokenProgramId: PublicKey,
  payer: Keypair,
  decimals: number,
  mintAmount: number,
): Promise<PublicKey> {
  console.log("\\nCreating a new mint...");
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    payer.publicKey,
    decimals,
    undefined,
    {
      commitment: "finalized", // confirmOptions argument
    },
    tokenProgramId,
  );

  console.log("\\nFetching mint info...");

  const mintInfo = await getMint(connection, mint, "finalized", tokenProgramId);

  printTableData(mintInfo);

  console.log("\\nCreating associated token account...");
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey,
    true,
    "finalized",
    { commitment: "finalized" },
    tokenProgramId,
  );

  console.log(`Associated token account: ${tokenAccount.address.toBase58()}`);

  console.log("\\nMinting to associated token account...");
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer,
    mintAmount,
    [payer],
    { commitment: "finalized" },
    tokenProgramId,
  );

  return mint;
}

export default createAndMintToken;
```

#### 5. Creating and minting tokens

Let's now take our new function and invoke it twice within our main script in
`index.ts`. We'll want a `Token Program` and `Token Extensions Program` token to
test against. So we'll use our two different program IDs:

```typescript
import { initializeKeypair } from "@solana-developers/helpers";
import { Cluster, Connection } from "@solana/web3.js";
import createAndMintToken from "./create-and-mint-token";
import printTableData from "./print-helpers";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import dotenv from "dotenv";
dotenv.config();

const connection = new Connection("http://127.0.0.1:8899", "confirmed");
const payer = await initializeKeypair(connection);

console.log(`Payer: ${payer.publicKey.toBase58()}`);

const tokenProgramMint = await createAndMintToken(
  connection,
  TOKEN_PROGRAM_ID,
  payer,
  0,
  1000,
);
const tokenExtensionProgramMint = await createAndMintToken(
  connection,
  TOKEN_2022_PROGRAM_ID,
  payer,
  0,
  1000,
);
```

At this point you can run `npm run start` and see that both mints get created
and their info logged to the console.

#### 6. Fetch Token Program and Token Extensions Program tokens

We can now fetch tokens using the wallet's public key and the program ID.

Let's create a new file `fetch-token-info.ts`.

Within that new file, let's create the `fetchTokenInfo` function. This function
will fetch the token account provided and return a new interface we'll create
named `TokenInfoForDisplay`. This will allow us to format the returning data
nicely in our console. Again, this function will be agnostic about which token
program the account it from.

```ts
import { AccountLayout, getMint } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

export type TokenTypeForDisplay = "Token Program" | "Token Extensions Program";

export interface TokenInfoForDisplay {
  mint: PublicKey;
  amount: number;
  decimals: number;
  displayAmount: number;
  type: TokenTypeForDisplay;
}
```

To actually fetch all of this information we will be calling
`getTokenAccountsByOwner` and mapping the results into our new
`TokenInfoForDisplay` interface.

To accomplish this the `fetchTokenInfo` function will need the following
parameters:

- `connection` - The connection object to use
- `owner` - The wallet which owns the associated token accounts
- `programId` - The token program to point to
- `type` - Either `Token Program` or `Token Extensions Program`; used for
  console logging purpose

```ts
export type TokenTypeForDisplay = "Token Program" | "Token Extensions Program";

export interface TokenInfoForDisplay {
  mint: PublicKey;
  amount: number;
  decimals: number;
  displayAmount: number;
  type: TokenTypeForDisplay;
}

export async function fetchTokenInfo(
  connection: Connection,
  owner: PublicKey,
  programId: PublicKey,
  type: TokenTypeForDisplay,
): Promise<TokenInfoForDisplay[]> {
  const tokenAccounts = await connection.getTokenAccountsByOwner(owner, {
    programId,
  });

  const ownedTokens: TokenInfoForDisplay[] = [];

  for (const tokenAccount of tokenAccounts.value) {
    const accountData = AccountLayout.decode(tokenAccount.account.data);

    const mintInfo = await getMint(
      connection,
      accountData.mint,
      "finalized",
      programId,
    );

    ownedTokens.push({
      mint: accountData.mint,
      amount: Number(accountData.amount),
      decimals: mintInfo.decimals,
      displayAmount: Number(accountData.amount) / 10 ** mintInfo.decimals,
      type,
    });
  }

  return ownedTokens;
}
```

Let's see this function in action. Inside of `index.ts`, let's add two separate
calls to this function, once for each program.

```ts
// previous imports
import { TokenInfoForDisplay, fetchTokenInfo } from "./fetch-token-info";

// previous code
const myTokens: TokenInfoForDisplay[] = [];

myTokens.push(
  ...(await fetchTokenInfo(
    connection,
    payer.publicKey,
    TOKEN_PROGRAM_ID,
    "Token Program",
  )),
  ...(await fetchTokenInfo(
    connection,
    payer.publicKey,
    TOKEN_2022_PROGRAM_ID,
    "Token Extensions Program",
  )),
);

printTableData(myTokens);
```

Run `npm run start`. You should now see all of the tokens the payer wallet owns.

#### 7. Fetch Token Program and Token Extensions Program tokens without the program ID

Now let's take a look at how we can retrieve the owning program from a given
mint account.

To do this we will create a new function `fetchTokenProgramFromAccount` to
`fetch-token-info.ts`. This function will simply return us the `programId` of
the given mint.

To accomplish this we will call the `getParsedAccountInfo` function and return
the owning program from `.value.owner`.

The `fetchTokenProgramFromAccount` function will need the following parameters:

- `connection` - The connection object to use
- `mint` - Public key of the mint account

The final function will look like this:

```ts
// previous imports and code

export async function fetchTokenProgramFromAccount(
  connection: Connection,
  mint: PublicKey,
) {
  // Find the program ID from the mint
  const accountInfo = await connection.getParsedAccountInfo(mint);
  if (accountInfo.value === null) {
    throw new Error("Account not found");
  }
  const programId = accountInfo.value.owner;
  return programId;
}
```

Finally let's add see this in action in our `index.ts`:

```ts
// previous imports
import {
  TokenInfoForDisplay,
  fetchTokenInfo,
  fetchTokenProgramFromAccount,
} from "./fetch-token-info";

// previous code
const tokenProgramTokenProgram = await fetchTokenProgramFromAccount(
  connection,
  tokenProgramMint,
);
const tokenExtensionProgramTokenProgram = await fetchTokenProgramFromAccount(
  connection,
  tokenExtensionProgramMint,
);

if (!tokenProgramTokenProgram.equals(TOKEN_PROGRAM_ID))
  throw new Error("Token Program mint token program is not correct");
if (!tokenExtensionProgramTokenProgram.equals(TOKEN_2022_PROGRAM_ID))
  throw new Error("Token Extensions Program mint token program is not correct");
```

Run `npm run start` again. You should see the same output as before - meaning
the expected token programs were correct.

That's it! If you get stuck at any step, you can find the complete code in
[this lab's repository's](https://github.com/Unboxed-Software/solana-lab-token22-in-the-client/)
`solution` branch.

## Challenge

For the challenge, try and implement the burn token functionality for the Token
Program tokens and the Token Extensions tokens.
