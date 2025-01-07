---
title: Test Suite Overview
sidebarSortOrder: 4
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

Within the Solana toolkit, there are several resources for testing Solana Smart
Contracts, including:

- A fuzz tester
- A code coverage tool
- A framework for testing Solana programs in NodeJS that spins up a lightweight
  `BanksServer` that's like an RPC node but much faster and creates a
  `BanksClient` to talk to the server.
- A fast and lightweight library for testing Solana programs in Rust, which
  works by creating an in-process Solana VM optimized for program developers.
- A tool to scan your repo for common security vulnerabilities and provide
  suggestions for fixes.