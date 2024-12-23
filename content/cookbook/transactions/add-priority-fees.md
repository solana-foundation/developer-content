---
title: How to Add Priority Fees to a Transaction
sidebarSortOrder: 5
description:
  "Transactions executed in order they are prioritized on Solana. Learn how to
  increase your transaction priority with priority fees on Solana."
---

Transaction (TX) priority is achieved by paying a Prioritization Fee in addition
to the Base Fee. By default the compute budget is the product of 200,000 Compute
Units (CU) \* number of instructions, with a max of 1.4M CU. The Base Fee is
5,000 Lamports per signature. A microLamport is 0.000001 Lamports.

> You can find a detailed guide here on
> [how to use priority fees](/content/guides/advanced/how-to-use-priority-fees.md).

The total compute budget or Prioritization Fee for a single TX can be changed by
adding instructions from the ComputeBudgetProgram.

`ComputeBudgetProgram.setComputeUnitPrice({ microLamports: number })` will add a
Prioritization Fee above the Base Fee (5,000 Lamports). The value provided in
microLamports will be multiplied by the CU budget to determine the
Prioritization Fee in Lamports. For example, if your CU budget is 1M CU, and you
add 1 microLamport/CU, the Prioritization Fee will be 1 Lamport (1M \*
0.000001). The total fee will then be 5001 Lamports.

Use `ComputeBudgetProgram.setComputeUnitLimit({ units: number })` to set the new
compute budget. The value provided will replace the default value. Transactions
should request the minimum amount of CU required for execution to maximize
throughput, or minimize fees.

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript filename="add-priority-fees.ts" {61-72} {37-38} {77-87}
import {
  airdropFactory,
  appendTransactionMessageInstructions,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  generateKeyPairSigner,
  getComputeUnitEstimateForTransactionMessageFactory,
  getSignatureFromTransaction,
  lamports,
  pipe,
  prependTransactionMessageInstructions,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/web3.js";
import {
  getSetComputeUnitLimitInstruction,
  getSetComputeUnitPriceInstruction,
} from "@solana-program/compute-budget";
import { getAddMemoInstruction } from "@solana-program/memo";

async function writeMemoWithPriorityFees(message: string) {
  // Create an RPC.
  const CLUSTER = "devnet";
  const rpc = createSolanaRpc(devnet(`https://api.${CLUSTER}.solana.com`));
  const rpcSubscriptions = createSolanaRpcSubscriptions(
    devnet(`wss://api.${CLUSTER}.solana.com`),
  );

  // Create an airdrop function.
  const airdrop = airdropFactory({ rpc, rpcSubscriptions });

  // Create a utility that estimates a transaction message's compute consumption.
  const getComputeUnitEstimate =
    getComputeUnitEstimateForTransactionMessageFactory({ rpc });

  // Create a transaction sending function.
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  // Create and fund an account.
  const keypairSigner = await generateKeyPairSigner();
  console.log("Created an account with address", keypairSigner.address);
  console.log("Requesting airdrop");
  await airdrop({
    commitment: "confirmed",
    lamports: lamports(1000_000n),
    recipientAddress: keypairSigner.address,
  });
  console.log("Airdrop confirmed");

  // Create a memo transaction.
  console.log("Creating a memo transaction");
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
  const transactionMessage = pipe(
    createTransactionMessage({ version: "legacy" }),
    m => setTransactionMessageFeePayerSigner(keypairSigner, m),
    m => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
    m =>
      appendTransactionMessageInstructions(
        [
          getSetComputeUnitPriceInstruction({ microLamports: 5000n }),
          getAddMemoInstruction({ memo: message }),
        ],
        m,
      ),
  );

  // Figure out how many compute units to budget for this transaction
  // so that you can right-size the compute budget to maximize the
  // chance that it will be selected for inclusion into a block.
  console.log("Estimating the compute consumption of the transaction");
  var estimatedComputeUnits = await getComputeUnitEstimate(transactionMessage);
  // While these estimates are quite accurate they are not perfect. So you may want to add a
  // buffer if you expect that the transaction may consume more compute units than estimated.
  // Its not possible to exactly know what the transaction will consume when
  // you send it in the future. The state may change. You can add a buffer to the estimate to account for this.
  // estimatedComputeUnits += 1000;
  // estimatedComputeUnits *= 1.1;
  // You can read more about the issue here: https://github.com/solana-labs/solana-web3.js/tree/master/packages/library#getcomputeunitestimatefortransactionmessagefactoryrpc

  console.log(
    `Transaction is estimated to consume ${estimatedComputeUnits} compute units`,
  );
  const budgetedTransactionMessage = prependTransactionMessageInstructions(
    [getSetComputeUnitLimitInstruction({ units: estimatedComputeUnits })],
    transactionMessage,
  );

  // Sign and send the transaction.
  console.log("Signing and sending the transaction");
  const signedTx = await signTransactionMessageWithSigners(
    budgetedTransactionMessage,
  );
  const signature = getSignatureFromTransaction(signedTx);
  console.log(
    "Sending transaction https://explorer.solana.com/tx/" +
      signature +
      "/?cluster=" +
      CLUSTER,
  );
  await sendAndConfirmTransaction(signedTx, { commitment: "confirmed" });
  console.log("Transaction confirmed");
}

writeMemoWithPriorityFees("Hello, priority fees!");
```

</Tab>

<Tab value="web3.js v1">

```typescript filename="add-priority-fees.ts" {25-28, 30-33}
import { BN } from "@coral-xyz/anchor";
import {
  Keypair,
  Connection,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

(async () => {
  const payer = Keypair.generate();
  const toAccount = Keypair.generate().publicKey;

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");

  const airdropSignature = await connection.requestAirdrop(
    payer.publicKey,
    LAMPORTS_PER_SOL,
  );

  await connection.confirmTransaction(airdropSignature);

  // request a specific compute unit budget
  const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1000000,
  });

  // set the desired priority fee
  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 1,
  });

  // Total fee will be 5,001 Lamports for 1M CU
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

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    payer,
  ]);
  console.log(signature);

  const result = await connection.getParsedTransaction(signature);
  console.log(result);
})();
```

</Tab>

</Tabs>
