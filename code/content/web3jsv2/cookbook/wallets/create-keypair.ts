import { generateKeyPairSigner } from "@solana/web3.js";

(async () => {
  const signer = await generateKeyPairSigner();
  console.log("address: ", signer.address);
})();

export { generateKeyPairSigner };
