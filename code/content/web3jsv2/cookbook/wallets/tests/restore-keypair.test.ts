import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { restoreKeypair } from "../restore-keypair.js";
import {
  isKeyPairSigner,
  signBytes,
  verifySignature,
  getUtf8Encoder,
  getBase58Decoder,
  address,
  Address,
} from "@solana/web3.js";

describe("restoreKeypair", async () => {
  test("should restore a valid Solana keypair", async () => {
    const signer = await restoreKeypair();

    assert.ok(
      isKeyPairSigner({
        ...signer,
        address: signer.publicKey.toString() as Address<string>,
      }),
      "Should be a valid keypair signer",
    );
    const exportedPrivateKey = new Uint8Array(
      await crypto.subtle.exportKey("raw", signer.privateKey),
    );
    assert.equal(
      exportedPrivateKey.length,
      64,
      "Secret key should be 64 bytes",
    );
    const exportedPublicKey = new Uint8Array(
      await crypto.subtle.exportKey("raw", signer.publicKey),
    );
    assert.equal(exportedPublicKey.length, 32, "Public key should be 32 bytes");

    const expectedPublicKey = "7pdkKZUVDDaf7ZpC8FpqkYtwx5BK8VgHHJnKF7MzgJcW";
    assert.equal(
      signer.publicKey.toString(),
      expectedPublicKey,
      "Should restore the correct public key",
    );
  });

  test("keypair should be able to sign and verify messages", async () => {
    const signer = await restoreKeypair();
    const message = getUtf8Encoder().encode("Hello, World!");

    const signedBytes = await signBytes(signer.privateKey, message);
    const verified = await verifySignature(
      signer.publicKey,
      signedBytes,
      message,
    );

    const decoded = getBase58Decoder().decode(signedBytes);
    assert.equal(decoded.length, 64, "Signature should be 64 bytes");
    assert.ok(verified, "Signature should be verified successfully");
  });
});
