---
date: Feb 26, 2024
seoTitle: "Token Extensions Guide: Create tokens with Metadata"
title:
  Create tokens with metadata on Solana using token extensions with Solana CLI
description:
  Create tokens with metadata on Solana using token extensions with spl-token
  cli which comes installed with solana CLI, without using any external metadata
  standards.
keywords:
  - token 2022
  - token extensions
  - spl token cli
difficulty: beginner
tags:
  - token 2022
  - token extensions
  - spl token cli
  - command line interface
---

Solana CLI comes with many tools, one of which is spl-token CLI. Unlike Ethereum
or other EVM blockchains, we do not need to redeploy existing code to create
tokens. There is already a program (smart contract) for creating tokens called a
token program and token extension program. So we can call that program in any
programming language.

We will be using a Token extension program to create tokens with Metadata
functionality.

> Token Extension program Id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

This guide will discuss -

1. What is a fungible token?
2. Accounts involved and Solana Program Library
3. Token Program and Token Extension Program
4. Creating a fungible token
5. Minting tokens, Token Supply and Balance
6. Transferring tokens to another wallet
7. Burn tokens
8. Adding Metadata in Token Extension
9. Close Associated Token Accounts
10. Token extension overview

## 1. What is a fungible token?

Anything such as currency, shares, or goods that can easily be exchanged for
others of the same value and type. You might have heard of NFTs (Non-fungible
tokens), those are unique tokens with different values. Fungible tokens can be
multiple tokens of the same value.

## 2. Accounts involved and Solana Program Library

Everything on Solana is an account, for every information you want to store
on-chain, you’ll have to create an account and store data inside it. A token is
not a specific thing created; it’s just writing numbers on a ledger and
information getting stored. Transferring tokens doesn’t mean an actual token is
transferred, we are just doing addition-subtraction kind of math on a piece of
information stored in an account. Nothing is burning with fumes when we burn
tokens. When creating a token we will create two types of accounts mostly.

- Token Mint account - This account is created for every new token type you
  create. This account holds details like the number of supply of the tokens,
  who can mint more tokens (mint authority), what will be the smallest unit of
  the token (decimals) and also the Metadata
- Associated Token account (ATA) - An associated token account is created for
  every user who wants to hold a certain token (each account for each user).
  This account is used to store the balance of how many tokens a user has.

How and who will we create these accounts? Do I need to code for these? The
answer is that you will create those accounts and you don’t need to code it
because Solana comes with some default programs coupled in called **Solana
Program Library**(SPL). These bunch of programs will help you do a lot of
things, like system program can help you create accounts and token program will
help you add important information to those accounts.

