---
date: 2024-03-25T00:00:00Z
difficulty: intermediate
title: "A Guide to Solana Permissioned Environments"
seoTitle: "Solana Permissioned Environments"
description:
  "Solana Permissioned Environments bring the speed and scalability of Solana
  with the regulatory and compliant control of a private blockchain. Learn how
  to deploy and integrate Solana Permissioned Environments for your
  organization."
tags:
  - permissioned environments
  - SPE
keywords:
  - tutorial
  - blockchain developer
  - blockchain tutorial
  - web3 developer
---

Solana is a high-performance blockchain that is designed to scale. While it's
mostly known for the Solana mainnet, fundamentally mainnet if just one
deployment and configuration of the adaptable Solana software stack. The
existing Solana software can be parametrized in a more controlled and
permissioned way with purpose-specific logic suitable for Enterprise use-cases.
This is where Solana Permissioned Environments (SPEs) come in.

## Why Should You Build With Solana Permissioned Environments?

While Solana's high-speed network offers exceptional performance, certain
sectors and use cases require more than a fully public, permissionless network
like Solana mainnet can provide. Solana Permissioned Environments provide a
solution, allowing organizations to establish private or semi-private
Solana-based Networks.

SPEs deliver the following differences:

- **Full Control**: Unlike mainnet, operators of SPEs have full control over the
  network's participants, infrastructure, and consensus mechanisms. They can
  define the network's validator set to ensure all network participants are
  known and meet necessary compliance standards.
- **Infrastructure Sovereignty**: Operators of SPEs can host their own nodes for
  direct control or strategically allocate node management responsibilities to
  specific partners. This enables a high degree of flexibility in shaping the
  network's physical infrastructure.
- **Adaptable Consensus**: To match the needs of a particular use case, SPEs can
  be configured with a variety of consensus mechanisms or opt for an alternative
  consensus algorithm. This adaptability is ideal when working within strict
  regulatory constraints or specific business logic.

With Solana Permissioned Environments, organizations gain the ability to
leverage the core speed and scalability of the Solana blockchain within a
framework designed explicitly for their unique business, security, and
regulatory requirements. It's a solution offering exceptional control over
participants, infrastructure, and even consensus mechanisms.

Depending on the complexity of the solution you are seeking we generally
categorize integrations in “Levels of Integration” ranging from low-tech
tokenization use-cases to complex smart contract projects.

## What are the Levels of Integration with Solana Permissioned Environments?

Solana Permissioned Environments can be integrated at various levels of
complexity, depending on the use case and requirements. To simplify adoption and
maximize flexibility, consider approaching SPE implementation through
progressive levels of integration.

Aligning these levels with an organization's goals and regulatory constraints
can help when deciding which level is most suitable for your use case. Each
level is non-exclusive, meaning you can start at a lower level and progress to
higher levels as your needs evolve.

### Level 1: Native Tokenization

The first level of integration involves issuing and managing custom tokens
representing assets or digital rights on the blockchain. This level is suitable
for organizations looking to leverage the speed and scalability of Solana for
tokenization use cases. The requirements to achieve this level of integration
are minimal, as it involves utilizing the existing
[Solana Program Library token tooling](https://spl.solana.com/token) to deploy
tokens.

### Level 2: Utilizing Existing Solana Programs

The second level of integration involves utilizing existing Solana programs to
build custom solutions on top of your Solana Permissioned Environment. These
existing programs can add complex functionality with your tokens such as escrow,
vesting, or a decentralized exchange. These integrations can further enhance the
tokenization found in level one, but does require a familiarity with the current
ecosystem and available programs. You can find many programs to use in the level
in the [Solana Program Library](https://spl.solana.com/).

### Level 3: Custom Programs

The third level of integration brings the highest level of customization for
your SPE: Custom Programs. With custom programs, you can implement tailor-made
on-chain mechanics to address highly specific business requirements or
regulatory constraints. Custom programs can help you leverage privacy features,
complex applications, and design unique consensus mechanisms. The requirements
for this level are the highest, as they require a deep understanding of Solana
development and resources.

## How do I Deploy a Solana Permissioned Environment?

Deploying a Solana Permissioned Environment can be done in a variety of ways,
depending on your organization's needs and resources. SPEs can be deployed
locally for testing and development, or within custom infrastructure. You can
also utilize some SPE providers such as [Helius](https://www.helius.dev/),
[Triton](https://triton.one/), or [Edgevana](https://www.edgevana.com/) to
deploy your SPE.

### How to Deploy a SPE Locally

#### Prerequisites

Before proceeding, ensure that Docker is installed on your system. Docker is
essential for creating a contained and controlled environment for your SPE,
facilitating ease of deployment and management. If you haven't installed Docker
yet, please follow the installation guide for your respective operating system
at the [official Docker documentation](https://docs.docker.com/get-docker/).

#### Setting Up Your SPE

The process of setting up a Solana Permissioned Environment locally involves
cloning the repository, understanding its structure, and executing the necessary
commands to get your SPE running. The repository containing all necessary
components and instructions is hosted on GitHub, managed by `monogon`. You can
find the repository [here](https://github.com/monogon-dev/solana-spe).

#### Step 1: Clone the Repository

Open your terminal and clone the `solana-spe` repository using the following Git
command:

```sh
git clone https://github.com/monogon-dev/solana-spe.git
```

Navigate to the cloned repository's directory:

```sh
cd solana-spe
```

#### Step 2: Understanding the Repository Structure

Before proceeding with the deployment, familiarize yourself with the
repository's structure by reviewing the README file. This document provides an
overview of the project, including its purpose, configuration options, and
detailed instructions for setting up your SPE.

#### Step 3: Deploying with Docker

With Docker installed and the repository cloned, you're ready to deploy your
SPE. The repository includes a Dockerfile and docker-compose files that define
the SPE's environment, ensuring a seamless setup process.

Execute the following command to build and start your SPE using Docker:

```sh
docker-compose up --build
```

This command initiates the building process of the Docker image based on the
provided Dockerfile and starts the SPE once the build is complete. The `--build`
option ensures that Docker rebuilds the image, incorporating any changes you
might have made to the configuration or Dockerfile.

#### Step 4: Verifying the Deployment

Once the Docker containers are up and running, you can verify the successful
deployment of your SPE by accessing the Solana CLI or any web interface provided
for interaction with the SPE. The README file in the repository should offer
guidance on performing basic operations and verifying the network's
functionality.

#### Customizing Your SPE

The SPE's configuration can be tailored to meet specific requirements. Explore
the the `.env` file within the repository to adjust parameters such as ports,
solana version, consensus mechanism, network permissions, and transaction
processing limits.

For more detailed customization, refer to the
[Solana documentation](https://solana.com/docs) and the README file in the
repository, which may provide insights into advanced configuration and
optimization techniques suitable for enterprise applications.

## Conclusion

SPEs provide a versatile solution for organizations seeking to leverage Solana's
high-performance blockchain within a controlled and permissioned environment. By
deploying an SPE, organizations can harness the speed and scalability of Solana
while maintaining full control over network participants, infrastructure, and
consensus mechanisms. SPEs come with varying levels of implementation that can
help you organization meet their unique business requirements and regulatory
constraints.
