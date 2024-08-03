---
date: 2024-07-31T00:00:00Z
featured: true
difficulty: intro
title: "Setup local development and install the Solana CLI"
description:
  "Easily setup your local development environment for Solana development on
  Linux, Mac or Windows. Including installing Rust, the Solana CLI, and Anchor."
tags:
  - quickstart
  - linux
  - mac
  - windows
  - wsl
  - local
  - cli
keywords:
  - rust
  - cargo
  - toml
  - program
  - tutorial
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - windows
altRoutes:
  - /developers/guides/setup-local-development
---

This quick start guide will demonstrate how to quickly install and set up your
local development environment, getting you ready to start developing and
deploying Solana programs to the blockchain.

## What you will learn

- how to install the Solana CLI locally
- how to set up a localhost Solana cluster/validator
- how to create a Solana wallet for developing
- how to airdrop SOL tokens for your wallet

> If you are very new to development in general, or have only tried EVM-based
> blockchain development, your machine is likely not yet ready to help you code
> on Solana.

This guide will mainly cover three operating systems: Windows (using WSL), Linux
and MacOS. Between each of these operating systems, the broad steps to get setup
locally are largely the same:

1. install dependencies
2. install rust and cargo toolchain
3. install Solana cli
4. install Anchor
5. setup a local blockchain cluster
6. create a filesystem wallet
7. airdrop Solana tokens to your wallet

## 1. Installing Dependencies

Just because Rust compiles and builds your software into a binary that can run
for the computer architecture we specify, we need to install some OS-level
dependencies on our machine.

### Dependencies for Windows

You can get started with Solana on Windows with WSL, the Windows subsystem for
Linux. WSL allows you to run Linux software easily on Windows using a
lightweight VM that instantly starts when you need it.

#### Setup WSL for Solana development

