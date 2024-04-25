---
title: How to Create a PDA's Account
sidebarSortOrder: 3
description:
  "Program Derived Addresses, also known as PDAs, enable developers to extend
  their program's functionality with program-owned accounts. Learn how to create
  accounts at PDAs on Solana."
---

Accounts found at Program Derived Addresses (PDAs) can only be created on-chain.
The accounts have addresses that have an associated off-curve public key, but no
secret key.

To generate a PDA, use `findProgramAddressSync` with your required seeds.
Generating with the same seeds will always generate the same PDA.

## Generating a PDA

```typescript filename="generate-pda.ts"
import { PublicKey } from "@solana/web3.js";

const programId = new PublicKey("G1DCNUQTSGHehwdLCAmRyAG8hf51eCHrLNUqkgGKYASj");

let [pda, bump] = PublicKey.findProgramAddressSync(
  [Buffer.from("test")],
  programId,
);
console.log(`bump: ${bump}, pubkey: ${pda.toBase58()}`);
// you will find the result is different from `createProgramAddress`.
// It is expected because the real seed we used to calculate is ["test" + bump]
```

## Create an Account at a PDA

### Program

```rust filename="create-pda.rs" {24-37}
use solana_program::{
    account_info::next_account_info, account_info::AccountInfo, entrypoint,
    entrypoint::ProgramResult, program::invoke_signed, pubkey::Pubkey, system_instruction, sysvar::{rent::Rent, Sysvar}
};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();

    let payer_account_info = next_account_info(account_info_iter)?;
    let pda_account_info = next_account_info(account_info_iter)?;
    let rent_sysvar_account_info = &Rent::from_account_info(next_account_info(account_info_iter)?)?;

    // find space and minimum rent required for account
    let space = instruction_data[0];
    let bump = instruction_data[1];
    let rent_lamports = rent_sysvar_account_info.minimum_balance(space.into());

    invoke_signed(
        &system_instruction::create_account(
            &payer_account_info.key,
            &pda_account_info.key,
            rent_lamports,
            space.into(),
            program_id
        ),
        &[
            payer_account_info.clone(),
            pda_account_info.clone()
        ],
        &[&[&payer_account_info.key.as_ref(), &[bump]]]
    )?;

    Ok(())
}
```

## Client

```typescript filename="create-pda.ts"
import {
  clusterApiUrl,
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";

(async () => {
  // program id
  const programId = new PublicKey(
    "7ZP42kRwUQ2zgbqXoaXzAFaiQnDyp6swNktTSv8mNQGN",
  );

  // connection
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  // setup fee payer
  const feePayer = Keypair.generate();
  const feePayerAirdropSignature = await connection.requestAirdrop(
    feePayer.publicKey,
    LAMPORTS_PER_SOL,
  );
  await connection.confirmTransaction(feePayerAirdropSignature);

  // setup pda
  let [pda, bump] = await PublicKey.findProgramAddress(
    [feePayer.publicKey.toBuffer()],
    programId,
  );
  console.log(`bump: ${bump}, pubkey: ${pda.toBase58()}`);

  const data_size = 0;

  let tx = new Transaction().add(
    new TransactionInstruction({
      keys: [
        {
          pubkey: feePayer.publicKey,
          isSigner: true,
          isWritable: true,
        },
        {
          pubkey: pda,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: SYSVAR_RENT_PUBKEY,
          isSigner: false,
          isWritable: false,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      data: Buffer.from(new Uint8Array([data_size, bump])),
      programId: programId,
    }),
  );

  console.log(`txhash: ${await connection.sendTransaction(tx, [feePayer])}`);
})();
```
