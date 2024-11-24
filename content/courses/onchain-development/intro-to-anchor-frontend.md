---
title: Intro to client-side Anchor development
objectives:
  - Use an IDL to interact with a Solana program from the client
  - Explain an Anchor `Provider` object
  - Explain an Anchor `Program` object
  - Use the Anchor `MethodsBuilder` to build instructions and transactions
  - Use Anchor to fetch accounts
  - Set up a frontend to invoke instructions using Anchor and an IDL
description:
  "Use Anchor's automatic JS/TS clients to send instructions to your program."
---

## Summary

- An **IDL** is a file representing the structure of a Solana program. Programs
  written and built using Anchor automatically generate a corresponding IDL. IDL
  stands for Interface Description Language.
- `@coral-xyz/anchor` is a Typescript client that includes everything you'll
  need to interact with Anchor programs
- An **Anchor `Provider`** object combines a `connection` to a cluster and a
  specified `wallet` to enable transaction signing
- An **Anchor `Program`** object provides a custom API to interact with a
  specific program. You create a `Program` instance using a program's IDL and
  `Provider`.
- The **Anchor `MethodsBuilder`** provides a simple interface through `Program`
  for building instructions and transactions

## Lesson

Anchor simplifies the process of interacting with Solana programs from the
client by providing an Interface Description Language (IDL) file that reflects
the structure of a program. Using the IDL in conjunction with Anchor's
Typescript library (`@coral-xyz/anchor`) provides a simplified format for
building instructions and transactions.

```typescript
// sends transaction
await program.methods
  .instructionName(instructionDataInputs)
  .accounts({})
  .signers([])
  .rpc();
```

This works from any Typescript client, whether it's a frontend or integration
tests. In this lesson we'll go over how to use `@coral-xyz/anchor` to simplify
your client-side program interaction.

### Anchor client-side structure

Let's start by going over the basic structure of Anchor's Typescript library.
The primary object you'll be using is the `Program` object. A `Program` instance
represents a specific Solana program and provides a custom API for reading and
writing to the program.

To create an instance of `Program`, you'll need the following:

- `IDL` - file representing the structure of a program
- `Connection` - the cluster connection
- `Wallet` - default keypair used to pay for and sign transactions
- `Provider` - encapsulates the `Connection` to a Solana cluster and a `Wallet`

![Anchor structure](/public/assets/courses/unboxed/anchor-client-structure.png)

The above image shows how each of these pieces are combined to create a
`Program` instance. We'll go over each of them individually to get a better idea
of how everything ties together.

#### Interface Description Language (IDL)

When you build an Anchor program, Anchor generates both a JSON and Typescript
file representing your program's IDL. The IDL represents the structure of the
program and can be used by a client to infer how to interact with a specific
program.

