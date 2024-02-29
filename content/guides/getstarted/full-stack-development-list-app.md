---
date: Feb 29, 2024
difficulty: intro
title: "Full Stack Development with Remix and Anchor: Build a Narrative Tracker"
seoTitle: "Full Stack Development with Remix and Anchor"
description:
  "Learn how to build a full Full Stack Solana Development with Remix, Anchor, Rust, and Phantom. Including: airdrop, web3.js, anchor..."
tags:
  - quickstart
  - Solana Playground
  - rust
  - web3js
  - fullstack
keywords:
  - webdev
  - blockchain
  - devnet
  - react
  - fullstack
  - anchor
  - playground
  - anchor
  - rust
---

## Overview

![BANNERSOLANAFULLSTACK](https://github.com/aeither/developer-content/assets/36173828/11bebb2d-8610-4dcb-85e8-97b9d80015cb)


[Nader Dabit](https://dev.to/edge-and-node/the-complete-guide-to-full-stack-solana-development-with-react-anchor-rust-and-phantom-3291) did a really good full-stack Solana development guide more than 2 years ago. A lot has changed since then.

I will be as concise as possible to make it beginner-friendly and show you how to build a full-stack Dapp in 2024. Particular attention would be given to the updates and changes to libraries and tooling.

Why create another full-stack guide? 

There are a lot of great guides out there that are outdated, using code from old versions of libraries and tools. With that being said, I will point out what is new compared to older versions so it can also work for whoever already started a project to migrate to the latest and use the latest tools.

What framework should I use? We have mainly 3: Solana, Anchor, and Seahorse. Seahorse is not maintained, and Anchor is built on top of Solana, making it easier and less bloated to create programs. The best choice goes to Anchor for anyone starting a new project.

## Project overview

The tooling we'll be using today includes:

Solana Playground is a browser-based program editor. It comes with a testing wallet, testnet SOL airdrop, CLI, and test file. Which allows us to start right away. Export DSL, which is the equivalent of EVM ABI for Solana programs.

Anchor JS SDK and Anchor Rust Lang: We will use Anchor for building the program and the JS library to call the contract from the frontend.

solana/web3.js - It provides utilities to help us connect wallets and format values.

React Remix: Remix is a very intuitive React framework.

At the end of the guide, you will be able to build a working full-stack Solana app from which you can continue tinkering and building your own ideas.

We will focus on setting up the Solana playground, deploying our first program, and testing it. Build the frontend, add a connect wallet, and call the program deployed on the devnet.

## Demo

Here is a quick demo of what we are going to accomplish.

https://github.com/aeither/developer-content/assets/36173828/29c7db2d-eac3-4c1b-9530-af0e4bd278e0

## Requirements

Install a Solana wallet. Phantom Wallet is a recommended. 
[Phantom Wallet Chrome Extension](https://chromewebstore.google.com/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa)

Get some testnet SOL
[Solana Faucet](https://faucet.solana.com/)

Setup for web development: node.js, code editor.

## Playground setup


Go to "Build & Deploy" Tab and copy the Program ID and export the IDL

Open https://beta.solpg.io/ and create a new Anchor project.

![image1](https://github.com/aeither/developer-content/assets/36173828/02eb56a1-1884-4807-a323-04115229535e)

We need SOL to deploy the program. You have to claim 5 SOLs from the Solana Faucet. Copy the address of your wallet. 

![image2](https://github.com/aeither/developer-content/assets/36173828/a9345b43-c05b-4636-b945-ea2be1eac636)

Open [Solana Faucet](https://faucet.solana.com/) and paste your wallet address. Make sure it is set to devnet and amount to 5.

![image3](https://github.com/aeither/developer-content/assets/36173828/951441ae-68ad-4054-9765-2586419f8c67)

## Create the program

Update `lib.rs` with the following program. We will go through it right after.

```rust
use anchor_lang::prelude::*;

declare_id!("CfqCT3ojotQKHizmE73CBo95LT6MLCKQCEm3dnztJPUk");

#[program]
pub mod narrative_list {
    use super::*;

    pub fn init_user(ctx: Context<InitUser>) -> Result<()> {
        let user_account = &mut ctx.accounts.new_user_account;
        user_account.authority = *ctx.accounts.authority.key;
        user_account.last_id = 0;

        Ok(())
    }

    pub fn add_item(ctx: Context<InitItem>, _content: String) -> Result<()> {
        let user_account = &mut ctx.accounts.user_account;
        let item_account = &mut ctx.accounts.new_item_account;

        // item account
        item_account.authority = ctx.accounts.authority.key();
        item_account.id = 0;
        item_account.content = _content;

        // user account
        user_account.last_id += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitUser<'info> {
    #[account(init, payer = authority, space = 8 + std::mem::size_of::<UserAccount>(), seeds = [b"user", authority.key().as_ref()], bump)]
    pub new_user_account: Account<'info, UserAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitItem<'info> {
    #[account(mut, seeds = [b"user", authority.key().as_ref()], bump)]
    pub user_account: Account<'info, UserAccount>,

    #[account(init, payer = authority, space = 8 + std::mem::size_of::<ItemAccount>(), seeds = [b"item", authority.key().as_ref(), &[user_account.last_id as u8].as_ref()], bump)]
    pub new_item_account: Account<'info, ItemAccount>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct UserAccount {
    authority: Pubkey,
    last_id: u8,
}

#[account]
pub struct ItemAccount {
    authority: Pubkey,
    id: u8,
    content: String,
}

```

Let's dive into it.

```rust
use anchor_lang::prelude::*;

declare_id!("CfqCT3ojotQKHizmE73CBo95LT6MLCKQCEm3dnztJPUk");
```

The first line of code imports all the necessary components from the Anchor framework, making them readily available for use in the program.

This `declare_id` macro declares the program's ID, a unique identifier for the program on the Solana blockchain.

```rust
#[program]
pub mod narrative_list {
    use super::*;
    ...
}
```

The macro `#[program]` marks the module as containing the instruction handlers for the Solana program

```rust
#[program]
pub mod narrative_list {
    use super::*;
    ...
}
```

Two functions are defined as instruction handlers:

`init_user`: Initializes a new user account.
`add_item`: Adds an narrative associated with the user's account.

These functions are marked with the pub fn syntax, making them public functions that can be called as part of the program's API.

The `#[derive(Accounts)]` macro is used to define the context for each instruction

`InitUser` and `InitItem` structs define the accounts needed for the `init_user` and `add_item` instructions, respectively.

`UserAccount` and `ItemAccount` structs define the data layout for user and item accounts.

Now we can build and deploy the program.

![image4](https://github.com/aeither/developer-content/assets/36173828/f3f88db0-6260-49b6-983d-4404e8d42f01)

After few seconds. The program will be available on devnet allowing us to run tests.

We can manually test the instructions

![image5](https://github.com/aeither/developer-content/assets/36173828/48082e55-5169-482e-bac8-fe1539f65d39)

and the check the result by fetching the accounts

![image6](https://github.com/aeither/developer-content/assets/36173828/782e5955-d3e2-443b-a9eb-082a08cbb101)

## Frontend

I used Visual Studio code to build the frontend, which I recommend. Here is the complete app, where you can inspect the implementation.

[Narrative Tracker App](https://github.com/aeither/solana-narrative-tracker)

To allow users to use the app, we need to connect their wallet. Inside `ContextProvider.tsx` we created the provider wrapper to connect to the devnet and enabled the wallet.

```jsx
import { Adapter, WalletError } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider as ReactUIWalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { FC, ReactNode, useCallback } from "react";
import { AutoConnectProvider, useAutoConnect } from "./AutoConnectProvider";
import { RPC_URL } from "~/constants";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { autoConnect } = useAutoConnect();

  const wallets: Adapter[] = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TorusWalletAdapter(),
  ] as any;

  const onError = useCallback((error: WalletError) => {
    console.error(error);
  }, []);

  return (
    <ConnectionProvider endpoint={RPC_URL || "https://api.devnet.solana.com"}>
      <WalletProvider
        wallets={wallets}
        onError={onError}
        autoConnect={autoConnect}
      >
        <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export const ContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AutoConnectProvider>
      <WalletContextProvider>{children}</WalletContextProvider>
    </AutoConnectProvider>
  );
};
```

Then we used the wrapper inside the `root.tsx` file `<ContextProvider>`

Let's go to the homepage located at `routes/_index.tsx`

```tsx
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import useProgram from "~/hooks/use-program";

const InitializeComponent = () => {
  const { initUserAnchor, program, addItemAnchor } = useProgram();
  const wallet = useWallet();

  const [user, setUser] = useState<string | undefined>(undefined);
  const [narratives, setNarratives] = useState<any[]>();
  const [content, setContent] = useState("");

  const onInitializeClick = async () => {
    await initUserAnchor();
  };

  const onAddItemAnchor = async (content: string) => {
    await addItemAnchor(content);

    setContent("");
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (program && wallet && wallet.publicKey) {
        try {
          const [userAccountPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), wallet.publicKey.toBuffer()],
            program.programId
          );

          const userAccount = await program.account.userAccount.fetch(
            userAccountPDA
          );

          setUser(userAccount.authority.toString());
        } catch (error) {
          setUser("");
          console.error(error);
        }
      }
    };
    fetchUser();
  }, [wallet, program]);

  useEffect(() => {
    const fetchNarratives = async () => {
      if (program && wallet && wallet.publicKey) {
        const myItemAccounts = await program.account.itemAccount.all([
          {
            memcmp: {
              offset: 8, // Discriminator.
              bytes: wallet.publicKey.toString(),
            },
          },
        ]);

        // myItemAccounts[0].account.content
        setNarratives(myItemAccounts);
      }
    };
    fetchNarratives();
  }, [wallet, program]);

  return (
    <div className="flex w-full flex-col justify-center items-center">
      <div className="flex flex-col w-full max-w-md items-center py-12 gap-4">
        <WalletMultiButton />

        {user == "" && (
          <>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={onInitializeClick}
              disabled={!wallet.connected}
            >
              Initialize
            </button>
          </>
        )}

        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mt-1 block w-full rounded-md border-2 border-blue-500 shadow-lg focus:border-indigo-500 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
        />
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => onAddItemAnchor(content)}
          disabled={!wallet.connected}
        >
          add narrative
        </button>

        {/* List */}
        <div className="flex flex-col gap-2 pt-16">
          {narratives?.map((narrative) => (
            <>
              <div className="text-2xl font-bold">
                {narrative.account.content}
              </div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InitializeComponent;
```

Let's break it down. We used a handy multi-wallet connect button provided by Solana.

```jsx
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

...
    <WalletMultiButton />
```

With `wallet` we check the user connection status to show conditional components

```jsx
const wallet = useWallet();

...
// wallet.publicKey
```

We used two hooks to look for user data on-chain when the page is loaded.

```jsx
const [userAccountPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("user"), wallet.publicKey.toBuffer()],
  program.programId
);

const userAccount = await program.account.userAccount.fetch(userAccountPDA);
```

```jsx
const myItemAccounts = await program.account.itemAccount.all([
  {
    memcmp: {
      offset: 8, // Discriminator.
      bytes: wallet.publicKey.toString(),
    },
  },
]);
```

The contract calls can be found in the useProgram hook

```jsx
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import "@solana/wallet-adapter-react-ui/styles.css";
import { PublicKey, TransactionConfirmationStrategy } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { PROGRAM_ID, connection } from "~/constants";
import { IDL, IDLType } from "~/constants/idl";

export type SetUserAnchor = (
  score: number,
  health: number
) => Promise<string | undefined>;

export default function useProgram() {
  const wallet = useWallet();
  const [program, setProgram] = useState<Program<IDLType>>();

  useEffect(() => {
    // Load program when sdk is defined
    load();
    async function load() {
      if (wallet.wallet) {
        const provider = new AnchorProvider(
          connection,
          wallet as any,
          AnchorProvider.defaultOptions()
        );

        const program = new Program(IDL, PROGRAM_ID, provider);
        setProgram(program);
      }
    }
  }, [wallet]);

  const initUserAnchor = async () => {
    try {
      if (!program || !wallet.publicKey || !wallet.signTransaction) return;

      // Derive the PDA for the newUserAccount
      const [newUserAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
      );

      // Send transaction
      const txHash = await program.methods
        .initUser()
        .accounts({
          newUserAccount: newUserAccountPDA,
        })
        .rpc();
      console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

      // Confirm transaction
      const commitment = "confirmed";
      const latestBlockHash = await connection.getLatestBlockhash(commitment);
      const strategy: TransactionConfirmationStrategy = {
        signature: txHash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        blockhash: latestBlockHash.blockhash,
      };
      await connection.confirmTransaction(strategy, commitment);

      // Fetch the created account
      const newAccount = await program.account.userAccount.fetch(
        wallet.publicKey
      );

      console.log("On-chain last Id is: ", newAccount.lastId.toString());

      return txHash;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  const addItemAnchor = async (content: string) => {
    try {
      if (!program || !wallet.publicKey || !wallet.signTransaction) return;

      // Derive the PDA for the newUserAccount
      const [userAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), wallet.publicKey.toBuffer()],
        program.programId
      );
      // Fetch the created account
      const userAccount = await program.account.userAccount.fetch(
        userAccountPDA
      );

      // Derive the PDA for the itemAccountPDA
      const [itemAccountPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("item"),
          wallet.publicKey.toBuffer(),
          Uint8Array.from([userAccount.lastId]),
        ],
        program.programId
      );

      // Send transaction
      const txHash = await program.methods
        .addItem(content)
        .accounts({
          userAccount: userAccountPDA,
          newItemAccount: itemAccountPDA,
        })
        .rpc();
      console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

      // Confirm transaction
      const commitment = "confirmed";
      const latestBlockHash = await connection.getLatestBlockhash(commitment);
      const strategy: TransactionConfirmationStrategy = {
        signature: txHash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        blockhash: latestBlockHash.blockhash,
      };
      await connection.confirmTransaction(strategy, commitment);

      // Fetch the created account
      const itemAccount = await program.account.itemAccount.fetch(
        itemAccountPDA
      );

      console.log("On-chain narrative is: ", itemAccount.content);

      return txHash;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  };

  return {
    program,
    initUserAnchor,
    addItemAnchor,
  };
}
```

Notice here Anchor is actively maintained by coral Team. The repository is moved from the old repository to `@coral-xyz/anchor`.

```jsx
import { AnchorProvider, Program } from "@coral-xyz/anchor";
```

Once the wallet is connected we initiate the program

```jsx
const provider = new AnchorProvider(
  connection,
  wallet as any,
  AnchorProvider.defaultOptions()
);

const program = new Program(IDL, PROGRAM_ID, provider);
```

For the RPC I am using the one from Helius. You can create an account [here](https://www.helius.dev/) to get the API KEY and add it to the environment variable `HELIUS_API_KEY`

```jsx
export const RPC_URL =
  typeof window !== "undefined"
    ? `https://devnet.helius-rpc.com/?api-key=${
        (window as unknown as any).ENV.HELIUS_API_KEY
      }`
    : "https://api.devnet.solana.com";
```

Derive the PDA is sync now. Before it was `await PublicKey.findProgramAddress()`

```jsx
const [newUserAccountPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from("user"), wallet.publicKey.toBuffer()],
  program.programId
);
```

To send a transaction we use `rpc` at the end instead of `program.rpc.addItem` which is now deprecated.

```jsx
// Send transaction
const txHash = await program.methods
  .addItem(content)
  .accounts({
    userAccount: userAccountPDA,
    newItemAccount: itemAccountPDA,
  })
  .rpc();
```

After the transaction is submitted we wait for the confirmation. Notice that `confirmTransaction` now requires a `TransactionConfirmationStrategy`

```jsx
// Confirm transaction
const commitment = "confirmed";
const latestBlockHash = await connection.getLatestBlockhash(commitment);
const strategy: TransactionConfirmationStrategy = {
  signature: txHash,
  lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  blockhash: latestBlockHash.blockhash,
};
await connection.confirmTransaction(strategy, commitment);

```

## Development

To run the app on localhost:

```sh
npm run dev
```

This starts your app in development mode, rebuilding assets on file changes.

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

## Conclusion

Congrats on completing the guide! Thanks to web faucets and web editors, you can start right away without the hassle of installing anything. even though I used Visual Studio code. A lot of browser-based applications are out there, making the whole development of the browser feasible.

## Next

Keep learning and exploring Solana development with more guides [Guides](https://solana.com/developers/guides).
and checkout the below for link to related resources.

## Useful link

[Anchor](https://www.anchor-lang.com/)

[Browser Program Editor](https://beta.solpg.io/)

The code of the project is located: [Narrative Tracker App](https://github.com/aeither/solana-narrative-tracker)