First start with
[installing WSL](https://learn.microsoft.com/en-us/windows/wsl/install) on your
system. Type the following command in Windows PowerShell:

```shell
wsl --install
```

Be sure to restart your computer when installation is done, then continue this
guide. After installing WSL and restarting your computer, open a new Linux
terminal session using WSL:

```shell
wsl
```

> You will probably also need to enable the Windows Subsystem for Linux feature.
> You can do this typing `feature` in the windows search bar open the windows
> features and then enable the features: `Windows Subsystem for Linux` and
> `Windows PowerShell 2.0`.

For the remainder of this guide and your Solana development using WSL, you will
run all your commands, Solana builds, and program deployments inside this Linux
terminal (except where otherwise noted in this guide).

If you are using VS Code as your code editor of choice, we recommend you
[follow this tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial)
on the VS Code website to properly configure VS Code and WSL together. This will
give you the best developer experience. A big help in rust development is also
the
[Rust Analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer),
which you can install as a VS Code extension.

<Callout type="caution" title="Notice">

After the following section below about setting up WSL for Solana development,
Windows/WSL users should continue to follow the Linux steps in this guide.
Except where otherwise noted.

</Callout>

WSL can sometimes be a little slow due to its file system write speed
limitations. You can also try dual booting your computer, installing a Linux
operating system natively on the same machine, or using the full web browser
based Solana IDE called [Solana Playground](https://beta.solpg.io). There is
also a
[Hello World Playground Guide](/content/guides/getstarted/hello-world-in-your-browser.md)

> If you have no experience in using Linux/WSL it probably makes sense to make
> yourself familiar with it first. This
> [video](https://www.youtube.com/watch?v=-atblwgc63E) gives you an overview on
> linux systems under windows.

### Dependencies for Linux

Install the following dependencies on your Linux system:

```shell
sudo apt-get install -y \
    build-essential \
    pkg-config \
    libudev-dev llvm libclang-dev \
    protobuf-compiler libssl-dev
```

> In case you are getting a protobuff error you may need to update apt-get
> before:
>
> ```shell
> sudo apt-get update
> ```

### Dependencies for macOS

In macOS, build tools are given by
[Xcode command line](https://developer.apple.com/xcode/resources/) tools, which
you can download it directly from Apple. You will likely need to sign in with
your Apple ID to download.

You can check if the Xcode CLI is installed via this command:

```shell
xcode-select -p
```

If you don't see a path returned, you need to install the CLI tools.

#### There are three ways to install Xcode CLI tools:

1. Installing via your terminal using the following command:

```shell
xcode-select --install
```

2. Download the installer and install it with a graphical interface
   [Apple Developer Tools](https://developer.apple.com/download/all/)

   ![Xcode CLI from Apple](/assets/guides/setup-local-environment/setup-xcode.png)

3. Installing via homebrew: we have the following guide to
   [install Xcode Command Line Tools with Homebrew](https://mac.install.guide/commandlinetools/3)

<Callout type="success" title="Congrats">

You have now installed system dependencies and build essentials required for
Solana program development.

</Callout>

## 2. Install Rust

The Rust programming language is a multi-paradigm, general-purpose programming
language that emphasizes performance, type safety, and concurrency.

Using [rustup](https://rustup.rs/), the official Rust version installer and
manager, we will install `rustc` (the compiler for rust) and `cargo` (the
package manager for rust) all at once.

#### Install Rust for macOS, Linux, WSL or another Unix-like OS

Using the following command, we can install and configure the Rust tooling on
your local system. The following command will automatically download the correct
binaries needed for your specific operating system:

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

As part of this Rust installer, Rustup will also configure your terminal's
`PATH` to include the rust toolchain.

After the installation is complete, restart your terminal or run the following
command to manually refresh your new `PATH` settings to make the rust tooling
(like `cargo`) available:

```shell
source ~/.bashrc
```

## 3. Install the Solana CLI

For local development, including compiling your Solana programs, you will need
to [install the Solana CLI](https://docs.solanalabs.com/cli/install). This
command-line tool suite provides all the commands needed to perform common
tasks, like:

- creating and managing file-system Solana wallets/keypairs,
- connecting to Solana [clusters](/docs/core/clusters.md),
- building Solana programs,
- and deploying your programs to the blockchain

#### For Linux, macOS, WSL or other Unix-like systems:

1.  Install the Solana CLI tool suite using the official install command:

    ```shell
    sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
    ```

2.  You can replace `stable` with the release tag matching the software version
    of your desired release (i.e. `v2.0.3`), or use one of the three symbolic
    channel names: `stable`, `beta`, or `edge`.
3.  Depending on your specific operating system, the Solana CLI installer
    messaging may prompt you to update the `PATH` environment. It may look
    similar to this:

    ```shell
    Please update your PATH environment variable to include the Solana programs:
    export PATH="/home/userName/.local/share/solana/install/active_release/bin:$PATH"
    ```

    If you get the above message, simply copy and paste the command recommended
    by the Solana CLI installer to update your `PATH` environment variable.

    After running this command restart your terminal to make sure your Solana
    binaries are accessible in all the terminal sessions you open afterwards.

4.  To check if your installation was successful, check the Solana CLI version:

    ```shell
    solana --version
    ```

You can see more versions and releases according to the target
[solana/releases](https://github.com/solana-labs/solana/releases)

<Callout title="Updating the Solana CLI">

In the future, you can use the Solana CLI to update itself based on which latest
version is available: `agave-install update`

> Agave is the validator client from [Anza](https://www.anza.xyz/), formerly
> known as Solana Labs validator client.

</Callout>

## 4. Install Anchor for Solana

[Anchor](https://www.anchor-lang.com/) is a framework for the Solana runtime
providing several convenient developer tools for writing onchain programs. It
helps you write programs with less code since it has abstracted away a lot of
security checks and common boilerplate using
[Rust's macros](https://doc.rust-lang.org/book/ch19-06-macros.html).

To install and manage anchor versions, we will use `avm`, the anchor version
manager. Since `avm` is installed via `cargo` (the Rust package manager), the
installation steps will be the same for all the operating systems.

We can then use `avm` to install the desired version of the Anchor framework.

#### Install avm

```shell
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

#### Install Anchor using avm

To install the `latest` version of anchor using `avm`:

```shell
avm install latest
avm use latest
```

After the anchor installation is complete, you can verify anchor was installed
by checking the installed version:

```shell
anchor --version
```

> If you do not see an output or receive an error, you may need to restart your
> terminal. If you are still running into errors, for example `Box<> error`from
> the `times` package you can also install the latest version directly without
> locking in the dependencies:
>
> ```shell
> cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --force
> ```

## 5. Setup a localhost blockchain cluster

The Solana CLI comes with the
[test validator](https://docs.solanalabs.com/cli/examples/test-validator)
built-in. This command line tool will allow you to run a full blockchain cluster
on your machine:

```shell
solana-test-validator
```

> In WSL you may need to first navigate to a folder where you have default write
> access:
>
> ```shell
> cd ~
> mkdir validator
> cd validator
> solana-test-validator
> ```

<Callout type="success" title="Pro Tip">

Run the Solana test validator in a new/separate terminal window that will remain
open. This command line program must remain running for your localhost cluster
to remain online and ready to process transactions and requests (like deploying
programs).

</Callout>

Configure your Solana CLI to use your localhost validator for all your future
terminal commands:

```shell
solana config set --url localhost
```

At any time, you can view your current Solana CLI configuration settings:

```shell
solana config get
```

## 6. Create a file system wallet

To deploy a program with Solana CLI, you will need a Solana wallet with SOL
tokens to pay for the cost of transactions and data storage on the blockchain.

Let's create a simple file system wallet to use during local development:

```shell
solana-keygen new
```

By default, the `solana-keygen` command will create a new file system wallet
located at `~/.config/solana/id.json`. You can manually specify the output file
location using the `--outfile /path` option.

<Callout type="note">

If you already have a file system wallet saved at the default location, this
command will **NOT** override it unless you explicitly force override using the
`--force` flag.

</Callout>

### Set your new wallet as the default

With your new file system wallet created, you must tell the Solana CLI to use
this wallet to deploy and take ownership of your on-chain program:

```shell
solana config set -k ~/.config/solana/id.json
```

## 7. Airdrop SOL tokens to your wallet

Once your new wallet is set as the default, you can request a free airdrop of
SOL tokens to it:

```shell
solana airdrop 2
```

<Callout type="caution">

The `solana airdrop` command has a limit on how many SOL tokens can be requested
_per airdrop_ for each cluster (testnet or devnet). If your airdrop transaction
fails, lower your airdrop request quantity and try again. You can also get your
wallet address using `solana address` and request testing sol on the
[Solana Web Faucet](https://faucet.solana.com). If you ever need bigger amounts
you can find ways to do so in this
[airdrop guide](https://solana.com/de/developers/guides/getstarted/solana-token-airdrop-and-faucets)

</Callout>

You can check your current wallet's SOL balance any time:

```shell
solana balance
```

Congratulations! You are now ready to write your first Solana program. Go ahead
and check out the next steps below.

## Next steps

See the links below to learn more about writing Rust based Solana programs:

- [Hello World Solana Rust program](/content/guides/getstarted/local-rust-hello-world.md)
- [Overview of writing Solana programs](/docs/programs/index.md)
