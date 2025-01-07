---
title: Solana Program Scaffold
sidebarSortOrder: 3
sidebarLabel: Solana Programs
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

```shell
npx create-solana-program
```

[Create solana program](https://github.com/solana-program/create-solana-program)
initializes an in-depth workspace with everything you need for general Solana
smart contract development. This Scaffold allows you to write either native rust
smart contracts or anchor smart contracts.

## Program Frameworks

After running this command, you'll have the option to choose between Shank and
Anchor for the program framework:

- **Shank** creates a vanilla Solana smart contract with Shank macros to
  generate IDLs. For more information on Shank, read the
  [README](https://github.com/metaplex-foundation/shank).

- **Anchor** creates a smart contract using the Anchor framework, which
  abstracts away many complexities enabling fast program development. For more
  information on the Anchor framework, read the
  [Anchor book](https://www.anchor-lang.com/).

For **anchor rust development**, chose Anchor when asked which program framework
to use. This will create a basic anchor counter program with the following
project structure for your program:

```shell
├── program.rs
│   ├── src.rs
│   │   ├── lib.rs
│   ├── Cargo.toml
│   ├── keypair.json
│   ├── README.md
```

For **native rust development**, make sure you chose Shank when asked which
program framework to use. This will create a basic counter program with the
following project structure for your program:

```shell
├── program.rs
│   ├── src.rs
│   │   ├── assertions.rs
│   │   ├──entrypoint.rs
│   │   ├──error.rs
│   │   ├──instruction.rs
│   │   ├──lib.rs
│   │   ├──processor.rs
│   │   ├──state.rs
│   │   ├──utils.rs
│   ├── Cargo.toml
│   ├── keypair.json
│   ├── README.md
```

## Generated Clients

Next, you'll have the option to choose between a JavaScript client, a Rust
Client, or both.

- **JavaScript Client** creates a typescript library compatible with
  [web3.js](https://solana-labs.github.io/solana-web3.js/).

- **Rust Client** creates a rust crate allowing consumers to interact with the
  smart contract.

For further workspace customization and additional information, check out the
`create-solana-program`
[README](https://github.com/solana-program/create-solana-program/tree/main).

## Build

After answering the above prompts, the workspace will be generated. To get
started, build your program and clients by running:

```shell
cd <my-program-name>
pnpm install
pnpm generate
```

To update an existing anchor project to have this scaffold, read this
[guide](existing-projects.md).

## Additional Resources

- [Rust Programs](../../programs/rust/index.md)
- [Program Examples](https://github.com/solana-developers/program-examples)
