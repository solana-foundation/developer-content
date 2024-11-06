import { describe, test } from "node:test";
import assert from "node:assert";
import * as ed from "@noble/ed25519";
import { sha512 } from "@noble/hashes/sha512";
import { utf8ToBytes } from "@noble/hashes/utils";
import {
  keypair,
  message,
  messageBytes,
  signature,
  result,
} from "../sign-message";

// Enable synchronous methods for noble-ed25519
ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));

describe("Sign and Verify Message", async () => {
  test("keypair should have valid secretKey format and length", () => {
    assert(
      keypair.secretKey instanceof Uint8Array,
      "secretKey should be Uint8Array",
    );
    assert.equal(keypair.secretKey.length, 64, "secretKey should be 64 bytes");
  });

  test("keypair should have valid publicKey format and length", () => {
    assert(
      keypair.publicKey.toBytes() instanceof Uint8Array,
      "publicKey should convert to Uint8Array",
    );
    assert.equal(
      keypair.publicKey.toBytes().length,
      32,
      "publicKey should be 32 bytes",
    );
  });

  test("message should convert to correct byte format", () => {
    const testMessageBytes = utf8ToBytes(message);
    assert.deepStrictEqual(
      messageBytes,
      testMessageBytes,
      "messageBytes should match expected conversion",
    );
  });

  test("signature should have correct format and length", () => {
    assert(signature instanceof Uint8Array, "signature should be Uint8Array");
    assert.equal(signature.length, 64, "signature should be 64 bytes");
  });

  test("signature should verify successfully with correct inputs", () => {
    const verificationResult = ed.verify(
      signature,
      messageBytes,
      keypair.publicKey.toBytes(),
    );
    assert.strictEqual(
      verificationResult,
      true,
      "signature should verify successfully",
    );
    assert.strictEqual(result, true, "exported result should be true");
  });

  test("signature should fail verification with wrong message", () => {
    const wrongMessage = utf8ToBytes("Wrong message");
    assert.strictEqual(
      ed.verify(signature, wrongMessage, keypair.publicKey.toBytes()),
      false,
      "should fail with wrong message",
    );
  });

  test("signature should fail verification with wrong public key", () => {
    const wrongPubkey = ed.getPublicKey(ed.utils.randomPrivateKey());
    assert.strictEqual(
      ed.verify(signature, messageBytes, wrongPubkey),
      false,
      "should fail with wrong public key",
    );
  });

  test("signature should fail verification with wrong signature", () => {
    const wrongSignature = new Uint8Array(64).fill(1);
    assert.strictEqual(
      ed.verify(wrongSignature, messageBytes, keypair.publicKey.toBytes()),
      false,
      "should fail with wrong signature",
    );
  });

  test("signature generation should be deterministic", () => {
    const newSignature = ed.sign(messageBytes, keypair.secretKey.slice(0, 32));
    assert.deepStrictEqual(
      signature,
      newSignature,
      "regenerated signature should match original",
    );
  });

  test("should throw error for invalid signature length", () => {
    assert.throws(
      () =>
        ed.verify(
          new Uint8Array(63),
          messageBytes,
          keypair.publicKey.toBytes(),
        ),
      /Uint8Array/i,
      "should throw on invalid signature length",
    );
  });

  test("should throw error for invalid message format", () => {
    assert.throws(
      () => ed.sign(null as any, keypair.secretKey.slice(0, 32)),
      /expected/i,
      "should throw on invalid message format",
    );
  });
});