> fact: all the programs that you build will also be on chain stored in some
> account that you will create. For storing anything thing you’ll have to pay
> some negligible [rent](https://solana.com/docs/intro/rent).

## 3. Token Program and Token Extension program

On Solana, the Token Program has supported various types of tokens since 2020.
With growing developer interest, forked versions were created to enhance
functionality. However, adopting new token programs poses challenges due to
transaction complexity and trust requirements. A new Token extension program was
launched separately to avoid disrupting users and maintain token safety.

## 4. Creating a fungible token

We will use the Command line interface to create tokens. We can use spl-token
CLI to do many tasks related to tokens like creating accounts, checking the
supply of tokens, the token balance of a user’s account, transferring tokens to
other users, and so much more.

spl-token CLI is already installed in your system when you install Solana CLI.
[install Solana CLI by following this guide, if you haven't](https://solana.com/developers/guides/getstarted/setup-local-development)

To check if it exists or not, you can check the version of spl-token CLI.

```json
spl-token --version
```

your output should look something like this.

```bash
spl-token --version
spl-token-cli 3.3.0
```

Despite installing solana cli if it gives an error that spl-token command was
not recognised, you can install spl-token cli via cargo package manager for
rust.

```bash
cargo install spl-token-cli
```

After installing, check the config setup for solana clusters in your machine.

```bash
solana config get
```

```bash
Config File: /Users/ay/.config/solana/cli/config.yml
RPC URL: http://localhost:8899
WebSocket URL: ws://localhost:8900/ (computed)
Keypair Path: /Users/ay/new-keypair.json
Commitment: confirmed
```

Following this we can see that our RPC URL is localhost. We can also use Devnet
or Testnet to carry on with this tutorial.

```bash
solana config set --url [d](https://api.devnet.solana.com/)evnet
```

The setup is not finished yet, We need to check if we have a key pair on our
filesystem ready to take off with creating tokens.

In order to check if you have keypair already there in your computer filesystem
home location (where most of the applications and root of applications are), you
can execute this cat command.

This will output your private key if your file exists. If it doesn’t you will
get an error saying the specified file does not exist. cat command only works in
WSL/Linux/MacOS and Unix-like systems

```bash
cat ${HOME}/new-keypair.json
```

In Windows, you should type “type” command to output your private key

```powershell
type ${HOME}/new-keypair.json
```

if you get the error that your keypair file doesn’t exist, you can create one in
the exact location using solana-keygen cli, shipped to you while installing
solana CLI.

```bash
solana-keygen new -o ${HOME}/new-keypair.json
```

Now after creating your keypair, you need to tell your CLI that this is your
keypair, solana CLI will, by default use this keypair.

```bash
solana config set --keypair ${HOME}/new-keypair.json
```

You can now type solana address to get the public key of the keypair you just
created.

```json
solana address
```

To create tokens, you need to create multiple accounts, and you will have to pay
some rent to store your information. So on localhost, devnet, or testnet you can
get airdrop free of charge.

```bash
solana airdrop 5
```

The Final step is to create your token. Use the create-token subcommand in the
cli to create a token. We mention the new token extension program ID and give
the flag to enable metadata extension `---enable-metadata`. The command to
execute will be followed by the output here.

```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-metadata
```

```bash
Creating token 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1 <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

Address:  3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1
Decimals:  9

Signature: 4qhyPyNcSFeVshNttFfN3SgxyEnD1dXuy6cTMj5nKbXBmmEraeftMR5uXto4kRKfzby7UbEFq1QKzxQcQ3cNCzEd
```

you can also add the --decimals flag followed by <DECIMALS> to mention how much
your token should be divisible, or what should be the smallest unit of your
token, the default if you do not specify it is 9. Decimal should be a number of
base 10.

Note, here we interacted with the token extension program, which has a unique
identifier called program ID `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`. This
created something called a **token mint account** for our token and store
address, decimals, how many numbers of tokens have been created (supply) (zero
for now), and metadata for us.

You will get a different address, It’s the unique ID for your token called token
mint address.

## 5. Minting Tokens and Token Supply

To store the the balance of a token for an end user, we need to create an
account called the associated token account(ATA).

To create an associated token account, use create-account subcommand, you’ll
have to mention here which token you want to create the ATA.

```bash
spl-token create-account <MINT_ACCOUNT_ADDRESS>
```

Example

```bash
spl-token create-account 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1

Creating account 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5
Signature: xUioenYTevhVuqr34TnqY7CQ5aRvNuVvzcZWbXZuQhWCERCRiRq5h6bGTapX6Re2YBxLYyHBVXdFyshw1ixTQS2
```

5Pvg1Q……GEB5 was the address of my associated token account for the mint account
I created in the step above. You can use the balance subcommand with the Mint
account address to check how many tokens are in that ATA. The cli will get ATA
from given data and output the balance of tokens your wallet holds.

```bash
spl-token balance <MINT_ACCOUNT_ADDRESS>
```

This is how the execution will look like.

```bash
spl-token balance 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1
0
```

![A Diagram of Token extension Mint Account](/assets/guides/create-tokens-metadata-extension/TokensX---0-Diagram_Mint.png)

Now let’s create some amount of tokens in the associated token account, mint
subcommand can help you do it. With the token mint account address being a
unique token ID, and amount being the number of tokens. This will output the
amount of tokens, token mint address, and recipient ATA.

```bash
spl-token mint <MINT_ACCOUNT_ADDRESS> <AMOUNT>
```

And the output will be

```bash
spl-token mint 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1 100
Minting 100 tokens
  Token: 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1
  Recipient: 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5

Signature: 3qqgYtnF38k9dGCUJqubGBpAJkuz2oNLLko2qEdLErMhyF6jNawpmnzErLpUsp8wKRB8syicgBfWNKkxaccd9JTf
```

> You can also go to [explorer.solana.com](https://explorer.solana.com), and the
> switch network to the one you are using, You can use, localnet, devnet or
> testnet and paste your token ID there.

Here you can see your unknown token minted with supply, mint authority, and
decimals of that specific token. See metadata and the token mint account are the
same addresses. And the keypair which created token has the metadata pointer
authority.

> ![Token Mint Account in Solana Explorer](/assets/guides/create-tokens-metadata-extension/TokensX---1-mint-explorer.png)

> When you enter your associated token address in Explorer, you can see the
> balance of tokens you just minted, with Mint(unique token Id) and Owner of
> that ATA (publickey of the keypair in the filesystem).
>
> ![Associated Token extension Account in Solana Explorer](/assets/guides/create-tokens-metadata-extension/TokensX---2-ATA-explorer.png)

You can also check how many tokens and balance we have by executing accounts
subcommand.

```bash
spl-token accounts
```

```bash

Token                                         Balance
-----------------------------------------------------
3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1  100
```

Try `spl-token accounts -v` for verbose details of all tokens with ATAs, balance
and more.

Also did you notice the associated token account owner and mint account address?
Both are the same as the address we created with Solana-keygen.

![Token extension account Diagram](/assets/guides/create-tokens-metadata-extension/TokensX---3-ATA-diagram.png)

Also, notice the immutable owner, which is enabled by default. This means this
ATA cannot change its owner in the future, protecting us from delegating tokens
when users sign unknown TXNs.

## 6. Transferring Tokens to another wallet

Now, to transfer these tokens into another wallet, we can use the transfer sub
command.

```bash
spl-token transfer <TOKEN_MINT_ADDRESS> <AMOUNT> <RECIPIENT_ADDRESS>
```

```bash
spl-token transfer 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1 20 Ayush4Vse1jrUmekKBFKQLY4rnQ8YYYiYv5EW3SVSjUc
Transfer 20 tokens
  Sender: 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5
  Recipient: Ayush4Vse1jrUmekKBFKQLY4rnQ8YYYiYv5EW3SVSjUc
Error: "Error: The recipient address is not funded. Add `--allow-unfunded-recipient` to complete the transfer."
```

But uh oh, we ran into an error. This says to fund another wallet that is not
funded yet, which means that doesn’t have a devnet or localnet sol. We need sol
to create accounts. An associated token is required for that user to hold the
balance of the token we created. Let’s add the required flag and execute the
command again.

Let’s try again with some flags that allow unfunded recipients and fund that
recipient from our keypair.

```bash
spl-token transfer --fund-recipient --allow-unfunded-recipient <FROM_ADDRESS> <AMOUNT> <RECIPIENT_ADDRESS>
```

```bash
spl-token transfer --fund-recipient --allow-unfunded-recipient 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1 20 Ayush4Vse1jrUmekKBFKQLY4rnQ8YYYiYv5EW3SVSjUc
Transfer 20 tokens
  Sender: 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5
  Recipient: Ayush4Vse1jrUmekKBFKQLY4rnQ8YYYiYv5EW3SVSjUc
  Recipient associated token account: DPQiBqKqYbip7NTQwhyjFir6LQGxCeedJYGL7Fudht6P
  Funding recipient: DPQiBqKqYbip7NTQwhyjFir6LQGxCeedJYGL7Fudht6P

Signature: 3aqYXK9RPvaYGrgXcCkFdytDWKu8ovH5wTHDJaJtQYehfv4X43xnQ8Fw5Snt3eAxLiVSeoHPwpCubmNdUytSUzuR
```

It also created an ATA( 8xSW….DPPp) for the recipient to hold balance
information for our token. This shows that we sent some tokens from sender to
recipient.

## 7. Burning Tokens

Let's mention an Associated token we recently created with the number of tokens
we want to burn in a particular wallet. Burning will subtract the previous
balance from the amount listed; no amount of paper contributed to global warming
here.

```bash
spl-token burn <ASSOCIATED_TOKEN_ACC_ADDRESS> <AMOUNT>
```

```bash
spl-token burn DPQiBqKqYbip7NTQwhyjFir6LQGxCeedJYGL7Fudht6P 20
Burn 20 tokens
  Source: DPQiBqKqYbip7NTQwhyjFir6LQGxCeedJYGL7Fudht6P
Error: Client(Error { request: Some(SendTransaction), kind: RpcError(RpcResponseError { code: -32002, message: "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x4", data: SendTransactionPreflightFailure(RpcSimulateTransactionResult { err: Some(InstructionError(0, Custom(4))), logs: Some(["Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb invoke [1]", "Program log: Instruction: BurnChecked", "Program log: Error: owner does not match", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb consumed 5521 of 200000 compute units", "Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed: custom program error: 0x4"]), accounts: None, units_consumed: Some(0), return_data: None }) }) })
```

Then why this error? Because you can’t burn someone else’s token, If we try
burning from our associated account, It will work

```bash
spl-token burn 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5 20
Burn 20 tokens
  Source: 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5

Signature: 3MnG2fF2t9yuPdmbaMXLrvH1UEpjwwGnA9ACUsynRhp5h4Zev7xJgeAvW4JNbpFt1HYSBkfi2pGsKEPkDfjA5JHE
```

Now, if we check the balance after burning 20 tokens and sending 20 tokens,
There should be 60 left.

```bash
spl-token balance 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1
60
```

## 8. Adding Metadata

To initialise metadata on a token you created with token extension, you need to
provide mint account id, token name, token symbol(also known as ticker), and the
token metadata URI

```bash
spl-token initialize-metadata <MINT_ACCOUNT> <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>
```

Token metadata uri is a metadata JSON that can be hosted anywhere, for this
guide we are using GitHub but you can also use genesysgo, arweave or even
filecoin.

```bash
{
    "name": "OPOS",
    "symbol": "OPOS",
    "description": "Only Possible On Solana",
    "image": "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/image.png",
    "attributes": [
      {
        "trait_type": "Item",
        "value": "Developer Portal"
      }
   ]
}
```

These uri also supports Metaplex token metadata standard.

```bash
spl-token initialize-metadata 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1 "Only Possible On Solana" "OPOS" raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json

Signature: 4x2zcrMfU8MCfHPWWrPssVAnQN3ojfuTvbPv6kCZT8SPkGg81UhvB4LLjDzDMJBgcoEV2h3CGgj4MGwPQzskkgYT
```

After initializing metadata using the hosted URI, enter your Mint account ID to
view the Mint account details, including the Token image.

![Token extension Mint Metadata](/assets/guides/create-tokens-metadata-extension/TokensX---4-mint-metadata.png)

In future, if you want to change the metadata, that can be done with

```bash
spl-token update-metadata <TOKEN_MINT_ADDRESS> <FIELD> <VALUE>
```

## 9. Closing ATA

We can also close the associated token account of a user to collect the rent
paid for creating that specific account and storing information like the balance
of a user for that token.

It can be done by executing a close subcommand on the spl-token CLI

```bash
spl-token close <TOKEN_MINT_ADDRESS>
```

```bash
spl-token close 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1
Error: "Account 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5 still has 60000000000 tokens; empty the account in order to close it."
```

Why were we unable to do that? Because we need to **burn all** the tokens inside
it to close the account. After burning **ALL** the tokens in the ATA you can use
the same command to close the associated token account.

Go back to step 6 and burn all the tokens inside your ATA, And then let’s try
closing the account.

```bash
spl-token burn 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5 60
Burn 60 tokens
  Source: 5Pvg1QdsNRKhKqUtjVaaKWw7VCaybr9G6Yfhg7X7GEB5

Signature: zuAU8GvpdosZhQXiQb8aTfTrBpr9sTw8yHUtxgbUKYLWfaRiuHCBSvJf1PKygyrVe4PkpZ18H8YZTXyE3bqZm3e
```

You will be able to close the account now.

```bash
spl-token close 3FcEbPXsN2fTDNsrQq6STxrq9sNarfAi6h2n5o6T7fn1

Signature: 46xEbPRWDoJn7UA4GRYLuVTqABWvc2YcUASgkx4acySNq4EJUJH5hhaqeQCu8BhLMmc6caHSwHoycakdVsVWJL4t
```

## 10. Token Extension Overview

Token extensions have more robust features like transfer hook, permanent
delegate, and closing mint. Also, includes extensions for user end experiences
(ATAs) like immutable ownership, CPI guard, etc.

[Here is a comprehensive guide to help you explore more using Token Extensions](https://solana.com/developers/guides/token-extensions/getting-started)

> Token extension based tokens might utilise a higher amount of compute units
> for each transfer at the time of writing this blog.

Thanks for reading this guide on creating tokens with token extension metadata,
Have fun with tokens.
