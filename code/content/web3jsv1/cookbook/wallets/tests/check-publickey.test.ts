import { describe, test } from "node:test";
import { strict as assert } from "node:assert";
import { PublicKey } from "@solana/web3.js";
import { key, onCurve, offCurveAddress } from "../check-publickey";

describe("Check PublicKey", async () => {
  test("should properly instantiate valid key", () => {
    assert.ok(key instanceof PublicKey, "key should be a PublicKey instance");
    assert.equal(
      key.toString(),
      "5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY",
      "key should match the expected value"
    );
  });

  test("should verify key is on ed25519 curve", () => {
    assert.equal(onCurve, true, "key should be on the ed25519 curve");
    // Double-check the curve status directly
    assert.equal(
      PublicKey.isOnCurve(key.toBytes()),
      true,
      "key should be verified on curve through direct check"
    );
  });

  test("should identify valid address not on curve", () => {
    assert.ok(
      offCurveAddress instanceof PublicKey,
      "offCurveAddress should be a PublicKey instance"
    );
    assert.equal(
      offCurveAddress.toString(),
      "4BJXYkfvg37zEmBbsacZjeQDpTNx91KppxFJxRqrz48e",
      "offCurveAddress should match the expected value"
    );
    assert.equal(
      PublicKey.isOnCurve(offCurveAddress.toBytes()),
      false,
      "offCurveAddress should not be on the curve"
    );
  });

  test("should throw error for invalid public key format", () => {
    assert.throws(
      () => {
        new PublicKey("testPubkey");
      },
      {
        name: "Error",
        message: /Invalid public key/,
      },
      "Should throw an error for invalid public key format"
    );
  });

  test("should throw error for empty string public key", () => {
    assert.throws(
      () => {
        new PublicKey("");
      },
      {
        name: "Error",
        message: /Invalid public key/,
      },
      "Should throw an error for empty string"
    );
  });

  test("should handle conversion between different formats", () => {
    const keyString = key.toString();
    const keyBytes = key.toBytes();
    const keyBase58 = key.toBase58();

    // Test string conversion
    assert.equal(
      new PublicKey(keyString).toString(),
      keyString,
      "should maintain equality when converting through string"
    );

    // Test bytes conversion
    assert.deepEqual(
      new PublicKey(keyBytes).toBytes(),
      keyBytes,
      "should maintain equality when converting through bytes"
    );

    // Test base58 conversion
    assert.equal(
      new PublicKey(keyBase58).toBase58(),
      keyBase58,
      "should maintain equality when converting through base58"
    );
  });

  test("should verify key bytes are correct length", () => {
    const keyBytes = key.toBytes();
    assert.equal(
      keyBytes.length,
      32,
      "public key bytes should be exactly 32 bytes"
    );
  });

  test("should maintain equality for same public key", () => {
    const sameKey = new PublicKey(key.toString());
    assert.ok(
      key.equals(sameKey),
      "same public key should be equal when compared"
    );
  });

  test("should identify different public keys as not equal", () => {
    const differentKey = new PublicKey(offCurveAddress.toString());
    assert.equal(
      key.equals(differentKey),
      false,
      "different public keys should not be equal"
    );
  });
});
