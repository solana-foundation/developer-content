---
title: How to Generate a Keypair with Mnemonics
sidebarSortOrder: 4
---

One way to generate a Keypair is through the use of a Mnemonic. Mnemonics are
generally used to make the user experience within wallets better than a Keypair
file.

```typescript filename="generate-mnemonic.ts"
import * as bip39 from "bip39";

const mnemonic = bip39.generateMnemonic();
```
