---
title: How to do Cross Program Invocation
sidebarSortOrder: 4
description: "Learn how to do Cross Program Invocation in Solana programs."
---

A cross program invocation, is simply put calling another program's instruction
inside our program. One best example to put forth is Uniswap's `swap`
functionality. The `UniswapV2Router` contract, calls the necessary logic to
swap, and calls the `ERC20` contract's transfer function to swap from one person
to another. The same way, we can call a program's instruction to have multitude
of purposes.

Lets have a look at our first example which is the
`SPL Token Program's transfer` instruction. The required accounts we would need
for a transfer to happen are

1. The Source Token Account (The account which we are holding our tokens)
2. The Destination Token Account (The account which we would be transferring our
   tokens to)
3. The Source Token Account's Holder (Our wallet address which we would be
   signing for)

```rust filename="cpi-transfer.rs"
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use spl_token::instruction::transfer;

entrypoint!(process_instruction);

// Accounts required
/// 1. [writable] Source Token Account
/// 2. [writable] Destination Token Account
/// 3. [signer] Source Token Account holder's PubKey
/// 4. [] Token Program
pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    // Accounts required for token transfer

    // 1. Token account we hold
    let source_token_account = next_account_info(accounts_iter)?;
    // 2. Token account to send to
    let destination_token_account = next_account_info(accounts_iter)?;
    // 3. Our wallet address
    let source_token_account_holder = next_account_info(accounts_iter)?;
    // 4. Token Program
    let token_program = next_account_info(accounts_iter)?;

    // Parsing the token transfer amount from instruction data
    // a. Getting the 0th to 8th index of the u8 byte array
    // b. Converting the obtained non zero u8 to a proper u8 (as little endian integers)
    // c. Converting the little endian integers to a u64 number
    let token_transfer_amount = instruction_data
        .get(..8)
        .and_then(|slice| slice.try_into().ok())
        .map(u64::from_le_bytes)
        .ok_or(ProgramError::InvalidAccountData)?;

    msg!(
        "Transferring {} tokens from {} to {}",
        token_transfer_amount,
        source_token_account.key.to_string(),
        destination_token_account.key.to_string()
    );

    // Creating a new TransactionInstruction
    /*
        Internal representation of the instruction's return value (Result<Instruction, ProgramError>)

        Ok(Instruction {
            program_id: *token_program_id, // PASSED FROM USER
            accounts,
            data,
        })
    */

    let transfer_tokens_instruction = transfer(
        &token_program.key,
        &source_token_account.key,
        &destination_token_account.key,
        &source_token_account_holder.key,
        &[&source_token_account_holder.key],
        token_transfer_amount,
    )?;

    let required_accounts_for_transfer = [
        source_token_account.clone(),
        destination_token_account.clone(),
        source_token_account_holder.clone(),
    ];

    // Passing the TransactionInstruction to send
    invoke(
        &transfer_tokens_instruction,
        &required_accounts_for_transfer,
    )?;

    msg!("Transfer successful");

    Ok(())
}
```

The corresponding client instruction would be as follows. For knowing the mint
and token creation instructions, please refer to the full code nearby.

