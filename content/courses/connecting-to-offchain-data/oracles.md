---
title: Oracles and Oracle Networks
description: "An in-depth guide on how to set up and use oracles on Solana."
updateDate: 09 25, 2024
keywords:
  - oracles
  - switchboard
  - pyth
  - aggregator account
  - feed
---

In this course, we'll delve into the world of oracles. We'll explore what they
are, their different types, how they function, and how to integrate them into
your Solana programs effectively. Given the depth of information, take your time
and consider reviewing the course material two or more times for a comprehensive
understanding.

## Summary

- Oracles are services that provide external data to a blockchain network
- There are many
  [Oracle providers on Solana](https://www.alchemy.com/list-of/decentralized-oracles-on-solana).
- You can build your own Oracle to create a custom data feed
- You have to be careful when choosing your data feed providers

## Lesson

[Oracles](https://solana.com/ecosystem/explore?categories=oracle) are services
that provide external data to a blockchain network. Blockchains by nature are
siloed environments that do not know the outside world. This constraint
inherently puts a limit on the use cases for decentralized applications (dApps).
Oracles provide a solution to this limitation by creating a decentralized way to
get real-world data onchain.

`Oracles` can provide just about any type of data onchain. Examples include:

- Results of sporting events
- Weather data
- Political election results
- Market data
- Randomness

While the exact implementation may differ from blockchain to blockchain,
generally `Oracles` work as follows:

1. Data is sourced offchain.
2. That data is published onchain via a transaction, and stored in an account.
3. Programs can read the data stored in the account and use that data in the
   program's logic.

This lesson will go over the basics of how oracles work, the state of oracles on
Solana, and how to effectively use oracles in your Solana development.

### Trust and Oracle Networks

The primary hurdle oracles need to overcome is one of trust. Since blockchains
execute irreversible financial transactions, developers and users alike need to
know they can trust the validity and accuracy of oracle data. The first step in
trusting an oracle is understanding how it's implemented.

Broadly speaking, there are three implementation types:

<br/>

1. **Single, centralized oracle** publishes data on-chain.
   - **Pro:** It’s simple; there's one source of truth.
   - **Con:** Nothing prevents the oracle provider from supplying inaccurate
     data.

<br/>

2. **Network of oracles** publish data with a consensus mechanism determining
   the final result.
   - **Pro:** Consensus reduces the likelihood of bad data being pushed
     on-chain.
   - **Con:** There's no disincentive for bad actors to publish inaccurate data
     and attempt to sway consensus.

<br/>

3. **Oracle network with proof of stake.**  
   `Oracles` are required to stake tokens to participate in consensus. If an
   oracle deviates beyond a threshold from the accepted range of results, their
   stake is forfeited, and they lose reporting rights.
   - **Pro:** Ensures no single oracle can drastically influence the final
     result, while incentivizing honest and accurate behavior.
   - **Con:** Building decentralized networks is complex, and incentives must be
     appropriately structured to encourage participation.

<br/>

Depending on the use case of an oracle, any of the above solutions could be the
right approach. For example, you might be perfectly willing to participate in a
blockchain-based game that utilizes centralized oracles to publish gameplay
information onchain.

On the other hand, you may be less willing to trust a centralized oracle
providing price information for trading applications.

You may end up creating many standalone oracles for your own applications simply
as a way to get access to offchain information that you need. However, those
oracles are unlikely to be used by the broader community where decentralization
is a core tenet. You should also be hesitant to use centralized, third-party
oracles yourself.

In a perfect world, all important and/or valuable data would be provided onchain
through a highly efficient oracle network through a trustworthy proof of stake
consensus mechanism. By introducing a staking mechanism, it’s in the oracle
providers' best interest to ensure their data is accurate to keep their staked
funds.

Even when an oracle network claims to have such a consensus mechanism, be sure
to know the risks involved with using the network. If the total value involved
of the downstream applications is greater than the oracle's allocated stake,
oracles still may have sufficient incentive to collude.

It is your job to know how the oracle network is configured and judge if it can
be trusted. Generally, Oracles should only be used for non-mission-critical
functions and worst-case scenarios should be accounted for.

### Oracles on Solana

There are many
[Oracle providers on Solana](https://www.alchemy.com/list-of/decentralized-oracles-on-solana).
Two of the most well known are [Pyth](https://pyth.network) and
[Switchboard](https://switchboard.xyz). They’re each unique and follow slightly
different design choices.

**Pyth** is primarily focused on financial data published by top-tier financial
institutions. Pyth’s data providers publish market data updates, which are then
aggregated and published onchain by the Pyth program. The data sourced from Pyth
is not completely decentralized as only approved data providers can publish
data. The selling point of Pyth is that its data is vetted directly by the
platform and sourced from financial institutions, ensuring higher quality.

**Switchboard** is a completely decentralized Oracle network and has data of all
kinds available. Check out all of the feeds
[on their website](https://app.switchboard.xyz/solana/devnet/explore)
Additionally, anyone can run a Switchboard Oracle for others to consume their
data. This means you'll have to be diligent about researching feeds. We'll talk
more about what to look for later in the lesson.

Switchboard follows a variation of the stake-weighted Oracle network described
in the third option of the previous section. It does so by introducing TEEs
(Trusted Execution Environments). TEEs are secure environments isolated from the
rest of the system where sensitive code can be executed. In simple terms, given
a program and an input, TEEs can execute and generate an output along with a
proof. If you’d like to learn more about TEEs, please read
[Switchboard’s documentation](https://docs.switchboard.xyz/functions).

By introducing TEEs on top of stake-weighted oracles, Switchboard can verify
each oracle’s software to allow participation in the network. If an oracle
operator acts maliciously and attempts to change the operation of the approved
code, a data quote verification will fail. This allows Switchboard oracles to
operate beyond quantitative value reporting, such as functions -- running
offchain custom and confidential computations.

### Switchboard Oracles

Switchboard oracles store data on Solana using data feeds. These data feeds,
also called `aggregators`, are each a collection of jobs that get aggregated to
produce a single result. These aggregators are represented onchain as regular
Solana accounts managed by the Switchboard program. When an Oracle updates, it
writes the data directly to these accounts. Let's go over a few aspects to
understand how Switchboard works:

#### Terminologies

Below are a few terms you will see across the rest of this course. Read through
to get porper understanding.

- **[Aggregator (Data Feed)](https://github.com/switchboard-xyz/sbv2-solana/blob/0b5e0911a1851f9ca37042e6ff88db4cd840067b/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L60)** -
  Contains the data feed configuration, dictating how data feed updates get
  requested, updated, and resolved onchain from its assigned source. The
  Aggregator is the account owned by the Switchboard Solana program and is where
  the data is published onchain. <br/></br>
- **[Job](https://github.com/switchboard-xyz/sbv2-solana/blob/0b5e0911a1851f9ca37042e6ff88db4cd840067b/rust/switchboard-solana/src/oracle_program/accounts/job.rs)** -
  Each data source should correspond to a job account. The job account is a
  collection of Switchboard tasks used to instruct the oracles on how to fetch
  and transform data. In other words, it stores the blueprints for how data is
  fetched offchain for a particular data source. <br/><br/>
- **Oracle** - A separate program that sits between the internet and the
  blockchain and facilitates the flow of information. An Oracle reads a feed’s
  job definitions, calculates the result, and submits its response onchain.
  <br/><br/>
- **Oracle Queue** - A group of oracles that get assigned to update requests in
  a round-robin fashion. The oracles in the queue must be actively heartbeating
  onchain to provide updates. Data and configurations for this queue are stored
  onchain in an
  [account owned by the Switchboard program](https://github.com/switchboard-xyz/solana-sdk/blob/9dc3df8a5abe261e23d46d14f9e80a7032bb346c/javascript/solana.js/src/generated/oracle-program/accounts/OracleQueueAccountData.ts#L8).<br/><br/>
- **Oracle Consensus** - Determines how oracles come to agreement on the
  accepted onchain result. Switchboard oracles use the median oracle response as
  the accepted result. A feed authority can control how many oracles are
  requested and how many must respond to influence its security.<br/><br/>

#### Economics

Switchboard oracles are required to update data feeds and are incentivized for
doing so accurately. Each data feed has a `LeaseContract` account. The lease
contract is a pre-funded escrow account to reward oracles for fulfilling update
requests. Only the predefined `leaseAuthority` can withdraw funds from the
contract, but anyone can contribute to it. When a new round of updates is
requested for a data feed, the user who requested the update is rewarded from
the escrow. This is to incentivize users and crank turners (anyone who runs
software to systematically send update requests to Oracles) to keep feeds
updating based on a feed’s configuration. Once an update request has been
successfully fulfilled and submitted onchain by the oracles in the queue, the
oracles are transferred rewards from the escrow as well. These payments ensure
active participation.

Additionally, oracles have to stake tokens before they can service update
requests and submit responses onchain. If an oracle submits a result onchain
that falls outside the queue’s configured parameters, their stake will be
slashed (if the queue has `slashingEnabled`). This helps ensure that oracles are
responding in good faith with accurate information.

#### Onchain data publishing workflow

Now that you understand the terminology and economics, let’s take a look at how
data is published onchain:

1. **Oracle queue setup** - When an update is requested from a queue, the next
   `N` oracles are assigned to the update request and cycled to the back of the
   queue. Each oracle queue in the Switchboard network is independent and
   maintains its own configuration. The configuration influences its level of
   security. This design choice enables users to tailor the oracle queue's
   behavior to match their specific use case. An Oracle queue is stored onchain
   as an account and contains metadata about the queue. A queue is created by
   invoking the
   [oracleQueueInit instruction](https://github.com/switchboard-xyz/solana-sdk/blob/9dc3df8a5abe261e23d46d14f9e80a7032bb346c/javascript/solana.js/src/generated/oracle-program/instructions/oracleQueueInit.ts#L13)
   on the Switchboard Solana program. Some relevant Oracle Queue configurations
   include:<br/><br/>
   - `oracle_timeout` - Interval when stale oracles will be removed if they fail
     to heartbeat.
   - `reward` - Rewards to provide oracles and round openers on this queue.
   - `min_stake` - The minimum amount of stake that oracles must provide to
     remain on the queue.
   - `size` - The current number of oracles on a queue.
   - `max_size` - The maximum number of oracles a queue can support. <br/>
2. **Aggregator/data feed setup** - The aggregator/feed account gets created. A
   feed belongs to a single oracle queue. The feed’s configuration dictates how
   update requests are invoked and routed through the network. <br/><br/>
3. **Job account setup** - In addition to the feed, a job account for each data
   source must be set up. This defines how oracles can fulfill the feed’s update
   requests. This includes defining where the oracles should fetch the data the
   feed is requesting. <br/><br/>
4. **Request assignment** - Once an update has been requested with the feed
   account, the oracle queue assigns the request to different oracles/nodes in
   the queue to fulfill. The oracles will fetch the data from the data source
   defined in each of the feed’s job accounts. Each job account has a weight
   associated with it. The oracle will calculate the weighted median of the
   results from across all the jobs. <br/><br/>
5. **Queue response** - After `minOracleResults` responses are received, the
   onchain program calculates the result using the median of the oracle
   responses. Oracles who respond within the queue’s configured parameters are
   rewarded, while the oracles who respond outside this threshold are slashed
   (if the queue has `slashingEnabled`). <br/><br/>
6. **Update feed** -The updated result is stored in the data feed account so it
   can be read/consumed onchain.

### How to use Switchboard Oracles

To use Switchboard oracles and incorporate off-chain data into a Solana program,
there are two key processes involved:

#### 1. Finding a feed

First, you have to find a feed that provides the data you need. Switchboard
feeds are public, and there are many
[already available that you can choose from](https://app.switchboard.xyz/solana/devnet/explore).
When looking for a feed, you have to decide how accurate/reliable you want the
feed to be, where you want to source the data from, and consider the feed’s
update cadence. When consuming a publicly available feed, you have no control
over these factors, so it’s important to choose carefully!

For example, there is a Switchboard-sponsored
[BTC_USD feed](https://app.switchboard.xyz/solana/mainnet/feed/8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee).
This feed is available on Solana devnet and mainnet with the Pubkey
`8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee`. It provides the current price of
Bitcoin in USD onchain.

The actual onchain data for a Switchboard feed account looks a little like this:

```rust
// from the switchboard solana program
// https://github.com/switchboard-xyz/sbv2-solana/blob/0b5e0911a1851f9ca37042e6ff88db4cd840067b/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L60

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
[Switchboard program here](https://github.com/switchboard-xyz/sbv2-solana/blob/0b5e0911a1851f9ca37042e6ff88db4cd840067b/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L60).

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

These fields are important when determining the accuracy and reliability of a
data feed. For example, the higher the value for `min_job_results`, the more
reliable and accurate the data from the feed will be, as each oracle has to pull
from multiple job sources.

It can help to look at the jobs tab of a feed in Switchboard's explorer. For
example, you can look at the
[BTC_USD feed in the explorer](https://app.switchboard.xyz/solana/devnet/feed/8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee).
Each job listed defines the source the oracles will fetch data from and the
weighting of each source. You can view the actual API endpoints that provide the
data for this specific feed. When determining what data feed to use in your
program, things like this are very important to consider.

Below is a two of the jobs related to the BTC_USD feed. It shows two sources of
data: [MEXC](https://www.mexc.com/) and [Coinbase](https://www.coinbase.com/).

![Oracle Jobs](/public/assets/courses/unboxed/oracle-jobs.png)

#### 2. Reading a feed

Once you've chosen a feed to use, you can start reading the data in that feed.

##### Rust

To do this in rust, you will need to deserialize and read the state stored in
the account. The easiest way is to make use of the `AggregatorAccountData`
struct from the `switchboard_v2` crate in your program:

```rust
// import anchor and switchboard crates
use {
    anchor_lang::prelude::*,
    switchboard_v2::AggregatorAccountData,
};

...

#[derive(Accounts)]
pub struct ConsumeDataAccounts<'info> {
	// pass in data feed account and deserialize to AggregatorAccountData
	pub feed_aggregator: AccountLoader<'info, AggregatorAccountData>,
	...
}
```

Notice that we use the `AccountLoader` type here instead of the normal `Account`
type to deserialize the aggregator account. Due to the size of
`AggregatorAccountData`, the account uses what's called zero copy. This in
combination with `AccountLoader` prevents the account from being loaded into
memory and gives our program direct access to the data instead. When using
`AccountLoader` we can access the data stored in the account in one of three
ways:

- `load_init` after initializing an account (this will ignore the missing
  account discriminator that gets added only after the user’s instruction code)
- `load` when the account is not mutable
- `load_mut` when the account is mutable

If you’d like to learn more, check out the
[Advance Program Architecture lesson](/developers/courses/program-optimization/program-architecture)
where we touch on `Zero-Copy` and `AccountLoader`.

With the aggregator account passed into your program, you can use it to get the
latest oracle result. Specifically, you can use the type's `get_result()`
method:

```rust
// inside an Anchor program
...

let feed = &ctx.accounts.feed_aggregator.load()?;
// get result
let val: f64 = feed.get_result()?.try_into()?;
```

The `get_result()` method defined on the `AggregatorAccountData` struct is safer
than fetching the data with `latest_confirmed_round.result` because Switchboard
has implemented some nifty safety checks.

```rust
// from switchboard program
// https://github.com/switchboard-xyz/sbv2-solana/blob/0b5e0911a1851f9ca37042e6ff88db4cd840067b/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L195

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

##### Typescript

You can also view the current value stored in an `AggregatorAccountData` account
client-side in Typescript.

```typescript
import { AggregatorAccount, SwitchboardProgram} from '@switchboard-xyz/solana.js'

...
...
// create keypair for test user
let user = new anchor.web3.Keypair()

// fetch switchboard devnet program object
switchboardProgram = await SwitchboardProgram.load(
  new anchor.web3.Connection("https://api.devnet.solana.com"),
  user
)

// pass switchboard program object and feed pubkey into AggregatorAccount constructor
aggregatorAccount = new AggregatorAccount(switchboardProgram, solUsedSwitchboardFeed)

// fetch latest SOL price
const solPrice: Big | null = await aggregatorAccount.fetchLatestValue()
if (solPrice === null) {
  throw new Error('Aggregator holds no value')
}
```

Remember, Switchboard data feeds are just accounts that are updated by third
parties (oracles). Given that, you can do anything with the account that you can
typically do with accounts external to your program.

#### Best practices and common pitfalls

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

The BTC_USD feed has Min Update Delay = 6 seconds. This means that the price of
BTC is only updated at a minimum of every 6 seconds on this feed. This is
probably fine for most use cases, but if you wanted to use this feed for
something latency sensitive, it’s probably not a good choice.

It’s also worthwhile to audit a feed's sources in the Jobs section of the oracle
explorer. Since the value that is persisted onchain is the weighted median
result the oracles pull from each source, the sources directly influence what is
stored in the feed. Check for shady links and potentially run the APIs yourself
for a time to gain confidence in them.

Once you have found a feed that fits your needs, you still need to make sure
you're using the feed appropriately. For example, you should still implement
necessary security checks on the account passed into your instruction. Any
account can be passed into your program's instructions, so you should verify
it’s the account you expect it to be.

In Anchor, if you deserialize the account to the `AggregatorAccountData` type
from the `switchboard_v2` crate, Anchor checks that the account is owned by the
Switchboard program. If your program expects that only a specific data feed will
be passed in the instruction, then you can also verify that the public key of
the account passed in matches what it should be. One way to do this is to hard
code the address in the program somewhere and use account constraints to verify
the address passed in matches what is expected.

```rust
use {
  anchor_lang::prelude::*,
  solana_program::{pubkey, pubkey::Pubkey},
	switchboard_v2::{AggregatorAccountData},
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
checks on the data stored in the feed in your program's instruction handler
logic. Two common things to check for are data staleness and the confidence
interval.

Each data feed updates the current value stored in it when triggered by the
oracles. This means the updates are dependent on the oracles in the queue that
it’s assigned to. Depending on what you intend to use the data feed for, it may
be beneficial to verify that the value stored in the account was updated
recently. For example, a lending protocol that needs to determine if a loan’s
collateral has fallen below a certain level may need the data to be no older
than a few seconds. You can have your code check the timestamp of the most
recent update stored in the aggregator account. The following code snippet
checks that the timestamp of the most recent update on the data feed was no more
than 30 seconds ago.

```rust
use {
    anchor_lang::prelude::*,
    anchor_lang::solana_program::clock,
    switchboard_v2::{AggregatorAccountData, SwitchboardDecimal},
};

...
...

let feed = &ctx.accounts.feed_aggregator.load()?;
if (clock::Clock::get().unwrap().unix_timestamp - feed.latest_confirmed_round.round_open_timestamp) <= 30{
      valid_transfer = true;
  }
```

The `latest_confirmed_round` field on the `AggregatorAccountData` struct is of
type `AggregatorRound` defined as:

```rust
// https://github.com/switchboard-xyz/sbv2-solana/blob/0b5e0911a1851f9ca37042e6ff88db4cd840067b/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L17

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
// https://github.com/switchboard-xyz/sbv2-solana/blob/0b5e0911a1851f9ca37042e6ff88db4cd840067b/rust/switchboard-solana/src/oracle_program/accounts/aggregator.rs#L228

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
    switchboard_v2::{AggregatorAccountData, SwitchboardDecimal},
};

...
...

let feed = &ctx.accounts.feed_aggregator.load()?;

// check feed does not exceed max_confidence_interval
feed.check_confidence_interval(SwitchboardDecimal::from_f64(max_confidence_interval))
    .map_err(|_| error!(ErrorCode::ConfidenceIntervalExceeded))?;
```

Lastly, it’s important to plan for worst-case scenarios in your programs. Plan
for feeds going stale and plan for feed accounts closing.

### Conclusion

If you want functional programs that can perform actions based on real-world
data, you’re going to have to use oracles. Fortunately, there are some
trustworthy oracle networks, like Switchboard, that make using oracles easier
than they would otherwise be. However, make sure to do your due diligence on the
oracles you use. You are ultimately responsible for your program's behavior!

## Lab

Let's practice using oracles! We'll be building a "Michael Burry Escrow" program
that locks SOL in an escrow account until SOL is above a certain USD value. This
is named after the investor
[Michael Burry](https://en.wikipedia.org/wiki/Michael_Burry) who's famous for
predicting the 2008 housing market crash.

We will be using the devnet
[SOL_USD](https://app.switchboard.xyz/solana/devnet/feed/GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR)
oracle from switchboard. The program will have two main instructions:

- Deposit - Lock up the SOL and set a USD price to unlock it at.
- Withdraw - Check the USD price and withdraw the SOL if the price is met.

### Program setup

To fully setup our program, we would need to initialize it, create the program
logic and then test. Let's go over the steps one by one. Make sure you have all
the necessary tools installed - `Anchor`, `Solana CLI`, e.t.c

#### Initialize

1. Run the `anchor init <program_name> ` command.

```zsh
anchor init burry-escrow
```

2. Update `Anchor.toml` and `Cargo.toml` files<br/><br/> Add the following to
   the bottom of your Anchor.toml file. This will tell Anchor how to configure
   our local testing environment and will allow us to test our program locally
   without having to deploy and send transactions to devnet.

At the bottom of `Anchor.toml`:

```toml
[test.validator]
url="https://api.devnet.solana.com"

[test]
startup_wait = 10000

[[test.validator.clone]] # sbv2 devnet programID
address = "SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f"

[[test.validator.clone]] # sbv2 devnet IDL
address = "Fi8vncGpNKbq62gPo56G4toCehWNy77GgqGkTaAF5Lkk"

[[test.validator.clone]] # sbv2 SOL/USD Feed
address="GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR"
```

Also, make sure to change the cluster to devnet as we would be deploying on
devnet to interact with the switchboard feed

```toml
[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

Additionally, we want to import the `switchboard-v2` and `anchor-lang` crate in
our programs `Cargo.toml` file. Make sure to update the `Cargo.toml` file in the
`programs/burry-escrow` directory and your dependencies look as follows:

```toml
[dependencies]
anchor-lang = "0.30.1"
switchboard-solana = "0.30.4"
```

#### Program logic

Before we get started with the logic, let’s go over the structure of our
program. With small programs, it’s very easy to add all of the program logic to
a single `lib.rs` file and call it a day. To keep it more organized though, it’s
helpful to break it up across different files. Our program will have the
following files within the `programs/src` directory:

`/instructions/deposit.rs`

`/instructions/deposit.rs`

`/instructions/close.rs`

`/instructions/mod.rs`

`errors.rs`

`state.rs`

`lib.rs`

The `lib.rs` file will still serve as the entry point to our program, but the
logic for each instruction will be contained in their own separate file. Go
ahead and create the program architecture described above and then modify the
following files.

##### 1. Entrypoint (lib.rs)

Before we write any logic, we are going to set up all of our boilerplate
information. Starting with `lib.rs`. Though our actual logic will live in the
`/instructions` directory, the `lib.rs` file will serve as the entrypoint to our
program. It will define the API endpoints that all transactions must go through.
Paste the code below in the `lib.rs` file. Ignore errors for now until we
complete all files

```rust
use anchor_lang::prelude::*;
use instructions::deposit::*;
use instructions::withdraw::*;
use instructions::close::*;

pub mod instructions;
pub mod state;
pub mod errors;

declare_id!("YOUR_PROGRAM_KEY_HERE"); // This would be automatically updated when you run `anchor keys sync`

#[program]
mod burry_escrow {

    use super::*;

    pub fn deposit(ctx: Context<Deposit>, escrow_amt: u64, unlock_price: f64) -> Result<()> {
        deposit_handler(ctx, escrow_amt, unlock_price)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        withdraw_handler(ctx)
    }

     pub fn close_escrow_account(ctx:Context<CloseEscrow>) -> Result<()> {
        close_handler(ctx)
    }
}
```

**Run `anchor keys sync`**

```zsh
anchor keys sync
```

This updates the Program ID automatically in the `lib.rs` and `Anchor.toml`. It
is ideal to use this approach for consistency

##### 2. State / Accounts (state.rs)

Next, let's define our data account `EscrowState` for this program . Our data
account will store two pieces of info:

- `unlock_price` - The price of SOL in USD at which point you can withdraw; you
  can hard-code it to whatever you want (e.g. $21.53)
- `escrow_amount` - Keeps track of how many lamports are stored in the escrow
  account

We will also be defining our PDA seed of `"MICHAEL BURRY"`, our hardcoded
SOL_USD oracle pubkey `SOL_USDC_FEED`, and a discriminator length
`DISCRIMINATOR_SIZE` of 8. Anchor uses an 8-byte discriminator to uniquely
identify the type of data in each account. Every account in Anchor has this
prefix to ensure the program can safely deserialize the data and validate the
account type. This prevents scenarios where incorrect account data is passed or
used in the program. Inside the `state.rs` file, paste the following:

```rust
use anchor_lang::prelude::*;

pub const ESCROW_SEED: &[u8] = b"MICHAEL BURRY";
pub const SOL_USDC_FEED: &str = "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR";
pub const DISCRIMINATOR_SIZE: usize = 8;


#[account]
#[derive(InitSpace)]
pub struct EscrowState {
    pub unlock_price: f64,
    pub escrow_amount: u64,
}
```

##### 3. Errors (errors.rs)

Let’s define the custom errors we’ll use throughout the program. Inside the
`errors.rs` file, paste the following:

```rust
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
    SolPriceAboveUnlockPrice,
}
```

##### 4. Actual logic

Our actual logic / program instructions would live in the `deposit.rs`,
`withdraw.rs`, and `close.rs` files but we would use the `instructions/mod.rs`
to link these files to the entry point

- **Module setup (mod.rs)**

Let's set up our `instructions/mod.rs` file.

```rust
// inside mod.rs
pub mod deposit;
pub mod withdraw;
pub mod close;
```

- **Deposit (deposit.rs)**

Now that we have all of the boilerplate out of the way, lets move onto our
Deposit instruction handler. This will live in the
`/src/instructions/deposit.rs` file. When a user deposits, a PDA should be
created with the `“MICHAEL BURRY”` string and the user’s pubkey as seeds. This
inherently means a user can only open one escrow account at a time. The
instruction handler should initialize an account at this PDA and send the amount
of SOL that the user wants to lock up to it. The user will need to be a signer.
Copy and paste the following code into the file.

```rust
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    system_instruction::transfer,
    program::invoke
};

pub fn deposit_handler(ctx: Context<Deposit>, escrow_amount: u64, unlock_price: f64) -> Result<()> {
    msg!("Depositing funds in escrow...");

    let escrow_state = &mut ctx.accounts.escrow_account;
    escrow_state.unlock_price = unlock_price;
    escrow_state.escrow_amount = escrow_amount;

    let transfer_ix = transfer(
        &ctx.accounts.user.key(),
        &escrow_state.key(),
        escrow_amount
    );

    invoke(
        &transfer_ix,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.escrow_account.to_account_info(),
            ctx.accounts.system_program.to_account_info()
        ]
    )?;

    msg!("Transfer complete. Escrow will unlock SOL at {}", &ctx.accounts.escrow_account.unlock_price);

    Ok(())
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    // user account
    #[account(mut)]
    pub user: Signer<'info>,
    // account to store SOL in escrow
    #[account(
        init,
        seeds = [ESCROW_SEED, user.key().as_ref()],
        bump,
        payer = user,
        space = EscrowState::INIT_SPACE + DISCRIMINATOR_SIZE
    )]
    pub escrow_account: Account<'info, EscrowState>,

    pub system_program: Program<'info, System>,
}
```

Now, let's analyze the above code and some key aspects.

<ins>Accounts</ins>

Notice the constraints we added to the accounts:

- Because we'll be transferring SOL from the User account to the `escrow_state`
  account, they both need to be mutable.
- We know the `escrow_account` is supposed to be a PDA derived with the “MICHAEL
  BURRY” string and the user’s pubkey. We can use Anchor account constraints to
  guarantee that the address passed in actually meets that requirement.
- We also know that we have to initialize an account at this PDA to store some
  state for the program. We use the `init` constraint here.

<ins>Logic</ins>

For the logic, all we need to do is to initialize the state of the
`escrow_state` account and transfer the SOL. We expect the user to pass in the
amount of SOL they want to lock up in escrow and the price to unlock it at. We
will store these values in the `escrow_state` account.

After that, the method should execute the transfer. This program will be locking
up native SOL. Because of this, we don’t need to use token accounts or the
Solana token program. We’ll have to use the `system_program` to transfer the
lamports the user wants to lock up in escrow and invoke the transfer
instruction.

That’s is the gist of the deposit instruction! Feel free to look over the code
over again

- **Withdraw (withdraw.rs)**

This code will go in the `withdraw.rs` file. Copy and paste it in your file

```rust
use crate::state::*;
use crate::errors::*;
use std::str::FromStr;
use anchor_lang::prelude::*;
use switchboard_solana::AggregatorAccountData;
use anchor_lang::solana_program::clock::Clock;

pub fn withdraw_handler(ctx: Context<Withdraw>) -> Result<()> {
    let feed = &ctx.accounts.feed_aggregator.load()?;
    let escrow_state = &ctx.accounts.escrow_account;

    // 1. check whether the feed has been updated in the last 300 seconds
    feed.check_staleness(Clock::get().unwrap().unix_timestamp, 300)
    .map_err(|_| error!(EscrowErrorCode::StaleFeed))?;

    // 2. Get current price of SOL in the aggregator account (get result())
    let val: f64 = feed.get_result()?.try_into()?;

    msg!("Current feed result is {}!", val);
    msg!("Unlock price is {}", escrow_state.unlock_price);


   // 3. Return error if current price is below unlock price else transfer out of escrow account
   if val < escrow_state.unlock_price as f64 {
        return Err(EscrowErrorCode::SolPriceAboveUnlockPrice.into())
    }

    // 'Transfer: `from` must not carry data'
    **escrow_state.to_account_info().try_borrow_mut_lamports()? = escrow_state
        .to_account_info()
        .lamports()
        .checked_sub(escrow_state.escrow_amount)
        .ok_or(ProgramError::InvalidArgument)?;

    **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.user
        .to_account_info()
        .lamports()
        .checked_add(escrow_state.escrow_amount)
        .ok_or(ProgramError::InvalidArgument)?;

    Ok(())
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    // user account
    #[account(mut)]
    pub user: Signer<'info>,
    // escrow account
    #[account(
        mut,
        seeds = [ESCROW_SEED, user.key().as_ref()],
        bump,
        close = user
    )]
    pub escrow_account: Account<'info, EscrowState>,
    // Switchboard SOL feed aggregator
    #[account(
        address = Pubkey::from_str(SOL_USDC_FEED).unwrap()
    )]
    pub feed_aggregator: AccountLoader<'info, AggregatorAccountData>,
    pub system_program: Program<'info, System>,
}
```

Now, let's analyze the above code and some key aspects.

<ins>Accounts</ins>

The withdraw instruction will require the same three accounts as the deposit
instruction plus the SOL_USDC Switchboard feed account.

Notice we’re using the close constraint because once the transaction completes,
we want to close the `escrow_account`. The SOL used as rent in the account will
be transferred to the user account.

We also use the address constraints to verify that the feed account passed in is
actually the `SOL_USDC_FEED` and not some other feed (we have the SOL_USDC_FEED
address hard coded). In addition, the AggregatorAccountData struct that we
deserialize comes from the Switchboard rust crate. It verifies that the given
account is owned by the switchboard program and allows us to easily look at its
values. You’ll notice it’s wrapped in a `AccountLoader`. This is because the
feed is actually a fairly large account and it needs to be zero copied.

<ins>Logic</ins>

Now let's implement the instruction handler logic.

- First, we check if the feed is stale.
- Then we fetch the current price of SOL stored in the `feed_aggregator`
  account.
- Lastly, we want to check that the current price is above the escrow
  `unlock_price`. If it is, then we transfer the SOL from the escrow account
  back to the user and close the account. If it isn’t, then the instruction
  should finish and return an error.

To finish the logic off, we will execute the transfer, this time we will have to
transfer the funds in a different way. Because we are transferring from an
account that also holds data we cannot use the `system_program::transfer` method
like before. If we try to, the instruction will fail to execute with the
following error.

```zsh
'Transfer: `from` must not carry data'
```

To account for this, we’ll use `try_borrow_mut_lamports()` on each account and
add/subtract the amount of lamports stored in each account.

```rust
// 'Transfer: `from` must not carry data'
  **escrow_state.to_account_info().try_borrow_mut_lamports()? = escrow_state
      .to_account_info()
      .lamports()
      .checked_sub(escrow_state.escrow_amount)
      .ok_or(ProgramError::InvalidArgument)?;

  **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.user
      .to_account_info()
      .lamports()
      .checked_add(escrow_state.escrow_amount)
      .ok_or(ProgramError::InvalidArgument)?;
```

- **Close ( close.rs )**

Here we simply define a `close_handlee` method to help us close the escrow
account when testing. For cases when we test with a price above the unlock
price, we would be left with an open escrow_account and will prevent us from
testing further. So we implemnt this function strictly for testing purposes. Go
ahead and paste the code below. It is quite similar to the withdraw function
above.

```rust
use crate::state::*;
use anchor_lang::prelude::*;

pub fn close_handler(ctx: Context<CloseEscrow>) -> Result<()> {
    let escrow_state = &ctx.accounts.escrow_account;

    // Transfer remaining lamports from the escrow to the user
    let escrow_lamports = **escrow_state.to_account_info().lamports.borrow();

    **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.user
        .to_account_info()
        .lamports()
        .checked_add(escrow_lamports)
        .ok_or(ProgramError::InvalidArgument)?;

    // Set the escrow account's lamports to zero
    **escrow_state.to_account_info().try_borrow_mut_lamports()? = 0;

    // After this, the escrow account will automatically be closed when the function returns
    msg!("Escrow account closed successfully and {} lamports transferred to the user.", escrow_lamports);

    Ok(())
}

#[derive(Accounts)]
pub struct CloseEscrow<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [ESCROW_SEED, user.key().as_ref()],
        bump,
        close = user
    )]
    pub escrow_account: Account<'info, EscrowState>,

    pub system_program: Program<'info, System>,
}

```

And that’s it for the program! At this point, you should be able to run
`anchor build` without any errors.

<Callout type="note">

If you see an error like the one presented below, you can safely ignore it.

```bash
Compiling switchboard-v2 v0.4.0
Error: Function _ZN86_$LT$switchboard_v2..aggregator..AggregatorAccountData$u20$as$u20$core..fmt..Debug$GT$3fmt17hea9f7644392c2647E Stack offset of 4128 exceeded max offset of 4096 by 32 bytes, please minimize large stack variables
```

</Callout>

#### Testing

Let's write some tests. We should have four of them:

- Creating an Escrow with the unlock price **_below_** the current SOL price so
  we can test withdrawing it
- Withdrawing and closing from the above escrow
- Creating an Escrow with the unlock price **_above_** the current SOL price so
  we can test withdrawing it
- Withdrawing and failing from the above escrow. We use the
  `close_escrow_account` method after this to help us close the escrow account.

Note that there can only be one escrow per user, so the above order matters. You
can also modify to your taste and use the `close_escrow_account` handler to help
you reset the state.

We'll provide all the testing code in one snippet. Take a look through to make
sure you understand it before running `anchor test`. Copy and paste the code
below in `tests/burry-escrow.ts`. Also make sure to install the necessary
dependencies .

```zsh
npm install @switchboard-xyz/common @switchboard-xyz/solana.js
```

```typescript
// tests/burry-escrow.ts

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BurryEscrow } from "../target/types/burry_escrow";
import { Big } from "@switchboard-xyz/common";
import {
  AggregatorAccount,
  AnchorWallet,
  SwitchboardProgram,
} from "@switchboard-xyz/solana.js";
import { assert } from "chai";

describe("the burry-escrow program", () => {
  // Configure the client to use Devnet as the switchboard feed is on devnet

  const connection = new anchor.web3.Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );
  const provider = new anchor.AnchorProvider(
    connection,
    anchor.AnchorProvider.env().wallet,
    anchor.AnchorProvider.defaultOptions(),
  );
  anchor.setProvider(provider);
  const program = anchor.workspace.BurryEscrow as Program<BurryEscrow>;
  const payer = (provider.wallet as AnchorWallet).payer;
  const solUsedSwitchboardFeed = new anchor.web3.PublicKey(
    "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR",
  );

  it("creates an escrow account below the current SOL price", async () => {
    // fetch switchboard devnet program object
    const switchboardProgram = await SwitchboardProgram.load(
      new anchor.web3.Connection("https://api.devnet.solana.com"),
      payer,
    );
    const aggregatorAccount = new AggregatorAccount(
      switchboardProgram,
      solUsedSwitchboardFeed,
    );

    // derive escrow state account
    const [escrowState] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("MICHAEL BURRY"), payer.publicKey.toBuffer()],
      program.programId,
    );

    // fetch latest SOL price
    const solPrice: Big | null = await aggregatorAccount.fetchLatestValue();
    if (solPrice === null) {
      throw new Error("Aggregator holds no value");
    }
    const failUnlockPrice = solPrice.minus(10).toNumber();
    const amountToLockUp = new anchor.BN(100);

    // Send transaction
    try {
      const tx = await program.methods
        .deposit(amountToLockUp, failUnlockPrice)
        .accounts({
          user: payer.publicKey,
          escrowAccount: escrowState,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      const latestBlockHash = await provider.connection.getLatestBlockhash();

      await provider.connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: tx,
        },
        "confirmed",
      );

      // Fetch the created account
      const newAccount = await program.account.escrowState.fetch(escrowState);

      const escrowBalance = await provider.connection.getBalance(
        escrowState,
        "confirmed",
      );
      console.log("On-chain unlock price:", newAccount.unlockPrice);
      console.log("Amount in escrow:", escrowBalance);

      // Check whether the data on-chain is equal to local 'data'
      assert(failUnlockPrice == newAccount.unlockPrice);
      assert(escrowBalance > 0);
    } catch (e) {
      console.log(e);
      assert.fail(e);
    }
  });

  it("withdraws from an escrow account successfully", async () => {
    // derive escrow address
    const [escrowState] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("MICHAEL BURRY"), payer.publicKey.toBuffer()],
      program.programId,
    );

    // send tx
    const tx = await program.methods
      .withdraw()
      .accounts({
        user: payer.publicKey,
        escrowAccount: escrowState,
        feedAggregator: solUsedSwitchboardFeed,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

    const latestBlockHash = await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: tx,
      },
      "confirmed",
    );

    // assert that the escrow account has been closed
    let accountFetchDidFail = false;
    try {
      await program.account.escrowState.fetch(escrowState);
    } catch (e) {
      accountFetchDidFail = true;
    }

    assert(accountFetchDidFail);
  });

  it("creates an escrow account above the current SOL price", async () => {
    // fetch switchboard devnet program object
    const switchboardProgram = await SwitchboardProgram.load(
      new anchor.web3.Connection("https://api.devnet.solana.com"),
      payer,
    );
    const aggregatorAccount = new AggregatorAccount(
      switchboardProgram,
      solUsedSwitchboardFeed,
    );

    // derive escrow state account
    const [escrowState] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("MICHAEL BURRY"), payer.publicKey.toBuffer()],
      program.programId,
    );
    console.log("Escrow Account: ", escrowState.toBase58());

    // fetch latest SOL price
    const solPrice: Big | null = await aggregatorAccount.fetchLatestValue();
    if (solPrice === null) {
      throw new Error("Aggregator holds no value");
    }
    const failUnlockPrice = solPrice.plus(10).toNumber();
    const amountToLockUp = new anchor.BN(100);

    // Send transaction
    try {
      const tx = await program.methods
        .deposit(amountToLockUp, failUnlockPrice)
        .accounts({
          user: payer.publicKey,
          escrowAccount: escrowState,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      const latestBlockHash = await provider.connection.getLatestBlockhash();

      await provider.connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: tx,
        },
        "confirmed",
      );

      console.log("Your transaction signature", tx);

      // Fetch the created account
      const newAccount = await program.account.escrowState.fetch(escrowState);

      const escrowBalance = await provider.connection.getBalance(
        escrowState,
        "confirmed",
      );
      console.log("On-chain unlock price:", newAccount.unlockPrice);
      console.log("Amount in escrow:", escrowBalance);

      // Check whether the data on-chain is equal to local 'data'
      assert(failUnlockPrice == newAccount.unlockPrice);
      assert(escrowBalance > 0);
    } catch (e) {
      console.log(e);
      assert.fail(e);
    }
  });

  it("fails to withdraw while price is below unlock price", async () => {
    let didFail = false;

    // derive escrow address
    const [escrowState] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("MICHAEL BURRY"), payer.publicKey.toBuffer()],
      program.programId,
    );

    // send tx
    try {
      const tx = await program.methods
        .withdraw()
        .accounts({
          user: payer.publicKey,
          escrowAccount: escrowState,
          feedAggregator: solUsedSwitchboardFeed,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([payer])
        .rpc();

      const latestBlockHash = await provider.connection.getLatestBlockhash();

      await provider.connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: tx,
        },
        "confirmed",
      );
      console.log("Your transaction signature", tx);
    } catch (e) {
      // verify tx returns expected error
      didFail = true;
      console.log(e.error.errorMessage);
      assert(
        e.error.errorMessage ==
          "Current SOL price is not above Escrow unlock price.",
      );
    }

    assert(didFail);

    try {
      const tx = await program.methods
        .closeEscrowAccount()
        .accounts({
          escrowAccount: escrowState,
          user: payer.publicKey,
        })
        .signers([payer])
        .rpc();

      const latestBlockHash = await provider.connection.getLatestBlockhash();

      await provider.connection.confirmTransaction(
        {
          blockhash: latestBlockHash.blockhash,
          lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
          signature: tx,
        },
        "confirmed",
      );
      console.log("Escrow account closed successfully.");
    } catch (e) {
      console.log("Escrow account was already closed or does not exist.");
    }
  });
});
```

If you feel confident in the testing logic, go ahead and run `anchor test` in
your shell of choice. You should get four passing tests. Make sure you have
enough `SOL` in your wallet for deploying and a good internet connection. After
testing the first time, you can run `anchor test --skip-deploy ` to skip the
deployment again and modify your test cases to your taste.

If something went wrong, go back through the lab and make sure you got
everything right. Pay close attention to the intent behind the code rather than
just copy/pasting. Also feel free to review the working code
[on the `main` branch of its Github repository](https://github.com/Unboxed-Software/michael-burry-escrow).

### Challenge

As an independent challenge, create a fallback plan if the data feed ever goes
down. If the Oracle queue has not updated the aggregator account in X time or if
the data feed account does not exist anymore, withdraw the user’s escrowed
funds.

A potential solution to this challenge can be found
[in the Github repository on the `challenge-solution` branch](https://github.com/Unboxed-Software/michael-burry-escrow/tree/challenge-solution).

<Callout type="success" title="Completed the lab?">
Push your code to GitHub and
[tell us what you thought of this lesson](https://form.typeform.com/to/IPH0UGz7#answers-lesson=1a5d266c-f4c1-4c45-b986-2afd4be59991)!
</Callout>
