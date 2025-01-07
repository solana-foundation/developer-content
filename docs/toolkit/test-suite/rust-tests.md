---
title: Rust Testing Framework
sidebarSortOrder: 4
sidebarLabel: Rust Tests
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

## Add Dependency

Navigate to your smart contract directory and run:

```shell
cargo add --dev litesvm
```

## Overview

[LiteSVM](https://github.com/LiteSVM/litesvm) is a fast and lightweight library
for testing Solana programs. It works by creating an in-process Solana VM
optimized for program developers. This makes it much faster to run and compile
than alternatives like solana-program-test and solana-test-validator. In a
further break from tradition, it has an ergonomic API with sane defaults and
extensive configurability for those who want it.

## Minimal Example

```rust
use litesvm::LiteSVM;
use solana_program::{message::Message, pubkey::Pubkey, system_instruction::transfer};
use solana_sdk::{signature::Keypair, signer::Signer, transaction::Transaction};

let from_keypair = Keypair::new();
let from = from_keypair.pubkey();
let to = Pubkey::new_unique();

let mut svm = LiteSVM::new();
svm.airdrop(&from, 10_000).unwrap();

let instruction = transfer(&from, &to, 64);
let tx = Transaction::new(
    &[&from_keypair],
    Message::new(&[instruction], Some(&from)),
    svm.latest_blockhash(),
);
let tx_res = svm.send_transaction(tx).unwrap();

let from_account = svm.get_account(&from);
let to_account = svm.get_account(&to);
assert_eq!(from_account.unwrap().lamports, 4936);
assert_eq!(to_account.unwrap().lamports, 64);

```

## Additional Resources

- [Source Code](https://github.com/LiteSVM/litesvm)