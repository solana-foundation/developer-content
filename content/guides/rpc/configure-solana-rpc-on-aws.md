---
date: Oct 26, 2023
difficulty: intermediate
title: "Configure and run a Solana RPC on AWS"
description:
  "Running Solana nodes on AWS can help to reduce operational costs and improve
  reliability of your validators or RPC services"
tags:
  - rpc
  - infrastructure
keywords:
  - aws
  - amazon
  - node runner
---

# Solana on AWS

Running Solana nodes on AWS can help to reduce operational costs and improve
reliability of your validators or RPC services. In this guide we will review the
major use cases for running self-managed Solana nodes, understand their
infrastructure requirements, and costs considerations.

## Solana node configurations on AWS

There are four major use cases for running Solana nodes: Consensus, "Base” RPC
node, “Extended” RPC node, and history node. Depending on the use case, you
start your ‘solana-validator’ process with different set of parameters and might
use different infrastructure configurations. Let’s review them.

### Consensus node

Consensus nodes on both Mainnet Beta and testnets
[support proof-of-stake consensus](https://solana.com/staking) and are run by
operators to either stake themselves or to accept delegated stakes from other
holders of Solana tokens (SOL). At the time of writing (September 2023) the
configuration on AWS with good cost/performance ratio is
[r6a.8xlarge EC2 instance type](https://aws.amazon.com/ec2/instance-types/r6a/)
with three [EBS gp3 volumes](https://aws.amazon.com/ebs/general-purpose/): one
for root volume and two storing Accounts and Data separately:

- Root volume: EBS gp3 500 GB, 3K IOPS, 250 MB/s throughput,
- Accounts volume: EBS gp3 500GB, 5K IOPS, 700 MB/s throughput,
- Data volume: EBS gp3 2TB, 10K IOPS, 700 MB/s throughput.

To set up new validator node, you first need to generate cryptographic keys that
will be used in the process. After the keys are generated with the standard
`solana-keygen` tool on the EC2 instance you can keep a backup copy of the key
pair in
[AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html).

Based on amount you have at stake, you can estimate with
[community-developed calculators](https://www.stakingrewards.com/asset/solana)
the amount of profit your validator node can generate and then calculate the
cost of the configuration with [AWS calculator](https://calculator.aws/#/). Also
note that, depending on the amount at stake, your validator node will generate
between 150 TB to 300 TB of data transfer out to the Internet per month, so talk
to your AWS account manager about potential cost optimization.

- To run a single Consensus node on AWS, use the
  [Solana Node Runner CDK application]([https://github.com/aws-samples/aws-blockchain-node-runners/tree/solana/lib/solana](https://github.com/aws-samples/aws-blockchain-node-runners/tree/main/lib/solana))
  in
  [AWS Blockchain Node Runners](https://aws-samples.github.io/aws-blockchain-node-runners/)
  and use
  [sample config for Consensus node](https://github.com/aws-samples/aws-blockchain-node-runners/blob/main/lib/solana/sample-configs/.env-sample-consensus).

### Base RPC nodes

Base RPC nodes (or just "RPC nodes") can be used by your application to perform
all RPC calls, except those that trigger scan operation to the entire account
set, like
[getProgramAccounts](https://docs.solana.com/api/http#getprogramaccounts) and
[SPL-token-specific requests](https://docs.solana.com/api/http#gettokenaccountsbydelegate):
`getTokenAccountsByDelegate`, `getTokenAccountBalance`,
`getTokenAccountsByOwner`, `getTokenLargestAccounts`, and `getTokenSupply`.
These node types can use the same infrastructure as the consensus nodes, but
instead of validating transactions, it will expose HTTP and WebSocket endpoints
for your application to interact with the node trough JSON RPC API and RPC
PubSub respectively. On AWS you can use the same as with consensus node
`r6a.8xlarge` EC2 instance type the same three EBS gp3 volumes:

- Root volume: EBS gp3 500 GB, 3K IOPS, 250 MB/s throughput,
- Accounts volume: EBS gp3 500GB, 5K IOPS, 700 MB/s throughput,
- Data volume: EBS gp3 2TB, 10K IOPS, 700 MB/s throughput.

Data transfer costs for this node can vary depending on whether you expose the
RPC endpoints to the Internet (generates more traffic to the Internet) or
consume it with the same AWS Availability Zone (will cost you nothing). If you
are not exposing the RPC interface for external consumption, then your node will
generate about 13-15 TB of outgoing data per month per node. It is less than
Consensus nodes, but can still be sufficient and better be discussed with your
AWS account manager.

- To run Base RPC node on AWS, use the
  [Solana Node Runner CDK application]([https://github.com/aws-samples/aws-blockchain-node-runners/tree/solana/lib/solana](https://github.com/aws-samples/aws-blockchain-node-runners/tree/main/lib/solana))
  in
  [AWS Blockchain Node Runners](https://aws-samples.github.io/aws-blockchain-node-runners/)
  and use
  [sample config for RPC node](https://github.com/aws-samples/aws-blockchain-node-runners/blob/main/lib/solana/sample-configs/.env-sample-baserpc).
  You can use both Single-node and Highly Available-node setup.

### Extended RPC nodes with secondary indexes

RPC nodes with secondary indexes allow you to call "extended" RPC functions like
mentioned above. To use them you need to enable extra indexes on your RPC node,
which requires more hardware. At the time of writing (September 2023) it is
recommended to use at least 1 TB or RAM with NVMe discs, or, on AWS an instance
like `x2idn.16xlarge` which is also equipped with a physically-attached NVMe SSD
[Instance Store volume](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/InstanceStorage.html).
The storage configurations looks like this:

- Root volume: EBS gp3 500 GB, 3K IOPS, 250 MB/s throughput,
- Accounts volume: Instance store (comes with the `x2idn.16xlarge` instance)
  1.9TB,
- Data volume: EBS gp3 2TB, 10K IOPS, 700 MB/s throughput.

As with the RPC nodes, data transfer amount may vary and the estimated amount is
15 TB of outgoing data per month per node.

- To run Extended RPC nodes on AWS, use the
  [Solana Node Runner CDK application]([https://github.com/aws-samples/aws-blockchain-node-runners/tree/solana/lib/solana](https://github.com/aws-samples/aws-blockchain-node-runners/tree/main/lib/solana))
  in
  [AWS Blockchain Node Runners](https://aws-samples.github.io/aws-blockchain-node-runners/)
  and use
  [sample config for RPC with secondary indexes node](https://github.com/aws-samples/aws-blockchain-node-runners/blob/main/lib/solana/sample-configs/.env-sample-extendedrpc).
  You can use both Single-node and Highly Available-node setup.

### History nodes

History nodes are not yet available on AWS because or dependency on the GCP's
BigTable. But there is some awesome work that Solana community is doing to make
this data available in cloud-agnostic way, so stay tuned.

## Cost Optimization

To optimize the cost you can use either
[Compute Savings Plan for EC2](https://aws.amazon.com/savingsplans/compute-pricing/)
or talk to one of the AWS partners like [Antimetal](https://www.antimetal.com/)
or [Zesty](https://zesty.co/). We don’t recommend using Spot instances for
Solana nodes because they can be terminated with a short notice and a similar
instance might not be immediately available for you even with on-demand pricing.
