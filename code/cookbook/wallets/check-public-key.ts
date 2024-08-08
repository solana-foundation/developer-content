import { PublicKey } from "@solana/web3.js";

// Note that Keypair.generate() will always give a public key that is valid for users

// Valid public key
const key = new PublicKey("5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY");
// Lies on the ed25519 curve and is suitable for users
console.log(PublicKey.isOnCurve(key.toBytes()));

// Valid public key
const offCurveAddress = new PublicKey(
  "4BJXYkfvg37zEmBbsacZjeQDpTNx91KppxFJxRqrz48e",
);

// Not on the ed25519 curve, therefore not suitable for users
console.log(PublicKey.isOnCurve(offCurveAddress.toBytes()));

// Not a valid public key
const errorPubkey = new PublicKey("testPubkey");