While it isn't automatic, you can also generate an IDL from a native Solana
program using tools like [shank](https://github.com/metaplex-foundation/shank)
by Metaplex.

To get an idea of the information an IDL provides, here is the IDL for the
counter program you built previously:

```json
{
  "address": "9sMy4hnC9MML6mioESFZmzpntt3focqwUq1ymPgbMf64",
  "metadata": {
    "name": "anchor_counter",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "increment",
      "discriminator": [11, 18, 104, 9, 104, 174, 59, 33],
      "accounts": [
        {
          "name": "counter",
          "writable": true
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initialize",
      "discriminator": [175, 175, 109, 31, 13, 152, 155, 237],
      "accounts": [
        {
          "name": "counter",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "system_program",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Counter",
      "discriminator": [255, 176, 4, 245, 188, 253, 124, 25]
    }
  ],
  "types": [
    {
      "name": "Counter",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "count",
            "type": "u64"
          }
        ]
      }
    }
  ]
}
```

Inspecting the IDL, you can see the `programId` and the `metadata` object which
have been added in anchor 0.30.0

This program contains two instruction handlers, `initialize` and `increment`.

Notice that in addition to specifying the instruction handlers, it specifies the
accounts and inputs for each instruction. The `initialize` instruction requires
three accounts:

1. `counter` - the new account being initialized in the instruction
2. `user` - the payer for the transaction and initialization
3. `systemProgram` - the system program is invoked to initialize a new account

And the `increment` instruction requires two accounts:

1. `counter` - an existing account to increment the count field
2. `user` - the payer from the transaction

Looking at the IDL, you can see that in both instructions the `user` is required
as a signer because the `isSigner` flag is marked as `true`. Additionally,
neither instructions require any additional instruction data since the `args`
section is blank for both.

Looking further down at the `accounts` section, you can see that the program
contains one account type named `Counter` with a the `discriminator` field,
which is used to distinguish between various type of accounts present.

Last, we have the `types` section, which contains types of account in the
`accounts` section , in this case, for account type `Counter` it contains a
single field named `count` of type `u64`

Although the IDL does not provide the implementation details for each
instruction, we can get a basic idea of how the onchain program expects
instructions to be constructed and see the structure of the program accounts.

Regardless of how you get it, you _need_ an IDL file to interact with a program
using the `@coral-xyz/anchor` package. To use the IDL, you'll need to include
the IDL file along with the types in your project and then import the file.

```typescript
import idl from "./idl.json";
```

You would _ideally_ also require types for the IDL which would make it easier to
interact with the program. The types can be found at `/target/types` folder
after you have built your program. Here are the types for the above IDL which
when you notice has the exact same structure as the IDL but are just as type
helper.

```typescript
/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/anchor_counter.json`.
 */
export type AnchorCounter = {
  address: "9sMy4hnC9MML6mioESFZmzpntt3focqwUq1ymPgbMf64";
  metadata: {
    name: "anchorCounter";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "increment";
      discriminator: [11, 18, 104, 9, 104, 174, 59, 33];
      accounts: [
        {
          name: "counter";
          writable: true;
        },
        {
          name: "user";
          signer: true;
        },
      ];
      args: [];
    },
    {
      name: "initialize";
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
      accounts: [
        {
          name: "counter";
          writable: true;
          signer: true;
        },
        {
          name: "user";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
  ];
  accounts: [
    {
      name: "counter";
      discriminator: [255, 176, 4, 245, 188, 253, 124, 25];
    },
  ];
  types: [
    {
      name: "counter";
      type: {
        kind: "struct";
        fields: [
          {
            name: "count";
            type: "u64";
          },
        ];
      };
    },
  ];
};
```

#### Provider

Before you can create a `Program` object using the IDL, you first need to create
an Anchor `Provider` object.

The `Provider` object combines two things:

- `Connection` - the connection to a Solana cluster (i.e. localhost, devnet,
  mainnet)
- `Wallet` - a specified address used to pay for and sign transactions

The `Provider` is then able to send transactions to the Solana blockchain on
behalf of a `Wallet` by including the wallet's signature to outgoing
transactions. When using a frontend with a Solana wallet provider, all outgoing
transactions must still be approved by the user via their wallet browser
extension.

Setting up the `Wallet` and `Connection` would look something like this:

```typescript
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";

const { connection } = useConnection();
const wallet = useAnchorWallet();
```

To set up the connection, you can use the `useConnection` hook from
`@solana/wallet-adapter-react` to get the `Connection` to a Solana cluster.

Note that the `Wallet` object provided by the `useWallet` hook from
`@solana/wallet-adapter-react` is not compatible with the `Wallet` object that
the Anchor `Provider` expects. However, `@solana/wallet-adapter-react` also
provides a `useAnchorWallet` hook.

For comparison, here is the `AnchorWallet` from `useAnchorWallet`:

```typescript
export interface AnchorWallet {
  publicKey: PublicKey;
  signTransaction(transaction: Transaction): Promise<Transaction>;
  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]>;
}
```

And the `WalletContextState` from `useWallet`:

```typescript
export interface WalletContextState {
  autoConnect: boolean;
  wallets: Wallet[];
  wallet: Wallet | null;
  publicKey: PublicKey | null;
  connecting: boolean;
  connected: boolean;
  disconnecting: boolean;
  select(walletName: WalletName): void;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sendTransaction(
    transaction: Transaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ): Promise<TransactionSignature>;
  signTransaction: SignerWalletAdapterProps["signTransaction"] | undefined;
  signAllTransactions:
    | SignerWalletAdapterProps["signAllTransactions"]
    | undefined;
  signMessage: MessageSignerWalletAdapterProps["signMessage"] | undefined;
}
```

The `WalletContextState` provides much more functionality compared to the
`AnchorWallet`, but the `AnchorWallet` is required to set up the `Provider`
object.

To create the `Provider` object you use `AnchorProvider` from
`@coral-xyz/anchor`.

The `AnchorProvider` constructor takes three parameters:

- `connection` - the `Connection` to the Solana cluster
- `wallet` - the `Wallet` object
- `opts` - optional parameter that specifies the confirmation options, using a
  default setting if one is not provided

Once you've created the `Provider` object, you then set it as the default
provider using `setProvider`.

```typescript
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, setProvider } from "@coral-xyz/anchor";

const { connection } = useConnection();
const wallet = useAnchorWallet();
const provider = new AnchorProvider(connection, wallet, {
  commitment: "confirmed",
});
setProvider(provider);
```

#### Program

Once you have the IDL and a provider, you can create an instance of `Program`.
The constructor requires three parameters:

- `idl` - the IDL as type `Idl`
- `Provider` - the provider discussed in the previous section

The `Program` object creates a custom API you can use to interact with a Solana
program. This API is the one stop shop for all things related to communicating
with onchain programs. Among other things, you can send transactions, fetch
deserialized accounts, decode instruction data, subscribe to account changes,
and listen to events. You can also
[learn more about the `Program` class](https://coral-xyz.github.io/anchor/ts/classes/Program.html#constructor).

To create the `Program` object, first import `Program` and `Idl` from
`@coral-xyz/anchor`. `Idl` is a type you can use when working with Typescript.

When creating the `Program` object, the default `Provider` is used if one is not
explicitly specified.

To enable type support, import the types to your project from `/target/types`
present in your anchor project, and declare the type for the program object.

All together, the final setup looks something like this:

```typescript
import idl from "./idl.json";
import type { CounterProgram } from "@/types";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, Idl, AnchorProvider, setProvider } from "@coral-xyz/anchor";