```typescript filename="cpi-transfer-client.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  sendAndConfirmTransaction
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  AccountLayout,
  MintLayout,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from "@solana/spl-token";

import * as BN from "bn.js";

// Users
const PAYER_KEYPAIR = Keypair.generate();
const RECEIVER_KEYPAIR = Keypair.generate().publicKey;

// Mint and token accounts
const TOKEN_MINT_ACCOUNT = Keypair.generate();
const SOURCE_TOKEN_ACCOUNT = Keypair.generate();
const DESTINATION_TOKEN_ACCOUNT = Keypair.generate();

// Numbers
const DEFAULT_DECIMALS_COUNT = 9;
const TOKEN_TRANSFER_AMOUNT = 50 * 10 ** DEFAULT_DECIMALS_COUNT;
const TOKEN_TRANSFER_AMOUNT_BUFFER = Buffer.from(
  Uint8Array.of(...new BN(TOKEN_TRANSFER_AMOUNT).toArray("le", 8))
);

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const programId = new PublicKey(
    "EfYK91eN3AqTwY1C34W6a33qGAtQ8HJYVhNv7cV4uMZj"
  );

  const mintDataSpace = MintLayout.span;
  const mintRentRequired = await connection.getMinimumBalanceForRentExemption(
    mintDataSpace
  );

  const tokenDataSpace = AccountLayout.span;
  const tokenRentRequired = await connection.getMinimumBalanceForRentExemption(
    tokenDataSpace
  );

  // Airdropping 1 SOL
  const feePayer = Keypair.generate();
  await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: await connection.requestAirdrop(feePayer.publicKey, LAMPORTS_PER_SOL),
    },
    'confirmed',
  );


  // Allocating space and rent for mint account
  const createMintAccountIx = SystemProgram.createAccount({
    fromPubkey: PAYER_KEYPAIR.publicKey,
    lamports: mintRentRequired,
    newAccountPubkey: TOKEN_MINT_ACCOUNT.publicKey,
    programId: TOKEN_PROGRAM_ID,
    space: mintDataSpace,
  });

  // Initializing mint with decimals and authority
  const initializeMintIx = Token.createInitMintInstruction(
    TOKEN_PROGRAM_ID,
    TOKEN_MINT_ACCOUNT.publicKey,
    DEFAULT_DECIMALS_COUNT,
    PAYER_KEYPAIR.publicKey, // mintAuthority
    PAYER_KEYPAIR.publicKey // freezeAuthority
  );

  // Allocating space and rent for source token account
  const createSourceTokenAccountIx = SystemProgram.createAccount({
    fromPubkey: PAYER_KEYPAIR.publicKey,
    newAccountPubkey: SOURCE_TOKEN_ACCOUNT.publicKey,
    lamports: tokenRentRequired,
    programId: TOKEN_PROGRAM_ID,
    space: tokenDataSpace,
  });

  // Initializing token account with mint and owner
  const initializeSourceTokenAccountIx = Token.createInitAccountInstruction(
    TOKEN_PROGRAM_ID,
    TOKEN_MINT_ACCOUNT.publicKey,
    SOURCE_TOKEN_ACCOUNT.publicKey,
    PAYER_KEYPAIR.publicKey
  );

  // Minting tokens to the source token account for transferring later to destination account
  const mintTokensIx = Token.createMintToInstruction(
    TOKEN_PROGRAM_ID,
    TOKEN_MINT_ACCOUNT.publicKey,
    SOURCE_TOKEN_ACCOUNT.publicKey,
    PAYER_KEYPAIR.publicKey,
    [PAYER_KEYPAIR],
    TOKEN_TRANSFER_AMOUNT
  );

  // Allocating space and rent for destination token account
  const createDestinationTokenAccountIx = SystemProgram.createAccount({
    fromPubkey: PAYER_KEYPAIR.publicKey,
    newAccountPubkey: DESTINATION_TOKEN_ACCOUNT.publicKey,
    lamports: tokenRentRequired,
    programId: TOKEN_PROGRAM_ID,
    space: tokenDataSpace,
  });

  // Initializing token account with mint and owner
  const initializeDestinationTokenAccountIx =
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      TOKEN_MINT_ACCOUNT.publicKey,
      DESTINATION_TOKEN_ACCOUNT.publicKey,
      RECEIVER_KEYPAIR
    );

  // Our program's CPI instruction (transfer)
  const transferTokensIx = new TransactionInstruction({
    programId: programId,
    data: TOKEN_TRANSFER_AMOUNT_BUFFER,
    keys: [
      {
        isSigner: false,
        isWritable: true,
        pubkey: SOURCE_TOKEN_ACCOUNT.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: DESTINATION_TOKEN_ACCOUNT.publicKey,
      },
      {
        isSigner: true,
        isWritable: true,
        pubkey: PAYER_KEYPAIR.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: TOKEN_PROGRAM_ID,
      },
    ],
  });

  const transaction = new Transaction();
  // Adding up all the above instructions
  transaction.add(
    createMintAccountIx,
    initializeMintIx,
    createSourceTokenAccountIx,
    initializeSourceTokenAccountIx,
    mintTokensIx,
    createDestinationTokenAccountIx,
    initializeDestinationTokenAccountIx,
    transferTokensIx
  );

  const txHash = await sendAndConfirmTransaction(connection, transaction, [
    PAYER_KEYPAIR,
    TOKEN_MINT_ACCOUNT,
    SOURCE_TOKEN_ACCOUNT,
    DESTINATION_TOKEN_ACCOUNT,
  ]);

  console.log(`Token transfer CPI success: ${txHash}`);
})();
```

