---
title: Solana Smart Contract Best Practices
---

## Smart Contract File Structure 

Typically Solana smart contract (aka [programs](/docs/core/programs.md))
workspaces will be have the following file structure:

```shell
.
├── app
├── migrations
├── node_modules
├── programs
├── target
└── tests
```

The main smart contract is the `lib.rs` file, which lives insides the `programs`
directory, as shown below:

```shell
.
├── app
├── migrations
├── node_modules
├── programs
    ├── src
        ├── lib.rs
├── target
└── tests
```

As the smart contract gets more cumbersome, you'll typically want to separate
the logic into multiple files, as shown below:

```shell
├── programs
    ├── src
        ├── state.rs
        ├── instructions
            ├── instruction_1.rs
            ├── instruction_2.rs
            ├── instruction_3.rs
        ├── lib.rs
        ├── constants.rs
        ├── error.rs
        ├── mod.rs
```

For native rust smart contract development, you need to explicitly write out the
entrypoint and processor for the program, so you'll need a few more files:

```shell
├── program.rs
│   ├── src.rs
│   │   ├──assertions.rs
│   │   ├──entrypoint.rs
│   │   ├──error.rs
│   │   ├──instruction.rs
│   │   ├──lib.rs
│   │   ├──processor.rs
│   │   ├──state.rs
│   │   ├──utils.rs
│   ├── Cargo.toml
│   ├── keypair.json
│   ├── README.md
```

## Optimize Compute Usage 

To prevent abuse of computational resources, each transaction is allocated a "compute budget". This budget specifies details about [compute units](https://solana.com/docs/core/fees#compute-units) and includes:

- the compute costs associated with different types of operations the transaction may perform (compute units consumed per operation),
- the maximum number of compute units that a transaction can consume (compute unit limit),
- and the operational bounds the transaction must adhere to (like account data size limits)

When the transaction consumes its entire compute budget (compute budget exhaustion), or exceeds a bound such as attempting to exceed the [max call stack depth](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L138) or [max loaded account](https://solana.com/docs/core/fees#accounts-data-size-limit) data size limit, the runtime halts the transaction processing and returns an error. Resulting in a failed transaction and no state changes (aside from the transaction fee being [collected](https://solana.com/docs/core/fees#fee-collection)).

### Solana Developer Guides 
- [How to Optimize Compute](https://solana.com/developers/guides/advanced/how-to-optimize-compute). 
- [How to Request Optimal Compute](https://solana.com/developers/guides/advanced/how-to-request-optimal-compute)

## Saving Bumps

Saving the bump to your Solana smart contract account state enables deterministic address generation, efficiency in address reconstruction, reduced transaction failure, and consistency across invocations. 
 
### Solana Developer Guides
- [Bump Seed Canonicalization Lesson](https://solana.com/developers/courses/program-security/bump-seed-canonicalization#challenge)