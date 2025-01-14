---
title: The Solana Toolkit
sidebarSortOrder: 3
description:
  "This is an overview of the solana toolkit and mucho cli. It includes how to
  write tests for solana programs, how to create a new project on solana, and
  what the best practices are for writing solana programs"
keywords:
  - solana testing
  - solana fuzz tester
  - solana code coverage
  - solana programs
  - rust tests
  - javascript tests
  - solana program development
  - solana program best practices
  - local testing
  - solana toolkit
  - smart contract development
  - program development
  - program tools
  - solana tools
  - smart contract tools
  - solana foundry
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

The Solana Program development toolkit is published as the
[`mucho` npm package](https://www.npmjs.com/package/mucho). The `mucho` command
will be used to run most of the Solana program development tools - _mucho tools,
one cli_.

## Install

```shell
npx -y mucho@latest install
```

For more information, go to [Getting Started](/docs/toolkit/getting-started.md).

## Create a Project

```shell
pnpm create solana-program
```

For more information, go to the [Projects](/docs/toolkit/projects/overview.md).

[Source code](https://github.com/solana-program/create-solana-program).

## Testing on Solana

- [Fuzz tester](/docs/toolkit/test-suite/fuzz-tester.md)
- [Code coverage](/docs/toolkit/test-suite/code-coverage.md)
- [JavaScript Tests](/docs/toolkit/test-suite/js-test.md)
- [Rust Test](/docs/toolkit/test-suite/rust-tests.md)
- [Security Scanner](/docs/toolkit/test-suite/security-scanner.md)
- [Local Testing](/docs/toolkit/local-validator.md)
- [Program Best Practices](/docs/toolkit/best-practices.md)

## Contributing

You can contribute to this
[Toolkit book on GitHub](https://github.com/solana-foundation/developer-content/tree/main/docs/toolkit).
