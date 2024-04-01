---
date: Apr 01, 2024
difficulty: intro
title: "Integrate solana wallets to your NextJS webapp"
description:
  "This guide will lead you through the process of integrating solana wallets
  with Next.js a React based framework"
tags:
  - local
  - react
  - nextjs
  - next.js 
  - javascript
  - web
  - app
  - wallets
keywords:
  - reactjs
  - javascript
  - nextjs
  - integrate
  - solana
  - wallets
  - wallet adapter
  - web3 developer
altRoutes:
  - /developers/guides/integrate-solana-wallets-nextjs
---

This guide will lead you through the process of integrating solana wallets with
Next.js.

## What you will learn?

- Create a Next.js project
- Installing Wallet Adapter Dependencies
- Setting up Wallet Adapter in your Next.js app
- Connect wallet button
- Use wallet context in other Next.js pages, useConnection and useWallet hooks

## TLDR;

You can use `npx create-solana-dapp@latest` to generate a Solana scaffold with
Solana wallet adapters in Next.JS or react with the anchor program quickly, and
you'll have a fast, ready-to-go production project with Next.JS and Tailwind
CSS.

### 1. Create a Next.js project

Next.js is a React framework for building full-stack web applications. You use
React Components to build user interfaces and Next.js for additional features
and optimizations.