Now let's take a look at another example, which is
`System Program's create_account` instruction. There is a slight difference
between the above mentioned instruction and this. There, we never had to pass
the `token_program` as one of the accounts inside the `invoke` function.
However, there are exceptions where you are required to pass the invoking
instruction's `program_id`. In our case it would be the `System Program's`
program_id. ("11111111111111111111111111111111"). So now the required accounts
would be

1. The payer account who funds the rent
2. The account which is going to be created
3. System Program account

```rust filename="cpi-create-account.rs"
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction::create_account,
    sysvar::Sysvar,
};

entrypoint!(process_instruction);

// Accounts required
/// 1. [signer, writable] Payer Account
/// 2. [signer, writable] General State Account
/// 3. [] System Program
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    // Accounts required for token transfer

    // 1. Payer account for the state account creation
    let payer_account = next_account_info(accounts_iter)?;
    // 2. Token account we hold
    let general_state_account = next_account_info(accounts_iter)?;
    // 3. System Program
    let system_program = next_account_info(accounts_iter)?;

    msg!(
        "Creating account for {}",
        general_state_account.key.to_string()
    );

    // Parsing the token transfer amount from instruction data
    // a. Getting the 0th to 8th index of the u8 byte array
    // b. Converting the obtained non zero u8 to a proper u8 (as little endian integers)
    // c. Converting the little endian integers to a u64 number
    let account_span = instruction_data
        .get(..8)
        .and_then(|slice| slice.try_into().ok())
        .map(u64::from_le_bytes)
        .ok_or(ProgramError::InvalidAccountData)?;

    let lamports_required = (Rent::get()?).minimum_balance(account_span as usize);

    // Creating a new TransactionInstruction
    /*
        Internal representation of the instruction's return value (Instruction)

        Instruction::new_with_bincode(
            system_program::id(), // NOT PASSED FROM USER
            &SystemInstruction::CreateAccount {
                lamports,
                space,
                owner: *owner,
            },
            account_metas,
        )
    */

    let create_account_instruction = create_account(
        &payer_account.key,
        &general_state_account.key,
        lamports_required,
        account_span,
        program_id,
    );

    let required_accounts_for_create = [
        payer_account.clone(),
        general_state_account.clone(),
        system_program.clone(),
    ];

    // Passing the TransactionInstruction to send (with the issused program_id)
    invoke(&create_account_instruction, &required_accounts_for_create)?;

    msg!("Transfer successful");

    Ok(())
}
```

The respective client side code will look as follows

```typescript filename="cpi-create-account-client.ts"
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import * as BN from "bn.js";

// Users
const PAYER_KEYPAIR = Keypair.generate();
const GENERAL_STATE_KEYPAIR = Keypair.generate();

const ACCOUNT_SPACE_BUFFER = Buffer.from(
  Uint8Array.of(...new BN(100).toArray("le", 8)),
);

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const latestBlockHash = await connection.getLatestBlockhash();
  const programId = new PublicKey(
    "DkuQ5wsndkzXfgqDB6Lgf4sDjBi4gkLSak1dM5Mn2RuQ",
  );

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

  // Our program's CPI instruction (create_account)
  const createAccountIx = new TransactionInstruction({
    programId: programId,
    data: ACCOUNT_SPACE_BUFFER,
    keys: [
      {
        isSigner: true,
        isWritable: true,
        pubkey: PAYER_KEYPAIR.publicKey,
      },
      {
        isSigner: true,
        isWritable: true,
        pubkey: GENERAL_STATE_KEYPAIR.publicKey,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SystemProgram.programId,
      },
    ],
  });

  const transaction = new Transaction();
  // Adding up all the above instructions
  transaction.add(createAccountIx);

  const txHash = await sendAndConfirmTransaction(connection, transaction, [
    PAYER_KEYPAIR,
    GENERAL_STATE_KEYPAIR,
  ]);

  console.log(`Create Account CPI Success: ${txHash}`);
})();
```
