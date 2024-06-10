---
date: 2024-04-30T00:00:00Z
difficulty: intro
title: "How to create a token on Solana"
description: "Learn how to create a SPL token on Solana with metadata."
tags:
  - quickstart
  - web3js
  - token 2022
  - token extensions
  - metaplex
  - cli
keywords:
  - tutorial
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - token
  - metadata
  - spl
  - spl token
---

In this guide you will learn step by step how to create a new SPL token on
Solana with the Token Extensions program and its token metadata extension. If
you want to use the base SPL Token program and Metaplex metadata instead see the
[Metaplex documentation](https://developers.metaplex.com/token-metadata).

NOTE: The steps in this guide only apply to SPL Token Extensions, ie. program id
`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`, and not SPL Token, ie. program id
`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`. The token metadata extension is
not available in SPL Token.

## Installing Solana Tools

First we need to download Solana tools to our system. Follow this Follow this
[guide to install the Solana CLI](https://docs.solanalabs.com/cli/install).

## Create folder and keypairs

Open a new terminal and create a new folder:

```bash
mkdir nice-token
cd nice-token
```

First we create a new keypair that will be the owner of our token:

```bash
solana-keygen grind --starts-with key:1
```

This will generate a keypair for you where the public address starts with "key".
Note that the more letters you add the longer it will take to generate the key.
Four is still ok, but five will already take a long time.

For me it created this keypair:

```bash
keyH23FC3gG4miLPCTTDWuD9PDX6E6V9kBk681ZnvQm.json
```

You will need to replace this with your own keypair in the following steps Then
we configure the the Solana CLI to use to use the keypair we just created:

```bash
solana config set --keypair keyH23FC3gG4miLPCTTDWuD9PDX6E6V9kBk681ZnvQm.json
```

Make sure to keep the contents of the keypair file safe. Whoever owns the key
will be able to control the token mint and be able to mint tokens, update
metadata and potentially freeze token accounts. From now on, all commands you
run in the CLI will use this keypair by default. You can see the current
configuration by running:

```bash
solana config get
```

Then we create a nice account address where our token mint will be saved:

```bash
solana-keygen grind --starts-with nic:1
```

In my case it created this keypair:
`niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun.json`

Make sure to replace this with your own keypair in the following steps.

We will also set the Solana CLI to use devnet for this example:

```bash
solana config set -ud
```

This will set the default RPC cluster to Solana devnet
`https://api.devnet.solana.com`. From now on all commands will be executed on
the devnet. To release your token on mainnet you will need to perform all step
from here again but set the cluster to mainnet using `-um` flag instead of
`-ud`.

## Fund the account

For Solana devnet we will just be able to get some free SOL from the faucet. If
you get rate limited you can follow this
[guide](/content/guides/getstarted/solana-token-airdrop-and-faucets.md) to get
devnet SOL.

```bash
solana airdrop 2
```

For mainnet you will need to fund the account with SOL. You can buy SOL with
regular currency in places like centralized exchanges, crypto on-ramps, or swap
other tokens for SOL on decentralized exchanges. You can find the address of
your account by looking at the file name of the keypair that starts with "key"
in your `nice-token` folder or by running:

```bash
solana address
```

## Creating the token mint

Solana does not use floating point numbers internally. This is why every token
has an actual max supply represented by an unsigned integer of size 64 bytes
called a `u64`. The maximum number results to 2^64 – 1 = 18446744073709551615.
You can however set a decimal point for the token. For example
[USDC](https://explorer.solana.com/address/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)
has 6 decimals which means that each USDC can be split into one millionth of a
USDC.

Depending on your needs, you can configure different decimals for your token by
adding the `--decimals 6` flag to the command. If you do not set it the default
is 9.

Now we will create the token mint with the metadata extension enabled. By adding
our grinded keypair (`nice...4Gun`) at the end, the Solana CLI will actually use
that address as the [mint account](/docs/core/tokens.md#mint-account) for our
new token:

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
 --enable-metadata niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun.json
```

This is also where you would be able to add additional
[token extensions](/content/guides/token-extensions/getting-started.md) to your
token to have extra functionality, like
[transfer fees](/content/guides/token-extensions/transfer-fee.md) for example.
You will not be able to add more extensions to your token mint after you created
it.

## Create and upload metadata

Next we will create the off-chain metadata for our token and upload it somewhere
accessible on the rest of the internet (like a decentralized storage provider).
This off-chain metadata is usually a `.json` file containing name, symbol, and
uri in the following format:

```json
{
  "name": "",
  "symbol": "",
  "image": ""
}
```

The metadata we will save in a decentralized storage solution.

First we need to create an icon for the token. I used ChatGPT to generate an
image and then uploaded it to a decentralized storage solution.

### Where to upload metadata

There are several places you could upload your off-chain metadata. While some
may opt for more centralized storage solutions (like AWS, GCP, or GitHub),
others may chose a decentralized provider (like Arweave or IPFS). The important
thing is that the metadata file should be upload to a place that is accessible
to others on the internet and meets your tokens needs.

Listed below are some different options and tools to upload your files (in no
particular order):

| Service              | URL                                                      | Details                                                                                                  |
| -------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Web3 Storage         | [web3.storage](https://web3.storage)                     | Requires signing up for a free plan; first 5Gb are free; easy to use.                                    |
| Pinata               | [Pinata](https://app.pinata.cloud/)                      | Uploads to IPFS; free with sign up for 1Gb;                                                              |
| Akord                | [Akord](https://akord.com/)                              | Uploads to arweave; free without sign up for 100Mb; uploads can take a while.                            |
| GitHub               | [GitHub](https://github.com)                             | Create a new repo, upload files, and use the RAW URL format: `https://raw.githubusercontent.com/xxxxxxx` |
| ShadowDrive          | [ShadowDrive](https://www.shdwdrive.com/)                | This is a Solana native storage solution. Did not work at the time of writing.                           |
| Metaplex Metaboss    | [Metaplex Metaboss](https://metaplex.com/)               | [Meta boss docs](https://metaboss.rs/)                                                                   |
| Google Cloud Storage | [Google Cloud Storage](https://cloud.google.com/storage) | -                                                                                                        |
| Amazon               | [Amazon](https://aws.amazon.com/)                        | -                                                                                                        |

> If you are a provider of decentralized storage solutions and want to be listed
> here please just open a PR using the edit page button

For this example, we will use [Web3 Storage](https://web3.storage). While it
requires to sign up for an account to use, they offer a free plan with the first
5Gb free and its very easy to use.

For this example, we generated an icon for our token using ChatGPT. After you
have your image/icon, upload it to your desired online storage solution and get
the link to it. We will need to put this link within our `metadata.json` file so
we can then upload that.

You will end up with some link similar to this one which should directly open
your icon:

```text
https://arweave.net/itK2SKyCDAdBl-t9sHDQzeP4Roh3UgMaqnKImRXSrvo
```

Create a new file called `metadata.json` in the `nice-token` folder and add the
following:

```json filename="metadata.json"
{
  "name": "Nice Token",
  "symbol": "NICE",
  "image": "https://arweave.net/itK2SKyCDAdBl-t9sHDQzeP4Roh3UgMaqnKImRXSrvo"
}
```

Then also upload this file to the storage provider of your choice. You will end
up with a new link that now represents the metadata of your token. Make sure you
copy the link directly to the file and not to the folder or a preview page.

You should end up with a link similar to this one:

```text
https://bafybeidfm65jzvz4zeesxp6ybinkitvpd27klk6yspstrtw5fuy5w27lkq.ipfs.w3s.link/metadata.json
```

Now we are ready to add this metadata to our token.

## Add metadata to a token

NOTE: This step only works for tokens using SPL Token Extensions, ie. program id
`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`, and not SPL Token, program id
`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`.

Now we will initialize the metadata for our token with the metadata we just
created and uploaded.

```bash
spl-token initialize-metadata niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun \
  'Nice Token' 'NICE' \
  'https://bafybeidfm65jzvz4zeesxp6ybinkitvpd27klk6yspstrtw5fuy5w27lkq.ipfs.w3s.link/metadata.json'
```

Congratulations you created a token with metadata! You can look at your token in
one of the Solana block explorers:

- [SolanaFm](https://solana.fm/address/niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun)
- [SolScan](https://solscan.io/token/niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun)
- [Solana Explorer](https://explorer.solana.com/address/niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun?cluster=devnet)
  etc.

Make sure your explorer is set to devnet (if you are working on devnet) if you
are working on devnet and replace the address to your mint address starting with
"nic".

## Update metadata

At any point as long as you do not set the update authority to null you will
still be able to do changes to the onchain metadata of this token.

Let's say you want for example update the uri field of the token. You can do
this by running the following command:

```bash
spl-token update-metadata niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun \
uri https://bafybeidfm65jzvz4zeesxp6ybinkitvpd27klk6yspstrtw5fuy5w27lkq.ipfs.w3s.link/metadata.json
```

You can also add additional metadata to your token as a key-value pair like
this:

```bash
spl-token update-metadata niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun niceness 100%
```

This is more useful for NFTs but you can also use it for fungible tokens.

## Mint tokens

Now that the token is completely set up we can mint some tokens. Let's mint 100.

First we need to create a token account to hold the tokens for our token mint:

```bash
spl-token create-account niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun
```

This will create a new token account for the account that is currently set in
the Solana config. You can also specify a different account by adding the
address at the end of the command.

And now we can finally mint some tokens into that token account:

```bash
spl-token mint niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun 100
```

Now you can also send the token to another owner of the tokens, for example:

```bash
spl-token transfer niceG6oxHmPcXVdNaUoECzWXn8Jz8fA5Q99QauJ4Gun 10 \
<other-owner> --fund-recipient
```

The `--fund-recipient` flag allows you to pay to create the token account (i.e.
the account rent) for the other owner.

Now we are done! You created a token with metadata and minted some tokens.
Congratulations!

## Further reads about tokens

- [Token extensions](https://solana.com/developers/guides/token-extensions/getting-started) -
  Learn how to add additional functionality to your token.
- [External from a16z: 5 rules for token launches](https://a16zcrypto.com/posts/article/5-rules-for-token-launches/) -
  This article outlines key guidelines for launching a token, including
  regulatory compliance, market conditions, and community engagement, providing
  a foundation for crypto-entrepreneurs.
- [External from a16z: How to navigate token launch risks](https://a16zcrypto.com/posts/article/navigating-token-launch-risks/) -
  This piece discusses how to manage risks associated with token launches,
  covering issues like legal challenges, market volatility, and technological
  hurdles, essential for a successful launch.
- [External from a16z: Getting ready to launch a token](https://a16zcrypto.com/posts/article/getting-ready-to-launch-a-token/) -
  A preparatory guide for launching a token, covering technical setup, team
  alignment, regulatory considerations, and engagement strategies, aimed at
  ensuring a successful public debut.
