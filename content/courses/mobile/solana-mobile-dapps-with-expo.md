---
title: Building Solana Mobile dApps with Expo
objectives:
  - Create Solana dApps with Expo
  - Use mobile-specific peripherals and capabilities
  - Integrate ecosystem libraries into your mobile dApps
description: "How to use Solana in your Expo apps."
---

## Summary

- Expo is an open-source collection of tools and libraries that wrap around
  React Native, much like Next.js is a framework built on top of React.
- In addition to simplifying the build/deploy process, Expo provides packages
  that give you access to mobile devices' peripherals and capabilities.
- A lot of Solana ecosystem libraries don't support React native out of the box,
  but you can typically use them with the right
  [polyfills](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill).

## Lesson

So far in exploring Solana Mobile, we've used vanilla React Native to build very
simple mobile dApps. Just like many web developers opt to use frameworks built
on top of React, like Next.js, many React Native developers opt to use
frameworks and tooling that simplify the React Native development, testing, and
deployment process. The most common of these is
[React Native Expo](https://docs.expo.dev/tutorial/introduction/).

This lesson will explore two primary topics:

1. How to use React Native Expo to streamline React Native development
2. How to integrate JS/TS libraries from the Solana ecosystem that don't
   explicitly support React Native (e.g. Metaplex)

These topics are best explored in a hands-on manner, so the majority of this
lesson will be spent in the lab.

### React Native Expo

Expo is an open-source collection of tools and libraries that wrap around React
Native, much like Next.js is a framework built on top of React.

Expo consists of three main parts:

1. Expo CLI
2. The Expo Go App
3. A suite of libraries that grant access to various mobile device capabilities.

The Expo CLI is a build and debugging tool that helps make all of the magic
happen. Chances are, you'll only have to interact with it when you're building
or starting a development server. It just works.

The [Expo Go App](https://expo.dev/client) is a really cool piece of tech that
allows _most_ apps to be developed without using an emulator or physical device.
You download the app, you scan the QR from the build output and then you have a
working dev environment right on your phone. Unfortunately, this will not work
with the Solana mobile SDK. Coming from the
[Solana Expo setup article](https://docs.solanamobile.com/react-native/expo):

> The traditional Expo Go development flow is only limited to certain
> hand-picked modules and does not support further customized native code, which
> Solana Mobile SDKs need. Instead, we'll need to use a custom development build
> which makes Solana Mobile React Native libraries (i.e Mobile Wallet Adapter)
> fully compatible with Expo.

Lastly, and most importantly, Expo does an amazing job providing
[easy-to-use libraries](https://docs.expo.dev/versions/latest/) that give you
access to the device's onboard peripherals, such as camera, battery, and
speakers. The libraries are intuitive and the documentation is phenomenal.

#### How to create an Expo app

To get started with Expo, you first need the prerequisite setup described in the
[Introduction to Solana Mobile lesson](/content/courses/mobile/intro-to-solana-mobile.md).
After that, you'll want to sign up for an
[Expo Application Services (EAS) account](https://expo.dev/signup).

Once you have an EAS account, you can install the EAS CLI and log in:

```bash
# For npm users
npm install --global eas-cli

# For pnpm users
pnpm add --global eas-cli

# After installation, log in with:
eas login
```

Finally, you can scaffold a new Expo app using the `create-expo-app` command:

```bash
npx create-expo-app
```

#### How to build and run an Expo app

For some apps, Expo makes building really easy with the Expo Go App. The Expo Go
App builds the project on a remote server and deploys to whatever emulator or
device you specify.

Unfortunately, that won't work with Solana Mobile applications. Instead, you'll
need to build locally. To do that, you need an additional configuration file,
`eas.json`, specifying that the project distribution is "internal." You'll need
the following inside this file:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

With the EAS config file created, you can build using the
`npx eas build --local` command plus relevant flags for any additional
requirements. For example, the following will build the project locally with a
development profile specifically for Android:

```bash
npx eas build --profile development --platform android --local
```

You then need to install the output APK to your device or emulator. If you're
using an emulator, this is as simple as dragging the APK file onto the emulator
window. If you're using a physical device, you'll have to use Android Debug
Bridge (ADB):

```bash
adb install your-apk-file.apk
```

The installed APK is a scaffold app from Expo that facilitates a number of
things, including running your app. To load your application inside of it, you
need to start the development server:

```bash
npx expo start --dev-client --android
```

#### How to add Expo SDK packages to your app

The Expo SDK contains packages to simplify all kinds of things related to React
Native development, from UI elements to using device peripherals. You can see
all of the packages on the
[Expo SDK docs](https://docs.expo.dev/versions/latest/).

As an example, you would add
[pedometer functionality](https://docs.expo.dev/versions/latest/sdk/pedometer/)
to your app by installing the `expo-sensors` package:

```bash
npx expo install expo-sensors
```

Then you can import it in your code as you would normally expect when using
JS/TS.

```tsx
import { Pedometer } from "expo-sensors";
```

Depending on the package, there may be additional setup required. Be sure to
read the [docs](https://docs.expo.dev/versions/latest/) when working with a new
package.

### Integrate ecosystem libraries into your Expo app

Not all React and Node libraries work with React Native out of the box. You
either need to find libraries that are specifically created to work with React
Native or create a workaround yourself.

When working with Solana specifically, the vast majority of ecosystem libraries
do not support React Native out of the box. Fortunately, to get them to play
well in a React Native environment, all we have to do is configure Expo with the
correct [polyfills](https://developer.mozilla.org/en-US/docs/Glossary/Polyfill).

Polyfills are replacement core libraries for environments that are not running
Node.js. Expo does not run Node.js. Unfortunately, it can be tough to know which
polyfills you need for any given application. Unless you know ahead of time,
debugging polyfills means looking at the compiler errors and searching stack
overflow. If it doesn't build, it's normally a polyfill problem.

Fortunately, we've compiled a list of polyfills you'll need for not only some of
the standard Solana libraries but also for Metaplex.

#### Solana Polyfills

For a Solana + Expo app, you'll need the following:

- `@solana-mobile/mobile-wallet-adapter-protocol`: A React Native/Javascript API
  enabling interaction with MWA-compatible wallets.
- `@solana-mobile/mobile-wallet-adapter-protocol-web3js`: A convenience wrapper
  to use common primitives
  from [@solana/web3.js](https://github.com/solana-labs/solana-web3.js) – such
  as `Transaction` and `Uint8Array`.
- `@solana/web3.js`: Solana Web Library for interacting with the Solana network
  through the [JSON RPC API](https://docs.solana.com/api/http).
- `expo-crypto`: Secure random number generator polyfill
  for `web3.js` underlying Crypto library on Expo.
- `buffer`: Buffer polyfill needed for `web3.js` on React Native.

```bash
# Using npm
npm install @solana-mobile/mobile-wallet-adapter-protocol \
            @solana-mobile/mobile-wallet-adapter-protocol-web3js \
            @solana/web3.js \
            expo-crypto \
            buffer

# Using pnpm
pnpm add @solana-mobile/mobile-wallet-adapter-protocol \
         @solana-mobile/mobile-wallet-adapter-protocol-web3js \
         @solana/web3.js \
         expo-crypto \
         buffer
```

#### Metaplex Polyfills

If you want to use the Metaplex SDK, you'll need to add the Metaplex library
plus a few additional polyfills:

- `@metaplex-foundation/mpl-token-metadata@3.2.1` - Metaplex Token Metadata
  Program Library
- `@metaplex-foundation/umi@0.9.2` - Unified Metaplex Interface (UMI) Core
  Library
- `@metaplex-foundation/umi-bundle-defaults@0.9.2` - Default UMI Plugins Bundle
- `@metaplex-foundation/umi-serializers@0.9.0` - UMI Serializers for Data
  Encoding/Decoding
- `@metaplex-foundation/umi-signer-wallet-adapters@0.9.2` - UMI Wallet Adapter
  Signers

- Several more polyfills

  - `text-encoding`
  - `browserify-zlib`
  - `react-native-url-polyfill`

```bash
  # Using npm
  npm install @metaplex-foundation/mpl-token-metadata@3.2.1 \
            @metaplex-foundation/umi@0.9.2 \
            @metaplex-foundation/umi-bundle-defaults@0.9.2 \
            @metaplex-foundation/umi-serializers@0.9.0 \
            @metaplex-foundation/umi-signer-wallet-adapters@0.9.2 \
            text-encoding \
            browserify-zlib \
            react-native-url-polyfill \
  # Using pnpm
  pnpm add @metaplex-foundation/mpl-token-metadata@3.2.1 \
            @metaplex-foundation/umi@0.9.2 \
            @metaplex-foundation/umi-bundle-defaults@0.9.2 \
            @metaplex-foundation/umi-serializers@0.9.0 \
            @metaplex-foundation/umi-signer-wallet-adapters@0.9.2 \
            text-encoding \
            browserify-zlib \
            react-native-url-polyfill \
```

All of the libraries that the above polyfills are meant to replace are utilized
by the Metaplex library in the background. It's unlikely you'll be importing any
of them into your code directly. Because of this, you'll need to register the
polyfills using a `metro.config.js` and `babel.config.js` file. This will ensure
that Metaplex uses the polyfills instead of the usual Node.js libraries that
aren't supported in React Native. Below is an example `metro.config.js` file:

```js
// Import the default Expo Metro config
const { getDefaultConfig } = require("@expo/metro-config");

// Get the default Expo Metro configuration
const defaultConfig = getDefaultConfig(__dirname);

// Customize the configuration to include your extra node modules
defaultConfig.resolver.extraNodeModules = {
  url: require.resolve("react-native-url-polyfill"),
  zlib: require.resolve("browserify-zlib"),
  crypto: require.resolve("expo-crypto"),
};

// Export the modified configuration
module.exports = defaultConfig;
```

Below is an example `babel.config.js` file:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            buffer: "buffer",
            "@metaplex-foundation/umi/serializers":
              "@metaplex-foundation/umi-serializers",
          },
        },
      ],
    ],
  };
};
```

### Putting it all together

As with most new tools or frameworks, initial setup can be challenging. The good
news is that once you have the application compiling and running, there are very
few differences in the code you write for a web vs mobile app, and there are
virtually no differences when comparing the code you write for a React Native vs
Expo app.

## Lab

Let's practice this together by building the Mint-A-Day app, where users will
able to mint a single NFT snapshot of their lives daily, creating a permanent
diary of sorts.

To mint the NFTs we'll be using Metaplex's Javascript SDK along with
[pinata.cloud](https://pinata.cloud/) to store images and metadata. All of our
onchain work will be on Devnet.

The first half of this lab is cobbling together the needed components to make
Expo, Solana, and Metaplex all work together. We'll do this modularly so you'll
know what aspects of the boilerplate align with which section.

### 1. Scaffold, build, and run a local Expo app

This first section will get a typescript Expo app running on an emulator. If you
already have a React Native dev environment, skip step 0.

#### 0. Set up React Native dev environment

You'll need React Native installed on your machine as well as a running emulator
or physical device.
[You can accomplish this all with the React Native quickstart](https://reactnative.dev/docs/environment-setup?guide=native).
There are also more details about this setup in the
[Introduction to Solana Mobile lesson](/content/courses/mobile/intro-to-solana-mobile.md#0-prerequisites)

<Callout type="note">Even though we are using Expo, you'll need to follow the
React Native CLI guide for initial setup.</Callout>

<Callout type="note">If you are running an emulator, it is highly recommend to
use a newer phone version to emulate along with providing several GB of RAM for
it to run. We use 5GB of ram on our side.</Callout>

#### 1. Sign up for Expo EAS CLI

To simplify the Expo process, you'll want an Expo Application Services (EAS)
account. This will help you build and run the application.

First sign up for an [EAS account](https://expo.dev/signup).

Then, install the EAS CLI and log in:

```bash
# For npm users
npm install --global eas-cli

# For pnpm users
pnpm add --global eas-cli

# After installation, log in with:
eas login
```

#### 2. Create the app scaffold

Let’s create our app with the following:

```bash
npx create-expo-app -t expo-template-blank-typescript solana-expo
cd solana-expo
```

This uses `create-expo-app` to generate a new scaffold for us based on the
`expo-template-blank-typescript` template. This is just an empty Typescript
React Native app.

#### 3. Local build config

Expo defaults to building on a remote server but we need to build locally for
Solana Mobile to work correctly. We'll need to add an new config file that lets
the compiler know what we're doing. Create a file called `eas.json` in the root
of your directory.

```bash
touch eas.json
```

Copy and paste the following into the newly created `eas.json`:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": { "ANDROID_SDK_ROOT": "/path/to/AndroidSDK" }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

### **Important:**

- Replace `"/path/to/AndroidSDK"` with the actual path to your Android SDK.
- To find the SDK path, you can navigate to **Android Studio** > **SDK
  Manager** > **Android SDK Location**. Copy the path and replace it in the
  `ANDROID_SDK_ROOT` field.

#### 4. Build and Emulate

Now let's build the project. You will choose `y` for every answer. This will
take a while to complete.

```bash
npx eas build --profile development --platform android --local
```

When the command is done, you will get an output file at the root of your
directory. This file will have a naming format of `build-XXXXXXXXXXX.apk`.
Locate this file in your file explorer and **_drag it_** into your emulator. The
emulator should show a message that it is installing the new APK. When it
finishes installing, you should see the APK as an app icon in the emulator.

#### Troubleshooting

#### 1. Incorrect JDK Version or Missing Android SDK

Follow the
[React Native CLI setup instructions](https://reactnative.dev/docs/environment-setup)
to ensure your local environment is properly configured for Android development.
You'll need:

- **JDK Version 11**: Ensure that Java Development Kit (JDK) version 11 is
  installed.
- **Android SDK**: Install and configure the Android SDK through the Android
  Studio SDK Manager.
- **ANDROID_HOME Environment Variable**: Set up the `ANDROID_HOME` environment
  variable to point to your Android SDK installation.

#### 2. Missing Android NDK

If you encounter errors related to a missing Android NDK, follow these steps to
install it:

1. Open **Android Studio**.
2. Navigate to **File -> Project Structure -> SDK Location**.
3. Under "Android NDK Location," select **Download Android NDK**.

This should resolve issues related to the missing Android NDK.

![Android NDK Download](https://docs.solanamobile.com/assets/images/ndk-download-c7adebb1cb08c1d5e77d7c02aff3f167.png)

#### **Optional: Create a Remote Development Build**

If you prefer to create the development build remotely using Expo's EAS
services, you can skip the local build by using the following command:

```bash
npx eas build --profile development --platform android
```

- This command will upload your project to Expo's servers and create the
  development build in the cloud.
- Once the build is complete, you will receive a download link to the APK. You
  can download the APK and install it on your emulator or device just like
  before.

The app that was installed is just a
[Custom Dev Build](https://docs.expo.dev/develop/development-builds/introduction/)
app from Expo. The last thing you'll need to do is run the following command to
run the development server:

```bash
npx expo start --dev-client --android
```

This should open and run the app in your Android emulator.

**_NOTE_** Every time you add in new native dependencies, you'll have to build
and re-install the app. Anything visual or logic-based should be captured by the
hot-reloader.

### 2. Configure your Expo app to work with Solana

Now that we have an Expo app up and running, we need to add our Solana
dependencies, including installing a wallet we can use in the emulator. If you
already have a Devnet-enabled wallet installed you can skip step 0.

#### 0. Install a Devnet-enabled Solana wallet

You'll need a wallet that supports Devnet to test with. In
[our Mobile Wallet Adapter lesson](/content/courses/mobile/mwa-deep-dive.md) we
created one of these. Let's install it from the solution branch in a different
directory from our app:

```bash
cd ..
git clone https://github.com/Unboxed-Software/react-native-fake-solana-wallet
cd react-native-fake-solana-wallet
git checkout solution
npm run install
```

The wallet should be installed on your emulator or device. Make sure to open the
newly installed wallet and airdrop yourself some SOL.

Make sure to return to the wallet directory as we'll be working there the rest
of the lab.

```bash
cd ..
cd solana-expo
```

#### 1. Install Solana dependencies

We will install some basic Solana dependencies that are likely to be needed by
all Solana mobile apps. This will include some polyfills that allow otherwise
incompatible packages to work with React native:

```bash
# Using npm
npm install @solana-mobile/mobile-wallet-adapter-protocol \
            @solana-mobile/mobile-wallet-adapter-protocol-web3js \
            @solana/web3.js \
            expo-crypto \
            buffer

# Using pnpm
pnpm add @solana-mobile/mobile-wallet-adapter-protocol \
         @solana-mobile/mobile-wallet-adapter-protocol-web3js \
         @solana/web3.js \
         expo-crypto \
         buffer
```

#### 2. Add Solana boilerplate providers

Next, let's add some Solana boilerplate that can springboard you into most
Solana-based apps.

Create two new folders: `components` and `screens`.

We are going to use some boilerplate code from the
[first Mobile lesson](/content/courses/mobile/intro-to-solana-mobile.md). We
will be copying over `components/AuthProvider.tsx` and
`components/ConnectionProvider.tsx`. These files provide us with a `Connection`
object as well as some helper functions that authorize our dapp.

Create file `components/AuthProvider.tsx` and copy the contents
[of our existing Auth Provider from Github](https://raw.githubusercontent.com/Unboxed-Software/solana-advance-mobile/main/components/AuthProvider.tsx)
into the new file.

Secondly, create file `components/ConnectionProvider.tsx` and copy the contents
[of our existing Connection Provider from Github](https://raw.githubusercontent.com/Unboxed-Software/solana-advance-mobile/main/components/ConnectionProvider.tsx)
into the new file.

then, create file `polyfills.ts` and copy the contents from below to that file.
This will ensure that few native node.js packages work in our app.

```js
import "react-native-url-polyfill/auto";
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";

global.Buffer = Buffer;
global.TextEncoder = require("text-encoding").TextEncoder;

// getRandomValues polyfill
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

(() => {
  if (typeof crypto === "undefined") {
    Object.defineProperty(window, "crypto", {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();
```

Now let's create a boilerplate for our main screen in `screens/MainScreen.tsx`:

```tsx
import { View, Text } from "react-native";
import React from "react";

export function MainScreen() {
  return (
    <View>
      <Text>Solana Expo App</Text>
    </View>
  );
}
```

Finally, let's change `App.tsx` to wrap our application in the two providers we
just created:

```tsx
import "./polyfills";
import { ConnectionProvider } from "./components/ConnectionProvider";
import { AuthorizationProvider } from "./components/AuthProvider";
import { clusterApiUrl } from "@solana/web3.js";
import { MainScreen } from "./screens/MainScreen";

export default function App() {
  const cluster = "devnet";
  const endpoint = clusterApiUrl(cluster);

  return (
    <ConnectionProvider
      endpoint={endpoint}
      cluster={cluster}
      config={{ commitment: "processed" }}
    >
      <AuthorizationProvider cluster={cluster}>
        <MainScreen />
      </AuthorizationProvider>
    </ConnectionProvider>
  );
}
```

Notice we've imported polyfills at the top of the file. These are necessary for
the Solana dependencies to run correctly.

#### 3. Build and run Solana boilerplate

Let's make sure everything is working and compiling correctly. In Expo, anytime
you change the dependencies, you'll need to rebuild and re-install the app.

**_Optional:_** To avoid possible build version conflicts, you may want to
_uninstall_ the previous version before you drag and drop the new one in.

Build:

```bash
npx eas build --profile development --platform android --local
```

Install: **_Drag_** the resulting build file into your emulator.

Run:

```bash
npx expo start --dev-client --android
```

Everything should compile and you should have a boilerplate Solana Expo app.

### 3. Configure your Expo app to work with Metaplex

Metaplex is your one-stop-shop for all of your NFT API needs. However, it
requires a little more setup. The good news is if you ever want to fetch, mint
or edit NFTs in your future apps, you'll have another boilerplate to here that
you can reference.

#### 1. Install Metaplex dependencies

The Metaplex SDK abstracts away a lot of the minutia of working with NFTs,
however it was written largely for Node.js, so we'll need several more polyfills
to make it work:

```bash
# Using npm
npm install @metaplex-foundation/mpl-token-metadata@3.2.1 \
            @metaplex-foundation/umi@0.9.2 \
            @metaplex-foundation/umi-bundle-defaults@0.9.2 \
            @metaplex-foundation/umi-serializers@0.9.0 \
            @metaplex-foundation/umi-signer-wallet-adapters@0.9.2 \
            text-encoding \
            browserify-zlib \
            react-native-url-polyfill \

# Using pnpm
pnpm add @metaplex-foundation/mpl-token-metadata@3.2.1 \
         @metaplex-foundation/umi@0.9.2 \
         @metaplex-foundation/umi-bundle-defaults@0.9.2 \
         @metaplex-foundation/umi-serializers@0.9.0 \
         @metaplex-foundation/umi-signer-wallet-adapters@0.9.2 \
         text-encoding \
         browserify-zlib \
         react-native-url-polyfill \
```

#### 2. Polyfill config

To ensure Metaplex works correctly in a React Native environment, we need to set
up some polyfills. Follow these steps:

1. Create a `polyfill.ts` file at the root of your project:

```bash
touch polyfill.ts
```

2. Copy and paste the following code into `polyfill.ts`:

```typescript
import "react-native-url-polyfill/auto";
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";

global.Buffer = Buffer;
global.TextEncoder = require("text-encoding").TextEncoder;

// getRandomValues polyfill
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== "undefined" ? crypto : new Crypto();

(() => {
  if (typeof crypto === "undefined") {
    Object.defineProperty(window, "crypto", {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();
```

3. Import the polyfill at the top of your `App.tsx` file:

```typescript
import "./polyfill";
```

4. Create a `metro.config.js` file in your project root:

```bash
touch metro.config.js
```

5. Copy and paste the following into `metro.config.js`:

```js
// Import the default Expo Metro config
const { getDefaultConfig } = require("@expo/metro-config");
// Get the default Expo Metro configuration
const defaultConfig = getDefaultConfig(__dirname);
// Customize the configuration to include your extra node modules
defaultConfig.resolver.extraNodeModules = {
  url: require.resolve("react-native-url-polyfill"),
  zlib: require.resolve("browserify-zlib"),
  crypto: require.resolve("expo-crypto"),
};
// Export the modified configuration
module.exports = defaultConfig;
```

6. Update your `babel.config.js` file with the following content:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            buffer: "buffer",
            "@metaplex-foundation/umi/serializers":
              "@metaplex-foundation/umi-serializers",
          },
        },
      ],
    ],
  };
};
```

These configurations ensure that the necessary polyfills are in place and that
Metaplex can use them properly in your React Native Expo project.

#### 3. Metaplex provider

We're going to create a Metaplex provider file that will help us access a `Umi`
object. This `Umi` object is what gives us access to all of the functions we'll
need like `fetch` and `create`. To do this we create a new file
`/components/MetaplexProvider.tsx`. Here we pipe our mobile wallet adapter into
an `IdentitySigner` for the `Umi` object to use. This allows it to call several
privileged functions on our behalf:

```tsx
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useMemo } from "react";
import {
  WalletAdapter,
  walletAdapterIdentity,
} from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import { Account } from "./AuthProvider";

type Web3JsTransactionOrVersionedTransaction =
  | Transaction
  | VersionedTransaction;

export const useMetaplex = (
  connection: Connection,
  selectedAccount: Account | null,
  authorizeSession: (wallet: Web3MobileWallet) => Promise<Account>,
) => {
  return useMemo(() => {
    if (!selectedAccount || !authorizeSession) {
      return { umi: null };
    }
    const mwaIdentity: WalletAdapter = {
      publicKey: selectedAccount.publicKey,
      signMessage: async (message: Uint8Array): Promise<Uint8Array> => {
        return await transact(async (wallet: Web3MobileWallet) => {
          await authorizeSession(wallet);

          const signedMessages = await wallet.signMessages({
            addresses: [selectedAccount.publicKey.toBase58()],
            payloads: [message],
          });

          return signedMessages[0];
        });
      },
      signTransaction: async <
        T extends Web3JsTransactionOrVersionedTransaction,
      >(
        transaction: T,
      ): Promise<T> => {
        return await transact(async (wallet: Web3MobileWallet) => {
          await authorizeSession(wallet);

          const signedTransactions = await wallet.signTransactions({
            transactions: [transaction],
          });

          return signedTransactions[0];
        });
      },
      signAllTransactions: async <
        T extends Web3JsTransactionOrVersionedTransaction,
      >(
        transactions: T[],
      ): Promise<T[]> => {
        return transact(async (wallet: Web3MobileWallet) => {
          await authorizeSession(wallet);
          const signedTransactions = await wallet.signTransactions({
            transactions: transactions,
          });
          return signedTransactions;
        });
      },
    };

    const umi = createUmi(connection).use(mplTokenMetadata());
    umi.use(walletAdapterIdentity(mwaIdentity));
    return { umi };
  }, [connection, selectedAccount, authorizeSession]);
};
```

#### 4. NFT Provider

We're also making a higher-level NFT provider that helps with NFT state
management. It combines all three of our previous providers:
`ConnectionProvider`, `AuthProvider`, and `MetaplexProvider` to allow us to
create our `Metaplex` object. We will fill this out at a later step; for now, it
makes for a good boilerplate.

Let's create the new file `components/NFTProvider.tsx`:

```tsx
import "react-native-url-polyfill/auto";
import { useConnection } from "./ConnectionProvider";
import { Account, useAuthorization } from "./AuthProvider";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { useMetaplex } from "./MetaplexProvider";

export interface NFTProviderProps {
  children: ReactNode;
}

export interface NFTContextState {}

const DEFAULT_NFT_CONTEXT_STATE: NFTContextState = {};

const NFTContext = createContext<NFTContextState>(DEFAULT_NFT_CONTEXT_STATE);

export function NFTProvider(props: NFTProviderProps) {
  const { children } = props;

  const { connection } = useConnection();
  const { authorizeSession } = useAuthorization();
  const [account, setAccount] = useState<Account | null>(null);
  const { umi } = useMetaplex(connection, account, authorizeSession);

  const state = {};

  return <NFTContext.Provider value={state}>{children}</NFTContext.Provider>;
}

export const useNFT = (): NFTContextState => useContext(NFTContext);
```

Notice we've added yet another polyfill to the top
`import "react-native-url-polyfill/auto";`

#### 5. Wrap provider

Now, let's wrap our new `NFTProvider` around `MainScreen` in `App.tsx`:

```tsx
import "./polyfills";
import { ConnectionProvider } from "./components/ConnectionProvider";
import { AuthorizationProvider } from "./components/AuthProvider";
import { clusterApiUrl } from "@solana/web3.js";
import { MainScreen } from "./screens/MainScreen";
import { NFTProvider } from "./components/NFTProvider";

export default function App() {
  const cluster = "devnet";
  const endpoint = clusterApiUrl(cluster);

  return (
    <ConnectionProvider
      endpoint={endpoint}
      cluster={cluster}
      config={{ commitment: "processed" }}
    >
      <AuthorizationProvider cluster={cluster}>
        <NFTProvider>
          <MainScreen />
        </NFTProvider>
      </AuthorizationProvider>
    </ConnectionProvider>
  );
}
```

#### 6. Build and run

Lastly, let's build and re-install the app to make sure things are still
working.

Build:

```bash
npx eas build --profile development --platform android --local
```

Install:

**_Drag_** the resulting build file into your emulator.

Run:

```bash
npx expo start --dev-client --android
```

### 4. Configure your Expo app to take and upload photos

Everything we've done to this point is effectively boilerplate. We need to add
the functionality we intend for our Mint-A-Day app to have. Mint-A-day is a
daily snapshot app. It lets users take a snapshot of their life daily in the
form of minting an NFT.

The app will need access to the device's camera and a place to remotely store
the captured images. Fortunately, Expo SDK can provide access to the camera and
[Pinata.cloud](https://pinata.cloud/) can store your NFT files for free.

#### 1. Camera setup

Let's start by setting up the Expo-specific dependency we'll be using:
`expo-image-picker`. This lets us use the device's camera to take pictures that
we'll subsequently turn into NFTs. We're specifically using the image picker
rather than the camera since emulators don't have cameras. This package will
simulate a camera for us in the emulator. Install it with the following command:

```bash
npx expo install expo-image-picker
```

In addition to installation, the `expo-image-picker` package needs to be added
as a plugin in `app.json`:

```json
  "expo": {
    // ....
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "The app accesses your photos to let you use images to create solana NFTs"
        }
      ]
    ],
    // ....
  }
```

This particular dependency makes it super simple to use the camera. To allow the
user to take a picture and return the image all you have to do is call the
following:

```tsx
const result = await ImagePicker.launchCameraAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 1,
});
```

No need to add this anywhere yet - we'll get to it in a few steps.

#### 2. Pinata.cloud setup

The last thing we need to do is set up our access to
[Pinata.cloud](https://pinata.cloud/). We'll need to get an API key as well as a
gateway domain and add it as an environment variable.

We'll be using Pinata.cloud to host our NFTs with IPFS since they do this for
free. [Sign up, and create an API key](https://app.pinata.cloud/signin). Keep
this API key private.

Best practices suggest keeping API keys as well as the gateway domain in a
`.env` file with `.env` added to your `.gitignore`. It's also a good idea to
create a `.env.example` file that can be committed to your repo and shows what
environment variables are needed for the project.

Create both files, in the root of your directory and add `.env` to your
`.gitignore` file.

Then, add your API key to the `.env` file with the name
`EXPO_PUBLIC_PINATA_CLOUD_API`. Now you'll be able to access your API key safely
in the application.

Then, add your Gateway domain with the name `EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL`

#### 3. Final build

Build and reinstall if you want to make sure it's all working. This is the last
time we'll have to do this for this lab. Everything else should be hot-loadable.

Build:

```bash
npx eas build --profile development --platform android --local
```

Install:

**_Drag_** the resulting build file into your emulator.

Run:

```bash
npx expo start --dev-client --android
```

### 5. Add functionality to complete your Expo app

We're through the setup! Let's create the actual functionality for our
Mint-A-Day app. Fortunately, there are only two files we have to focus on now:

- `NFTProvider.tsx` will largely manage our app state and NFT data.
- `MainScreen.tsx` will capture input and show our NFTs

The app itself is relatively straightforward. The general flow is:

1. The user connects (authorizes) using the `transact` function and by calling
   `authorizeSession` inside the callback
2. Our code then uses the `Umi` object to fetch all of the NFTs created by the
   user
3. If an NFT has not been created for the current day, allow the user to take a
   picture, upload it, and mint it as an NFT

#### 1. NFT Provider

`NFTProvider.tsx` will control the state with our custom `NFTProviderContext`.
This should have the following fields:

- `publicKey: PublicKey | null` - The NFT creator's public key
- `isLoading: boolean` - Manages loading state
- `loadedNFTs:  DigitalAsset[] | null` - An array of the user's snapshot NFTs
- `nftOfTheDay:  DigitalAsset | null` - A reference to the NFT created today
- `connect: () => void` - A function for connecting to the Devnet-enabled wallet
- `fetchNFTs: () => void` - A function that fetches the user's snapshot NFTs
- `createNFT: (name: string, description: string, fileUri: string) => void` - A
  function that creates a new snapshot NFT
- `account: Account | null` - An object to store mwa account

```tsx
export interface NFTContextState {
  publicKey: PublicKey | null;
  isLoading: boolean;
  loadedNFTs: DigitalAsset[] | null;
  nftOfTheDay: DigitalAsset | null;
  connect: () => void;
  fetchNFTs: () => void;
  createNFT: (
    name: string,
    description: string,
    fileUri: ImagePickerAsset
  ) => void;
  account: Account | null;
}
}
```

The state flow here is: connect, fetchNFTs, and then createNFT. We'll walk
through the code for each of them and then show you the entire file at the end:

1. `connect` - This function will connect and authorize the app, and then store
   the resulting `publicKey` into the state.

```tsx
const connect = useCallback(async (): Promise<void> => {
  try {
    if (isLoading) return;
    setIsLoading(true);
    await transact(async wallet => {
      const account = await authorizeSession(wallet);
      setAccount(account);
    });
  } catch (error) {
    console.log("error connecting wallet");
  } finally {
    setIsLoading(false);
  }
}, [authorizeSession]);
```

2. `fetchNFTs` - This function will fetch the NFTs using Metaplex's Umi object:

```tsx
const fetchNFTs = async () => {
  if (!umi || !account || isLoading) return;

  setIsLoading(true);

  try {
    const nfts = await fetchAllDigitalAssetByCreator(
      umi,
      addressToMetaplexPublicKey(account.publicKey),
    );

    setLoadedNFTs(nfts);

    // Check if we already took a snapshot today
    const nftOfTheDayIndex = nfts.findIndex(nft => {
      return formatDate(new Date(Date.now())) === nft.metadata.name;
    });

    if (nftOfTheDayIndex) {
      setNftOfTheDay(nfts[nftOfTheDayIndex]);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setIsLoading(false);
  }
};
```

3. `createNFT` - This function will upload a file to Pinata.cloud, and then use
   Metaplex to create and mint an NFT to your wallet. This comes in three parts,
   uploading the image, uploading the metadata and then minting the NFT.

   To upload to Pinata.cloud you just make a POST with your API key and the
   image/metadata as the body.

   We'll create two helper functions for uploading the image and metadata
   separately, then tie them together into a single `createNFT` function:

```tsx
// https://docs.pinata.cloud/quickstart
const uploadImage = async (
  file: ImagePickerAsset,
  name: string,
): Promise<string | undefined> => {
  try {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: "image/jpeg",
      name,
    });

    const pinataMetadata = JSON.stringify({
      name,
    });
    formData.append("pinataMetadata", pinataMetadata);
    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append("pinataOptions", pinataOptions);

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_PINATA_CLOUD_API}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      },
    );
    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.log(error);
  }
};

const uploadMetadata = async (
  name: string,
  description: string,
  imageCID: string,
): Promise<string | undefined> => {
  try {
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_PINATA_CLOUD_API}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pinataContent: {
            name,
            description,
            image: `${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/${imageCID}`,
          },
          pinataOptions: {
            cidVersion: 0,
          },
          pinataMetadata: {
            name,
          },
        }),
      },
    );

    const data = await response.json();

    return data.IpfsHash;
  } catch (error) {
    console.log(error);
  }
};
```

Minting the NFT after the image and metadata have been uploaded is as simple as
calling ` createNft(umi, ...options)`. Below shows the `createNFT` function
tying everything together:

```tsx
const createNFT = async (
  name: string,
  description: string,
  fileUri: ImagePickerAsset,
) => {
  if (!umi || !account || isLoading) return;

  setIsLoading(true);
  try {
    const imageCID = await uploadImage(fileUri, name);
    if (imageCID) {
      const metadataCID = await uploadMetadata(name, description, imageCID);

      const mint = generateSigner(umi);

      await createNft(umi, {
        mint,
        name,
        uri: `${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/${metadataCID}`,
        sellerFeeBasisPoints: percentAmount(0),
      }).sendAndConfirm(umi, { send: { skipPreflight: true } });

      const asset = await fetchDigitalAsset(umi, mint.publicKey);

      setNftOfTheDay(asset);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setIsLoading(false);
  }
};
```

We'll put all of the above into the `NFTProvider.tsx` file. All together, this
looks as follows:

```tsx
import "react-native-url-polyfill/auto";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useConnection } from "./ConnectionProvider";
import { transact } from "@solana-mobile/mobile-wallet-adapter-protocol";
import { Account, useAuthorization } from "./AuthProvider";
import { useMetaplex } from "./MetaplexProvider";
import {
  createNft,
  DigitalAsset,
  fetchAllDigitalAssetByCreator,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  publicKey as addressToMetaplexPublicKey,
  generateSigner,
  percentAmount,
} from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";
import { ImagePickerAsset } from "expo-image-picker";

export interface NFTProviderProps {
  children: ReactNode;
}

export interface NFTContextState {
  publicKey: PublicKey | null;
  isLoading: boolean;
  loadedNFTs: DigitalAsset[] | null;
  nftOfTheDay: DigitalAsset | null;
  connect: () => void;
  fetchNFTs: () => void;
  createNFT: (
    name: string,
    description: string,
    fileUri: ImagePickerAsset,
  ) => void;
  account: Account | null;
}

const DEFAULT_NFT_CONTEXT_STATE: NFTContextState = {
  publicKey: null,
  isLoading: false,
  loadedNFTs: null,
  nftOfTheDay: null,
  connect: () => PublicKey.default,
  fetchNFTs: () => {},
  createNFT: (
    name: string,
    description: string,
    fileUri: ImagePickerAsset,
  ) => {},
  account: null,
};

const NFTContext = createContext<NFTContextState>(DEFAULT_NFT_CONTEXT_STATE);

export function formatDate(date: Date) {
  return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
}

export function NFTProvider(props: NFTProviderProps) {
  const { children } = props;
  const { connection } = useConnection();
  const { authorizeSession } = useAuthorization();
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nftOfTheDay, setNftOfTheDay] = useState<DigitalAsset | null>(null);
  const [loadedNFTs, setLoadedNFTs] = useState<DigitalAsset[] | null>(null);

  const { umi } = useMetaplex(connection, account, authorizeSession);

  const connect = useCallback(async (): Promise<void> => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      await transact(async wallet => {
        const account = await authorizeSession(wallet);
        setAccount(account);
      });
    } catch (error) {
      console.log("error connecting wallet");
    } finally {
      setIsLoading(false);
    }
  }, [authorizeSession]);

  const fetchNFTs = async () => {
    if (!umi || !account || isLoading) return;

    setIsLoading(true);

    try {
      const nfts = await fetchAllDigitalAssetByCreator(
        umi,
        addressToMetaplexPublicKey(account.publicKey),
      );

      setLoadedNFTs(nfts);

      // Check if we already took a snapshot today
      const nftOfTheDayIndex = nfts.findIndex(nft => {
        return formatDate(new Date(Date.now())) === nft.metadata.name;
      });

      if (nftOfTheDayIndex) {
        setNftOfTheDay(nfts[nftOfTheDayIndex]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // https://docs.pinata.cloud/quickstart
  const uploadImage = async (
    file: ImagePickerAsset,
    name: string,
  ): Promise<string | undefined> => {
    try {
      if (!file) return;

      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        type: "image/jpeg",
        name,
      });

      const pinataMetadata = JSON.stringify({
        name,
      });
      formData.append("pinataMetadata", pinataMetadata);
      const pinataOptions = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", pinataOptions);

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_PINATA_CLOUD_API}`,
            "Content-Type": "multipart/form-data",
          },
          body: formData,
        },
      );
      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.log(error);
    }
  };

  const uploadMetadata = async (
    name: string,
    description: string,
    imageCID: string,
  ): Promise<string | undefined> => {
    try {
      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_PINATA_CLOUD_API}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pinataContent: {
              name,
              description,
              image: `${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/${imageCID}`,
            },
            pinataOptions: {
              cidVersion: 0,
            },
            pinataMetadata: {
              name,
            },
          }),
        },
      );

      const data = await response.json();

      return data.IpfsHash;
    } catch (error) {
      console.log(error);
    }
  };

  const createNFT = async (
    name: string,
    description: string,
    fileUri: ImagePickerAsset,
  ) => {
    if (!umi || !account || isLoading) return;

    setIsLoading(true);
    try {
      const imageCID = await uploadImage(fileUri, name);
      if (imageCID) {
        const metadataCID = await uploadMetadata(name, description, imageCID);

        const mint = generateSigner(umi);

        await createNft(umi, {
          mint,
          name,
          uri: `${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/${metadataCID}`,
          sellerFeeBasisPoints: percentAmount(0),
        }).sendAndConfirm(umi, { send: { skipPreflight: true } });

        const asset = await fetchDigitalAsset(umi, mint.publicKey);

        setNftOfTheDay(asset);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const publicKey = account?.publicKey ?? null;

  const state = {
    isLoading,
    publicKey,
    nftOfTheDay,
    loadedNFTs,
    connect,
    fetchNFTs,
    createNFT,
    account,
  };

  return <NFTContext.Provider value={state}>{children}</NFTContext.Provider>;
}

export const useNFT = (): NFTContextState => useContext(NFTContext);
```

#### 2. Main Screen

Our main screen will consist of three parts: The image of the day, our action
button, and the carousel of previous snapshots.

The image of the day is displayed on the top half of the app, the action button
right under it, and the carousel under that.

The action button follows the state of our `NFTProvider`: first `connect`, then
`fetchNFTs`, and finally `mintNFT`. Of these, we only need to do some extra work
for `mintNFT`.

The `mintNFT` function uses the Expo library to open up the camera with
`ImagePicker.launchCameraAsync`. When an image is taken, it's local path is
returned. The last thing we need to do is specify when the image was taken. Then
we'll make the name of the NFT the date in `MM.DD.YY` format and store the unix
timestamp as the description. Finally, we pass the image path, name and
description to our `createNFT` function from `NFTProvider` to mint the NFT.

```tsx
const mintNFT = async () => {
  try {
    if (!status?.granted) {
      await requestPermission();
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCurrentImage({
        uri: result.assets[0].uri,
        date: todaysDate,
      });

      createNFT(
        formatDate(todaysDate),
        `${todaysDate.getTime()}`,
        result.assets[0],
      );
    }
  } catch (error) {
    console.log(error);
  }
};
```

The full code for `MainScreen.tsx` is as follows:

```tsx
import {
  View,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  Text,
} from "react-native";
import React, { useEffect } from "react";
import { formatDate, useNFT } from "../components/NFTProvider";
import * as ImagePicker from "expo-image-picker";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#292524",
  },
  titleText: {
    color: "white",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    paddingTop: 30,
  },
  imageOfDay: {
    width: "80%",
    height: "80%",
    resizeMode: "cover",
    margin: 10,
  },
  bottomSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  carousel: {
    justifyContent: "center",
    alignItems: "center",
  },
  carouselText: {
    textAlign: "center",
    color: "white",
  },
  carouselImage: {
    width: 100,
    height: 100,
    margin: 5,
    resizeMode: "cover",
  },
});

export interface NFTSnapshot {
  uri: string;
  date: Date;
}

type NftMetaResponse = {
  name: string;
  description: string;
  image: string;
};
// Placeholder image URL or local source
const PLACEHOLDER: NFTSnapshot = {
  uri: "https://placehold.co/400x400/png",
  date: new Date(Date.now()),
};
const DEFAULT_IMAGES: NFTSnapshot[] = new Array(7).fill(PLACEHOLDER);

export function MainScreen() {
  const {
    fetchNFTs,
    connect,
    publicKey,
    isLoading,
    createNFT,
    loadedNFTs,
    nftOfTheDay,
  } = useNFT();
  const [currentImage, setCurrentImage] =
    React.useState<NFTSnapshot>(PLACEHOLDER);
  const [previousImages, setPreviousImages] =
    React.useState<NFTSnapshot[]>(DEFAULT_IMAGES);
  const todaysDate = new Date(Date.now());
  const [status, requestPermission] = ImagePicker.useCameraPermissions();

  const fetchMetadata = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const metadata = await response.json();
      return metadata as NftMetaResponse;
    } catch (error) {
      console.error("Error fetching metadata:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!loadedNFTs) return;

    const loadSnapshots = async () => {
      const loadedSnapshots = await Promise.all(
        loadedNFTs.map(async loadedNft => {
          if (!loadedNft.metadata.name) return null;
          if (!loadedNft.metadata.uri) return null;

          const metadata = await fetchMetadata(loadedNft.metadata.uri);

          if (!metadata) return null;

          const { image, description } = metadata;

          if (!image || !description) return null;

          const unixTime = Number(description);
          if (isNaN(unixTime)) return null;

          return {
            uri: image,
            date: new Date(unixTime),
          } as NFTSnapshot;
        }),
      );

      // Filter out null values
      const cleanedSnapshots = loadedSnapshots.filter(
        (snapshot): snapshot is NFTSnapshot => snapshot !== null,
      );

      // Sort by date
      cleanedSnapshots.sort((a, b) => b.date.getTime() - a.date.getTime());

      setPreviousImages(cleanedSnapshots);
    };

    loadSnapshots();
  }, [loadedNFTs]);

  useEffect(() => {
    if (!nftOfTheDay) return;

    const fetchNftOfTheDayMetadata = async () => {
      try {
        if (!nftOfTheDay.metadata.uri) {
          console.error("No metadata URI found for nftOfTheDay");
          return;
        }

        const response = await fetchMetadata(nftOfTheDay.metadata.uri);

        if (!response?.image) {
          console.error("No image found in nftOfTheDay metadata");
          return;
        }

        setCurrentImage({
          uri: response.image,
          date: todaysDate,
        });
      } catch (error) {
        console.error("Error fetching nftOfTheDay metadata:", error);
      }
    };

    fetchNftOfTheDayMetadata();
  }, [nftOfTheDay, todaysDate]);

  const mintNFT = async () => {
    try {
      if (!status?.granted) {
        await requestPermission();
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setCurrentImage({
          uri: result.assets[0].uri,
          date: todaysDate,
        });

        createNFT(
          formatDate(todaysDate),
          `${todaysDate.getTime()}`,
          result.assets[0],
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleNFTButton = async () => {
    if (!publicKey) {
      connect();
    } else if (loadedNFTs === null) {
      fetchNFTs();
    } else if (!nftOfTheDay) {
      mintNFT();
    } else {
      alert("All done for the day!");
    }
  };

  const renderNFTButton = () => {
    let buttonText = "";
    if (!publicKey) buttonText = "Connect Wallet";
    else if (loadedNFTs === null) buttonText = "Fetch NFTs";
    else if (!nftOfTheDay) buttonText = "Create Snapshot";
    else buttonText = "All Done!";

    if (isLoading) buttonText = "Loading...";

    return <Button title={buttonText} onPress={handleNFTButton} />;
  };

  const renderPreviousSnapshot = (snapshot: NFTSnapshot, index: number) => {
    const date = snapshot.date;
    const formattedDate = formatDate(date);

    return (
      <View key={index}>
        <Image source={snapshot} style={styles.carouselImage} />
        <Text style={styles.carouselText}>{formattedDate}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Half */}
      <View style={styles.topSection}>
        <Text style={styles.titleText}>Mint-A-Day</Text>
        <Image source={currentImage} style={styles.imageOfDay} />
        {renderNFTButton()}
      </View>

      {/* Bottom Half */}
      <View style={styles.bottomSection}>
        <ScrollView horizontal contentContainerStyle={styles.carousel}>
          {previousImages.map(renderPreviousSnapshot)}
        </ScrollView>
      </View>
    </View>
  );
}
```

#### 3. Test

Now it's time to create our first snapshot! First, open up your Devnet-enabled
wallet and make sure you have some SOL. Next, tap on `Connect Wallet` and
approve the app. Fetch all of the NFTs by tapping `Fetch NFTs`. Lastly, tap
`Create Snapshot` to upload and mint.

Congratulations! That was not an easy or quick lab. You're doing great if you've
made it this far. If you run into any issues, please go back through the lab
and/or reference the final solution code on the
[`main` branch in Github](https://github.com/Unboxed-Software/solana-advance-mobile).

## Challenge

Now it's your turn. Create your own Expo application from scratch. You're
welcome to choose your own, or you can select from the following ideas:

- Instead of a daily image snapshot, create an application that lets users write
  a journal entry for the day, then mint it as an NFT
- Create a basic NFT viewer app to see all your wonderful JPEGs
- Make a simplified clone of [Stepn](https://stepn.com/) using the pedometer
  from `expo-sensors`

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=19cf8d3a-89a0-465e-95da-908cf8f45409)!
</Callout>
