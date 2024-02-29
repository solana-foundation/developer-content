# New Journey

Welcome to the Solana ecosystem, a realm where speed meets innovation, paving the way for the next wave of decentralized applications. If you're intrigued by the prospect of staking SOL tokens, exploring the dynamic NFT market, or navigating the ever-evolving world of DeFi, you've found the perfect guide. Join us as we dive into the exciting adventure that Solana offers!

# Discovering Solana

Envision the cryptocurrency landscape as a sprawling, futuristic city. Within this metropolis, Solana stands out not merely as a structure but as a vast network of superhighways, engineered for unparalleled velocity. Created by the visionary minds of Anatoly Yakovenko and Raj Gokal, Solana Labs ensures the network's seamless operation and continuous growth.

## The Core of Solana: Programs

Solana transcends the traditional concept of smart contracts by introducing "programs" — the fundamental elements that fuel all activities on the blockchain. These programs facilitate the creation of striking NFTs and enable rapid token exchanges, setting the stage for a bustling digital ecosystem.

## A Flourishing Digital Marketplace

Imagine Solana as an expansive marketplace, buzzing with activity. Here, unique digital collectibles are exchanged, transactions are powered by SOL coins, and a wide variety of decentralized applications offer services ranging from gaming to finance.

## Staking: Ensuring Security and Earning Rewards

Solana employs a hybrid security mechanism to maintain the network's integrity. By staking SOL coins, you contribute to transaction validation and network order, earning rewards in the process.

# Unmatched Speed and Cost-Efficiency

With the capability to process an astonishing 65,000 transactions per second at minimal fees, Solana stands in stark contrast to congested networks, offering a smooth and efficient experience.

Despite its remarkable speed and efficiency, Solana's journey has been marked by challenges and debates over its level of decentralization. These aspects add a layer of intrigue to the platform, likening it to a high-performance sports car with its own set of idiosyncrasies.

# Why Dive into Solana Development?

Solana's unique attributes open up a world of opportunities for developers:

Scalable Solutions: Built to handle vast transaction volumes, Solana allows you to create applications that serve thousands of users without the complexities of layer 2 scaling.
Advanced Development Tools: The Solana toolkit is designed to enhance the dApp development process, offering innovative features and integration possibilities with layer 2 solutions.
A Supportive Community: By engaging with Solana's vibrant ecosystem, you become part of a collaborative network of developers, entrepreneurs, and investors.
Career Opportunities: The growing adoption of Solana translates into a demand for skilled developers, offering a path to rewarding career prospects.
Getting Started with Solana Development
Choosing the Right Programming Language

While Ethereum is closely associated with Solidity, Solana champions Rust for its smart contract development, prioritizing safety and efficiency. The Rust ecosystem, enriched by libraries and frameworks like Anchor, simplifies the development process, making it accessible even to those new to Rust.

## Setting Up Your Development Environment

The Solana CLI acts as your gateway to the network, facilitating everything from smart contract deployment to fine-tuning. For an optimal development experience, setting up a local environment is recommended, allowing for thorough testing and iteration.

## Prerequisites for Anchor Development

This guide assumes familiarity with Solana's programming model and a basic understanding of Rust. For newcomers, resources like the Rust Book and Rust By Example provide a solid foundation, complemented by the Anchor framework for streamlined development.

As we embark on this journey through Anchor development, we'll explore the intricacies of developing, testing, and interacting with Solana programs, laying the groundwork for innovative blockchain applications.

### Installing Anchor
Setting up Anchor involves a few straightforward steps to install the necessary tools and packages. This section covers installing these tools and packages (i.e., Rust, the Solana Tool Suite, Yarn, and the Anchor Version Manager).
Installing Rust
Rust can be installed from the official Rust website or via the command line:
```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Installing the Solana Tool Suite
Anchor also requires the Solana Tool Suite. The latest release (1.17.16 - at the time of writing this article) can be installed with the following command for macOS and Linux:
```shell
sh -c "$(curl -sSfL https://release.solana.com/v1.17.16/install)"
```

For Windows users, it is possible to install the Solana Tool Suite using the following command:
```shell
cmd /c "curl https://release.solana.com/v1.17.16/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe --create-dirs"
```

However, it is strongly recommended that you use Windows Subsystem for Linux (WSL) instead. This will allow you to run a Linux environment on your Windows machine without needing to dual boot or spin up a separate virtual machine. By taking this route, refer back to the installation instructions for Linux (i.e., the curl command).
Developers can also replace v1.17.16 with a release tag of the version they wish to download. Or, use the stable, beta, or edge channel names. Once installed, run solana –-version to confirm the desired version of solana is installed.
Installing Yarn
Anchor also requires Yarn. It can be using Corepack, which is included with all official Node.js releases starting from Node.js from 14.9 / 16.9. However, it's currently opt-in during its experimental stage. So, we need to run corepack enable before it's active. Some third-party distributors may not include Corepack by default. Thus, you may need to run npm install -g corepack before corepack enable.
Installing Anchor Using AVM
The Anchor documentation advises installing Anchor via the Anchor Version Manager (AVM). The AVM simplifies managing and selecting multiple installations of the anchor-cli binary. This may be required to produce verifiable builds, or to work with alternate versions across different programs. It can be installed using Cargo with the command: 
```shell
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
```

Then, install and use the latest version:
```shell
avm install latest
avm use latest

