---
date: Feb 29, 2024
difficulty: intermediate
title: "Build a complete crowdfunding DApp on Solana with Anchor and React"
description:
  "Learn how to build a complete crowdfunding DApp on Solana using Anchor and
  React. This tutorial will guide you through the process of creating a smart
  contract, deploying it to the Solana devnet, and building a front-end
  application to interact with it."
tags:
  - cli
  - web3js
  - solana playground
  - rust
  - anchor
keywords:
  - tutorial
  - smart contracts
  - anchor
  - rust
  - react js
  - solana
  - vite
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
altRoutes:
  - /developers/guides/build-a-complete-crowdfund-dapp
---

## Build a complete crowdfunding DApp on Solana with Anchor and React.

<h1 align="center">
    <br>
    <a href="https://github.com/Samuellyworld/anchor-crowdfund">
        <img src="https://i.postimg.cc/1zSZBmp4/png-transparent-sarawak-crowdfunding-kickstarter-advertising-campaign-others-text-logo-grass-removeb.png" alt="crowdfund" width="130" height="130" />
    </a>
    <br>
</h1>

Learn how to build a complete crowdfunding DApp on Solana using Anchor and
React. This tutorial will guide you through the process of creating a smart
contract, deploying it to the Solana devnet, and building a front-end
application to interact with it.

What you will learn:

- How to create a smart contract using Anchor
- How to deploy a smart contract to the Solana devnet
- How to build a front-end application using React to interact with the smart
  contract

### Introduction on the smart contract.

<p align="center">
  <br>
      <img src="https://i.postimg.cc/jSbsg4Ts/Untitled-drawio-1.png" alt="system design"/>
  <br>
</p>

The smart contracts are designed to facilitate crowdfunding campaigns on the
Solana blockchain. Users can create campaigns, donate to existing campaigns,
withdraw funds from campaigns, and retrieve campaign information.

### Prerequisites

- Basic knowledge of Rust
- Basic knowledge of React
- Basic knowledge of Solana

### Set up your environment

- Install Rust.
- Install Solana CLI.
- Install Anchor CLI.
- Set up a new project.

