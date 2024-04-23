---
title: Fees and Compute
description:
  "Your guide to transaction fees on Solana -- small fees paid to process
  instructions on the network, based on computation and an optional
  prioritization fee."
keywords:
  - instruction fee
  - processing fee
  - storage fee
  - low fee blockchain
  - gas
  - gwei
  - cheap network
  - affordable blockchain
altRoutes:
  - /docs/intro/rent
  - /docs/core/rent
  - /docs/intro/transaction_fees
  - /docs/intro/transaction-fees
---

The Solana blockchain has a few different types of fees and costs that are
incurred to use the network. These can be segmented into a few specific types:

- transaction fees
- prioritization fees
- rent (fee for on-chain data storage)

## Transaction fees

The small fees paid to process [instructions](/docs/terminology.md#instruction)
on the Solana blockchain are known as "_transaction fees_".

As each transaction (which contains one or more instructions) is sent through
the network, it gets processed by the current leader validation-client. Once
confirmed as a global state transaction, this _transaction fee_ is paid to the
network to help support the [economic design](#basic-economic-design) of the
Solana blockchain.

> Transaction fees are different from [account rent](/docs/terminology.md#rent)!
> While transaction fees are paid to process instructions on the Solana network,
> rent is paid to store data on the blockchain. You can learn more about rent
> here: [What is rent?](/docs/core/rent.md)

### Why pay transaction fees?

Transaction fees offer many benefits in the Solana
[economic design](#basic-economic-design) described below, mainly:

- they provide compensation to the validator network for the CPU/GPU resources
  necessary to process transactions,
- reduce network spam by introducing real cost to transactions,
- and provide long-term economic stability to the network through a
  protocol-captured minimum fee amount per transaction

> Network consensus votes are sent as normal system transfers, which means that
> validators pay transaction fees to participate in consensus.

### Basic economic design

Many blockchain networks \(e.g. Bitcoin and Ethereum\), rely on inflationary
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

### Fee Collection

Transactions are required to have at least one account which has signed the
transaction and is writable. Writable signer accounts are serialized first in
the list of transaction accounts and the first of these accounts is always used
as the "fee payer".

Before any transaction instructions are processed, the fee payer account balance
will be deducted to pay for transaction fees. If the fee payer balance is not
sufficient to cover transaction fees, the transaction will be dropped by the
cluster. If the balance was sufficient, the fees will be deducted whether the
transaction is processed successfully or not. In fact, if any of the transaction
instructions return an error or violate runtime restrictions, all account
changes _except_ the transaction fee deduction will be rolled back.

### Fee Distribution

Transaction fees are partially burned and the remaining fees are collected by
the validator that produced the block that the corresponding transactions were
included in.

The transaction fee burn rate was initialized as 50% when inflation rewards were
enabled at the beginning of 2021 and has not changed so far. These fees
incentivize a validator to process as many transactions as possible during its
slots in the leader schedule. Collected fees are deposited in the validator's
account (listed in the leader schedule for the current slot) after processing
all of the transactions included in a block.

### Why burn some fees?

As mentioned above, a fixed proportion of each transaction fee is _burned_
(destroyed). This is intended to cement the economic value of SOL and thus
sustain the network's security. Unlike a scheme where transactions fees are
completely burned, leaders are still incentivized to include as many
transactions as possible in their slots.

Burnt fees can also help prevent malicious validators from censoring
transactions by being considered in [fork](/docs/terminology.md#fork) selection.

#### Example of an attack:

In the case of a
[Proof of History (PoH)](/docs/terminology.md#proof-of-history-poh) fork with a
malicious, censoring leader:

- due to the fees lost from censoring, we would expect the total fees burned to
  be **_less than_** a comparable honest fork
- if the censoring leader is to compensate for these lost protocol fees, they
  would have to replace the burnt fees on their fork themselves
- thus potentially reducing the incentive to censor in the first place

### Calculating transaction fees

Transactions fees are calculated based on two main parts:

- a statically set base fee per signature, and
- the computational resources used during the transaction, measured in
  "[_compute units_](/docs/terminology.md#compute-units)"

Since each transaction may require a different amount of computational
resources, they are allotted a maximum number of _compute units_ per transaction
known as the "[_compute budget_](/docs/terminology.md#compute-budget)".

The execution of each instruction within a transaction consumes a different
number of _compute units_. After the maximum number of _compute units_ has been
consumed (aka compute budget exhaustion), the runtime will halt the transaction
and return an error. This results in a failed transaction.

> **Learn more:** compute units and the
> [Compute Budget](/docs/core/runtime.md#compute-budget) in the Runtime and
> [requesting a fee estimate](/docs/rpc/http/getFeeForMessage.mdx) from the RPC.

## Rent

The on-chain data storage fee for every Solana Account to keep data on the
blockchain is called "_rent_". This _time and space_ based fee is required to
keep an account, and therefore its data, available in the blockchain's global
state.

All Solana Accounts (and therefore Programs) are required to maintain a high
enough LAMPORT balance to become [rent exempt](#rent-exempt) and remain on the
Solana blockchain.

When an Account no longer has enough LAMPORTS to pay its rent, it will be
removed from the network in a process known as
[Garbage Collection](#garbage-collection).

> **Note:** Rent is different from
> [transactions fees](/docs/core/transactions/fees.md). Rent is paid (or held in
> an Account) to keep data stored on the Solana blockchain. Whereas transaction
> fees are paid to process
> [instructions](/docs/core/transactions.md#instructions) on the network.

### Rent rate

The Solana rent rate is set on a network wide basis, primarily based on the set
LAMPORTS _per_ byte _per_ year.

Currently, the rent rate is a static amount and stored in the
[Rent sysvar](https://docs.solanalabs.com/runtime/sysvars#rent).

### Rent exempt

Accounts that maintain a minimum LAMPORT balance greater than 2 years worth of
rent payments are considered "_rent exempt_" and will not incur a rent
collection.

> At the time of writing this, new Accounts and Programs **are required** to be
> initialized with enough LAMPORTS to become rent-exempt. The RPC endpoints have
> the ability to calculate this
> [estimated rent exempt balance](/docs/rpc/http/getMinimumBalanceForRentExemption.mdx)
> and is recommended to be used.

Every time an account's balance is reduced, a check is performed to see if the
account is still rent exempt. Transactions that would cause an account's balance
to drop below the rent exempt threshold will fail.

### Garbage collection

Accounts that do not maintain their rent exempt status, or have a balance high
enough to pay rent, are removed from the network in a process known as _garbage
collection_. This process is done to help reduce the network wide storage of no
longer used/maintained data.

You can learn more about
[garbage collection here](https://docs.solanalabs.com/implemented-proposals/persistent-account-storage#garbage-collection)
in this implemented proposal.

### Learn more about Rent

You can learn more about Solana Rent with the following articles and
documentation:

- [Implemented Proposals - Rent](https://docs.solanalabs.com/implemented-proposals/rent)
- [Implemented Proposals - Account Storage](https://docs.solanalabs.com/implemented-proposals/persistent-account-storage)

## Prioritization fee

A Solana transaction can include an **optional** fee to prioritize itself
against others known as a
"_[prioritization fee](/docs/terminology.md#prioritization-fee)_". Paying this
additional fee helps boost how a transaction is prioritized against others,
resulting in faster execution times.

### How the prioritization fee is calculated

A transaction's [prioritization fee](/docs/terminology.md#prioritization-fee) is
calculated by multiplying the maximum number of **_compute units_** by the
**_compute unit price_** (measured in _micro-lamports_).

Each transaction can set the maximum number of compute units it is allowed to
consume and the compute unit price by including a `SetComputeUnitLimit` and
`SetComputeUnitPrice` compute budget instruction respectively.

> Unlike other instructions inside a Solana transaction,
> [Compute Budget instructions](https://github.com/solana-labs/solana/blob/master/sdk/src/compute_budget.rs)
> do **NOT** require any accounts.

If no `SetComputeUnitLimit` instruction is provided, the limit will be
calculated as the product of the number of instructions in the transaction and
the default per-instruction units, which is currently
[200k](https://github.com/solana-labs/solana/blob/4293f11cf13fc1e83f1baa2ca3bb2f8ea8f9a000/program-runtime/src/compute_budget.rs#L13).

If no `SetComputeUnitPrice` instruction is provided, the transaction will
default to no additional elevated fee and the lowest priority.

### How to set the prioritization fee

A transaction's prioritization fee is set by including a `SetComputeUnitPrice`
instruction, and optionally a `SetComputeUnitLimit` instruction. The runtime
will use these values to calculate the prioritization fee, which will be used to
prioritize the given transaction within the block.

You can craft each of these instructions via their `rust` or `@solana/web3.js`
functions. Each of these instructions can then be included in the transaction
and sent to the cluster like normal. See also the
[best practices](#prioritization-fee-best-practices) below.

> Caution: Transactions can only contain **one of each type** of compute budget
> instruction. Duplicate types will result in an
> [`TransactionError::DuplicateInstruction`](https://github.com/solana-labs/solana/blob/master/sdk/src/transaction/error.rs#L144-145)
> error, and ultimately transaction failure.

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
[`ComputeBudgetProgram`](https://solana-labs.github.io/solana-web3.js/classes/ComputeBudgetProgram.html)
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
