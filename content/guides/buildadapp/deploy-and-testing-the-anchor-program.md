---
date: 2024-02-27
difficulty: intermediate
featured: true
featuredPriority: 1
title: "Deploy and test the Anchor program"
description: "This guide demonstrates how we build, deploy and eventually write some testcases to the program "
tags:
  - Solana Playground
  - Anchor
  - Rust
  - Smart Contract
  - Blockchain Development
keywords:
  - Solana Playground
  - Anchor framework
  - Smart contracts
  - Rust programming
  - Blockchain tutorial
  - Solana development
  - Web3 development
  - Decentralized applications
altRoutes:
  - /developers/guides/creating-heroes-on-solana
  - /developers/tutorials/anchor-browser-development
---

### Deploying the program

You need to have some test SOL to facilitate the deployment of the program. They’re several ways you can get test SOL in your account, but my most recommended way is to use the [official Solana faucet](https://faucet.solana.com/). Paste in your address and airdrop some test SOL.

Now that you have some SOL in the address, we can deploy the contract using the build and deploy tabs on the left side of the playground as shown below.

![build-and-deploy](https://github.com/JovanMwesigwa/solana-developer-content/assets/62109301/5ba2ab01-7d90-4126-b804-f5b0656c679b)

First, we build the the program and confirm we do not have any errors, then finally, we deploy using the deploy button.

Output:

![build-out-put](https://github.com/JovanMwesigwa/solana-developer-content/assets/62109301/fe6c07f5-bf09-4383-87e8-03265d054e4f)

### Testing the program

Now that our program has been deployed to solana devnet, we can now interact with it. The solana playground provides inbuilt test instructions in the browser which can make it easier to test the functions of the program.

![testing-the-program](https://github.com/JovanMwesigwa/solana-developer-content/assets/62109301/6c2e903a-e2bf-47d8-a755-8ebba85cd1e1)

While this can be very easy to test out the program, the most common way is to write your own test using a library like chai, and this is what we're going to use.

The testing section of your Solana smart contract, specifically for a program managing hero data, demonstrates how to use JavaScript and the Anchor framework for writing unit tests. These tests ensure that your smart contract behaves as expected before deployment to a live environment. Let's break down the two test cases provided:

### Testing Retrieval of All Heroes

This test checks whether querying all hero accounts from the deployed Solana program returns a non-empty list, specifically expecting three heroes. This is crucial for verifying that the program correctly stores and retrieves multiple accounts.

```javascript
describe("Heroes", () => {
  it("Should get all heroes by not returning an empty list", async () => {
    const heroes = await pg.program.account.hero.all();
    const heroCount = heroes.length;

    assert(heroCount > 0, "No heroes were found here");
    assert.equal(heroCount, 3, "Heroes number did not match");
  });
```

- `describe` and `it` Functions: These come from the Mocha testing framework, organizing tests into suites and individual test cases.

- **Retrieving All Heroes**: `pg.program.account.hero.all()` asynchronously fetches all hero accounts stored by the program.

- **Assertions**: Using Chai's `assert` method, the test first checks if any heroes exist, then verifies the expected number of heroes is precisely three.

### Testing Retrieval of Specific Hero Data

This test aims to fetch a specific hero, "Batman", by its public key and verify that the retrieved name matches the expected value.

```javascript
it("Should get Batmans data", async () => {
  const batmanData = {
    pubKey: "9UKyKvCMjLeVQ7qAqgYpA6P5Qn5BJkkEJfZWczVfUN5s",
    name: "Batman",
  };

  const hero = await pg.program.account.hero.fetch(batmanData.pubKey);

  assert.equal(batmanData.name, hero.name, "The hero did match");
});
```

- **Fetching a Specific Hero**: `pg.program.account.hero.fetch(batmanData.pubKey)` asynchronously retrieves the hero account associated with `batmanData.pubKey`.

- **Assertion**: Checks if the `name` property of the fetched hero matches "Batman".

### Key Points

- **Global Availability**: The test script mentions that no imports are needed because libraries such as `web3`, `anchor`, and `pg` are globally available in the testing environment. This is typically set up by the Anchor framework's test configuration.

- **Asynchronous Testing**: Each test case uses `async` functions to handle asynchronous calls to the blockchain, which is necessary for fetching account data.

- **Testing Best Practices**: These tests illustrate how to validate both the existence and specific attributes of blockchain-stored data, ensuring that your smart contract's data handling is accurate and reliable.

Output

![test-case-results](https://github.com/JovanMwesigwa/solana-developer-content/assets/62109301/e74ac3f4-f9a4-475e-a363-35516ddda192)

Writing and running these tests are crucial steps in the development process, ensuring your Solana smart contract works as intended and can handle expected inputs and states correctly.

### Conclusion

Developing a Solana smart contract using Rust and the Anchor framework provides a robust and efficient way to build decentralized applications (dApps) on one of the fastest blockchain platforms available.

This article is based on the Build On Solana full tutorial series covered on [decentracode youtube](https://www.youtube.com/playlist?list=PLOYP_hXwmI98jGlDcRWBucm_Zl_2lie-x).
