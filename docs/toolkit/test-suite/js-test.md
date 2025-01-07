---
title: JavaScript Testing Framework
sidebarSortOrder: 3
sidebarLabel: JS Tests
---

> This is a dev dependency, you must `cd` into the directory you want to create
> JavaScript tests in before running the below command.

```shell
npm install solana-bankrun
```

[Bankrun](https://github.com/kevinheavey/solana-bankrun) is a fast and
lightweight framework for testing solana programs in NodeJS.

It uses [solana-program-test](https://crates.io/crates/solana-program-test)
under the hood and allows you to do things that are not possible with
`solana-test-validator`, such as jumping back and forth in time or dynamically
setting account data.

Bankrun works by spinning up a lightweight `BanksServer` that's like an RPC node
but much faster, and creating a `BanksClient` to talk to the server. This runs
the Solana
[Banks](https://github.com/solana-labs/solana/blob/master/runtime/src/bank.rs).

Here is a minimal example of this framework:

```javascript
import { start } from "solana-bankrun";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";

test("one transfer", async () => {
  const context = await start([], []);
  const client = context.banksClient;
  const payer = context.payer;
  const receiver = PublicKey.unique();
  const blockhash = context.lastBlockhash;
  const transferLamports = 1_000_000n;
  const ixs = [
    SystemProgram.transfer({
      fromPubkey: payer.publicKey,
      toPubkey: receiver,
      lamports: transferLamports,
    }),
  ];
  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.add(...ixs);
  tx.sign(payer);
  await client.processTransaction(tx);
  const balanceAfter = await client.getBalance(receiver);
  expect(balanceAfter).toEqual(transferLamports);
});
```

For more complex examples, please refer to the
[Solana Developers Bootcamp](https://github.com/solana-developers/developer-bootcamp-2024/tree/main/project-2-voting/anchor/tests)
