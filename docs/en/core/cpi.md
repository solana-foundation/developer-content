---
title: Cross Program Invocation (CPI)
sidebarLabel: Cross Program Invocation
sidebarSortOrder: 6
description:
  Learn about Cross Program Invocation (CPI) on Solana - how programs can call
  instructions on other programs, handle PDA signers, and compose functionality
  across the Solana network.
---

A Cross Program Invocation (CPI) refers to when one program invokes the
instructions of another program. This mechanism allows for the composability of
Solana programs.

You can think of instructions as API endpoints that a program exposes to the
network and a CPI as one API internally invoking another API.

![Cross Program Invocation](/assets/docs/core/cpi/cpi.svg)

When a program initiates a Cross Program Invocation (CPI) to another program:

- The signer privileges from the initial transaction invoking the caller program
  (A) extend to the callee (B) program
- The callee (B) program can make further CPIs to other programs, up to a
  maximum depth of 4 (ex. B->C, C->D)
- The programs can "sign" on behalf of the [PDAs](/docs/core/pda.md) derived
  from its program ID

> The Solana program runtime defines a constant called
> [`max_invoke_stack_height`](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/program-runtime/src/compute_budget.rs#L31-L35),
> which is set to a
> [value of 5](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/program-runtime/src/compute_budget.rs#L138).
> This represents the maximum height of the program instruction invocation
> stack. The stack height begins at 1 for transaction instructions, increases by
> 1 each time a program invokes another instruction. This setting effectively
> limits invocation depth for CPIs to 4.

## Key Points

- CPIs enable Solana program instructions to directly invoke instructions on
  another program.

- Signer privileges from a caller program are extended to the callee program.

- When making a CPI, programs can "sign" on behalf of PDAs derived from their
  own program ID.

- The callee program can make additional CPIs to other programs, up to a maximum
  depth of 4.

## How to write a CPI

Writing an instruction for a CPI follows the same pattern as building an
[instruction](/docs/core/transactions.md#instruction) to add to a transaction.
Under the hood, each CPI instruction must specify the following information:

- **Program address**: Specifies the program being invoked
- **Accounts**: Lists every account the instruction reads from or writes to,
  including other programs
- **Instruction Data**: Specifies which instruction on the program to invoke,
  plus any additional data required by the instruction (function arguments)

Depending on the program you are making the call to, there may be crates
available with helper functions for building the instruction. Programs then
execute CPIs using either one of the following functions from the
`solana_program` crate:

- `invoke` - used when there are no PDA signers
- `invoke_signed` - used when the caller program needs to sign with a PDA
  derived from its program ID

### Basic CPI

The
[`invoke`](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/program.rs#L132)
function is used when making a CPI that does not require PDA signers. When
making CPIs, signers provided to the caller program automatically extend to the
callee program.

```rust
pub fn invoke(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>]
) -> Result<(), ProgramError>
```

Here is an example program on
[Solana Playground](https://beta.solpg.io/github.com/ZYJLiu/doc-examples/tree/main/cpi-invoke)
that makes a CPI using the `invoke` function to call the transfer instruction on
the System Program. You can also reference the
[Basic CPI guide](/content/guides/getstarted/how-to-cpi.md) for further details.

### CPI with PDA Signer

The
[`invoke_signed`](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/sdk/program/src/program.rs#L247)
function is used when making a CPI that requires PDA signers. The seeds used to
derive the signer PDAs are passed into the `invoke_signed` function as
`signer_seeds`.

You can reference the [Program Derived Address](/docs/core/pda.md) page for
details on how PDAs are derived.

```rust
pub fn invoke_signed(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>],
    signers_seeds: &[&[&[u8]]]
) -> Result<(), ProgramError>
```

The runtime uses the privileges granted to the caller program to determine what
privileges can be extended to the callee. Privileges in this context refer to
signers and writable accounts. For example, if the instruction the caller is
processing contains a signer or writable account, then the caller can invoke an
instruction that also contains that signer and/or writable account.

While PDAs have [no private keys](/docs/core/pda.md#what-is-a-pda), they can
still act as a signer in an instruction via a CPI. To verify that a PDA is
derived from the calling program, the seeds used to generate the PDA must be
included as `signers_seeds`.

When the CPI is processed, the Solana runtime
[internally calls `create_program_address`](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/syscalls/cpi.rs#L550)
using the `signers_seeds` and the `program_id` of the calling program. If a
valid PDA is found, the address is
[added as a valid signer](https://github.com/solana-labs/solana/blob/27eff8408b7223bb3c4ab70523f8a8dca3ca6645/programs/bpf_loader/src/syscalls/cpi.rs#L552).

Here is an example program on
[Solana Playground](https://beta.solpg.io/github.com/ZYJLiu/doc-examples/tree/main/cpi-invoke-signed)
that makes a CPI using the `invoke_signed` function to call the transfer
instruction on the System Program with a PDA signer. You can reference the
[CPI with PDA Signer guide](/content/guides/getstarted/how-to-cpi-with-signer.md)
for further details.
