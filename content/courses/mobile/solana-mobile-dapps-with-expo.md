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
- Along with simplifying the build and deploy process, Expo offers packages that
  allow access to mobile device peripherals and capabilities.
- Many Solana ecosystem libraries don't natively support React Native, but you
  can often use them with the appropriate
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

Expo is an open-source platform for making universal native apps for Android,
iOS, and the web that wraps around React Native, much like Next.js is a
framework built on top of React.

Expo consists of three main parts:

1. Expo CLI
2. The Expo Go App
3. A suite of libraries that grant access to various mobile device capabilities.

The Expo CLI is a powerful tool for building and debugging that simplifies the
development process. Chances are, you'll only have to interact with it when
you're building or starting a development server. It just works.

The [Expo Go App](https://expo.dev/client) is a really cool piece of tech that
allows _most_ apps to be developed without using an emulator or physical device.
You download the app, you scan the QR from the build output and then you have a
working dev environment right on your phone. However, this doesn't work with the
Solana Mobile SDK. Coming from the
[Solana Expo setup article](https://docs.solanamobile.com/react-native/expo):

> The traditional Expo Go development flow is only limited to certain
> hand-picked modules and does not support further customized native code, which
> Solana Mobile SDKs need. Instead, we'll need to use a custom development build
> which makes Solana Mobile React Native libraries (i.e Mobile Wallet Adapter)
> fully compatible with Expo.

Lastly, and most importantly, Expo does an amazing job providing
[comprehensive libraries](https://docs.expo.dev/versions/latest/) that give you
access to the device's onboard peripherals, such as camera, battery, and
speakers. The libraries are intuitive and the documentation is phenomenal.

#### How to create an Expo app

To begin using Expo, first follow the setup instructions described in the
Getting Started section of the
[Introduction to Solana Mobile lesson](/content/courses/mobile/intro-to-solana-mobile.md).
After that, you'll want to sign up for an
[Expo Application Services (EAS) account](https://expo.dev/eas).

Once you have an EAS account, you can install the EAS CLI and log in:

```bash
npm install -g eas-cli
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
    "version": ">= 5.12.0"
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

With the EAS configuration file in place, you can build your project using
`eas build`. This submits a job to the EAS Build service, where your APK is
built using Expo's cloud infrastructure. If you want to build locally, you can
add the `--local` flag. For example, the following command builds the project
locally with a development profile specifically for Android:

```bash
eas build --profile development --platform android --message "Developing on Android!" --local
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

Depending on the package, there may be additional setup required. For example,
if you're using the `expo-camera` package, you not only need to install the
package but also configure the appropriate permissions in your `app.json` or
`AndroidManifest.xml` file for Android and request runtime permissions for
accessing the camera. Be sure to read the
[Expo docs](https://docs.expo.dev/versions/latest/) when working with a new
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
  through the [JSON RPC API](/docs/rpc/http/index.mdx).
- `expo-crypto` is a secure random number generator polyfill used in React
  Native for web3.js's underlying Crypto library. This feature is supported only
  in Expo SDK version 49+ and requires Expo Router. Make sure your setup is
  updated to meet these requirements.
- `buffer`: Buffer polyfill needed for `web3.js` on React Native.

#### Metaplex Polyfills

If you want to use the Metaplex SDK, you'll need to add the Metaplex library
plus a few additional polyfills:

- `@metaplex-foundation/umi` `@metaplex-foundation/umi-bundle-defaults`
  `@metaplex-foundation/mpl-core` - Metaplex Library
- Several more polyfills
  - `assert`
  - `crypto-browserify`
  - `readable-stream`
  - `zlib`
  - `react-native-url-polyfill` All of the libraries that the above polyfills
    are meant to replace are utilized by the Metaplex libraries in the
    background. It's unlikely you'll be importing any of them into your code
    directly. Because of this, you'll need to register the polyfills using a
    `metro.config.js` file. This will ensure that Metaplex uses the polyfills
    instead of the usual Node.js libraries that aren't supported in React
    Native. Below is an example `metro.config.js` file:

```js
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add polyfill resolvers
config.resolver.extraNodeModules.crypto = require.resolve("expo-crypto");

module.exports = config;
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

To mint the NFTs we'll be using Metaplex's Umi libraries along with
[Pinata Cloud](https://pinata.cloud/) to store images and metadata. We are using
Pinata in this tutorial, but
[there are many good solutions for long-term image storage](https://solana.com/developers/guides/getstarted/how-to-create-a-token#create-and-upload-image-and-offchain-metadata).
All of our onchain work will be on Devnet.

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

First sign up for an [EAS account](https://expo.dev/eas).

Then, install the EAS CLI and log in:

```bash
npm install -g eas-cli
eas login
```

#### 2. Create the app scaffold

Let's create our app with the following:

```bash
npx create-expo-app --template blank-typescript solana-expo
cd solana-expo
npx expo install expo-dev-client # This installs a library that enables the creation of custom development builds, providing useful tools for debugging and testing. While optional, it is recommended for a smoother development experience.
```

This uses `create-expo-app` to generate a new scaffold for us based on the
`blank-typescript` template. A Blank template with TypeScript enabled.

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
    "version": ">= 3.12.0"
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

#### 4. Build and emulate

Now let's build the project locally. You will choose `y` for every answer. This
will take a while to complete.

```bash
npx eas build --profile development --platform android --local
```

When the command is done, you will get an output file at the root of your
directory. This file will have a naming format of `build-XXXXXXXXXXX.apk`.
Locate this file in your file explorer and **_drag it_** into your emulator. The
emulator should show a message that it is installing the new APK. When it
finishes installing, you should see the APK as an app icon in the emulator.

The app that was installed is just a scaffold app from Expo. The last thing
you'll need to do is run the following command to run the development server:

```bash
npx expo start --dev-client --android
```

This should open and run the app in your Android emulator.

**_NOTE_** Every time you add in new dependencies, you'll have to build and
re-install the app. Anything visual or logic-based should be captured by the
hot-reloader.

### 2. Configure your Expo app to work with Solana

Now that we have an Expo app up and running, we need to add our Solana
dependencies, including installing a wallet we can use in the emulator. If you
already have a Devnet-enabled wallet installed you can skip step 0.

#### 0. Install a Devnet-enabled Solana wallet

You'll need a wallet that supports Devnet to test with. In our
[Mobile Wallet Adapter lesson](/content/courses/mobile/mwa-deep-dive.md) we
created one of these. Let's install it from the repo in a different directory
from our app:

```bash
cd ..
git clone https://github.com/solana-developers/react-native-fake-solana-wallet
cd react-native-fake-solana-wallet
yarn
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
yarn add \
  @solana/web3.js \
  @solana-mobile/mobile-wallet-adapter-protocol-web3js \
  @solana-mobile/mobile-wallet-adapter-protocol \
  expo-crypto \
  buffer
```

#### 3. Add Solana boilerplate providers

Next, let's add some Solana boilerplate that can springboard you into most
Solana-based apps.

Create two new folders: `components` and `screens`.

We are going to use some boilerplate code from the
[first Mobile lesson](/content/courses/mobile/intro-to-solana-mobile.md). We
will be copying over `components/AuthorizationProvider.tsx` and
`components/ConnectionProvider.tsx`. These files provide us with a `Connection`
object as well as some helper functions that authorize our dapp.

Create file `components/AuthorizationProvider.tsx` and copy the contents of
[our existing Auth Provider from Github](https://raw.githubusercontent.com/solana-developers/mobile-apps-with-expo/main/components/AuthProvider.tsx)
into the new file.

Secondly, create file `components/ConnectionProvider.tsx` and copy the contents
of
[our existing Connection Provider from Github](https://raw.githubusercontent.com/solana-developers/mobile-apps-with-expo/main/components/ConnectionProvider.tsx)
into the new file.

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

Next, create file called `polyfills.ts` for react-native to work with all the
solana dependencies

```typescript filename="polyfills.ts"
import { getRandomValues as expoCryptoGetRandomValues } from "expo-crypto";
import { Buffer } from "buffer";

// Set global Buffer
global.Buffer = Buffer;

// Define Crypto class with getRandomValues method
class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

// Check if crypto is already defined in the global scope
const hasInbuiltWebCrypto = typeof window.crypto !== "undefined";

// Use existing crypto if available, otherwise create a new Crypto instance
const webCrypto = hasInbuiltWebCrypto ? window.crypto : new Crypto();

// Polyfill crypto object if it's not already defined
if (!hasInbuiltWebCrypto) {
  Object.defineProperty(window, "crypto", {
    configurable: true,
    enumerable: true,
    get: () => webCrypto,
  });
}
```

Finally, let's change `App.tsx` to wrap our application in the two providers we
just created:

```tsx
import { ConnectionProvider } from "./components/ConnectionProvider";
import { AuthorizationProvider } from "./components/AuthorizationProvider";
import { clusterApiUrl } from "@solana/web3.js";
import { MainScreen } from "./screens/MainScreen";
import "./polyfills";

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

Notice we've added the polyfills file `polyfills.ts`. These are necessary for
the Solana dependencies to run correctly.

#### 4. Build and run Solana boilerplate

Add the following convenient run scripts to your `package.json` file.

```json
  "scripts": {
    "start": "expo start --dev-client",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build": "npx eas build --profile development --platform android",
    "build:local": "npx eas build --profile development --platform android --local",
    "test": "echo \"No tests specified\" && exit 0",
    "clean": "rm -rf node_modules && yarn"
  }
```

Let's make sure everything is working and compiling correctly. In Expo, anytime
you change the dependencies, you'll need to rebuild and re-install the app.

**_Optional:_** To avoid possible build version conflicts, you may want to
_uninstall_ the previous version before you drag and drop the new one in.

Build locally:

```bash
yarn run build:local
```

Install: **_Drag_** the resulting build file into your emulator.

Run:

```bash
yarn run android
```

Everything should compile and you should have a boilerplate Solana Expo app.

### 3. Configure your Expo app to work with Metaplex

Metaplex is your one-stop-shop for all of your NFT API needs. However, it
requires a little more setup. The good news is if you ever want to fetch, mint
or edit NFTs in your future apps, you'll have another boilerplate to here that
you can reference.

#### 1. Install Metaplex dependencies

[Metaplex programs and tools](https://developers.metaplex.com/programs-and-tools)
abstracts away a lot of the minutia of working with NFTs, however it was written
largely for Node.js, so we'll need several more polyfills to make it work:

```bash
yarn add assert \
  util \
  crypto-browserify \
  stream-browserify \
  readable-stream \
  browserify-zlib \
  path-browserify \
  react-native-url-polyfill \
  @metaplex-foundation/umi \
  @metaplex-foundation/umi-bundle-defaults \
  @metaplex-foundation/umi-signer-wallet-adapters \
  @metaplex-foundation/umi-web3js-adapters \
  @metaplex-foundation/mpl-token-metadata \
  @metaplex-foundation/mpl-candy-machine
```

#### 2. Polyfill config

We won't be importing any of the above polyfills in our code directly, so we
need to add them to a `metro.config.js` file to ensure that Metaplex uses them:

```bash
touch metro.config.js
```

Copy and paste the following into `metro.config.js`:

```javascript
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add polyfill resolvers
config.resolver.extraNodeModules.crypto = require.resolve("expo-crypto");

module.exports = config;
```

#### 3. Metaplex provider

We'll be creating NFTs using
[Metaplex's MPL Token Metadata library](https://developers.metaplex.com/token-metadata),
leveraging the `Umi` object, a tool commonly used in many Metaplex applications.
This combination will give us access to key functions like `fetch` and `create`
that are essential for NFT creation. To set this up, we will create a new file,
`/components/UmiProvider.tsx`, where we'll connect our mobile wallet adapter to
the `Umi` object. This allows us to execute privileged actions, such as
interacting with token metadata, on our behalf.

```tsx
import { createContext, ReactNode, useContext } from "react";
import type { Umi } from "@metaplex-foundation/umi";
import {
  createNoopSigner,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { useAuthorization } from "./AuthorizationProvider";

type UmiContext = {
  umi: Umi | null;
};

const DEFAULT_CONTEXT: UmiContext = {
  umi: null,
};

export const UmiContext = createContext<UmiContext>(DEFAULT_CONTEXT);

export const UmiProvider = ({
  endpoint,
  children,
}: {
  endpoint: string;
  children: ReactNode;
}) => {
  const { selectedAccount } = useAuthorization();
  const umi = createUmi(endpoint)
    .use(mplTokenMetadata())
    .use(mplCandyMachine());
  if (selectedAccount === null) {
    const noopSigner = createNoopSigner(
      publicKey("11111111111111111111111111111111"),
    );
    umi.use(signerIdentity(noopSigner));
  } else {
    umi.use(walletAdapterIdentity(selectedAccount));
  }

  return <UmiContext.Provider value={{ umi }}>{children}</UmiContext.Provider>;
};

export function useUmi(): Umi {
  const umi = useContext(UmiContext).umi;
  if (!umi) {
    throw new Error(
      "Umi context was not initialized. " +
        "Did you forget to wrap your app with <UmiProvider />?",
    );
  }
  return umi;
}
```

#### 4. NFT Provider

We're also making a higher-level NFT provider that helps with NFT state
management. It combines all three of our previous providers:
`ConnectionProvider`, `AuthorizationProvider`, and `UmiProvider` to allow us to
create our `Umi` object. We will fill this out at a later step; for now, it
makes for a good boilerplate.

Let's create the new file `components/NFTProvider.tsx`:

```tsx
import "react-native-url-polyfill/auto";
import { useConnection } from "./ConnectionProvider";
import { Account, useAuthorization } from "./AuthorizationProvider";
import React, { ReactNode, createContext, useContext, useState } from "react";
import { useUmi } from "./UmiProvider";
import { Umi } from "@metaplex-foundation/umi";

export interface NFTProviderProps {
  children: ReactNode;
}

export interface NFTContextState {
  umi: Umi | null;
}

const DEFAULT_NFT_CONTEXT_STATE: NFTContextState = {
  umi: null,
};

const NFTContext = createContext<NFTContextState>(DEFAULT_NFT_CONTEXT_STATE);

export function NFTProvider(props: NFTProviderProps) {
  const { children } = props;

  const { connection } = useConnection();
  const { authorizeSession } = useAuthorization();
  const [account, setAccount] = useState<Account | null>(null);
  const { umi } = useUmi(connection, account, authorizeSession);

  const state: NFTContextState = {
    umi,
  };

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
import { AuthorizationProvider } from "./components/AuthorizationProvider";
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
daily snapshot app. It allows users take a snapshot of their life daily in the
form of minting an NFT.

The app will need access to the device's camera and a place to remotely store
the captured images. Fortunately, Expo SDK can provide access to the camera and
[Pinata Cloud](https://pinata.cloud/) can store your NFT files safely.

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
          "photosPermission": "Allows you to use images to create solana NFTs"
        }
      ]
    ],
    // ....
  }
```

This dependency makes it incredibly easy to use the camera. To allow the user to
take a picture and return the image, simply call the following:

```tsx
// Launch the camera to take a picture using ImagePicker
const result = await ImagePicker.launchCameraAsync({
  // Restrict media types to images only (no videos)
  mediaTypes: ImagePicker.MediaTypeOptions.Images,

  // Allow the user to edit/crop the image after taking it
  allowsEditing: true,

  // Specify the aspect ratio of the cropping frame (1:1 for a square)
  aspect: [1, 1],

  // Set the image quality to maximum (1.0 = highest quality, 0.0 = lowest)
  quality: 1,
});

// 'result' will contain information about the captured image
// If the user cancels, result.cancelled will be true, otherwise it will contain the image URI
```

No need to add this anywhere yet - we'll get to it in a few steps.

#### 2. Pinata Cloud setup

The last thing we need to do is set up our access to
[Pinata Cloud](https://pinata.cloud/). We'll need to get an API key and add it
as an environment variable, then we need to add one last dependency to convert
our images into a file type we can upload.

We'll be using Pinata Cloud to host our NFTs with IPFS since they do this for a
very cheap price. Remember to keep this API key private.

Best practices suggest keeping API keys in a `.env` file with `.env` added to
your `.gitignore`. It's also a good idea to create a `.env.example` file that
can be committed to your repo and shows what environment variables are needed
for the project.

Create both files, in the root of your directory and add `.env` to your
`.gitignore` file.

Next, add your API key to the `.env` file with the variable name
`EXPO_PUBLIC_NFT_PINATA_JWT`. This allows you to securely access your API key in
the application using `process.env.EXPO_PUBLIC_NFT_PINATA_JWT`, unlike
traditional `import "dotenv/config"` which may require additional polyfills when
working with Expo. For more information on securely storing secrets, refer to
the
[Expo documentation on environment variables](https://docs.expo.dev/build-reference/variables/#importing-secrets-from-a-dotenv-file)

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

- `umi: Umi | null` - Holds the metaplex object that we use to call `fetch` and
  `create`
- `publicKey: PublicKey | null` - The NFT creator's public key
- `isLoading: boolean` - Manages loading state
- `loadedNFTs: (DigitalAsset)[] | null` - An array of the user's snapshot NFTs
- `nftOfTheDay: (DigitalAsset) | null` - A reference to the NFT created today
- `connect: () => void` - A function for connecting to the Devnet-enabled wallet
- `fetchNFTs: () => void` - A function that fetches the user's snapshot NFTs
- `createNFT: (name: string, description: string, fileUri: string) => void` - A
  function that creates a new snapshot NFT

The `DigitalAsset` type comes from `@metaplex-foundation/mpl-token-metadata`
which has metadata, off-chain metadata, collection data, plugins (including
Attributes), and more.

```tsx
export interface NFTContextState {
  metaplex: Metaplex | null; // Holds the metaplex object that we use to call `fetch` and `create` on.
  publicKey: PublicKey | null; // The public key of the authorized wallet
  isLoading: boolean; // Loading state
  loadedNFTs: DigitalAsset[] | null; // Array of loaded NFTs that contain metadata
  nftOfTheDay: DigitalAsset | null; // The NFT snapshot created on the current day
  connect: () => void; // Connects (and authorizes) us to the Devnet-enabled wallet
  fetchNFTs: () => void; // Fetches the NFTs using the `metaplex` object
  createNFT: (name: string, description: string, fileUri: string) => void; // Creates the NFT
}
```

The state flow here is: `connect`, `fetchNFTs`, and then `createNFT`. We'll walk
through the code for each of them and then show you the entire file at the end:

1. `connect` - This function will connect and authorize the app, and then store
   the resulting `publicKey` into the state.

   ```tsx
   const connect = () => {
     if (isLoading) return;

     setIsLoading(true);
     transact(async wallet => {
       const auth = await authorizeSession(wallet);
       setAccount(auth);
     }).finally(() => {
       setIsLoading(false);
     });
   };
   ```

2. `fetchNFTs` - This function will fetch the NFTs using
   `fetchAllDigitalAssetByCreator`:

```tsx
const fetchNFTs = useCallback(async () => {
  if (!umi || !account || isLoading) return;
  setIsLoading(true);
  try {
    const creatorPublicKey = fromWeb3JsPublicKey(account.publicKey);
    const nfts = await fetchAllDigitalAssetByCreator(umi, creatorPublicKey);
    setLoadedNFTs(nfts);
  } catch (error) {
    console.error("Failed to fetch NFTs:", error);
  } finally {
    setIsLoading(false);
  }
}, [umi, account, isLoading]);
```

3. `createNFT` - This function will upload a file to Pinata Cloud, and then use
   `createNft` function from to create and mint an NFT to your wallet. This
   comes in three parts, uploading the image, uploading the metadata and then
   minting the NFT. To upload to Pinata Cloud, you can use their
   [HTTP API endpoint](https://docs.pinata.cloud/api-reference/endpoint/upload-a-file),
   allowing interaction with their API for file uploads.

   We'll create two helper functions for uploading the image and metadata
   separately, then tie them together into a single `createNFT` function:

```tsx
const ipfsPrefix = `https://${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/`;
async function uploadImageFromURI(fileUri: string) {
  try {
    const form = new FormData();
    const randomFileName = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;

    form.append("file", {
      uri: Platform.OS === "android" ? fileUri : fileUri.replace("file://", ""),
      type: "image/jpeg", // Adjust the type as necessary
      name: randomFileName, // Adjust the name as necessary
    });

    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_PINATA_JWT}`,
        "Content-Type": "multipart/form-data",
      },
      body: form,
    };

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      options,
    );
    const responseJson = await response.json();
    return responseJson;
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    console.log("Upload process completed.");
  }
}

async function uploadMetadataJson(
  name: string,
  description: string,
  imageCID: string,
) {
  const randomFileName = `metadata_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`;
  const data = JSON.stringify({
    pinataContent: {
      name,
      description,
      imageCID,
    },
    pinataMetadata: {
      name: randomFileName,
    },
  });
  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_PINATA_JWT}`,
      },
      body: data,
    },
  );
  const responseBody = await response.json();

  return responseBody;
}

const uploadImage = useCallback(async (fileUri: string): Promise<string> => {
  const upload = await uploadImageFromURI(fileUri);
  return upload.IpfsHash;
}, []);

const uploadMetadata = useCallback(
  async (
    name: string,
    description: string,
    imageCID: string,
  ): Promise<string> => {
    const uploadResponse = await uploadMetadataJson(
      name,
      description,
      imageCID,
    );
    return uploadResponse.IpfsHash;
  },
  [],
);
```

Minting the NFT after the image and metadata have been uploaded is as simple as
calling `createNft` from `@metaplex-foundation/mpl-token-metadata`. Below shows
the `createNFT` function tying everything together:

```tsx
const createNFT = useCallback(
  async (name: string, description: string, fileUri: string) => {
    if (!umi || !account || isLoading) return;
    setIsLoading(true);
    try {
      console.log(`Creating NFT...`);
      const imageCID = await uploadImage(fileUri);
      const metadataCID = await uploadMetadata(name, description, imageCID);
      const mint = generateSigner(umi);
      const transaction = createNft(umi, {
        mint,
        name,
        uri: ipfsPrefix + metadataCID,
        sellerFeeBasisPoints: percentAmount(0),
      });
      await transaction.sendAndConfirm(umi);
      const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
      setNftOfTheDay(createdNft);
    } catch (error) {
      console.error("Failed to create NFT:", error);
    } finally {
      setIsLoading(false);
    }
  },
  [umi, account, isLoading, uploadImage, uploadMetadata],
);
```

We'll put all of the above into the `NFTProvider.tsx` file. All together, this
looks as follows:

```tsx
import "react-native-url-polyfill/auto";
import {
  DigitalAsset,
  createNft,
  fetchAllDigitalAssetByCreator,
  fetchDigitalAsset,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  PublicKey,
  Umi,
  generateSigner,
  percentAmount,
} from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { clusterApiUrl, PublicKey as solanaPublicKey } from "@solana/web3.js";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useUmi } from "./UmiProvider";
import { useMobileWallet } from "../utils/useMobileWallet";
import { Account, useAuthorization } from "./AuthorizationProvider";
import { Platform } from "react-native";

export interface NFTProviderProps {
  children: ReactNode;
}

export interface NFTContextState {
  umi: Umi | null; // Holds the Umi object that we use to call `fetch` and `create` on.
  publicKey: PublicKey | null; // The public key of the authorized wallet
  isLoading: boolean; // Loading state
  loadedNFTs: DigitalAsset[] | null; // Array of loaded NFTs that contain metadata
  nftOfTheDay: DigitalAsset | null; // The NFT snapshot created on the current day
  connect: () => void; // Connects (and authorizes) us to the Devnet-enabled wallet
  fetchNFTs: () => void; // Fetches the NFTs using the `metaplex` object
  createNFT: (name: string, description: string, fileUri: string) => void; // Creates the NFT
}

export function formatDate(date: Date) {
  return `${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
}

const NFTContext = createContext<NFTContextState | null>(null);

export function NFTProvider(props: NFTProviderProps) {
  const ipfsPrefix = `https://${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/`;
  const [account, setAccount] = useState<Account | null>(null);
  const [nftOfTheDay, setNftOfTheDay] = useState<DigitalAsset | null>(null);
  const [loadedNFTs, setLoadedNFTs] = useState<DigitalAsset[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const umi = useUmi();
  const { children } = props;
  const connect = () => {
    if (isLoading) return;

    setIsLoading(true);
    transact(async wallet => {
      const auth = await authorizeSession(wallet);
      setAccount(auth);
    }).finally(() => {
      setIsLoading(false);
    });
  };
  async function uploadImageFromURI(fileUri: string) {
    try {
      const form = new FormData();
      const randomFileName = `image_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;

      // In React Native, especially when working with form data and files, you may need to send files using an object that contains a URI (file path), especially on Android and iOS platforms. However, this structure may not be recognized by TypeScript's strict type checking
      // @ts-ignore
      form.append("file", {
        uri:
          Platform.OS === "android" ? fileUri : fileUri.replace("file://", ""),
        type: "image/jpeg", // Adjust the type as necessary
        name: randomFileName, // Adjust the name as necessary
      });

      const options = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_PINATA_JWT}`,
          "Content-Type": "multipart/form-data",
        },
        body: form,
      };

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        options,
      );
      const responseJson = await response.json();
      console.log(responseJson.IpfsHash);

      return responseJson;
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      console.log("Upload process completed.");
    }
  }

  async function uploadMetadataJson(
    name = "Solanify",
    description = "A truly sweet NFT of your day.",
    imageCID = "bafkreih5aznjvttude6c3wbvqeebb6rlx5wkbzyppv7garjiubll2ceym4",
  ) {
    const randomFileName = `metadata_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`;
    const data = JSON.stringify({
      pinataContent: {
        name,
        description,
        imageCID,
      },
      pinataMetadata: {
        name: randomFileName,
      },
    });
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_NFT_PINATA_JWT}`,
        },
        body: data,
      },
    );
    const responseBody = await response.json();

    return responseBody;
  }

  const fetchNFTs = useCallback(async () => {
    if (!umi || !account || isLoading) return;
    setIsLoading(true);
    try {
      const creatorPublicKey = fromWeb3JsPublicKey(account.publicKey);
      const nfts = await fetchAllDigitalAssetByCreator(umi, creatorPublicKey);
      setLoadedNFTs(nfts);
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [umi, account, isLoading]);

  const uploadImage = useCallback(async (fileUri: string): Promise<string> => {
    const upload = await uploadImageFromURI(fileUri);
    return upload.IpfsHash;
  }, []);

  const uploadMetadata = useCallback(
    async (
      name: string,
      description: string,
      imageCID: string,
    ): Promise<string> => {
      const uploadResponse = await uploadMetadataJson(
        name,
        description,
        imageCID,
      );
      return uploadResponse.IpfsHash;
    },
    [],
  );

  const createNFT = useCallback(
    async (name: string, description: string, fileUri: string) => {
      if (!umi || !account || isLoading) return;
      setIsLoading(true);
      try {
        console.log(`Creating NFT...`);
        const imageCID = await uploadImage(fileUri);
        const metadataCID = await uploadMetadata(name, description, imageCID);
        const mint = generateSigner(umi);
        const transaction = createNft(umi, {
          mint,
          name,
          uri: ipfsPrefix + metadataCID,
          sellerFeeBasisPoints: percentAmount(0),
        });
        await transaction.sendAndConfirm(umi);
        const createdNft = await fetchDigitalAsset(umi, mint.publicKey);
        setNftOfTheDay(createdNft);
      } catch (error) {
        console.error("Failed to create NFT:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [umi, account, isLoading, uploadImage, uploadMetadata],
  );

  const publicKey = useMemo(
    () =>
      account?.publicKey
        ? fromWeb3JsPublicKey(account.publicKey as solanaPublicKey)
        : null,
    [account],
  );

  const state: NFTContextState = {
    isLoading,
    publicKey,
    umi,
    nftOfTheDay,
    loadedNFTs,
    connect,
    fetchNFTs,
    createNFT,
  };

  return <NFTContext.Provider value={state}>{children}</NFTContext.Provider>;
}

export const useNFT = (): NFTContextState => {
  const context = useContext(NFTContext);
  if (!context) {
    throw new Error("useNFT must be used within an NFTProvider");
  }
  return context;
};
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
      result.assets[0].uri,
    );
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
  const ipfsPrefix = `https://${process.env.EXPO_PUBLIC_NFT_PINATA_GATEWAY_URL}/ipfs/`;
  type NftMetaResponse = {
    name: string;
    description: string;
    imageCID: string;
  };
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

          const { imageCID, description } = metadata;
          if (!imageCID || !description) return null;

          const unixTime = Number(description);
          if (isNaN(unixTime)) return null;

          return {
            uri: ipfsPrefix + imageCID,
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

        if (!response?.imageCID) {
          console.error("No image found in nftOfTheDay metadata");
          return;
        }

        setCurrentImage({
          uri: ipfsPrefix + response.imageCID,
          date: todaysDate,
        });
      } catch (error) {
        console.error("Error fetching nftOfTheDay metadata:", error);
      }
    };

    fetchNftOfTheDayMetadata();
  }, [nftOfTheDay, todaysDate]);
  const mintNFT = async () => {
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
        result.assets[0].uri,
      );
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
[`main` branch in Github](https://github.com/solana-developers/mobile-apps-with-expo).

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
