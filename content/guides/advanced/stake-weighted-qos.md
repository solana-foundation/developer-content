---
featured: false
date: 2024-03-20T00:00:00Z
difficulty: intermediate
seoTitle: "Stake-weighted Quality of Service on Solana"
title: "A Guide to Stake-weighted Quality of Service on Solana"
description:
  "Stake-weighed QoS (Quality-of-Service) is an implementation feature which,
  when enabled, allows leaders (block producers) to identify and prioritize
  transactions proxied through a staked validator as an additional sybil
  resistance mechanism."
tags:
  - rust
keywords:
  - guide
  - stake-weighted QoS
  - Quality-of-Service
  - intro to solana development
  - blockchain developer
  - blockchain tutorial
  - web3 developer
altRoutes:
  - /developers/guides/advanced/stake-weighted-qos-guide
---

## What is Stake-weighted Quality of Service (QoS)?

Stake-weighed QoS (Quality-of-Service) is an implementation feature which, when
enabled, allows leaders (block producers) to identify and prioritize
transactions proxied through a staked validator as an additional sybil
resistance mechanism. Given that Solana is a proof of stake network, it is
natural to extend the utility of stake-weighting to transaction quality of
service. Under this model, a validator with 0.5% stake would have the right to
transmit up to 0.5% of the packets to the leader and will be capable of
resisting sybil attacks from the rest of the network.

Operators who enable this feature will improve the security and performance of
the network by reducing the likelihood that low-or-no-stake (lower quality)
validators are able to “drown out” transactions emanating from higher-quality
(higher stake) validators (aka enhanced Sybil Resistance).

One potential benefit of implementing Stake-weighted QoS could be realized if
certain agreements between Validators and RPC nodes are in place. RPC nodes may
land more transactions in blocks by agreeing to peer with Validators, and
Validators may sell more capacity to RPC nodes. These agreements must be made
directly between RPC operators and Validators and include the implementation of
the steps captured below in this doc to complete the peering.

## Who does Stake-weighted QoS benefit?

Commercial RPC infrastructure operators and exchanges will likely be among the
major beneficiaries of Stake-weighted QoS. RPC operators will be in an ideal
position to acquire or negotiate deals with staked validators enabling them to
achieve an improved percentage of transactions landed in blocks overall.
Exchanges (or other entities) who host their own validator nodes and RPC nodes
on the same infrastructure will be able to enable the feature internally,
comfortable that the RPC nodes running on their own infrastructure can be
trusted.

## Why is Stake-weighted QoS important?

With Stake-weighted QoS enabled, a validator holding 1% stake will have the
right to transmit up to 1% of the packets to the leader. In this way, validators
with higher stake are guaranteed to receive higher quality of service which
prevents lower-quality validator (with less at stake) from maliciously flooding
out these transactions, increasing overall Sybil Resistance.

Put another way, imagine what the world would be like if cars with one passenger
could ride in the carpool lane uninhibited. Soon the carpool lane, which is
designed to move more human beings using the same stretch of highway, would be
rendered useless. The overall functionality of the highway would be impaired and
fewer commuters would be able to reach their destinations. This effect is
similar to what happens when low-staked validators are allowed to submit
transactions to the Leader with the same priority as high-staked validators.

## Who should enable Stake-weighted QoS?

Stake-weighted QoS should be enabled by Validator nodes paired with highly
trusted RPC nodes. This is helpful in situations such as running an RPC and
Validator in the same infrastructure where the trust level is already high.
Stake-weighted QoS works best for high trust configurations and requires the
Validator and RPC to come to an agreement in advance prior to enabling the
feature. It is strongly recommended that Validators not attempt to enable
Stake-weighted QoS with untrusted RPCs.

Stake should be applied to block producing validators. It is not necessary,
recommended or effective to delegate stake to RPC servers.

## How does Stake-weighted QoS work?

With Stake-weighted QoS enabled, RPC nodes paired with a validator gain a
“virtual” stake in regards to how that leader treats inbound TPU (Transaction
Processing Unit) traffic from that RPC node, something which is not normally
possible. By definition, RPC nodes are “unstaked” and “non-voting” aka
“non-consensus” and are unable to access the benefits of prioritized
transactions by way of staking in the same way that consensus nodes do. How do
you use Stake-weighted QoS to land transactions? Enabling Stake-weighted QoS
requires configuring a validator node and an RPC node to form a trusted peer
relationship. This involves separate configuration steps for both the validator
node and the RPC node listed below. Operators wanting to enable Stake-weighted
QoS will need the following before starting:

A validator with stake running on the network AND A RPC peered to the validator

Stake-weighted QoS will not work unless BOTH sides are properly configured.

### Configuring the Validator node

On the validator, you'll have to enable
`--staked-nodes-overrides /path/to/overrides.yml`. The
`--staked-nodes-overrides` flag helps the validator prioritize transactions
being sent from known sources to apply stake to their transactions. This can
help a validator prioritize certain transactions over known hosts over others,
enabling the usage of Stake-weighted QoS with RPCs. RPCs should not be staked in
any way.

Today, Stake-weighted QoS gives a stake-weighted priority to 80% of a leader's
TPU capacity. However, there are configuration options which can be used to
virtually assign different stake-weights to TPU peers, including assigning
unstaked peers virtual stake.

The overrides file for `--staked-nodes-overrides` looks like this:

```yml
staked_map_id:
  pubkey1: 1000000000000000
  pubkey2: 4000000000000000
```

`staked_map_id` contains a map of identity public key to the stake amount in
lamports to apply to each RPC. When set, the validator will prioritize QUIC
connections with the RPC found at that identity publicKey, assigning an amount
of stake to their transactions. The 80% of the leader's TPU capacity will be
split proportionally based on the lamport amounts specified in the
`staked-nodes-overrides` file and existing cluster stake.

### Configuring the RPC node

On the RPC you will have to use `--rpc-send-transaction-tpu-peer` to forward
transactions to a specific leader. The exact usage would be
`--rpc-send-transaction-tpu-peer HOST:PORT`. The Host is the ip address of the
leader you have the `staked-nodes-overrides` enabled on and the Port is the QUIC
TPU port of that host. The QUIC TPU port for a leader can be identified by
making an RPC call to [getClusterNodes](/docs/rpc/http/getClusterNodes.mdx).

The peering would looking like the following:

![Diagram of RPCs peering with Validator for Stake-weighted Qos](/assets/guides/stake-weighted-qos-guide/peered-RPCs-guide.png)

## Conclusion

Stake-weighted QoS is an optional feature which arrived in v1.14 of the Solana
client, now known as Agave. Agave is a forked version of the Solana Labs client
which has become the active branch used by the Anza team, a spin out
organization composed of the former Solana Labs engineering team.

The Stake-weighted QoS feature will most likely be useful for RPC infrastructure
operators who are in position to establish trusted relationships with staked
node operators. It will also be useful for Exchanges, who run both RPC nodes and
validator nodes and are able to establish high trust connections internally.
