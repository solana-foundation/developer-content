---
title: Fees on Solana
sidebarSortOrder: 3
description:
  Learn about Solana's fee structure including transaction fees, prioritization
  fees, and rent costs. Understand how fees are calculated, collected and
  distributed across the network.
keywords:
  - instruction fee
  - processing fee
  - storage fee
  - rent
  - gas
  - gwei
altRoutes:
  - /docs/core/rent
  - /docs/intro/rent
  - /docs/intro/transaction_fees
  - /docs/intro/transaction-fees
  - /docs/core/runtime
---

The Solana blockchain has a few different types of fees and costs that are
incurred to use the permissionless network. These can be segmented into a few
specific types:

- Transaction Fees - A fee to have validators process transactions/instructions
- Prioritization Fees - An optional fee to boost transactions processing order
- Rent - A withheld balance to keep data stored on-chain

## Transaction Fees

The small fee paid to process logic (instruction) within an on-chain program on
the Solana blockchain is known as a "_transaction fee_".

As each [transaction](/docs/core/transactions.md#transaction) (which contains
one or more [instructions](/docs/core/transactions.md#instruction)) is sent
through the network, it gets processed by the current validator leader. Once
confirmed as a global state transaction, this _transaction fee_ is paid to the
network to help support the economic design of the Solana blockchain.

> Transaction fees are different from account data storage deposit fee of
> [rent](#rent). While transaction fees are paid to process instructions on the
> Solana network, a rent deposit is withheld in an account to store its data on
> the blockchain and reclaimable.

Currently, the base Solana transaction fee is set at a static value of 5k
lamports per signature. On top of this base fee, any additional
[prioritization fees](#prioritization-fee) can be added.

### Why pay transaction fees?

Transaction fees offer many benefits in the Solana
[economic design](#basic-economic-design), mainly they:

- provide compensation to the validator network for the expended CPU/GPU compute
  resources necessary to process transactions
- reduce network spam by introducing a real cost to transactions
- provide long-term economic stability to the network through a
  protocol-captured minimum fee amount per transaction

### Basic economic design

Many blockchain networks (including Bitcoin and Ethereum), rely on inflationary
_protocol-based rewards_ to secure the network in the short-term. Over the
long-term, these networks will increasingly rely on _transaction fees_ to
sustain security.

The same is true on Solana. Specifically:

- A fixed proportion (initially 50%) of each transaction fee is _burned_
  (destroyed), with the remaining going to the current
  [leader](/docs/terminology.md#leader) processing the transaction.
- A scheduled global inflation rate provides a source for
  [rewards](https://docs.solanalabs.com/implemented-proposals/staking-rewards)
  distributed to [Solana Validators](https://docs.solanalabs.com/operations).

### Fee collection

Transactions are required to have at least one account which has signed the
transaction and is writable. These _writable signer accounts_ are serialized
first in the list of accounts and the first of these is always used as the "_fee
payer_".

Before any transaction instructions are processed, the fee payer account
[balance will be deducted](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/runtime/src/bank.rs#L4045-L4064)
to pay for transaction fees. If the fee payer balance is not sufficient to cover
transaction fees, the transaction processing will halt and result in a failed
transaction.

If the balance was sufficient, the fees will be deducted and the transaction's
instructions will begin execution. Should any of the instructions result in an
error, transaction processing will halt and ultimately be recorded as a failed
transaction in the Solana ledger. The fee is still collected by the runtime for
these failed transactions.

Should any of the instructions return an error or violate runtime restrictions,
all account changes **_except_** the transaction fee deduction will be rolled
back. This is because the validator network has already expended computational
resources to collect transactions and begin the initial processing.

### Fee distribution

Transaction fees are
[partially burned](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/runtime/src/bank/fee_distribution.rs#L55-L64)
and the remaining fees are collected by the validator that produced the block
that the corresponding transactions were included in. Specifically,
[50% are burned](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/program/src/fee_calculator.rs#L79)
and
[50% percent are distributed](https://github.com/anza-xyz/agave/blob/e621336acad4f5d6e5b860eaa1b074b01c99253c/runtime/src/bank/fee_distribution.rs#L58-L62)
to the validator that produced the block.

### Why burn some fees?

As mentioned above, a fixed proportion of each transaction fee is _burned_
(destroyed). This is intended to cement the economic value of SOL and thus
sustain the network's security. Unlike a scheme where transactions fees are
completely burned, leaders are still incentivized to include as many
transactions as possible in their slots (opportunity to create a block).

Burnt fees can also help prevent malicious validators from censoring
transactions by being considered in [fork](/docs/terminology.md#fork) selection.

#### Example of an attack:

In the case of a
[Proof of History (PoH)](/docs/terminology.md#proof-of-history-poh) fork with a
malicious or censoring leader:

- due to the fees lost from censoring, we would expect the total fees burned to
  be **_less than_** a comparable honest fork
- if the censoring leader is to compensate for these lost protocol fees, they
  would have to replace the burnt fees on their fork themselves
- thus potentially reducing the incentive to censor in the first place

### Calculating transaction fees

The complete fee for a given transaction is calculated based on two main parts:

- a statically set base fee per signature, and
- the computational resources used during the transaction, measured in
  "[_compute units_](/docs/terminology.md#compute-units)"

Since each transaction may require a different amount of computational
resources, each is allotted a maximum number of _compute units_ per transaction
as part of the _compute budget_.

## Compute Budget

To prevent abuse of computational resources, each transaction is allocated a
"_compute budget_". This budget specifies details about
[compute units](#compute-units) and includes:

- the compute costs associated with different types of operations the
  transaction may perform (compute units consumed per operation),
- the maximum number of compute units that a transaction can consume (compute
  unit limit),
- and the operational bounds the transaction must adhere to (like account data
  size limits)

When the transaction consumes its entire compute budget (compute budget
exhaustion), or exceeds a bound such as attempting to exceed the
[max call stack depth](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L138)
or [max loaded account](#accounts-data-size-limit) data size limit, the runtime
halts the transaction processing and returns an error. Resulting in a failed
transaction and no state changes (aside from the transaction fee being
[collected](#fee-collection)).

### Accounts data size limit

A transaction may specify the maximum bytes of account data it is allowed to
load by including a `SetLoadedAccountsDataSizeLimit` instruction (not to exceed
the runtime's absolute max). If no `SetLoadedAccountsDataSizeLimit` is provided,
the transaction defaults to use the runtime's
[`MAX_LOADED_ACCOUNTS_DATA_SIZE_BYTES`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L137-L139)
value.

The `ComputeBudgetInstruction::set_loaded_accounts_data_size_limit` function can
be used to create this instruction:

```rust
let instruction = ComputeBudgetInstruction::set_loaded_accounts_data_size_limit(100_000);
```

### Compute units

All the operations performed on-chain within a transaction require different
amounts of computation resources be expended by validators when processing
(compute cost). The smallest unit of measure for the consumption of these
resources is called a _"compute unit"_.

As a transaction is processed, compute units are incrementally consumed by each
of its instructions being executed on-chain (consuming the budget). Since each
instruction is executing different logic (writing to accounts, cpi, performing
syscalls, etc), each may consume a
[different amount](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L133-L178)
of compute units.

> A program can log details about its compute usage, including how much remains
> in its alloted compute budget. You can also find more information in this
> guide for
> [optimizing your compute usage](/content/guides/advanced/how-to-optimize-compute.md).

Each transaction is alloted a [compute unit limit](#compute-unit-limit), either
with the default limit set by the runtime or by explicitly requesting a higher
limit. After a transaction exceeds its compute unit limit, its processing is
halted resulting in a transaction failure.

The following are some common operations that incur a compute cost:

- executing instructions
- passing data between programs
- performing syscalls
- using sysvars
- logging with the `msg!` macro
- logging pubkeys
- creating program addresses (PDAs)
- cross-program invocations (CPI)
- cryptographic operations

> For [cross-program invocations](/docs/core/cpi.md), the instruction invoked
> inherits the compute budget and limits of their parent. If an invoked
> instruction consumes the transaction's remaining budget, or exceeds a bound,
> the entire invocation chain and the top level transaction processing are
> halted.

You can find more details about all the operations that consume compute units
within the Solana runtime's
[`ComputeBudget`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget.rs#L19-L123).

### Compute unit limit

Each transaction has a maximum number of compute units (CU) it can consume
called the _"compute unit limit"_. Per transaction, the Solana runtime has an
absolute max compute unit limit of
[1.4 million CU](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L19)
and sets a default requested max limit of
[200k CU per instruction](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L18).

A transaction can request a more specific and optimal compute unit limit by
including a single `SetComputeUnitLimit` instruction. Either a higher or lower
limit. But it may never request higher than the absolute max limit per
transaction.

While a transaction's default compute unit limit will work in most cases for
simple transactions, they are often less than optimal (both for the runtime and
the user). For more complex transactions, like invoking programs that perform
multiple CPIs, you may need to request a higher compute unit limit for the
transaction.

Requesting the optimal compute unit limits for your transaction is essential to
help you pay less for your transaction and to help schedule your transaction
better on the network. Wallets, dApps, and other services should ensure their
compute unit requests are optimal to provide the best experience possible for
their users.

> For more details and best practices, read this guide on
> [requesting optimal compute limits](/content/guides/advanced/how-to-request-optimal-compute.md).

### Compute unit price

When a transaction desires to pay a higher fee to boost its processing
prioritization, it can set a _"compute unit price"_. This price, used in
combination with [compute unit limit](#compute-unit-limit), will be used to
determine a transaction's prioritization fee.

By default, there is
[no compute unit price set](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/program-runtime/src/compute_budget_processor.rs#L38)
resulting in no additional prioritization fee.

## Prioritization Fees

As part of the [Compute Budget](#compute-budget), the runtime supports
transactions paying an **optional** fee known as a _"prioritization fee"_.
Paying this additional fee helps boost how a transaction is prioritized against
others when processing, resulting in faster execution times.

### How the prioritization fee is calculated

A transaction's prioritization fee is calculated by multiplying its **_compute
unit limit_** by the **_compute unit price_** (measured in _micro-lamports_).
These values can be set once per transaction by including the following Compute
Budget instructions:

- [`SetComputeUnitLimit`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/src/compute_budget.rs#L47-L50) -
  setting the maximum number of compute units the transaction can consume
- [`SetComputeUnitPrice`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/src/compute_budget.rs#L52-L55) -
  setting the desired additional fee the transaction is willing to pay to boost
  its prioritization

If no `SetComputeUnitLimit` instruction is provided, the
[default compute unit limit](#compute-unit-limit) will be used.

If no `SetComputeUnitPrice` instruction is provided, the transaction will
default to no additional elevated fee and the lowest priority (i.e. no
prioritization fee).

### How to set the prioritization fee

A transaction's prioritization fee is set by including a `SetComputeUnitPrice`
instruction, and optionally a `SetComputeUnitLimit` instruction. The runtime
will use these values to calculate the prioritization fee, which will be used to
prioritize the given transaction within the block.

You can craft each of these instructions via their Rust or `@solana/web3.js`
functions. Each instruction can then be included in the transaction and sent to
the cluster like normal. See also the
[best practices](#prioritization-fee-best-practices) below.

Unlike other instructions inside a Solana transaction, Compute Budget
instructions do **NOT** require any accounts. A transaction with multiple of
either of the instructions will fail.

<Callout type="caution">

Transactions can only contain **one of each type** of compute budget
instruction. Duplicate instruction types will result in an
[`TransactionError::DuplicateInstruction`](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/src/transaction/error.rs#L143-L145)
error, and ultimately transaction failure.

</Callout>

#### Rust

The rust `solana-sdk` crate includes functions within
[`ComputeBudgetInstruction`](https://docs.rs/solana-sdk/latest/solana_sdk/compute_budget/enum.ComputeBudgetInstruction.html)
to craft instructions for setting the _compute unit limit_ and _compute unit
price_:

```rust
let instruction = ComputeBudgetInstruction::set_compute_unit_limit(300_000);
```

```rust
let instruction = ComputeBudgetInstruction::set_compute_unit_price(1);
```

#### Javascript

The `@solana/web3.js` library includes functions within the
[`ComputeBudgetProgram`](https://solana-labs.github.io/solana-web3.js/v1.x/classes/ComputeBudgetProgram.html)
class to craft instructions for setting the _compute unit limit_ and _compute
unit price_:

```js
const instruction = ComputeBudgetProgram.setComputeUnitLimit({
  units: 300_000,
});
```

```js
const instruction = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 1,
});
```

### Prioritization fee best practices

Below you can find general information on the best practices for prioritization
fees. You can also find more detailed information in this guide on
[how to request optimal compute](/content/guides/advanced/how-to-request-optimal-compute.md),
including how to simulate a transaction to determine its approximate compute
usage.

#### Request the minimum compute units

Transactions should request the minimum amount of compute units required for
execution to minimize fees. Also note that fees are not adjusted when the number
of requested compute units exceeds the number of compute units actually consumed
by an executed transaction.

#### Get recent prioritization fees

Prior to sending a transaction to the cluster, you can use the
[`getRecentPrioritizationFees`](/docs/rpc/http/getRecentPrioritizationFees.mdx)
RPC method to get a list of the recent paid prioritization fees within the
recent blocks processed by the node.

You could then use this data to estimate an appropriate prioritization fee for
your transaction to both (a) better ensure it gets processed by the cluster and
(b) minimize the fees paid.

## Rent

The fee deposited into every [Solana Account](/docs/core/accounts.md) to keep
its associated data available on-chain is called "_rent_". This fee is withheld
in the normal lamport balance on every account and reclaimable when the account
is closed.

> Rent is different from [transaction fees](#transaction-fees). Rent is "paid"
> (withheld in an Account) to keep data stored on the Solana blockchain and can
> be reclaimed. Whereas transaction fees are paid to process
> [instructions](/docs/core/transactions.md#instructions) on the network.

All accounts are required to maintain a high enough lamport balance (relative to
its allocated space) to become [rent exempt](#rent-exempt) and remain on the
Solana blockchain. Any transaction that attempts to reduce an account's balance
below its respective minimum balance for rent exemption will fail (unless the
balance is reduced to exactly zero).

When an account's owner no longer desires to keep this data on-chain and
available in the global state, the owner can close the account and reclaim the
rent deposit.

This is accomplished by withdrawing (transferring) the account's entire lamport
balance to another account (i.e. your wallet). By reducing the account's balance
to exactly `0`, the runtime will remove the account and its associated data from
the network in the process of _"[garbage collection](#garbage-collection)"_.

### Rent rate

The Solana rent rate is set on a network wide basis, primarily based on a
runtime set
"[lamports _per_ byte _per_ year](https://github.com/anza-xyz/agave/blob/b7bbe36918f23d98e2e73502e3c4cba78d395ba9/sdk/program/src/rent.rs#L27-L34)".
Currently, the rent rate is a static amount and stored in the
[Rent sysvar](https://docs.solanalabs.com/runtime/sysvars#rent).

This rent rate is used to calculate the exact amount of rent required to be
withheld inside an account for the space allocated to the account (i.e. the
amount of data that can be stored in the account). The more space an account
allocates, the higher the withheld rent deposit will be.

### Rent exempt

Accounts must maintain a lamport balance greater than the minimum required to
store its respective data on-chain. This is called "_rent exempt_" and that
balance is called the "_minimum balance for rent exemption_".

> New accounts (and programs) on Solana are **REQUIRED** to be initialized with
> enough lamports to become _rent exempt_. This was not always the case.
> Previously, the runtime would periodically and automatically collect a fee
> from each account below its _minimum balance for rent exemption_. Eventually
> reducing those accounts to a balance of zero and garbage collecting them from
> the global state (unless manually topped up).

In the process of creating a new account, you must ensure you deposit enough
lamports to be above this minimum balance. Anything lower that this minimum
threshold will result in a failed transaction.

Every time an account's balance is reduced, the runtime performs a check to see
if the account will still be above this minimum balance for rent exemption.
Unless they reduce the final balance to exactly `0` (closing the account),
transactions that would cause an account's balance to drop below the rent exempt
threshold will fail.

The specific minimum balance for an account to become rent exempt is dependant
on the blockchain's current [rent rate](#rent-rate) and the desired amount of
storage space an account wants to allocate (account size). Therefore, it is
recommended to use the
[`getMinimumBalanceForRentExemption`](/docs/rpc/http/getMinimumBalanceForRentExemption.mdx)
RPC endpoint to calculate the specific balance for a given account size.

The required rent deposit amount can also be estimated via the
[`solana rent` CLI subcommand](https://docs.solanalabs.com/cli/usage#solana-rent):

```shell
solana rent 15000

# output
Rent per byte-year: 0.00000348 SOL
Rent per epoch: 0.000288276 SOL
Rent-exempt minimum: 0.10529088 SOL
```

### Garbage collection

Accounts that do not maintain a lamport balance greater than zero are removed
from the network in a process known as _garbage collection_. This process is
done to help reduce the network wide storage of no longer used/maintained data.

After a transaction successfully reduces an accounts balance to exactly `0`,
garbage collection happens automatically by the runtime. Any transaction that
attempts to reduce an accounts balance lower that its minimum balance for rent
exemption (that is not exactly zero) will fail.

<Callout type="warning">

It's important to note that garbage collection happens **after** the transaction
execution is completed. If there is an instruction to "close" an account by
reducing the account balance to zero, the account can be "reopened" within the
same transaction via a later instruction. If the account state was not cleared
in the "close" instruction, the later "reopen" instruction will have the same
account state. It's a security concern, so it's good to know the exact timing
garbage collection takes effect.

</Callout>

Even after an account has been removed from the network (via garbage
collection), it may still have transactions associated with it's address (either
past history or in the future). Even though a Solana block explorer may display
an "account not found" type of message, you may still be able to view
transaction history associated with that account.

You can read the validator
[implemented proposal](https://docs.solanalabs.com/implemented-proposals/persistent-account-storage#garbage-collection)
for garbage collection to learn more.
