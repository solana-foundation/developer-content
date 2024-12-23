---
title: Offline Transactions
sidebarSortOrder: 7
description: Learn how to create and sign transactions offline.
---

## Sign Transaction

To create an offline transaction, you have to sign the transaction and then
anyone can broadcast it on the network.

```typescript filename="sign-transaction.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Message,
} from "@solana/web3.js";
import * as nacl from "tweetnacl";
import * as bs58 from "bs58";

// to complete a offline transaction, I will separate them into four steps
// 1. Create Transaction
// 2. Sign Transaction
// 3. Recover Transaction
// 4. Send Transaction

(async () => {
  // create connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // create a example tx, alice transfer to bob and feePayer is `feePayer`
  // alice and feePayer are signer in this tx
  const feePayer = Keypair.generate();
  await connection.confirmTransaction(
    await connection.requestAirdrop(feePayer.publicKey, LAMPORTS_PER_SOL),
  );
  const alice = Keypair.generate();
  await connection.confirmTransaction(
    await connection.requestAirdrop(alice.publicKey, LAMPORTS_PER_SOL),
  );
  const bob = Keypair.generate();

  // 1. Create Transaction
  let tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: alice.publicKey,
      toPubkey: bob.publicKey,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    }),
  );
  tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  tx.feePayer = feePayer.publicKey;
  let realDataNeedToSign = tx.serializeMessage(); // the real data singer need to sign.

  // 2. Sign Transaction
  // use any lib you like, the main idea is to use ed25519 to sign it.
  // the return signature should be 64 bytes.
  let feePayerSignature = nacl.sign.detached(
    realDataNeedToSign,
    feePayer.secretKey,
  );
  let aliceSignature = nacl.sign.detached(realDataNeedToSign, alice.secretKey);

  // 3. Recover Transaction

  // you can verify signatures before you recovering the transaction
  let verifyFeePayerSignatureResult = nacl.sign.detached.verify(
    realDataNeedToSign,
    feePayerSignature,
    feePayer.publicKey.toBytes(), // you should use the raw pubkey (32 bytes) to verify
  );
  console.log(`verify feePayer signature: ${verifyFeePayerSignatureResult}`);

  let verifyAliceSignatureResult = nacl.sign.detached.verify(
    realDataNeedToSign,
    aliceSignature,
    alice.publicKey.toBytes(),
  );
  console.log(`verify alice signature: ${verifyAliceSignatureResult}`);

  // there are two ways you can recover the tx
  // 3.a Recover Transaction (use populate then addSignature)
  {
    let recoverTx = Transaction.populate(Message.from(realDataNeedToSign));
    recoverTx.addSignature(feePayer.publicKey, Buffer.from(feePayerSignature));
    recoverTx.addSignature(alice.publicKey, Buffer.from(aliceSignature));

    // 4. Send transaction
    console.log(
      `txhash: ${await connection.sendRawTransaction(recoverTx.serialize())}`,
    );
  }

  // or

  // 3.b. Recover Transaction (use populate with signature)
  {
    let recoverTx = Transaction.populate(Message.from(realDataNeedToSign), [
      bs58.encode(feePayerSignature),
      bs58.encode(aliceSignature),
    ]);

    // 4. Send transaction
    console.log(
      `txhash: ${await connection.sendRawTransaction(recoverTx.serialize())}`,
    );
  }

  // if this process takes too long, your recent blockhash will expire (after 150 blocks).
  // you can use `durable nonce` to get rid of it.
})();
```

## Partial Sign Transaction

When a transaction requires multiple signatures, you can partially sign it. The
other signers can then sign and broadcast it on the network.

Some examples of when this is useful:

- Send an SPL token in return for payment
- Sign a transaction so that you can later verify its authenticity
- Call custom programs in a transaction that require your signature

In this example Bob sends Alice an SPL token in return for her payment:

```typescript filename="partial-sign-transaction.ts"
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  getMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import base58 from "bs58";

/* The transaction:
 * - sends 0.01 SOL from Alice to Bob
 * - sends 1 token from Bob to Alice
 * - is partially signed by Bob, so Alice can approve + send it
 */

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alicePublicKey = new PublicKey(
    "5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8",
  );
  const bobKeypair = Keypair.fromSecretKey(
    base58.decode(
      "4NMwxzmYj2uvHuq8xoqhY8RXg63KSVJM1DXkpbmkUY7YQWuoyQgFnnzn6yo3CMnqZasnNPNuAT2TLwQsCaKkUddp",
    ),
  );
  const tokenAddress = new PublicKey(
    "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
  );
  const bobTokenAddress = await getAssociatedTokenAddress(
    tokenAddress,
    bobKeypair.publicKey,
  );

  // Alice may not have a token account, so Bob creates one if not
  const aliceTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    bobKeypair, // Bob pays the fee to create it
    tokenAddress, // which token the account is for
    alicePublicKey, // who the token account is for
  );

  // Get the details about the token mint
  const tokenMint = await getMint(connection, tokenAddress);

  // Get a recent blockhash to include in the transaction
  const { blockhash } = await connection.getLatestBlockhash("finalized");

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    // Alice pays the transaction fee
    feePayer: alicePublicKey,
  });

  // Transfer 0.01 SOL from Alice -> Bob
  transaction.add(
    SystemProgram.transfer({
      fromPubkey: alicePublicKey,
      toPubkey: bobKeypair.publicKey,
      lamports: 0.01 * LAMPORTS_PER_SOL,
    }),
  );

  // Transfer 1 token from Bob -> Alice
  transaction.add(
    createTransferCheckedInstruction(
      bobTokenAddress, // source
      tokenAddress, // mint
      aliceTokenAccount.address, // destination
      bobKeypair.publicKey, // owner of source account
      1 * 10 ** tokenMint.decimals, // amount to transfer
      tokenMint.decimals, // decimals of token
    ),
  );

  // Partial sign as Bob
  transaction.partialSign(bobKeypair);

  // Serialize the transaction and convert to base64 to return it
  const serializedTransaction = transaction.serialize({
    // We will need Alice to deserialize and sign the transaction
    requireAllSignatures: false,
  });
  const transactionBase64 = serializedTransaction.toString("base64");
  return transactionBase64;

  // The caller of this can convert it back to a transaction object:
  const recoveredTransaction = Transaction.from(
    Buffer.from(transactionBase64, "base64"),
  );
})();
```

