---
date: 2024-04-07T00:00:00Z
difficulty: intermediate
title: "How to use Priority Fees on Solana"
description:
  "Priority Fees are a new feature on Solana that allow you to specify an
  additional fee to your transactions. These fees help make your transaction
  more economically compelling to include in a block."
tags:
  - web3js
keywords:
  - tutorial
  - priority fees
  - offline signing
  - transactions
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
---

This guide is meant to be a reference for developers who want to add priority
fees to their transactions on Solana. We will cover priority fees, how to use
them, special considerations, and best practices to estimate them.

## What are Priority Fees?

Prioritization Fees are an optional fee, priced in
[micro-lamports](/docs/terminology#lamport) per
[Compute Unit](/docs/terminology#compute-units) (e.g. small amounts of SOL),
appended to transactions to make them economically compelling for validator
nodes to include in blocks on the network. This additional fee will be on top of
the base [Transaction Fee](/docs/core/fees) already set, which is 5000 lamports
per signature in your transaction.

## Why Should I Use Priority Fees?

When a transaction journeys through a validator, one of the critical stages of
the validator is scheduling the transaction. A validator is economically
incentivized to schedule transactions with the highest fee per compute unit
associated, guaranteeing users use resources optimally. A user can still have
their transaction executed with no priority fee attached but with a lesser
guarantee. When blocks are saturated with transactions with priority fees,
validators will drop transactions without priority fees.

## How do I Implement Priority Fees?

When adding priority fees to a transaction, keep in mind the amount of compute
units (CU) used for your transaction. The higher the CU required for the
transaction, the more fees you will pay when adding priority fees.

Using the [Compute Budget Program](/docs/core/fees.md#compute-budget), you can
change the CU requested for your transaction and add any additional priority fee
required. Do note that your CU request must be equal to or greater than the CU
needed for the transaction; otherwise, the transaction will fail.

Let's take a simple transfer SOL transaction and add priority fees. A
[transfer SOL transaction takes 300 CU](https://explorer.solana.com/tx/5scDyuiiEbLxjLUww3APE9X7i8LE3H63unzonUwMG7s2htpoAGG17sgRsNAhR1zVs6NQAnZeRVemVbkAct5myi17).
To best optimize our transaction, request exactly 300 CU with the Compute Budget
Program when adding additional priority fees.

```typescript
// import { ... } from "@solana/web3.js"

const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 300,
});

const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 20000,
});

const transaction = new Transaction()
  .add(modifyComputeUnits)
  .add(addPriorityFee)
  .add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount,
      lamports: 10000000,
    }),
  );
```

Viewing
[this transaction](https://explorer.solana.com/tx/5scDyuiiEbLxjLUww3APE9X7i8LE3H63unzonUwMG7s2htpoAGG17sgRsNAhR1zVs6NQAnZeRVemVbkAct5myi17)
on the Solana Explorer, see that we used
`ComputeBudgetProgram.setComputeUnitLimit` to set the Compute Unit Limit to 300
CUs while also adding a priority fee of 20000 micro-lamports with
`ComputeBudgetProgram.setComputeUnitPrice`.

## How Do I Estimate Priority Fees?

The best way to estimate priority fees for a given transaction is to query the
historical priority fees required to land a transaction given the correct
accounts. The
[getRecentPrioritizationFees](/docs/rpc/http/getrecentprioritizationfees) JSON
RPC API method will retrieve the lowest priority fees used recently to land a
transaction in a block.

When using `getRecentPrioritizationFees`, provide the accounts used in your
transaction; otherwise, you'll find the lowest fee to land a transaction
overall. Account contention within a block decides priority, and validators will
schedule accordingly.

This RPC method will return the highest fee associated with the provided
accounts, which then becomes the base fee to consider when adding priority fees.

```shell
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
  {
    "jsonrpc":"2.0", "id":1,
    "method": "getRecentPrioritizationFees",
    "params": [
      ["CxELquR1gPP8wHe33gZ4QxqGB3sZ9RSwsJ2KshVewkFY"]
    ]
  }
'
```

Different approaches to setting Priority Fees exist, and some
[third-party APIs](https://docs.helius.dev/solana-rpc-nodes/alpha-priority-fee-api)
are available to determine the best fee to apply. Given the dynamic nature of
the network, there will not be a "perfect" way to set priority fees, and careful
analysis should be used before choosing a path forward.

## Special Considerations

If you use priority fees with a
[Durable Nonce](/content/guides/advanced/introduction-to-durable-nonces.md)
Transaction, you must ensure the `AdvanceNonce` instruction is your
transaction's first instruction. This is critical to ensure your transaction is
successful; otherwise, it will fail.

```typescript
const advanceNonce = SystemProgram.nonceAdvance({
  noncePubkey: nonceAccountPubkey,
  authorizedPubkey: nonceAccountAuth.publicKey,
});

const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 300,
});

const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 20000,
});

const transaction = new Transaction()
  .add(advanceNonce)
  .add(modifyComputeUnits)
  .add(addPriorityFee)
  .add(
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: toAccount,
      lamports: 10000000,
    }),
  );
```
