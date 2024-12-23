---
title: Introduction to Solana Mobile
objectives:
  - Explain the benefits of creating mobile-first App experiences
  - Explain the high-level Mobile Wallet Adapter (MWA) flow
  - Explain the high-level differences between React and React Native
  - Create a simple Android Solana App using React Native
description:
  "Learn how to build native mobile apps using blockchain functionality"
---

## Summary

- The **Solana Mobile Wallet Adapter** (**MWA**) allows mobile apps to submit
  transactions for signing via a WebSocket connection to mobile wallets.
- The easiest way to start building Solana mobile applications is by using
  Solana Mobile’s
  [React Native packages](https://docs.solanamobile.com/react-native/setup) -
  `@solana-mobile/mobile-wallet-adapter-protocol` and
  `@solana-mobile/mobile-wallet-adapter-protocol-web3js`

## Lesson Overview

In these lessons, we will develop mobile apps that interact with the Solana
network, this opens up a whole new paradigm of blockchain use cases and
behaviors. The **Solana Mobile Stack** (**SMS**) is designed to help developers
seamlessly create mobile apps. It includes the
[Mobile Wallet Adapter (MWA)](https://docs.solanamobile.com/getting-started/overview#mobile-wallet-adapter)
, a Solana Mobile SDK that uses React Native,
[Seed Vault](https://docs.solanamobile.com/getting-started/overview#seed-vault),
and the
[Solana app Store](https://docs.solanamobile.com/getting-started/overview#solana-app-store).
These resources simplify mobile development with a similar experience but with
mobile-specific features.

This lesson focuses on using React Native to create a simple Android app that
integrates with the Solana network. If you're not familiar with programming in
React or Solana, we recommend starting with our
[Intro to Solana lesson](https://github.com/solana-foundation/developer-content/tree/main/content/courses/intro-to-solana)
and returning when you're ready. If you are, let's dive in!

## Intro to Solana Mobile

Native mobile wallets hold your secret keys and use them to sign and send
transactions just like web extension wallets. However native mobile wallets use
the
[Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter)
(MWA) standard instead of the
[Wallet Adapter](https://github.com/anza-xyz/wallet-adapter) to ensure any apps
can work with any wallet.

We will dig into the specifics of the MWA in a
[later lesson](/content/courses/mobile/mwa-deep-dive.md), but it effectively
opens a WebSocket between applications to facilitate communication. That way a
separate app can provide the wallet app with the transaction to be signed and
sent, and the wallet app can respond with appropriate status updates.

### Mobile Use Cases with Solana

Before development, it is important to understand the current landscape of Web3
mobile development to foresee potential blockers and opportunities. Here are a
few examples of what Solana mobile development can unlock:

**Mobile Banking and Trading (DeFi)**

Most traditional banking right now happens on on native mobile apps. With SMS,
you can now bank and trade using native mobile apps with your own wallet, where
you hold your own keys.

**Mobile Gaming with Solana Micropayments**

Mobile games account for roughly 50% of the video game industry's total value,
largely due to small in-game purchases. However, payment processing fees usually
mean these in-game purchases have a minimum of $0.99 USD. With Solana, it's
possible to unlock true micropayments. Need an extra life? That'll be 0.0001
SOL.

**Mobile E-Commerce**

SMS can enable a new wave of mobile e-commerce shoppers to pay directly from
their favorite Solana wallet. Imagine a world where you can use your Solana
wallet as seamlessly as you can use Apple Pay.

In summary, mobile blockchain transactions can open many opportunities. Let's
start building!

### Supported Operating Systems

Currently, the MWA only supports Android. On Android, a WebSocket connection can
persist between apps, even when the wallet app is in the background.

On iOS, the OS quickly suspends websocket connections when an app is
backgrounded, so the standard  
[Wallet Adapter](https://github.com/solana-labs/wallet-adapter) library is used
instead.

The remainder of this lesson will focus on developing Android apps with the MWA.

### Supported Frameworks

Solana Mobile supports a number of different frameworks. Officially supported
are React Native and native Android, with community SDKs for Flutter, Unity, and
Unreal Engine.

**Solana SDKs:**

- [React Native](https://docs.solanamobile.com/react-native/quickstart) (
  Regular and Expo )
- [Android](https://docs.solanamobile.com/android-native/quickstart)

**Community SDKs:**

- [Flutter](https://docs.solanamobile.com/flutter/overview)
- [Unity](https://docs.solanamobile.com/unity/unity_sdk)
- [Unreal Engine](https://docs.solanamobile.com/unreal/unreal_sdk)

To keep the development experience as close as possible to other lessons, we
will be working exclusively with React Native.

## From React to React Native

React Native is very similar to React but designed for mobile. Here are some key
points to note:

- React Native compiles down to native Android and iOS apps while React compiles
  down to a collection of web pages.
- Instead of using web elements like `<div>`, you will use mobile-native
  elements like `<View>`.
- React Native allows access to mobile hardware, such as the camera and
  accelerometer, which React web apps cannot access.
- Many standard React and Node packages may not be compatible with React Native
  and setting up React Native can be challenging. Fortunately, the
  [React Native Docs](https://reactnative.dev/docs/environment-setup?guide=native)
  contains everything you may need.
- For development, you will need to set up
  [Android Studio](https://developer.android.com/studio/intro/) for Android apps
  and an emulator or physical device for testing.

<Callout type="info">
**NOTE:** There is a learning curve, but if you know React you're not nearly as far from being able to develop mobile apps as you think! It may feel jarring to start, but after a few hours of React Native development, you will start to feel much more comfortable. We have included a [Lab](#lab) section below to help you.
</Callout>

## Creating a React Native App on Solana

Solana React Native apps are virtually identical to React apps. The primary
difference is in the wallet interaction. Instead of the wallet being available
in the browser, your app will create an MWA session with the wallet app of your
choosing using a WebSocket. Fortunately, this is abstracted for you in the MWA
library. The only difference is that anytime you need to make a call to the
wallet, the `transact` function will be used, more details on this function in
later parts of this lesson.

![App Flow](/public/assets/courses/unboxed/basic-solana-mobile-flow.png)

## Reading Data

Reading data from a Solana cluster in React Native works the same way as in
React. You can use the `useConnection` hook to access the `connection` object,
which is responsible for interacting with the Solana network.

In Solana, an account refers to any object stored on-chain, and is typically
referenced by a
[public key](https://solana.com/docs/terminology#public-key-pubkey).

Here’s an example of how you can read an account information using the
`getAccountInfo` method:

```javascript
const { connection } = useConnection();
const publicKey = new PublicKey("your-wallet-public-key-here"); // Replace with a valid public key
const account = await connection.getAccountInfo(publicKey);
```

> **NOTE:** If you need a refresher, refer to our
> [Intro to Reading Data lesson](/content/courses/intro-to-solana/intro-to-reading-data.md).

## Connecting to a Wallet

When writing data to the blockchain, it must be done through a **transaction**.
Transactions need to be signed by one or more secret keys and sent to an
[RPC provider](https://academy.subquery.network/subquery_network/node_operators/rpc_providers/introduction.html)
for processing. In almost all cases, this interaction is facilitated through a
wallet application.

### Web vs. Mobile Wallet Interactions

The websocket that connects the app and the wallet is managed using the MWA, and
initiated using **Android intents**, with the dApp broadcasting its intent using
the `solana-wallet://` scheme.
![Connecting](/public/assets/courses/unboxed/basic-solana-mobile-connect.png)

When the wallet app receives the intent broadcast, it opens a WebSocket
connection with the app that initiated the session. The app initiates this
connection using the `transact` function, as shown below:

```tsx
transact(async (wallet: Web3MobileWallet) => {
  // Your wallet action code goes here
});
```

This function provides access to the `Web3MobileWallet` object, allowing you to
perform actions such as signing transactions or interacting with wallet data.
Remember, all wallet interactions must occur inside the callback of the
`transact` function.

### Signing and sending transactions

The overall flow for signing and sending a transaction is as follows:

- Use the `transact` function to establish a session with the wallet. This
  function takes an asynchronous callback:
  `async (wallet: Web3MobileWallet) => {...}`.
- Inside the callback, request wallet authorization using `wallet.authorize()`
  or `wallet.reauthorize()`, depending on the wallet's state (whether it has an
  active session or requires reauthorization).
- Once the wallet is authorized, you can either:
  - Sign the transaction using `wallet.signTransactions()`, or
  - Sign and send the transaction directly using
    `wallet.signAndSendTransactions()`.

![Transacting](/public/assets/courses/unboxed/basic-solana-mobile-transact.png)
To manage the wallet's authorization state, consider creating a
`useAuthorization()` hook. This hook can streamline the process of handling
authorization within your app, especially if you have multiple interactions with
the wallet.

> We will explore the use of this hook and practice managing the wallet's state
> in more detail during the lab exercises.

Here is an example of sending a transaction using MWA:

```tsx
//import required dependencies if any

const { authorizeSession } = useAuthorization();
const { connection } = useConnection();

const sendTransactions = async (transaction: Transaction) => {
  try {
    // Start a session with the wallet
    await transact(async (wallet: Web3MobileWallet) => {
      // Get the latest blockhash for the transaction
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      // Authorize the wallet session
      const authResult = await authorizeSession(wallet);

      // Create an updated transaction with the latest blockhash and feePayer
      const updatedTransaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: authResult.publicKey,
      }).add(transaction);

      // Sign and send the transaction via the wallet
      const signatures = await wallet.signAndSendTransactions({
        transactions: [updatedTransaction],
      });

      console.log(`Transaction successful! Signature: ${signatures[0]}`);
    });
  } catch (error) {
    console.error("Error sending transaction:", error);
    throw new Error("Transaction failed");
  }
};
```

## Debugging

Debugging can be challenging when working with Solana mobile transactions, as
two separate applications are involved: your app and the mobile wallet. Unlike
typical single-application setups, you won't have direct access to the wallet’s
logs, which makes tracking issues more complex.

However, Android Studio’s
[Logcat](https://developer.android.com/studio/debug/logcat) provides a useful
solution - enabling you to view logs from all applications running on your
device including the wallet. By leveraging Logcat, you can monitor the
interaction between your app and the wallet, helping you identify any issues
that arise during transaction signing and submission.

If Logcat is not your preferred tool, an alternative approach is to use the
wallet solely for signing transactions, while handling the actual transaction
submission in your app’s code. This method allows for greater control over
debugging, as you can inspect the transaction flow more thoroughly on the client
side.

## Deploying for Solana Mobile

Deploying mobile applications can be challenging, and the complexity increases
when dealing with blockchain-based apps. Two primary factors contribute to this
difficulty: customer safety and financial incentives.

### Customer Safety and Regulatory Uncertainty:

Most mobile app marketplaces, such as the Apple App Store and Google Play Store,
have policies that restrict blockchain-related apps. Since blockchain is still a
relatively new and evolving technology, platforms are cautious about regulatory
compliance. They often adopt strict guidelines to protect users from potential
risks associated with blockchain apps.

### In-App Purchases and Platform Fees:

Another significant challenge arises when using blockchain transactions for
in-app purchases. Many platforms impose a transaction fee on purchases made
within their apps (ranging from 15% to 30%). Payment via the blockchain is often
seen as a way to bypass these fees, which is explicitly prohibited by most app
stores. These platforms prioritize protecting their revenue streams and
therefore enforce strict policies against apps that facilitate blockchain
payments for in-app purchases.

> While traditional app stores impose strict policies around blockchain
> transactions to protect their revenue and comply with regulations, alternative
> distribution methods like the Solana app Store offers developers a more
> flexible platform for deploying Solana-based mobile applications. This
> decentralized approach bypasses many of the restrictions seen in centralized
> app marketplaces, allowing apps to thrive in a more blockchain-friendly
> ecosystem.

## Conclusion

Getting started with Solana mobile development is more accessible than ever,
thanks to the Solana Mobile Stack (SMS). Although React Native introduces some
differences compared to React, much of the code you will write remains familiar,
particularly when it comes to structuring the UI and handling state. The main
distinction lies in how you interact with wallets, which requires using the
`transact` callback to establish wallet sessions, sign transactions, and
communicate with Solana’s blockchain.

As you continue building Solana mobile apps, it's essential to keep learning and
refining your skills. Be sure to explore additional resources like:

- [The official Solana Developer Docs](https://solana.com/docs) for in-depth
  guides on Solana’s core libraries and best practices.

- [Solana Stack Exchange](https://solana.stackexchange.com/) forum for
  troubleshooting, sharing insights, and staying updated on the latest ecosystem
  changes.

Mastering mobile Solana development will open up new opportunities in
decentralized finance (DeFi), gaming, and e-commerce, allowing you to build
cutting-edge applications with a seamless user experience. Stay curious and
experiment with different tools to push the boundaries of what you can achieve
with mobile apps. Let's put our knowledge to test by building a counting app
with React Native for Android OS!

## Lab: Building a Mobile Counter app with React Native

This app will display a counter and allow users to make increments via a
transaction on the Solana blockchain. The app will also connect to a wallet for
signing transactions.

We will use the **Anchor framework** to interact with the on-chain counter
program. The client side has already been developed in one of our previous
lessons called
[Intro to client-side Anchor development](https://solana.com/developers/courses/onchain-development/intro-to-anchor-frontend),
feel free to check out its code for more context.

To ensure you fully understand the core concepts, we will write this application
in vanilla React Native without a starting template. While Solana Mobile offers
templates that handle some boilerplate, building from scratch provides a much
deeper understanding.

### Getting Started

To get started, you will need to properly set up a React Native development
environment if you didn't already. This
[article](https://reactnative.dev/docs/set-up-your-environment) shows you how.
Remember that this step is not required if you are using a
[Framework](https://reactnative.dev/architecture/glossary#react-native-framework).

Ensure you have [Node.js](https://nodejs.org/en/download) installed on your
system. These will manage your JavaScript packages. Install Android Studio:

Android Studio is required to run the Android emulator and to compile your React
Native app for Android devices. Configure the ANDROID_HOME Environment Variable:

> **NOTE:** You will need to configure the `ANDROID_HOME` environment variable
> so that your terminal can recognize Android’s SDK tools. This step is critical
> for running and building your app on Android.

## Project Setup

Create a Sample Project for the Emulator Setup to ensure your Android
environment is set up correctly. In your terminal, run the code below within
your preferred directory to scaffold a new React Native project, where
`SampleProject` is your preferred project name. You can open the project in
Android Studio and ensure it runs correctly on the Android emulator.

```bash
  npx react-native init SampleProject --npm
```

### Cloning and Running MWA

1.  Clone the repo in `SampleProject`

    ```bash
    git clone https://github.com/solana-mobile/mobile-wallet-adapter.git
    ```

2.  In Android Studio, _Open project > Navigate to the cloned directory > Select
    mobile-wallet-adapter/android_
3.  After Android Studio finishes loading the project, select `fakewallet` in
    the build/run configuration dropdown in the top right

    ![Fake Wallet](/public/assets/courses/unboxed/basic-solana-mobile-fake-wallet.png)

4.  For easier debugging, use **Logcat**. Check the
    [Logcat installation guide](https://developer.android.com/studio/debug/logcat)
    if you are interested.
5.  Now that your fake wallet is running on the emulator, go to _View -> Tool
    Windows -> Logcat_. This will open up a console logging out what’s happening
    with fake wallet.

6.  (Optional) Install other
    [Solana wallets](https://play.google.com/store/search?q=solana%20wallet&c=apps)
    on the Google Play store.

Lastly, we recommend installing _java version 11_ to avoid dependency errors. To
know what version you have installed, run `java --version` in your terminal.

### 1. Plan out the App Structure

Before we do any coding, let's conceptualize the outline of the app. Again, this
app will connect to and interact with the counter program we've already deployed
to Devnet. To do this, we'll need the following:

- A `Connection` object to interact with Solana (`ConnectionProvider.tsx`)
- Access to our counter program (`ProgramProvider.tsx`)
- Authorization for a wallet to sign and send requests (`AuthProvider.tsx`)
- Text to display our counter value (`CounterView.tsx`)
- A button to press to increment our count (`CounterButton.tsx`)

There will be more files and considerations, but these are the most important
files we'll be creating and working with.

### 2. Create the App

Now that we've got some of the basic setup and structure down, let's scaffold a
new app with the following command:

```bash
npx react-native@latest init counter --npm
```

This scaffolds a new React Native project for us called `counter`.

Let's make sure everything is set up properly by starting the default app and
running it on our Android emulator.

```bash
cd counter
npm run android
```

This should open and run the app in your Android emulator. If you run into
problems, check to make sure you’ve accomplished everything in the
[_Getting Started_](#getting-started) section.

### 3. Install Dependencies

We will need to import our Solana dependencies.
[The Solana Mobile docs provide a nice list of packages](https://docs.solanamobile.com/react-native/setup)
and explanations for why we need them:

- `@solana-mobile/mobile-wallet-adapter-protocol`: A React Native/Javascript API
  enabling interaction with MWA-compatible wallets
- `@solana-mobile/mobile-wallet-adapter-protocol-web3js`: A convenience wrapper
  to use common primitives from
  [@solana/web3.js](https://github.com/solana-labs/solana-web3.js), such as
  `Transaction` and `Uint8Array`
- `@solana/web3.js`: Solana Web Library for interacting with the Solana network
  through th
  [JSON RPC API](https://github.com/solana-foundation/developer-content/blob/main/docs/rpc/http/index.mdx)
- `@react-native-get-random-values` Secure random number generator polyfill for
- `web3.js` underlying library on React Native
- `buffer`: Buffer polyfill; also needed for `web3.js` on React Native

In addition to this list, we will add two more packages:

- `@coral-xyz/anchor`: The Anchor TS client.
- `assert`: A polyfill that lets Anchor do its thing.
- `text-encoding-polyfill`: A polyfill needed to create the `Program` object

If you’re not familiar: polyfills provide Node-native libraries to make them
work anywhere Node is not running. We will finish our polyfill setup shortly.
For now, install dependencies using the following command:

```bash
npm install \
  @solana/web3.js \
  @solana-mobile/mobile-wallet-adapter-protocol-web3js \
  @solana-mobile/mobile-wallet-adapter-protocol \
  react-native-get-random-values \
  buffer \
  @coral-xyz/anchor \
  assert \
  text-encoding-polyfill
```

### 4. Create ConnectionProvider.tsx file

Let's start adding our Solana functionality. Create a new folder called
`components` and within it, a file called `ConnectionProvider.tsx`. This
provider will wrap the entire application and make our `Connection` object
available throughout. Hopefully, you're noticing a pattern: this is identical to
the React patterns we've used throughout the course.

```tsx
import { Connection, ConnectionConfig } from "@solana/web3.js";
import React, { ReactNode, createContext, useContext, useMemo } from "react";

export interface ConnectionProviderProps {
  children: ReactNode;
  endpoint: string;
  config?: ConnectionConfig;
}

export interface ConnectionContextState {
  connection: Connection;
}

const ConnectionContext = createContext<ConnectionContextState>(
  {} as ConnectionContextState,
);

export function ConnectionProvider({
  children,
  endpoint,
  config = { commitment: "confirmed" },
}: ConnectionProviderProps) {
  const connection = useMemo(
    () => new Connection(endpoint, config),
    [config, endpoint],
  );

  return (
    <ConnectionContext.Provider value={{ connection }}>
      {children}
    </ConnectionContext.Provider>
  );
}

export const useConnection = (): ConnectionContextState =>
  useContext(ConnectionContext);
```

### 5. Create AuthProvider.tsx file

The next Solana provision we will need is the **auth provider**. This is one of
the main differences between mobile and web development. What we’re implementing
here is roughly equivalent to the `WalletProvider` that we’re used to in web
apps. However, since we're using Android and its natively installed wallets, the
flow to connect and utilize them is a bit different. Most notably, we need to
follow the MWA protocol.

We do this by providing the following in our `AuthProvider`:

- `accounts`: If the user has multiple wallets, different accounts are
  maintained in this array of Accounts.
- `selectedAccount`: The current selected account for the transaction.
- `authorizeSession(wallet)`: Authorizes (or reauthorizes, if token is expired)
  the `wallet` for the user and returns an account which will act as the
  selected account for the session. The `wallet` variable is from the callback
  of the `transact` function you call independently anytime you want to interact
  with a wallet.
- `deauthorizeSession(wallet)`: Deauthorizes the `wallet`.
- `onChangeAccount`: Acts as a handler when `selectedAccount` is changed.

We are also going to throw in some utility methods:

- `getPublicKeyFromAddress(base64Address)`: Creates a new Public Key object from
  the Base64 address given from the `wallet` object
- `getAuthorizationFromAuthResult`: Handles the authorization result, extracts
  relevant data from the result, and returns the `Authorization` context object

We will expose all of this through a `useAuthorization` hook.

Since this provider is the same across all apps, we are going to give you the
full implementation that you can copy and paste. We will dig into the details of
MWA in a future lesson.

Create the file `AuthProvider.tsx` in the `components` folder and paste in the
following:

```tsx
import { Cluster, PublicKey } from "@solana/web3.js";
import {
  Account as AuthorizedAccount,
  AuthorizationResult,
  AuthorizeAPI,
  AuthToken,
  Base64EncodedAddress,
  DeauthorizeAPI,
  ReauthorizeAPI,
} from "@solana-mobile/mobile-wallet-adapter-protocol";
import { toUint8Array } from "js-base64";
import { useState, useCallback, useMemo, ReactNode } from "react";
import React from "react";

const AuthUtils = {
  getAuthorizationFromAuthResult: (
    authResult: AuthorizationResult,
    previousAccount?: Account,
  ): Authorization => {
    const selectedAccount =
      previousAccount === undefined ||
      !authResult.accounts.some(
        ({ address }) => address === previousAccount.address,
      )
        ? AuthUtils.getAccountFromAuthorizedAccount(authResult.accounts[0])
        : previousAccount;

    return {
      accounts: authResult.accounts.map(
        AuthUtils.getAccountFromAuthorizedAccount,
      ),
      authToken: authResult.auth_token,
      selectedAccount,
    };
  },

  getAccountFromAuthorizedAccount: (
    authAccount: AuthorizedAccount,
  ): Account => ({
    ...authAccount,
    publicKey: new PublicKey(toUint8Array(authAccount.address)),
  }),
};

type Account = Readonly<{
  address: Base64EncodedAddress;
  label?: string;
  publicKey: PublicKey;
}>;

type Authorization = Readonly<{
  accounts: Account[];
  authToken: AuthToken;
  selectedAccount: Account;
}>;

const APP_IDENTITY = {
  name: "Solana Counter Incrementor",
};

type AuthorizationProviderContext = {
  accounts: Account[] | null;
  authorizeSession: (wallet: AuthorizeAPI & ReauthorizeAPI) => Promise<Account>;
  deauthorizeSession: (wallet: DeauthorizeAPI) => void;
  onChangeAccount: (nextSelectedAccount: Account) => void;
  selectedAccount: Account | null;
};

const AuthorizationContext = React.createContext<AuthorizationProviderContext>({
  accounts: null,
  authorizeSession: () => {
    throw new Error("Provider not initialized");
  },
  deauthorizeSession: () => {
    throw new Error("Provider not initialized");
  },
  onChangeAccount: () => {
    throw new Error("Provider not initialized");
  },
  selectedAccount: null,
});

type AuthProviderProps = {
  children: ReactNode;
  cluster: Cluster;
};

function AuthorizationProvider({ children, cluster }: AuthProviderProps) {
  const [authorization, setAuthorization] = useState<Authorization | null>(
    null,
  );

  const handleAuthorizationResult = useCallback(
    async (authResult: AuthorizationResult): Promise<Authorization> => {
      const nextAuthorization = AuthUtils.getAuthorizationFromAuthResult(
        authResult,
        authorization?.selectedAccount,
      );
      setAuthorization(nextAuthorization);
      return nextAuthorization;
    },
    [authorization],
  );

  const authorizeSession = useCallback(
    async (wallet: AuthorizeAPI & ReauthorizeAPI) => {
      const authorizationResult = authorization
        ? await wallet.reauthorize({
            auth_token: authorization.authToken,
            identity: APP_IDENTITY,
          })
        : await wallet.authorize({ cluster, identity: APP_IDENTITY });
      return (await handleAuthorizationResult(authorizationResult))
        .selectedAccount;
    },
    [authorization, cluster, handleAuthorizationResult],
  );

  const deauthorizeSession = useCallback(
    async (wallet: DeauthorizeAPI) => {
      if (authorization?.authToken) {
        await wallet.deauthorize({ auth_token: authorization.authToken });
        setAuthorization(null);
      }
    },
    [authorization],
  );

  const onChangeAccount = useCallback((nextAccount: Account) => {
    setAuthorization(currentAuthorization => {
      if (
        currentAuthorization?.accounts.some(
          ({ address }) => address === nextAccount.address,
        )
      ) {
        return { ...currentAuthorization, selectedAccount: nextAccount };
      }
      throw new Error(`${nextAccount.address} is no longer authorized`);
    });
  }, []);

  const value = useMemo(
    () => ({
      accounts: authorization?.accounts ?? null,
      authorizeSession,
      deauthorizeSession,
      onChangeAccount,
      selectedAccount: authorization?.selectedAccount ?? null,
    }),
    [authorization, authorizeSession, deauthorizeSession, onChangeAccount],
  );

  return (
    <AuthorizationContext.Provider value={value}>
      {children}
    </AuthorizationContext.Provider>
  );
}

const useAuthorization = () => React.useContext(AuthorizationContext);

export {
  AuthorizationProvider,
  useAuthorization,
  type Account,
  type AuthProviderProps,
  type AuthorizationProviderContext,
};
```

### 6. Create ProgramProvider.tsx file

The last provider we need is our program provider. This will expose the counter
program we want to interact with.

Since we are using the Anchor TS client to interact with our program, we need
the program's IDL. Start by creating a root-level folder called `models`, then
create a new file `anchor-counter.ts`. Paste the contents of the Anchor Counter
IDL into this new file.

Next, create the file `ProgramProvider.tsx` inside of components. Inside we will
create the program provider to surface our program and the counter PDA:

```tsx
import {
  AnchorProvider,
  IdlAccounts,
  Program,
  setProvider,
} from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { AnchorCounter, IDL } from "../models/anchor-counter";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useConnection } from "./ConnectionProvider";

export type CounterAccount = IdlAccounts<AnchorCounter>["counter"];

export type ProgramContextType = {
  program: Program<AnchorCounter> | null;
  counterAddress: PublicKey | null;
};

export const ProgramContext = createContext<ProgramContextType>({
  program: null,
  counterAddress: null,
});

export type ProgramProviderProps = {
  children: ReactNode;
};

export function ProgramProvider({ children }: ProgramProviderProps) {
  const { connection } = useConnection();
  const [program, setProgram] = useState<Program<AnchorCounter> | null>(null);
  const [counterAddress, setCounterAddress] = useState<PublicKey | null>(null);

  const setup = useCallback(async () => {
    const programId = new PublicKey(
      "ALeaCzuJpZpoCgTxMjJbNjREVqSwuvYFRZUfc151AKHU",
    );

    // MockWallet is a placeholder wallet used for initializing the AnchorProvider.
    // In a mobile app, we don't need a real wallet here because the actual signing
    // will be done by the user's mobile wallet app. This mock wallet allows us to
    // set up the provider without a real wallet instance.

    const MockWallet = {
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
      publicKey: Keypair.generate().publicKey,
    };

    const provider = new AnchorProvider(connection, MockWallet, {});
    setProvider(provider);

    const programInstance = new Program<AnchorCounter>(
      IDL,
      programId,
      provider,
    );

    const [counterProgramAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("counter")],
      programId,
    );

    setProgram(programInstance);
    setCounterAddress(counterProgramAddress);
  }, [connection]);

  useEffect(() => {
    setup();
  }, [setup]);

  const value: ProgramContextType = useMemo(
    () => ({
      program,
      counterAddress,
    }),
    [program, counterAddress],
  );

  return (
    <ProgramContext.Provider value={value}>{children}</ProgramContext.Provider>
  );
}

export const useProgram = () => useContext(ProgramContext);
```

### 7. Modify App.tsx file

Now that we have all our providers, let's wrap our app with them. We're going to
re-write the default `App.tsx` with the following changes:

- Import our providers and add in our polyfills
- Wrap the app first with `ConnectionProvider`, then `AuthorizationProvider`,
  and finally `ProgramProvider`
- Pass in our Devnet endpoint to the `ConnectionProvider`
- Pass our cluster to the `AuthorizationProvider`
- Replace the default internal `<View>` with `<MainScreen />`, a screen we'll
  build in the next step

```tsx
// Polyfills at the top
import "text-encoding-polyfill";
import "react-native-get-random-values";
import { Buffer } from "buffer";
global.Buffer = Buffer;

import { clusterApiUrl } from "@solana/web3.js";
import { ConnectionProvider } from "./components/ConnectionProvider";
import { AuthorizationProvider } from "./components/AuthProvider";
import { ProgramProvider } from "./components/ProgramProvider";
import { MainScreen } from "./screens/MainScreen"; // Going to make this
import React from "react";

export default function App() {
  const cluster = "devnet";
  const endpoint = clusterApiUrl(cluster);

  return (
    // ConnectionProvider: Manages the connection to the Solana network
    <ConnectionProvider
      endpoint={endpoint}
      config={{ commitment: "processed" }}
    >
      // AuthorizationProvider: Handles wallet authorization
      <AuthorizationProvider cluster={cluster}>
        // ProgramProvider: Provides access to the Solana program
        <ProgramProvider>
          <MainScreen />
        </ProgramProvider>
      </AuthorizationProvider>
    </ConnectionProvider>
  );
}
```

### 8. Create MainScreen.tsx file

Now, let's put everything together to create our UI. Create a new folder called
`screens` and a new file called `MainScreen.tsx` inside of it. In this file, we
are only structuring the screen to display two yet-to-be-created components:
`CounterView` and `CounterButton`.

Additionally, in this file, we're introducing React Native's `StyleSheet`. This
is another difference from regular React. Don't worry, it behaves very similarly
to CSS.

In `screens/MainScreen.tsx` paste the following:

```tsx
import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { CounterView } from "../components/CounterView";
import { CounterButton } from "../components/CounterButton";

export function MainScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="darkblue" />
      <View style={[styles.container, styles.counterContainer]}>
        <CounterView />
      </View>
      <View style={styles.incrementButtonContainer}>
        <CounterButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    backgroundColor: "lightgray",
  },
  incrementButtonContainer: {
    position: "absolute",
    right: "5%",
    bottom: "3%",
  },
  counterContainer: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "center",
  },
});
```

### 9. Create CounterView.tsx file

The `CounterView` is the first of our two program-specific files.
`CounterView`'s only job is to fetch and listen for updates on our `Counter`
account. Since we're only listening here, we don't have to do anything
MWA-related. It should look identical to a web application. We'll use our
`Connection` object to listen for the `programAddress` specified in
`ProgramProvider.tsx`. When the account is changed, we update the UI.

In `components/CounterView.tsx` paste the following:

```tsx
import { View, Text, StyleSheet } from "react-native";
import { useConnection } from "./ConnectionProvider";
import { useProgram, CounterAccount } from "./ProgramProvider";
import { useEffect, useState } from "react";
import { AccountInfo } from "@solana/web3.js";
import React from "react";

const counterStyle = StyleSheet.create({
  counter: {
    fontSize: 48,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
});

export function CounterView() {
  const { connection } = useConnection();
  const { program, counterAddress } = useProgram();
  const [counter, setCounter] = useState<CounterAccount>();

  // Fetch Counter Info
  useEffect(() => {
    if (!program || !counterAddress) return;

    program.account.counter.fetch(counterAddress).then(setCounter);

    const subscriptionId = connection.onAccountChange(
      counterAddress,
      (accountInfo: AccountInfo<Buffer>) => {
        try {
          const data = program.coder.accounts.decode(
            "counter",
            accountInfo.data,
          );
          setCounter(data);
        } catch (e) {
          console.log("account decoding error: " + e);
        }
      },
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [program, counterAddress, connection]);

  if (!counter) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Current counter</Text>
      <Text style={counterStyle.counter}>{counter.count.toString()}</Text>
    </View>
  );
}
```

### 10. Create CounterButton.tsx file

Finally, we have our last component, the `CounterButton`. This floating action
button will do the following in a new function `incrementCounter`:

- Call `transact` to get access to a mobile wallet
- Authorize the session with `authorizeSession` from the `useAuthorization` hook
- Request a Devnet airdrop to fund the transaction if not enough Devnet SOL is
  available
- Create an `increment` transaction
- Call `signAndSendTransactions` to have the wallet sign and send the
  transaction

<Callout type="note">The fake Solana wallet we use generates a new keypair every
time you restart the fake wallet app, requiring that we want to check for funds
and airdrop every time. This is for demo purposes only, you can't do this in
production.</Callout>

Create the file `CounterButton.tsx` and paste in the following:

```tsx
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  ToastAndroid,
} from "react-native";
import { useAuthorization } from "./AuthProvider";
import { useProgram } from "./ProgramProvider";
import { useConnection } from "./ConnectionProvider";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import { useState } from "react";
import React from "react";

const floatingActionButtonStyle = StyleSheet.create({
  container: {
    height: 64,
    width: 64,
    alignItems: "center",
    borderRadius: 40,
    justifyContent: "center",
    elevation: 4,
    marginBottom: 4,
    backgroundColor: "blue",
  },

  text: {
    fontSize: 24,
    color: "white",
  },
});

export function CounterButton() {
  const { authorizeSession } = useAuthorization();
  const { program, counterAddress } = useProgram();
  const { connection } = useConnection();
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);

  const showToastOrAlert = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(message);
    }
  };

  const incrementCounter = () => {
    if (!program || !counterAddress) return;

    if (!isTransactionInProgress) {
      setIsTransactionInProgress(true);

      transact(async (wallet: Web3MobileWallet) => {
        const authResult = await authorizeSession(wallet);
        const latestBlockhashResult = await connection.getLatestBlockhash();

        const ix = await program.methods
          .increment()
          .accounts({ counter: counterAddress, user: authResult.publicKey })
          .instruction();

        const balance = await connection.getBalance(authResult.publicKey);

        console.log(
          `Wallet ${authResult.publicKey} has a balance of ${balance}`,
        );

        // When on Devnet you may want to transfer SOL manually per session, due to Devnet's airdrop rate limit
        const minBalance = LAMPORTS_PER_SOL / 1000;

        if (balance < minBalance) {
          console.log(
            `requesting airdrop for ${authResult.publicKey} on ${connection.rpcEndpoint}`,
          );
          await connection.requestAirdrop(authResult.publicKey, minBalance * 2);
        }

        const transaction = new Transaction({
          ...latestBlockhashResult,
          feePayer: authResult.publicKey,
        }).add(ix);
        const signature = await wallet.signAndSendTransactions({
          transactions: [transaction],
        });

        showToastOrAlert(`Transaction successful! ${signature}`);
      })
        .catch(e => {
          console.log(e);
          showToastOrAlert(`Error: ${JSON.stringify(e)}`);
        })
        .finally(() => {
          setIsTransactionInProgress(false);
        });
    }
  };

  return (
    <>
      <Pressable
        style={floatingActionButtonStyle.container}
        onPress={incrementCounter}
      >
        <Text style={floatingActionButtonStyle.text}>+</Text>
      </Pressable>
    </>
  );
}
```

### 11. Build and Run

Now it's time to test that everything works! Build and run with the following
command:

```bash
npm run android
```

This will open the app in your emulator, click the + button in the bottom right.
This will open up the "fake wallet". The "fake wallet" has various options to
assist in debugging. The image below outlines the buttons to tap to properly
test your app:

![Counter App](/public/assets/courses/unboxed/basic-solana-mobile-counter-app.png)

If you run into problems, here are some examples of what they could be and how
to fix them:

- Application does not build → Exit Metro with _Ctrl+C_ and try again
- Nothing happens when you press the `CounterButton` → Make sure you have Solana
  wallet installed ( like the fake wallet we installed in Prerequisites )
- You get stuck in a forever loop while calling `increment` → This is likely due
  to you reaching a Devnet airdrop rate limit. Take out the airdrop section in
  `CounterButton` and manually send some Devnet SOL to your wallet's address
  (printed in the console)

That's it! You've made your first Solana Mobile app. If you get stuck, feel free
to check out the

[full solution code](https://github.com/solana-developers/react-native-counter)
on the `main` branch of the repository.

## Challenge

Your next challenge is to expand the app by adding a `decrement` function. You
need to create another button that will call the `decrement` method on the
Solana program. The logic for the decrement function already exists in the
program’s **IDL** (**Interface Description Language**), so your task is to write
the client-side code that interacts with it.

Once you've completed this, you can check your solution against the solution
code available on the

[solution branch](https://github.com/solana-developers/react-native-counter).

<Callout type="success" title="Good Job!">
If you’ve successfully completed the lab, push your code to GitHub and share
your feedback on this lesson through this [form](https://form.typeform.com/to/IPH0UGz7#answers-lesson=c15928ce-8302-4437-9b1b-9aa1d65af864)
</Callout>
