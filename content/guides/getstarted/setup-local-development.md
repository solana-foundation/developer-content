---
featured: true
date: Feb 26, 2024
difficulty: intro
title: "Install the Solana CLI for local development"
description:
  "Quickstart guide on how to install the Solana CLI and setup your local Solana
  development environment on Linux, Mac or Windows."
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

If you are very new to development in general or have just tried EVM-based
blockchains or just have fiddled with Node.js and React, your machine is not yet
ready to help you code on Solana.

Are YOU ready though? Let’s start.

Choose which operating system you’ll be using to build on Solana. Mainly We will
cover three operating systems, Windows (with WSL), Linux and MacOS.

1. Install Dependencies
2. Install rust and cargo toolchain
3. Install Solana cli
4. Install Anchor
5. Setup a local blockchain cluster
6. Create a filesystem wallet
7. Airdrop Solana tokens to your wallet

## 1. Installing Dependencies

Just because Rust compiles and builds your software into a binary that can run
for the computer architecture we specify, we need to install some OS-level
dependencies on our machine.

### Let’s start with Windows 10/11

You can get started with Solana on Windows with WSL.

WSL is Windows subsystem for Linux, which allows you to run Linux software
easily on Windows using a lightweight VM that instantly starts when you need it

WSL and Linux will mostly have the same steps to go through.

### Build Dependencies for WSL

