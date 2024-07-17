---
title: Intro to Token Extensions
objectives:
  - Learn about the Token Extensions Program
  - Understand that mints that use Token Extensions must be created with the
    Token Extensions Program
  - Learn about the wide variuety of token extensions
  - Use token extensions from the Solana CLI
description:
  "Learn what token extensions are, and how to create tokens that use their
  features."
---

## Summary

- The existing Token Program on Solana provides interfaces for fungible and
  non-fungible tokens. However as new features have been needed, various forks
  of Token Program have been created to add features, posing adoption challenges
  across the ecosystem.
- To introduce new token features without disrupting current users, wallets, and
  decentralized applications (dApps), and to ensure the safety of existing
  tokens, a new token program, Token Extensions Program (also called
  Token-2022), has been developed.
- Token Extensions Program is a separate program with a separate address from
  the original Token Program. It supports the exact same functions plus
  additional ones through extensions.

## Overview

The Token Extensions Program, previously know as Token 2022, is a superset of
the functionality provided by the original Token Program. The Token Program
serves most needs for fungible and non-fungible tokens through a simple set of
interfaces and structures. Though simple and performant, the Token Program
lacked features that the developer community soon found need of. This
necessitated forks of the Token Program, potentially splitting the ecosystem.

For example, say a university wants to send an NFT version of a diploma to a
graduate's wallet. How can we be sure that diploma is never transferred away to
a third party? In the current Token Program, this is not possible - we would
need a check in the transfer instruction that rejects all transactions. One
solution to this would be fork the Token Program, and add the check. However
this means it would be an entirely separate token program. The university would
have to run a campaign for wallets and degree-checking dapps to adopt it.
Additionally, what if different universities want different functionality? There
would have to be some sort of University DAO just to manage these internal
debates - maybe there would be several University DAOs... Or they could just use
the `non-transferable token` extension in the new Token Extension Program. Which
is a core Solana program, adopted by everyone.

This is why the Token Extension Program was created, to vastly improve the
functionality and customization of the most wanted and requested features from
the original Token Program. And it does so by 100% supporting all of the
functions developers are used to in the original and leaves room for future
improvements. Though it is a second program, two programs are much easier to
adopt than dozens.

This being said, the Token Extensions Program, is deployed to a separate
address. Even if the interfaces of these two programs are same, the addresses of
these programs are **not interchangeable** in any case. Meaning a token created
with the Token Program, cannot interact with the Token Extension Program. As a
result, if we want to add support for Token Extensions program, our client
application will need some extra logic to differentiate between the tokens owned
by these two programs.

Last note - The Token Extension Program does not completely replace the Token
Program, if the use-case of a particular token is very simple, it may not need
extensions. In this case, the original Token Program would be ever-so-slightly
preferable to use since the program does not need to go through any of the
additional extension checks.

### Extensions

The extensions of the Token Extension Program are just that, extensions. Meaning
any extra data needed for the extension is tagged at the end of the Mint and
Token accounts that we're familiar with. This is crucial for the interfaces of
the Token Program and Token Extension Program to match up.

