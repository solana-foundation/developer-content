---
title: Creating A Project on Solana
---

To start a new project with the Solana toolkit, pick which scaffold you want to
use. There are scaffolds for:

- [Anchor framework workspaces](#anchor-smart-contract-scaffold)
- [general scaffolds using `create-solana-program`](#general-smart-contract-scaffold)
- [web app workspaces](#web-app-scaffold)
- [mobile app workspaces](#mobile-app-templates)

## Anchor Smart Contract Scaffold

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

## General Smart Contract Scaffold - Create Solana Program

```shell
npx create-solana-program
```

This initializes a more complex workspace with everything you need for general
Solana smart contract development. This Scaffold allows you to write either
native rust smart contracts or anchor smart contracts.

After running this command, you'll have the option to choose between Shank and
Anchor for the program framework:

- **Shank** creates a vanilla Solana smart contract with Shank macros to
  generate IDLs. For more information on Shank, read the
  [README](https://github.com/metaplex-foundation/shank).

- **Anchor** creates a smart contract using the Anchor framework, which
  abstracts away many complexities enabling fast program development. For more
  information on the Anchor framework, read the
  [Anchor book](https://www.anchor-lang.com/).

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

### Native Rust Smart Contract Development with Create Solana Program

To use `create-solana-program` for native rust development, make sure you chose
Shank when asked which program framework to use. This will create a basic
counter program with the following project structure for your program:

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

### Anchor Smart Contract Development with Create Solana Program

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

## Web App Scaffold

```shell
npx create-solana-dapp
```

This command generates a new project that connects a Solana smart contract to a
frontend with a wallet connector.

For additional information, check out its
[README](https://github.com/solana-developers/create-solana-dapp).

To test out this project before making any modifications, follow these steps:

1. Build the smart contract:

```shell
npm run anchor-build
```

2. Start the local validator:

```shell
npm run anchor-localnet
```

3. Run tests:

```shell
npm run anchor-test
```

4. Deploy to the local validator:

```shell
npm run anchor deploy --provider.cluster localnet
```

5. Build the web app:

```shell
npm run build
```

6. Run the web app:

```shell
npm run dev
```

## Mobile App Templates

```shell
yarn create expo-app --template @solana-mobile/solana-mobile-expo-template
```

This is initializing a new project using the Expo framework that is specifically
designed for creating mobile applications that interact with the Solana
blockchain.

Follow their
[Running the app](https://docs.solanamobile.com/react-native/expo#running-the-app)
guide to launch the template as a custom development build and get it running on
your Android emulator. Once you have built the program and are running a dev
client with Expo, the emulator will automatically update every time you save
your code.

To use this template, you will also need to set up the following:

- [Android Studio and Emulator](https://docs.solanamobile.com/getting-started/development-setup)
- [React Native](https://reactnative.dev/docs/environment-setup?platform=android)
- [EAS CLI and Account](https://docs.expo.dev/build/setup/)

For additional information on Solana Mobile Development:
https://docs.solanamobile.com/getting-started/intro

## Working on an Existing Project

If you have an existing anchor program and want to use the
[create solana program tool](#general-smart-contract-scaffold), you can easily
replace the generated program with your existing one:

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
