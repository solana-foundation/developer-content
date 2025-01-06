---
title: The Solana Toolkit
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

The Solana Toolkit consists of all open sourced tools for smart contract
development on the Solana Blockchain.

You can contribute to this book on
[GitHub](https://github.com/solana-foundation/developer-content/tree/main/docs/toolkit).

This toolkit includes tool CLIs:

- [The Solana CLI](https://www.npmjs.com/package/solana) is meant to be a
  generic utilitarian helper CLI to accomplish some basic setup and
  troubleshooting for Solana development.

- [The Mucho CLI](https://www.npmjs.com/package/mucho) is encapsulates all
  additional tools for Solana Program development. - _Mucho Tools, One CLI_.

## Sections

### [Getting Started](getting-started.md)

To get started with The Solana Toolkit, install the toolkit, configure your
Solana CLI, fund your local keypair.

### [Creating a Project](projects.md)

Set up your project with one of the open source scaffolds and templates
available. Each scaffold/template has a different purpose, so be sure to review
all the options explained in this section to pick the most optimal one for your
project.

### [Smart Contract Best Practices](best-practices.md)

Make sure you're developing Solana smart contracts with best practices like
optimizing compute units, saving bumps, the payer-authority pattern, etc.

### [Test Suite](test-suite.md)

Use the Solana Test Suite with the `mucho` CLI to have access to tools like a
fuzz tester, code coverage tool, security vulnerability scanner, etc.

### [Running a Local Network](local-testing.md)

Run a local network to be able to build and test with a private and controlled
environment for Solana programs without the need to connect to a public testnet
or mainnet.
