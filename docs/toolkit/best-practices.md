---
title: Solana Smart Contract Best Practices
sidebarSortOrder: 3
sidebarLabel: Best Practices
---

> This is a beta version of the [Solana Toolkit](/docs/toolkit/index.md), and is
> still a WIP. Please post all feedback as a GitHub issue
> [here](https://github.com/solana-foundation/developer-content/issues/new?title=%5Btoolkit%5D%20).

## Optimize Compute Usage

To prevent abuse of computational resources, each transaction is allocated a
"compute budget". This budget specifies details about
[compute units](https://solana.com/docs/core/fees#compute-units) and includes:

- the compute costs associated with different types of operations the
  transaction may perform (compute units consumed per operation),
- the maximum number of compute units that a transaction can consume (compute
  unit limit),
- and the operational bounds the transaction must adhere to (like account data
  size limits)

When the transaction consumes its entire compute budget (compute budget
exhaustion), or exceeds a bound such as attempting to exceed the
[max call stack depth](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L138)
or
[max loaded account](https://solana.com/docs/core/fees#accounts-data-size-limit)
data size limit, the runtime halts the transaction processing and returns an
error. Resulting in a failed transaction and no state changes (aside from the
transaction fee being
[collected](https://solana.com/docs/core/fees#fee-collection)).

### Additional References

- [How to Optimize Compute](https://solana.com/developers/guides/advanced/how-to-optimize-compute).
- [How to Request Optimal Compute](https://solana.com/developers/guides/advanced/how-to-request-optimal-compute)

## Saving Bumps

> Program Derived Address (PDAs) are addresses that PDAs are addresses that are
> deterministically derived and look like standard public keys, but have no
> associated private keys. These PDAs are derived using a numerical value,
> called a "bump", to guarantee that the PDA is off-curve and cannot have an
> associated private key. It "bumps" the address off the cryptographic curve.

Saving the bump to your Solana smart contract account state ensures
deterministic address generation, efficiency in address reconstruction, reduced
transaction failure, and consistency across invocations.

### Additional References

- [How to derive a PDA](/docs/core/pda.md#how-to-derive-a-pda)
- [PDA Bumps Core Concepts](/docs/core/pda.md#canonical-bump)
- [Bump Seed Canonicalization Lesson](https://solana.com/developers/courses/program-security/bump-seed-canonicalization)

## Invariants

Implement invariants, which are functions that you can call at the end of your
instruction to assert specific properties because they help ensure the
correctness and reliability of programs.

```rust
require!(amount > 0, ErrorCode::InvalidAmount);
```

### Additional References

- [Complete Project Code Example](https://github.com/solana-developers/developer-bootcamp-2024/blob/main/project-9-token-lottery/programs/token-lottery/src/lib.rs#L291)

## Optimize Indexing

You can make indexing easier by placing static size fields at the beginning and
variable size fields at the end of your onchain structures.
