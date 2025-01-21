import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { PublicKey } from "@solana/web3.js";
import { keypair } from "../verify-keypair";

describe("Verify Keypair", async () => {
  it("keypair should match public key", () => {
    const expectedPublicKey = new PublicKey(
      "24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p"
    );

    // Verify the keypair's public key matches the expected public key
    assert.equal(
      keypair.publicKey.toBase58(),
      expectedPublicKey.toBase58(),
      "Generated keypair should have the expected public key"
    );

    // Additional verification of the secret key length
    assert.equal(
      keypair.secretKey.length,
      64,
      "Secret key should be 64 bytes long"
    );
  });
});
