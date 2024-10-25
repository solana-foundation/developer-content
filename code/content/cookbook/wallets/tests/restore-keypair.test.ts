import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { bytesKeypair } from "../restore-keypair-from-bytes";
import { bs58Keypair } from "../restore-keypair-from-bs58";
import { PublicKey } from "@solana/web3.js";

describe("Restore Keypair", async () => {
  it("should correctly generate keypairs from both byte array and base58", () => {
    // Expected values
    const expectedPublicKey = new PublicKey(
      "24PNhTaNtomHhoy3fTRaMhAFCRj4uHqhZEEoWrKDbR5p",
    );
    const expectedSecretKeyLength = 64;

    // Test byte array keypair
    assert.equal(
      bytesKeypair.publicKey.toBase58(),
      expectedPublicKey.toBase58(),
      "Byte array keypair should have correct public key",
    );

    assert.equal(
      bytesKeypair.secretKey.length,
      expectedSecretKeyLength,
      "Byte array keypair secret key should be 64 bytes",
    );

    // Verify byte array matches original
    const originalBytes = [
      174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
      222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
      15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
      121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
    ];
    assert.deepEqual(
      Array.from(bytesKeypair.secretKey),
      originalBytes,
      "Byte array keypair should match original bytes",
    );

    // Test base58 keypair
    assert.equal(
      bs58Keypair.publicKey.toBase58(),
      expectedPublicKey.toBase58(),
      "Base58 keypair should have correct public key",
    );

    assert.equal(
      bs58Keypair.secretKey.length,
      expectedSecretKeyLength,
      "Base58 keypair secret key should be 64 bytes",
    );

    // Verify both keypairs generate the same key
    assert.equal(
      bytesKeypair.publicKey.toBase58(),
      bs58Keypair.publicKey.toBase58(),
      "Both keypairs should generate identical public keys",
    );

    // Verify secret keys match
    assert.deepEqual(
      bytesKeypair.secretKey,
      bs58Keypair.secretKey,
      "Both keypairs should have identical secret keys",
    );
  });
});