# Verify the installation
avm --version
```

For a list of anchor-cli’s available versions, use the avm list command. Developers can use avm use <version> to use a specific version. This version will remain in use until it is changed. Developers can uninstall a specific version using the avm uninstall <version> command.
Installing Anchor Using Binaries and Building From Source
On Linux, Anchor binaries are available via the npm package @coral-xyz/anchor-cli. Currently, only x86_64 Linux is supported. So, developers must build from source for other operating systems. Developers can use Cargo to install the CLI directly. For example:
```shell
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli --locked
```

Modify the --tag argument to install another desired Anchor version. Additional dependencies may need to be installed if the Cargo installation fails. For example, on Ubuntu:

```shell
sudo apt-get update && sudo apt-get upgrade && sudo apt-get install -y pkg-config build-essential libudev-dev
```

Developers can then verify their Anchor installation with the anchor --version command.
Solana Playground

Alternatively, developers can start with Anchor using Solana Playground (Solpg). Solana Playground is a browser-based IDE that facilitates the quick development, testing, and deployment of Solana programs. 
Developers must create a Playground Wallet for their first time using Solana Playground. Click the red status indicator labeled Not connected at the bottom left of the screen. The following modal will pop up:

It is recommended to save the wallet’s keypair file as a backup before clicking Continue. This is because the Playground Wallet is saved in the browser’s local storage. Clearing the browser cache will remove the wallet. 

Click Continue to create a devnet wallet ready to be used in the IDE.
To fund the wallet, developers can run the following command solana airdrop <amount> in the Playground terminal, where <amount> is replaced with the desired amount of devnet SOL. Alternatively, visit this faucet for devnet SOL. I recommend checking out the following guide on how to get devnet SOL.
Note that you may encounter the following error:

Error: unable to confirm transaction. This can happen in situations such as transaction expiration and insufficient fee-payer funds


This is often due to the devnet faucet being drained and/or requesting too much SOL. The current limit is 5 SOL, which is more than enough to deploy this program. It is therefore recommended to request 5 SOL from the faucet or execute the command solana airdrop 5. Requesting smaller amounts incrementally can potentially lead to rate-limiting.
Hello, World!
Hello, World! programs are regarded as an excellent introduction to new frameworks or programming languages. This is because of their simplicity, as developers of all skill levels can understand them. These programs also elucidate the new programming model's basic structure and syntax without introducing complex logic or functions. It has quickly become a pretty standard beginner program in coding, so it’s only natural that we write one ourselves for Anchor. This section covers how to build and deploy a Hello, World! program with a local Anchor setup as well as with Solana Playground.
Creating a new Project with a Local Anchor Setup
Creating a new project with Anchor installed is as easy as:

```shell
anchor init hello-world
cd hello-world
```

These commands will initialize a new Anchor project called hello-world, and will navigate into its directory. In this directory, navigate to hello-world/programs/hello-world/src/lib.rs. This file contains the following starter code:
```rust
use anchor_lang::prelude::*;

declare_id!("HZfVb1ohL1TejhZNkgFSKqGsyTznYtrwLV6GpA8BwV5Q");

#[program]
pub mod hello-world {
    use super::*;

    pub fn initialize(ctx: Context) -> Result<()> {
        Ok(())
    }

pub fn create_message(ctx: Context<CreateMessage>, content: String) -> Result<()> {
  let message: &mut Account<Message> = &mut ctx.accounts.message;
  let author: &Signer = &ctx.accounts.author;
  let clock: Clock = Clock::get().unwrap();
  
  message.author = *author.key;
  message.timestamp = clock.unix_timestamp;
  message.content = content;
  
  Ok(())
}


pub fn update_message(ctx: Context<UpdateMessage>, content: String) -> Result<()> {
  let message: &mut Account<Message> = &mut ctx.accounts.message;
  let author: &Signer = &ctx.accounts.author;
  let clock: Clock = Clock::get().unwrap();
  
  message.author = *author.key;
  message.timestamp = clock.unix_timestamp;
  message.content = content;
  
  Ok(())
}
}

#[derive(Accounts)]
pub struct Initialize {}

#[account]
pub struct Message {
    pub author: Pubkey,
    pub timestamp: i64,
    pub content: String,
}