## Durable Nonce

`recentBlockhash` is an important value for a transaction. Your transaction
will  
be rejected if you use an expired blockhash (older than 150 blocks). Instead of
a recent blockhash, you can use a durable nonce, which never expires. To use a
durable nonce, your transaction must:

1. use a `nonce` stored in `nonce account` as a recent blockhash
2. put `nonce advance` operation in the first instruction

### Create Nonce Account

```typescript filename="create-nonce-account.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  NONCE_ACCOUNT_LENGTH,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

(async () => {
  // Setup our connection and wallet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const feePayer = Keypair.generate();

  // Fund our wallet with 1 SOL
  const airdropSignature = await connection.requestAirdrop(
    feePayer.publicKey,
    LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(airdropSignature);

  // you can use any keypair as nonce account authority,
  // this uses the default Solana keypair file (id.json) as the nonce account authority
  const nonceAccountAuth = await getKeypairFromFile();

  let nonceAccount = Keypair.generate();
  console.log(`nonce account: ${nonceAccount.publicKey.toBase58()}`);

  let tx = new Transaction().add(
    // create nonce account
    SystemProgram.createAccount({
      fromPubkey: feePayer.publicKey,
      newAccountPubkey: nonceAccount.publicKey,
      lamports:
        await connection.getMinimumBalanceForRentExemption(
          NONCE_ACCOUNT_LENGTH,
        ),
      space: NONCE_ACCOUNT_LENGTH,
      programId: SystemProgram.programId,
    }),
    // init nonce account
    SystemProgram.nonceInitialize({
      noncePubkey: nonceAccount.publicKey, // nonce account pubkey
      authorizedPubkey: nonceAccountAuth.publicKey, // nonce account authority (for advance and close)
    }),
  );

  console.log(
    `txhash: ${await sendAndConfirmTransaction(connection, tx, [feePayer, nonceAccount])}`,
  );
})();
```

### Get Nonce Account

```typescript filename="get-nonce-account.ts"
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  NonceAccount,
} from "@solana/web3.js";

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const nonceAccountPubkey = new PublicKey(
    "7H18z3v3rZEoKiwY3kh8DLn9eFT6nFCQ2m4kiC7RZ3a4",
  );

  let accountInfo = await connection.getAccountInfo(nonceAccountPubkey);
  let nonceAccount = NonceAccount.fromAccountData(accountInfo.data);
  console.log(`nonce: ${nonceAccount.nonce}`);
  console.log(`authority: ${nonceAccount.authorizedPubkey.toBase58()}`);
  console.log(`fee calculator: ${JSON.stringify(nonceAccount.feeCalculator)}`);
})();
```

### Use Nonce Account

```typescript filename="use-nonce-account.ts"
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  NonceAccount,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import * as bs58 from "bs58";
import { getKeypairFromFile } from "@solana-developers/helpers";

(async () => {
  // Setup our connection and wallet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const feePayer = Keypair.generate();

  // Fund our wallet with 1 SOL
  const airdropSignature = await connection.requestAirdrop(
    feePayer.publicKey,
    LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(airdropSignature);

  // you can use any keypair as nonce account authority,
  // but nonceAccountAuth must be the same as the one used in nonce account creation
  // load default solana keypair for nonce account authority
  const nonceAccountAuth = await getKeypairFromFile();

  const nonceAccountPubkey = new PublicKey(
    "7H18z3v3rZEoKiwY3kh8DLn9eFT6nFCQ2m4kiC7RZ3a4",
  );
  let nonceAccountInfo = await connection.getAccountInfo(nonceAccountPubkey);
  let nonceAccount = NonceAccount.fromAccountData(nonceAccountInfo.data);

  let tx = new Transaction().add(
    // nonce advance must be the first instruction
    SystemProgram.nonceAdvance({
      noncePubkey: nonceAccountPubkey,
      authorizedPubkey: nonceAccountAuth.publicKey,
    }),
    // after that, you do what you really want to do, here we append a transfer instruction as an example.
    SystemProgram.transfer({
      fromPubkey: feePayer.publicKey,
      toPubkey: nonceAccountAuth.publicKey,
      lamports: 1,
    }),
  );
  // assign `nonce` as recentBlockhash
  tx.recentBlockhash = nonceAccount.nonce;
  tx.feePayer = feePayer.publicKey;
  tx.sign(
    feePayer,
    nonceAccountAuth,
  ); /* fee payer + nonce account authority + ... */

  console.log(`txhash: ${await connection.sendRawTransaction(tx.serialize())}`);
})();
```