const { connection } = useConnection();
const wallet = useAnchorWallet();

const provider = new AnchorProvider(connection, wallet, {});
setProvider(provider);

const program = new Program(idl as CounterProgram);

// we can also explicitly mention the provider
const program = new Program(idl as CounterProgram, provider);
```

### Anchor `MethodsBuilder`

Once the `Program` object is set up, you can use the Anchor Methods Builder to
build instructions and transactions related to the program. The `MethodsBuilder`
uses the IDL to provide a simplified format for building transactions that
invoke program instructions.

Note that the camel case naming convention is used when interacting with a
program from the client, compared to the snake case naming convention used when
the writing the program in rust.

The basic `MethodsBuilder` format looks like this:

```typescript
// sends transaction
await program.methods
  .instructionName(instructionDataInputs)
  .accounts({})
  .signers([])
  .rpc();
```

Going step by step, you:

1. Call `methods` on `program` - this is the builder API for creating
   instruction calls related to the program's IDL
2. Call the instruction name as `.instructionName(instructionDataInputs)` -
   simply call the instruction using dot syntax and the instruction's name,
   passing in any instruction arguments as comma-separated values
3. Call `accounts` - using dot syntax, call `.accounts`, passing in an object
   with each account the instruction expects based on the IDL
4. Optionally call `signers` - using dot syntax, call `.signers`, passing in an
   array of additional signers required by the instruction
5. Call `rpc` - this method creates and sends a signed transaction with the
   specified instruction and returns a `TransactionSignature`. When using
   `.rpc`, the `Wallet` from the `Provider` is automatically included as a
   signer and does not have to be listed explicitly.

Note that if no additional signers are required by the instruction other than
the `Wallet` specified with the `Provider`, the `.signer([])` line can be
excluded.

You can also build the transaction directly by changing `.rpc()` to
`.transaction()`. This builds a `Transaction` object using the instruction
specified.

```typescript
// creates transaction
const transaction = await program.methods
  .instructionName(instructionDataInputs)
  .accounts({})
  .transaction();

await sendTransaction(transaction, connection);
```

Similarly, you can use the same format to build an instruction using
`.instruction()` and then manually add the instructions to a new transaction.
This builds a `TransactionInstruction` object using the instruction specified.

```typescript
// creates first instruction
const instructionOne = await program.methods
  .instructionOneName(instructionOneDataInputs)
  .accounts({})
  .instruction();

