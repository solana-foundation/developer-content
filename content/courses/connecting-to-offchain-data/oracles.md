---
title: Oracles and Oracle Networks
objectives:
  - Explain why onchain programs cannot readily access real-world data on their
    own
  - Explain how oracles solve the problem of accessing real-world data onchain
  - Explain how incentivized oracle networks make data more trustworthy
  - Effectively weigh the tradeoffs between using various types of oracles
  - Use oracles from an onchain program to access real-world data
description: Access real-world data inside a Solana program.
---

## Summary

- Oracles are services that provide external data to a blockchain network.
- Solana has a rich ecosystem of oracle providers. Some notable oracle providers
  include [Pyth Network](https://pyth.network),
  [Switchboard](https://switchboard.xyz), [Chainlink](https://chain.link), and
  [DIA](https://www.diadata.org/solana-price-oracles/).
- You can build your own oracle to create a custom data feed.
- When choosing oracle providers, consider reliability, accuracy,
  decentralization, update frequency, and cost. Be aware of security risks:
  oracles can be potential points of failure or attack. For critical data, use
  reputable providers and consider multiple independent oracles to mitigate
  risks.

## Lesson

Oracles are services that provide external data to a blockchain network.
Blockchains are siloed environments that do not inherently know the outside
world. Oracles solve this limitation by offering a decentralized way to get
various types of data onchain, such as:

- Results of sporting events
- Weather data
- Political election results
- Market data
- Randomness

While the implementation may differ across blockchains, oracles generally work
as follows:

1. Data is sourced offchain.
2. The data is published onchain via a transaction and stored in an account.
3. Programs can read the data stored in the account and use it in the program's
   logic.

This lesson will cover the basics of how oracles work, the state of oracles on
Solana, and how to effectively use oracles in your Solana development.

### Trust and Oracle Networks

The primary challenge for oracles is trust. Since blockchains execute
irreversible financial transactions, developers and users need to trust the
validity and accuracy of oracle data. The first step in trusting an oracle is
understanding its implementation.

Broadly speaking, there are three types of implementations:

1. **Single, centralized oracle publishes data onchain.**
   - **Pro:** It's simple; there's one source of truth.
   - **Con:** Nothing prevents the oracle provider from supplying inaccurate
     data.
2. **Network of oracles publishes data, with consensus determining the final
   result.**

   - **Pro:** Consensus reduces the likelihood of bad data being pushed onchain.
   - **Con:** There's no direct disincentive for bad actors to publish incorrect
     data to sway consensus.

3. **Oracle network with proof-of-stake mechanism:** Oracles are required to
   stake tokens to participate. If an oracle's response deviates too far from
   the consensus, its stake is taken by the protocol and it can no longer
   report.
   - **Pro:** This approach prevents any single oracle from overly influencing
     the final result while incentivizing honest and accurate reporting.
   - **Con:** Building decentralized networks is challenging; proper incentives
     and sufficient participation are necessary for success.

Each implementation has its place depending on the oracle's use case. For
example, using centralized oracles for a blockchain-based game may be
acceptable. However, you may be less comfortable with a centralized oracle
providing price data for trading applications.

You may create standalone oracles for your own applications to access offchain
data. However, these are unlikely to be used by the broader community, where
decentralization is a core principle. Be cautious about using centralized
third-party oracles as well.

In an ideal scenario, all important or valuable data would be provided onchain
via a highly efficient oracle network with a trustworthy proof-of-stake
consensus mechanism. A staking system incentivizes oracle providers to ensure
the accuracy of their data to protect their staked funds.

Even when an oracle network claims to have a consensus mechanism, be aware of
the risks. If the total value at stake in downstream applications exceeds the
staked amount of the oracle network, there may still be sufficient incentive for
collusion among oracles.

As a developer, it is your responsibility to understand how an oracle network is
configured and assess whether it can be trusted. Generally, oracles should only
be used for non-mission-critical functions, and worst-case scenarios should
always be accounted for.

### Oracles on Solana

Solana has a diverse ecosystem of oracle providers, each with unique offerings.
Some notable ones include:

- [**Pyth**](https://www.pyth.network/price-feeds)  
  Focuses primarily on financial data published by top-tier financial
  institutions. Pyth's data providers are approved entities that publish market
  data updates, which are then aggregated and made available onchain via the
  Pyth program. This data is not fully decentralized since only approved
  providers can publish it. However, the key advantage is that Pyth offers
  high-quality, vetted data directly sourced from these institutions.
- [**Switchboard**](https://switchboard.xyz)  
  Completely decentralized oracle network with a variety of data feeds. You can
  explore these feeds on
  [Switchboard website](https://app.switchboard.xyz/solana/mainnet). Anyone can
  run a Switchboard oracle or consume its data, but that means users need to be
  diligent in researching the quality of the feeds they use.
- [**Chainlink**](https://chain.link)  
  Decentralized oracle network providing secure offchain computations and
  real-world data across multiple blockchains.
- [**DIA**](https://www.diadata.org/solana-price-oracles/)  
  Open-source oracle platform delivering transparent and verified data for
  digital assets and traditional financial instruments.

In this lesson, we'll be using **Switchboard**. However, the concepts are
applicable to most oracles, so you should select the oracle provider that best
fits your needs.

Switchboard follows a stake-weighted oracle network model, as discussed in the
previous section, but with an additional layer of security via
[**Trusted Execution Environments (TEEs)**](https://en.wikipedia.org/wiki/Trusted_execution_environment).
TEEs are secure environments isolated from the rest of the system where
sensitive code can be executed. In simple terms, TEEs can take a program and an
input, execute the program, and produce an output along with a proof. To learn
more about TEEs, check out
[Switchboard's Architecture Design documentation](https://docs.switchboard.xyz/docs/switchboard/readme/architecture-design#trusted-execution-environments-for-layered-security).

By incorporating TEEs, Switchboard is able to verify each oracle's software,
ensuring its integrity within the network. If an oracle operator acts
maliciously or alters the approved code, the data quote verification process
will fail. This allows Switchboard to support more than just data reporting; it
can also run offchain custom and confidential computations.

### Switchboard Oracles

Switchboard oracles store data on Solana using data feeds, also called
**aggregators**. These data feeds consist of multiple jobs that are aggregated
to produce a single result. Aggregators are represented onchain as regular
Solana accounts managed by the Switchboard program, with updates written
directly to these accounts. Let's review some key terms to understand how
Switchboard operates:

- **[Aggregator (Data Feed)](https://github.com/switchboard-xyz/solana-sdk/blob/main/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs)** -
  Contains the data feed configuration, including how updates are requested,
  processed, and resolved onchain. The aggregator account, owned by the
  Switchboard program stores the final data onchain.
- **[Job](https://github.com/switchboard-xyz/solana-sdk/blob/main/rust/switchboard-solana/src/oracle_program/accounts/job.rs)** -
  Each data source corresponds to a job account, which defines the tasks for
  fetching and transforming offchain data. It acts as the blueprint for how data
  is retrieved for a particular source.
- **[Oracle](https://github.com/switchboard-xyz/solana-sdk/blob/main/rust/switchboard-solana/src/oracle_program/accounts/oracle.rs)** -
  An oracle acts as the intermediary between the internet and the blockchain. It
  reads job definitions from the feed, calculates results, and submits them
  onchain.
- **Oracle Queue** - A pool of oracles that are assigned update requests in a
  round-robin fashion. Oracles in the queue must continuously heartbeat onchain
  to provide updates. The queue's data and configuration are stored in an
  [onchain account](https://github.com/switchboard-xyz/solana-sdk/blob/main/javascript/solana.js/src/generated/oracle-program/accounts/OracleQueueAccountData.ts)
  managed by the Switchboard program.
- **Oracle Consensus** - Oracles come to a consensus by using the median of the
  responses as the accepted onchain result. The feed authority controls how many
  oracles are required to respond for added security.

Switchboard incentivizes oracles to update data feeds through a reward system.
Each data feed has a `LeaseContract` account, which is a pre-funded escrow that
rewards oracles for fulfilling update requests. The `leaseAuthority` can
withdraw funds, but anyone can contribute to the contract. When a user requests
a feed update, the escrow rewards both the user and the crank turners (those who
run software to systematically send update requests). Once oracles submit
results onchain, they are paid from this escrow.

Oracles must also stake tokens to participate in updates. If an oracle submits a
result outside the queue's configured parameters, they can have their stake
slashed, provided the queue has `slashingEnabled`. This mechanism ensures that
oracles act in good faith by providing accurate data.

#### How Data is Published Onchain

1. **Oracle Queue Setup** - When an update request is made, the next `N` oracles
   are assigned from the queue and moved to the back after completion. Each
   queue has its own configuration that dictates security and behavior, tailored
   to specific use cases. Queues are stored onchain as accounts and can be
   created via the
   [`oracleQueueInit` instruction](https://github.com/switchboard-xyz/solana-sdk/blob/main/javascript/solana.js/src/generated/oracle-program/instructions/oracleQueueInit.ts).
   - Key
     [Oracle Queue configurations](https://docs.rs/switchboard-solana/latest/switchboard_solana/oracle_program/accounts/queue/struct.OracleQueueAccountData.html):
     - `oracle_timeout`: Removes stale oracles after a heartbeat timeout.
     - `reward`: Defines rewards for oracles and round openers.
     - `min_stake`: The minimum stake required for an oracle to participate.
     - `size`: The current number of oracles in the queue.
     - `max_size`: The maximum number of oracles a queue can support.
2. **[Aggregator/data feed setup](https://docs.rs/switchboard-solana/latest/switchboard_solana/oracle_program/accounts/aggregator/struct.AggregatorAccountData.html)** -
   Each feed is linked to a single oracle queue and contains configuration
   details on how updates are requested and processed.
3. **[Job Account Setup](https://docs.rs/switchboard-solana/latest/switchboard_solana/oracle_program/accounts/job/struct.JobAccountData.html)** -
   Each data source requires a job account that defines how oracles retrieve and
   fulfill the feed's update requests. These job accounts also specify where
   data is sourced.
4. **Request Assignment** - When an update is requested, the oracle queue
   assigns the task to different oracles in the queue. Each oracle processes
   data from the sources defined in the feed's job accounts, calculating a
   weighted median result based on the data.

5. **Consensus and Result Calculation** - After the required number of oracle
   responses
   ([`minOracleResults`](https://docs.rs/switchboard-solana/latest/switchboard_solana/oracle_program/accounts/aggregator/struct.AggregatorAccountData.html#structfield.min_oracle_results))
   is received, the result is calculated as the median of the responses. Oracles
   that submit responses within the set parameters are rewarded, while those
   outside the threshold are penalized (if `slashingEnabled` is active).
6. **Data Storage** - The final result is stored in the aggregator account,
   where it can be accessed onchain for consumption by other programs.

#### How to Use Switchboard Oracles

To incorporate offchain data into a Solana program using Switchboard oracles,
the first step is to find a data feed that suits your needs. Switchboard offers
many [publicly available feeds](https://app.switchboard.xyz/solana/mainnet) for
various data types. When selecting a feed, you should consider the following
factors:

- **Accuracy/Reliability**: Evaluate how precise the data needs to be for your
  application.
- **Data Source**: Choose a feed based on where the data is sourced from.
- **Update Cadence**: Understand how frequently the feed is updated to ensure it
  meets your use case.

When consuming public feeds, you won't have control over these aspects, so it's
important to choose carefully based on your requirements.

For example, Switchboard offers a
[BTC/USD feed](https://app.switchboard.xyz/solana/mainnet/feed/8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee),
which provides the current Bitcoin price in USD. This feed is available on both
Solana devnet and mainnet with the following public key:
`8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee`.

Here's a snapshot of what the onchain data for a Switchboard feed account looks
like:

```rust
// From the switchboard solana program
// https://github.com/switchboard-xyz/solana-sdk/blob/main/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L60

pub struct AggregatorAccountData {
    /// Name of the aggregator to store onchain.
    pub name: [u8; 32],
    ...
    ...
    /// Pubkey of the queue the aggregator belongs to.
    pub queue_pubkey: Pubkey,
    ...
    /// Minimum number of oracle responses required before a round is validated.
    pub min_oracle_results: u32,
    /// Minimum number of job results before an oracle accepts a result.
    pub min_job_results: u32,
    /// Minimum number of seconds required between aggregator rounds.
    pub min_update_delay_seconds: u32,
    ...
    /// Change percentage required between a previous round and the current round. If variance percentage is not met, reject new oracle responses.
    pub variance_threshold: SwitchboardDecimal,
    ...
    /// Latest confirmed update request result that has been accepted as valid. This is where you will find the data you are requesting in latest_confirmed_round.result
    pub latest_confirmed_round: AggregatorRound,
    ...
    /// The previous confirmed round result.
    pub previous_confirmed_round_result: SwitchboardDecimal,
    /// The slot when the previous confirmed round was opened.
    pub previous_confirmed_round_slot: u64,
    ...
}
```

You can view the full code for this data structure in the
[Switchboard program here](https://github.com/switchboard-xyz/solana-sdk/blob/main/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L60).

Some relevant fields and configurations on the `AggregatorAccountData` type are:

- `min_oracle_results` - Minimum number of oracle responses required before a
  round is validated.
- `min_job_results` - Minimum number of job results before an oracle accepts a
  result.
- `variance_threshold` - Change percentage required between a previous round and
  the current round. If variance percentage is not met, reject new oracle
  responses.
- `latest_confirmed_round` - Latest confirmed update request result that has
  been accepted as valid. This is where you will find the data of the feed in
  `latest_confirmed_round.result`
- `min_update_delay_seconds` - Minimum number of seconds required between
  aggregator rounds.

The first three configurations listed above directly impact the accuracy and
reliability of a data feed:

- The `min_job_results` field represents the minimum number of successful
  responses an oracle must receive from data sources before it can submit its
  response onchain. For example, if `min_job_results` is set to three, each
  oracle must pull data from at least three job sources. The higher this number,
  the more reliable and accurate the data will be, reducing the influence of any
  single data source.

- The `min_oracle_results` field is the minimum number of oracle responses
  required for a round to be successful. Each oracle in a queue pulls data from
  each source defined as a job, takes the weighted median of those responses,
  and submits that median onchain. The program then waits for
  `min_oracle_results` of these weighted medians and calculates the median of
  those, which is the final result stored in the data feed account.

- The `min_update_delay_seconds` field is related to the feed's update cadence.
  This value must have passed between rounds of updates before the Switchboard
  program will accept results.

It can help to view the jobs tab for a feed in Switchboard's explorer. For
example, check out the
[BTC_USD feed in the explorer](https://app.switchboard.xyz/solana/devnet/feed/8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee).
Each job defines the data sources the oracles fetch from and the weight assigned
to each source. You can view the actual API endpoints that provide the data for
this feed. When selecting a feed for your program, these considerations are key.

Below are two of the jobs related to the BTC_USD feed, showing data from
[MEXC](https://www.mexc.com/) and [Coinbase](https://www.coinbase.com/).

![Oracle Jobs](/public/assets/courses/unboxed/oracle-jobs.png)

Once you've chosen a feed, you can start reading the data from that feed by
deserializing and reading the state stored in the account. The easiest way to do
this is by using the `AggregatorAccountData` struct from the
`switchboard_solana` crate in your program.

```rust
// Import anchor and switchboard crates
use {anchor_lang::prelude::*, switchboard_solana::AggregatorAccountData};

...

#[derive(Accounts)]
pub struct ConsumeDataAccounts<'info> {
    // Pass in data feed account and deserialize to AggregatorAccountData
    pub feed_aggregator: AccountLoader<'info, AggregatorAccountData>,
    ...
}
```

Using zero-copy deserialization with `AccountLoader` allows the program to
access specific data within large accounts like `AggregatorAccountData` without
loading the entire account into memory. This improves memory efficiency and
performance by only accessing the necessary parts of the account. It avoids
deserializing the whole account, saving both time and resources. This is
especially useful for large account structures.

When using `AccountLoader`, you can access the data in three ways:

- `load_init`: Used after initializing an account (this ignores the missing
  account discriminator that gets added only after the user's instruction code)
- `load`: Used when the account is immutable
- `load_mut`: Used when the account is mutable

To dive deeper, check out the
[Advanced Program Architecture lesson](/content/courses/program-optimization/program-architecture.md),
where we discuss `Zero-Copy` and `AccountLoader` in more detail.

With the aggregator account passed into your program, you can use it to retrieve
the latest oracle result. Specifically, you can use the `get_result()` method on
the aggregator type:

```rust
// Inside an Anchor program
...

let feed = &ctx.accounts.feed_aggregator.load()?;
// get result
let val: f64 = feed.get_result()?.try_into()?;
```

The `get_result()` method defined on the `AggregatorAccountData` struct is safer
than fetching the data with `latest_confirmed_round.result` because Switchboard
has implemented some nifty safety checks.

```rust
// From switchboard program
// https://github.com/switchboard-xyz/solana-sdk/blob/main/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L206

pub fn get_result(&self) -> anchor_lang::Result<SwitchboardDecimal> {
    if self.resolution_mode == AggregatorResolutionMode::ModeSlidingResolution {
        return Ok(self.latest_confirmed_round.result);
    }
    let min_oracle_results = self.min_oracle_results;
    let latest_confirmed_round_num_success = self.latest_confirmed_round.num_success;
    if min_oracle_results > latest_confirmed_round_num_success {
        return Err(SwitchboardError::InvalidAggregatorRound.into());
    }
    Ok(self.latest_confirmed_round.result)
}
```

You can also view the current value stored in an `AggregatorAccountData` account
client-side in Typescript.

```typescript
import { AggregatorAccount, SwitchboardProgram } from "@switchboard-xyz/solana.js";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import { Big } from "@switchboard-xyz/common";
...
...

const DEVNET_RPC_URL = "https://api.devnet.solana.com";
const SOL_USD_SWITCHBOARD_FEED = new PublicKey(
  "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR",
);
// Create keypair for test user
let user = new anchor.web3.Keypair();

// Fetch switchboard devnet program object
switchboardProgram = await SwitchboardProgram.load(
  new Connection(DEVNET_RPC_URL),
  payer,
);

// Pass switchboard program object and feed pubkey into AggregatorAccount constructor
aggregatorAccount = new AggregatorAccount(
  switchboardProgram,
  SOL_USD_SWITCHBOARD_FEED,
);

// Fetch latest SOL price
const solPrice: Big | null = await aggregatorAccount.fetchLatestValue();
if (solPrice === null) {
  throw new Error("Aggregator holds no value");
}
```

Remember, Switchboard data feeds are just accounts that are updated by third
parties (oracles). Given that, you can do anything with the account that you can
typically do with accounts external to your program.

#### Best Practices and Common Pitfalls

When incorporating Switchboard feeds into your programs, there are two groups of
concerns to consider: choosing a feed and actually consuming the data from that
feed.

Always audit the configurations of a feed before deciding to incorporate it into
a program. Configurations like **Min Update Delay**, **Min job Results**, and
**Min Oracle Results** can directly affect the data that is eventually persisted
onchain to the aggregator account. For example, looking at the config section of
the
[BTC_USD feed](https://app.switchboard.xyz/solana/devnet/feed/8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee)
you can see its relevant configurations.

![Oracle Configs](/public/assets/courses/unboxed/oracle-configs.png)

The BTC_USD feed has a Min Update Delay = 6 seconds. This means that the price
of BTC is only updated at a minimum of every 6 seconds on this feed. This is
probably fine for most use cases, but if you wanted to use this feed for
something latency sensitive, it's probably not a good choice.

It's also worthwhile to audit a feed's sources in the Jobs section of the oracle
explorer. Since the value that is persisted onchain is the weighted median
result the oracles pull from each source, the sources directly influence what is
stored in the feed. Check for shady links and potentially run the APIs yourself
for a time to gain confidence in them.

Once you have found a feed that fits your needs, you still need to make sure
you're using the feed appropriately. For example, you should still implement
necessary security checks on the account passed into your instruction. Any
account can be passed into your program's instructions, so you should verify
it's the account you expect it to be.

In Anchor, if you deserialize the account to the `AggregatorAccountData` type
from the `switchboard_solana` crate, Anchor checks that the account is owned by
the Switchboard program. If your program expects that only a specific data feed
will be passed in the instruction, then you can also verify that the public key
of the account passed in matches what it should be. One way to do this is to
hard code the address in the program somewhere and use account constraints to
verify the address passed in matches what is expected.

```rust
use {
    anchor_lang::prelude::*,
    solana_program::{pubkey, pubkey::Pubkey},
    switchboard_solana::AggregatorAccountData,
};

pub static BTC_USDC_FEED: Pubkey = pubkey!("8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee");

...
...

#[derive(Accounts)]
pub struct TestInstruction<'info> {
    // Switchboard SOL feed aggregator
    #[account(
        address = BTC_USDC_FEED
    )]
    pub feed_aggregator: AccountLoader<'info, AggregatorAccountData>,
}
```

On top of ensuring the feed account is the one you expect, you can also do some
checks on the data stored in the feed in your program's instruction logic. Two
common things to check for are data staleness and the confidence interval.

Each data feed updates the current value stored in it when triggered by the
oracles. This means the updates are dependent on the oracles in the queue that
it's assigned to. Depending on what you intend to use the data feed for, it may
be beneficial to verify that the value stored in the account was updated
recently. For example, a lending protocol that needs to determine if a loan's
collateral has fallen below a certain level may need the data to be no older
than a few seconds. You can have your code check the timestamp of the most
recent update stored in the aggregator account. The following code snippet
checks that the timestamp of the most recent update on the data feed was no more
than 30 seconds ago.

```rust
use {
    anchor_lang::prelude::*,
    anchor_lang::solana_program::clock,
    switchboard_solana::{AggregatorAccountData, SwitchboardDecimal},
};

...
...

let feed = &ctx.accounts.feed_aggregator.load()?;
if (clock::Clock::get().unwrap().unix_timestamp - feed.latest_confirmed_round.round_open_timestamp) <= 30 {
      valid_transfer = true;
}
```

The `latest_confirmed_round` field on the `AggregatorAccountData` struct is of
type `AggregatorRound` defined as:

```rust
// https://github.com/switchboard-xyz/solana-sdk/blob/main/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L17

pub struct AggregatorRound {
    /// Maintains the number of successful responses received from nodes.
    /// Nodes can submit one successful response per round.
    pub num_success: u32,
    /// Number of error responses.
    pub num_error: u32,
    /// Whether an update request round has ended.
    pub is_closed: bool,
    /// Maintains the `solana_program::clock::Slot` that the round was opened at.
    pub round_open_slot: u64,
    /// Maintains the `solana_program::clock::UnixTimestamp;` the round was opened at.
    pub round_open_timestamp: i64,
    /// Maintains the current median of all successful round responses.
    pub result: SwitchboardDecimal,
    /// Standard deviation of the accepted results in the round.
    pub std_deviation: SwitchboardDecimal,
    /// Maintains the minimum node response this round.
    pub min_response: SwitchboardDecimal,
    /// Maintains the maximum node response this round.
    pub max_response: SwitchboardDecimal,
    /// Pubkeys of the oracles fulfilling this round.
    pub oracle_pubkeys_data: [Pubkey; 16],
    /// Represents all successful node responses this round. `NaN` if empty.
    pub medians_data: [SwitchboardDecimal; 16],
    /// Current rewards/slashes oracles have received this round.
    pub current_payout: [i64; 16],
    /// Keep track of which responses are fulfilled here.
    pub medians_fulfilled: [bool; 16],
    /// Keeps track of which errors are fulfilled here.
    pub errors_fulfilled: [bool; 16],
}
```

There are some other relevant fields that may be of interest to you in the
Aggregator account like `num_success`, `medians_data`, `std_deviation`, etc.
`num_success` is the number of successful responses received from oracles in
this round of updates. `medians_data` is an array of all of the successful
responses received from oracles this round. This is the dataset that is used to
derive the median and the final result. `std_deviation` is the standard
deviation of the accepted results in this round. You might want to check for a
low standard deviation, meaning that all of the oracle responses were similar.
The switchboard program is in charge of updating the relevant fields on this
struct every time it receives an update from an oracle.

The `AggregatorAccountData` also has a `check_confidence_interval()` method that
you can use as another verification on the data stored in the feed. The method
allows you to pass in a `max_confidence_interval`. If the standard deviation of
the results received from the oracle is greater than the given
`max_confidence_interval`, it returns an error.

```rust
// https://github.com/switchboard-xyz/solana-sdk/blob/main/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L228

pub fn check_confidence_interval(
    &self,
    max_confidence_interval: SwitchboardDecimal,
) -> anchor_lang::Result<()> {
    if self.latest_confirmed_round.std_deviation > max_confidence_interval {
        return Err(SwitchboardError::ConfidenceIntervalExceeded.into());
    }
    Ok(())
}
```

You can incorporate this into your program like so:

```rust
use {
    crate::{errors::*},
    anchor_lang::prelude::*,
    std::convert::TryInto,
    use switchboard_solana::{AggregatorAccountData, SwitchboardDecimal},
};

...
...

let feed = &ctx.accounts.feed_aggregator.load()?;

// Check feed does not exceed max_confidence_interval
feed.check_confidence_interval(SwitchboardDecimal::from_f64(max_confidence_interval))
    .map_err(|_| error!(ErrorCode::ConfidenceIntervalExceeded))?;
```

Lastly, it's important to plan for worst-case scenarios in your programs. Plan
for feeds going stale and plan for feed accounts closing.

### Conclusion

If you want functional programs that can perform actions based on real-world
data, you'll need to use oracles. Fortunately, there are reliable oracle
networks, such as Switchboard, that simplify the process. However, it's crucial
to perform thorough due diligence on any oracle network you choose, as you are
ultimately responsible for your program's behavior.

## Lab

Let's practice working with oracles! We'll be building a "Michael Burry Escrow"
program, which locks SOL in an escrow account until its value surpasses a
specified USD threshold. The program is named after
[Michael Burry](https://en.wikipedia.org/wiki/Michael_Burry), the investor known
for predicting the 2008 housing market crash.

For this, we'll use the
[SOL_USD oracle on devnet](https://app.switchboard.xyz/solana/devnet/feed/GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR)
from Switchboard. The program will have two key instructions:

- **Deposit**: Lock up the SOL and set a USD price target for unlocking.
- **Withdraw**: Check the USD price, and if the target is met, withdraw the SOL.

### 1. Program Setup

To get started, let's create the program with

```zsh
anchor init burry-escrow --template=multiple
```

Next, replace the program ID in `lib.rs` and `Anchor.toml` by running command
`anchor keys sync`.

Next, add the following to the bottom of your `Anchor.toml` file. This will tell
Anchor how to configure our local testing environment. This will allow us to
test our program locally without having to deploy and send transactions to
devnet.

At the bottom of `Anchor.toml`:

```toml filename="Anchor.toml"
[test]
startup_wait = 5000
shutdown_wait = 2000
upgradeable = false

[test.validator]
bind_address = "0.0.0.0"
url = "https://api.devnet.solana.com"
ledger = ".anchor/test-ledger"
rpc_port = 8899

[[test.validator.clone]] # switchboard-solana devnet programID
address = "SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f"

[[test.validator.clone]] # switchboard-solana devnet IDL
address = "Fi8vncGpNKbq62gPo56G4toCehWNy77GgqGkTaAF5Lkk"

[[test.validator.clone]] # switchboard-solana SOL/USD Feed
address = "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR"
```

Additionally, we want to import the `switchboard-solana` crate in our
`Cargo.toml` file. Make sure your dependencies look as follows:

```toml filename="Cargo.toml"
[dependencies]
anchor-lang = "0.30.1"
switchboard-solana = "0.30.4"
```

Before diving into the program logic, let's review the structure of our smart
contract. For smaller programs, it's tempting to put all the code in a single
`lib.rs` file. However, organizing the code across different files helps
maintain clarity and scalability. Our program will be structured as follows
within the `programs/burry-escrow` directory:

```sh
└── burry-escrow
    ├── Cargo.toml
    ├── Xargo.toml
    └── src
        ├── constants.rs
        ├── error.rs
        ├── instructions
        │   ├── deposit.rs
        │   ├── mod.rs
        │   └── withdraw.rs
        ├── lib.rs
        └── state.rs
```

In this structure, `lib.rs` serves as the entry point to the program, while the
logic for each instruction handler is stored in separate files under the
`instructions` directory. Go ahead and set up the architecture as shown above,
and we'll proceed from there.

### 2. Setup lib.rs

Before writing the logic, we'll set up the necessary boilerplate in `lib.rs`.
This file acts as the entry point for the program, defining the API endpoints
that all transactions will pass through. The actual logic will be housed in the
`/instructions` directory.

```rust filename="lib.rs"
use anchor_lang::prelude::*;
use instructions::{deposit::*, withdraw::*};

pub mod errors;
pub mod instructions;
pub mod state;
pub mod constants;

declare_id!("YOUR_PROGRAM_KEY_HERE");

#[program]
pub mod burry_escrow {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, escrow_amount: u64, unlock_price: f64) -> Result<()> {
        deposit_handler(ctx, escrow_amount, unlock_price)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        withdraw_handler(ctx)
    }
}
```

### 3. Define state.rs

Next, let's define our program's data account: `Escrow`. This account will store
two key pieces of information:

- `unlock_price`: The price of SOL in USD at which withdrawals are allowed
  (e.g., hard-coded to $21.53).
- `escrow_amount`: Tracks the amount of lamports held in the escrow account.

```rust filename="state.rs"
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub unlock_price: f64,
    pub escrow_amount: u64,
}
```

### 4. Constants

Next, we'll define `DISCRIMINATOR_SIZE` as 8, the PDA seed as `"MICHAEL BURRY"`,
and hard-code the SOL/USD oracle pubkey as `SOL_USDC_FEED` in the `constants.rs`
file.

```rust filename="constants.rs"
pub const DISCRIMINATOR_SIZE: usize = 8;
pub const ESCROW_SEED: &[u8] = b"MICHAEL BURRY";
pub const SOL_USDC_FEED: &str = "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR";
```

### 5. Errors

Next, let's define the custom errors we'll use throughout the program. Inside
the `error.rs` file, paste the following:

```rust filename="error.rs"
use anchor_lang::prelude::*;

#[error_code]
#[derive(Eq, PartialEq)]
pub enum EscrowErrorCode {
    #[msg("Not a valid Switchboard account")]
    InvalidSwitchboardAccount,
    #[msg("Switchboard feed has not been updated in 5 minutes")]
    StaleFeed,
    #[msg("Switchboard feed exceeded provided confidence interval")]
    ConfidenceIntervalExceeded,
    #[msg("Current SOL price is not above Escrow unlock price.")]
    SolPriceBelowUnlockPrice,
}
```

### 6. Setup mod.rs

Let's set up our `instructions/mod.rs` file.

```rust filename="mod.rs"
pub mod deposit;
pub mod withdraw;
```

### 7. Deposit

Now that we have all of the boilerplate out of the way, let's move on to our
`Deposit` instruction. This will live in the `/src/instructions/deposit.rs`
file.

When a user deposits, a PDA should be created with the "MICHAEL BURRY" string
and the user's pubkey as seeds. This ensures that a user can only open one
escrow account at a time. The instruction should initialize an account at this
PDA and transfer the SOL that the user wants to lock up to it. The user will
need to be a signer.

Let's first build the `Deposit` context struct. To do this, we need to think
about what accounts will be necessary for this instruction. We start with the
following:

```rust filename="deposit.rs"
use crate::constants::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction::transfer};

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [ESCROW_SEED, user.key().as_ref()],
        bump,
        payer = user,
        space = DISCRIMINATOR_SIZE + Escrow::INIT_SPACE
    )]
    pub escrow_account: Account<'info, Escrow>,

    pub system_program: Program<'info, System>,
}
```

Notice the constraints we added to the accounts:

- Because we'll be transferring SOL from the User account to the `escrow`
  account, they both need to be mutable.
- We know the `escrow_account` is supposed to be a PDA derived with the “MICHAEL
  BURRY” string and the user's pubkey. We can use Anchor account constraints to
  guarantee that the address passed in actually meets that requirement.
- We also know that we have to initialize an account at this PDA to store some
  state for the program. We use the `init` constraint here.

Let's move onto the actual logic. All we need to do is to initialize the state
of the `escrow` account and transfer the SOL. We expect the user to pass in the
amount of SOL they want to lock up in escrow and the price to unlock it at. We
will store these values in the `escrow` account.

After that, the method should execute the transfer. This program will be locking
up native SOL. Because of this, we don't need to use token accounts or the
Solana token program. We'll have to use the `system_program` to transfer the
lamports the user wants to lock up in escrow and invoke the transfer
instruction.

```rust filename="deposit.rs"
pub fn deposit_handler(ctx: Context<Deposit>, escrow_amount: u64, unlock_price: f64) -> Result<()> {
    msg!("Depositing funds in escrow...");

    let escrow = &mut ctx.accounts.escrow_account;
    escrow.unlock_price = unlock_price;
    escrow.escrow_amount = escrow_amount;

    let transfer_instruction =
        transfer(&ctx.accounts.user.key(), &escrow.key(), escrow_amount);

    invoke(
        &transfer_instruction,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.escrow_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    msg!(
        "Transfer complete. Escrow will unlock SOL at {}",
        &ctx.accounts.escrow_account.unlock_price
    );

    Ok(())
}
```

That's is the gist of the deposit instruction handler! The final result of the
`deposit.rs` file should look as follows:

```rust filename="deposit.rs"
use crate::constants::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{program::invoke, system_instruction::transfer};

pub fn deposit_handler(ctx: Context<Deposit>, escrow_amount: u64, unlock_price: f64) -> Result<()> {
    msg!("Depositing funds in escrow...");

    let escrow = &mut ctx.accounts.escrow_account;
    escrow.unlock_price = unlock_price;
    escrow.escrow_amount = escrow_amount;

    let transfer_instruction =
        transfer(&ctx.accounts.user.key(), &escrow.key(), escrow_amount);

    invoke(
        &transfer_instruction,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.escrow_account.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
    )?;

    msg!(
        "Transfer complete. Escrow will unlock SOL at {}",
        &ctx.accounts.escrow_account.unlock_price
    );

    Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        seeds = [ESCROW_SEED, user.key().as_ref()],
        bump,
        payer = user,
        space = DISCRIMINATOR_SIZE + Escrow::INIT_SPACE
    )]
    pub escrow_account: Account<'info, Escrow>,

    pub system_program: Program<'info, System>,
}
```

### 8. Withdraw

The `Withdraw` instruction will require the same three accounts as the `Deposit`
instruction, plus the `SOL_USDC` Switchboard feed account. This code will be
placed in the `withdraw.rs` file.

```rust filename="withdraw.rs"
use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use std::str::FromStr;
use switchboard_solana::AggregatorAccountData;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, user.key().as_ref()],
        bump,
        close = user
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        address = Pubkey::from_str(SOL_USDC_FEED).unwrap()
    )]
    pub feed_aggregator: AccountLoader<'info, AggregatorAccountData>,

    pub system_program: Program<'info, System>,
}
```

Notice we're using the close constraint because once the transaction completes,
we want to close the `escrow_account`. The SOL used as rent in the account will
be transferred to the user account.

We also use the address constraints to verify that the feed account passed in is
actually the `usdc_sol` feed and not some other feed (we have the SOL_USDC_FEED
address hard coded). In addition, the AggregatorAccountData struct that we
deserialize comes from the Switchboard rust crate. It verifies that the given
account is owned by the switchboard program and allows us to easily look at its
values. You'll notice it's wrapped in a `AccountLoader`. This is because the
feed is actually a fairly large account and it needs to be zero copied.

Now let's implement the withdraw instruction handler's logic. First, we check if
the feed is stale. Then we fetch the current price of SOL stored in the
`feed_aggregator` account. Lastly, we want to check that the current price is
above the escrow `unlock_price`. If it is, then we transfer the SOL from the
escrow account back to the user and close the account. If it isn't, then the
instruction handler should finish and return an error.

```rust filename="withdraw.rs"
pub fn withdraw_handler(ctx: Context<Withdraw>) -> Result<()> {
    let feed = &ctx.accounts.feed_aggregator.load()?;
    let escrow = &ctx.accounts.escrow_account;

    let current_sol_price: f64 = feed.get_result()?.try_into()?;

    // Check if the feed has been updated in the last 5 minutes (300 seconds)
    feed.check_staleness(Clock::get().unwrap().unix_timestamp, 300)
        .map_err(|_| error!(EscrowErrorCode::StaleFeed))?;

    msg!("Current SOL price is {}", current_sol_price);
    msg!("Unlock price is {}", escrow.unlock_price);

    if current_sol_price < escrow.unlock_price {
        return Err(EscrowErrorCode::SolPriceBelowUnlockPrice.into());
    }

    ....
}
```

To finish the logic off, we will execute the transfer, this time we will have to
transfer the funds in a different way. Because we are transferring from an
account that also holds data we cannot use the `system_program::transfer` method
like before. If we try to, the instruction will fail to execute with the
following error.

```zsh
'Transfer: `from` must not carry data'
```

To account for this, we'll use `try_borrow_mut_lamports()` on each account and
add/subtract the amount of lamports stored in each account.

```rust filename="withdraw.rs"
// Transfer lamports from escrow to user
**escrow.to_account_info().try_borrow_mut_lamports()? = escrow
.to_account_info()
.lamports()
.checked_sub(escrow_lamports)
.ok_or(ProgramError::InsufficientFunds)?;

**ctx
.accounts
.user
.to_account_info()
.try_borrow_mut_lamports()? = ctx
.accounts
.user
.to_account_info()
.lamports()
.checked_add(escrow_lamports)
.ok_or(ProgramError::InvalidArgument)?;
```

The final withdraw method in the `withdraw.rs` file should look like this:

```rust filename="withdraw.rs"
use crate::constants::*;
use crate::errors::*;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::Clock;
use std::str::FromStr;
use switchboard_solana::AggregatorAccountData;

pub fn withdraw_handler(ctx: Context<Withdraw>) -> Result<()> {
    let feed = &ctx.accounts.feed_aggregator.load()?;
    let escrow = &ctx.accounts.escrow_account;

    let current_sol_price: f64 = feed.get_result()?.try_into()?;

    // Check if the feed has been updated in the last 5 minutes (300 seconds)
    feed.check_staleness(Clock::get().unwrap().unix_timestamp, 300)
        .map_err(|_| error!(EscrowErrorCode::StaleFeed))?;

    msg!("Current SOL price is {}", current_sol_price);
    msg!("Unlock price is {}", escrow.unlock_price);

    if current_sol_price < escrow.unlock_price {
        return Err(EscrowErrorCode::SolPriceBelowUnlockPrice.into());
    }

    let escrow_lamports = escrow.escrow_amount;

    // Transfer lamports from escrow to user
    **escrow.to_account_info().try_borrow_mut_lamports()? = escrow
        .to_account_info()
        .lamports()
        .checked_sub(escrow_lamports)
        .ok_or(ProgramError::InsufficientFunds)?;

    **ctx
        .accounts
        .user
        .to_account_info()
        .try_borrow_mut_lamports()? = ctx
        .accounts
        .user
        .to_account_info()
        .lamports()
        .checked_add(escrow_lamports)
        .ok_or(ProgramError::InvalidArgument)?;

    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, user.key().as_ref()],
        bump,
        close = user
    )]
    pub escrow_account: Account<'info, Escrow>,

    #[account(
        address = Pubkey::from_str(SOL_USDC_FEED).unwrap()
    )]
    pub feed_aggregator: AccountLoader<'info, AggregatorAccountData>,

    pub system_program: Program<'info, System>,
}
```

And that's it for the program! At this point, you should be able to run
`anchor build` without any errors.

### 9. Testing

Let's write some tests. We should have four of them:

- Creating an Escrow with the unlock price **_below_** the current SOL price so
  we can test withdrawing it
- Withdrawing and closing from the above escrow
- Creating an Escrow with the unlock price **_above_** the current SOL price so
  we can test withdrawing it
- Withdrawing and failing from the above escrow

Note that there can only be one escrow per user, so the above order matters.

We'll provide all the testing code in one snippet. Take a look through to make
sure you understand it before running `anchor test`.

```typescript filename="burry-escrow.ts"
// Inside tests/burry-escrow.ts
import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorError } from "@coral-xyz/anchor";
import { BurryEscrow } from "../target/types/burry_escrow";
import { Big } from "@switchboard-xyz/common";
import {
  AggregatorAccount,
  AnchorWallet,
  SwitchboardProgram,
} from "@switchboard-xyz/solana.js";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import { assert } from "chai";
import { confirmTransaction } from "@solana-developers/helpers";

const SOL_USD_SWITCHBOARD_FEED = new PublicKey(
  "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR",
);

const ESCROW_SEED = "MICHAEL BURRY";
const DEVNET_RPC_URL = "https://api.devnet.solana.com";
const CONFIRMATION_COMMITMENT = "confirmed";
const PRICE_OFFSET = 10;
const ESCROW_AMOUNT = new anchor.BN(100);
const EXPECTED_ERROR_MESSAGE =
  "Current SOL price is not above Escrow unlock price.";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.BurryEscrow as Program<BurryEscrow>;
const payer = (provider.wallet as AnchorWallet).payer;

describe("burry-escrow", () => {
  let switchboardProgram: SwitchboardProgram;
  let aggregatorAccount: AggregatorAccount;

  before(async () => {
    switchboardProgram = await SwitchboardProgram.load(
      new Connection(DEVNET_RPC_URL),
      payer,
    );
    aggregatorAccount = new AggregatorAccount(
      switchboardProgram,
      SOL_USD_SWITCHBOARD_FEED,
    );
  });

  const createAndVerifyEscrow = async (unlockPrice: number) => {
    const [escrow] = PublicKey.findProgramAddressSync(
      [Buffer.from(ESCROW_SEED), payer.publicKey.toBuffer()],
      program.programId,
    );

    try {
      const transaction = await program.methods
        .deposit(ESCROW_AMOUNT, unlockPrice)
        .accountsPartial({
          user: payer.publicKey,
          escrowAccount: escrow,
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      await confirmTransaction(
        provider.connection,
        transaction,
        CONFIRMATION_COMMITMENT,
      );

      const escrowAccount = await program.account.escrow.fetch(escrow);
      const escrowBalance = await provider.connection.getBalance(
        escrow,
        CONFIRMATION_COMMITMENT,
      );

      console.log("Onchain unlock price:", escrowAccount.unlockPrice);
      console.log("Amount in escrow:", escrowBalance);

      assert(unlockPrice === escrowAccount.unlockPrice);
      assert(escrowBalance > 0);
    } catch (error) {
      console.error("Error details:", error);
      throw new Error(`Failed to create escrow: ${error.message}`);
    }
  };

  it("creates Burry Escrow Below Current Price", async () => {
    const solPrice: Big | null = await aggregatorAccount.fetchLatestValue();
    if (solPrice === null) {
      throw new Error("Aggregator holds no value");
    }
    // Although `SOL_USD_SWITCHBOARD_FEED` is not changing we are changing the unlockPrice in test as given below to simulate the escrow behavior
    const unlockPrice = solPrice.minus(PRICE_OFFSET).toNumber();

    await createAndVerifyEscrow(unlockPrice);
  });

  it("withdraws from escrow", async () => {
    const [escrow] = PublicKey.findProgramAddressSync(
      [Buffer.from(ESCROW_SEED), payer.publicKey.toBuffer()],
      program.programId,
    );

    const userBalanceBefore = await provider.connection.getBalance(
      payer.publicKey,
    );

    try {
      const transaction = await program.methods
        .withdraw()
        .accountsPartial({
          user: payer.publicKey,
          escrowAccount: escrow,
          feedAggregator: SOL_USD_SWITCHBOARD_FEED,
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      await confirmTransaction(
        provider.connection,
        transaction,
        CONFIRMATION_COMMITMENT,
      );

      // Verify escrow account is closed
      try {
        await program.account.escrow.fetch(escrow);
        assert.fail("Escrow account should have been closed");
      } catch (error) {
        console.log(error.message);
        assert(
          error.message.includes("Account does not exist"),
          "Unexpected error: " + error.message,
        );
      }

      // Verify user balance increased
      const userBalanceAfter = await provider.connection.getBalance(
        payer.publicKey,
      );
      assert(
        userBalanceAfter > userBalanceBefore,
        "User balance should have increased",
      );
    } catch (error) {
      throw new Error(`Failed to withdraw from escrow: ${error.message}`);
    }
  });

  it("creates Burry Escrow Above Current Price", async () => {
    const solPrice: Big | null = await aggregatorAccount.fetchLatestValue();
    if (solPrice === null) {
      throw new Error("Aggregator holds no value");
    }
    // Although `SOL_USD_SWITCHBOARD_FEED` is not changing we are changing the unlockPrice in test as given below to simulate the escrow behavior
    const unlockPrice = solPrice.plus(PRICE_OFFSET).toNumber();
    await createAndVerifyEscrow(unlockPrice);
  });

  it("fails to withdraw while price is below UnlockPrice", async () => {
    const [escrow] = PublicKey.findProgramAddressSync(
      [Buffer.from(ESCROW_SEED), payer.publicKey.toBuffer()],
      program.programId,
    );

    try {
      await program.methods
        .withdraw()
        .accountsPartial({
          user: payer.publicKey,
          escrowAccount: escrow,
          feedAggregator: SOL_USD_SWITCHBOARD_FEED,
          systemProgram: SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      assert.fail("Withdrawal should have failed");
    } catch (error) {
      console.log(error.message);
      if (error instanceof AnchorError) {
        assert.include(error.message, EXPECTED_ERROR_MESSAGE);
      } else if (error instanceof Error) {
        assert.include(error.message, EXPECTED_ERROR_MESSAGE);
      } else {
        throw new Error(`Unexpected error type: ${error}`);
      }
    }
  });
});
```

Once you're confident with the testing logic, run `anchor test` in your
terminal. You should see four tests pass.

```bash
  burry-escrow
Onchain unlock price: 137.42243
Amount in escrow: 1058020
    ✔ creates Burry Escrow Below Current Price (765ms)
Account does not exist or has no data LxDZ9DXNwSFsu2e6u37o6C2T3k59B6ySEHHVaNDrgBq
    ✔ withdraws from escrow (353ms)
Onchain unlock price: 157.42243
Amount in escrow: 1058020
    ✔ creates Burry Escrow Above Current Price (406ms)
AnchorError occurred. Error Code: SolPriceBelowUnlockPrice. Error Number: 6003. Error Message: Current SOL price is not above Escrow unlock price..
    ✔ fails to withdraw while price is below UnlockPrice


  4 passing (2s)
```

If something goes wrong, review the lab and ensure everything is correct. Focus
on understanding the intent behind the code instead of just copying/pasting. You
can also review the working code on the
[`main` branch of burry-escrow GitHub repository](https://github.com/solana-developers/burry-escrow/tree/main).

### Challenge

As an independent challenge, create a fallback plan if the data feed ever goes
down. If the Oracle queue has not updated the aggregator account in X time or if
the data feed account does not exist anymore, withdraw the user's escrowed
funds.

A potential solution to this challenge can be found
[in the Github repository on the `challenge-solution` branch](https://github.com/solana-developers/burry-escrow/tree/challenge-solution).

<Callout type="success" title="Completed the lab?">

Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=1a5d266c-f4c1-4c45-b986-2afd4be59991)!
</Callout>
