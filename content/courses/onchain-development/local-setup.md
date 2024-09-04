---
title: Local Program Development
objectives:
  - Set up a local environment for Solana program development, including Solana CLI tools, Rust, and Anchor.
  - Ensure Anchor works out of the box with no errors or warnings.
description:
  "Set up a local development environment for building onchain programs."
---

## Summary

- To develop onchain programs on your machine, you need **Solana CLI**, **Rust**, and (optional, but recommended) **Anchor**.
- You can use `anchor init` to create a new blank Anchor project.
- `anchor test` runs your tests and also builds your code.

## Lesson

There’s no formal lesson here! Let’s install Solana CLI tools, the Rust SDK, and Anchor, and create a test program to ensure that everything is set up correctly.

## Lab

### Extra Steps for Windows Users

1. First, install [Windows Terminal](https://apps.microsoft.com/detail/9N0DX20HK701) from the Microsoft Store.

2. Next, [install Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install). WSL provides a lightweight Linux environment that you can launch instantly whenever needed without slowing down your computer.

3. Start Windows Terminal, launch an 'Ubuntu' session inside the terminal, and proceed with the steps below.

### Download Rust

Begin by [downloading Rust](https://www.rust-lang.org/tools/install) with the following command:
```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
#### Download the Solana CLI tools

Next [download the Solana CLI tools](https://docs.solana.com/cli/install-solana-cli-tools) using this command:

```
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
```

After installation, running `solana -V` should show `solana-cli 1.18.x` (the x can be any number).

#### Download Anchor

Finally [download Anchor](https://www.anchor-lang.com/docs/installation):

```
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

After installation, running `anchor -V` should show `anchor-cli 0.30.1`.

#### Check your Anchor installation

Create a temporary project with the default contents using Anchor, and verify that it compiles and runs your tests:

```bash
anchor init temp-project
cd temp-project
anchor test
```

**The `anchor test` command should complete with no errors or warnings**.
However, if you encounter issues, here’s how to resolve some common problems:

##### Error: `package `solana-program v1.18.12` cannot be built because it requires rustc 1.75.0 or newer`

Run `cargo add solana-program@"=1.18.x"`, where `x` matches your version of `solana-cli`. Then re-run `anchor test`.

##### Error: `Unable to read keypair file`

Add a keypair to `.config/solana/id.json`. You can either copy a keypair from an `.env` file (just the array of numbers) into a file or use the command `solana-keygen new --no-bip39-passphrase` to create a new keypair file. Then re-run `anchor test`.

#### All done?

Ensure `anchor test` completes successfully, with no warnings or errors, before moving on.

<Callout type="success" title="Completed the lab?"> Push your code to GitHub and [let us know what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=aa0b56d6-02a9-4b36-95c0-a817e2c5b19d)!
</Callout>