#[derive(Accounts)]
pub struct CreateMessage<'info> {
		#[account(init, payer = author, space = 1000)]
    pub message: Account<'info, Message>,
		#[account(mut)]
    pub author: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateMessage<'info> {
		#[account(mut)]
    pub message: Account<'info, Message>,
		#[account(mut)]
    pub author: Signer<'info>,
}
```rust

Anchor has prepared a number of files and directories for us. Namely,
An empty app for the program’s client
A programs folder that will house all of our Solana programs
A tests folder for JavaScript testing. It comes with a test file auto-generated for the starter code
An Anchor.toml configuration file. If you’re new to Rust, a TOML file is a minimal configuration file format that’s easy to read due to its semantics. The Anchor.toml file is used to configure how Anchor will interact with the program. For example, what cluster the program should be deployed to.
Creating a New Project with Solana Playground
Creating a new project on Solana Playground is very straightforward. Navigate to the top left corner and click Create a New Project:

The following modal will pop up:

Name your program, select Anchor(Rust), and click Create. This will create a new Anchor project directly in your browser. Under the Program section on the left, you’ll see a src directory. It holds lib.rs, which has the following starter code:
```rust
use anchor_lang::prelude::*;

// This is your program's public key and it will update
// automatically when you build the project.
declare_id!("11111111111111111111111111111111");

