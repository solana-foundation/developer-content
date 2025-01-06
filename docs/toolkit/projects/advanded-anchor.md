---
title: Advanced Anchor Smart Contracts
sidebarSortOrder: 3
sidebarLabel: Advanced Anchor
---

```shell
npx create-solana-program
```

[Create solana program](https://github.com/solana-program/create-solana-program)
initializes a more complex workspace with everything you need for general Solana
smart contract development. This Scaffold allows you to write either native rust
smart contracts or anchor smart contracts.

After running this command, you'll have the option to choose between Shank and
Anchor for the program framework:

- **Shank** creates a vanilla Solana smart contract with Shank macros to
  generate IDLs. For more information on Shank, read the
  [README](https://github.com/metaplex-foundation/shank).

- **Anchor** creates a smart contract using the Anchor framework, which
  abstracts away many complexities enabling fast program development. For more
  information on the Anchor framework, read the
  [Anchor book](https://www.anchor-lang.com/).

To use `create-solana-program` for native rust development, make sure you chose
Anchor when asked which program framework to use. This will create a basic
counter program with the following project structure for your program:

```shell
├── program.rs
│   ├── src.rs
│   │   ├── lib.rs
│   ├── Cargo.toml
│   ├── keypair.json
│   ├── README.md
```

Next, you'll have the option to choose between a JavaScript client, a Rust
Client, or both.

- **JavaScript Client** creates a typescript library compatible with
  [web3.js](https://solana-labs.github.io/solana-web3.js/).

- **Rust Client** creates a rust crate allowing consumers to interact with the
  smart contract.

For further workspace customization and additional information, check out the
`create-solana-program`
[README](https://github.com/solana-program/create-solana-program/tree/main).

After answering the above questions, the workspace will be generated. To get
started, build your program and clients by running:

```shell
cd <my-program-name>
npm install
npm dev generate
```
