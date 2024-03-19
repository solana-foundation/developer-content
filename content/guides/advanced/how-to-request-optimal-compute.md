---
title: How to Request Optimal Compute Budget
---

All transactions on Solana use Compute Units(CU), which measure the
computational resources your transaction uses on the network. When you pay
priority fees on your transactions, you must specify the exact amount of compute
units you expect to use; otherwise, you will overpay for your transaction. This
guide will provide step-by-step instructions on optimizing the compute units for
your transaction requests.

## How to Request Compute Budget

For precise control over your transaction's computational resources, use the
setComputeUnitLimit instruction from the Compute Budget program. This
instruction allocates a specific number of compute units for your transaction,
ensuring you only pay for what you need.

```javascript
const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
  units: 300,
});
```

This instruction will allocate a specific amount of compute units for your
transaction. How do we come up with the number to use?

The simulateTransaction RPC method will return the estimated compute units
consumed given a transaction. Using this RPC method, you can calculate the
compute units, set the compute units in your new transaction, and send it for an
optimal result. The code looks as follows:

```javascript
async function getSimulationUnits(
  connection: Connection,
  instructions: TransactionInstruction[],
  payer: PublicKey,
  lookupTables: AddressLookupTableAccount[]
): Promise<number | undefined> {
  const testInstructions = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
    ...instructions,
  ];

  const testVersionedTxn = new VersionedTransaction(
    new TransactionMessage({
      instructions: testInstructions,
      payerKey: payer,
      recentBlockhash: PublicKey.default.toString(),
    }).compileToV0Message(lookupTables)
  );

  const simulation = await connection.simulateTransaction(testVersionedTxn, {
    replaceRecentBlockhash: true,
    sigVerify: false,
  });
  if (simulation.value.err) {
    return undefined;
  }
  return simulation.value.unitsConsumed;
}

async function buildOptimalTransaction(
  connection: Connection,
  instructions: TransactionInstruction[],
  signer: Signer,
  lookupTables: AddressLookupTableAccount[]
) {
  const [microLamports, units, recentBlockhash] = await Promise.all([
    100 /* Get optimal priority fees - https://solana.com/developers/guides/advanced/how-to-use-priority-fees*/,
    getSimulationUnits(connection, instructions, signer.publicKey, lookupTables),
    connection.getLatestBlockhash(),
  ]);

  instructions.unshift(ComputeBudgetProgram.setComputeUnitPrice({ microLamports }));
  if (units) {
    // probably should add some margin of error to units
    instructions.unshift(ComputeBudgetProgram.setComputeUnitLimit({ units }));
  }
  return {
    transaction: new VersionedTransaction(
      new TransactionMessage({
        instructions,
        recentBlockhash: recentBlockhash.blockhash,
        payerKey: signer.publicKey,
      }).compileToV0Message(lookupTables)
    ),
    recentBlockhash,
  };
}
```

Credit to [Sammmmmy](https://twitter.com/stegaBOB) for the source

Special Considerations

Compute units for transactions are not always stable. For example, the compute
usage can change if the transaction you are executing has a call to
find_program_address, such as when finding a program derived address.

If you have a variable compute usage on your transactions, you can do one of two
things:

Run a test over your transactions over some time to find out the ceiling compute
unit usage and use that number. Take the compute units returned from
simulateTransaction and add a percentage to the total. For example, if you chose
to add 10% more CU and the result you received from simulateTransaction was 1000
CU, you would set 1100 CU on your transaction.

Conclusion

Requesting the optimal compute units for your transaction is essential to help
you pay less for your transaction and to help schedule your transaction better
on the network. Wallets, dapps, and other services should ensure their compute
unit requests are optimal to provide the best experience possible for their
users.
