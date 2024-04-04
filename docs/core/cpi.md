---
title: Cross Program Invocation (CPI)
sidebarLabel: Cross Program Invocation
sidebarSortOrder: 5
---

A Cross Program Invocation (CPI) refers to when one program invokes the
instructions of another program. This mechanism allows for the composability of
Solana programs.

You can think of instructions as API endpoints that a program exposes to the
network and a CPI as one API internally invoking another API.

![Cross Program Invocation](/assets/docs/core/cpi/cpi.svg)

When a program initiates a Cross-Program Invocation (CPI) to another program:

- The signer privileges from the initial transaction invoking the caller program
  (A) extend to the callee (B) program
- The callee (B) program can make further CPIs to other programs, up to a
  maximum depth of 4 (ex. B->C, C->D)
- The programs can "sign" on behalf of the [PDAs](/docs/core/pda) derived from
  its program ID

## How to write a CPI

Writing an instruction for a CPI follows the same pattern as building an
[instruction](/docs/core/transactions#instruction) to add to a transaction.
Under the hood, each CPI instruction must specify the following information:

- **Program address**: Specifies the program being invoked
- **Accounts**: Lists every account the instruction reads from or writes to,
  including other programs
- **Instruction Data**: Specifies which instruction on the program to invoke,
  plus any additional data required by the instruction (function arguments)

Depending on the program you are making the call to, there may be crates
available with helper functions for building the instruction. Programs then
execute CPIs using either the `invoke` or `invoke_signed` functions from the
`solana_program` crate.

### Basic CPI

The
[`invoke`](https://github.com/solana-labs/solana/blob/master/sdk/program/src/program.rs#L132)
function is used when making a CPI that does not require PDA signers. When
making CPIs, signers provided to the caller program can extend to the callee
program.

```rust
pub fn invoke(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>]
) -> Result<(), ProgramError>
```

Here is an example program on
[Solana Playground](https://beta.solpg.io/github.com/ZYJLiu/doc-examples/tree/main/cpi-invoke)
that makes a CPI using the `invoke` function to call the transfer instruction on
the System Program.

You can also reference the [CPI Basic Example](/docs/core/cpi/example1) page for
further details.

### CPI with PDA Signer

The
[`invoke_signed`](https://github.com/solana-labs/solana/blob/master/sdk/program/src/program.rs#L247)
function is used when making a CPI that requires PDA signers. The seeds used to
derive the signer PDAs are passed into the `invoke_signed` function as
`signer_seeds`.

You can reference the [Program Derived Address](/docs/core/pda) page for details
on how PDAs are derived.

```rust
pub fn invoke_signed(
    instruction: &Instruction,
    account_infos: &[AccountInfo<'_>],
    signers_seeds: &[&[&[u8]]]
) -> Result<(), ProgramError>
```

While PDAs have no private keys, they can still act as a signer in an
instruction via a CPI. To verify that a PDA is derived from the calling program,
the seeds used to generate the PDA must be included as `signers_seeds`.

When the CPI is processed, the Solana runtime
[internally calls `create_program_address`](https://github.com/solana-labs/solana/blob/master/programs/bpf_loader/src/syscalls/cpi.rs#L550)
using the `signers_seeds` and the `program_id` of the calling program. The
resulting PDA is then compared to the addresses included in the instruction. If
there's a match, the PDA is considered a valid signer on the instruction
(`is_signer` is set to true).

Here is an example program on
[Solana Playground](https://beta.solpg.io/github.com/ZYJLiu/doc-examples/tree/main/cpi-invoke-signed)
that makes a CPI using the `invoke_signed` function to call the transfer
instruction on the System Program with a PDA signer.

You can reference the [CPI with PDA Signer](/docs/core/cpi/example2) page for
further details.