// creates second instruction
const instructionTwo = await program.methods
  .instructionTwoName(instructionTwoDataInputs)
  .accounts({})
  .instruction();

// add both instruction to one transaction
const transaction = new Transaction().add(instructionOne, instructionTwo);

// send transaction
await sendTransaction(transaction, connection);
```

In summary, the Anchor `MethodsBuilder` provides a simplified and more flexible
way to interact with onchain programs. You can build an instruction, a
transaction, or build and send a transaction using basically the same format
without having to manually serialize or deserialize the accounts or instruction
data.

### Fetch program accounts

The `Program` object also allows you to easily fetch and filter program
accounts. Simply call `account` on `program` and then specify the name of the
account type as reflected on the IDL. Anchor then deserializes and returns all
accounts as specified.

The example below shows how you can fetch all existing `counter` accounts for
the Counter program.

```typescript
const accounts = await program.account.counter.all();
```

You can also apply a filter by using `memcmp` and then specifying an `offset`
and the `bytes` to filter for.

The example below fetches all `counter` accounts with a `count` of 0. Note that
the `offset` of 8 is for the 8 byte discriminator Anchor uses to identify
account types. The 9th byte is where the `count` field begins. You can refer to
the IDL to see that the next byte stores the `count` field of type `u64`. Anchor
then filters for and returns all accounts with matching bytes in the same
position.

```typescript
const accounts = await program.account.counter.all([
  {
    memcmp: {
      offset: 8,
      bytes: bs58.encode(new BN(0, "le").toArray()),
    },
  },
]);
```

Alternatively, you can also get the deserialized account data for a specific
account using `fetch` if you know the address of the account you're looking for.

```typescript
const account = await program.account.counter.fetch(ACCOUNT_ADDRESS);
```

Similarly, you can fetch multiple accounts using `fetchMultiple`.

```typescript
const accounts = await program.account.counter.fetchMultiple([
  ACCOUNT_ADDRESS_ONE,
  ACCOUNT_ADDRESS_TWO,
]);
```

## Lab

Let's practice this together by building a frontend for the Counter program from
last lesson. As a reminder, the Counter program has two instructions:

- `initialize` - initializes a new `Counter` account and sets the `count` to `0`
- `increment` - increments the `count` on an existing `Counter` account

#### 1. Download the starter code

Download
[the starter code for this project](https://github.com/solana-developers/anchor-ping-frontend/tree/starter).
Once you have the starter code, take a look around. Install the dependencies
with `npm install` and then run the app with `npm run dev`.

This project is a simple Next.js application, created using
`npx create-next-dapp`

The `idl.json` file for the Counter program, and the `Initialize` and
`Increment` components we'll be building throughout this lab.

#### 2. `Initialize`

To begin, let's complete the setup to create the `useCounterProgram` hook in
`components/counter/counter-data-access.tsx` component.

Remember, we'll need an instance of `Program` to use the Anchor `MethodsBuilder`
to invoke the instructions on our program. `create-solana-dapp` already creates
a `getCounterProgram` for us, which will return us the `Program` instance.

```typescript
// This is a helper function to get the Counter Anchor program.
export function getCounterProgram(provider: AnchorProvider) {
  return new Program(CounterIDL as AnchorCounter, provider);
}
```

Now, in the `useCounterProgram` hook, we'll create a program instance

```typescript
const provider = useAnchorProvider();
const program = getCounterProgram(provider);
```

- `useAnchorProvider` is an helper function at
  `components/solana/solana-provider` which returns the provider.

Now that we've the program instance, we can actually invoke the program's
`initialize` instruction. We'll do this using `useMutation`.

Remember, We'll need to generate a new `Keypair` for the new `Counter` account
since we are initializing an account for the first time.

```typescript
const initialize = useMutation({
  mutationKey: ["counter", "initialize", { cluster }],

  mutationFn: (keypair: Keypair) =>
    program.methods
      .initialize()
      .accounts({ counter: keypair.publicKey })
      .signers([keypair])
      .rpc(),

  onSuccess: signature => {
    transactionToast(signature);
    return accounts.refetch();
  },
  onError: () => toast.error("Failed to initialize account"),
});
```

Just focus on the `mutationFn` which accepts a `keypair` which we'll be passing.
We are using the Anchor `MethodsBuilder` to create and send a new transaction.
Remember, Anchor can infer some of the accounts required, like the `user` and
`systemAccount` accounts. However, it can't infer the `counter` account because
we generate that dynamically, so you'll need to add it with `.accounts`. You'll
also need to add that keypair as a sign with `.signers`. Lastly, you can use
`.rpc()` to submit the transaction to the user's wallet.

Once the transaction goes through,we are calling `onSuccess` with the signature
and then fetching `accounts`.

#### 3. `Accounts`

In the above `initialize` mutation, we are calling `accounts.refetch()`. This is
a to refresh the accounts that we have stored, every time a new account is
initialized.

```typescript
const accounts = useQuery({
  queryKey: ["counter", "all", { cluster }],
  queryFn: () => program.account.counter.all(),
});
```

We now use `account` from `program` instance to get all `counter` accounts
created. This method internally calls, `getProgramAccounts`.

#### 4. `Increment`

Next, let's move on the the `useCounterProgramAccount` hook. As we have earlier
already created `program` and `accounts` function in previous hook, we'll call
the hooks to access them and not redefine them.

Add the following code for the initial set up:

```typescript
export function useCounterProgramAccount({ account }: { account: PublicKey }) {
  ...

  const { program, accounts } = useCounterProgram();
}

