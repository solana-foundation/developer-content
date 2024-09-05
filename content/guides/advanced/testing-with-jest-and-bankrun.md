---
featured: false
date: 2024-08-08T00:00:00Z
difficulty: intermediate
title: "Speed up Solana program tests with Jest and Bankrun"
description:
  "Testing programs is important. Bankrun offers a lightweight alternative to
  the local validator for testing Solana programs and enables features like
  custom account data and time travel. Tests can be up to 10 times faster using
  bankrun."
tags:
  - typescript
  - testing
keywords:
  - tutorial
  - testing
  - bankrun
  - jest
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
---

Testing your Solana programs is a critical part of the development process to
ensure that your program behaves as expected and can even speedup your
development. This guide will walk you through how you can test your Solana
programs using [Bankrun](https://kevinheavey.github.io/solana-bankrun/), a super
fast test runner for Solana programs. .

Most Solana tests use the [Mocha framework](https://mochajs.org/) for writing
the tests and [Chai](https://www.chaijs.com/) for assertions. However, you can
use any testing framework that you are comfortable with. In this guide we will
have a look at [Jest](https://jestjs.io/) and
[Bankrun](https://kevinheavey.github.io/solana-bankrun/). With Bankrun, you can
accelerate your tests by almost 10x, gain the ability to modify program time,
and write custom account data.

## Presets

There are a few presets that will set you up with a basic testing environment
for your Solana programs. These presets are for example:

```bash
npx create-solana-dapp my-dapp
```

`create-solana-dapp` will set you up with a Solana web project with various
configuration options, including a Next.js or React client, the Tailwind UI
Library, and a simple Anchor program. The tests are written using Jest and can
be run with the `anchor test` command.

```bash
npx create-solana-game my-game
```

`create-solana-game` will set you up with a Solana game project that includes
[Jest](https://jestjs.io/), [Mocha](https://mochajs.org/) and
[Bankrun](https://kevinheavey.github.io/solana-bankrun/) tests and a NextJS app
app and an additional Unity Game engine client using Solana Wallet adapter. The
Mocha and Bankrun tests can both be run using the `anchor test` command.

You can also find many test examples in the
[Solana Program Examples](https://github.com/solana-developers/program-examples).

## Anchor test

Using the Anchor framework, you can run `anchor test` command to perform the
pre-configured `test` command within the `anchor.toml` file.

```toml filename="Anchor.toml"
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

This will run the tests in the tests directory using the `ts-mocha` command with
a timeout of 1,000,000 milliseconds.

What anchor does here is that it starts up a local validator, deploys the
program from your anchor workspace and runs the test against the defined network
in the `Anchor.toml`.

> Tip: You can also run `anchor test --detach` to let the validator continue
> running after the tests have finished which lets you inspect your transactions
> in the [Solana Explorer](https://explorer.solana.com/?cluster=custom).

You can also define your own test command in the `anchor.toml` file. For example
you can first run the mocha tests against the local validator and then run the
jest tests using bankrun by combining them using `&&`:

```toml filename="Anchor.toml"
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts && yarn run jest"
```

This would run the mocha tests first and then run the jest tests.

You can also define your own test command. For example:

```toml filename="Anchor.toml"
super_test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 only_super_test.ts"
jest_tests = "yarn test"
```

These you would then run using:

```bash
anchor run super_test
anchor run jest_tests
```

> Note though that in this case anchor does not start a local validator for you.
> So you will need to deploy the program yourself to your local cluster or run
> them against a public test network. Also Anchor environment variables will
> only be available when run trough the `anchor test` commands not when running
> tests with `yarn test` for example.

## Migrating from Mocha to Jest

In this part we will learn how to migrate from [Mocha](https://mochajs.org/) to
[Jest](https://jestjs.io/). Jest is another Javascript testing framework similar
to Mocha. It already has an integrated test runner so you don't need to use Chai
anymore.

First you need to install Jest:

```bash
yarn add --dev jest
```

Then you add a new command to your `package.json`:

```json filename="package.json"
{
  "scripts": {
    "test": "jest"
  }
}
```

Then you can run the tests with:

```bash
yarn test
```

Since we want to run our tests with Typescript we need to install the `ts-jest`
package and also create a Jest configuration file:

```bash
yarn add --dev ts-jest @jest/globals @types/jest
yarn ts-jest config:init
```

This will create a `jest.config.js` file in your project. Now you can update
your `Anchor.toml` file to run the Jest tests:

```toml filename="Anchor.toml"
test = "yarn test"
```

### Jest Troubleshooting

1. In case you get a
   `SyntaxError: Cannot use import statement outside a module`  
   error, you either did not create a jest config or you need to add the  
   following to your `jest.config.js` file:

```js filename="jest.config.js"
module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
```

2. Since running tests against the local validator can take quite some time, if
   you get an error saying that you can not log after the test is finished your
   test is probably timing out. Different from Mocha, Jest does not have a
   default timeout. You can set a timeout in your `jest.config.js` file:

```js filename="jest.config.js"
module.exports = {
  testTimeout: 10000,
};
```

Or you can set a timeout for a single test:

```js filename="your.test.js"
test("test name", async () => {
  // your test code
}, 10000);
```

3. If you get an error saying that Anchor environment variables are missing you
   are probably trying to use the AnchorProvider without running the tests
   through `anchor test` or `anchor run test`. Just update your Anchor.toml to
   run the Jest tests `yarn test` to run them in the anchor environment with all
   the environment variables set.

## Bankrun

Instead of using `solana-test-validator` you can also use
[Solana Bankrun](https://kevinheavey.github.io/solana-bankrun/). It acts
similarly to the local validator but is more lightweight and faster. Some really
helpful features are
[writing custom account data](https://kevinheavey.github.io/solana-bankrun/tutorial/#writing-arbitrary-accounts)
and
[time travel](https://kevinheavey.github.io/solana-bankrun/tutorial/#time-travel)
which makes it much easier to test time based programs and programs that rely on
specific account data.

To use Bankrun and Bankrun Anchor you need to add it to your `package.json`:

```bash
yarn add solana-bankrun anchor-bankrun
```

To switch from a Mocha Anchor test to a
[Bankrun Anchor](https://github.com/kevinheavey/anchor-bankrun) test you only
need to change the provider to be a
[`BankrunProvider`](https://kevinheavey.github.io/solana-bankrun/tutorial/#anchor-integration)
and create a context using `startAnchor` within each of your test files:

```js filename="my-test.test.ts" /startAnchor/
// ... imports here
describe('My test', () => {
  test('Test allocate counter + increment tx', async () => {
    const context = await startAnchor(".", [], []);
    const client = context.banksClient;

    const provider = new BankrunProvider(context);
    anchor.setProvider(provider);

    // ... testing logic
  }
}
```

`startAnchor` will automatically add your program from your Anchor workspace to
the Bankrun bank. You can also
[add additional accounts and programs](https://kevinheavey.github.io/solana-bankrun/tutorial/#writing-arbitrary-accounts)
to the bank by passing them in the `startAnchor` function. There are a few
things that are different to running tests against the local validator though
which we will cover in the next section.

### Bankrun differences to the local validator

Bankrun uses a BanksServer (a simplified version of
[Solana's bank](https://github.com/solana-labs/solana/blob/master/runtime/src/bank.rs)
that processes transactions and manages accounts) and a BanksClient to simulate
the Solana network, enabling advanced testing features like time manipulation
and dynamic account data setting. Unlike the `solana-test-validator`, bankrun
allows efficient testing by running against a local instance of the network
state, making it ideal for testing Solana programs without the overhead of a
full validator. The behaviour for transactions is pretty similar, but there are
a few differences to the local validator:

#### Airdrops

- Bankrun does not support Airdrops. The standard signer used in the
  BankrunProvider will be automatically funded with some Sol. If you need
  another funded account you can create one by passing in an additional account
  in the `startAnchor` function.

```js
let secondKeypair: Keypair = new anchor.web3.Keypair();

context = await startAnchor(
    "",[],
    [
    {
        address: secondKeypair.publicKey,
        info: {
        lamports: 1_000_000_000, // 1 SOL equivalent
        data: Buffer.alloc(0),
        owner: SYSTEM_PROGRAM_ID,
        executable: false,
        },
    },
    ]
);
provider = new BankrunProvider(context);
```

#### Confirming transactions

Since Bankrun is directly working on the bank you will not need to confirm your
transactions. So the `connection.confirmTransaction()` function will not be
available. You can just leave it out.

#### Getting account data

While you can still use `connection.getAccount` to retrieve account data, the
preferred method in the bankrun framework is to use `client.getAccount`, which
returns a `Promise<Account>`. This method aligns better with the testing
framework's design. However, if you prefer consistency with how accounts are
retrieved in the rest of your Solana codebase, you can continue using
connection.getAccount. Choose the method that best fits your specific use case.

```js
await client.getAccount(playerPDA).then(info => {
  const decoded = program.coder.accounts.decode(
    "playerData",
    Buffer.from(info.data),
  );
  console.log("Player account info", JSON.stringify(decoded));
  expect(decoded).toBeDefined();
  expect(parseInt(decoded.energy)).toEqual(99);
});
```

#### Signing transactions with another keypair

By default when using `program.function.rpc()` the transaction will be
automatically signed with the `provider.wallet` keypair. If you want to sign the
transaction with another keypair you can create a second provider and then use
that one to sign transaction with another keypair.

```js
let secondKeypair: Keypair = new anchor.web3.Keypair();

let context = await startAnchor(
"",[],
[
    {
        address: secondKeypair.publicKey,
        info: {
        lamports: 1_000_000_000,
        data: Buffer.alloc(0),
        owner: SYSTEM_PROGRAM_ID,
        executable: false,
        },
    },
    ]
);
beneficiaryProvider = new BankrunProvider(context);
beneficiaryProvider.wallet = new NodeWallet(secondKeypair);

secondProgram = new Program<Vesting>(IDL as Vesting, beneficiaryProvider);
```

### Using Bankrun for native programs

You can also use Bankrun for
[native programs](/content/guides/getstarted/intro-to-native-rust.md). The main
difference is that you use `start` instead of `startAnchor` to start the Bankrun
bank. You can then use the `client` to interact with the bank.

```js
const context = await start(
  [{ name: "counter_solana_native", programId: PROGRAM_ID }],
  [],
);
const client = context.banksClient;
```

Instead of using `program.instruction().rpc()` you can use the
`await client.processTransaction(tx)`.

In the Solana program examples you can find a
[full native Bankrun example](https://github.com/solana-developers/program-examples/blob/main/basics/counter/native/tests/counter.test.ts).

### Bankrun trouble shooting

1. If you encounter an `Unknown action 'undefined'` error when sending a
   transaction using Bankrun, you are likely trying to send two identical
   transactions with the same blockhash. Request a new recent blockhash before
   sending the second transaction or add some seed or parameter to your
   instructions to make sure they will result in different transaction hashes.

2. If you encounter `Clock handle timeout` error you can just restart your
   terminal and run the tests again.

## Conclusion

Testing your Solana programs is essential for ensuring they behave as expected.
Bankrun offers a lightweight and fast alternative to the local validator, making
your tests up to 10 times faster. It enables powerful features like custom
account data and time travel, which can significantly enhance your testing
capabilities. Additionally, Jest is a great alternative to Mocha for writing
tests and can be easily integrated with Bankrun.

However, it's important to note a few disadvantages of using Bankrun compared to
the local validator:

1. Environment Representation: Tests run with Bankrun may not fully represent a
   live or testnet environment.
2. Code Reusability: Some code used in local validator tests might not be
   reusable with Bankrun.
3. Dependency: Using Bankrun and Bankrun Anchor introduces dependencies specific
   to these tools.

Despite these drawbacks, Bankrun is a valuable tool that can greatly improve
your development workflow.
