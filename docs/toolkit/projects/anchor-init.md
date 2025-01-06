---
title: Basic Anchor Smart Contracts
sidebarSortOrder: 2
sidebarLabel: Basic Anchor
---

```shell
anchor init <project_name>
```

This initializes a simplistic workspace set up for Anchor smart contract
development, with the following structure:

- `Anchor.toml`: Anchor configuration file.
- `Cargo.toml`: Rust workspace configuration file.
- `package.json`: JavaScript dependencies file.
- `programs/`: Directory for Solana program crates.
- `app/`: Directory for your application frontend.
- `tests/`: Directory for JavaScript integration tests.
- `migrations/deploy.js`: Deploy script.

The Anchor framework abstracts away many complexities enabling fast program
development.

To test out this project before making any modifications, just build and test:

```shell
anchor build
```

```shell
anchor test
```

To start writing your own anchor smart contract, navigate to
`programs/src/lib.rs`.

For more complex programs, using a more structured project template would be
best practice. This can be generated with:

```shell
anchor init --template multiple
```

which creates the following layout inside of `programs/src`:

```shell
├── constants.rs
├── error.rs
├── instructions
│   ├── initialize.rs
│   └── mod.rs
├── lib.rs
└── state
    └── mod.rs
```

For more information on the Anchor framework, check out the
[Anchor book](https://www.anchor-lang.com/).