You need to [install Node.js](https://nodejs.org/en/download) in order to create
a Next.js app. We can execute this command, which will create a basic scaffold
for us.

```bash
npx create-next-app@latest
```

It'll ask you questions about the project name, Typescript, ESlint, tailwind
CSS, src directory, using App router, and customising the default import alias;
we are using all the default and recommended options for now.

This is how the directory structure will look like after creating the scaffold.

```
├── src
│   └── app
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
```

### 2. Installing Wallet Adapter Dependencies

Install wallet adapter dependencies. These packages contain essential functions
and react components required to integrate Solana wallets into our next app.

`@solana/wallet-adapter-base` includes functions that detect wallets, sign and
send transactions from your wallet. `@solana/wallet-adapter-react` includes the
functionality to deeply pass wallet connect states and data to children
components giving access to hooks like `useConnection` and `useWallet`.
Similarly`@solana/wallet-adapter-react-ui` has wallet connect/disconnect button
and the wallet selction modal contexts and providers.

Install these packages to your Next.js project using the node package manager.

```
npm install --save \
    @solana/wallet-adapter-base \
    @solana/wallet-adapter-react \
    @solana/wallet-adapter-react-ui \
    @solana/wallet-adapter-wallets \
    @solana/web3.js \
    react
```

### 3. Setting up Wallet Adapter in your Next.js app

This section will help you set up the Next.js app so that we can use all the
wallet features inside all the future pages you create.

Create a components folder and add a file named AppWalletProvider.tsx. We will
export the contents of this file to be used
inside [the root layout file](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#layouts).

Your folder structure should look like this.

```
├── src
│   └── app
│       ├── components
│       │   └── AppWalletProvider.tsx
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
```

Let's discuss all the code blocks we will add to the Inside
AppWalletProvider.tsx file one by one, followed by the whole file content. The
goal of this fill will be to export a context provider as a react component that
will help us “teleport” data and to use or change it within the context of it’s
children components.

The file we are creating will be rendered on the client side, not the server
side, so we should write `"use client"` at the top of the file.

First, we will need to import all the dependencies into the file, including
context providers for wallet adapters like connectionProvider and
WalletProvider. WalletAdapterNetwork is an enum that defines default network
values like 'mainnet-beta', 'testnet', and 'devnet'.

The WalletModalProvider from @solana/wallet-adapter-base has the context of a
wallet connect button. The button helps you toggle the component's visibility.
UnsafeBurnerWalletAdapter is a react component shipped by the Solana team for
testing wallets. Burner Wallet is the default wallet adapter used in the starter
packs. This adapter implements the Wallet Adapter interface but uses an unsafe
local keypair to sign messages.

Earlier there were two ways to implement wallets, either having to implement a
wallet adapter to be shipped. Here’s how you support all these solana wallets
with your app.

1. Wallets
   with [legacy wallet adapters](https://github.com/anza-xyz/wallet-adapter/blob/master/PACKAGES.md#wallets) are
   bundled in an npm package. You can install and import these wallets in the
   Solana web apps to support them. e.g. Burner Wallet, Phantom
2. Wallets with
   [wallet-standard](https://github.com/wallet-standard/wallet-standard)
   implementation. These will be automatically detected
   with`@solana/wallet-adapter-base` e.g. Backpack

Let’s import these dependencies and use them further in the component we are
building.

```jsx
"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
```

Import the CSS required for react components of the wallet adapter.

```jsx
// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");
```

To do that, we set up a network(where to send the transactions), which is
hardcoded here to use "devnet". With that network, we create an RPC endpoint:
the network URL. The third variable is a wallets array, which will hold the
values for imported wallets using the legacy wallet adapter standard.

We pass this endpoint and wallets in `ConnectionProvider` and `WalletProvider`
as props to those providers. `autoConnect` is the setting that tells whether to
have a wallet connected to your Solana app.

`WalletModalProvider` has a component called WalletModal which helps you select
a wallet from a list of available and installed wallets in the environment. This
provider will help that modal toggle visibility in the children components.

```jsx
export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      // new UnsafeBurnerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

That should be enough to have all the providers help us with context in all the
pages and components you build further. Here’s the whole code of the component
we wrote above.

```jsx
// src/app/components/AppWalletProvider.tsx

'use client'

import React, { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export default function AppWalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      // new UnsafeBurnerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

> _Note:_ Only legacy wallets that don’t support mobile wallet adapter needs to
> be added in the `WalletProvider`

Any wallet using
[Solana Wallet Standard](https://github.com/anza-xyz/wallet-standard) or
[Solana Mobile Stack Wallet Adapter](https://www.notion.so/Integrate-solana-wallets-to-your-NextJS-webapp-60e34961b0174982859b4cb9973b2723?pvs=21)
Will be automatically detected.

>

Add this `AppWalletAdapter.tsx` in `layout.tsx` so we can work with wallets
everywhere on different pages and app routes. This allows you to add a wallet
connect button and use the other helpful wallet features all over your app and
pages.

```jsx
// src/app/layout.tsx

import AppWalletProvider from "./components/AppWalletProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppWalletProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </AppWalletProvider>
  );
}
```

Till this step, you will have to set it up exactly as mentioned; after these
steps, you can customise your choices and import components or use wallet hooks
and functionality anywhere you want.

### 4. Connect wallet button

Ideally, you should add this button component to the header component inside the
app's layout so that the wallet component is viewable and accessible to all the
other pages. However, for the simplicity of this guide, we are adding the wallet
connect to the home page.

In your `page.tsx` at the root of your app folder, Import the
`WalletMultiButton` from `@solana/wallet-adapter-react-ui` Then, you can return
that button component from your home page component.

```jsx
// src/app/page.tsx

"use client";

import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="border hover:border-slate-900 rounded">
        <WalletMultiButton style={{}} />
      </div>
    </main>
  );
}
```

Now start your dev server and see the website served in your browser.

```bash
❯ npm run dev

> my-app@0.1.0 dev
> next dev

   ▲ Next.js 14.1.3
   - Local:        http://localhost:3000

 ✓ Ready in 3.1s
```

![Select and Connect Solana Wallets](/assets/guides/integrate-solana-wallets-into-nextjs/connect-solana-wallets.gif)

Here's a demo of how output should look in your browser.

### 5. useWallet and useConnection hooks

Let’s make another page now to demonstrate how you can use the wallet states and
connection object to send or sign transactions, read the wallet balance and test
functionality.

Create a folder inside the app folder and name it address. Create a file
page.tsx inside that folder.

```bash
├── src
│   └── app
│       ├── address
│       │   └── page.tsx
│       ├── components
│       │   └── AppWalletProvider.tsx
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
```

From the `"@solana/wallet-adapter-react"` package, you can import two hooks
named `useWallet` and `useConnection.` that can be used anywhere on the client
side of your app.

The`useWallet` hook has details like `publicKey` and state of the wallet,
whether it’s `connecting` or it’s `connected`.

Solana uses JSON-RPC 2.0 spec which is transport agnostic and can be implemented
over HTTP, HTTPS, WebSocket, TCP, and other transports. This means you can use
`connection` object returned from `useConnection` hook to get
[WebSocket notifications](https://solana.com/docs/rpc/websocket) or
[sending HTTP requests](https://solana.com/docs/rpc/http).

Here's an example of getting devnet sol Airdrop using `connection` and
`publicKey` from `useConnection` and `useWallet` hooks.

This `getAirdropOnClick` gets the latest
[blockhash](https://solana.com/docs/core/transactions/confirmation#what-is-a-blockhash)
using
`[getLatestBlockhash](https://solana.com/docs/rpc/http/getlatestblockhash)` and
the signature from
`[requestAirdrop](https://solana.com/docs/rpc/http/requestairdrop#parameters)`
function in connection object which sends these specific http methods. We can
confirm whether the transaction
was [confirmed](https://solana.com/docs/rpc#configuring-state-commitment) and
added to the block.

```jsx
const { connection } = useConnection();
const { publicKey } = useWallet();

const getAirdropOnClick = async () => {
  try {
    if (!publicKey) {
      throw new Error("Wallet is not Connected");
    }
    const [latestBlockhash, signature] = await Promise.all([
      connection.getLatestBlockhash(),
      connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
    ]);
    const sigresult = await connection.confirmTransaction(
      { signature, ...latestBlockhash },
      "confirmed",
    );
    if (sigresult) {
      alert("Airdrop was confirmed!");
    }
  } catch (err) {
    alert("You are Rate limited for Airdrop");
  }
};
```

Here’s an example of getting the solana balance of the wallet connected.
`[getBalance](https://solana.com/docs/rpc/http/getbalance#parameters)` is an
HTTP method you can call from the connection object to get the Sol balance.
Calling this function with setTimeout is good for checking the balance
recursively after 10 seconds.

```jsx
const [balance, setBalance] = useState < number > 0;

useEffect(() => {
  if (publicKey) {
    (async function GetBalance() {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
      setTimeout(GetBalance, 10000);
    })();
  }
}, [publicKey, connection, balance]);
```

Now, you can use these functions to detect whether the wallet is connected or
not, create a button to get an airdrop of devnet or sol in the network defined,
and more.

Here's the whole code of the page.

```jsx
// src/app/address/page.tsx

"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function Address() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [bal, setBalance] = useState < number > 0;

  const getAirdropOnClick = async () => {
    try {
      if (!publicKey) {
        throw new Error("Wallet is not Connected");
      }
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
      ]);
      const sigresult = await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        "confirmed",
      );
      if (sigresult) {
        alert("Airdrop was confirmed!");
      }
    } catch (err) {
      alert("You are Rate limited for Airdrop");
    }
  };

  useEffect(() => {
    if (publicKey) {
      (async function GetBalance() {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
        setTimeout(GetBalance, 10000);
      })();
    }
  }, [publicKey, connection, bal]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-evenly p-24">
      {publicKey ? (
        <div className="flex flex-col gap-4">
          <h1> </h1>Your Public key is: {publicKey?.toString()}
          <h1> Your Balance is: {bal} </h1>
          <div>
            <button
              onClick={getAirdropOnClick}
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              Get Airdrop
            </button>
          </div>
        </div>
      ) : (
        <h1> Wallet is not connected </h1>
      )}
    </main>
  );
}
```

Here's what your address page will look like when the wallet is connected on the
home page.

![Address Page](/assets/guides/integrate-solana-wallets-into-nextjs/address-page.png)

## Conclusion

To integrate Solana wallets with your Next.js app, you must set the wallet base
adapter and wallet providers in the app layout so that their contexts and
components flow throughout the app.

---

## Next Steps

- You can call many methods from the connection object, and
  most [RPC Methods](https://solana.com/docs/rpc) are supported.

- You can always use `npx create-solana-dapp@latest` to generate a scaffold with
  the built-in Solana wallet adapter.

- If you don't want to use these wallet adapters, you can also
  use [Unified Wallet Kit](https://unified.jup.ag/). It is an open-sourced
  wallet adapter, striving for the best Solana wallet integration experience for
  developers and the best wallet experience for your users. Team Racoon from
  [Jupiter](https://jup.ag) built it.
