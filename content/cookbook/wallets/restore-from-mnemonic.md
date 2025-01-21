---
title: How to Restore a Keypair from a Mnemonic
sidebarSortOrder: 5
description: "Learn how to restore keypairs from a mnemonic on Solana"
---

Many wallet extensions use mnemonics to represent their secret keys. You can
convert the mnemonic to Keypairs for local testing.

## Restoring BIP39 format mnemonics

```typescript filename="restore-bip39-mnemonic.ts" file=/code/content/web3jsv1/cookbook/wallets/restore-bip39-mnemonic.ts#L1-L11
import { Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";

const mnemonic =
  "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";

// arguments: (mnemonic, password)
const seed = bip39.mnemonicToSeedSync(mnemonic, "");
const keypair = Keypair.fromSeed(seed.slice(0, 32));

console.log(`${keypair.publicKey.toBase58()}`);
```

## Restoring BIP44 formant mnemonics

```typescript filename="restore-bip44-mnemonic.ts" file=/code/content/web3jsv1/cookbook/wallets/restore-bip44-mnemonic.ts#L1-L3,L11-L27
import { Keypair } from "@solana/web3.js";
import { HDKey } from "micro-key-producer/slip10.js";
import * as bip39 from "bip39";
const mnemonic =
  "neither lonely flavor argue grass remind eye tag avocado spot unusual intact";

const seed = bip39.mnemonicToSeedSync(mnemonic, "");
const hd = HDKey.fromMasterSeed(seed.toString("hex"));

const wallets: Wallet[] = [];

for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
  wallets.push({
    path,
    keypair,
    publicKey: keypair.publicKey.toBase58(),
  });
}
```
