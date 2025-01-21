import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  restoreKeypairBase58,
  restoreKeypairBytes,
} from "../restore-keypair.js";
import {
  isKeyPairSigner,
  signBytes,
  verifySignature,
  getUtf8Encoder,
  getBase58Decoder,
} from "@solana/web3.js";

describe("restoreKeypair", async () => {
  test("should restore a valid Solana keypair", async () => {
    const signer = await restoreKeypairBytes();

    assert.ok(isKeyPairSigner(signer), "Should be a valid keypair signer");

    assert.equal(signer.address.length, 44, "Public key should be 44 chars");
  });

  test("keypair should be able to sign and verify messages", async () => {
    const keypair = await restoreKeypairBase58();
    const message = getUtf8Encoder().encode("Hello, World!");

    const signedBytes = await signBytes(keypair.privateKey, message);
    const verified = await verifySignature(
      keypair.publicKey,
      signedBytes,
      message
    );

    const decoded = getBase58Decoder().decode(signedBytes);
    assert.equal(decoded.length, 88, "Signature should be 64 bytes");
    assert.ok(verified, "Signature should be verified successfully");
  });
});
