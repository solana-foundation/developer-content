---
title: Installation
sidebarSortOrder: 1
---

This section covers the steps to set up your local environment for Solana
development.

<Steps>

### Install Dependencies

<!-- prettier-ignore -->
<Tabs groupId="language" items={['MacOS', 'Linux', 'Windows']}>
<Tab value="MacOS">

On macOS, install the
[Xcode command line](https://developer.apple.com/xcode/resources/) tools, which
you can download it directly from Apple.

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

</Tab> 
<Tab value="Linux">

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

</Tab>
<Tab value="Windows">

To develop Solana programs on Windows you must use WSL (Windows subsystem for
Linux). Once WSL is installed, all additional dependencies must be installed
through the WSL terminal.

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

</Tab> 
</Tabs>

### Install Rust

Solana programs are written in the
[Rust programming language](https://www.rust-lang.org/).

The recommended installation method for Rust is
[rustup](https://www.rust-lang.org/tools/install).

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
```

Verify the installation by opening a new terminal and running the following
command:

```shell
rustc --version
```

### Install the Solana CLI

Next, install the Solana CLI. The Solana CLI provides all the tools required to
build and deploy Solana programs.

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

You can view the latest versions on the
[Agave Github repo](https://github.com/anza-xyz/agave/releases)

<Callout title="Updating the Solana CLI">

In the future, you can use the Solana CLI to update itself based on which latest
version is available: `agave-install update`

Agave is the validator client from [Anza](https://www.anza.xyz/), formerly known
as Solana Labs validator client.

</Callout>

### Install Anchor CLI

[Anchor](https://www.anchor-lang.com/) is a framework for developing Solana
programs. The Anchor framework leverages Rust macros to simplify the process of
writing Solana programs.

To install and manage anchor versions, use `avm`, the anchor version manager.
Since `avm` is installed via `cargo` (the Rust package manager), the
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
> terminal. If you are still running into errors, you can also install the
> latest version directly without locking in the dependencies:
>
> ```shell
> cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --force
> ```

### Create a file system wallet

To deploy a program with the Solana CLI, you will need a Solana wallet with SOL
tokens to pay for the cost of transactions and data storage on the blockchain.

To create a file system wallet to use during local development, run the
following command:

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

With your new file system wallet created, you must tell the Solana CLI to use
this wallet to deploy and take ownership of your on-chain program:

```shell
solana config set -k ~/.config/solana/id.json
```

You can view your current Solana CLI configuration settings with the following
command:

```shell
solana config get
```

### Airdrop SOL tokens to your wallet

Once you've set up your local wallet, request an airdrop of SOL to fund your
wallet. You need SOL to pay for transaction fees and to deploy programs.

Set your cluster to the devnet:

```shell
solana config set -ud
```

Then request an airdrop of devnet SOL:

```shell
solana airdrop 2
```

You can check your current wallet's SOL balance any time:

```shell
solana balance
```

<Callout>

The `solana airdrop` command has a limit on how many SOL tokens can be requested
_per airdrop_ for each cluster (testnet or devnet). If your airdrop transaction
fails, lower your airdrop request quantity and try again. You can also get your
wallet address using `solana address` and request testing sol on the
[Solana Web Faucet](https://faucet.solana.com). If you ever need bigger amounts
you can find ways to do so in this
[airdrop guide](https://solana.com/de/developers/guides/getstarted/solana-token-airdrop-and-faucets)

</Callout>

### Setup a localhost blockchain cluster

The Solana CLI comes with the
[test validator](https://docs.solanalabs.com/cli/examples/test-validator)
built-in. Running a local validator will allow you to deploy and test your
programs locally.

In a separate terminal, run the following command to start a local validator:

```shell
solana-test-validator
```

<Callout>

In WSL you may need to first navigate to a folder where you have default write
access:

```shell
cd ~
mkdir validator
cd validator
solana-test-validator
```

</Callout>

Then update the Solana CLI config to use the local validator:

```shell
solana config set -ul
```

To update the Solana CLI config to use a different cluster, you can use the
following commands:

```shell
solana config set -ud    # For devnet
solana config set -um    # For mainnet-beta
solana config set -ut    # For testnet
```

</Steps>
