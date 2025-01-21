import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { verifyKeypair } from "../verify-keypair";
import { isAddress, Address } from "@solana/web3.js";

describe("verifyKeypair", async () => {
  test("should verify keypair correctly", async () => {
    const results = await verifyKeypair();

    assert.ok(results.isValidSigner, "Should be a valid signer");
    assert.ok(results.isValidAddress, "Should be a valid address");
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
