---
title: Solana Code Coverage Tool
sidebarSortOrder: 3
sidebarLabel: Code Coverage
seoTitle: "How to run code coverage for Solana programs"
description: "How to check the code coverage for Solana programs when testing"
keywords:
  - solana testing
  - solana code coverage
  - code coverage tool
  - testing with code coverage
  - how to check code coverage
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

```shell
mucho coverage
```

## Overview

This command will run a code coverage test on all of your Rust tests and then
generates a report as an HTML page providing metrics on where additional tests
may be needed to improve your current code coverage.

> Currently, this tool only works on tests written in Rust and is not compatible
> with a JavaScript test suite.

## Additional Resources

- [Source Code](https://github.com/LimeChain/zest?tab=readme-ov-file)