---
featured: false
date: 2023-07-17T00:00:00Z
difficulty: intro
title: "Getting started with Solang"
description:
  "Quickstart guide on how to build your first Solana program with Solidity
  using Solang"
tags:
  - quickstart
  - solang
  - solidity
keywords:
  - solang
  - solidity
  - tutorial
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
altRoutes:
  - /developers/guides/solang/solang-getting-started
  - /developers/guides/solang-getting-started
---

# Getting Started with Solang

Welcome to this beginner’s guide on getting started with Solang!
[Solang](https://solang.readthedocs.io/) is a Solidity Compiler that allows you
to write Solana programs - referred to in other blockchains as 'smart
contracts' - using the Solidity programming language.

If you’re an EVM developer that’s interested in leveraging the high speed and
low fees of the Solana network, then Solang is the perfect tool for you. With
Solang, you can leverage your existing knowledge of Solidity to start building
on Solana!

## Installation

In this section, we'll help you set up your development environment for Solang.
Just follow the steps outlined below:

1. **Check Your Prerequisites**: Before diving in, ensure that you have
   [Rust](https://www.rust-lang.org/tools/install) and
   [Node.js](https://nodejs.org/en) installed on your system. Windows users will
   also need to have [Windows Subsystem for Linux](/docs/intro/installation) set
   up.
2. **Solana Tool Suite Installation**: Begin by installing the
   [Solana Tool Suite](https://docs.solana.com/cli/install-solana-cli-tools),
   which includes the Solana Command Line Interface (CLI) and the latest version
   of Solang.
3. **Anchor Framework Installation**: Next, install the
   [Anchor Framework](https://www.anchor-lang.com/docs/installation). Anchor is
   a widely used framework in the Solana ecosystem and simplifies the process of
   building Solana programs. With version 0.28, you can start building with
   Solang directly through Anchor.

   As of the time of this writing, please install Anchor using the following
   command for compatibility with Solang version 0.3.1:

   ```
   cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked --force
   ```

4. **Solang Extension for VSCode**: If you're a Visual Studio Code (VSCode)
   user, it's recommended to install the Solang
   [extension](https://marketplace.visualstudio.com/items?itemName=solang.solang)
   to assist with syntax highlighting. Remember to disable any active Solidity
   extensions to ensure that the Solang extension works correctly.

## Creating a new project

Once you’ve installed the Solana CLI and Anchor, you can create a new project
with the following command:

```
anchor init project_name --solidity
```

This command generates a new project with a basic Solang on-chain program
(equivalent to a smart contract on EVM) and a test file that demonstrate how to
interact with the program from the client.

## On-chain program Overview

Next, let’s go over the starter code beginning with the on-chain program itself.
Within your project's `./solidity` directory, you’ll find the following contract
below, which includes:

- A `constructor` to initialize a state variable
- A `print` function to print messages to the program logs
- A `flip` function to update the state variable
- A `get` function to return the current value of the state variable

```solidity
@program_id("F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC")
contract starter {
    bool private value = true;

    @payer(payer)
    constructor(address payer) {
        print("Hello, World!");
    }

    /// A message that can be called on instantiated contracts.
    /// This one flips the value of the stored `bool` from `true`
    /// to `false` and vice versa.
    function flip() public {
            value = !value;
    }

    /// Simply returns the current value of our `bool`.
    function get() public view returns (bool) {
            return value;
    }
}
```

### Important Differences

Compared to an EVM smart contract, there are two important differences you might
notice:

1. The `@program_id` annotation:

   On Solana, smart contracts are referred to as “programs”. The `@program_id`
   annotation is used to specify the on-chain address of the program.

```solidity
@program_id("F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC") // on-chain program address
```

2. The `@payer` annotation:

   When storing data on-chain, a certain amount of SOL needs to be allocated to
   cover the storage costs. The `@payer` annotation specifies the user that will
   pay the SOL required to create the account for storing the state variable.

```solidity
@payer(payer) // payer for the "data account"
constructor(address payer) {
    print("Hello, World!");
}
```

### Storing of state data

An important distinction between EVM smart contracts and Solana programs is how
each stores "state" variables/data:

- EVM smart contracts can directly store state variables.
- Solana onchain programs, on the other hand, create separate accounts to hold
  state data. These are often referred to as "data accounts" and are "owned" by
  a program.

In this example, when the contract is deployed, it is deployed to the address
specified in `@program_id`. When the `constructor` is called after the program
is deployed, a separate account with its own address is created to store the
state variable, instead of being stored within the contract itself.

This may sound a bit different than what you’re used to, but don't worry! Let’s
go over the test file to shed more light on this concept.

## Test File Overview

The starter test file can be found in the `./tests` directory. This file
provides an example of how to interact with the program from the client.

Anchor sets up the `provider` and `program` to help us connect to the contract
from the client. This is done using an IDL file which lays out the program's
public interface, similar to the ABI files used in EVM smart contracts. If you
run `anchor build`, the IDL file is generated and can be found at
`./target/idl`.

```jsx
import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Starter } from "../target/types/starter"

describe("starter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)

  const dataAccount = anchor.web3.Keypair.generate()
  const wallet = provider.wallet

  const program = anchor.workspace.Starter as Program<Starter>

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .new(wallet.publicKey)
      .accounts({ dataAccount: dataAccount.publicKey })
      .signers([dataAccount])
      .rpc()
    console.log("Your transaction signature", tx)

    const val1 = await program.methods
      .get()
      .accounts({ dataAccount: dataAccount.publicKey })
      .view()

    console.log("state", val1)

    await program.methods
      .flip()
      .accounts({ dataAccount: dataAccount.publicKey })
      .rpc()

    const val2 = await program.methods
      .get()
      .accounts({ dataAccount: dataAccount.publicKey })
      .view()

    console.log("state", val2)
  })
})
```

In the test file, we first generate a new Keypair which will be used to create
the “data account” that stores the contract’s state.

```jsx
const dataAccount = anchor.web3.Keypair.generate();
```

Next, we use the `new` instruction to create a new data account. This
instruction corresponds with the contract's `constructor`. The newly created
data account will be initialized to store the state variable defined in the
contract.

Here, the `payer` is specified as `wallet.publicKey`, and the address of the
`dataAccount` that we plan to create is provided. The generated `dataAccount`
Keypair is included as an additional signer on the transaction, as it's being
used to create a new account. Essentially, this verifies that we hold the secret
key corresponding to the address of the new account we're creating.

```jsx
// Client
const tx = await program.methods
  .new(wallet.publicKey)
  .accounts({ dataAccount: dataAccount.publicKey })
  .signers([dataAccount])
  .rpc()

// on-chain program
@payer(payer)
constructor(address payer) {
    print("Hello, World!");
}
```

The contract's `get` function is then invoked to fetch the value stored in the
specified `dataAccount`.

```jsx
// Client
const val1 = await program.methods
  .get()
  .accounts({ dataAccount: dataAccount.publicKey })
  .view()

// on-chain program
function get() public view returns (bool) {
        return value;
}
```

Next, the contract’s `flip` function is used to modify the state of the
specified `dataAccount`.

```jsx
// Client
await program.methods
  .flip()
  .accounts({ dataAccount: dataAccount.publicKey })
  .rpc()

// on-chain program
function flip() public {
        value = !value;
}
```

To run the test, use the `anchor test` command in the terminal.

The `anchor test` command performs the following tasks:

- Start a local Solana validator
- Build and deploy your on-chain program to the local validator
- Run the test file

The following output should then be displayed in the console:

```
Your transaction signature 2x7jh3yka9LU6ZeJLUZNNDJSzq6vdUAXk3mUKuP1MYwr6ArYMHDGw6i15jJnMtnC7BP7zKactStHhTekjq2vh6hP
state true
state false
    ✔ Is initialized! (782ms)
```

You can then inspect the program logs in `./.anchor/program-logs` where you'll
find the "Hello, World!" message:

```
Program F1ipperKF9EfD821ZbbYjS319LXYiBmjhzkkf5a26rC invoke [1]
Program 11111111111111111111111111111111 invoke [2]
Program 11111111111111111111111111111111 success
Program log: Hello, World!
```

Congratulations! You've successfully built your first Solana program with
Solang! While there might be differences compared to what you're accustomed to
with standard Solidity smart contracts, Solang provides an excellent bridge to
help leverage your existing Solidity skills and experience to build on Solana.

## Next Steps

Interested in diving deeper? Check out the `solana-developers/program-examples`
[repository](https://github.com/solana-developers/program-examples). You'll find
Solang implementations for common Solana use cases in the `basics` and `tokens`
sections.

If you have question feel free to post them on
[Solana Stack exchange](https://solana.stackexchange.com/). If you have
questions for the Solang maintainers directly, you reach out to them directly in
the [Hyperledger Foundation discord.](https://discord.com/invite/hyperledger)

Have fun building!