```

Next, let's use the Anchor `MethodsBuilder` to build a new instruction to invoke
the `increment` instruction. Again, Anchor can infer the `user` account from the
wallet so we only need to include the `counter` account.

```typescript
const incrementMutation = useMutation({
  mutationKey: ["counter", "increment", { cluster, account }],

  mutationFn: () =>
    program.methods.increment().accounts({ counter: account }).rpc(),

  onSuccess: tx => {
    transactionToast(tx);
    return accountQuery.refetch();
  },
});
```

As the counter is getting updated, we'll update the counter count by calling
`accountQuery.refetch()` when the transaction is success.

```typescript
const accountQuery = useQuery({
  queryKey: ["counter", "fetch", { cluster, account }],
  queryFn: () => program.account.counter.fetch(account),
});
```

#### 6. Test the frontend

At this point, everything should work! You can test the frontend by running
`yarn dev`.

1. Connect your wallet and head to `Counter Program` tab
2. Click the `Create` button, and then approve the transaction
3. You should then see a link at the bottom right of the screen to Solana
   Explorer for the `initialize` transaction. The `Increment` button and the
   count appear.
4. Click the `Increment` button, and then approve the transaction
5. Wait a few seconds . The count should increment on the screen.

![Anchor Frontend Demo](/public/assets/courses/unboxed/anchor-frontend-demo.gif)

Feel free to click the links to inspect the program logs from each transaction!

![Initialize Program Log](/public/assets/courses/unboxed/anchor-frontend-initialize.png)

![Increment Program Log](/public/assets/courses/unboxed/anchor-frontend-increment.png)

Congratulations, you now know how to set up a frontend to invoke a Solana
program using an Anchor IDL.

If you need more time with this project to feel comfortable with these concepts,
feel free to have a look at
the [solution code on the `solution-increment` branch](https://github.com/Unboxed-Software/anchor-ping-frontend/tree/solution-increment) before
continuing.

## Challenge

Now it's your turn to build something independently. Building on top of what
we've done in the lab, try to create a new component in the frontend that
implements a button to decrements the counter.

Before building the component in the frontend, you'll first need to:

1. Build and deploy a new program that implements a `decrement` instruction
2. Update the IDL file in the frontend with the one from your new program
3. Update the `programId` with the one from your new program

If you need some help, feel free to
[reference this program](https://github.com/solana-developers/anchor-ping-frontend/tree/solution-increment).

Try to do this independently if you can! But if you get stuck, feel free to
reference
the [solution code](https://github.com/solana-developers/anchor-ping-frontend/tree/solution-decrement).

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=774a4023-646d-4394-af6d-19724a6db3db)!
</Callout>
