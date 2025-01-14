---
title: Update an Existing Project
sidebarSortOrder: 7
sidebarLabel: Existing Projects
description:
  "How to add an existing project to a create solana program scaffold" 
keywords:
  - solana program development 
  - create solana program
  - solana anchor development
  - program scaffold 
  - anchor framework 
  - solana workspace set up 
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

If you have an existing Anchor program and want to use the
[`create-solana-program`](https://github.com/solana-program/create-solana-program)
tool, you can easily replace the generated program with your existing one:

<Steps>

### Verify correct versions

Ensure the installed Solana and Anchor versions are the same as the ones your
existing program requires.

### Run create-solana-program

Scaffold a new Solana program using Anchor by running:

```shell
npx create-solana-program --anchor
```

### Migrate your program source code

Replace the `program` folder with your existing program directory (not the
workspace directory). If you have more than one program, add more folders to the
root directory and update the `members` attribute of the top-level `Cargo.toml`
accordingly.

### Update each program's Cargo.toml

Ensure your program’s `Cargo.toml` contains the following metadata:

```toml filename="Cargo.toml"
[package.metadata.solana]
program-id = "YOUR_PROGRAM_ADDRESS"
program-dependencies = []
```

### Build your program and clients

Run the following commands to build your programs and generate the clients:

```shell
npm install
npm run programs:build
npm run generate
```

### Update the ID alias

If you have a generated Rust client, update the `clients/rust/src/lib.rs` file
so the `ID` alias points to the correct generated constant.

### Update any client tests

If you have any generated clients, update the scaffolded tests so they work with
your existing program.

</Steps>
