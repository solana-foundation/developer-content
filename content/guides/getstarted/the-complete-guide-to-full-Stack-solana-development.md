---
date: 2024-02-29
difficulty: Intermediate
featured: true
featuredPriority: 1
title: "The Complete Guide to Full Stack Solana Development with React, Anchor, Rust, and Phantom"
seoTitle: "Full Stack Solana Development 2024"
description: "Dive deep into the world of Solana development with this comprehensive guide covering React, Anchor, Rust, and Phantom for 2024. Learn how to set up your environment, build your first Solana program, and integrate it with a React frontend."
tags:
  - Solana
  - Blockchain
  - Development
  - React
  - Anchor
  - Rust
  - Phantom
keywords:
  - Solana development
  - blockchain technology
  - React and Solana
  - Anchor framework
  - Rust programming
  - Phantom wallet integration
altRoutes:
  - [Medium](https://medium.com/@Anatolii_Zhadan/the-complete-guide-to-full-stack-solana-development-with-react-anchor-rust-and-phantom-18a1e1bdbb3b)
---

### The Complete Guide to Full Stack Solana Development with React, Anchor, Rust, and Phantom

Full starting guide to Solana Development 2024 with Anchor and React

![Solana Development Guide](https://cdn-images-1.medium.com/max/800/1*c2eT3HzoEjs1YnEox9fvhg.png)

If you are already familiar with Solana and know how it works, you can skip the introduction and move on to the development guide.

### Table of Contents:

1. [Introduction](#introduction)
   - [Brief overview of Solana's blockchain technology and its benefits](#brief-overview-of-solanas-blockchain-technology-and-its-benefits)
2. [Preliminary requirements](#preliminary-requirements)
   - [Programming Stack](#programming-stack)
   - [Basic Blockchain Concepts](#basic-blockchain-concepts)
   - [Necessary Software](#necessary-software)
3. [Section 1: Understanding Solana](#section-1-understanding-solana)
   - [Proof of History (PoH)](#proof-of-history-poh)
   - [Solana architecture](#solana-architecture)
4. [Key concepts in Solana development (accounts, programs, transactions)](#key-concepts-in-solana-development-accounts-programs-transactions)
   - [Accounts](#accounts)
   - [Programs](#programs)
   - [Transactions](#transactions)
5. [Section 2: Setting Up the Development Environment](#section-2-setting-up-the-development-environment)
   - [Installing Solana CLI tools](#installing-solana-cli-tools)
   - [Setting up the local Solana blockchain (test validator)](#setting-up-the-local-solana-blockchain-test-validator)
   - [Introduction to Anchor framework: Why Anchor?](#introduction-to-anchor-framework-why-anchor)
6. [Section 3: Building Your First Solana Program with Rust and Anchor](#section-3-building-your-first-solana-program-with-rust-and-anchor)
   - [Step 1: Create a new project with Anchor](#step-1-create-a-new-project-with-anchor)
   - [Step 2: Writing the Program Logic](#step-2-writing-the-program-logic)
   - [Step 3: Building the Program](#step-3-building-the-program)
   - [Compiling and Deploying the Program to the Local Solana Network](#compiling-and-deploying-the-program-to-the-local-solana-network)
7. [Section 4: Integrating with the Frontend using React and Anchor](#section-4-integrating-with-the-frontend-using-react-and-anchor)
   - [Setting up a React application](#setting-up-a-react-application)
   - [Modifying the frontend](#modifying-the-frontend)
8. [Section 5: Testing and Deployment](#section-5-testing-and-deployment)
   - [Write tests](#write-tests)
   - [Deploying applications to the devnet and mainnet](#deploying-applications-to-the-devnet-and-mainnet)


---

### Introduction

#### Brief overview of Solana's blockchain technology and its benefits

Why do we use Solana? It's cheap, fast, and convenient! Solana is recognized for its blazing-fast transaction speeds of up to 65,000 transactions per second (TPS), surpassing traditional leaders such as Bitcoin and Ethereum. This performance is enabled by the unique Proof of History (PoH) consensus mechanism along with Proof of Stake (PoS), which significantly reduces transaction latency and improves overall network efficiency.

Transaction costs on Solana are surprisingly low, with an average fee of around $0.00025, making it a cost-effective choice for developers and users. This efficiency does not come at the expense of the environment: Solana's energy consumption is minimal and comparable to the energy used for a few Google searches, reflecting its commitment to sustainability.

Solana's ecosystem benefits from robust partnerships with tech giants and a commitment to constant innovation, as evidenced by updates such as Firedancer that further improve its performance and scalability. Despite challenges such as network instability, Solana's continuous improvements and strategic collaborations emphasize its potential as a dominant force in blockchain technology.

---

### Preliminary requirements

#### Programming Stack

The prerequisites for developing on Solana include programming knowledge and familiarity with blockchain concepts. Here's a refined overview aimed at someone with previous blockchain experience:

- **JavaScript**:
  - **Need**: Required to interact with the Solana blockchain through the Solana Web3.js library, which enables communications such as sending transactions and querying blockchain data.
  - **Proficiency**: A strong command of JavaScript, including modern ES6+ syntax and asynchronous programming, is critical for effective development on Solana.

- **React**:
  - **Essential**: Highly recommended for creating user interfaces for decentralized applications (dApps) on Solana. React makes it easy to create dynamic and responsive web applications that interact with blockchain.
  - **Proficiency level**: Familiarity with React basics (components, hooks, state management) will be helpful. Integrating React applications with Solana requires an understanding of how to use Solana's Web3.js library in the context of a React application.

- **Rust**:
  - For developing on-chain programs in Solana, knowledge of the Rust language will be very useful. Solana smart contracts (or programs) are mostly written in Rust, leveraging its performance and security.

- **Development tools and environment**: Knowledge of Solana development tools, including the Anchor framework to simplify smart contract development, will be helpful. Understanding how to deploy applications on Solana networks (devnet, testnet, mainnet-beta) is critical for real-world deployment.

### Basic Blockchain Concepts:

- **Essential:** An understanding of the basic principles of blockchain is fundamental. This includes knowledge of consensus mechanisms, smart contracts (referred to as programs in Solana), transactions, wallets, and cryptographic keys.
- **Solana Specific Concepts:** Knowledge of Solana's unique features, such as Proof of History (PoH), consensus mechanism, and the structure of Solana programs and accounts, is essential. Familiarity with the Solana Program Library (SPL) and command-line tools such as Solana CLI for testing and deployment is also recommended.

This information emphasizes that while familiarity with blockchain fundamentals is assumed, Solana development introduces unique aspects and tools that developers must learn to effectively build on this platform. For those new to Solana, starting with existing Solana SDKs such as solana-web3.js can be a practical approach before delving into Rust software development.

### Necessary Software:

Setting up an environment with the necessary software is crucial for Solana development. Basic software requirements include **Node.js**, **Yarn**, and **Git**. These tools are needed to run and manage Solana projects, conduct tests, and perform version control.

- **Node.js** is required to execute server-side JavaScript code and to interact with the Solana blockchain using various JavaScript libraries and frameworks. You can install Node.js from its [official website](https://nodejs.org/).
- **Yarn** is a package manager that helps manage project dependencies. It is used to install, update, and manage the libraries and packages your project needs. Yarn can be installed via the npm package manager that comes with Node.js by running `npm install -g yarn` in the terminal. More information about Yarn can be found on its [official website](https://yarnpkg.com/).
- **Git** is a version control system that allows you to track changes to your codebase and collaborate with other developers. It is essential for managing the development of complex projects. You can install Git from its [official website](https://git-scm.com/).

In addition to these software tools, developing on Solana also requires installing the Solana CLI (command-line interface), essential for interacting with the Solana blockchain. The installation process depends on your operating system but typically involves executing a shell command that finds and installs the Solana tools directly. Detailed instructions for installing the Solana CLI can be found in the Solana documentation [here](https://docs.solana.com/cli/install-solana-cli-tools).

Don't forget to install the [Phantom wallet](https://phantom.app/) for a seamless Solana experience.

---

### Section 1: Understanding Solana

Solana is a high-performance blockchain platform known for its scalability and speed, largely due to a unique consensus mechanism called Proof of History (PoH). Unlike traditional consensus mechanisms such as Proof of Work (PoW) used in Bitcoin or Proof of Stake (PoS) used in many other blockchains, PoH offers a new approach to recording the order of events and confirming transactions.

#### Proof of History (PoH):

PoH works alongside PoS in Solana to enhance its efficiency. It employs a cryptographic timestamp to establish a verifiable sequence of events, enabling validators to agree on the timing and order of transactions with minimal communication. This is achieved by creating a hash chain where each hash is dependent on the previous one, acting as a decentralized clock. This mechanism ensures a secure and accurate timestamp for each transaction, facilitating quick consensus on the blockchain's state.

#### Benefits of PoH:

- **Scalability:** PoH streamlines transaction organization and reduces validator communication needs, enabling Solana to handle thousands of transactions per second.
- **Low Latency:** The simplified verification process allows for swift transaction processing, enhancing dApps and services usability on Solana.
- **Security:** The cryptographic nature of PoH, combined with Solana's PoS consensus, ensures robust network protection against attacks.
- **Energy Efficiency:** PoH's design is more energy-efficient than PoW, as it doesn't involve intensive mining activities.

#### Solana Architecture:

Solana's architecture is engineered to maximize throughput and reduce transaction confirmation times through innovative technologies like the Gulf Stream protocol for transaction forwarding, Sealevel for parallel smart contract processing, and Turbine for efficient block propagation. Coupled with PoH, these technologies allow Solana to achieve remarkable speed and scalability, making it a formidable platform for dApps, DeFi, and NFTs. The introduction of PoH marks a significant advancement in blockchain technology by addressing common scalability and speed bottlenecks.

---

### Key Concepts in Solana Development (Accounts, Programs, Transactions):

Developing on Solana centers around three key concepts: accounts, programs, and transactions, essential for creating applications on its blockchain.

#### Accounts:

Accounts on Solana serve as storage units that can contain data, SOL (Solana's native currency), or smart contract code, each

 identified by a unique public key. Types of accounts include user wallets, program accounts (with executable code), and data storage accounts. Solana's account model uniquely requires accounts to have sufficient SOL to cover "rent" or storage costs.

#### Programs:

Programs in Solana, akin to smart contracts on other platforms, offer enhanced flexibility and efficiency. They are stateless, with state stored in associated accounts, and can be updated for dynamic application development. Programs execute transaction instructions and can interact with other programs for interoperability within the Solana ecosystem.

#### Transactions:

Transactions in Solana are how users interact with programs, containing instructions like SOL transfers, account data modifications, or program logic invocation. Signed by one or more private keys, transactions ensure the initiator's authority for the specified actions. Solana ensures transaction atomicity, where all operations must succeed or fail together, contributing to its high processing efficiency.

Understanding these foundational concepts is vital for developers transitioning from other blockchains or new to blockchain development, highlighting Solana's unique consensus mechanism and efficient program and account models.
To enhance readability and consistency in your markdown document, I have made adjustments to improve the structure and clarity. Here's the revised markdown:

---

### **Section 2: Setting Up the Development Environment:**

#### Installing Solana CLI tools:
You can do it by following the official guide at this [link](https://docs.solanalabs.com/cli/install).

#### Setting up the local Solana blockchain (test validator):
To configure the Solana local blockchain (test validator), first ensure the Solana CLI is installed. Then, run the command `solana-test-validator` in a new terminal window. This starts a local blockchain cluster on your machine. Use the command `solana config set --url localhost` to configure the Solana CLI to communicate with the local cluster.

Create a file system wallet using `solana-keygen new` to deploy programs and manage transactions.
```
solana-keygen new --outfile /path/to/save/your/program-keypair.json
# example
# solana-keygen new -o /Users/user/.config/solana/id.json
```
Finally, transfer SOL tokens to your wallet using `solana airdrop 2` to pay for transactions. Detailed steps can be found in [Solana's guide](https://solana.com/developers/guides/getstarted/setup-local-development) to setting up local development.

#### Why Anchor?:
The Anchor framework simplifies the development of Solana smart contracts by providing a layer of abstraction above the core Solana development kit. It offers tools and a runtime environment to efficiently build, test, and deploy programs on the Solana blockchain. Anchor is designed to simplify the development process, reduce boilerplate code, and introduce familiar programming patterns into Solana, making it more accessible to developers familiar with other smart contract platforms. By offering a Rust-based framework that automates many of the lower-level details involved in developing programs on Solana, Anchor allows developers to focus on the logic of the application rather than the intricacies of the blockchain itself.

---

### Section 3: Building Your First Solana Program with Rust and Anchor:

**Prerequisites:**
1. Basic understanding of programming in the Rust language.
2. [Solana CLI](https://docs.solanalabs.com/cli/install) and [Rust](https://www.rust-lang.org/tools/install) are installed on your computer.

#### Step 1: Create a new project with Anchor:

**1. Install Anchor:** If you have not installed Anchor yet, run the command:
```
cargo install --git https://github.com/project-serum/anchor anchor-cli --locked
```
Anchor simplifies Solana development by providing a framework for the Sealevel Solana runtime environment.

**2. Initialize a new Anchor project:**
```
anchor init my_solana_dapp --javascript
```
The `--javascript` flag sets up a project with JavaScript examples to integrate with the frontend. Notice the **programs/** directory where your Rust programs will live, and the **tests/** directory for your program tests.

**3. Navigate to the project directory:**
```
cd my_solana_dapp
```

#### Step 2: Writing the Program Logic

1. Open the **lib.rs** file by navigating to it:
```
cd programs/my_solana_dapp/src
```
This is where you will write the logic for your program.

2. Define your program by replacing the contents of **lib.rs** with the following Rust code. This example creates a simple program that writes a number.
```rust
#[program]
pub mod my_solana_dapp {
    use super::*;
    pub fn create_greeting(ctx: Context<CreateGreeting>) -> Result<()> {
        let greeting_account = &mut ctx.accounts.greeting_account;
        greeting_account.counter = 0;
        Ok(())
    }

    pub fn increment_greeting(ctx: Context<IncrementGreeting>) -> Result<()> {
        let greeting_account = &mut ctx.accounts.greeting_account;
        greeting_account.counter += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateGreeting<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub greeting_account: Account<'info, GreetingAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct IncrementGreeting<'info> {
    #[account(mut)]
    pub greeting_account: Account<'info, GreetingAccount>,
}

#[account]
pub struct GreetingAccount {
    pub counter: u64,
}
```
3. Understand the code: The program consists of two main functions: **create_greeting** and **increment_greeting**, as well as the necessary data structures for account management.

- **Program declaration:** `#[program]` marks the `my_solana_dapp` module as containing smart contract entry points. Within this module, the business logic

 of the contract is defined.
- **Functions:**
  - **create_greeting(ctx: Context<CreateGreeting>) -> Result<()>**: Initializes a new "greeting" account with the counter set to 0.
  - **increment_greeting(ctx: Context<IncrementGreeting>) -> Result<()>**: Increments the counter in the specified "greeting" account by 1.
- **Account structures:** `#[derive(Accounts)]` specifies the accounts each function expects, helping Anchor perform security and ownership checks.
- **Key concepts:** Account initialization, signatories and permissions, and simple state management are demonstrated, showing basic patterns of account creation, transaction signing, and state management in Solana and Anchor.

You can learn more by this [link](https://www.soldev.app/course/intro-to-anchor).

---

#### Step 3: Building the Program

**Build your project:** Run the `anchor build` command:
```
anchor build
```
This command compiles your Rust program into a BPF (Berkeley Packet Filter) bytecode, which can be deployed on the Solana blockchain.

**Find your program ID:** After building, locate your program ID in **target/idl/my_solana_dapp.json** or by running:
```
solana address -k target/deploy/my_solana_dapp-keypair.json
```

---

### Compiling and Deploying the Program to the Local Solana Network:

#### **Prerequisites:**
- Local Solana test validator running.
- Anchor and Solana CLI tools installed.

#### **Program compilation:**
If you followed the build step in the previous section, your program is already compiled. Ensure your Solana LAN (test validator) is running.

#### Deploying the program:

1. **Start the Solana test validator (if it is not already running):**
```
solana-test-validator
```

2. **Configure the Solana CLI to use the local network:** Run:
```
solana config set --url localhost
```

3. **Deploy the program:** Navigate to your project directory and run this command:
```
anchor deploy
```
This command deploys your compiled program to the Solana local network. After a successful deployment, Anchor will display the program ID and update your project's **Anchor.toml** and JavaScript files with the deployed program's ID, simplifying integration with your frontend.

4. **Verify deployment:** Verify the deployment by running:
```
solana program show <PROGRAM_ID>
```
Replace **<PROGRAM_ID>** with your program ID. This command shows detailed information about your program if it has been successfully deployed.

*Example of output:*
```
solana program show CC3EongBFU71ru4LRdUe3wNg5ULLLnCnJLhRhbUcP93o
Program Id: CC3EongBFU71ru4LRdUe3wNg5ULLLnCnJLhRhbUcP93o
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: 6nnAVBvmJHJyN4keECcZDswfF6zzeLAEs2qZGWMcuhFj
Authority: 9HGR7nJ2VQ4T23SyHA7BhqrShj9MokwNKdgTh1en61fC
Last Deployed In Slot: 8777
Data Length: 200840 (0x31088) bytes
Balance: 1.39905048 SOL
```

---
#### Conclusion:

You have now created and deployed a simple Solana program using Rust and Anchor. Experimenting with more complex logic and interactions will help you better understand Solana's capabilities.

---

### Section 4: Integrating with the Frontend using React and Anchor:

#### Setting Up a React Application:

Delete the **/app** directory and create a new react app with the following command:
```
npx create-react-app app
```
After it, navigate to the app directory:
```
cd app/
```
Install necessary dependencies:
```
npm install @solana/web3.js @project-serum/anchor @solana/wallet-adapter-react \
@solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets \
@solana/wallet-adapter-base
```
Additionally, install the wallet adapter libraries for React and Phantom, along with web3.js:
```
npm install @solana/wallet-adapter-react @solana/wallet-adapter-phantom @solana/web3.js
```

#### Prerequisites:

1. Node.js installed.
2. Navigate to the **app/** directory of your project.

#### Dependency Installation:

Connecting to the localhost blockchain using Phantom Wallet:
- The document originally included images from a Medium article to illustrate the process.

#### Phantom Integration:

Use the `@solana/wallet-adapter-react` libraries to connect to Phantom. This should already be part of your settings if you initialized the project with Anchor.

#### Sending Transactions and Interacting with the Solana Program:

Modify **app/src/App.js** to connect to the Solana program and send transactions. Use the generated IDL (Interface Description Language) file from the Anchor build to interact with your program by moving it from the **target/idl** directory to the src folder in your **app** directory.

Implement functions to connect your wallet, create a greeting account, and increment the greeting counter. Here's a sample implementation for **App.js**:

```javascript
import { useState } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import idl from "./my_solana_dapp.json"; // The path to your JSON IDL file

const programID = new PublicKey(idl.metadata.address);
const network = "http://127.0.0.1:8899"; // Adjust for your environment: local, devnet, or mainnet-beta
const opts = { preflightCommitment: "processed" };

const App = () => {
  const wallet = useAnchorWallet();
  const { connected } = useWallet();
  const [greetingAccountPublicKey, setGreetingAccountPublicKey] = useState(null);
  const [error, setError] = useState("");

  const getProvider = () => {
    if (!wallet) return null;
    const connection = new Connection(network, opts.preflightCommitment);
    return new AnchorProvider(connection, wallet, opts.preflightCommitment);
  };

  const createGreeting = async () => {
    setError("");
    if (!connected) {
      setError("Wallet is not connected.");
      return;
    }
    const provider = getProvider();
    if (!provider) {
      setError("Provider is not available.");
      return;
    }
    const program = new Program(idl, programID, provider);
    try {
      const greetingAccount = Keypair.generate();
      await program.rpc.createGreeting({
        accounts: {
          greetingAccount: greetingAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [greetingAccount],
      });
      console.log("Greeting account created!");
      setGreetingAccountPublicKey(greetingAccount.publicKey.toString());
    } catch (err) {
      console.error("Error creating greeting account:", err);
      setError("Failed to create greeting account. Please try again.");
    }
  };

  const incrementGreeting = async () => {
    setError("");
    if (!connected) {
      setError("Wallet is not connected.");
      return;
    }
    if (!greetingAccountPublicKey) {
      setError("Greeting account not created or public key not set.");
      return;
    }
    const provider = getProvider();
    if (!provider) {
      setError("Provider is not available.");
      return;
    }
    const program = new Program(idl, programID, provider);
    try {
      await program.rpc

.incrementGreeting({
        accounts: {
          greetingAccount: new PublicKey(greetingAccountPublicKey),
          user: provider.wallet.publicKey,
        },
        signers: [],
      });
      console.log("Greeting incremented!");
    } catch (err) {
      console.error("Error incrementing greeting:", err);
      setError("Failed to increment greeting. Please try again.");
    }
  };

  return (
    <div>
      <WalletMultiButton />
      <WalletDisconnectButton />
      <button onClick={createGreeting}>Create Greeting</button>
      {greetingAccountPublicKey && (
        <button onClick={incrementGreeting}>Increment Greeting</button>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default App;
```

For **index.js**:

```javascript
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import "@solana/wallet-adapter-react-ui/styles.css";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

const wallets = [new PhantomWalletAdapter()];
const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ConnectionProvider endpoint="http://127.0.0.1:8899">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
```

To airdrop some SOL on our wallet in our localhost network, use the following command:
```
solana airdrop 10 3EEQVdGGCqiY4CEHiZ3S9CiTnGqE8mztUfFFZmTjYq4V
# Example: solana airdrop amount wallet_address
```

After running the app with `npm run`, you'll see the UI allowing you to "**Select Wallet**", connect the wallet, and press "**Create Greeting**". This leads to greeting creation, and you can increment it by pressing "Increment Greeting". This confirms that our app is working as expected.

---

### Section 6: Testing and Deployment:

In tests, we use the file `my_solana_dapp.js` and insert the following code for testing our Solana application:

```rust
use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;
use my_solana_dapp::{self, *};
use anchor_lang::ToAccountInfo;
use anchor_lang::solana_program::pubkey::Pubkey;

#[tokio::test]
async fn test_create_and_increment_greeting() {
    let program_test = anchor_lang::solana_program_test!(my_solana_dapp);
    program_test.start().await; // Create test environment
    let (mut banks_client, payer, recent_blockhash) = program_test.banks_client().await;
    
    // Derive a new account to be the greeting account
    let greeting_account = Keypair::new();
    
    // Create Greeting Account
    {
        let create_greeting_ix = instruction::create_greeting(
            &my_solana_dapp::id(),
            &greeting_account.pubkey(),
            &payer.pubkey(),
        );
        let mut transaction = Transaction::new_with_payer(
            &[create_greeting_ix],
            Some(&payer.pubkey()),
        );
        transaction.sign(&[&payer, &greeting_account], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();
    }

    // Increment Greeting Account
    {
        let increment_greeting_ix = instruction::increment_greeting(
            &my_solana_dapp::id(),
            &greeting_account.pubkey(),
        );
        let mut transaction = Transaction::new_with_payer(
            &[increment_greeting_ix],
            Some(&payer.pubkey()),
        );
        transaction.sign(&[&payer], recent_blockhash);
        banks_client.process_transaction(transaction).await.unwrap();
    }

    // Fetch the updated greeting account
    let greeting_account_data: GreetingAccount = banks_client
        .get_account(greeting_account.pubkey())
        .await
        .expect("get_account")
        .expect("account not found")
        .try_into()
        .expect("account deserialization");

    // Verify the counter has been incremented
    assert_eq!(greeting_account_data.counter, 1);
}
```

Run the test command:
```
anchor test
```
This command executes your test suite, verifying that your program's logic behaves as expected before deployment.

#### Deploying Applications to the Devnet and Mainnet:

When using Anchor, deploying to **devnet** and **mainnet** is streamlined, providing developers with tools and abstractions for efficient deployment.

**Preparing for Deployment:**
- Ensure your application is fully tested and optimized.
- Perform security audits and optimize performance before deploying.

**Configuring Anchor for Deployment:**
1. **Customize Anchor.toml:** Adjust settings for different networks (localnet, devnet, mainnet) ensuring correct RPC endpoints and wallet configurations.
2. **Build the Project:** Use `anchor build` to update all artifacts and compile the Rust program into executable BPF bytecode.

**Deploying to Devnet:**
- Make sure the **Anchor.toml** file points to devnet for testing in an environment similar to mainnet without risking real assets.
- Fill your wallet with test SOL using a faucet if necessary.
- Deploy your program with `anchor deploy --provider.cluster devnet`.

**Moving to Mainnet:**
- Update **Anchor.toml** to mainnet settings, including the RPC URL and wallet for deployment.
- Ensure you have sufficient SOL for deployment and transaction costs.
- Deploy to mainnet with `anchor deploy --provider.cluster mainnet`.

**Post-Deployment:**
- Monitor application performance and user interactions closely.
- Use Solana Explorer and Anchor's logging for troubleshooting and optimization.
- Engage with your user community for feedback and support.

---

### Finish:

This guide has provided a foundational understanding of developing on Solana with Anchor and integrating a React frontend. This knowledge prepares you for decentralized application development in the exciting world of blockchain. Remember,

 blockchain development is an ongoing journey of learning and innovation. Good luck on your development journey, and let's build the future of blockchain together.

### Links to contact me:
- [LinkedIn](https://www.linkedin.com/in/anatolii-zhadan/)
### Origin article:
- [Medium](https://medium.com/@Anatolii_Zhadan/the-complete-guide-to-full-stack-solana-development-with-react-anchor-rust-and-phantom-18a1e1bdbb3b)