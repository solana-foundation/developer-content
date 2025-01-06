---
title: Web App with a Smart Contract Connection
sidebarSortOrder: 5
sidebarLabel: Web App
---

## Web App Scaffold

```shell
npx create-solana-dapp
```

This command generates a new project that connects a Solana smart contract to a
frontend with a wallet connector.

For additional information, check out its
[README](https://github.com/solana-developers/create-solana-dapp).

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
