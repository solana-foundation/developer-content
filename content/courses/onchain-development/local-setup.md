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

Open Windows Terminal, start an 'Ubuntu' session and proceed with the rest of
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

When running `solana-test-validator`, you should see output indicating that the
validator is working correctly. Below is an example of what the output should
look like:

```bash
$ solana-test-validator
--faucet-sol argument ignored, ledger already exists
Ledger location: test-ledger
Log: test-ledger/validator.log
⠴ Initializing...
Waiting for fees to stabilize 1...
Identity: J8yKZJa5NtcmCQqmBRC6Fe8X6AECo8Vc3d7L3dF9JPiM
Genesis Hash: FTPnCMDzTEthZxE6DvHbsWWv83F2hFe1GFvpVFBMUoys
Version: 1.18.22
Shred Version: 49491
Gossip Address: 127.0.0.1:1024
TPU Address: 127.0.0.1:1027
JSON RPC URL: http://127.0.0.1:8899
WebSocket PubSub URL: ws://127.0.0.1:8900
⠄ 00:00:25 | Processed Slot: 114 | Confirmed Slot: 114 | Finalized Slot: 82 | Full Snapshot Slot: - | Incremental Snapshot Slot: - | Transactions: 111 | ◎499.999445000
```

If you see this output, it means the Solana test validator is running correctly.
You should cancel the process by pressing CTRL + C, as you'll need to run the
anchor test command next.

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

#### Error: `Your configured rpc port: 8899 is already in use`

If you are running `solana-test-validator`, you may encounter the error
`Error: Your configured rpc port: 8899 is already in use` when running
`anchor test`. To resolve this, stop the `solana-test-validator` before running
`anchor test`.

#### All done?

Ensure `anchor test` completes successfully - with no warnings and no errors -
before continuing.

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=aa0b56d6-02a9-4b36-95c0-a817e2c5b19d)!
</Callout>
