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

While each DePIN network has a unique product focus, most DePIN networks utilize
Solana for a common set of use-cases. This guide is meant to help builders get
oriented to these common onchain DePIN use-cases:

- Minting and Managing a Token
- Rewards Distribution
- Proof of Contribution
- Governance

<Callout type="note">
This guide is serves as a general overview. There are many nuances beyond what
is covered here to consider for your specific network and application.
</Callout>

## Minting and Managing a Token

### Token Minting

When minting a token on Solana, there are two token programs to choose from,
[the Token program](https://spl.solana.com/token) or
[the Token22 program](https://spl.solana.com/token-2022). While there are
tradeoffs to consider, discussed
[here](https://solana.stackexchange.com/questions/9205/what-is-the-advantage-of-using-the-token22-token-extensions-program-over-the-old),
to date, most DePIN teams have elected to use
[the Token program](https://spl.solana.com/token).

### Token Listing

In order to have your token appear in explorers, decentralized exchanges, and
other ecosystem token lists,
[getting the token verified through Jupiter Verification](https://station.jup.ag/guides/general/get-your-token-on-jupiter)
is recommended.

### Modeling Token Distribution

For DePIN teams looking to optimize the way they allocate their token across
various needs and stakeholders (rewards for participating / supplying network
resources, private or public tokens ales etc.), tools like
[Forgd](https://www.forgd.com/) can be used to model out and refine token
distribution strategies.

### Token Management

Most teams utilize [Squads](https://squads.so/) for their on-chain treasury
management, also leveraging their multisig feature.

## Rewards Distribution

There are two common paths for rewards distributions. Each of these optimize the
cost of distributing a potentially small value of tokens to a large set of users
by allowing the application to do so in a single transaction per claim period.

### Merkel Claims

Rewards can be distributed using a Merkle tree structure, allowing for efficient
batch processing of claims. This approach is used to minimize the number of
transactions on the blockchain by allowing users to claim their rewards based on
a published Merkle root.

The application constructs a Merkel tree on a regular basis and publishes the
root on-chain. Each leaf node represents a recipient’s rewards.

In order for users to claim their rewards, they generate a Merkle proof that
demonstrates a particular leaf is part of the published Merkle root. Once their
claim is verified, the rewards are distributed to the user’s wallet.

See
[example code](https://gist.github.com/catalinred/45fae83177f5dc5d0c9a8b083c0653aa),
and
[Jupiter’s merkle distributor](https://github.com/jup-ag/merkle-distributor-sdk)
as an additional reference.

#### Automatic Distribution

An alternative to having users proactively claim rewards is to have a separate
process to automate the process of distributing rewards. On a regular basis,
this “rewards crank” fetches rewards for an associated set of users by querying
and constructing transactions to distribute rewards to the specified accounts.
Merkle tree updates can be posted by the automated process, allowing the reward
distribution mechanism to remain permissionless.

### ZK Compression

For networks that anticipate needing to distribute rewards to tens of thousands
(or more) of nodes/participants/contributors, a newer approach to rewards
distribution is to use [ZK compression](https://www.zkcompression.com/). Instead
of regular accounts, compressed accounts are generated for reward recipients,
minimizing the state and rent costs associated with account creation.

Implementing ZK compression is often cheaper in terms of storage costs. However,
because is a relatively new feature, the level of ecosystem support and tooling
is not yet as extensive.

See
[example code](https://gist.github.com/catalinred/4188158779bef27c70428e171e018694).

#### Cost analysis

Let's estimate the cost of distributing rewards using both the Merkle tree
approach and the ZK compression. We'll consider transaction fees, rent costs,
and storage costs.

Transaction Fees may be higher using ZK compression due to the increased
computational resources and instructions needed. However, in both approaches,
updating the rewards per claim period requires a single transaction by the
application, so this cost difference is minimal as it doesn’t scale per the
number of users. Both strategies require one transaction per user to claim their
rewards.

ZK compression is more cost-effective in storage costs, due to the reduced
storage requirements of compressed data. Here is a hypothetical cost analysis to
compare the storage costs.

If we assume a reward distribution to 10,000 users, with an average reward
amount per user of 100 tokens, a transaction fee on Solana to be 0.000005 SOL
(5,000 lamports)

Storage Costs using a Merkle tree distribution strategy:

- The Merkle tree requires storing the leaf nodes and the internal nodes.
  - Leaf Nodes: 10,000 \* 32 bytes = 320,000 bytes
  - Internal Nodes: (2^14 - 1) \* 32 bytes = 524,256 bytes
  - Total Storage Cost: (320,000 + 524,256) \* 0.00000348 SOL/byte (per epoch) =
    2.94 SOL
- Total Cost (Merkle Tree): 0.050005 SOL + 0.00007323 SOL + 2.94 SOL = 2.99 SOL

Storage Costs using a ZK compression distribution strategy:

- Compressed Token Account: The compressed token account stores the compressed
  reward data.
  - Compressed Data Size: Assuming a compression ratio of 50%, the total
    compressed data size would be approximately 500 KB.
  - Total Storage Cost: 500 _ 1024 _ 0.00000348 SOL/byte (per epoch) = 1.78 SOL
- Total Cost (ZK Compression): 0.050005 SOL + 0.00000223 SOL + 1.78 SOL = 1.83
  SOL

## Proof of Contribution

DePIN networks generally need a way to prove the contribution that the the
nodes/contributors are being incentivized to provide. The application needs a
method of verifying that the nodes provided the resource in question, whether it
be wireless connectivity, GPU access, mapping data, geolocation data, etc., that
they are being rewarded to provide, honestly and consistently.

Having the contributions be reported through Solana allows for using the
security properties inherent to Solana in order to allow the secure validation
of contribution. For example, we can leverage Solana allowing for consensus by a
number of validators who each independently verify computations during
transaction execution. The public nature of transactions allows for transparency
that can be used to create a higher level of economic security.

While almost all DePIN networks require this proof-of-contribution in some form,
the exact mechanism can vary significantly from protocol to protocol. A number
of teams are building tooling to help DePIN projects aid in the abstraction of
this:
[Proof of Location by Witness Chain](https://docs.witnesschain.com/depin-coordination-layer/proof-of-location-testnet/introduction),
[Proof of Coverage by Helium](https://docs.helium.com/iot/proof-of-coverage).

## Governance

DePIN protocols tend to follow a path of measured, gradual decentralization that
over time shifts the decision-making around the protocol to onchain governance
by token holders. This could take the form of a social framework like a
[DAO,](https://www.realms.today/) or leverage
[liquid restaking](https://docs.fragmetric.xyz/fragsol/).

For examples, see
[Modular Governance by Helium](https://docs.helium.com/governance/staking-with-helium-vote/)
or
[Network Governance by Hivemapper](https://docs.hivemapper.com/welcome/network-governance).

## Migrations

If you are a DePIN builder who has historically only been familiar with building
on EVM, not to worry! A number of large DePIN teams who began on EVM chains have
successfully migrated to Solana (see RNDR, Geodnet, and Xnet, amongst others).
There are
[specific resources to help developers make the transition from EVM to SVM](https://solana.com/developers/evm-to-svm).
Bridge infrastructure like
[Wormhole’s NTT](https://wormhole.com/products/native-token-transfers)
streamline the process of shifting your tokens to Solana.