As of writing there are
[16 extensions](https://spl.solana.com/token-2022/extensions), four on the Token
accounts, and 12 on the Mint accounts:

**Account extensions** currently include:

- **Required memos** This extension makes it mandatory to have a memo on on all
  transfers, just like traditional banking systems.

- **Immutable ownership** A token account's owner can normally transfer
  ownership to any other address, which is useful in many scenarios but can lead
  to security vulnerabilities, especially when dealing with Associated Token
  Accounts (ATAs). To avoid these issues, we can use this extension which makes
  it impossible to reassign account ownership.

<Callout type="note">All Token Extension Program ATAs have the immutable
ownership extension baked in. </Callout>

- **Default account state** Mint creators can use this extension which forces
  all new token accounts to be frozen. This way, users must eventually interact
  with some type of service to unfreeze their accounts and use the tokens.

- **CPI guard** This extension safeguards users against authorizing actions that
  are not visible to them, specifically targeting concealed programs that are
  neither the System nor Token programs. It does this by restricting certain
  activities within cross-program invocations.

**Mint extensions** include:

- **Transfer fees** The Token Extension Program implements transfer fees at the
  protocol level, deducting a certain amount from each transfer to the
  recipient's account. This withheld amount is inaccessible to the recipient,
  and is redeemable by whatever address the mint creator dictates.

- **Closing mint** Under the Token Program, only token accounts could be closed.
  However, the introduction of the close authority extension now allows for the
  closure of mint accounts as well.

<Callout type="note">To close a mint account, the supply has to be 0. So all
tokens minted must be burned. </Callout>

- **Interest-bearing tokens** Tokens which have constantly fluctuating values,
  showing the updated values in clients requires proxies that require regular
  rebase or update operations. With this extension, we can change how the UI
  amount of tokens are represented by setting an interest rate on the token and
  fetching it's amount with interest at any time. Note, the interest on the
  token is purely aesthetic and does not change the amount of tokens within an
  account.

- **Non-transferable tokens** This extension enables the creation of tokens that
  are "bound" to their owner, meaning they cannot be transferred to others.

- **Permanent delegate** This extension allows us to specify a permanent
  delegate for a mint. This authority has unlimited delegate privileges over any
  token account of that mint. This means that it can burn or transfer any amount
  of tokens from any account. Permanent delegate can be used for example by
  membership programs to revoke access tokens, or by stablecoin issuers to
  revoke balances owned by sanctioned entities. This Extension is powerful and
  dangerous.

- **Transfer hook** This extension allows token creators to have more control
  over how their tokens are transferred, by allowing a callback "hook" function
  onchain. The creators must develop and deploy a program that implements the
  hook interface and then configure their token mint to use their program. Then,
  on any transfer of that mint, the transfer hook will be called.

- **Metadata pointer** A mint can have multiple different accounts claiming to
  describe the mint. This extension allows the token creator to designate an
  address that describes the canonical metadata. The pointer can be an external
  account, like a Metaplex metadata account, or if using the metadata extension,
  self pointing.

- **Metadata** This extension allows a mint creator to include their token's
  metadata directly into the mint account. This is always used in conjunction
  with the metadata pointer extension.

- **Group pointer** Think of a group of tokens much like a "collection" of
  tokens. More specifically, in an NFT collection, the mint with the group
  pointer extension would be considered to be the collection NFT. This extension
  contains a pointer to an account that conforms to the
  [Token-Group Interface](https://github.com/solana-labs/solana-program-library/tree/master/token-group/interface).

- **Group** This stores the
  [group information](https://github.com/solana-labs/solana-program-library/tree/master/token-group/interface)
  within the mint itself. It is always used in conjunction with the group
  pointer extension.

- **Member pointer** The inverse of the group pointer is the member pointer.
  This pointer points to an account that holds the member data, like which group
  it's a part of. In a collection of NFTs, these would be the NFTs in the
  collection.

- **Member** This stores the member information within the mint itself. It's
  always used in conjunction with the member pointer extension.

- **Confidential transfers** This extension enhances privacy of the transactions
  without revealing key details of the transaction such as the amount.

<Callout type="note">These extensions can be mixes and matched to make a
plethora of highly functional tokens. </Callout>

We'll dig deeper into each extension in separate lessons.

## Things to consider when working with both Token Program and Token Extension Program

Although the interfaces for both of these programs remain consistent, they are
two different programs. The program IDs of these programs are not
interchangeable, and the addresses created by using them are different. If you
want to support both Token Program tokens and Token Extension Program tokens,
you must add extra logic on the client side and program side. We will dive into
these implementations in later lessons.

## Lab

Now, we will test out some of these extensions using the `spl-token-cli` CLI.

#### 1. Getting Started

Before we can use the extensions, we need to install the `spl-token-cli`. Follow
the instructions in [this guide](https://spl.solana.com/token#setup). After the
installation, verify it by running the following command:

```bash
spl-token --version
```

<Callout type="note">Make sure you follow each step in the
[guide above](https://spl.solana.com/token#setup) as it also describes how to
initialize a local wallet and airdrop SOL. </Callout>

#### 2. Creating a mint with close authority

Let's create a mint account with the close authority extension, and then, to
show that it works, we'll close the mint!

Let's create a mint with close authority extension using the CLI:

This extension requires following arguments:

- `create-token` : The instruction that we want to execute.
- `--program-id` : This flag is used to specified which program ID to use.
  `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` is the public address at which
  the Token Extension Program is deployed.
- `--enable-close` : This flag specifies that we want to initialize the mint
  with close authority.

Run the following command:

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --enable-close
```

We will see output similar to as shown below:

```bash
Creating token 3s6mQcPHXqwryufMDwknSmkDjtxwVujfovd5gPQLvKw9 under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  3s6mQcPHXqwryufMDwknSmkDjtxwVujfovd5gPQLvKw9
Decimals:  9

Signature: fGQQ1eAGsnKN11FUcFhGuacpuMTGYwYEfaAVBUys4gvH4pESttRgjVKzTLSfqjeQ5rNXP92qEyBMaFFNTVPMVAD
```

To view details about the newly created mint, we can use the `display` command.
This command will show relent details for a token mint, account or multisig.
Let's pass it mint address of the previous step.

```bash
spl-token display <ACCOUNT_ADDRESS>
```

Now that we have a mint, we can close it with the following where
`<TOKEN_MINT_ADDRESS>` is the resulting address from the previous step.

```bash
spl-token close-mint <TOKEN_MINT_ADDRESS>
```

<Callout type="note">By closing the account, we reclaim the rent lamports on the
mint account. Remember, the supply on the mint must be zero.</Callout>

As a challenge, repeat this process, but before closing the mint account, mint
some tokens and then try to close it - see what happens. (Spoiler, it'll fail)

#### 3. Creating a token account with immutable owner

Let's test out another extension, a Token account extension this time. We'll
create a new mint, and then we'll create an associated token account using the
immutable owner extension.

First let's create a new vanilla mint with no additional extensions:

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
```

You should get something simular to this:

```bash
Creating token FXnaqGm42aQgz1zwjKrwfn4Jk6PJ8cvkkSc8ikMGt6EU under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb

Address:  FXnaqGm42aQgz1zwjKrwfn4Jk6PJ8cvkkSc8ikMGt6EU
Decimals:  9

Signature: 3tX6FHvE24e8UHqSWbK5HRpBFxtCnDTRHASFZtipKkTzapgMGZEeNJ2zHAHSrSUs8L8wQGnLbvJiLrHuomyps39j
```

Save the resulting mint address, we'll use it in the next step.

Now let's mint one of these tokens to an associated token account (ATA) that
uses the `immutable owner` extension. By default all ATAs enable the
`immutable owner` extension. And all token accounts made with the CLI will be
ATAs, so `immutable owner` will be enabled.

This extension requires following arguments:

- `create-account`: The instruction that we want to execute.
- `--program-id` (optional): The program ID we want to use. This is optional
  because the CLI will figure out the owning program of the mint.
- `--owner` (optional): Public key of the owner's wallet. It will default to the
  current working public key which we can get by running the command
  `solana address`.
- `--fee-payer` (optional): Keypair of the wallet paying for the transaction. It
  will default to the current working keypair, which can be found with
  `solana config get`.
- `<TOKEN_MINT_ADDRESS>`: this is the mint account we got from the
  `create-token` command.

Run the following command to create the associated token account with the
immutable owner extension:

```bash
spl-token create-account <TOKEN_MINT_ADDRESS>
```

After running this command, we will see out similar to as shown below.

```bash
Creating account F8iDrVskLGwYo53SdJnvBKTpN1C7hobgnPQMq6hLivUn

Signature: 5zX73E2aFVwcsvhCgBSF6AxWqydWYk3KJaTmeS4AY22FwCvgEvnodvJ7fzvBHZptqv3FMz6tbLFR5LbmiUHLUkne
```

Now we can mint some tokens to it with the `mint` function. Here are the
arguments we have to provide:

- `mint`: The instruction
- `<TOKEN_MINT_ADDRESS>`: The address of the mint we got from the first step
- `<TOKEN_AMOUNT>`: Amount to mint in tokens
- `<RECIPIENT_TOKEN_ACCOUNT_ADDRESS>`(optional): This is the token account used
  to hold the tokens we created in the previous step. However, this defaults to
  the ATA of our current working keypair and mint. So this will automatically
  use the account from our last step.

```bash
spl-token mint <TOKEN_MINT_ADDRESS> <TOKEN_AMOUNT>
```

This will result in something like the following:

```bash
Minting 1 tokens
  Token: FXnaqGm42aQgz1zwjKrwfn4Jk6PJ8cvkkSc8ikMGt6EU
  Recipient: 8r9VNjnLqjzrpgkcgCozgvCBDQwWWYUL7RKwatSWnd6B

Signature: 54yREwGCH8YfYXqEf6gRKGou681F8NkToAJZvJqM5qZETJokRkdTb8s8HVkKPeVMQQcc8gCZkq4Kxx3YbLtY9Frk
```

Feel free to use the `spl-token display` command to get some info about the mint
and token account.

#### 4. Creating a non-transferrable ("soul-bound") NFT

Lastly, let's create an NFT which will be non-transferable, sometimes called a
'soul-bound' NFT. Think of it as a achievement token which is exclusively owned
by one person or account. For creating this token, we will use three extensions:
metadata pointer, metadata and non-transferable token.

With the metadata extension, we can include metadata directly in the mint
account and the non-transferable extension makes the token exclusive to the
account.

The command takes following arguments:

- `create-token`: The instruction that we want to execute.
- `--program-id`: The program ID we want to use.
- `--decimals`: NFTs are usually whole, and have 0 decimals
- `--enable-metadata`: The metadata extension flag. (This initializes the
  metadata and metadata pointer extensions)
- `--enable-non-transferable`: The non-transferable extension flag.

Run the following command to create a token initialized with the metadata and
non-transferrable extensions.

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --decimals 0 --enable-metadata --enable-non-transferable
```

We will see output similar to as shown below.

```bash
Creating token GVjznwtfPndL9RsBtAYDFT1H8vhQjx8ymAB1rbd17qPr under program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
To initialize metadata inside the mint, please run `spl-token initialize-metadata GVjznwtfPndL9RsBtAYDFT1H8vhQjx8ymAB1rbd17qPr <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI>`, and sign with the mint authority.

Address:  GVjznwtfPndL9RsBtAYDFT1H8vhQjx8ymAB1rbd17qPr
Decimals:  0

Signature: 5EQ95NPTXg5reg9Ybcw9LQRjiWFZvfb9WqJidxu6kKbcKGajp1U999ioToC1qC88KUS4kdUi6rZbibqjgJbzYses
```

After creating the mint with metadata extension, we need to initialize the
metadata as specified in the output above. Initializing metadata takes the
following arguments:

- Mint address : Address of the mint to initialize the metadata for.
- `<YOUR_TOKEN_NAME>`: Name of the token
- `<YOUR_TOKEN_SYMBOL>`: Symbol by which the token will be identified.
- `<YOUR_TOKEN_URI>`: URI for the token.
- `--update-authority` (optional): The address of the account with the authority
  to update the metadata. This will default to the current working public key.

Run the following command to initialize the metadata:

```bash
spl-token initialize-metadata <TOKEN_MINT_ADDRESS> MyToken TOK http://my.tokn
```

Now, let's take a look at the metadata by calling our trusty `display` command.

```bash
spl-token display <TOKEN_MINT_ADDRESS>
```

Next, let's update the metadata for that mint. We will be updating the name of
our token. Run the following command:

```bash
spl-token update-metadata <TOKEN_MINT_ADDRESS> name MyAwesomeNFT
```

Now let's see how we can add a custom field to our mint's metadata. This command
takes the following arguments:

- Mint address : Address of the mint to update metadata for.
- Custom field name : Name of the new custom field.
- Custom field value : Value of the new custom field.

Run the following command:

```bash
spl-token update-metadata <TOKEN_MINT_ADDRESS> new-field new-value
```

We can also remove the custom fields from the mint metadata. Run the following
command:

```bash
spl-token update-metadata <TOKEN_MINT_ADDRESS> new-field --remove
```

Lastly, lets make it a real non-transferrable NFT. We do this by minting the NFT
to our ATA and then removing the mint authority. This way the supply will only
be one.

```bash
spl-token create-account <TOKEN_MINT_ADDRESS>
spl-token mint <TOKEN_MINT_ADDRESS> 1
spl-token authorize <TOKEN_MINT_ADDRESS> mint --disable
```

Now we have successfully created a non-transferrable NFT which is exclusively
owned by our ATA.

That's it! This is how we can use the Solana CLI with Token Extension Program to
use the extensions. We will dive deeper into these extensions in separate
lessons and see how we can use them programmatically.

## Challenge

Go and try out different combinations of extensions using the CLI.

Hint: Take a look at your options by calling commands with the `--help` flag:

```bash
spl-token --create-token --help
```
