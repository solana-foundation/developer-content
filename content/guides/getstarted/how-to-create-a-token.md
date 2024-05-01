---
date: Apr 30, 2024
difficulty: intro
title: "How to create a token on Solana"
description: "Learn how to create a token on Solana."
tags:
  - quickstart
  - web3js
  - Token 2022
  - Token Extensions
  - Metaplex
  - spl
keywords:
  - tutorial
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - token
  - meta data
  - spl
  - spl token
---

In this guide you will learn step by step how to create a new token on Solana
with meta data.

## Installing Solana Tools

First we need to download Solana tools to our system. Follow this guide to
install the Solana CLI:
[Install Solana CLI](https://docs.solanalabs.com/de/cli/install#use-solanas-install-tool)

## Create folder and key pairs

Open a new terminal and create a new folder:

```bash
mkdir nice-token
cd nice-token
```

First we create a new keypair that will be the owner of our token:

```bash
solana-keygen grind --starts-with key:1
```

This will generate a key pair for you where the public address starts with
"key". Note that the more letters you add the longer it will take to generate
the key. Four is still ok, but five will already take a long time.

For me it created this key pair:

```bash
keyH23FC3gG4miLPCTTDWuD9PDX6E6V9kBk681ZnvQm.json
```

you will need to replace this with your own key pair in the following steps.
Then we set our solana config to use the keypair we just created:

```bash
solana config set --keypair keyH23FC3gG4miLPCTTDWuD9PDX6E6V9kBk681ZnvQm.json
```

From now on all commands you run in the CLI will use this keypair by default.
You can see the current configuration by running:

```bash
solana config get
```

Then we create a nice account address where our token mint will be saved:

```bash
solana-keygen grind --starts-with nic:1
```

In my case it created this key pair:
nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr.json

Make sure to replace this with your own key pair in the following steps.

We will also set the solana config to work on dev net for this example.

```bash
solana config set -ud
```

This will set the default RPC cluster to solana devnet
"https://api.devnet.solana.com". From not on all commands will be executed on
the dev net. To release your token on mainnet you will need to perform all step
from here again but set the cluster to mainnet using -um instead of -ud.

## Fund the account

For solana dev net we will just be able to get some free SOL from the faucet or
from one of these
[other methods](https://solana.com/de/developers/guides/getstarted/solana-token-airdrop-and-faucets):

```bash
solana airdrop 2
```

For mainnet you will need to fund the account with SOL. You can buy SOL token in
many places like centralized exchanges or decentralized exchanges. You can find
the address of your account by looking at the file name of the keypair that
starts with "key" in your nice-token folder or by running:

```bash
solana address
```

## Creating the token mint

Solana does not work with floating point numbers internally. This is why every
token has an actual max supply represented by an unsigned integer of size 64
bites called a u64. The maximum number results to 2^64 – 1
= 18446744073709551615. You can however set a decimal point for the token. For
example
[USDC](https://explorer.solana.com/address/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)
has 6 decimals which means that each USDC can be split into one millions of a
USDC.

Depending on your needs you can configure different decimals for your token by
adding the `--decimals 6` flag to the command. If you do not set it the default
is 9.

Now we will create the token mint with additional meta data extension. By adding
our grinded keypair at the end we will actually use that address as the mint for
our new token.

```bash
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
 --enable-metadata nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr.json
```

This is also where you would be able to add additional
[token extensions](https://solana.com/developers/guides/token-extensions/getting-started)
to your token to have extra functionality. Things like transfer fees for
example. You will not be able to add more extensions to your token mint after
you created it.

## Create and upload meta data

Next we will create the off chain meta data for our token. This is usually a
.json file in the following format. We will follow the meta plex meta data
standard here. But there are also other standards out there.

```json
{
  "name": "",
  "symbol": "",
  "uri": ""
}
```

The meta data we will save in a decentralized storage solution.

First we need to create an icon for the token. I used ChatGPT to generate an
image and then uploaded it to a decentralized storage solution.

There are many ways on how you can store the off chain meta data. You can for
examples just upload it to github, or any other cloud storage provider. It just
needs to be publicly accessible.

Following I will show you different options in no particular order.

| Service              | URL                                                      | Details                                                                                             |
| -------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Web3 Storage         | [web3.storage](web3.storage)                             | Requires signing up for a free plan; first 5Gb are free; easy to use.                               |
| Akord                | [Akord](https://akord.com/)                              | Uploads to arweave; free without signup for 100Mb; uploads can take a while.                        |
| GitHub               | [GitHub](https://github.com)                             | Create a new repo, upload files, use the RAW URL format: https://raw.githubusercontent.com/xxxxxxx. |
| ShadowDrive          | [ShadowDrive](https://www.shdwdrive.com/)                | This is a solana native storage solution. Did not work at the time of writing.                      |
| Metaplex Metaboss    | [Metaplex Metaboss](https://metaplex.com/)               | -                                                                                                   |
| Google Cloud Storage | [Google Cloud Storage](https://cloud.google.com/storage) | -                                                                                                   |
| Amazon               | [Amazon](https://aws.amazon.com/)                        | -                                                                                                   |

(If you are a provider of decentralized storage solutions and want to be listed
here please just open a PR.)

For this example we will use Web3 Storage. It requires to sign up for a free
plan though but the first 5Gb are free and its very easy to use.

- [web3.storage](web3.storage)

Once we generated and uploaded the icon to a decentralized storage solution we
end up with a link to that icon. We will use that link in the meta data file.

You will end up with some link similar to this one which should directly open
your icon: https://arweave.net/itK2SKyCDAdBl-t9sHDQzeP4Roh3UgMaqnKImRXSrvo

Create a new file called metadata.json in the nice-token folder and add the
following:

```json
{
  "name": "Nice Token",
  "symbol": "NICE",
  "description": "Just a nice token.",
  "uri": "https://arweave.net/itK2SKyCDAdBl-t9sHDQzeP4Roh3UgMaqnKImRXSrvo"
}
```

Then also upload this file to the storage provider of your choice. You will end
up with a new link that now represents the meta data of your token. Make sure
you copy the link directly to the file and not to the folder or a preview page.

You should end up with a link similar to this one:

https://bafybeidfm65jzvz4zeesxp6ybinkitvpd27klk6yspstrtw5fuy5w27lkq.ipfs.w3s.link/metadata.json

Now we are ready to add this meta data to our token.

## Add meta data

Now we will initialize the meta data for our token with the meta data we just
created and uploaded.

```bash
spl-token initialize-metadata nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr \
'Nice Token‘ NICE \
https://bafybeidfm65jzvz4zeesxp6ybinkitvpd27klk6yspstrtw5fuy5w27lkq.ipfs.w3s.link/metadata.json
```

Congratulation you created a token with meta data! You can look at your token in
one of the Solana block explorers:

- [SolanaFm](https://solana.fm/address/nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr)
- [SolScan](https://solscan.io/token/nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr)
- [Solana Explorer](https://explorer.solana.com/address/nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr?cluster=devnet)
  etc.

Make sure your explorer is set to devnet if you are working on dev net and
replace the address to your mint address starting with "nic".

## Update meta data

At any point as long as you do not set the update authority to null you will
still be able to do changes the meta data of this token.

Let's say you want for example update the uri field of the token. You can do
this by running the following command:

```bash
spl-token update-metadata nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr \
uri https://bafybeidfm65jzvz4zeesxp6ybinkitvpd27klk6yspstrtw5fuy5w27lkq.ipfs.w3s.link/metadata.json
```

You can also add additional meta data to your token as a key-value pair like
this:

```bash
spl-token update-metadata nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr niceness 100%
```

This is more useful for NFTs but you can also use it for fungible tokens.

## Mint tokens

Now that the token is completely set up we can mint some tokens. Let's mint 100.

First we need to create a token account to hold the tokens for our token mint:

```bash
spl-token create-account nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr
```

This will create a new token account for the account that is currently set in
the solana config. You can also specify a different account by adding the
address at the end of the command.

And now we can finally mint some tokens into that token account:

```bash
spl-token mint nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr 100
```

Now you can also send the token to your friends like so for example:

```bash
spl-token transfer nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr 10 \
friendAddress --fund-recipient
```

"--fund-recipient" means that you will pay to create the token account for your
friend.

## Creating token markets

Now that your token is created you probably want to create a market and a pool
for it. There are many ways to create a market for your token. Here are some
possible solutions:

- [Radium](https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool)
- [Orca](https://docs.orca.so/orca-for-liquidity-providers/classic-community-listing/creating-a-pool-tutorial)
- [Meteora](https://docs.meteora.ag/liquidity-primitives/dynamic-amm-pools/permissionless-dynamic-pools)
- [Mango Markets](https://docs.mango.markets/)

If you have your own token market platform feel free to open a PR to add it
here.

## Community tools to create tokens

Use these at your own risk. In general it is recommended to never give out any
private keys and using external tools may expose you to security risks and give
the tool creators control over your token. These make it easy to create token,
but can also come with fees.

- [Smithii](https://smithii.io/)
- [Smithii Tutorial](https://smithii.io/en/create-liquidity-pool-solana/)
- [Fluxbeam](https://fluxbeam.xyz/)
- [Fluxbeam Tutorial](https://medium.com/@Fluxbeam/how-to-create-a-token-using-fluxbeam-and-solana-token-extensions-9d1aaa8d98ea)

If you have your own token launch platform feel free to open a PR to add it
here.

## Further reads about tokens

- [Token extensions](https://solana.com/developers/guides/token-extensions/getting-started)
- [External: a16z Rules on Token Launches](https://a16zcrypto.com/posts/article/5-rules-for-token-launches/)
- [External: a16z Risks](https://a16zcrypto.com/posts/article/navigating-token-launch-risks/)
- [External: a16z Getting Ready](https://a16zcrypto.com/posts/article/getting-ready-to-launch-a-token/)
