---
title: Web App with a Smart Contract Connection
sidebarSortOrder: 5
sidebarLabel: Web App
---

> This is a beta version of The Solana Toolkit, and is still a WIP. Please post
> all feedback as a github issue
> [here](https://github.com/solana-foundation/developer-content/issues).

```shell
npx create-solana-dapp
```

This command generates a new project that connects a Solana smart contract to a
frontend with a wallet connector.

## Build and Test

To test out this project before making any modifications, follow these steps:

1. Build the smart contract:

```shell
npm run anchor-build
```

2. Start the local validator:

```shell
npm run anchor-localnet
```

3. Run tests:

```shell
npm run anchor-test
```

4. Deploy to the local validator:

```shell
npm run anchor deploy --provider.cluster localnet
```

5. Build the web app:

```shell
npm run build
```

6. Run the web app:

```shell
npm run dev
```

## Additional Resources

- [Create-solana-dapp README](https://github.com/solana-developers/create-solana-dapp)
- [CRUD App Example](../../../content/guides/dapps/journal.md)
- [Anchor book](https://www.anchor-lang.com/)
- [Getting Started with Anchor](../../programs/anchor/index.md)
- [Program Examples](https://github.com/solana-developers/program-examples)
