---
title: How to Send SOL
sidebarSortOrder: 1
description:
  "The most common action on Solana is sending SOL. Learn how to send SOL on
  Solana."
---

To send SOL, you will need to interact with the [SystemProgram][1].

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript filename="send-sol.ts" {70-74}
import {
  address,
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
import { getTransferSolInstruction } from "@solana-program/system";

async function transferSol() {
  // Create an RPC. Use localnet for solana-test-validator. This will get you easier airdrops.
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
    lamports: lamports(1_000_000_000n),
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
          getTransferSolInstruction({
            source: keypairSigner,
            destination: address("web3Qm5PuFapMJqe6PWRWfRBarkeqE2ZC8Eew3zwHH2"),
            amount: lamports(1_000_000n),
          }),
        ],
        m,
      ),
  );

  // Figure out how many compute units to budget for this transaction
  // so that you can right-size the compute budget to maximize the
  // chance that it will be selected for inclusion into a block.
  console.log("Estimating the compute consumption of the transaction");
  const estimatedComputeUnits =
    await getComputeUnitEstimate(transactionMessage);
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

transferSol();
```

</Tab>

<Tab value="web3.js v1">

```typescript filename="send-sol.ts" {28-38}
import {
  Connection,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

(async () => {
  const fromKeypair = Keypair.generate();
  const toKeypair = Keypair.generate();

  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );

  const airdropSignature = await connection.requestAirdrop(
    fromKeypair.publicKey,
    LAMPORTS_PER_SOL,
  );

  await connection.confirmTransaction(airdropSignature);

  const lamportsToSend = 1_000_000;

  const transferTransaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toKeypair.publicKey,
      lamports: lamportsToSend,
    }),
  );

  await sendAndConfirmTransaction(connection, transferTransaction, [
    fromKeypair,
  ]);
})();
```

</Tab>

</Tabs>

[1]: https://docs.solanalabs.com/runtime/programs#system-program
