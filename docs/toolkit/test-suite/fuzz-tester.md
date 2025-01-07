---
title: Solana Fuzz Tester
sidebarSortOrder: 2
sidebarLabel: Fuzz Tester
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

> The Fuzz tester is still a WIP. It currently is only anchor compatible and
> needs some manual work to complete tests

## Initialize Fuzz Tests

Navigate to an Anchor based workspace and run:

```shell
trident init
```

This command does the following:

- Builds the Anchor-based project.
- Reads the generated IDL.
- Based on the IDL creates the fuzzing template.

## Define Fuzz Accounts

Define `AccountsStorage` type for each `Account` you would like to use

```rust
#[doc = r" Use AccountsStorage<T> where T can be one of:"]
#[doc = r" Keypair, PdaStore, TokenStore, MintStore, ProgramStore"]
#[derive(Default)]
pub struct FuzzAccounts {
    author: AccountsStorage<Keypair>,
    hello_world_account: AccountsStorage<PdaStore>,
    // No need to fuzz system_program
    // system_program: AccountsStorage<todo!()>,
}
```

## Implement Fuzz Instructions

Each Instruction in the Fuzz Test has to have defined the following functions:

- `get_program_id()` specifies to which program the Instruction belongs. This
  function is automatically defined and should not need any updates. The
  importance is such that if you have multiple programs in your workspace,
  Trident can generate Instruction Sequences of Instruction corresponding to
  different programs.
- `get_data()` specifies what Instruction inputs are send to the Program
  Instructions.
- `get_accounts()` specifies what Accounts are send to the Program Instructions.

## Execute Fuzz Tests

```shell
# Replace <TARGET_NAME> with the name of the
# fuzz test (for example: "fuzz_0")
trident fuzz run-hfuzz <TARGET_NAME>
```

## Debug Fuzz Tests

```shell
# fuzzer will run the <TARGET_NAME> with the specified <CRASH_FILE_PATH>
trident fuzz debug-hfuzz <TARGET_NAME> <CRASH_FILE_PATH>
```

For additional documentation go [here](https://ackee.xyz/trident/docs/latest/).

## Additional Resources

- [Fuzz Tester Source Code](https://github.com/Ackee-Blockchain/trident).
