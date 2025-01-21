import { Keypair } from "@solana/web3.js";
import { HDKey } from "micro-key-producer/slip10.js";
import * as bip39 from "bip39";

type Wallet = {
  path: string;
  keypair: Keypair;
  publicKey: string;
};

const mnemonic =
  "neither lonely flavor argue grass remind eye tag avocado spot unusual intact";

const seed = bip39.mnemonicToSeedSync(mnemonic, "");
const hd = HDKey.fromMasterSeed(seed.toString("hex"));

const wallets: Wallet[] = [];

for (let i = 0; i < 10; i++) {
  const path = `m/44'/501'/${i}'/0'`;
  const keypair = Keypair.fromSeed(hd.derive(path).privateKey);
  wallets.push({
    path,
    keypair,
    publicKey: keypair.publicKey.toBase58(),
  });
}

export { mnemonic, wallets };
