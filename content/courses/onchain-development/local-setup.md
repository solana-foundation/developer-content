---
title: Local Program Development
objectives:
  - Set up a local environment for Solana program development, with Solana CLI
    tools, Rust, and Anchor.
  - Ensure Anchor works out of the box with no errors or warnings.
description:
  "Setup a local development environment for building onchain programs."
---

## Summary

- To develop onchain programs locally, you need the **Solana CLI**, **Rust**,
  and (optional, but recommended) **Anchor**.
- You can use `anchor init` to create a new blank Anchor project.
- `anchor test` runs your tests and also builds your code.

## Lesson

There's no formal lesson here! Let's get hands-on by installing the Solana CLI
tools, the Rust SDK, and Anchor, and create a test program to verify that
everything is set up correctly.

## Lab

### Extra steps for Windows users

First, install
[Windows Terminal](https://apps.microsoft.com/detail/9N0DX20HK701) from the
Microsoft store.

Next,
[install Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install).
WSL provides a Linux environment that launches instantly when needed without
slowing down your computer.

Open Windows Terminal, start an 'Ubuntu' session, and proceed with the rest of
these steps.

### Download Rust

First, install Rust by
[following the instructions](https://www.rust-lang.org/tools/install):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Download the Solana CLI tools

Next,
[download the Solana CLI tools](https://docs.solana.com/cli/install-solana-cli-tools):

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

After installation, `solana -V` should display `solana-cli 1.18.x` (where `x`
can be any number).

### Running the Solana Test Validator

The Solana Test Validator is a local emulator for the Solana blockchain. It
provides developers with a private and controlled environment to build and test
Solana programs without needing to connect to a public testnet or mainnet.

To start the Solana Test Validator, run the following command:

```bash
solana-test-validator
```

For more detailed information, you can refer to the
[Solana Test Validator guide](https://solana.com/developers/guides/getstarted/solana-test-validator).

### Download Anchor

Finally, [download Anchor](https://www.anchor-lang.com/docs/installation):

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

After installation, `anchor -V` should display `anchor-cli 0.30.1`. For more
detailed information on Anchor, refer to
[The Anchor Book](https://book.anchor-lang.com).

### Verify your Anchor Installation

Create a temporary project with the default contents using Anchor and ensure it
compiles and runs:

```bash
anchor init temp-project
cd temp-project
anchor test
```

If you are running `solana-test-validator`, you may encounter the error
`Error: Your configured rpc port: 8899 is already in use` when running
`anchor test`. To resolve this, stop the `solana-test-validator` before running
`anchor test`.

**The `anchor test` command should complete without errors or warnings**. If you
encounter issues, we’ll address them below:

#### Error: `package 'solana-program v1.18.12' cannot be built because it requires rustc 1.75.0 or newer`

Run `cargo add solana-program@"=1.18.x"`, where `x` matches your version of
`solana-cli`. Then re-run `anchor test`.

#### Error: `Unable to read keypair file`

Add a keypair to `.config/solana/id.json`. You can either copy a keypair from an
`.env` file (just the array of numbers) into a file or use the command
`solana-keygen new --no-bip39-passphrase` to create a new keypair file. Then
re-run `anchor test`.

#### Error: `Function _ZN112_$LT$solana_program..instruction..InstructionError$u20$as$u20$solana_frozen_abi..abi_example..AbiEnumVisitor$GT$13visit_for_abi17ha3a75fe06f2a2af4E Stack offset of 4584 exceeded max offset of 4096 by 488 bytes, please minimize large stack variables`

If you encounter the error above, follow these steps to resolve it:

1. **Update Dependencies**: Run the following command to update the dependencies
   in your `Cargo.lock` file to the latest versions. If the `Cargo.lock` file
   does not exist, this command will create it with the latest available
   versions.

   ```bash
   cargo update
   ```

2. **Upgrade solana-program**: Please upgrade to `solana-program` version
   `1.18.2` or above, which includes the necessary fix. You can update to the
   latest stable version using one of the following methods:

   - **Using Cargo Command**: Run the following command to update
     solana-program:

     ```bash
     cargo add solana-program
     ```

   - **Manually Update Cargo.toml**: Alternatively, add the following line to
     your Cargo.toml file:

     ```bash
     solana-program = "2.0.8"
     ```

   You can find the latest stable version on the
   [solana-program crate page](https://crates.io/crates/solana-program).

3. **Re-run Tests**: After upgrading, re-run your tests with the following
   command:

   ```bash
   anchor test
   ```

#### Warning: `unused variable: 'ctx'`

This warning indicates that the `initialize` instruction handler isn’t doing
anything yet. You can either open `programs/favorites/src/lib.rs` and change
`ctx` to `_ctx` or proceed to the next step.

#### Warning: `No license field in package.json`

Open `package.json`, add `"license": "MIT"` or `"license": "UNLICENSED"`
depending on preferences.

#### Keeping Anchor Keys in Sync

The `anchor keys sync` command is used to synchronize the keypairs between the
local environment and the `Anchor.toml` configuration file. This is particularly
useful when the local keypair files are not in sync with the deployed program's
public keys.

#### When to Use anchor keys sync

- **After creating a new keypair**: If you generate a new keypair for your
  program, run `anchor keys sync` to update the `Anchor.toml` file with the new
  keypair.
- **If you've modified keypairs manually**: If you change any keypair files
  directly, use this command to ensure that `Anchor.toml` reflects those
  changes.
- **Before deploying a program**: Running this command ensures that the correct
  keypair is used during the deployment.
- **After Cloning a Repository**: If you clone a project that has already been
  deployed, run `anchor keys sync` to fetch and sync the keypair files based on
  the program IDs in `Anchor.toml`.

#### Potential Issues if Keys Are Not in Sync

If the keypairs are not synchronized, you may encounter errors when deploying or
interacting with the onchain program. For example, Anchor may reference an
incorrect or non-existent keypair, leading to errors such as:

- **Failed transactions**: If the wrong keypair is used, transactions might fail
  due to invalid signatures or permissions.
- **Deployment issues**: The program might not deploy successfully if the
  keypair in `Anchor.toml` does not match the keypair on your machine.
- **Invalid Program Error:** If the keys are not in sync, you might encounter
  errors like `Error: Program does not exist` or `Error: Invalid program ID`
  when interacting with the program via anchor test or other commands.

To avoid these issues, always run `anchor keys sync` after any changes to
keypairs.

#### All done?

Ensure `anchor test` completes successfully - with no warnings and no errors -
before continuing.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=aa0b56d6-02a9-4b36-95c0-a817e2c5b19d)!
</Callout>
