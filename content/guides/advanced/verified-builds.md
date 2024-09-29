---
date: 2024-09-26T00:00:00Z
difficulty: intermediate
title: "How to verify a program"
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

> A verified build should not be considered more secure than a not verified
> build. But it gives the user the ability to verify that the program was built
> from the provided source code and by that everyone can verify the program does
> what it is supposed to do and easily contact the developer and open an issue
> if something goes wrong.

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
During the build process a PDA of the
[verify program](https://github.com/otter-sec/otter-verify) will be created.
This PDA contains all the data necessary to verify the program. The PDA contains
the program address, git url, commit hash and the arguments used to build the
program.

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
  security researchers an easy way to contact you.

# How do I implement verified builds?

To implement verified builds, you'll need to follow these steps:

<Steps>

### Install the Docker and Cargo

Install the Necessary Tools Ensure you have Docker and Cargo installed. Docker
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

For extra caution, you can install a version directly from a specific commit:

```bash
cargo install solana-verify --git https://github.com/Ellipsis-Labs/solana-verifiable-build --rev 13a1db2
```

### Building Verifiable Programs

To verify against a repository it needs to have a `Cargo.lock` file in the root
directory of your repo. You can use this `Cargo.toml` example as a preset:

```toml
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

With this file in place you can then run `cargo generate-lockfile` to create a
lock file.

To verifiably build your Solana program, navigate to the directory containing
your workspace's `Cargo.toml` file and run:

```bash
solana-verify build
```

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
solana program deploy -u $NETWORK_URL target/deploy/$PROGRAM_LIB_NAME.so --program-id $PROGRAM_ID --upgrade-authority $UPGRADE_AUTHORITY
```

To verify the deployed program matches the built executable, run:

```bash
solana-verify get-program-hash -u $NETWORK_URL $PROGRAM_ID
```

> You may have different versions deployed on different
> [Solana clusters](/docs/core//clusters.md) (i.e. devnet, testnet, mainnet).
> Ensure you use the the correct network URL for the desired Solana cluster you
> want to verify a program against.

### Verifying against repositories

To verify a program against its public repository, use:

```bash
solana-verify verify-from-repo -u $NETWORK_URL --program-id $PROGRAM_ID https://github.com/$REPO_PATH --commit-hash $COMMIT_HASH --library-name $PROGRAM_LIB_NAME --mount-path $MOUNT_PATH
```

> While you run the verified build in your program directory when running
> `verify-from-repo` you need to add the `mount-path`. This will be the path to
> the folder containing the `Cargo.toml` that contains your programs lib name.

This command compares the onchain program with the executable built from the
source at the specified commit hash.

</Steps>

## Example verified build

Here’s an example of verifying the solana-games-preset with the ID
`MkabCfyUD6rBTaYHpgKBBpBo5qzWA2pK2hrGGKMurJt` using the source code from the
repository:

```bash
solana-verify verify-from-repo -url https://api.mainnet-beta.solana.com --program-id MkabCfyUD6rBTaYHpgKBBpBo5qzWA2pK2hrGGKMurJt https://github.com/solana-developers/solana-game-preset --commit-hash e8682fa6f49e1fb2fabde68696772d1502022649 --library-name lumberjack --mount-path program
```

You can also verify using Docker images for faster verification:

```bash
solana-verify verify-from-image -e examples/hello_world/target/deploy/hello_world.so -i ellipsislabs/hello_world_verifiable_build:latest -p 2ZrriTQSVekoj414Ynysd48jyn4AX6ZF4TTJRqHfbJfn
```

Finally you can also directly verify the program against the OtterSec API:

```bash
solana-verify verify-from-repo --remote -um --program-id PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY https://github.com/Ellipsis-Labs/phoenix-v1
```

Like this your verification will appear validated in the
[OtterSec API for single programs](https://verify.osec.io/status/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY)
and in the
[Solana Explorer](https://explorer.solana.com/address/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY/verified-build)
and eventually also on the community-run website
[SolanaVerify.org](https://www.solanaverify.org/) maintained by
[0xDeep](https://x.com/0xDeep) and the
[OtterSec verified programs API](https://verify.osec.io/verified-programs) and
at last in the
[Verified Programs Dune Dashboard](https://dune.com/jonashahn/verified-programs/dedf21e1-9b71-42c8-89f9-02ed94628657)
contributing to a more healthy solana ecosystem.

# Conclusion

Using [verified builds on Solana](/content/guides/advanced/verified-builds.md)
ensures the integrity and trustworthiness of your programs on the network. By
leveraging tools like the Solana Verify CLI and Docker, you can maintain
verifiable and secure builds that align with your source code. Always take the
necessary precautions to use consistent environments, and consider governance
solutions for safe upgrades and deployments.

# Security.txt for Solana programs

In addition to verified builds you can also add a `security.txt` file to your
program. In the future the `security.txt` will hold the verifier public key for
easy access to the verification data stored in the verification PDA.

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

Once the `security.txt` information is embedded in your program, it can be easily
queried via tools like the Solana Explorer, ensuring that your contact and
security details are available to anyone looking to report potential issues.

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
