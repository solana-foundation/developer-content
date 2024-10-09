---
title: How to get the owner of an NFT
sidebarSortOrder: 17
description:
  "Learn how to get the owner of a non-fungible token (NFT) on Solana."
---

If you have the mint key of an NFT, you can find its current owner by
sneak-peeking at the largest token account for that mint key.

Remember that NFTs have a supply of 1, and they are indivisible, meaning that
only one token account will hold that token at any point in time, whilst all
other token accounts for that mint key will have a balance of 0.

Once the largest token account is identified, we can retrieve its owner.

```typescript filename="get-nft-owner.ts"
import { Connection, PublicKey } from "@solana/web3.js";

(async () => {
  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const tokenMint = "9ARngHhVaCtH5JFieRdSS5Y8cdZk2TMF4tfGSWFB9iSK";

  const largestAccounts = await connection.getTokenLargestAccounts(
    new PublicKey(tokenMint),
  );
  const largestAccountInfo = await connection.getParsedAccountInfo(
    largestAccounts.value[0].address,
  );
  console.log(largestAccountInfo?.value?.data);

  const owner = largestAccountInfo?.value?.data?.parsed.info.owner;
  console.log("NFT owner :", owner);
})();
```
