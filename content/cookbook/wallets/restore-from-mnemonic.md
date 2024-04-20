---
title: How to Restore a Keypair from a Mnemonic
sidebarSortOrder: 5
description: "Learn how to restore keypairs from a mnemonic on Solana"
---

Many wallet extensions use mnemonics to represent their secret keys. You can
convert the mnemonic to Keypairs for local testing.

## Restoring BIP39 format mnemonics

```typescript filename="restore-bip39-mnemonic.ts"
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";

(async () => {
  const mnemonic =
    "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";
  const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
  const keypair = Keypair.fromSeed(seed.slice(0, 32));
  console.log(`${keypair.publicKey.toBase58()}`); // 5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG
})();
```

## Restoring BIP44 formant mnemonics

```typescript filename="restore-bip44-mnemonic.ts"
import { Keypair } from "@solana/web3.js";
import { HDKey } from "micro-ed25519-hdkey";
import * as bip39 from "bip39";

(async () => {
  const mnemonic =
    "neither lonely flavor argue grass remind eye tag avocado spot unusual intact";
  const seed = bip39.mnemonicToSeedSync(mnemonic, ""); // (mnemonic, password)
  const hd = HDKey.fromMasterSeed(seed.toString("hex"));
  for (let i = 0; i < 10; i++) {
    const path = `m/44'/501'/${i}'/0'`;
    const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
    console.log(`${path} => ${keypair.publicKey.toBase58()}`);
  }
})();
```
