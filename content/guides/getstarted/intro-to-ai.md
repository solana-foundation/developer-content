---
date: 2025-01-22T00:00:00Z
difficulty: beginner
title: "How to get started with AI tools on Solana"
description:
  "This guide gives an overview of the AI tools available for Solana and how to
  get started with them."
tags:
  - rust
  - ai
keywords:
  - tutorial
  - ai
  - AI agents
  - eliza
  - solana ai
  - langchain
---

# Introduction to AI Tools on Solana

Before diving into specific tools, let's understand the key components in the AI
development stack:

## Understanding the AI Stack

1. **Large Language Models (LLMs)**

   - The foundational AI models (like GPT-4, Claude, or Llama)
   - Process and generate natural language
   - Provide raw intelligence and reasoning capabilities
   - Examples: OpenAI's GPT-4, Anthropic's Claude, Meta's Llama

2. **Agent Frameworks (like Eliza)**

   - Built on top of LLMs to create autonomous agents
   - Manage agent personalities and behaviors
   - Handle memory and context
   - Provide multi-platform integration
   - Examples: Eliza, LangChain, AutoGPT, Vercel AI

3. **Domain-Specific Agent Kits (like Solana Agent Kit)**
   - Built for specific use cases (e.g., blockchain operations)
   - Provide pre-built tools and integrations
   - Abstract away technical complexity
   - Ready-to-use blockchain functions
   - Examples: Solana Agent Kit, GOAT Toolkit

Think of it like this:

- LLMs are the "brain" that can understand and generate language
- Agent frameworks are the "operating system" that manages the AI's behavior
- Domain-specific kits are the "apps" that give the AI specific capabilities

# Building AI Agents for Solana

This guide will show you how to:

- Build a basic AI agent using SendAI's Solana Agent Kit
- Create a Twitter bot with Eliza Framework
- Understand on-chain AI integration options
- Options on how to build advanced trading bots

## Introduction to AI Agents on Solana

AI agents on Solana are autonomous programs that can interact with the
blockchain using natural language processing and machine learning. They can:

- Execute transactions
- Monitor blockchain activity
- Interact with smart contracts
- Provide user assistance
- Automate complex workflows

## Available Frameworks

Several frameworks are available for building AI agents on Solana:

1. **SendAI's Solana Agent Kit**