#[program]
mod hello_anchor {
    use super::*;
    pub fn initialize(ctx: Context, data: u64) -> Result<()> {
        ctx.accounts.new_account.data = data;
        msg!("Changed data to: {}!", data); // Message will show up in the tx logs
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    // We must specify the space in order to initialize an account.
    // First 8 bytes are default account discriminator,
    // next 8 bytes come from NewAccount.data being type u64.
    // (u64 = 64 bits unsigned integer = 8 bytes)
    #[account(init, payer = signer, space = 8 + 8)]
    pub new_account: Account<'info, NewAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct NewAccount {
    data: u64
}
```

Notice how Solana Playground only generates client.ts and anchor.test.ts files. I’d recommend reading through the section on creating a program with Anchor locally to see a breakdown of what is usually generated for a new Anchor project.

Writing Hello, World!
Regardless of whether you’re using Anchor locally or via Solana Playground, for a very simple Hello, World! program, replace the starter code with the following:
```rust
use anchor_lang::prelude::*;

declare_id!("HZfVb1ohL1TejhZNkgFSKqGsyTznYtrwLV6GpA8BwV5Q");

#[program]
mod hello_world {
use super::*;

pub fn hello(_ctx: Context<Hello>) -> Result<()> {
	msg!("Hello, World!");
	Ok(())
}

#[derive(Accounts)]
pub struct Hello {}
}
```rust

We’ll go over the exact specifics of each part in the subsequent sections. For now, it is important to notice the use of macros and traits to simplify the development process. The declare_id! macro sets the public key for the program. For local development, the anchor init command to set up the program will generate a keypair in the target/deploy directory and populate this macro. Solana Playground will also do this for us automatically.
In our main hello_world module, we create a function that logs Hello, World! It also returns Ok(()) to signal successful program execution. Notice that we prefix ctx with an underscore to avoid unused variable warnings in our console. Hello is an account struct that does not require any accounts to be passed since the program only logs a new message.
That’s it! There’s no need to take in any accounts or do some complex logic. The code presented above creates a program that logs Hello, World!
#### Building and Deploying Locally
This section will focus on deploying to Localhost. Although Solana Playground defaults to devnet, a local development environment offers a significantly improved developer experience. Not only is it faster, but also circumvents several issues commonly encountered when testing against devnet. For example, insufficient SOL for transactions, slow deployments, and the inability to test when devnet is down. In contrast, developing locally can guarantee a fresh state with each test. This allows for a more controlled and efficient developer environment.
#### Configuring Our Tools
First, we want to ensure that the Solana Tool Suite is configured correctly for Localhost development. Run the solana config set --url localhost command to ensure all configurations point to Localhost URLs. 
Also, ensure you have a local key pair to interact with Solana locally. You must have a Solana wallet with a SOL balance to deploy a program with the Solana CLI. Run the solana address command to check if you already have a local key pair. If you come across an error, run the solana-keygen new command. A new file system wallet will be created at the ~/.config/solana/id.json path by default. It will also provide a recovery phrase that can be used to recover the public and private keys. It is recommended to save this key pair, even though it is being used locally. Also note, if you already have a file system wallet saved at the default location, the solana-keygen new command will not override it unless specified with the --force command.
Configuring the Anchor.toml
Next, we want to ensure our Anchor.toml file correctly points to Localhost. Ensure it contains the following code:

...
[programs.localnet]
hello-world = "EJTW6qsbfya86xeLRQpKLM8qhn11cJXmU35QbJwE11R8"
...
[provider]
cluster = "Localnet"
wallet = '~config/solana/id.json'


Here, [programs.localnet] refers to the program’s ID on localnet (i.e., Localhost). The program ID is always specified in relation to the cluster. This is because the same program can be deployed to a different address on a different cluster. From a developer experience perspective, declaring new program IDs for programs deployed across different clusters can be annoying. 
The program ID is public. However, its key pair is stored in the target/deploy folder. It follows a specific naming convention based on the program’s name. For example, if the program is named hello_world, Anchor will look for a keypair at target/deploy/hello-world-keypair.json. Anchor will generate a new key pair if it does not find this file during deployment. This will result in a new program ID. Thus, updating the program ID after the first deployment is crucial. The hello-world-keypair.json file serves as proof of ownership for the program. If the keypair is leaked, malicious actors can make unauthorized changes to the program. 
With [provider], we are telling Anchor to use Localhost and the specified wallet to pay for storage and transactions.
#### Writing the Tests
First, we’ll test if we can create a message. In your tests/solana-hello-world.ts file, adding the following test within the describe() function:
```typescript
it("Can create a message", async () => {
    const message = anchor.web3.Keypair.generate();
    const messageContent = "Hello World!";
    await program.rpc.createMessage(messageContent, {
      accounts: {
        message: message.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [message],
    });


    const messageAccount = await program.account.message.fetch(
      message.publicKey
    );


    assert.equal(
      messageAccount.author.toBase58(),
      provider.wallet.publicKey.toBase58()
    );
    assert.equal(messageAccount.content, messageContent);
    assert.ok(messageAccount.timestamp);
  });
```

Let’s walk through line-by-line:
First, we generated a Keypair consisting of a public and private key, where the public key will be used as the accountId for the message account that will be created. We then define the content of the message: “Hello World” 😉!
Then, we use the use the program we defined earlier to make a call to the createMessage instruction on our deployed Solana program.
From the context of our createMessage instruction, we need to provide three accounts: the message to be created, the author of the message (which is , and the Solana systemProgram. We input them as their public keys (remember account Id and program Id are both just public keys!)
We also need to provide the Keypair for the message as a signature. This is because we’re having the account sign to confirm to the System program through this instruction to create the message account. We also need the signature from the author's wallet, but Anchor automatically implicitly providers, so we don’t have to!
After waiting for the instruction to execute, we then access the message account on the devnet by reading it from the Solana program we wrote through its public key.
Lastly, we use the assert library to confirm that the data we stored in the account - the author, the content of the message, and the timestamp are are as we expect them to be.


#### Building, Deploying, and Running a Local Ledger
Use the anchor build command to build the program. For building a specific program by its name, use the anchor build -p <program name> command, replacing <program name> with the program’s name. Since we’re developing on localnet, we can use the Anchor CLI’s localnet commands to streamline the development process. For example, anchor localnet --skip-build is particularly useful for skip building a program in the workspace. This can save time when running tests, and the program’s code has not been altered.
If we try to run the anchor deploy command now, we’ll get back an error. This is because we don’t have a Solana cluster running on our own machine that we can test against. We can run a local ledger to simulate a cluster on our machine. The Solana CLI comes with a test validator already built in. Running the solana-test-validator command will start a full-featured, single-node cluster on your workstation. This is beneficial for a number of reasons, such as no RPC rate limits, no airdrop limits, direct on-chain program deployment, loading accounts from files, and cloning accounts from a public cluster. The test validator must run in a separate open terminal window and remain running for the localhost cluster to stay online and be available for interaction. 
We can now successfully run anchor deploy to deploy the program to our local ledger. Any data transmitted to the local ledger will be saved in a test-ledger folder generated in the current working directory. Adding this folder to your .gitignore file is recommended to avoid committing this folder to your repository. Also, exiting the local ledger (i.e., hitting Ctrl + C in the terminal) will not remove any data sent to the cluster. Removing the test-ledger folder or running solana-test-validator --reset will.
Congratulations! You’ve just deployed your first Solana program to Localhost!
#### Solana Explorer
Developers can also configure the Solana Explorer with their local ledger. Navigate to the Solana Explorer. In the navbar, click on the green button stating the current cluster:

This will open up a sidebar allowing you to choose a cluster. Click on Custom RPC URL. This should auto-fill will http://localhost:8899. If not, fill it in to have the explorer point to your machine at port 8899:

This is invaluable for several reasons:
It allows developers to inspect transactions on your local ledger in real-time, mirroring the capabilities they would normally have with a block explorer that analyzed devnet or mainnet
It is easier to visualize the state of accounts, tokens, and programs as if they were operating on a live cluster
It provides detailed information regarding errors and transaction failures
It provides a consistent development experience across clusters as it is a familiar interface
Deploying to Devnet
Albeit advocating for Localhost development, developers can also deploy to devnet if they wish to test against that cluster specifically. The process is generally the same, except that there is no need to run a local ledger (we have a fully-fledged Solana cluster that we can interact with!).
Run the command solana config set --url devnet to change the selected cluster to devnet. Any solana command run in the terminal will now be executed on devnet. Then, in the Anchor.toml file, duplicate the [programs.localnet] section and rename it to [programs.devnet]. Also, change [provider] so it now points to devnet:

...
[programs.localnet]
hello-world = "EJTW6qsbfya86xeLRQpKLM8qhn11cJXmU35QbJwE11R8"

[programs.devnet]
hello-world = "EJTW6qsbfya86xeLRQpKLM8qhn11cJXmU35QbJwE11R8"
...
[provider]
cluster = "Devnet"
wallet = '~config/solana/id.json'


Developers must ensure they have devnet SOL to deploy the program. Use the solana airdrop <amount> command to airdrop to the default keypair location at ~/.config/solana/id.json. A wallet address can also be specified using solana aidrop <amount> <wallet address>. Alternatively, visit this faucet for devnet SOL. I recommend checking out the following guide on how to get devnet SOL.
Note that you may encounter the following error:

Error: unable to confirm transaction. This can happen in situations such as transaction expiration and insufficient fee-payer funds


This is often due to the devnet faucet being drained and/or requesting too much SOL at once. The current limit is 5 SOL, which is more than enough to deploy this program. It is therefore recommended to request 5 SOL from the faucet or execute the command solana airdrop 5. Requesting smaller amounts incrementally can potentially lead to rate-limiting.
Now, build and deploy the program using the following commands:

```shel
anchor build
anchor deploy
```

Congratulations! You’ve just deployed your first Solana program to devnet locally!
Building and Deploying on Solana Playground
On Solana Playground, navigate to the Tools icon on the left sidebar. Click Build. In the console, you should see the following:

Building...
Build successful. Completed in 2.20s..


Notice how the ID in the declare_id! macro was overwritten. This new address is where we’ll be deploying the program. Now, click Deploy. You should have something similar to this in your console:

```shell
Deploying... This could take a while depending on the program size and network conditions.
Warning: 41 transactions not confirmed, retrying...
Deployment successful. Completed in 17s.
```

Congratulations! You’ve just deployed your first Solana program to devnet via Solana Playground!

## Create a Solana Wallet
Wallets manage your keys and Solana (SOL) tokens. You have two main options:
CLI Wallet: Use the Solana command-line tools to create one.
Web-based Wallet: Popular choices include Phantom and Solflare.
Security: Always prioritize the safekeeping of your wallet’s recovery phrase.
Additional Notes:
Solana development is a rapidly evolving field. Be sure to check official documentation for the latest tools and best practices.
Consider exploring resources like the Solana Cookbook (https://solanacookbook.com/) for guides and examples.
You now have the essentials to start building on Solana! Let me know if you want guidance on specific development tasks or have more questions.
Connecting to wallets
We now know a bunch about interacting with the network via code. To make transactions, we used private keys. That won’t work with users lol. To let people buy jpegs for real money from us, we need to work with wallets.
“Wallet” is kind of a weird name, since they do a lot more than just hold stuff. A wallet is anything that stores a secret key securely and lets the user sign transactions. They come in many forms, most commonly browser extensions, and they give you (the developer) APIs to suggest transactions to the user. Wallets make it possible for you to safely do this:
We’ll be using the Phantom browser extension as it’s the most popular, you can use another if you want :)
Let’s connect our web app with a wallet and make it give the user a trade offer!

## Front-end Integration
Congrats on making it this far! You’ve already deployed your Solana program, and now we’ll build a frontend application that will interact with the program to allow you write and update a message you’ll store on the Solana blockchain! By the end of this tutorial, you’ll know how to connect your web3 app to a user’s Phantom Wallet and use your previously deployed Solana program to store a message that anyone can change. And we’re going to get through it together!
Like before, you can find the finished product here on Github
### 1. Setup Your Application
Creating the Application
In the Hello World Solana Program tutorial, we setup our Anchor project named solana-hello-world. From the terminal make you’re in that project directory. In that project, you’ll find an empty app folder. We will overwrite that empty app folder with a Next.js Typescript starter code template that will be the base for our web3 application!
```shell
yarn create next-app --typescript app
```

Now, the app folder will have a few different subfolders and files, which you can view with your favorite code editor like VSCode. The most important ones for us are:
A pages folder that contains the actually application code we are going to write.
The pages/api folder is where our code that will connect to our Solana program will live.
The _app.tsx and index.tsx is where our frontend code will live.
A stylesfolder that contains the CSS files for our application. We’ll edit the Home.module.css once and then you don’t have to worry about it!
Next, let’s get into the app folder and install the dependencies we'll need for Anchor, Solana, and Phantom:
```shell
cd app
yarn add @coral-xyz/anchor @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-react-ui @solana/wallet-adapter-wallets @solana/wallet-adapter-base
```


This git commit is a checkpoint for you to make sure you’ve successfully created your application! By now, you should have been able to create your Next.js project add the relevant dependency libraries we’ll use later. If so, let’s keep going!
Setting Up Your Initial Frontend
Using your favorite code editor (like VSCode), look at your app/pages/index.tsx. It has a lot of boilerplate that we don’t need, so delete all the code and add this to start:
```typescript
import styles from "../styles/Home.module.css";


export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1 className={styles.title}>
          Your First Solana Program with{" "}
          <a href="https://www.startonsolana.com/">SOLANA</a>!
        </h1>
      </div>
    </div>
  );
}
```

All this is doing is rendering a giant title for your application! Next, look at your app/styles/Home.module.css file. Same thing - there’s a lot of boiler plate here. Delete the code and add this:
```
.container {
  padding: 2rem;
}


