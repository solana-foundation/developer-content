---
title: Solana Fuzz Tester
sidebarSortOrder: 1
sidebarLabel: Fuzz Tester
---

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
