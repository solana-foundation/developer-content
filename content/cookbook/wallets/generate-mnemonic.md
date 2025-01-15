---
title: How to Generate Mnemonics for Keypairs
sidebarSortOrder: 4
description:
  "Mnemonics make is easy for users to store their keypair's secret. Learn how
  to use mnemonics on Solana."
---

One way to generate a Keypair is through the use of a Mnemonic. Mnemonics are
generally used to make the user experience within wallets better than a Keypair
file by using a list of readable words (instead of a shorter string of random
numbers and letters).

```typescript filename="generate-mnemonic.ts" file=/code/content/web3jsv1/cookbook/wallets/generate-mnemonic.ts#L1-L3
import * as bip39 from "bip39";

const mnemonic = bip39.generateMnemonic();
```