.navbar {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}


.main {
  min-height: 80vh;
  padding: 64px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}


.title {
  margin: 0;
  line-height: 1.15;
  font-size: 64px;
  text-align: center;
}


.title a {
  color: #0070f3;
}


.title a:hover,
.title a:focus,
.title a:active {
  text-decoration: underline;
  border-color: #0070f3;
}


.message_bar {
  display: flex;
  justify-content: center;
}


.message_input {
  border: none;
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  padding: 0 24px;
  border-radius: 4px;
  margin: 16px;
  text-align: center;
}


.message_button {
  background-color: #0070f3;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  height: 48px;
  padding: 0 24px;
  border-radius: 4px;
  margin: 16px;
  text-align: center;
}


.card {
  margin: 16px;
  padding: 24px;
  text-align: left;
  color: inherit;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  transition: color 0.15s ease, border-color 0.15s ease;
  max-width: 600px;
}


.card h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
}


@media (prefers-color-scheme: dark) {
  .card {
    border-color: #222;
  }
}


.loader_bar {
  display: flex;
  justify-content: center;
  align-items: center;
}


.loader {
  border: 16px solid #f3f3f3;
  border-top: 16px solid #0070f3;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 2s linear infinite;
  margin: 16px;
}


@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

Don’t worry too much about CSS! All this is doing is making our application look pretty. We don’t need CSS to use our Solana program and create our web3 application. It just looks nicer 😅. If you’re still curious, you can learn more about it here.
Awesome! We’re ready to look at our app! You can view your application on [http://localhost:3000/](http://localhost:3000/) by running the following from your app directory on your terminal:
```shell
yarn dev
```

You should see something like this:

Amazing 🤩! You have a working web3 application. We haven’t added anything blockchain specific yet, but we’re about to! Make sure your code lines up with this git commit checkpoint. Alright, now CTRL+C from your terminal to stop your app from running for now. We have some changes to make.
Add the Solana Program IDL
To eventually connect to our Solana program, we’re going to need to add the IDL files that were generated when we ran anchor build in the last tutorial. Since you’re still in your app folder on your terminal, use this command to add the IDL and types files to our web3 application code to use later:
```shell
cp -r ../target/idl ./pages/api/idl
cp -r ../target/types ./pages/api/types
```

One more git commit checkpoint here to make sure you’re good to go! You should make sure your web3 application looks as amazing as the screenshot above! Your code should match this exactly - if not, copy and paste from it to make sure you’re up-to-date. Things are about to get interesting 😏
### 2. Connect Your Phantom Wallet
Forgot to get Phantom wallet?
You should have Phantom wallet from the previous tutorials! If you didn’t make them, you can follow this setup tutorial to download Phantom.
```text
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com."
```

📘
Why are we making a special file for our SOLANA RPC URL?
Eventually, you’re going to want to push your code to a Github repository, you don’t want to hardcode private information like your SOLANA RPC URL in your application. Otherwise, someone can find it and then spam your connection if they’re not very nice. So instead, we use .env.local to hide your SOLANA RPC URL and its API KEY(if you use on mainnet-beta). And thanks to your app/.gitignore file, this specific file .emv.local won’t ever be pushed to Github. Problem solved!
Here’s a quick git commit checkpoint for you to confirm you did this right! To clarify, I added a .env.local.example file, but locally you should have a.env.local file (it won’t be tracked by Github). You should also have added your API Key.
Adding Constants and Helper Functions
Now that we set up our Solana RPC URL, we need to add some other variables that the rest of our application will use on top of this private environment variable. With app as our home directory,, under the api folder, let’s make a new folder called utils and then create a file called constants.ts to add the following:
```typescript
import idl from "../idl/solana_hello_world.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";


/* Constants for RPC Connection the Solana Blockchain */
export const commitmentLevel = "processed";
export const endpoint =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("devnet");
export const connection = new Connection(endpoint, commitmentLevel);


/* Constants for the Deployed "Hello World" Program */
export const helloWorldprogramId = new PublicKey(idl.metadata.address);
export const helloWorldprogramInterface = JSON.parse(JSON.stringify(idl));
```

#### Walking through this line-by-line:
First, we imported the IDL and then some relevant classes from the Solana web3 library.
We then create some constants to denote the commitmentLevel we’ll look for in our connection to the Solana blockchain through our Solana RPC URL endpoint.
Lastly, we’ll add constants from the IDL we imported earlier to have easy access to our helloWorldprogramId and helloWorldprogramInterface. We’ll keep them in the same file, and they’ll be useful when we make calls to our Solana program in the next step.
📘
### What is a commitment level?
The commitment describes how finalized a block containing transactions is at that point in time. You may know that blockchains are just a chain of bundles of transactions, called blocks. Before being appended to the chain to be read by applications, blocks that require confirmation from nodes in the network, which takes time. The commitment level determines how many nodes in the network need to confirm the block before it’s ready to be read through a client for a web3 application. The more nodes that confirmed, the more likely the block was truly appended to the blockchain.
Essentially, it’s a tradeoff how fast vs. safe you want your application to be when it comes to reading transactions from Solana, where processed is fastest and finalized is most safe. Typically, people go in the middle with confirmed, but for this application we can use processed.You can read more here about this!
While we’re in app/pages/api/utils, let’s add one more file called useIsMounted.ts and this content:
```typescript
import { useEffect, useState } from "react";


export default function useIsMounted() {
  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);


  return mounted;
}
```

Without this, you’re going to run into a Hydration Error when integrating your Phantom wallet. This isn’t too important - the main takeaway we need to access the window.solana object, which won’t be accessible to our application until after our component mounts. Through the React useEffect hook, we’re able to bypass this! (You can watch this video for a similar explanation with a different wallet library if you’re curious!).
Okay! Make sure your app constants and helper function are looking good - we'll have a git commit checkpoint after we add our Phantom wallet code now😁!

### Integrating Your Phantom Wallet
First thing we have to do is go to our Phantom Wallet and adjust the network cluster to Devnet for it to work with our application. Click on the “Settings” button in the top left, then go to “Developer Settings.” Then click on “Change Network” to adjust the network to “Devnet.” Check out my screen recording GIF below:

Now, let’s add some providers to our app/pages/_app.ts file to help support integrating a Phantom Wallet. Delete the boilerplate code in there and then add this:
```typescript
import type { AppProps } from "next/app";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { endpoint } from "./api/utils/constants";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";


function MyApp({ Component, pageProps }: AppProps) {
  const phantomWallet = new PhantomWalletAdapter();


  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[phantomWallet]}>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}


export default MyApp;
```

Let’s walk through each section:
The first few lines are just importing the relevant libraries we installed in Step 1 to help with support different kinds of Solana wallets in our application.
The MyApp function is the top-level component that will render our application. We instantiated a variable phantomWallet to represent a way to connect to a user’s Phantom wallet in our app. We then render our application’s components.
A React Provider is just a wrapper around our application code, providing the context of what RPC URL endpoint we are using (Devnet) and what wallets we want to show (Phantom). to our app from the Solana wallet libraries we installed. There’s a lot of detail that these libraries abstract away from us to be able to integrate a wallet seamlessly! Pretty cool 😄!
Cool! Now let’s add the Phantom Wallet to app/pages/index.tsx by editing it as so:
```typescript
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useIsMounted from "./api/utils/useIsMounted";
import styles from "../styles/Home.module.css";


export default function Home() {
  const mounted = useIsMounted();


  return (
    <div className={styles.container}>
      <div className={styles.navbar}>{mounted && <WalletMultiButton />}</div>


      <div className={styles.main}>
        <h1 className={styles.title}>
          Your First Solana Program with{" "}
          <a href="https://www.startonsolana.com/">Solana</a>!
        </h1>
      </div>
    </div>
  );
}
```

Some small changes from last time we touched this file:
We imported some libraries to help with our wallet button.
We added the mounted function to make sure our wallet button renders only until after the component has mounted, as described earlier.
We added our wallet button to appear at the top right of our app using the WalletMultiButton component!


Nice 🥳! We’ve successfully connected a Phantom wallet to your application! Now, you can write code that sends transactions on behalf of the user (with their approval) to write data to the Solana blockchain. Here’s a git commit checkpoint. Let’s keep going!
### 3. Connect the App to Your Solana Program
Now we made it to the cool part - connecting to the Solana program we deployed 😤! Really quickly, airdrop some SOL to your Wallet since we’re going to need it soon.
```shell
solana airdrop 3
```

Making a Create Message API
Let’s go over what we want our app to do:
When a user successfully connects their wallet, we want to show an input form for a user to write a message.
Then, a user should press a button to write that message to the Solana blockchain.
Once it’s written, we should display on our application the details of the message, including its content, author (the user), and the time it was published.
We can actually do all of this by making calls to our Solana program. In our app/pages/api folder let’s rename hello.ts to createMessage.ts and then remove all the code and replace it with this:
```typescript
import { Program, AnchorProvider, web3 } from "@project-serum/anchor";
import { SolanaHelloWorld } from "./types/solana_hello_world";
import {
  connection,
  commitmentLevel,
  helloWorldprogramId,
  helloWorldprogramInterface,
} from "./utils/constants";
import { AnchorWallet } from "@solana/wallet-adapter-react";


export default async function createMessage(
  inputtedMessage: string,
  wallet: AnchorWallet,
  messageAccount: web3.Keypair
) {
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: commitmentLevel,
  });


  if (!provider) return;


  /* create the program interface combining the idl, program Id, and provider */
  const program = new Program(
    helloWorldprogramInterface,
    helloWorldprogramId,
    provider
  ) as Program<SolanaHelloWorld>;


  try {
    /* interact with the program via rpc */
    const txn = await program.rpc.createMessage(inputtedMessage, {
      accounts: {
        message: messageAccount.publicKey,
        author: provider.wallet.publicKey,
        systemProgram: web3.SystemProgram.programId,
      },
      signers: [messageAccount],
    });


    const message = await program.account.message.fetch(
      messageAccount.publicKey
    );
    console.log("messageAccount Data: ", message);
    return message;
  } catch (err) {
    console.log("Transaction error: ", err);
    return;
  }
}
```

You’ll notice the code is actually very similar to what we wrote in our tests in the last tutorial! Let’s walk through it briefly:
After importing relevant libraries and constants, our function will take in the inputtedMessage from the user, the user’s wallet, and the account that our Program will initialize to save the message in.
We create a provider object, which if you remember from last tutorial, is our connection to Solana through 1) an RPC provider and 2) a Solana wallet address. Connection + Wallet = Provider! We also specify the same commitment level as before.
Lastly, we make a call to our Solana program to create the Message. Like in our tests in the last tutorial, we include the relevant accounts and signatures needed, along with the inputtedMessage to make the call. We then fetch and return that message to use in our frontend!
Let’s incorporate this new API endpoint in our frontend code now! The full app/pages/index.tsx file should look like this now:
```typescript
import { useState } from "react";
import { Keypair } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import useIsMounted from "./api/utils/useIsMounted";
import createMessage from "./api/createMessage";
import styles from "../styles/Home.module.css";


export default function Home() {
  const [messageAccount, _] = useState(Keypair.generate());
  const [message, setMessage] = useState("");
  const [messageAuthor, setMessageAuthor] = useState("");
  const [messageTime, setMessageTime] = useState(0);
  const [inputtedMessage, setInputtedMessage] = useState("");


  const wallet = useAnchorWallet();
  const mounted = useIsMounted();


  return (
    <div className={styles.container}>
      <div className={styles.navbar}>{mounted && <WalletMultiButton />}</div>


      <div className={styles.main}>
        <h1 className={styles.title}>
          Your First Solana Program with{" "}
          <a href="https://www.startonsolana.com">Solana</a>!
        </h1>


        {wallet && (
          <div className={styles.message_bar}>
            <input
              className={styles.message_input}
              placeholder="Write Your Message!"
              onChange={(e) => setInputtedMessage(e.target.value)}
              value={inputtedMessage}
            />
            <button
              className={styles.message_button}
              disabled={!inputtedMessage}
              onClick={async () => {
                const message = await createMessage(
                  inputtedMessage,
                  wallet,
                  messageAccount
                );
                if (message) {
                  setMessage(message.content.toString());
                  setMessageAuthor(message.author.toString());
                  setMessageTime(message.timestamp.toNumber() * 1000);
                  setInputtedMessage("");
                }
              }}
            >
              Create a Message!
            </button>
          </div>
        )}


        {wallet && message && (
          <div className={styles.card}>
            <h2>Current Message: {message}</h2>
            <h2>
              Message Author: {messageAuthor.substring(0, 4)}
              ...
              {messageAuthor.slice(-4)}
            </h2>
            <h2>Time Published: {new Date(messageTime).toLocaleString()}</h2>
          </div>
        )}
      </div>
    </div>
  );
}
```

