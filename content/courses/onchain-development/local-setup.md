---
title: Local Program Development
objectives:
  - Set up a local environment for Solana program development, with Solana CLI
    tools, Rust and Anchor.
  - Ensure Anchor works out of the box with no errors or warnings; a successful
    installation of anchor in the system.
description:
  "Setup a local development environment for building onchain programs."
---

## Summary

- To develop onchain programs on your machine, you need **Solana CLI**, **Rust**
  and (optional, but recommended) **Anchor**.
- You can use `anchor init` to create a new blank Anchor project
- `anchor test` runs your tests, and also builds your code.

## Lesson

This lesson is a guide to installing the tools required for developing onchain
programs. Let's install Solana CLI tools, the Rust SDK, and Anchor, and create a
test program to ensure that our setup works.

## Lab

### Extra steps for Windows users

> macOS and Linux users can skip this section. Linux and macOS are the
> recommended operating systems for Solana program development. However, if
> you're on Windows, you can still follow along with these extra steps.

Firstly, make sure you have Windows Terminal installed, otherwise you can
install it from the
[Microsoft store](https://apps.microsoft.com/detail/9N0DX20HK701).

Then,
[install Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install).
WSL provides a Linux environment that launches instantly whenever you need it
and doesn't slow your computer down.

Start Windows Terminal, launch an 'Ubuntu' session inside the terminal, and
proceed with the rest of these steps.

### Download Rust

First, download Rust by
[following the instructions](https://www.rust-lang.org/tools/install):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Download the Solana CLI tools

Next,
[download the Solana CLI tools](https://docs.solana.com/cli/install-solana-cli-tools).

Solana installation no longer supports symbolic channel names (`edge`, `beta`,
`stable`), hence we'll have to specify the version.

> the command below will install version `1.18.22` of the Solana CLI.

```bash
sh -c "$(curl -sSfL https://release.anza.xyz/v1.18.22/install)"
```

Afterwards, `solana -V` should show `solana-cli 1.18.x` (any number for `x` is
fine) which is the version of the Solana CLI installed in your system indicating
that it was installed successfully.

### Download Anchor

Finally, [download Anchor](https://www.anchor-lang.com/docs/installation):

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

you may need to install additional dependencies in Linux (or WSL):

```bash
sudo apt-get update && \
sudo apt-get upgrade && \
sudo apt-get install -y pkg-config build-essential libudev-dev libssl-dev
```

proceed...

```bash
avm install latest
avm use latest
```

Afterwards, `anchor -V` should show `anchor-cli 0.30.x` (any number for `x` is
fine) which is the version of the Solana CLI installed in your system indicating
that it was installed successfully.

### Create an Anchor project

Create a temporary project, with the default contents, using Anchor and make
sure it compiles and runs our tests:

```bash
anchor init temp-project
cd temp-project
anchor test
```

**The `anchor test` command should complete with no errors or warnings**.

**However you may encounter issues, and we'll fix them below:**

#### `package `solana-program

v1.18.12` cannot be built because it requires rustc 1.75.0 or newer` error

This error is due to incompatible versions of `solana-program` and `solana-cli`.
Run `cargo add solana-program@"=1.18.x"`, where `x` matches your version of
`solana-cli`. Then re-run `anchor test`.

#### `Error: Unable to read keypair file`

Add a keypair to `.config/solana/id.json`. You can either copy a keypair from an
`.env` file (just the array of numbers) into a file or use the command
`solana-keygen new --no-bip39-passphrase` to create a new keypair file. Then
re-run `anchor test`.

#### error: no such command: `build-sbf`

Add this to your `~/.zshrc` or `~/.bashrc` file to make the change permanent.

```bash
export PATH=~"/.local/share/solana/install/active_release/bin:$PATH"
```

#### Unable to get latest blockhash. Test validator does not look started.

- Install Homebrew and use it to install GNU tar:

  ```bash
  brew install gnu-tar
  ```

- Add this to your ~/.zshrc or ~/.bashrc file to make the change permanent.

  ```bash
  export PATH=/opt/homebrew/opt/gnu-tar/libexec/gnubin:$PATH
  ```

### All done?

Ensure `anchor test` completes successfully - with no warnings and no errors -
before continuing.

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=aa0b56d6-02a9-4b36-95c0-a817e2c5b19d)!
</Callout>
