import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { verifyKeypair } from "../verify-keypair";
import { isAddress, createKeyPairFromBytes, Address } from "@solana/web3.js";

describe("verifyKeypair", async () => {
  test("should verify keypair correctly", async () => {
    const results = await verifyKeypair();

    assert.ok(
      results.hasMatchingPublicKey,
      "Public key should match expected address",
    );
    assert.ok(results.isValidAddress, "Should be a valid Solana address");
    assert.ok(results.isValidSigner, "Should be a valid signer");
  });

  test("should match known public key", async () => {
    const expectedPublicKey =
      "24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p" as Address<string>;
    const keypairBytes = new Uint8Array([
      174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
      222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
      15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
      121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
    ]);

    const signer = await createKeyPairFromBytes(keypairBytes);
    assert.equal(
      signer.publicKey.toString(),
      expectedPublicKey,
      "Should derive the expected public key",
    );
    assert.ok(
      isAddress(expectedPublicKey),
      "Expected public key should be a valid address",
    );
  });

  test("should validate address format", async () => {
    const validAddress =
      "24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p" as Address<string>;
    const invalidAddress = "invalid-address";

    assert.ok(
      isAddress(validAddress),
      "Should validate correct address format",
    );
    assert.ok(
      !isAddress(invalidAddress),
      "Should reject invalid address format",
    );
  });
});
