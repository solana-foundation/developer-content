---
date: Dec 23, 2023
title: Implementing Social Logins with Particle Network
description:
  "Social logins are Web2-adjacent, familiar mechanisms for onboarding users 
  into your Solana dApp."
keywords:
  - social login
  - wallet-as-a-service
difficulty: intermediate
tags:
  - infrastructure
  - wallets
altRoutes:
  - /developers/guides/social-logins-particle
---


# Wallet vs Wallet-as-a-Service

## Understanding (Traditional) Wallets
Wallets are mechanisms for facilitating interaction with accounts that transact on the blockchain. For example, you may be familiar with Phantom, a Solana wallet that purely facilitates interaction between a given account, in this case, an account derived from a **private key** (simplified into a seed phrase), and the Solana blockchain. Traditional wallet solutions are often structured as browser extensions or mobile apps. They allow users to interact with all Solana applications through a generalized, self-custodial, and predictable interface.

## Understanding Wallet-as-a-Service
Wallet-as-a-Service, while still intrinsically facilitating interaction with accounts, takes a fundamentally different approach, specifically in the nature of accounts and how they’re used.

Wallet-as-a-Service solutions tend to move away from extensions or mobile apps and instead implement the wallet experience natively within the decentralized application in question. This is often referred to as an "embedded wallet"  where the core interaction experience is built **around the application**, resulting in a seamless UX and familiar onboarding flow.

In addition to this, Wallet-as-a-Service solutions tend to stray away from single-key accounts, such as those secured by seed phrases that you'd find within traditional wallets. Instead, Wallet-as-a-Service providers will use an alternative key management mechanism like MPC-TSS, SSS, standalone KMS, etc. to create and access accounts while maintaining security and a varying degree of user custody.

This migration from standard single-key accounts to their more flexible, sharded counterparts means that you can also enable onboarding through familiar mechanisms, such as **social login** with Google, Twitter, email, phone number, etc. This is one of the key value propositions of Wallet-as-a-Service solutions –the ability to facilitate accessible onboarding without sacrificing flexibility or security.

![Particle Auth Example Solana](https://i.imgur.com/POfCaxA.gif)

# Particle Network
**[Particle Network](https://particle.network/)**  is the [Intent-Centric, Modular Access Layer of Web3](https://blog.particle.network/full-ecosystem-overview). With Particle's Wallet-as-a-Service, developers can curate a natural user experience through modular and customizable embedded wallet components. By utilizing MPC-TSS for key management, Particle can streamline onboarding via familiar Web2 accounts—such as Google accounts, email addresses, and phone numbers.

Through APIs and SDKs available on both mobile and desktop platforms, developers can integrate Particle's Wallet-as-a-Service to enable secure key generation and management initiated by Web2 logins, with the capacity to be customized and implemented in a way that matches the specific needs of a given application.

# Integration Guide

This guide will walk you through the process of utilizing Particle's Wallet-as-a-Service within Solana applications.

### Installation

To begin, you'll need to install a few dependencies from `@particle-network`

First, you'll need to decide between starting with Particle Auth Core, Particle's generalized authentication and interaction SDK for Particle, or Particle Connect, an SDK specifically meant to facilitate interaction through connection UI components (i.e., a "Connect Wallet" button).

You can install Particle Auth through the following.

```bash
yarn add @particle-network/auth-core-modal

// OR

npm install --save @particle-network/auth-core-modal
```

Otherwise, if you'd like to use Particle Connect as the means of interaction, you can install it by running the following.

```bash
yarn add @particle-network/connect-react-ui

// OR

npm install --save @particle-network/connect-react-ui
```

Moving forward, we'll dive into initializing and using Particle Auth Core, although this process looks nearly identical to Particle Connect. The only difference is that configuration within Particle Connect happens within the confines of `ModalProvider`, and interaction can be facilitated with `connectKit.particle.solana.{method goes here}`.

### Configuring Particle Network

The first step in leveraging Particle involves the configuration and initialization of `AuthCoreContextProvider` (imported from `@particle-network/auth-core-modal`, wrapping the primary application component within your project, as shown below:

```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Solana } from '@particle-network/chains';
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthCoreContextProvider
      options={{
        projectId: process.env.REACT_APP_PROJECT_ID,
        clientKey: process.env.REACT_APP_CLIENT_KEY,
        appId: process.env.REACT_APP_APP_ID,
        wallet: {
          visible: true,
          customStyle: {
            supportChains: [Solana],
          }
        }
      }}
    >
      <App />
    </AuthCoreContextProvider>
  </React.StrictMode>
)
```

Your project ID, client key, and app ID can be retrieved from the [Particle Network dashboard](https://dashboard.particle.network/).


### Initiating login

Within Particle Auth Core, you can initiate social login by leveraging `connect` from the `useConnect` hook provided by `@particle-network/auth-core-modal`. By default, this will open a general pop-up requesting for a user to sign in (through one of many social login options).  This popup can be customized on the [Particle Network dashboard](https://dashboard.particle.network/).

Additionally, if you choose to define `socialType` within the parameters of `connect`, you can automatically route login to a specific authentication type (such as `'google'`, `'twitter'`, `'phone'`, etc.)

```js
import { useConnect } from '@particle-network/auth-core-modal';
import { Solana } from '@particle-network/chains';

 const { connect, disconnect } = useConnect();

await connect({
    socialType: authType,
    chain: Solana,
});
```

Once a user has logged in, their user information (the public profile information corresponding with the social login in question) will be stored within `userInfo`, which you can define from the `useAuthCore` hook.

Additionally, the `useSolana` hook can facilitate all standard application interactions after a user has logged in, such as `signAllTransactions`, `signAndSendTransaction`, `signMessage`, `signTransaction`, etc.
```js
const { connect } = useConnect();
const { userInfo } = useAuthCore();
const { signMessage } = useSolana()

const handleLogin = async (authType) => {
    if (!userInfo) {
      await connect({
        socialType: authType,
        chain: Solana,
      });
   }
};

const signMsg = async () => {
    const message = 'GM, Particle!';
    const encodedMessage = new TextEncoder().encode(message);
    
    await signMessage(encodedMessage)
};
```

![Sign message example](https://i.imgur.com/yhvZEGn.gif)

### Additional functionality

Beyond the general utilization of Particle Network, the Particle Auth Core SDK has other features worth mentioning:

1. Onramp pop-ups
Particle has a [built-in onramp](https://docs.particle.network/developers/auth-service/sdks/web#open-crypto-token-buy) aggregating multiple providers. This onramp can be initiated programmatically through the following.

```js
const { openBuy } = useAuthCore();

openBuy();
```

2. Logout
If you'd like to log a user out, Particle offers a method on `useConnect` to do so.

```js
const { disconnect } = useConnect();

disconnect();
```

3. Opening Particle Wallet (outside of the optional built-in pop-up)
If you'd like to [open the wallet UI](https://docs.particle.network/developers/auth-service/sdks/web#open-particle-web-wallet)  including all traditional wallet functionalities, along with swaps, an onramp, etc.), then you can call `openWallet` from `useAuthCore`.

```js
const { openWallet } = useAuthCore();

openWallet();
```

To continue exploring Particle Network and the available functions within the `@particle-network/auth-core-modal` SDK, take a look at the resources below:

## Resources
* [Documentation](https://docs.particle.network/)
* [Web Demo](https://web-demo.particle.network/)
* [Blog](https://blog.particle.network/)
* [Solana "Sign in with Google" Example](https://github.com/TABASCOatw/particle-solana-google-example)
* [Particle Network](https://particle.network)

