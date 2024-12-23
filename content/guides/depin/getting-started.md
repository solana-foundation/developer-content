---
featured: false
featuredPriority: 1
date: 2024-12-02T00:00:00Z
difficulty: beginner
seoTitle: "DePIN Quickstart Guide"
title: "DePIN Quickstart Guide"
description:
  "While each DePIN network has a unique product focus, most DePIN networks
  utilize Solana for a common set of use-cases. This guide is meant to help
  builders get oriented to common onchain DePIN use-cases."
keywords:
  - DePIN
  - token
  - governance
tags:
  - depin
  - governance
  - zk compression
---

DePIN (Decentralized Physical Infrastructure Network) refers to blockchain-based
networks that incentivize the deployment, operation, and sharing of real-world
physical infrastructure through decentralized mechanisms. These networks
leverage tokens to reward participants for contributing to and maintaining the
infrastructure, creating a decentralized alternative to traditional centralized
systems. Examples include wireless, content delivery, and mapping networks.

For instance, Helium creates a wireless network more cheaply than traditional
carriers by enabling individuals to deploy and maintain network hotspots. This
approach eliminates the need for centralized infrastructure investments and
operational costs, allowing the network to scale more cost-effectively.

While each DePIN network has a unique product focus, most DePIN networks utilize
Solana for a common set of use cases. This guide is meant to help builders get
oriented to these common on-chain DePIN use cases. Topics covered include:

- [Minting and Managing a Token](#minting-and-managing-a-token)
- [Rewards Distribution](#rewards-distribution)
- [Proof of Contribution](#proof-of-contribution)
- [Governance](#governance)

## Minting and Managing a Token

### Token Minting

When minting a token on Solana, there are two token programs to choose from: the
[Token program](https://spl.solana.com/token) or the
[Token22 program](https://spl.solana.com/token-2022). There are tradeoffs to
consider (discussed
[here](https://solana.stackexchange.com/questions/9205/what-is-the-advantage-of-using-the-token22-token-extensions-program-over-the-old)).
The recommended selection between the two options ultimately reduces to whether
the features in the token extensions program would be of use to the application.

### Token Listing

In order to have your token appear in explorers, decentralized exchanges, and
other ecosystem token lists,
[getting the token verified through Jupiter Verification](https://station.jup.ag/guides/general/get-your-token-on-jupiter)
is recommended.

### Modeling Token Distribution

For DePIN teams looking to optimize the way they allocate their token across
various needs and stakeholders (rewards for participating / supplying network
resources, private or public token sales etc.), tools like
[Forgd](https://www.forgd.com/) can be used to model out and refine token
distribution strategies.

### Token Management

Most teams utilize [Squads](https://squads.so/) for their onchain treasury
management, and leverage features such as multi-sig and time-based lockups.

## Rewards Distribution

There are two common paths for rewards distributions: Merkle claims and ZK
compression. Each of these optimize the cost of distributing a potentially small
value of tokens to a large set of users by allowing the application to do so in
a single transaction per claim period.

### Merkle Claims

Rewards can be distributed using a Merkle tree structure, allowing for efficient
batch processing of claims. This approach is used to minimize the number of
transactions on the blockchain by allowing users to claim their rewards based on
a published Merkle root.

The application constructs a Merkle tree on a regular basis and publishes the
root onchain. Each leaf node represents a recipient’s rewards.

In order for users to claim their rewards, they generate a Merkle proof that
demonstrates a particular leaf is part of the published Merkle root. Once their
claim is verified, the rewards are distributed to the user’s wallet.

See
[example code](https://gist.github.com/lanvidr/88a594da06ba867bf8201fe8c6331dc0)
and
[Jupiter’s Merkle distributor](https://github.com/jup-ag/merkle-distributor-sdk)
for an additional reference.

#### Automatic Distribution

An alternative to having users proactively claim rewards is automating rewards
distribution. On a regular basis, this “rewards crank” fetches rewards for an
associated set of users by querying and constructing transactions to distribute
rewards to the specified accounts. Merkle tree updates can be posted by the
automated process, allowing for the reward distribution mechanism to remain
permissionless.

### ZK Compression

For networks that anticipate needing to distribute rewards to tens of thousands
(or more) of nodes, participants, or contributors, a newer approach to rewards
distribution is to use [ZK compression](https://www.zkcompression.com/). Instead
of regular accounts, compressed accounts are generated for reward recipients,
minimizing the state and [rent costs](/docs/core/fees.md#rent) associated with
account creation.

Implementing ZK compression is often cheaper in terms of storage costs. However,
because it is a relatively new feature, the level of ecosystem support and
tooling is not yet as extensive.

See
[example code](https://gist.github.com/lanvidr/4595f7b02236ffb2a3fb3ce9347ca044).

### Cost analysis

Let's estimate the cost of distributing rewards using both the Merkle tree
approach and the ZK compression option. We'll consider transaction fees, rent
costs, and storage costs.

In both approaches, updating the rewards per claim period requires a single
transaction by the application, so the cost difference is minimal, as it doesn’t
scale per the number of users. Both strategies require one transaction per user
to claim their rewards.

ZK compression is more cost-effective in storage costs, due to the reduced
storage requirements of compressed data. Here is a hypothetical cost analysis to
compare the storage costs.

If we assume a reward distribution to 10,000 users, with an average reward
amount per user of 100 tokens, and the transaction fee on Solana to be 0.000007
SOL (7,000 lamports):

Storage Costs using a Merkle tree distribution strategy:

- The Merkle tree requires storing the leaf nodes and the internal nodes
  - Leaf Nodes: 10,000 \* 32 bytes = 320,000 bytes
  - Internal Nodes: (2^14 - 1) \* 32 bytes = 524,256 bytes
  - Total Storage Cost: (320,000 + 524,256) \* 0.00000348 SOL/byte (per epoch) =
    2.94 SOL
- Total Cost (Merkle Tree): 0.050005 SOL + 0.00007323 SOL + 2.94 SOL = 2.99 SOL

Storage Costs using a ZK compression distribution strategy:

- Compressed Token Account: The compressed token account stores the compressed
  reward data
  - Compressed Data Size: Assuming a compression ratio of 50%, the total
    compressed data size would be approximately 500 KB
- Total Storage Cost: 500 \* 1024 \* 0.00000348 SOL/byte (per epoch) = 1.78 SOL
- Total Cost (ZK Compression): 0.050005 SOL + 0.00000223 SOL + 1.78 SOL = 1.83
  SOL

  We can extrapolate this across different numbers of reward distributions.

| Number of Distributions | Merkle Tree Storage Cost (SOL) | ZK Compression Storage Cost (SOL) |
| ----------------------- | ------------------------------ | --------------------------------- |
| 1,000                   | 0.06                           | 0.03                              |
| 10,000                  | 0.58                           | 0.29                              |
| 100,000                 | 5.80                           | 2.90                              |
| 1,000,000               | 58.00                          | 29.00                             |
| 5,000,000               | 290.00                         | 145.00                            |

## Proof of Contribution

DePIN networks generally need a way to prove the contribution from network
participants. The application needs a method of verifying that participants have
provided the resource in question honestly and consistently.

Reporting the contributions through Solana makes it possible to use the
blockchain’s inherent security properties to enable the secure validation of the
contribution.

While almost all DePIN networks require proof-of-contribution in some form, the
exact mechanism can vary significantly from protocol to protocol. A number of
teams are building tooling to help DePIN projects develop their proof of
contribution models:
[Proof of Location by Witness Chain](https://docs.witnesschain.com/depin-coordination-layer/proof-of-location-testnet/introduction),
[Proof of Coverage by Helium](https://docs.helium.com/iot/proof-of-coverage).

## Governance

DePIN protocols tend to follow a path of measured, gradual decentralization that
shifts decision-making for the protocol to onchain governance by token holders
over time. This could take the form of a social framework like a
[DAO](https://www.realms.today/) or leverage
[liquid restaking](https://docs.fragmetric.xyz/fragsol/).

For examples, see
[Modular Governance by Helium](https://docs.helium.com/governance/staking-with-helium-vote/)
or
[Network Governance by Hivemapper](https://docs.hivemapper.com/welcome/network-governance).

## Migrations

If you are a DePIN builder who has historically only been familiar with building
on EVM, not to worry! A number of large DePIN teams who began on EVM chains have
successfully migrated to Solana (see Render, Geodnet, and Xnet, amongst others).
There are
[specific resources to help developers make the transition from EVM to SVM](https://solana.com/developers/evm-to-svm).
Bridge infrastructure like
[Wormhole’s NTT](https://wormhole.com/products/native-token-transfers)
streamline the process of shifting your tokens to Solana.
