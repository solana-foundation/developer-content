---
title: How to Calculate Transaction Cost
sidebarSortOrder: 3
description:
  "Every transaction costs an amount of fees to execute on Solana. Learn how to
  calculate transaction fees on Solana."
---

The number of signatures a transaction requires are used to calculate the
transaction cost. As long as you are not creating an account, this will be the
base transaction cost. To find out more about costs to create an account, check
out [calculating rent costs](/content/cookbook/accounts/calculate-rent.md).

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript filename="calculate-cost.ts" {101-118}
import {
  airdropFactory,
  appendTransactionMessageInstructions,
  compileTransactionMessage,
  createSignerFromKeyPair,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  generateKeyPairSigner,
  getBase64Decoder,
  getCompiledTransactionMessageEncoder,
  getComputeUnitEstimateForTransactionMessageFactory,
  getSignatureFromTransaction,
  lamports,
  pipe,
  prependTransactionMessageInstructions,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type TransactionMessageBytesBase64,
} from "@solana/web3.js";
import {
  getSetComputeUnitLimitInstruction,
  getSetComputeUnitPriceInstruction,
} from "@solana-program/compute-budget";
import { getAddMemoInstruction } from "@solana-program/memo";
import { loadDefaultKeypairWithAirdrop } from "./CreateKeypair";

async function calculateCost(message: string) {
  // Create an RPC.
  const CLUSTER = "devnet";
  const rpc = createSolanaRpc(devnet(`https://api.${CLUSTER}.solana.com`));
  const rpcSubscriptions = createSolanaRpcSubscriptions(
    devnet(`wss://api.${CLUSTER}.solana.com`),
  );

  // Create a utility that estimates a transaction message's compute consumption.
  const getComputeUnitEstimate =
    getComputeUnitEstimateForTransactionMessageFactory({ rpc });

  // Create a transaction sending function.
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  // Create an airdrop function.
  const airdrop = airdropFactory({ rpc, rpcSubscriptions });

  // Create and fund an account.
  const signer = await generateKeyPairSigner();
  console.log("Created an account with address", signer.address);
  console.log("Requesting airdrop");
  await airdrop({
    commitment: "confirmed",
    lamports: lamports(1000_000n),
    recipientAddress: signer.address,
  });
  console.log("Airdrop confirmed");

  // Create a memo transaction.
  console.log("Creating a memo transaction");
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
  const transactionMessage = pipe(
    createTransactionMessage({ version: "legacy" }),
    m => setTransactionMessageFeePayerSigner(signer, m),
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
  const estimatedComputeUnits =
    await getComputeUnitEstimate(transactionMessage);
  console.log(
    `Transaction is estimated to consume ${estimatedComputeUnits} compute units`,
  );

  const budgetedTransactionMessage = prependTransactionMessageInstructions(
    [getSetComputeUnitLimitInstruction({ units: estimatedComputeUnits })],
    transactionMessage,
  );

  const base64EncodedMessage = pipe(
    // Start with the message you want the fee for.
    budgetedTransactionMessage,

    // Compile it.
    compileTransactionMessage,

    // Convert the compiled message into a byte array.
    getCompiledTransactionMessageEncoder().encode,

    // Encode that byte array as a base64 string.
    getBase64Decoder().decode,
  ) as TransactionMessageBytesBase64;

  const transactionCost = await rpc
    .getFeeForMessage(base64EncodedMessage)
    .send();

  console.log(
    "Transaction is estimated to cost " + transactionCost.value + " lamports",
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
  // Transaction is estimated to consume 6236 compute units
  // Transaction is estimated to cost 5032 lamports
}

calculateCost("Hello, Fees!");
```

</Tab>
<Tab value="web3.js v1">

```typescript filename="calculate-cost.ts {108-111}"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Message,
  SystemProgram,
  SYSTEM_INSTRUCTION_LAYOUTS,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";

(async () => {
  // Connect to cluster
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const payer = Keypair.generate();
  const recipient = Keypair.generate();

  const type = SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
  const data = Buffer.alloc(type.layout.span);
  const layoutFields = Object.assign({ instruction: type.index });
  type.layout.encode(layoutFields, data);

  const recentBlockhash = await connection.getLatestBlockhash();

  const messageParams = {
    accountKeys: [
      payer.publicKey.toString(),
      recipient.publicKey.toString(),
      SystemProgram.programId.toString(),
    ],
    header: {
      numReadonlySignedAccounts: 0,
      numReadonlyUnsignedAccounts: 1,
      numRequiredSignatures: 1,
    },
    instructions: [
      {
        accounts: [0, 1],
        data: bs58.encode(data),
        programIdIndex: 2,
      },
    ],
    recentBlockhash: recentBlockhash.blockhash,
  };

  const message = new Message(messageParams);

  const fees = await connection.getFeeForMessage(message);
  console.log(`Estimated SOL transfer cost: ${fees.value} lamports`);
  // Estimated SOL transfer cost: 5000 lamports
})();
```

</Tab>

</Tabs>
