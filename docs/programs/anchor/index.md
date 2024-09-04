---
title: Getting Started with Anchor
description: Getting Started with Anchor
sidebarLabel: Anchor Framework
sidebarSortOrder: 0
---

Anchor is a framework for building Solana programs. Whether you're new to
blockchain development or an experienced programmer, Anchor simplifies the
process of writing Solana programs.

Before proceeding, make sure you have completed all the required
[installations](/docs/intro/installation). This includes installing Rust, Solana
CLI, and the Anchor CLI.

To check your version of the Anchor CLI, run the following command:

```shell filename="Terminal"
anchor --version
```

Expected output:

```shell filename="Terminal"
anchor-cli 0.30.1
```

## Getting Started

This section covers the basic steps to create, build, and test your first local
Anchor project.

<Steps>

### Create a new Project

To create a new Anchor project, run the command `anchor init <NAME>`. This
command creates a new Anchor project with the specified `<NAME>`, setting up a
default program and test file.

```shell filename="Terminal"
anchor init my-program
```

After creating the project, navigate to the newly created project directory and
open it in your code editor.

```shell filename="Terminal" copy
cd my-project
```

The default Anchor program is found in `/programs/my-project/src/lib.rs`.

<Accordion>
<AccordionItem title="Default Program">

The value in `declare_id!` is the program ID. The program ID is a unique
identifier for your program.

By default, it is the public key of the keypair generated in
`/target/deploy/my_project-keypair.json`.

```rs filename="lib.rs"
use anchor_lang::prelude::*;

declare_id!("3ynNB373Q3VAzKp7m4x238po36hjAGFXFJB4ybN2iTyg");

#[program]
pub mod my_project {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
```

</AccordionItem>
</Accordion>

The default Typescript test file is found in `/tests/my-project.ts`.

<Accordion>
<AccordionItem title="Default Test File">

```ts filename="my-project.ts"
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProject } from "../target/types/my_project";

describe("my-project", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.MyProject as Program<MyProject>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
```

</AccordionItem>
</Accordion>

If you prefer working exclusively with Rust, you can create a project with a
Rust test file by using the command `anchor init --test-template rust <NAME>`.

```shell
anchor init --test-template rust my-program
```

The Rust test file is found in `/tests/src/test_initialize.rs`.

<Accordion>
<AccordionItem title="Rust Test File">

```rust filename="test_initialize.rs"
use std::str::FromStr;

use anchor_client::{
    solana_sdk::{
        commitment_config::CommitmentConfig, pubkey::Pubkey, signature::read_keypair_file,
    },
    Client, Cluster,
};

#[test]
fn test_initialize() {
    let program_id = "3ynNB373Q3VAzKp7m4x238po36hjAGFXFJB4ybN2iTyg";
    let anchor_wallet = std::env::var("ANCHOR_WALLET").unwrap();
    let payer = read_keypair_file(&anchor_wallet).unwrap();

    let client = Client::new_with_options(Cluster::Localnet, &payer, CommitmentConfig::confirmed());
    let program_id = Pubkey::from_str(program_id).unwrap();
    let program = client.program(program_id).unwrap();

    let tx = program
        .request()
        .accounts(my_program::accounts::Initialize {})
        .args(my_program::instruction::Initialize {})
        .send()
        .expect("");

    println!("Your transaction signature {}", tx);
}
```

</AccordionItem>
</Accordion>

### Build the Program

The next step is to build the program. The build process compiles your Anchor
program, generating the files necessary for deployment. Build the program by
running `anchor build`.

```shell filename="Terminal" copy
anchor build
```

The compiled program is found in the `/target/deploy/my_project.so` file.

When you deploy your program to a Solana cluster, the contents of this `.so`
file are stored on the network in an executable account.

### Test the Program

To test the program, run `anchor test`.

```shell filename="Terminal" copy
anchor test
```

By default, the `Anchor.toml` config file specifies the `localnet` cluster. When
developing on `localnet`, `anchor test` will automatically:

1. Start a local Solana validator
2. Build and deploy your program to the local cluster
3. Run the tests in the `tests` folder
4. Stop the local Solana validator

Alternatively, you can manually start a local Solana validator and run tests
against it. This is useful if you want to keep the validator running while you
iterate on your program. It allows you to inspect accounts and transaction logs
on the [Solana Explorer](https://explorer.solana.com/?cluster=custom) while
developing locally.

First, open a new terminal and start a local Solana validator.

```shell filename="Terminal" copy
solana-test-validator
```

In a new terminal, run the tests against the local cluster. Use the
`--skip-local-validator` flag to skip starting the local validator since it's
already running.

```shell filename="Terminal" copy
anchor test --skip-local-validator
```

### Deploy to Devnet

By default, the Anchor.toml config file in an Anchor project specifies the
localnet cluster.

```toml filename="Anchor.toml" {14}
[toolchain]

[features]
resolution = true
skip-lint = false

[programs.localnet]
my_program = "3ynNB373Q3VAzKp7m4x238po36hjAGFXFJB4ybN2iTyg"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

To deploy your program to the devnet cluster, update the `Anchor.toml` file to
specify the devnet cluster.

```diff
-cluster = "Localnet"
+cluster = "Devnet"
```

```toml filename="Anchor.toml"
[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"
```

Now when you run `anchor deploy`, your program will be deployed to the devnet
cluster.

```shell
anchor deploy
```

The `anchor test` command will also use the cluster specified in the
`Anchor.toml` file.

To deploy to mainnet, simply update the `Anchor.toml` file to specify the
mainnet cluster.

```toml filename="Anchor.toml"
[provider]
cluster = "Mainnet"
wallet = "~/.config/solana/id.json"
```

### Update the Program

Solana programs can be updated by redeploying the program to the same program
ID.

To update a program, simply make changes to your program's code and run the
`anchor build` command to generated an updated `.so` file.

```shell
anchor build
```

Then run the `anchor deploy` command to redeploy the updated program.

```shell
anchor deploy
```

### Close the Program

To reclaim the SOL allocated to a program account, you can close your Solana
program.

To close a program, use the `solana program close <PROGRAM_ID>` command. For
example:

```shell
solana program close 3ynNB373Q3VAzKp7m4x238po36hjAGFXFJB4ybN2iTyg --bypass-warning
```

Note that once a program is closed, it the program ID cannot be reused to deploy
a new program.

</Steps>

## Project File Structure

Below is an overview of default file structure in an Anchor workspace:

```
.
├── .anchor
│   └── program-logs
├── app
├── migrations
├── programs
│   └── [project-name]
│       └── src
│           ├── lib.rs
│           ├── Cargo.toml
│           └── Xargo.toml
├── target
│   ├── deploy
│   │   └── [project-name]-keypair.json
│   ├── idl
│   │   └── [project-name].json
│   └── types
│       └── [project-name].ts
├── tests
│   └── [project-name].ts
├── Anchor.toml
├── Cargo.toml
└── package.json
```

### Programs Folder

The programs folder contains your project's Anchor programs. A single workspace
can contain multiple programs.

### Tests Folder

The tests folder contains test files for your project. A default test file is
created for you when you create your project.

### Target Folder

The target directory contains build outputs. The main subfolders include:

- `/deploy`: Contains the keypair and program binary for your programs.
- `/idl`: Contains the JSON IDL for your programs.
- `/types`: Contains the TypeScript type for the IDL.

### Anchor.toml File

The `Anchor.toml`file configures workspace settings for your programs.

### .anchor Folder

Includes a `program-logs` file that contains the program's transaction logs from
the last run of test files in the `tests` folder.

### App Folder

The app folder is an empty folder that can be optionally used for your frontend
code.
