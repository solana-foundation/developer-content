import { generateKeyPair, generateKeyPairSigner } from "@solana/web3.js";

// Secret key is never exported or exposed.

export const createKeypair = async (): Promise<{ address: string }> => {
  // KeyPairs are low-level and use the native Crypto API directly,
  // This means you can conveniently pass them to transaction pipelines and they will be used to sign your transactions.
  const keypair = await generateKeyPair();

  return { address: keypair.publicKey.toString() };
};

export const createKeypairSigner = async (): Promise<{ address: string }> => {
  // The Signer instance just wraps the KeyPair instance and uses it for signing using the native Crypto API when required.
  // whereas Signers is a higher-level abstraction over the concept of signing transactions and messages
  // (this could be using a keypair, using a wallet in the browser, using a ledger API directly, whatever you want).
  // Therefore KeyPairSigners are Signers that wrap the KeyPair API.

  const signer = await generateKeyPairSigner();

  return { address: signer.address };
};
