---
title: How to Create an Account
sidebarSortOrder: 1
description:
  "Accounts are the basic building blocks of anything on Solana. Learn how to
  create accounts on the Solana blockchain."
---

Creating an account requires using the System Program `createAccount`
instruction. The Solana runtime will grant the owner program of an account,
access to write to its data or transfer lamports. When creating an account, we
have to preallocate a fixed storage space in bytes (space) and enough lamports
to cover the rent.

<Tabs groupId="language" items={['web3.js v2', 'web3.js v1']}>

<Tab value="web3.js v2">

```typescript filename="create-account.ts"
import {
  pipe,
  createSolanaRpc,
  appendTransactionMessageInstructions,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/web3.js";
import { getSetComputeUnitPriceInstruction } from "@solana-program/compute-budget";
import {
  getCreateAccountInstruction,
  SYSTEM_PROGRAM_ADDRESS,
} from "@solana-program/system";

const rpc = createSolanaRpc("https://api.devnet.solana.com");
const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
  rpc,
  rpcSubscriptions,
});

const space = 0n; // any extra space in the account
const rentLamports = await rpc.getMinimumBalanceForRentExemption(space).send();
console.log("Minimum balance for rent exception:", rentLamports);

// todo: load your own signer with SOL
const signer = await generateKeyPairSigner();

// generate a new keypair and address to create
const newAccountKeypair = await generateKeyPairSigner();
console.log("New account address:", newAccountKeypair.address);

const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

const transactionMessage = pipe(
  createTransactionMessage({ version: "legacy" }),
  tx => setTransactionMessageFeePayerSigner(signer, tx),
  tx => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  tx =>
    appendTransactionMessageInstructions(
      [
        // add a priority fee
        getSetComputeUnitPriceInstruction({
          microLamports: 200_000,
        }),
        // create the new account
        getCreateAccountInstruction({
          lamports: rentLamports,
          newAccount: newAccountKeypair,
          payer: signer,
          space: space,
          // "wallet" accounts are owned by the system program
          programAddress: SYSTEM_PROGRAM_ADDRESS,
        }),
      ],
      tx,
    ),
);

const signedTransaction =
  await signTransactionMessageWithSigners(transactionMessage);
const signature = getSignatureFromTransaction(signedTransaction);

await sendAndConfirmTransaction(signedTransaction, {
  commitment: "confirmed",
});
console.log("Signature:", signature);
```

</Tab>

<Tab value="web3.js v1">

```typescript filename="create-account.ts"
import {
  SystemProgram,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
const fromPubkey = Keypair.generate();

// Airdrop SOL for transferring lamports to the created account
const airdropSignature = await connection.requestAirdrop(
  fromPubkey.publicKey,
  LAMPORTS_PER_SOL,
);
await connection.confirmTransaction(airdropSignature);

// amount of space to reserve for the account
const space = 0;

// Seed the created account with lamports for rent exemption
const rentExemptionAmount =
  await connection.getMinimumBalanceForRentExemption(space);

const newAccountPubkey = Keypair.generate();
const createAccountParams = {
  fromPubkey: fromPubkey.publicKey,
  newAccountPubkey: newAccountPubkey.publicKey,
  lamports: rentExemptionAmount,
  space,
  programId: SystemProgram.programId,
};

const createAccountTransaction = new Transaction().add(
  SystemProgram.createAccount(createAccountParams),
);

await sendAndConfirmTransaction(connection, createAccountTransaction, [
  fromPubkey,
  newAccountPubkey,
]);
```

</Tab>

</Tabs>
