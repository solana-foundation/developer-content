import { isAddress, isProgramDerivedAddress } from "@solana/web3.js";

// Note that generateKeyPair() will always give a public key that is valid for users

// Valid public key
const key = "5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY";

// Lies on the ed25519 curve and is suitable for users
console.log("Valid Address: ", isAddress(key));

// Valid public key
const offCurveAddress = "4BJXYkfvg37zEmBbsacZjeQDpTNx91KppxFJxRqrz48e";

// Not on the ed25519 curve, therefore not suitable for users, but suitable for programs
console.log(
  "Valid Off Curve Address: ",
  isProgramDerivedAddress(offCurveAddress),
);

// Not a valid public key
const errorPubkey = "testPubkey";
console.log("Invalid Address: ", isAddress(errorPubkey));

export { errorPubkey, offCurveAddress, key };
