---
title: "Limitations"
sidebarSortOrder: 6
---

Developing programs on the Solana blockchain have some inherent limitation
associated with them. Below is a list of common limitation that you may run
into.

## Rust libraries

Since Rust based onchain programs must run be deterministic while running in a
resource-constrained, single-threaded environment, they have some limitations on
various libraries.

On-chain Rust programs support most of Rust's libstd, libcore, and liballoc, as
well as many 3rd party crates.

There are some limitations since these programs run in a resource-constrained,
single-threaded environment, as well as being deterministic:

- No access to
  - `rand`
  - `std::fs`
  - `std::net`
  - `std::future`
  - `std::process`
  - `std::sync`
  - `std::task`
  - `std::thread`
  - `std::time`
- Limited access to:
  - `std::hash`
  - `std::os`
- Bincode is extremely computationally expensive in both cycles and call depth
  and should be avoided
- String formatting should be avoided since it is also computationally
  expensive.
- No support for `println!`, `print!`, use the
  [`msg!`](https://github.com/solana-labs/solana/blob/d9b0fc0e3eec67dfe4a97d9298b15969b2804fab/sdk/program/src/log.rs#L33)
  macro instead.
- The runtime enforces a limit on the number of instructions a program can
  execute during the processing of one instruction. See
  [computation budget](/docs/core/fees.md#compute-budget) for more information.

## Compute budget

To prevent abuse of the blockchain's computational resources, each transaction
is allocated a [compute budget](/docs/terminology.md#compute-budget). Exceeding
this compute budget will result in the transaction failing.

See the [computational constraints](/docs/core/fees.md#compute-budget)
documentation for more specific details.

## Call stack depth - `CallDepthExceeded` error

Solana programs are constrained to run quickly, and to facilitate this, the
program's call stack is limited to a max depth of **64 frames**.

When a program exceeds the allowed call stack depth limit, it will receive the
`CallDepthExceeded` error.

## CPI call depth - `CallDepth` error

Cross-program invocations allow programs to invoke other programs directly, but
the depth is constrained currently to `4`.

When a program exceeds the allowed
[cross-program invocation call depth](/docs/core/cpi.md), it will receive a
`CallDepth` error

## Float Rust types support

Programs support a limited subset of Rust's float operations. If a program
attempts to use a float operation that is not supported, the runtime will report
an unresolved symbol error.

Float operations are performed via software libraries, specifically LLVM's float
built-ins. Due to the software emulated, they consume more compute units than
integer operations. In general, fixed point operations are recommended where
possible.

The
[Solana Program Library math](https://github.com/solana-labs/solana-program-library/tree/master/libraries/math)
tests will report the performance of some math operations. To run the test, sync
the repo and run:

```shell
cargo test-sbf -- --nocapture --test-threads=1
```

Recent results show the float operations take more instructions compared to
integers equivalents. Fixed point implementations may vary but will also be less
than the float equivalents:

```text
          u64   f32
Multiply    8   176
Divide      9   219
```

## Static writable data

Program shared objects do not support writable shared data. Programs are shared
between multiple parallel executions using the same shared read-only code and
data. This means that developers should not include any static writable or
global variables in programs. In the future a copy-on-write mechanism could be
added to support writable data.

## Signed division

The SBF instruction set does not support signed division.
