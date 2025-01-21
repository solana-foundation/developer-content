import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

const keypair = Keypair.fromSecretKey(
  bs58.decode(
    "4UzFMkVbk1q6ApxvDS8inUxg4cMBxCQRVXRx5msqQyktbi1QkJkt574Jda6BjZThSJi54CHfVoLFdVFX8XFn233L"
  )
);

export { keypair as bs58Keypair };
