---
date: 2024-09-26T00:00:00Z
difficulty: intermediate
title: "How to Verify a Program"
description:
  "Verified builds is a way to link your program to its source code and let
  everyone independently verify that the program was indeed built from that
  provided source code."
tags:
  - web3js
keywords:
  - tutorial
  - verified builds
  - security.txt
  - verified source code
  - find a programs source code
  - security
  - blockchain tutorial
---

This guide is meant to be a reference for developers who want to implement
verified builds for their programs on Solana. We will cover what verified builds
are, how to use them, special considerations, and best practices to ensure the
authenticity of your program onchain.

# What are verified builds?

Verified builds ensure that the executable program you deploy to Solana’s
network matches the source code in your repository. By doing this, developers
and users can have confidence that the program running onchain corresponds
exactly to the public codebase, promoting transparency and security.

The verification process involves comparing the hash of the onchain program with
the hash of the locally built program from the source code. This ensures no
discrepancies between the two versions.

> While a verified build should not be considered more secure than an unverified
> build, the build enables developers to self verify the source code matches
> what is deployed onchain. Using the source code, a developer can then validate
> what the code executes when sending a transaction.

The verified builds pipeline was thought out and is maintained by
[Ellipsis Labs](https://ellipsislabs.xyz/) and [OtterSec](https://osec.io/). For
more details, follow the guide in the
[original verified builds](https://github.com/Ellipsis-Labs/solana-verifiable-build)
repository as well and the verify build process directly into the
[Anza](https://www.anza.xyz/) tool suite, once supported there.

# How does it work?

The verification process is done by comparing the hash of the onchain program
with the hash of the locally built program from the source code. You build your
program in a controlled environment using the Solana Verify CLI and Docker. This
ensures that the build process is deterministic and consistent across different
systems. Once you have the executable, you can deploy it to the Solana network.
During the build process a
[PDA](https://explorer.solana.com/address/63XDCHrwZu3mXsw2RUFb4tbNpChuUHx4eA5aJMnHkpQQ/anchor-account)
of the [verify program](https://github.com/otter-sec/otter-verify) will be
created. This PDA contains all the data necessary to verify the program. The PDA
contains the program address, git url, commit hash and the arguments used to
build the program.

Using the data in the PDA everyone can run the verify program command locally
and check if the program was built from the provided source code. Then everyone
can verify for themselves completely trustlessly or can run their own
[verify API](https://github.com/otter-sec/solana-verified-programs-api)
maintained by [OtterSec](https://github.com/otter-sec) to provide an easy access
point for users to check the verification. You can already see these
[API calls](https://verify.osec.io/status/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY)
being used in the
[Solana Explorer](https://explorer.solana.com/address/E1fcPKuV1UJEsTJPpab2Jr8y87ZN73i4CHTPLbWQE6CA/verified-build)
and
[SolanaFM](https://solana.fm/address/E1fcPKuV1UJEsTJPpab2Jr8y87ZN73i4CHTPLbWQE6CA/transactions?cluster=mainnet-alpha),
among other places.

# Why should I use verified builds?

Using verified builds provides the following benefits:

- Security: Guarantee that the program running onchain matches the source code,
  preventing malicious alterations.

- Transparency: Allows other users and developers to validate that the onchain
  program is trustworthy by comparing it with the public codebase.

- Trust: Increase user confidence, as verified builds demonstrate that your
  program's onchain behavior is aligned with your public code. When building
  verifiable programs, you minimize risks associated with running unauthorized
  or malicious code. It also ensures you comply with best practices and give
  security researchers an easy way to contact you. Also wallets and other tools
  can allow transactions from your program more easily as long as it is
  verified.

- Discoverability: When you provide a verified build of you program everyone can
  find your source code, docs, program SDK or IDL and they can also easily
  contact you via github in case there is an issue.

# How do I create verified builds?

To create verified builds, you'll need to follow these steps:

Summary:

- Commit your code to a public repository
- Build a verified build in docker
- Deploy the verified build
- Verify the deployed program against public API

If you verify your program which is not build in a docker container it will most
likely fail because Solana program builds are not deterministic across different
systems.

<Steps>

### Install Docker and Cargo

Install the necessary tools ensure you have Docker and Cargo installed. Docker
provides a controlled build environment to ensure consistency, and Cargo is used
for managing Rust packages.

- Docker: Follow the steps on the
  [Docker website](https://docs.docker.com/engine/install/) to install Docker
  for your platform. Once installed, ensure the Docker service is running
  following this guide further.
- Cargo: If you don’t already have Cargo installed, you can install it by
  running the following command:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Install the Solana Verify CLI

The Solana Verify CLI is the primary tool used to verify builds. Solana Verify
CLI is currently maintained by [Ellipsis Labs](https://ellipsislabs.xyz/) and
can be installed using Cargo.

> The verify process will soon move into the [Anza](https://www.anza.xyz/) tool
> suite. The general way of verifying builds will stay very similar though.

You can install it by running:

```bash
cargo install solana-verify
```

If you need a specific version of the CLI, you can pin the version with:

```bash
cargo install solana-verify --version $VERSION
```

If desired, you can install a version directly from a specific commit:

```bash
cargo install solana-verify --git https://github.com/Ellipsis-Labs/solana-verifiable-build --rev 13a1db2
```

### Prepare project

To verify against a repository it needs to have a `Cargo.lock` file in the root
directory of your repository. If you only have one program in your repository
and a `cargo.lock` file in your root you can directly go to the next step and
build your program.

If your program is in a subfolder and you have a rust workspace you need to
create a workspace `Cargo.toml` file in the root directory of your repository.

You can use this `Cargo.toml` example as a preset:

```toml filename="Cargo.toml"
[workspace]
members = ["program/programs/*"]
resolver = "2"

[profile.release]
overflow-checks = true
lto = "fat"
codegen-units = 1

[profile.release.build-override]
opt-level = 3
incremental = false
codegen-units = 1
```

Make sure that your program is in the `workspace/members` array and that the
`Cargo.toml` of your program has the correct `lib` name configured.

> Important is the `lib name` not the package name!

Something like this:

```toml filename="waffle/Cargo.toml"
[package]
name = "waffle"
version = "0.1.0"
edition = "2021"

[lib]
name = "waffle"
crate-type = ["cdylib", "lib"]

[dependencies]
solana-program = "2.1.0"
```

In this [repository](https://github.com/solana-developers/verified-program) you
can see an example of a workspace with a program in a subfolder. Notice also
that when the program is in a subfolder you later need to add this folder as
`--mount-path` to the `verify-from-repo` command.

In this [repository](https://github.com/solana-developers/solana-game-preset)
you can find an anchor example. In this
[repository](https://github.com/solana-developers/verified-program-root) you can
find a native rust example.

With this `Cargo.toml` file in place you can then run `cargo generate-lockfile`
to create a lock file and continue to building your program.

### Building Verifiable Programs

To verifiably build your Solana program, navigate to the directory containing
your workspace's `Cargo.toml` file and run:

```bash
solana-verify build
```

This will copy your environment into a docker container and build it in a
deterministic way.

> Make sure that you actually deploy the verified build and don't accidentally
> overwrite it with `anchor build` or `cargo build-sbf` since these will most
> likely not result into the same hash and though your verification will fail.

For projects with multiple programs, you can build a specific program by using
the library name (not the package name):

```bash
solana-verify build --library-name $PROGRAM_LIB_NAME
```

This process ensures deterministic builds and can take some time, especially on
certain systems (e.g., M1 MacBook) because it is running within a docker
container. For faster builds, using a Linux machine running x86 architecture is
recommended.

Once the build completes, you can retrieve the hash of the executable using the
following command:

```bash
solana-verify get-executable-hash target/deploy/$PROGRAM_LIB_NAME.so
```

### Deploying Verifiable Programs

Once you have built your program and retrieved its hash, you can deploy it to
the Solana network. It is recommended to use a multi-signature or governance
solution like [Squads Protocol](https://squads.so/protocol) for safe
deployments, but you can also directly deploy with:

```bash
solana program deploy -u $NETWORK_URL target/deploy/$PROGRAM_LIB_NAME.so --program-id $PROGRAM_ID --with-compute-unit-price 50000 --max-sign-attempts 100 --use-rpc
```

A currently fitting low priority fee you can request from your rpc provider for
example [Quicknode](https://www.quicknode.com/gas-tracker/solana).

To verify the deployed program matches the built executable, run:

```bash
solana-verify get-program-hash -u $NETWORK_URL $PROGRAM_ID
```

> You may have different versions deployed on different
> [Solana clusters](/docs/core//clusters.md) (i.e. devnet, testnet, mainnet).
> Ensure you use the correct network URL for the desired Solana cluster you want
> to verify a program against. Remote verification will only work on mainnet.

Now you can already get the hash of your program and compare it to your binary
hash from earlier if you want:

```bash
solana-verify get-program-hash $PROGRAM_ID
```

### Verifying against repositories

To verify a program against its public repository, use:

```bash
solana-verify verify-from-repo -u $NETWORK_URL --program-id $PROGRAM_ID https://github.com/$REPO_PATH --commit-hash $COMMIT_HASH --library-name $PROGRAM_LIB_NAME --mount-path $MOUNT_PATH
```

> While you run the verified build in your program directory, when running
> `verify-from-repo` you need to add the `--mount-path` flag. This will be the
> path to the folder containing the `Cargo.toml` that contains your program's
> library name.

This command compares the onchain program hash with the executable hash built
from the source at the specified commit hash.

At the end the command will ask you if you want to upload your verification data
onchain. If you do that the Solana Explorer will immediately show your program's
verification data. Until it was verified by a remote build it will show as
unverified. Learn how you can verify your program against a public API in the
next step.

If you want to lock the verification to a certain release, you can append the
`--commit-hash` flag to the command.

### Verify against public API

Finally you can also directly verify the program against anyone that is running
the verify API::

```bash
solana-verify verify-from-repo --remote -um --program-id PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY https://github.com/Ellipsis-Labs/phoenix-v1
```

> It is recommended to use a payed RPC Url because otherwise you may run into
> rate limits of the free RPCs. So instead of `-um` you should use
> `--url yourRpcUrl` for a more reliable verification.

The `--remote` flag sends a build request to the OtterSec API, which triggers a
remote build of your program. Once the build is complete, the system verifies
that the onchain hash of your program matches the hash of the generated build
artifact from your repository.

The default is the
[OtterSec API](https://github.com/otter-sec/solana-verified-programs-api).

Once the build is done, which takes a while, and was successful you will be able
to see your program as verified in the
[OtterSec API for single programs](https://verify.osec.io/status/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY)
and in the
[Solana Explorer](https://explorer.solana.com/address/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY/verified-build),
[SolanaFM](https://solana.fm/address/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY?cluster=mainnet-alpha),
[SolScan](https://solscan.io/account/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY#programVerification)
and eventually also on the community-run website
[SolanaVerify.org](https://www.solanaverify.org/) maintained by
[0xDeep](https://x.com/0xDeep) and the
[OtterSec verified programs API](https://verify.osec.io/verified-programs) and
at last in the
[Verified Programs Dune Dashboard](https://dune.com/jonashahn/verified-programs/dedf21e1-9b71-42c8-89f9-02ed94628657)
contributing to a more healthy Solana ecosystem.

</Steps>

## Verify from docker image

You can also verify your program against a docker image by running the following
command:

```bash
solana-verify verify-from-image -e
examples/hello_world/target/deploy/hello_world.so -i
ellipsislabs/hello_world_verifiable_build:latest -p
2ZrriTQSVekoj414Ynysd48jyn4AX6ZF4TTJRqHfbJfn
```

This command loads up the image stored at
`ellipsislabs/hello_world_verifiable_build:latest`, and verifies that the hash
of the executable path in the container is the same as the hash of the on-chain
program supplied to the command. Because the build was already uploaded to an
image, there is no need for a full rebuild of the executable which can take a
long time.

The Dockerfile that creates the image
`ellipsislabs/hello_world_verifiable_build:latest` can be found in the ellipsis
labs repository
[/examples/hello_world](https://github.com/Ellipsis-Labs/solana-verifiable-build/tree/master/examples/hello_world).

Below is the expected output:

```bash
Verifying image: "ellipsislabs/hello_world_verifiable_build:latest", on network
"https://api.mainnet-beta.solana.com" against program ID
2ZrriTQSVekoj414Ynysd48jyn4AX6ZF4TTJRqHfbJfn Executable path in container:
"examples/hello_world/target/deploy/hello_world.so"

Executable hash:
08d91368d349c2b56c712422f6d274a1e8f1946ff2ecd1dc3efc3ebace52a760 Program hash:
08d91368d349c2b56c712422f6d274a1e8f1946ff2ecd1dc3efc3ebace52a760 Executable
matches on-chain program data ✅
```

## Example verified build

Here’s an example of verifying an example program with the ID
`FWEYpBAf9WsemQiNbAewhyESfR38GBBHLrCaU3MpEKWv` using the source code from this
[repository](https://github.com/solana-developers/verified-program):

```bash
solana-verify verify-from-repo https://github.com/solana-developers/verified-program --url YOUR-RPC-URL --program-id FWEYpBAf9WsemQiNbAewhyESfR38GBBHLrCaU3MpEKWv --mount-path waffle --library-name waffle --commit-hash 5b82b86f02afbde330dff3e1847bed2d42069f4e
```

By default the `verify-from-repo` command takes the last commit on the main
branch. You can also define a certain commit in case you want to continue
working on the repository by using the `commit-hash` parameter:
`--commit-hash 5b82b86f02afbde330dff3e1847bed2d42069f4e`

Finally you can also directly verify the program against the OtterSec API:

```bash
solana-verify verify-from-repo https://github.com/solana-developers/verified-program --url YOUR-RPC-URL --remote --program-id FWEYpBAf9WsemQiNbAewhyESfR38GBBHLrCaU3MpEKWv --mount-path waffle --library-name waffle --commit-hash 5b82b86f02afbde330dff3e1847bed2d42069f4e
```

The `--remote` command sends a build request to the OtterSec API, which triggers
a remote build of your program. Once the build is complete, the system verifies
that the onchain hash of your program matches the hash of the generated build
artifact from your repository.

# Conclusion

Using [verified builds on Solana](/content/guides/advanced/verified-builds.md)
ensures the integrity and trustworthiness of your programs on the network and
allow developers to find your SDKs directly from a Solana Explorer. By
leveraging tools like the Solana Verify CLI and Docker, you can maintain
verifiable and secure builds that align with your source code. Always take the
necessary precautions to use consistent environments, and consider governance
solutions for safe upgrades and deployments.

## Security + Disclaimer

While verified builds are a powerful tool for ensuring the integrity of your
Solana programs it is not completely trustless in the default setup. The docker
images are built and hosted by the Solana Foundation.

Be aware that you are building your project in a downloaded docker image and
that your whole setup gets copied into that docker image for building including
potentially sensitive information.

If you want to have a completely trustless setup you can build the docker images
yourself and host them on your own infrastructure. This way you can be sure that
the docker images are not tampered with. You can find the scripts to create your
own docker images in the
[Verified builds repository](https://github.com/Ellipsis-Labs/solana-verifiable-build)
and you can fork it and run the github actions yourself or validate that they
are correct.

Furthermore for the remote verification you are trusting the OtterSec API and
the
[Solana Explorer](https://explorer.solana.com/address/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY)
to a certain degree.

The API or Solana Explorer may potentially display incorrect information if
compromised.

If you want to have a completely trustless setup you can run the
[Verify API](https://github.com/otter-sec/solana-verified-programs-api) yourself
or run the program verification locally yourself using the `verify-from-repo`
command using the on chain verify data that is saved in a
[PDA](https://explorer.solana.com/address/63XDCHrwZu3mXsw2RUFb4tbNpChuUHx4eA5aJMnHkpQQ/anchor-account)
that is derived from the programs deploy authority and the
[verify program](https://explorer.solana.com/address/verifycLy8mB96wd9wqq3WDXQwM4oU6r42Th37Db9fC).

The verify program is deployed by the [OtterSec team](https://osec.io/) and is
not yet frozen so it can be upgraded at any time.

The Solana Foundation, OtterSec and the Ellipsis Labs team are not responsible
for any losses or damages that may occur from using the verified builds
pipeline.

# Security.txt for Solana programs

In addition to verified builds you can also add a `security.txt` file to your
program. In the future, once implemented, the `security.txt` will hold the
verifier public key for easy access to the verification data stored in the
verification PDA. The PDA containing all the information needed to build and
verify a program is derived from the programs address and the verifier pubkey.
By default this is the same pubkey that built and deployed the program. But it
can also be another pubkey that can be specified in the `security.txt`.

The `security.txt` feature allows developers to embed contact and security
information directly within their Solana smart contracts. Inspired by
[securitytxt.org](https://securitytxt.org), this approach provides a
standardized way for security researchers to reach out to project maintainers,
even if they only know the contract's address.

## Why use security.txt?

For many projects, especially smaller or private ones, identifying the
developers from just the contract address can be difficult and time-consuming.
Embedding a `security.txt` file within the program ensures that security
researchers can easily contact the correct people, potentially preventing
exploits and ensuring timely bug reports.

## How to implement security.txt

To add a `security.txt` to your Solana program, include the following steps:

Add the `solana-security-txt` dependency to your `Cargo.toml`:

```toml filename="Cargo.toml"
[dependencies]
solana-security-txt = "1.1.1"
```

Use the `security_txt!` macro in your contract to define your security
information. You can include contact details, project URLs, and even a security
policy. Here's an example:

```rust
#[cfg(not(feature = "no-entrypoint"))]
use {default_env::default_env, solana_security_txt::security_txt};

#[cfg(not(feature = "no-entrypoint"))]
security_txt! {
    name: "MyProject",
    project_url: "https://myproject.com",
    contacts: "email:security@myproject.com,discord:security#1234",
    policy: "https://myproject.com/security-policy",

    // Optional Fields
    preferred_languages: "en,de",
    source_code: "https://github.com/solana-developers/solana-game-preset",
    source_revision: "5vJwnLeyjV8uNJSp1zn7VLW8GwiQbcsQbGaVSwRmkE4r",
    source_release: "",
    encryption: "",
    auditors: "Verifier pubkey: 5vJwnLeyjV8uNJSp1zn7VLW8GwiQbcsQbGaVSwRmkE4r",
    acknowledgements: "Thank you to our bug bounty hunters!"
}
```

Once the `security.txt` information is embedded in your program, it can be
easily queried via tools like the Solana Explorer, ensuring that your contact
and security details are available to anyone looking to report potential issues.

## Best practices

- Use Links: For information likely to change (e.g., contact details), it's
  recommended to link to a web page rather than hard-coding them into the
  contract. This avoids the need for frequent program upgrades.

- Verification: Before deploying, verify the format and content using the
  `query-security-txt` tool, which can validate both onchain programs and local
  binaries:

```bash
query-security-txt target/bpfel-unknown-unknown/release/my_contract.so
```

By embedding security contact information directly into your contract, you make
it easier for researchers to reach you, fostering better security and
communication within the Solana ecosystem.

This is
[an example of how security.txt looks in the Solana Explorer](https://explorer.solana.com/address/HPxKXnBN4vJ8RjpdqDCU7gvNQHeeyGnSviYTJ4fBrDt4/security?cluster=devnet)

The `security.txt` project is maintained by
[Neodyme Labs](https://github.com/neodyme-labs)