1.  Install WSL in your system, make sure to restart your computer when
    installation is done.

    [Install WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

2.  Follow this tutorial to open VSCode in WSL

    [VSCode WSL Tutorial](https://code.visualstudio.com/docs/remote/wsl-tutorial)

3.  Install dependencies required, make sure you open VSCode as an administrator
    before switching to WSL. Then open a terminal inside VSCode and type this
    command to install build-essential dependencies. Rust and Anchor might need
    these.
    `bash     sudo apt-get install \         build-essential \         pkg-config \         libudev-dev llvm libclang-dev \         protobuf-compiler libssl-dev     `
    > WSL can be a little slow to work with Solana. Try it out, if you feel the
    > same, dual-boot Linux, Or use https://beta.solpg.io

---

### Build Dependencies for Linux

Installing dependencies in Linux is the same as Windows with WSL.

```bash
sudo apt-get install -y \
    build-essential \
    pkg-config \
    libudev-dev llvm libclang-dev \
    protobuf-compiler libssl-dev
```

---

### Build Dependencies for macOS

In macOS, build tools are given by Xcode command line tools. You can download it
from this link. Sign in with your Apple Id and download.

You can check if your Xcode CLI is installed via this command.

```bash
xcode-select -p
```

If you don’t see a path returned, you need to install the CLI tools.

There are three ways to install Xcode CLI tools

1.  Install tools via terminal OR follow step 2

    ```bash
    xcode-select --install
    ```

2.  Download the installer and install it with a graphical interface

    [Apple Devloper Tools](https://developer.apple.com/download/all/)

    ![setup—-xcode](/assets/guides/setup-local-environment/setup—-xcode.png)

3.  You might also like to install homebrew to install packages like Linux
    people do use apt-get. Optional way to install homebrew and Xcode build
    utilities is to follow the below blog.
    [Xcode Command Line Tools with Homebrew · Mac Install Guide](https://mac.install.guide/commandlinetools/3)

---

Congrats, we have installed system dependencies and build-essentials required to
build software.

---

## 2. Install rust

Rust is a multi-paradigm, general-purpose programming language that emphasizes
performance, type safety, and concurrency.

rustc (compiler for rust), cargo (package manager for rust) and rustup (rust
version installer & manager for stable and beta versions) all three will setup
at once.

### Install Rust for macOS, Linux, WSL or another Unix-like OS.

one single spell will set you up. It downloads the script to set up in your
computer and runs the script to install binaries.

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Now either refresh your terminal or just close and open a new one.

```bash
source ~/.bashrc
```

---

## 3. Install Solana CLI

To interact with a Solana cluster (a bunch of big state synced servers), we will
use its command-line interface, also known as the CLI. We use the command-line
because it is the first place the Solana core team deploys new functionality.
The command-line interface is not necessarily the easiest to use, but it
provides the most direct, flexible, and secure access to your Solana accounts
(storage units on Solana).

### for Linux, macOS, WSL or Unix-like systems

1.  Install Solana

    ```bash
    sh -c "$(curl -sSfL https://release.solana.com/v1.18.1/install)"
    ```

2.  You can replace `v1.18.1` with the release tag matching the software version
    of your desired release, or use one of the three symbolic channel
    names: `stable`, `beta`, or `edge`.
3.  Depending on your system, the end of the installer messaging may prompt you
    to update the PATH environment.

    ```bash
    Please update your PATH environment variable to include the Solana programs:
    ```

    If you get the above message, copy and paste the recommended command below
    it in the terminal output to update the `PATH` environment variable.

    Restart your terminal after that, to make sure your Solana binaries are
    reflect in all the terminals you open afterwards.

4.  To check if your installation is done, check the version.

    ```bash
    solana --version
    ```

5.  You can check more versions and releases according to the target
    [solana/releases](https://github.com/solana-labs/solana/releases)
    `bash     solana-install update     `

---

## 4. Install Anchor for Solana

Anchor is a framework for Solana's Sealevel runtime providing several convenient
developer tools for writing smart contracts. It helps you write programs with
less code rather than plain rust, as it has abstracted away a lot of security
checks and lets you concisely write code.

As anchor is Installed via Cargo CLI, for all the operating systems, this step
will be the same.

Install anchor

```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

Install the latest version of the anchor

```bash
avm install latest
avm use latest
```

Now close and reopen the new terminal Verify if the installation worked for you
and anchor is installed correctly.

```bash
anchor --version
```

---

## 5. Setup a localhost blockchain cluster

The Solana CLI comes with the
[test validator](https://docs.solana.com/developing/test-validator) built-in.
This command line tool will allow you to run a full blockchain cluster on your
machine.

```bash
solana-test-validator
```

> **PRO TIP:** Run the Solana test validator in a new/separate terminal window
> that will remain open. The command line program must remain running for your
> Localhost cluster to remain online and ready for action.

Configure your Solana CLI to use your localhost validator for all your future
terminal commands:

```bash
solana config set --url localhost
```

At any time, you can view your current Solana CLI configuration settings:

```bash
solana config get
```

## 6. Create a file system wallet

To deploy a program with Solana CLI, you will need a Solana wallet with SOL
tokens to pay for the cost of transactions.

Let's create a simple file system wallet for testing:

```bash
solana-keygen new
```

By default, the `solana-keygen` command will create a new file system wallet
located at `~/.config/solana/id.json`. You can manually specify the output file
location using the `--outfile /path` option.

> **NOTE:** If you already have a file system wallet saved at the default
> location, this command will **NOT** override it (unless you explicitly force
> override using the `--force` flag).

### Set your new wallet as the default

With your new file system wallet created, you must tell the Solana CLI to use
this wallet to deploy and take ownership of your on-chain program:

```bash
solana config set -k ~/.config/solana/id.json
```

## 7. Airdrop SOL tokens to your wallet

Once your new wallet is set as the default, you can request a free airdrop of
SOL tokens to it:

```bash
solana airdrop 2
```

> **NOTE:** `The Solana airdrop` command has a limit on how many SOL tokens can
> be requested _per airdrop_ for each cluster (localhost, testnet, or devnet).
> If your airdrop transaction fails, lower your airdrop request quantity and try
> again.

You can check your current wallet's SOL balance any time:

```bash
solana balance
```

## Next steps

See the links below to learn more about writing Rust based Solana programs:

- [Create and deploy a Solana Rust program](./local-rust-hello-world.md)
- [Overview of writing Solana programs](https://docs.solana.com/developing/on-chain-programs/overview)
