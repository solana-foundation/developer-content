---
title: How to Start a Local Validator
sidebarSortOrder: 1
description: "Learn how to start a local solana validator."
---

Testing your program code locally can be a lot more reliable than testing on
devnet, and can help you test before trying it out on devnet.

You can setup your local-test-validator by installing the
[Solana CLI tool suite](/docs/intro/installation.md) and running the following
command:

```shell
solana-test-validator
```

Benefits of using local-test-validator include:

- No RPC rate-limits
- No airdrop limits
- Direct onchain program deployment (`--bpf-program ...`)
- Clone accounts from a public cluster, including programs (`--clone ...`)
- Configurable transaction history retention (`--limit-ledger-size ...`)
- Configurable epoch length (`--slots-per-epoch ...`)
- Jump to an arbitrary slot (`--warp-slot ...`)
