---
title: Update an Existing Project
sidebarSortOrder: 7
sidebarLabel: Existing Project
---

If you have an existing anchor program and want to use the
[Create solana program](https://github.com/solana-program/create-solana-program)
tool, you can easily replace the generated program with your existing one:

1. Ensure the installed Solana and Anchor versions are the same as the ones your
   existing program requires.

2. Scaffold a new Solana program using Anchor.
   `pnpm create solana-program --anchor`.

3. Replace the `program` folder with your existing program directory (not the
   workspace directory). If you have more than one program, add more folders to
   the root directory and update the `members` attribute of the top-level
   `Cargo.toml` accordingly.

4. Ensure your program’s `Cargo.toml` contains the following metadata:

```toml filename="Cargo.toml"
[package.metadata.solana]
program-id = "YOUR_PROGRAM_ADDRESS"
program-dependencies = []
```

5. Build your program and clients.

```shell
npm install
npm run programs:build
npm run generate
```

6. If you have a generated Rust client, update the `clients/rust/src/lib.rs`
   file so the `ID` alias points to the correct generated constant.

7. If you have any generated clients, update the scaffolded tests so they work
   with your existing program.
