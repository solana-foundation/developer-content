---
title: Programs
sidebarLabel: Programs on Solana
sidebarSortOrder: 4
description:
  Learn about Solana programs (smart contracts) and how to develop them using
  Rust or the Anchor framework. Understand program deployment, upgrades, and
  verification on the Solana network.
---

In the Solana ecosystem, "smart contracts" are called programs. Each
[program](/docs/core/accounts.md#program-account) is an on-chain account that
stores executable logic, organized into specific functions referred to as
[instructions](/docs/core/transactions.md#instruction).

## Key Points

- Programs are on-chain accounts that contain executable code. This code is
  organized into distinct functions known as instructions.

- Programs are stateless but can include instructions to create new accounts,
  which are used to store and manage program state.

- Programs can be updated by an upgrade authority. A program becomes immutable
  when the upgrade authority is set to null.

- Verifiable builds enable users to verify that onchain programs match the
  publicly available source code.

## Writing Solana Programs

Solana programs are predominantly written in the
[Rust](https://doc.rust-lang.org/book/) programming language, with two common
approaches for development:

- [Anchor](/docs/programs/anchor): A framework designed for Solana program
  development. It provides a faster and simpler way to write programs, using
  Rust macros to significantly reduce boilerplate code. For beginners, it is
  recommended to start with the Anchor framework.

- [Native Rust](/content/guides/getstarted/intro-to-native-rust.md): This
  approach involves writing Solana programs in Rust without leveraging any
  frameworks. It offers more flexibility but comes with increased complexity.

## Updating Solana Programs

On-chain programs can be
[directly modified](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L675)
by an account designated as the "upgrade authority", which is typically the
account that originally deployed the program.

If the
[upgrade authority](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/lib.rs#L865)
is revoked and set to `None`, the program becomes immutable and can no longer be
updated.

## Verifiable Programs

Ensuring the integrity and verifiability of on-chain code is essential. A
verifiable build ensures that the executable code deployed on-chain can be
independently verified to match its public source code by any third party. This
process enhances transparency and trust, making it possible to detect
discrepancies between the source code and the deployed program.

The Solana developer community has introduced tools to support verifiable
builds, enabling both developers and users to verify that onchain programs
accurately reflect their publicly shared source code.

- **Searching for Verified Programs**: To quickly check for verified programs,
  users can search for a program address on the [SolanaFM](https://solana.fm/)
  Explorer and navigate to the "Verification" tab. View an example of a verified
  program
  [here](https://solana.fm/address/PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY).

- **Verification Tools**: The
  [Solana Verifiable Build CLI](https://github.com/Ellipsis-Labs/solana-verifiable-build)
  by Ellipsis Labs enables users to independently verify onchain programs
  against published source code.

- **Support for Verifiable Builds in Anchor**: Anchor provides built-in support
  for verifiable builds. Details can be found in the
  [Anchor documentation](https://www.anchor-lang.com/docs/verifiable-builds).

## Berkeley Packet Filter (BPF)

Solana leverages the [LLVM compiler infrastructure](https://llvm.org/) to
compile programs into
[Executable and Linkable Format (ELF)](https://en.wikipedia.org/wiki/Executable_and_Linkable_Format)
files. These files include a modified version of
[Berkeley Packet Filter (eBPF)](https://en.wikipedia.org/wiki/EBPF) bytecode for
Solana programs, known as "Solana Bytecode Format" (sBPF).

The use of LLVM enables Solana to potentially support any programming language
that can compile to LLVM's BPF backend. This significantly enhances the
flexibility of Solana as a development platform.
