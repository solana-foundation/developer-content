---
title: How to Get All Token Accounts by Authority
sidebarSortOrder: 14
description:
  "Learn how to retrieve Solana token accounts by owner, including all accounts
  or filtered by mint."
---

You can fetch token accounts by owner. There are two ways to do it.

1. Get All Token Account

```typescript filename="get-token-account-by-owner-all.ts"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

(async () => {
  // connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const owner = new PublicKey("G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY");
  let response = await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  });

  response.value.forEach(accountInfo => {
    console.log(`pubkey: ${accountInfo.pubkey.toBase58()}`);
    console.log(`mint: ${accountInfo.account.data["parsed"]["info"]["mint"]}`);
    console.log(
      `owner: ${accountInfo.account.data["parsed"]["info"]["owner"]}`,
    );
    console.log(
      `decimals: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["decimals"]}`,
    );
    console.log(
      `amount: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]}`,
    );
    console.log("====================");
  });
})();
```

2. Filter By Mint

```typescript filename="get-account-by-owner-by-mint.ts"
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

(async () => {
  // connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const owner = new PublicKey("G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY");
  const mint = new PublicKey("54dQ8cfHsW1YfKYpmdVZhWpb9iSi6Pac82Nf7sg3bVb");

  let response = await connection.getParsedTokenAccountsByOwner(owner, {
    mint: mint,
  });

  response.value.forEach(accountInfo => {
    console.log(`pubkey: ${accountInfo.pubkey.toBase58()}`);
    console.log(`mint: ${accountInfo.account.data["parsed"]["info"]["mint"]}`);
    console.log(
      `owner: ${accountInfo.account.data["parsed"]["info"]["owner"]}`,
    );
    console.log(
      `decimals: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["decimals"]}`,
    );
    console.log(
      `amount: ${accountInfo.account.data["parsed"]["info"]["tokenAmount"]["amount"]}`,
    );
    console.log("====================");
  });
})();
```
