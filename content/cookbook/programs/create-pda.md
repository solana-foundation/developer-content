---
title: How to create a Program Derived Address
sidebarSortOrder: 5
description:
  "Learn how to create a Program Derived Address (PDA) in a Solana program."
---

A Program Derived Address is simply an account owned by the program, but has
no  
private key. Instead it's signature is obtained by a set of seeds and a bump
(a  
nonce which makes sure it's 'off curve', i.e. not a valid public key).
"**Generating**" a Program Address is  
different from "**creating**" it. One can generate a PDA using
`Pubkey::find_program_address`. Creating a PDA essentially means to initialize
the address with space and set the state to it. A normal Keypair account can be
created outside of our program and then fed to initialize it's state.
Unfortunately, for PDAs, it has to be created on chain, due to the nature of not
being able to sign on behalf of itself. Hence we use `invoke_signed` to pass the
seeds of the PDA, along with the funding account's signature which results in
account creation of a PDA.

```rust filename="create-pda.rs"
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct HelloState {
    is_initialized: bool,
}

// Accounts required
/// 1. [signer, writable] Funding account
/// 2. [writable] PDA account
/// 3. [] System Program
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    const ACCOUNT_DATA_LEN: usize = 1;

    let accounts_iter = &mut accounts.iter();
    // Getting required accounts
    let funding_account = next_account_info(accounts_iter)?;
    let pda_account = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    // Getting PDA Bump from instruction data
    let (pda_bump, _) = instruction_data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    // Checking if passed PDA and expected PDA are equal
    let signers_seeds: &[&[u8]; 3] = &[
        b"customaddress",
        &funding_account.key.to_bytes(),
        &[*pda_bump],
    ];
    let pda = Pubkey::create_program_address(signers_seeds, program_id)?;

    if pda.ne(&pda_account.key) {
        return Err(ProgramError::InvalidAccountData);
    }

    // Assessing required lamports and creating transaction instruction
    let lamports_required = Rent::get()?.minimum_balance(ACCOUNT_DATA_LEN);
    let create_pda_account_ix = system_instruction::create_account(
        &funding_account.key,
        &pda_account.key,
        lamports_required,
        ACCOUNT_DATA_LEN.try_into().unwrap(),
        &program_id,
    );
    // Invoking the instruction but with PDAs as additional signer
    invoke_signed(
        &create_pda_account_ix,
        &[
            funding_account.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[signers_seeds],
    )?;

    // Setting state for PDA
    let mut pda_account_state = HelloState::try_from_slice(&pda_account.data.borrow())?;
    pda_account_state.is_initialized = true;
    pda_account_state.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;

    Ok(())
}
```

One can send the required accounts via client as follows

```typescript filename="create-pda-client.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

const PAYER_KEYPAIR = Keypair.generate();

(async () => {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const latestBlockHash = await connection.getLatestBlockhash();
  const programId = new PublicKey(
    "6eW5nnSosr2LpkUGCdznsjRGDhVb26tLmiM1P8RV1QQp",
  );

  // Airdrop to Payer
  await connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: await connection.requestAirdrop(
        PAYER_KEYPAIR.publicKey,
        LAMPORTS_PER_SOL,
      ),
    },
    "confirmed",
  );

  const [pda, bump] = await PublicKey.findProgramAddress(
    [Buffer.from("customaddress"), PAYER_KEYPAIR.publicKey.toBuffer()],
    programId,
  );

  console.log(`PDA Pubkey: ${pda.toString()}`);

  const createPDAIx = new TransactionInstruction({
    programId: programId,
    data: Buffer.from(Uint8Array.of(bump)),
    keys: [
      {
        isSigner: true,
        isWritable: true,
        pubkey: PAYER_KEYPAIR.publicKey,
      },
      {
        isSigner: false,
        isWritable: true,
        pubkey: pda,
      },
      {
        isSigner: false,
        isWritable: false,
        pubkey: SystemProgram.programId,
      },
    ],
  });

  const transaction = new Transaction();
  transaction.add(createPDAIx);

  const txHash = await sendAndConfirmTransaction(connection, transaction, [
    PAYER_KEYPAIR,
  ]);
  console.log(`Created PDA successfully. Tx Hash: ${txHash}`);
})();
```
