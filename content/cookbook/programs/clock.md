---
title: How to get clock in a program
sidebarSortOrder: 2
description: "Learn how to get the clock in a Solana program."
---

Getting a clock (ie, the current time) can be done in two ways:

1. Passing `SYSVAR_CLOCK_PUBKEY` into an instruction
2. Accessing Clock directly inside an instruction.

It is nice to know both the methods, because some legacy programs still expect
the `SYSVAR_CLOCK_PUBKEY` as an account.

## Passing Clock as an account inside an instruction

Let's create an instruction which receives an account for initializing and the
sysvar pubkey

```rust filename="get-clock-sysvar.rs"
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    sysvar::Sysvar,
};

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct HelloState {
    is_initialized: bool,
}

// Accounts required
/// 1. [signer, writable] Payer
/// 2. [writable] Hello state account
/// 3. [] Clock sys var
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    // Payer account
    let _payer_account = next_account_info(accounts_iter)?;
    // Hello state account
    let hello_state_account = next_account_info(accounts_iter)?;
    // Clock sysvar
    let sysvar_clock_pubkey = next_account_info(accounts_iter)?;

    let mut hello_state = HelloState::try_from_slice(&hello_state_account.data.borrow())?;
    hello_state.is_initialized = true;
    hello_state.serialize(&mut &mut hello_state_account.data.borrow_mut()[..])?;
    msg!("Account initialized :)");

    // Type casting [AccountInfo] to [Clock]
    let clock = Clock::from_account_info(&sysvar_clock_pubkey)?;
    // Getting timestamp
    let current_timestamp = clock.unix_timestamp;
    msg!("Current Timestamp: {}", current_timestamp);

    Ok(())
}
```

Now we pass the clock's sysvar public address via the client

```typescript filename="clock-sysvar-client.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

(async () => {
  const programId = new PublicKey(
    "77ezihTV6mTh2Uf3ggwbYF2NyGJJ5HHah1GrdowWJVD3",
  );

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const latestBlockHash = await connection.getLatestBlockhash();

  // Airdropping 1 SOL
  const feePayer = Keypair.generate();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: await connection.requestAirdrop(
        feePayer.publicKey,
        LAMPORTS_PER_SOL,
      ),
    },
    "confirmed",
  );

  // Hello state account
  const helloAccount = Keypair.generate();

  const accountSpace = 1; // because there exists just one boolean variable
  const rentRequired =
    await connection.getMinimumBalanceForRentExemption(accountSpace);

  // Allocating space for hello state account
  const allocateHelloAccountIx = SystemProgram.createAccount({
    fromPubkey: feePayer.publicKey,
    lamports: rentRequired,
    newAccountPubkey: helloAccount.publicKey,
    programId: programId,
    space: accountSpace,
  });

  // Passing Clock Sys Var
  const passClockIx = new TransactionInstruction({
    programId: programId,
    keys: [
      {
        isSigner: true,
        isWritable: true,
        pubkey: feePayer.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: helloAccount.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SYSVAR_CLOCK_PUBKEY,
      },
    ],
  });

  const transaction = new Transaction();
  transaction.add(allocateHelloAccountIx, passClockIx);

  const txHash = await sendAndConfirmTransaction(connection, transaction, [
    feePayer,
    helloAccount,
  ]);

  console.log(`Transaction succeeded. TxHash: ${txHash}`);
})();
```

## Accessing Clock directly inside an instruction

Let's create the same instruction, but without expecting the
`SYSVAR_CLOCK_PUBKEY` from the client side.

```rust filename="get-clock-directly.rs"
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    sysvar::Sysvar,
};

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct HelloState {
    is_initialized: bool,
}

// Accounts required
/// 1. [signer, writable] Payer
/// 2. [writable] Hello state account
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    // Payer account
    let _payer_account = next_account_info(accounts_iter)?;
    // Hello state account
    let hello_state_account = next_account_info(accounts_iter)?;

    // Getting clock directly
    let clock = Clock::get()?;

    let mut hello_state = HelloState::try_from_slice(&hello_state_account.data.borrow())?;
    hello_state.is_initialized = true;
    hello_state.serialize(&mut &mut hello_state_account.data.borrow_mut()[..])?;
    msg!("Account initialized :)");

    // Getting timestamp
    let current_timestamp = clock.unix_timestamp;
    msg!("Current Timestamp: {}", current_timestamp);

    Ok(())
}
```

The client side instruction, now only needs to pass the state and payer
accounts.

```typescript filename="clock-directly-client.rs"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

(async () => {
  const programId = new PublicKey(
    "4ZEdbCtb5UyCSiAMHV5eSHfyjq3QwbG3yXb6oHD7RYjk",
  );

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const latestBlockHash = await connection.getLatestBlockhash();

  // Airdropping 1 SOL
  const feePayer = Keypair.generate();
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: await connection.requestAirdrop(
        feePayer.publicKey,
        LAMPORTS_PER_SOL,
      ),
    },
    "confirmed",
  );

  // Hello state account
  const helloAccount = Keypair.generate();

  const accountSpace = 1; // because there exists just one boolean variable
  const rentRequired =
    await connection.getMinimumBalanceForRentExemption(accountSpace);

  // Allocating space for hello state account
  const allocateHelloAccountIx = SystemProgram.createAccount({
    fromPubkey: feePayer.publicKey,
    lamports: rentRequired,
    newAccountPubkey: helloAccount.publicKey,
    programId: programId,
    space: accountSpace,
  });

  const initIx = new TransactionInstruction({
    programId: programId,
    keys: [
      {
        isSigner: true,
        isWritable: true,
        pubkey: feePayer.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: helloAccount.publicKey,
      },
    ],
  });

  const transaction = new Transaction();
  transaction.add(allocateHelloAccountIx, initIx);

  const txHash = await sendAndConfirmTransaction(connection, transaction, [
    feePayer,
    helloAccount,
  ]);

  console.log(`Transaction succeeded. TxHash: ${txHash}`);
})();
```
