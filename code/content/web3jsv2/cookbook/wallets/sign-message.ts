import {
  signBytes,
  verifySignature,
  getUtf8Encoder,
  getBase58Decoder,
  Address,
} from "@solana/web3.js";

export async function signMessage(
  keys: CryptoKeyPair,
  message: string = "Hello, World!",
) {
  const encodedMessage = getUtf8Encoder().encode(message);
  const signedBytes = await signBytes(keys.privateKey, encodedMessage);

  const decoded = getBase58Decoder().decode(signedBytes);
  const verified = await verifySignature(
    keys.publicKey,
    signedBytes,
    encodedMessage,
  );

  return {
    signature: signedBytes,
    decodedSignature: decoded,
    verified,
  };
}
