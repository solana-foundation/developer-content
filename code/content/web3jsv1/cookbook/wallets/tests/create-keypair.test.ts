import { describe, test } from "node:test";
import assert from "node:assert";
import { keypair } from "../create-keypair";
import { Keypair, PublicKey } from "@solana/web3.js";

describe("Create Keypair", async () => {
  test("should be a valid Keypair instance", () => {
    assert.ok(
      keypair instanceof Keypair,
      "keypair should be instance of Keypair"
    );
  });

  test("should have correct secretKey length", () => {
    assert.equal(keypair.secretKey.length, 64, "secretKey should be 64 bytes");
  });

  test("should have correct publicKey length", () => {
    assert.equal(
      keypair.publicKey.toBytes().length,
      32,
      "publicKey should be 32 bytes"
    );
  });

  test("should have valid public key instance", () => {
    assert.ok(
      keypair.publicKey instanceof PublicKey,
      "publicKey should be instance of PublicKey"
    );
  });

  test("should derive same public key from secret key", () => {
    const derivedKeypair = Keypair.fromSecretKey(keypair.secretKey);
    assert.ok(
      keypair.publicKey.equals(derivedKeypair.publicKey),
      "public key should match derived public key"
    );
  });

  test("should generate correct base58 public key string", () => {
    const pubkeyStr = keypair.publicKey.toBase58();
    assert.ok(
      pubkeyStr.length === 44 || pubkeyStr.length === 43,
      "public key string should be 43 or 44 characters"
    );
  });

  test("should have valid secret key format", () => {
    assert.ok(
      keypair.secretKey instanceof Uint8Array,
      "secretKey should be Uint8Array"
    );
  });

  test("should have matching public key in last 32 bytes of secret key", () => {
    const pubkeyFromSecret = keypair.secretKey.slice(32);
    assert.deepEqual(
      pubkeyFromSecret,
      keypair.publicKey.toBytes(),
      "last 32 bytes of secret key should match public key"
    );
  });

  test("should generate unique keypairs", () => {
    const anotherKeypair = Keypair.generate();
    assert.ok(
      !keypair.publicKey.equals(anotherKeypair.publicKey),
      "different keypairs should have different public keys"
    );
    assert.ok(
      !Buffer.from(keypair.secretKey).equals(
        Buffer.from(anotherKeypair.secretKey)
      ),
      "different keypairs should have different secret keys"
    );
  });

  test("should maintain consistency when serializing and deserializing", () => {
    const secretKeyBytes = keypair.secretKey;
    const restoredKeypair = Keypair.fromSecretKey(secretKeyBytes);

    assert.ok(
      keypair.publicKey.equals(restoredKeypair.publicKey),
      "restored keypair should have same public key"
    );
    assert.deepEqual(
      keypair.secretKey,
      restoredKeypair.secretKey,
      "restored keypair should have same secret key"
    );
  });

  test("should correctly handle base58 encoding/decoding of public key", () => {
    const base58Pubkey = keypair.publicKey.toBase58();
    const decodedPubkey = new PublicKey(base58Pubkey);

    assert.ok(
      keypair.publicKey.equals(decodedPubkey),
      "public key should maintain equality after base58 encoding/decoding"
    );
  });
});
