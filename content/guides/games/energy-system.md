---
date: 2024-04-25T00:00:00Z
difficulty: intermediate
title: Build an Energy System for Casual Games on Solana
description:
  Learn how to build an on-chain energy system for a game, allowing players to
  expend energy to perform actions, refilling it over time.
tags:
  - games
  - anchor
  - program
  - react
  - web3js
  - unity
  - rust
keywords:
  - tutorial
  - transactions
  - blockchain developer
  - blockchain tutorial
  - web3 developer
  - anchor
  - games
  - energy system
  - time based
  - onchain timer
  - example
---

Casual games commonly use energy systems, meaning that actions in the game cost
energy which refills over time. In this guide we will walk through how to build
one on Solana. If you don't have any prior Solana knowledge, start with the
[Hello World Example](/content/guides/games/hello-world.md) instead.

You can easily set up a new game with an energy system and a React client using
[Create Solana Game](https://github.com/solana-developers/solana-game-preset).
Just run the command:

```bash
npx create-solana-game your-game-name
```

> You can find a tutorial on
> [how to use `create-solana-game`](https://youtu.be/fnhivg_pemI?si=6xIubFFYPOGiEjKY).
> and also a
> [video walkthrough](https://youtu.be/YYQtRCXJBgs?si=fIZRFkIYJ9wYjEcI) of the
> example being explained in this guide below.

## Anchor program

For starters, we will guide you through creating an Anchor program that
gradually replenishes the player's energy reserves over time. The energy will
enable them to execute various actions within the game. In our example, a
lumberjack will chop trees with every tree rewarding one wood and costing one
energy point.

### Creating the player account

First the player needs to create an account which saves the state of our player.
We will also save the Unix time stamp of the player's last interaction with the
program in the `last_login` value. With this state, we will be able to calculate
how much energy the player has at a certain point in time. We also have a value
for how much wood the lumberjack cuts in the game.

```rust
pub fn init_player(ctx: Context<InitPlayer>) -> Result<()> {
    ctx.accounts.player.energy = MAX_ENERGY;
    ctx.accounts.player.last_login = Clock::get()?.unix_timestamp;
    Ok(())
}

...

#[derive(Accounts)]
pub struct InitPlayer <'info> {
    #[account(
        init,
        payer = signer,
        space = 1000,
        seeds = [b"player".as_ref(), signer.key().as_ref()],
        bump,
    )]
    pub player: Account<'info, PlayerData>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct PlayerData {
    pub name: String,
    pub level: u8,
    pub xp: u64,
    pub wood: u64,
    pub energy: u64,
    pub last_login: i64
}
```

### Chopping trees

Then whenever the player calls the `chop_tree` instruction we will check if the
player has enough energy and reward them with one wood (by incrementing the
player's wood count).

```rust
#[error_code]
pub enum ErrorCode {
    #[msg("Not enough energy")]
    NotEnoughEnergy,
}

pub fn chop_tree(mut ctx: Context<ChopTree>) -> Result<()> {
    let account = &mut ctx.accounts;
    update_energy(account)?;

    if ctx.accounts.player.energy == 0 {
        return err!(ErrorCode::NotEnoughEnergy);
    }

    ctx.accounts.player.wood = ctx.accounts.player.wood + 1;
    ctx.accounts.player.energy = ctx.accounts.player.energy - 1;
    msg!("You chopped a tree and got 1 wood. You have {} wood and {} energy left.", ctx.accounts.player.wood, ctx.accounts.player.energy);
    Ok(())
}
```

### Calculating the energy

The interesting part happens in the `update_energy` function. We check how much
time has passed and calculate the energy that the player will have at the given
time. We will do the same in the client. We lazily update the energy instead of
polling it all the time. This is a common technique in game development.

```rust
const TIME_TO_REFILL_ENERGY: i64 = 60;
const MAX_ENERGY: u64 = 10;

pub fn update_energy(ctx: &mut ChopTree) -> Result<()> {
    let mut time_passed: i64 = &Clock::get()?.unix_timestamp - &ctx.player.last_login;
    let mut time_spent: i64 = 0;
    while time_passed > TIME_TO_REFILL_ENERGY {
        ctx.player.energy = ctx.player.energy + 1;
        time_passed -= TIME_TO_REFILL_ENERGY;
        time_spent += TIME_TO_REFILL_ENERGY;
        if ctx.player.energy == MAX_ENERGY {
            break;
        }
    }

    if ctx.player.energy >= MAX_ENERGY {
        ctx.player.last_login = Clock::get()?.unix_timestamp;
    } else {
        ctx.player.last_login += time_spent;
    }

    Ok(())
}
```

## JavaScript client

Here is a
[complete example](https://github.com/solana-developers/solana-game-starter-kits/tree/main/lumberjack)
using `create-solana-game`, with a React client.

### Create connection

In the Anchor.ts file we create a connection to the Solana blockchain (in this
case, devnet):

```js
export const connection = new Connection(
  "https://api.devnet.solana.com",
  "confirmed",
);
```

Notice that the confirmation parameter is set to `confirmed`. This means that we
wait until the transactions are `confirmed` instead of `finalized`. This means
that we wait until the super majority of the network said that the transaction
is valid. This takes around 400ms and there was never a confirmed transaction
which did not get finalized. Generally for games, `confirmed` is the perfect
transaction commitment level.

### Initialize player data

First, we will find the program address for the player account using the seed
string `player` and the player's public key
([deriving the PDA](/docs/core/pda.md)). Then we call `initPlayer` to create the
account.

```js
const [pda] = PublicKey.findProgramAddressSync(
  [Buffer.from("player", "utf8"), publicKey.toBuffer()],
  new PublicKey(LUMBERJACK_PROGRAM_ID),
);

const transaction = program.methods
  .initPlayer()
  .accounts({
    player: pda,
    signer: publicKey,
    systemProgram: SystemProgram.programId,
  })
  .transaction();

const tx = await transaction;
const txSig = await sendTransaction(tx, connection, {
  skipPreflight: true,
});

await connection.confirmTransaction(txSig, "confirmed");
```

### Subscribe to account updates

Next we will use websockets within the JavaScript client to subscribe and listen
for changes on the player's account. We use websockets here (over manually
polling the RPC) because it is a faster way to get the changes.

`connection.onAccountChange` creates a socket connection to the RPC node which
will push any changes that happen to the account to the client. We can then use
the `program.coder` to decode the account data into the TypeScript types and
directly use it in the game.

```js
useEffect(() => {
  if (!publicKey) {
    console.log("Missing public key");
    return;
  }

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("player", "utf8"), publicKey.toBuffer()],
    new PublicKey(LUMBERJACK_PROGRAM_ID),
  );

  const fetchPlayerData = async () => {
    try {
      const data = await program.account.playerData.fetch(pda);
      setGameState(data);
    } catch (error) {
      console.error("Error fetching player data:", error);
      window.alert("No player data found, please init!");
    }
  };

  fetchPlayerData();

  const handleAccountChange = (account: AccountInfo<Buffer>) => {
    try {
      const decodedData = program.coder.accounts.decode("playerData", account.data);
      setGameState(decodedData);
    } catch (error) {
      console.error("Error decoding account data:", error);
    }
  };

  const subscriptionId = connection.onAccountChange(pda, handleAccountChange);

  return () => {
    connection.removeAccountChangeListener(subscriptionId);
  };
}, [publicKey]);

```

### Calculate energy and show count down

In the JavaScript client, we can now perform the same logic as in the program to
precalculate how much energy the player would have at this point in time and
show a countdown timer for the player so that he knows when the next energy will
be available:

```js
useEffect(() => {
    const interval = setInterval(async () => {
        if (gameState == null || gameState.lastLogin == undefined || gameState.energy >= 10) {return;}
        const lastLoginTime = gameState.lastLogin * 1000;
        let timePassed = ((Date.now() - lastLoginTime) / 1000);
        while (timePassed > TIME_TO_REFILL_ENERGY && gameState.energy < MAX_ENERGY) {
            gameState.energy = (parseInt(gameState.energy) + 1);
            gameState.lastLogin = parseInt(gameState.lastLogin) + TIME_TO_REFILL_ENERGY;
            timePassed -= TIME_TO_REFILL_ENERGY;
        }
        setTimePassed(timePassed);
        let nextEnergyIn = Math.floor(TIME_TO_REFILL_ENERGY - timePassed);
        if (nextEnergyIn < TIME_TO_REFILL_ENERGY && nextEnergyIn > 0) {
            setEnergyNextIn(nextEnergyIn);
        } else {
            setEnergyNextIn(0);
        }

    }, 1000);

    return () => clearInterval(interval);
}, [gameState, timePassed]);

...

{(gameState && <div className="flex flex-col items-center">
    {("Wood: " + gameState.wood + " Energy: " + gameState.energy + " Next energy in: " + nextEnergyIn )}
</div>)}

```

With this you can now build any energy based game and even if someone builds a
bot for the game the most they can do is play optimally, which may be even
easier to achieve when playing normally depending on the logic of your game.

This game becomes even better when you add the ability to
[use tokens in games](/content/guides/games/interact-with-tokens.md). For
example, rewarding players with some SPL tokens for their actions in game..
