import {
  createKeyPairFromBytes,
  createKeyPairSignerFromBytes,
  getBase58Codec,
} from "@solana/web3.js";

export async function restoreKeypairBytes() {
  const keypairBytes = new Uint8Array([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
  ]);

  // create a signer keypair from the bytes
  return await createKeyPairSignerFromBytes(keypairBytes, true);
}

export async function restoreKeypairBase58() {
  const keypairBase58 =
    "5MaiiCavjCmn9Hs1o3eznqDEhRwxo7pXiAYez7keQUviUkauRiTMD8DrESdrNjN8zd9mTmVhRvBJeg5vhyvgrAhG";
  const keypairBytes = getBase58Codec().encode(keypairBase58);

  // create a signer keypair from the bytes
  return await createKeyPairFromBytes(keypairBytes);
}
