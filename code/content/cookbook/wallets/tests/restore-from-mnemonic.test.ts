import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { mnemonic, wallets } from "../restore-bip44-mnemonic";
import { keypair } from "../restore-bip39-mnemonic";
import * as bip39 from "bip39";
import { Keypair } from "@solana/web3.js";

describe("Restore Keypair from Mnemonic words", async () => {
  test("should generate correct deterministic keypair from bip 39", () => {
    // Known correct public key for the given mnemonic
    const expectedPublicKey = "5ZWj7a1f8tWkjBESHKgrLmXshuXxqeY9SYcfbshpAqPG";
    const mnemonic =
      "pill tomorrow foster begin walnut borrow virtual kick shift mutual shoe scatter";

    // Test generated public key matches expected
    assert.equal(
      keypair.publicKey.toBase58(),
      expectedPublicKey,
      "Generated public key should match expected value",
    );

    // Verify mnemonic is valid
    assert.ok(
      bip39.validateMnemonic(mnemonic),
      "Mnemonic should be valid BIP39 phrase",
    );

    // Verify keypair secret key properties
    assert.equal(keypair.secretKey.length, 64, "Secret key should be 64 bytes");

    // Regenerate keypair to verify deterministic generation
    const seedVerify = bip39.mnemonicToSeedSync(mnemonic, "");
    const keypairVerify = Keypair.fromSeed(
      new Uint8Array(seedVerify).slice(0, 32),
    );

    assert.equal(
      keypairVerify.publicKey.toBase58(),
      keypair.publicKey.toBase58(),
      "Keypair generation should be deterministic",
    );

    // Verify secret key is Uint8Array
    assert.ok(
      keypair.secretKey instanceof Uint8Array,
      "Secret key should be Uint8Array",
    );

    // Verify first 32 bytes of secret key match seed slice
    const seedSlice = new Uint8Array(
      bip39.mnemonicToSeedSync(mnemonic, ""),
    ).slice(0, 32);
    assert.deepEqual(
      keypair.secretKey.slice(0, 32),
      seedSlice,
      "First 32 bytes of secret key should match seed slice",
    );
  });

  test("should generate correct set of deterministic wallets from bip 44", () => {
    // Known correct public keys for the first three wallets
    const expectedPublicKeys = [
      "5vftMkHL72JaJG6ExQfGAsT2uGVHpRR7oTNUPMs68Y2N",
      "GcXbfQ5yY3uxCyBNDPBbR5FjumHf89E7YHXuULfGDBBv",
      "7QPgyQwNLqnoSwHEuK8wKy2Y3Ani6EHoZRihTuWkwxbc",
    ];

    // Test the total number of wallets
    assert.equal(wallets.length, 10, "Should generate exactly 10 wallets");

    // Verify mnemonic is valid
    assert.ok(
      bip39.validateMnemonic(mnemonic),
      "Mnemonic should be valid BIP39 phrase",
    );

    // Test the first three wallets match expected public keys
    expectedPublicKeys.forEach((expectedKey, index) => {
      assert.equal(
        wallets[index].publicKey,
        expectedKey,
        `Wallet ${index} should have correct public key`,
      );
    });

    // Test each wallet's properties
    wallets.forEach((wallet, index) => {
      // Verify derivation path format
      assert.equal(
        wallet.path,
        `m/44'/501'/${index}'/0'`,
        `Wallet ${index} should have correct derivation path`,
      );

      // Verify keypair secret key length
      assert.equal(
        wallet.keypair.secretKey.length,
        64,
        `Wallet ${index} secret key should be 64 bytes`,
      );

      // Verify public key matches keypair
      assert.equal(
        wallet.keypair.publicKey.toBase58(),
        wallet.publicKey,
        `Wallet ${index} public key should match keypair`,
      );

      // Verify public keys are unique
      const duplicates = wallets.filter(w => w.publicKey === wallet.publicKey);
      assert.equal(
        duplicates.length,
        1,
        `Wallet ${index} public key should be unique`,
      );
    });
  });
});