You can follow the
[local development quickstart guide](https://www.anchor-lang.com/docs/installation)
to quickly set an anchor project up.

Start by creating a new anchor project using the following command:

```bash
anchor init crowdfund
```

Locate the smart contract file in the project directory and open it in your code
editor.

```sh
├── programs/crowdfund/
├                   ├── src/
├                        ├── lib.rs  (contains smart contracts code)
├── tests/
     ├── crowdfund.test.ts (contains test cases for the smart contract)

```

### Define the smart contract

Define the smart contract using the following code:

```rust
use anchor_lang::prelude::*;
use anchor_lang::solana_program::entrypoint::ProgramResult;


declare_id!("E4fXqx7ybioeqZsHWNndNnqnpQ93DnV99gKnnxWXjvdu")

```

In the same file, Let's continue by defining the smart contract module. This
sets up a public module named `crowdfund` and we can imports all items from its
parent module into it, allowing easy access to functions defined in the parent
module from within crowdfund.

```rust
#[program]
mod crowdfund {
    use super::*;
  /// This contains the functions defined in the smart contracts

}
```

Inside the Module, we can define the functions that will be used in the smart
contract:

Lets write the function to create a new campaign. The function takes in the
following parameters:

- `name`: The name of the campaign
- `description`: The description of the campaign
- `target_amount`: The target amount of the campaign
- `project_url`: The URL of the project
- `progress_update_url`: The URL of the progress update
- `project_image_url`: The URL of the project image
- `category`: The category of the campaign

The function creates a new campaign and initializes it with the given
parameters. It sets the `amount_donated` and `amount_withdrawn` to 0, and sets
the `admin` to the public key of the user who created the campaign.

```rust
  pub fn create(
    ctx: Context<Create>,
    name: String,
    description: String,
    target_amount: u64,
    project_url: String,
    progress_update_url: String,
    project_image_url: String,
    category: String
  ) -> ProgramResult {
    let campaign = &mut ctx.accounts.campaign;
    campaign.name = name;
    campaign.description = description;
    campaign.target_amount = target_amount;
    campaign.project_url = project_url;
    campaign.progress_update_url = progress_update_url;
    campaign.project_image_url = project_image_url;
    campaign.category = category;
    campaign.amount_donated = 0;
    campaign.amount_withdrawn = 0;
    campaign.admin = *ctx.accounts.user.key;
    Ok(())
  }

```

Lets write the function to donate to a campaign. The function takes in the
following parameters:

- `amount`: The amount to donate

The function adds the given amount to the `amount_donated` field of the campaign
and subtracts the amount from the user's account.

```rust
  //Donate to a campaign
  pub fn donate(ctx: Context<Donate>, amount: u64) -> ProgramResult {
    let ix = anchor_lang::solana_program::system_instruction::transfer(
      &ctx.accounts.user.key(),
      &ctx.accounts.campaign.key(),
      amount
    );
    // Store the result of the invoke function call
    let result = anchor_lang::solana_program::program::invoke(
      &ix,
      &[ctx.accounts.user.to_account_info(), ctx.accounts.campaign.to_account_info()]
    );
    // Check if the invoke operation was successful
    if let Err(e) = result {
      return Err(e.into()); // Convert the error to a ProgramResult
    }
    // Proceed with the rest of the function
    (&mut ctx.accounts.campaign).amount_donated += amount;
    Ok(())
```

Lets write the function to withdraw funds from a campaign. The function takes in
the following parameters:

- `amount`: The amount to withdraw

The function subtracts the given amount from the `amount_donated` field of the
campaign and adds the amount to the user's account.

```rust
  pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
    let campaign = &mut ctx.accounts.campaign;
    let user = &mut ctx.accounts.user;
    //restricts Withdrawal to campaign admin
    if campaign.admin != *user.key {
      return Err(ProgramError::IncorrectProgramId);
    }
    let rent_balance = Rent::get()?.minimum_balance(campaign.to_account_info().data_len());
    if **campaign.to_account_info().lamports.borrow() - rent_balance < amount {
      return Err(ProgramError::InsufficientFunds);
    }
    **campaign.to_account_info().try_borrow_mut_lamports()? -= amount;
    **user.to_account_info().try_borrow_mut_lamports()? += amount;
    (&mut ctx.accounts.campaign).amount_withdrawn += amount;
    Ok(())
  }
```

Lets write the function to get a campaign. The function returns the details of
the campaign.

```rust
    pub fn get_campaign(ctx: Context<GetCampaign>) -> ProgramResult {
      let campaign = &ctx.accounts.campaign;
      let user = &ctx.accounts.user;
      if campaign.admin != *user.key {
        return Err(ProgramError::IncorrectProgramId);
      }
      Ok(())
    }
```

Lets define the state of the smart contract. The state of the smart contract is
the data that is stored on the solana blockchain. This data is stored in
accounts, which are a special type of data structure that can be accessed by the
smart contract.

```rust
#[derive(Accounts)]
pub struct Create<'info> {
  #[account(
    init,
    payer = user,
    space = 9000,
    seeds = [b"CROWDFUND".as_ref(), user.key().as_ref()],
    bump
  )]
  pub campaign: Account<'info, Campaign>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct Withdraw<'info> {
  #[account(mut)]
  pub campaign: Account<'info, Campaign>,
  #[account(mut)]
  pub user: Signer<'info>,
}



#[derive(Accounts)]
pub struct Donate<'info> {
  #[account(mut)]
  pub campaign: Account<'info, Campaign>,
  #[account(mut)]
  pub user: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetCampaign<'info> {
  #[account(mut)]
  pub campaign: Account<'info, Campaign>,
  #[account(mut)]
  pub user: Signer<'info>,
}


#[account]
pub struct Campaign {
  pub admin: Pubkey,
  pub name: String,
  pub description: String,
  pub target_amount: u64,
  pub project_url: String,
  pub progress_update_url: String,
  pub project_image_url: String,
  pub category: String,
  pub amount_donated: u64,
  pub amount_withdrawn: u64,
}
```

### Create the smart contract

Create a new smart contract using the following command:

```bash
anchor build
```

On top of compiling your program, this command creates an IDL for your program,
which is used to generate client bindings for your program. The IDL is stored in
the target/idl directory.

### Test the smart contract

this is a test file for the smart contract. It contains a test function that
creates a new campaign, sets up the required accounts, and calls the create
instruction. It then asserts that the campaign data is set correctly.

Add the following code to the test file:

```js
describe("create", () => {
  it("should create a campaign with the provided details", async () => {
    // Mock context and accounts
    const ctx = {
      accounts: {
        campaign: {
          name: "",
          description: "",
          target_amount: 0,
          project_url: "",
          progress_update_url: "",
          project_image_url: "",
          category: "",
          amount_donated: 0,
          amount_withdrawn: 0,
          admin: "",
        },
        user: {
          key: anchor.web3.Keypair.generate(), // Mock user public key
        },
      },
    };

    // Call create function with mock context and arguments
    await create(
      ctx,
      "Campaign Name",
      "Campaign Description",
      new BN(1000),
      "Project URL",
      "Progress Update URL",
      "Project Image URL",
      "Category",
    );

    // Assertions
    expect(ctx.accounts.campaign.name).to.equal("Campaign Name");
    expect(ctx.accounts.campaign.description).to.equal("Campaign Description");
    expect(ctx.accounts.campaign.target_amount).to.equal(1000);
    expect(ctx.accounts.campaign.project_url).to.equal("Project URL");
    expect(ctx.accounts.campaign.progress_update_url).to.equal(
      "Progress Update URL",
    );
    expect(ctx.accounts.campaign.project_image_url).to.equal(
      "Project Image URL",
    );
    expect(ctx.accounts.campaign.category).to.equal("Category");
    expect(ctx.accounts.campaign.amount_donated).to.equal(0);
    expect(ctx.accounts.campaign.amount_withdrawn).to.equal(0);
  });
});
```

You can run the test using the following command:

```bash
anchor test
```

NB: this is a sample test file, you can write more test cases to test the smart
contract.

### Deploy the smart contract

Before doing this, make sure you have airdrop some SOL to your wallet. you can
get some SOL from the [solana faucet](https://solfaucet.com/)

You can also check your wallet balance using the following command:

```bash
solana balance
```

Deploy the smart contract to the Solana devnet using the following command: But
first make sure you have this checkListed:

- Run `anchor build` to build the smart contract: Execute the command anchor
  build. This action will generate your program keypair, which can be found in
  the target/deploy directory. It's crucial to keep this keypair secret.
- Update Code with Public Key: Utilize the command anchor keys list to view the
  public key of the keypair generated in the previous step. Copy this public key
  and paste it into the declare_id! macro located at the top of your lib.rs
  file.
- Rebuild Program: Rerun anchor build. This step ensures that the newly
  generated program ID is included in the binary.
- Adjust Cluster Configuration: Modify the provider.cluster variable within the
  Anchor.toml file to specify the desired cluster, such as devnet.

```bash
anchor deploy
```

[![Screenshot-2024-02-29-at-1-35-33-PM.png](https://i.postimg.cc/m2nqyyYD/Screenshot-2024-02-29-at-1-35-33-PM.png)](https://postimg.cc/vcW3Q9SF)
Congratulations! You have successfully deployed the smart contract to the Solana
devnet!

You can test this directly with [solana playground](https://beta.solpg.io/)
also;
[![Screenshot-2024-02-29-at-1-34-17-PM.png](https://i.postimg.cc/6pwBqPsR/Screenshot-2024-02-29-at-1-34-17-PM.png)](https://postimg.cc/N5N3Ppjf)

### Build the front-end application

in the `app` directory when you create the project you can create a new React
application using the following command:

```bash
npx create-vite crowdfund-ui --template react
```

Install necessary libraries

```bash
npm install  @solana/web3.js @project-serum/anchor buffer
```

### Interact with the smart contract

we will explore how to interact with a smart contract using Typescript and
React. Specifically, we'll focus on creating, donating to, withdrawing from, and
retrieving information about campaigns managed by the smart contract. Let's dive
into each of these interactions step by step.

Importing Dependencies Before we begin interacting with the smart contract, it's
crucial to import necessary dependencies. Ensure that you have the deployed
`idl.json`(you can name it as you seem fit) file in the correct directory when
building the smart contracts. Here's how you can import the required
dependencies:

In my App, I have the idl.json file in the root directory of the project. and
this was written in `App.js`.

```js
import idl from "./idl.json";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import {
  Program,
  AnchorProvider,
  web3,
  utils,
  BN,
} from "@project-serum/anchor";

window.Buffer = Buffer;
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
};
const { SystemProgram } = web3;
```

Creating a Campaign. To create a campaign, follow these steps:

- Define a function named createCampaign.
- Inside the function, instantiate a new Program using the imported idl,
  programID, and a provider.
- Use PublicKey.findProgramAddress to find the address of the campaign.
- Call program.rpc.create with the necessary parameters to create the campaign.

```js
const createCampaign = async () => {
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    const [campaign] = await PublicKey.findProgramAddress(
      [
        utils.bytes.utf8.encode("PROJECT_CROWDFUND"),
        provider.wallet.publicKey.toBuffer(),
      ],
      program.programId,
    );
    await program.rpc.create(
      "Name of the Campaign",
      "Description of the Campaign",
      new BN(1000), // target_amount
      "Project Url", // project_url
      "Project Update Url", // progress_update_url
      "Project Image Url", // project_image_url
      "Technology", // category
      {
        accounts: {
          campaign,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      },
    );
  } catch (error) {
    console.error("Error creating campaign account:", error);
  }
};
```

Donating to a Campaign. To donate to a campaign, use the following code:

```js
const donateToCampaign = async publicKey => {
  // this can be passed by a button click, so user can donate.
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    await program.rpc.donate(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
      accounts: {
        campaign: publicKey,
        user: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      },
    });
  } catch (error) {
    console.error("Error donating to campaign:", error);
  }
};
```

Withdrawing from a Campaign. To withdraw from a campaign, use the following
code:

```js
const withdrawFromCampaign = async publicKey => {
  // this function can be called by the admin of the campaign and passed by a button click
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    await program.rpc.withdraw(new BN(0.2 * web3.LAMPORTS_PER_SOL), {
      accounts: {
        campaign: publicKey,
        user: provider.wallet.publicKey,
      },
    });
  } catch (error) {
    console.error("Error withdrawing from campaign:", error);
  }
};
```

Retrieving Campaign Information To retrieve information about a campaign, use
the following code:

```js
const getCampaign = async publicKey => {
  // this can be set in to a state and displayed on the frontend
  try {
    const provider = getProvider();
    const program = new Program(idl, programID, provider);

    const eachCampaign = await program.rpc.getCampaign({
      accounts: {
        campaign: publicKey,
        user: provider.wallet.publicKey,
      },
    });
  } catch (error) {
    console.error("Error getting campaign:", error);
  }
};
```

Getting All Campaigns To retrieve information about all campaigns, follow these
steps:

- Define a state variable to store the fetched campaigns.
- Implement a function named getAllCampaigns to fetch all campaigns.
- Utilize useEffect to trigger the fetching of campaigns when the component
  mounts.

```js
const [campaigns, setCampaigns] = useState([]);

const getAllCampaigns = async () => {
  // this can be set in to a state and displayed on the frontend can be utilized in the useEffect hook
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = getProvider();
  const program = new Program(idl, programID, provider);
  Promise.all(
    (await connection.getProgramAccounts(programID)).map(async campaign => ({
      ...(await program.account.campaign.fetch(campaign.pubkey)),
      pubkey: campaign.pubkey,
    })),
  ).then(campaigns => {
    console.log(campaigns);
    setCampaigns(campaigns);
  });
};

useEffect(() => {
  (async () => {
    // get all campaigns
    await getAllCampaigns();
  })();
}, []);
```

By following these steps, you can effectively interact with the smart contract,
create campaigns, donate to them, withdraw from them, and retrieve information
about them, enabling seamless integration with your react application.

- You can also check the full code on
  [github](https://github.com/Samuellyworld/anchor-crowdfund)

### References

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/);
