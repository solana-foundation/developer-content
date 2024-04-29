---
date: Apr 29, 2024
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

Then we set our solana config to use the keypair we just created:

```bash
solana config set --keypair key-keypair.json
```

From now on all commands you run in the CLI will use this keypair by default.
You can see the current configuration by running:

```bash
solana config get
```

Then we create a nice account address where our token mint will be saved:

```bash
solana-keygen grind --starts-with nice:1
```

We will also set the solana config to work on dev net for this example. (Use
`-um` for mainnet-beta)

```bash
solana config set -ud
```

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
token has an actually max supply represented by an unsigned integer of size 64
bites called a u64. The maximum number results to 2^64 – 1
= 18446744073709551615. You can however set a decimal point for the token. For
example
[USDC](https://explorer.solana.com/address/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)
has 6 decimals which means that each USDC can be split into one millions of a
USDC.

Depending on your needs you can configure different decimals for your token by
adding the `--decimals` flag to the command. The default is 9.

Now we will create the token mint with additional meta data extension. By adding
our grinded keypair at the end we will actually use that address as the mint for
our new token.

```bash
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-metadata nice-keypair.json
```

## Create and upload meta data

Next we will create the off chain meta data for our token. This is usually a
.json file in the following format. We will follow the meta plex meta data
standard here. But there are also other standards out there.

The meta data we will save in a decentralized storage solution.

First we need to create an icon for out token. I used ChatGPT to generate an
image and then uploaded it to a decentralized storage solution.

There are many ways on how you can store the off chain meta data. You can for
examples just upload it to github, or any other cloud storage provider. It just
needs to be publicly accessible.

Some external tools which lets you easily upload meta data are: For this example
we will use Web3 Storage. It requires to sign up for a free plan though but the
first 5Gb are free and its very easy to use.

- [web3.storage](web3.storage)

Akord uploads to arweave and is free without signup for 100Mb but the upload to
arweave can take a while.

- [Akord](https://akord.com/)

Other possible options are:

If you are using Github, just make a new repo, upload the json file and image,
copy the RAW url. URL should look like
https://raw.githubusercontent.com/xxxxxxx.

- [Github](https://github.com)
- [ShadowDrive](https://www.shdwdrive.com/) (Did not work for me at time of
  writing)
- [Metaplex Metaboss](https://metaplex.com/)
- [Google cloud storage](https://cloud.google.com/storage)
- [Amazon](https://aws.amazon.com/)
- etc.

(If you are a provider of decentralized storage solutions and want to be listed
here please just open a PR.)

Once we generated and uploaded the icon to a decentralized storage solution we
end up with a link to that icon. We will use that link in the meta data file.

Create a new file called metadata.json in the nice-token folder and add the
following:

````json
{
  "name": "Nice Token",
  "symbol": "NICE",
  "uri": "https://arweave.net/VO5ZoK7Nft6e7_Qs1SbK_TdOXeGMPdkpi4sH9Rwdm5Q"
}
```

Then also upload this file to the storage provider of your choice.
You will end up with a new link that now represents the meta data of your token.
Make sure you copy the link directly to the file and not to the folder or a preview page.

Now we are ready to add this meta data for our token.

## Add meta data

Now we will initialize the meta data for our token with the meta data we just created and uploaded.

```bash
spl-token initialize-metadata nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr 'Nice Token‘ NICE https://bafybeidfm65jzvz4zeesxp6ybinkitvpd27klk6yspstrtw5fuy5w27lkq.ipfs.w3s.link/metadata.json
```

Gratulations you created a token with meta data.
You can look at your token in one of the Solana block explorers:

[SolanaFm](https://solana.fm/address/nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr)
[SolScan](https://solscan.io/token/nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr)
[Solana Explorer](https://explorer.solana.com/address/nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr?cluster=devnet)
etc.

Make sure your explorer is set to devnet if you are working on dev net.

## Update meta data

At any point as long as you do not set the update authority to null you will still be able to do changes the meta data of this token.

Lets say you want for example add new meta data to the token. You can do this by running the following command:

```bash
spl-token initialize-metadata nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr uri https://bafybeidfm65jzvz4zeesxp6ybinkitvpd27klk6yspstrtw5fuy5w27lkq.ipfs.w3s.link/metadata.json
```

You can also add additional meta data to your token like this:

```bash
spl-token update-metadata nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr niceness 100%
```

## Mint tokens

Now that the token is completely set up we can mint some tokens. Lets mint 100.

First we need to create a token account to hold the tokens for out token mint:

```bash
spl-token create-account nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr
```

This will create a new token account for the account that is currently set in the solana config. You can also specify a different account by adding the address at the end of the command.

And now we can finally mint some tokens into that token account:

```bash
spl-token mint nicypxn7W5XRdG3jsNopVTgUvNHHmppUZbr7YHG9nfr 100
```

## Creating token markets

Now that your token is created you probably want to create a market and a pool for it.
There are many ways to create a market for your token. Here are some possible solutions:

[Radium](https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool)
[Orca](https://docs.orca.so/orca-for-liquidity-providers/classic-community-listing/creating-a-pool-tutorial)
[Meteora](https://docs.meteora.ag/liquidity-primitives/dynamic-amm-pools/permissionless-dynamic-pools)
[Mango Markets](https://docs.mango.markets/)

## Community tools to create tokens

Use these at your own risk. In general it is recommended to never give out any private keys and using external tools may expose you to security risks and give the tool creators control over your token. These make it easy to create token, but can also come with fees.

[Smithii](https://smithii.io/)
[Smithii Tutorial](https://smithii.io/en/create-liquidity-pool-solana/)
[Fluxbeam](https://fluxbeam.xyz/)
[Fluxbeam Tutorial](https://medium.com/@Fluxbeam/how-to-create-a-token-using-fluxbeam-and-solana-token-extensions-9d1aaa8d98ea)

If you have your own token launch plattform feel free to open a PR to add it here.

## Further reads about tokens

[Rules on Token Launches](https://a16zcrypto.com/posts/article/5-rules-for-token-launches/)
[Risks](https://a16zcrypto.com/posts/article/navigating-token-launch-risks/)
[Getting Ready](https://a16zcrypto.com/posts/article/getting-ready-to-launch-a-token/)
````
