import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { signMessage } from "../sign-message";
import { createKeyPairFromBytes } from "@solana/web3.js";

describe("signMessage", async () => {
  const keypairBytes = new Uint8Array([
    174, 47, 154, 16, 202, 193, 206, 113, 199, 190, 53, 133, 169, 175, 31, 56,
    222, 53, 138, 189, 224, 216, 117, 173, 10, 149, 53, 45, 73, 251, 237, 246,
    15, 185, 186, 82, 177, 240, 148, 69, 241, 227, 167, 80, 141, 89, 240, 121,
    121, 35, 172, 247, 68, 251, 226, 218, 48, 63, 176, 109, 168, 89, 238, 135,
  ]);

  test("should sign and verify a message", async () => {
    const signer = await createKeyPairFromBytes(keypairBytes);
    const message = "Hello, World!";

    const result = await signMessage(signer, message);

    assert.ok(result.signature, "Should produce a signature");
    assert.equal(
      result.decodedSignature.length,
      64,
      "Decoded signature should be 64 bytes",
    );
    assert.ok(result.verified, "Signature should be verified");
  });

  test("should handle empty messages", async () => {
    const signer = await createKeyPairFromBytes(keypairBytes);
    const message = "";

    const result = await signMessage(signer, message);

    assert.ok(result.signature, "Should sign empty message");
    assert.ok(result.verified, "Should verify empty message signature");
  });

  test("should handle special characters", async () => {
    const signer = await createKeyPairFromBytes(keypairBytes);
    const message = "Hello 👋 World! ❤️ 🌍 #@$%^&*";

    const result = await signMessage(signer, message);

    assert.ok(result.signature, "Should sign message with special characters");
    assert.ok(
      result.verified,
      "Should verify signature with special characters",
    );
  });
});