- A collection of tools for building agents on Solana
- Compatible with Eliza, Langchain, and Vercel AI SDK
- Built-in Solana tools and utilities
- Natural language processing capabilities
- [Solana Agent Kit](https://github.com/sendaifun/solana-agent-kit)
- [Documentation](https://docs.solanaagentkit.xyz/)

2. **Eliza Framework**

- Combines datalayer, llm and agents and has a dedicated Solana plugin
- Extensible agent architecture
- Easy integration with existing projects and can be used for example for
  Twitter (X), telegram or discord bots
- [GitHub Repository](https://github.com/elizaOS/eliza)

3. **GOAT Toolkit**

- Comprehensive development toolkit
- Cross-chain compatibility
- [GitHub Repository](https://github.com/goat-sdk/goat)

4. **Rig Framework**

- Native Rust implementation
- Good for high performance trading bots
- Can be combined with the Listen.rs toolkit for Solana integration transaction
  monitoring and sending transactions using Jito bundles for example
- [GitHub Repository](https://github.com/0xPlaygrounds/rig)
- [Listen.rs Repository](https://github.com/piotrostr/listen)

If you are building an AI framework feel free to open a PR to add your framework
to the list

## Getting Started with SendAI

Let's start by setting up a basic AI agent using SendAI's Solana Agent Kit that
can perform actions on the Solana blockchain and that we can chat with:

<Steps>

### Install dependencies

A modern IDE is recommended for this guide. We will use
[Cursor](https://www.cursor.com/) for this example which has integrated AI
features and can help you with any errors you may encounter. which has
integrated AI features and can help you with any errors you may encounter.

You will need to have [node](https://nodejs.org/en/download/) with version
`23.x.x` installed. Open an empty folder using vscode or cursor and run the
following command in the terminal:

<Callout type="warning">
  This guide requires Node.js version `23.x.x` 
</Callout>

```bash
pnpm install solana-agent-kit
pnpm add @langchain/core @langchain/openai @langchain/langgraph dotenv bs58
```

Your IDE should setup the `package.json` file for you. If not, this is how it
should look like:

```json filename=package.json
{
  "dependencies": {
    "@langchain/core": "^0.3.33",
    "@langchain/langgraph": "^0.2.41",
    "@langchain/openai": "^0.3.17",
    "bs58": "^6.0.0",
    "dotenv": "^16.4.7",
    "solana-agent-kit": "^1.4.3"
  }
}
```

### Configure environment

Create a `.env` file in the root of the project and add the following:

```env
OPENAI_API_KEY=your_openai_api_key
RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_private_key
```

Note that we encode the private key to base58 before we parse it into the solana
agent constructor in the script so you can just put the byte array [34,2,34...]
here in the env file.

You can create a key using the following command:

```bash
solana-keygen grind --starts-with ai:1
```

And copy the contents into your `.env` file for `SOLANA_PRIVATE_KEY`.

The OPENAI_API_KEY is the key for the OpenAI API and you can find it in the
[OpenAI platform](https://platform.openai.com/api-keys)

The RPC url we just leave at devnet for now.

### Create the agent script

Create a new file called `agent.ts` with the following content:

```typescript filename=agent.ts
import { SolanaAgentKit, createSolanaTools } from "solana-agent-kit";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import * as dotenv from "dotenv";
import bs58 from "bs58";
import * as readline from "readline";

dotenv.config();

async function initializeAgent() {
  const llm = new ChatOpenAI({
    modelName: "gpt-4-turbo-preview",
    temperature: 0.7,
  });

  // Convert array string to actual array, then to Uint8Array, then to base58
  const privateKeyArray = JSON.parse(process.env.SOLANA_PRIVATE_KEY!);
  const privateKeyUint8 = new Uint8Array(privateKeyArray);
  const privateKeyBase58 = bs58.encode(privateKeyUint8);

  const solanaKit = new SolanaAgentKit(privateKeyBase58, process.env.RPC_URL!, {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  });

  const tools = createSolanaTools(solanaKit);
  const memory = new MemorySaver();

  return createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
  });
}

async function runInteractiveChat() {
  const agent = await initializeAgent();
  const config = { configurable: { thread_id: "Solana Agent Kit!" } };
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Clear console and start chat with a small delay
  setTimeout(() => {
    console.clear(); // Clear any initialization messages
    console.log("Chat with Solana Agent (type 'exit' to quit)");
    console.log("--------------------------------------------");
    askQuestion();
  }, 100);

  const askQuestion = () => {
    rl.question("You: ", async input => {
      if (input.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      const stream = await agent.stream(
        {
          messages: [new HumanMessage(input)],
        },
        config,
      );

      process.stdout.write("Agent: ");
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          process.stdout.write(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          process.stdout.write(chunk.tools.messages[0].content);
        }
      }
      console.log("\n--------------------------------------------");

      askQuestion(); // Continue the conversation
    });
  };
}

runInteractiveChat().catch(console.error);
```

### Run the agent

You can run this script using the following command:

```bash
npx tsx agent.ts
```

This will start a simple chat with the agent.

### Test basic functionality

You can now ask it to show you your solana balance and ask it to request some
devnet sol:

```bash
Please show me my wallet address and request some devnet sol
```

If the devnet faucet is empty you can use the
[web faucet](https://faucet.solana.com) instead and paste in your solana
address.

### Create an NFT collection

Next ask the agent:

```bash
Please create me a NFT collection called trains with symbol TRN using this uri: https://scarlet-fancy-minnow-617.mypinata.cloud/ipfs/bafkreif43sp62yuy3sznrvqesk23tfnhpdck4npqowdwrhrzhsrgf5ao2e
```

### Mint an NFT

After the collection is created, mint an NFT:

```bash
Please mint me an NFT into that collection using the name: Train1 and using this URI: https://scarlet-fancy-minnow-617.mypinata.cloud/ipfs/bafkreif43sp62yuy3sznrvqesk23tfnhpdck4npqowdwrhrzhsrgf5ao2e
```

This will mint you an NFT with the name Train1 and an image of a train.

You can also use any different metadata for your NFT which you can upload using
[pinata](https://app.pinata.cloud/) or any other storage provider. You should
end up with something like this
[devnet train nft](https://explorer.solana.com/address/6dTVGn2M8LdAB6vrxzt7X8fm8HiP1QxN9j8jeh1dbyv8?cluster=devnet)

</Steps>

Where to go from here?

- You can now for example import the private key into your browser extension
  wallet to see the NFT.
- You can ask the agent to show you all your NFTs. You will notice you will get
  an error for this action. This is because the default action to request assets
  uses the Helius Asset api to request assets so for that you would need to add
  a [Helius API key](https://www.helius.dev/) to your `.env` file and pass it
  into the agent. pass it into the agent.

```ts filename=agent.ts
const solanaKit = new SolanaAgentKit(privateKeyBase58, process.env.RPC_URL!, {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
  HELIUS_API_KEY: process.env.HELIUS_API_KEY!,
});
```

- You can now start writing your own actions following the
  [Contribution guide](https://github.com/sendaifun/solana-agent-kit/blob/main/CONTRIBUTING.md)

There is also an
[example of a web chat](https://github.com/sendaifun/solana-agent-kit/tree/main/examples/agent-kit-nextjs-langchain)
for your agent using React that you can for example deploy to Vercel.

Not all actions are working 100% yet, like the request balance for example
sometimes fails, but you can see the progress in the
[Solana agent kit repo](https://github.com/sendaifun/solana-agent-kit) and also
contribute your own actions to be used by everyone.

## Building with Eliza Framework

The [ElizaOS](https://github.com/elizaOS/eliza) (formerly known as Ai16z) is an
AI framework. That means it combines multiple applications into one and
organizes their interactions. It combines:

1. Different LLMs to understand the user
2. Blockchain agents with different actions (like minting an NFT for example)
3. Datalayers to store the characters state between actions using for example
   Redis, PostgreSQL DB or local storage
4. Different clients like X, telegram, discord. etc.

Its takes all these things and puts them together in a way that you can create a
"Character" that can interact with users or autonomously. These Characters are
defined in a JSON file, which defines which actions it can perform, which LLM it
should use and different prompts that define the behaviour of the character.

### Building a Twitter (X) bot that can mint NFTs on request

What we will build now is a helpful solana developer assistant that can help
developers on the platform X to get started with solana and it will also be able
to mint NFTs to the users on demand.

<Steps>

### Clone the repository

First clone the Eliza repository:

```bash
git clone https://github.com/elizaOS/eliza.git
```

### Set up the environment

<Callout type="warning">
  This guide requires Node.js version `23.x.x`. Install it using [nvm](https://github.com/nvm-sh/nvm):
  ```bash
  node --version  # Check current version
  nvm install 23  # Install Node.js 23 if needed
  nvm use 23      # Switch to Node.js 23
  ```
</Callout>

Then install the dependencies:

```bash
pnpm install --no-frozen-lockfile
pnpm build
```

### Configure environment variables

Create your environment file:

```bash
cp .env.example .env
```

What we are interested in for this guide is:

```env
TWITTER_USERNAME=               # Account username
TWITTER_PASSWORD=               # Account password
TWITTER_EMAIL=
OPENAI_API_KEY=                 # Get this from: https://platform.openai.com/api-keys
SOLANA_RPC_URL=https://api.devnet.solana.com # Lets work on devnet for now
SOLANA_PRIVATE_KEY=             # Get this from: https://solana.com/wallet
SOLANA_PUBLIC_KEY=
SOLANA_CLUSTER=devnet # Default: devnet. Solana Cluster: 'devnet' | 'testnet' | 'mainnet-beta'
SOLANA_ADMIN_PRIVATE_KEY=       # This wallet is used to verify NFTs (you can use the same as the SOLANA_PRIVATE_KEY for now)
SOLANA_ADMIN_PUBLIC_KEY=        # This wallet is used to verify NFTs (you can use the same as the SOLANA_PUBLIC_KEY for now)
```

Make sure you have some
[devnet sol](https://solana.com/de/developers/guides/getstarted/solana-token-airdrop-and-faucets)
in your wallet before you start the agent.

### Encode private key (if needed)

If you have your private key in hex format you can base58 encode your private
key using the following js snippet:

```ts filename=encode58.ts
const bs58 = require('bs58');
console.log(bs58.encode(new Uint8Array([213,29,143,...])));
```

And run it using

```bash
npx tsx encode58.ts
```

### Create character configuration

To create a new character we need to create a character.json file. You can find
the preset characters in the characters folder of the Eliza project. To create a
new character you can copy and change one of the already existing characters or
you can use the
[composer feature in Cursor](https://docs.cursor.com/composer/overview) and tell
it what kind of character you want to create. Give it one of the other
characters as input and describe what kind of character you want to create.

```json filename=characters/sol.character.json
{
    "name": "Sol",
    "clients": ["twitter"],
    "modelProvider": "openai",
    "settings": {
        "voice": {
            "model": "en_US-neural"
        },
        ...
```

The important part here are the clients and the modelProvider. In our case we
want to use twitter as a client and openai as the model provider because this is
what we also set our secrets for in the `.env` file.

### Run the agent

Now that the configuration is done we can run our character:

```bash
pnpm start --character="characters/sol.character.json"
```

This will start the agent and you can now interact with it on twitter. The
character will automatically start posting tweets every few hours and when we
interact with him it will be able to perform solana actions like minting NFTs
for example.

Here you can see the
[character in action](https://x.com/solanadevhelper/status/1882222232656847143).

You can also interact with the character locally using the following command:
You may need to free your port 3000 and start your character with the `--host`
flag.

```bash
pnpm start --character="characters/sol.character.json" --host
pnpm start:client
```

If your client does not connect make sure you run your agent with the `--host`
flag and that your port 3000 is not in use when you start the client.

For more information follow the
[official eliza documentation](https://elizaos.github.io/eliza/docs/quickstart/)

</Steps>

Disclaimer: The Solana integration and actions are not perfect yet but they are
in constant development and are moving fast. There will be a direct integration
of the SendAI agent kit into Eliza soon.

## Using GOAT Toolkit

[GOAT](https://github.com/goat-sdk/goat) is similar to Solana Agent Kit a
collection of many different blockchain tools that also supports different
Solana actions and other chains. It can also be integrated into the Eliza
framework for example and supports many different wallets, frameworks and block
chains.

## On chain program agent integration

If you want to use an agents reply within a solana program you need to use an
oracle that writes the reply data into an account that your program can read.
You can find an example of an LLM which will transfer tokens to any user that
answers questions correctly here:

[On chain program LLM interaction](https://github.com/GabrielePicco/super-smart-contracts)

This is an example of an on-chain program that integrates with an LLM (AI)
oracle to create an interactive token-dispensing agent named "Mar1o".

## Key Features

1. **AI Agent Interaction**

   - Users can chat with Mar1o to try to earn tokens
   - Agent evaluates user's Solana knowledge to decide token amounts
   - Responses are in JSON format with reply text and token amount

2. **Token Management**
   - Creates MAR1O tokens with metadata
   - Can mint between 0-10,000 tokens based on AI response
   - Uses PDAs for token management

## Example Usage

Here is how this program works in pseudo code:

// Initialize the AI agent with personality

```rust
const AGENT_DESC: &str = "You are an
AI agent called Mar1o which can dispense MAR1O tokens..."`;
```

// User interaction flow:

1. User sends message to agent
2. Oracle processes with LLM
3. Agent responds with JSON: {"reply": "...", "amount": 1000}
4. If amount > 0, tokens are minted to user

This demonstrates how to combine AI capabilities with on-chain token mechanics
to create interactive blockchain experiences. Here is a
[live example](https://mar1o.xyz/) where you can try to convince the Agent to
transfer you some tokens.

## Advanced Rust agents for algorithmic trading

If you want to write your agents in Rust you can use the
[Rig framework](https://github.com/0xPlaygrounds/rig) and the
[Listen.rs](https://github.com/piotrostr/listen) library.

These two work nicely together. While the Rig framework gives you an easy way to
connect to LLMs the Listen.rs toolkit provides you the Solana integration
including Transaction monitoring and sending transactions using Jito bundles for
example.

## Best Practices

- Know that your agent has a private key and thus can access the funds in your
  wallet. If someone can chat with your agent and it has a transfer action for
  example users can probably get it to transfer them your funds.
- Use a payed [RPC endpoints](https://solana.com/rpc). The public endpoints
  usually get rate limited
- Monitor agent activities and make sure they are not doing anything malicious
  or get tricked into it by users interacting with them
- Implement priority fees and transaction retries to your agent actions so that
  they also land when there is congestion on the network
- If possible test on devnet first before you deploy to mainnet. Most agents
  just take the RPC url as an input and you can use a devnet one until your are
  ready for mainnet. Not all actions maybe possible to do on devnet though.
- When writing your own actions add integration tests for them so that the
  frameworks can monitor which actions are failing due to changed programs or
  APIs

## Conclusion

AI agents on Solana open up new possibilities for automation and interaction
with the blockchain. While not all integrations are perfect yet they are
developed fast and offer lots of opportunity for contributions and are very
flexible of adding your own integrations.
