---
title: Test Suite
---

Within the Solana toolkit, there are several resources for testing Solana Smart
Contracts, including:

- A fuzz tester
- A code coverage tool
- A framework for testing Solana programs in NodeJS that spins up a lightweight
  `BanksServer` that's like an RPC node but much faster and creates a
  `BanksClient` to talk to the server.
- A fast and lightweight library for testing Solana programs in Rust, which
  works by creating an in-process Solana VM optimized for program developers.
- A tool to scan your repo for common security vulnerabilities and provide
  suggestions for fixes.

### Testing Basics

Sync all the program's key. If you're using an Anchor program:

```shell
anchor keys sync
```

Build the smart contract:

```shell
npx solana build
```

Test the smart contract:

```shell
npx solana test
```

Deploy the smart contract:

```shell
npx solana deploy
```

If deploying to localnet, you must first start your local validator:

```shell
solana-test-validator
```

For more information on local validator customization and commands, read the
[Solana Test Validator Guide](https://solana.com/developers/guides/getstarted/solana-test-validator).

### Fuzz Tester

Generate fuzz tests:

```shell
npx solana fuzz
```

This command will initialize a Trident workspace and generate a new Fuzz Test
Template:

```shell
project-root
├── trident-tests
│   ├── fuzz_tests # fuzz tests folder
│   │   ├── fuzz_0 # particular fuzz test
│   │   │   ├── test_fuzz.rs # the binary target of your fuzz test
│   │   │   └── fuzz_instructions.rs # the definition of your fuzz test
│   │   ├── fuzz_1
│   │   ├── fuzz_X # possible multiple fuzz tests
│   │   ├── fuzzing # compilations and crashes folder
│   │   └── Cargo.toml
├── Trident.toml
└── ...
```

Run fuzz tests:

```shell
npx solana fuzz run
```

The output of the fuzz tests is as follows:

1. Number of Fuzzing Iterations.
2. Feedback Driven Mode = Honggfuzz generates data based on the feedback (i.e.
   feedback based on Coverage progress).
3. Average Iterations per second.
4. Number of crashes it found (panics or failed invariant checks).

```shell
------------------------[  0 days 00 hrs 00 mins 01 secs ]----------------------
  Iterations : 688 (out of: 1000 [68%]) # -- 1. --
  Mode [3/3] : Feedback Driven Mode # -- 2. --
      Target : trident-tests/fuzz_tests/fuzzing.....wn-linux-gnu/release/fuzz_0
     Threads : 16, CPUs: 32, CPU%: 1262% [39%/CPU]
       Speed : 680/sec [avg: 688] # -- 3. --
     Crashes : 1 [unique: 1, blocklist: 0, verified: 0] # -- 4. --
    Timeouts : 0 [10 sec]
 Corpus Size : 98, max: 1048576 bytes, init: 0 files
  Cov Update : 0 days 00 hrs 00 mins 00 secs ago
    Coverage : edge: 10345/882951 [1%] pc: 163 cmp: 622547
---------------------------------- [ LOGS ] ------------------/ honggfuzz 2.6 /-
```

View the source code [here](https://github.com/Ackee-Blockchain/trident).

### Code Coverage Tool

```shell
mucho coverage
```

This command will run a code coverage test on all of your Rust tests and then
generate report in an HTML page with in depth metrics on where additional code
may be needed to improve your current code coverage.

Note: So far, this tool only works on tests written in Rust and is not
compatible with a JavaScript test suite.

View the source code
[here](https://github.com/LimeChain/zest?tab=readme-ov-file).

### JavaScript Testing Framework

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

### Rust Testing Library

```shell
cargo add --dev litesvm
```

[LiteSVM](https://github.com/LiteSVM/litesvm) is a fast and lightweight library
for testing Solana programs. It works by creating an in-process Solana VM
optimized for program developers. This makes it much faster to run and compile
than alternatives like solana-program-test and solana-test-validator. In a
further break from tradition, it has an ergonomic API with sane defaults and
extensive configurability for those who want it.

Here is a minimal example:

```rust
use litesvm::LiteSVM;
use solana_program::{message::Message, pubkey::Pubkey, system_instruction::transfer};
use solana_sdk::{signature::Keypair, signer::Signer, transaction::Transaction};

let from_keypair = Keypair::new();
let from = from_keypair.pubkey();
let to = Pubkey::new_unique();

let mut svm = LiteSVM::new();
svm.airdrop(&from, 10_000).unwrap();

let instruction = transfer(&from, &to, 64);
let tx = Transaction::new(
    &[&from_keypair],
    Message::new(&[instruction], Some(&from)),
    svm.latest_blockhash(),
);
let tx_res = svm.send_transaction(tx).unwrap();

let from_account = svm.get_account(&from);
let to_account = svm.get_account(&to);
assert_eq!(from_account.unwrap().lamports, 4936);
assert_eq!(to_account.unwrap().lamports, 64);

```

### Security Vulnerability Scanner

[Radar](https://github.com/Auditware/radar?tab=readme-ov-file) is static
analysis tool for anchor rust programs. It allows you to write, share, and
utilize templates to identify security issues in rust-based smart contracts
using a powerful python based rule engine that enables automating detection of
vulnerable code patterns through logical expressions.

[Xray](https://github.com/sec3-product/x-ray) is an open-source, cross-platform
command-line interface (CLI) tool designed for static analysis of Solana
programs and smart contracts written in Rust.