We added a few things - let’s review:
We imported more relevant libraries and our newly created createMessage function
We included a few state variables that will be used.
messageAccount is the generated public-private keypair that will represent storage on the Solana blockchain for our message. We initialized it with Keypair.generate()
message, messageAuthor, messageTime will store the three corresponding components of a message - it’s content, author, and timestamp. We’ll use this to render a
inputtedMessage will track what the user inputs as a message in the newly created inputted field below until they submit it. When a message is written, we will clear this variable out.
We then added an input field and button to our page so our user can input and submit a message if their wallet is connected.
Lastly, if there is a message that was submitted and the user’s wallet is still connected, we’ll render the message’s content, author, and date published.
Now your app should look like this:

Look how far you’ve come 👨‍🎓! You’ve made an app that can connect a user’s wallet and submit to the blockchain a message they write, AND you’re able to show it on your application. So impressive. We’re 99% there - here’s a git commit checkpoint to make sure your code is all there.
Congrats! You now have the entire web3 app! Users can now write a message to the Solana blockchain, and later edit that same message! Here’s a git commit checkpoint to make sure your app is fully function.
### 4. You’re Done!
Hooray 🎉! You made it to the end of the tutorial! To recap, you learned how to:
Connect a Phantom wallet to your web3 app
Read data from your Solana program using the Solana Web3 API
Send Solana transactions for a user through their Phantom Wallet
