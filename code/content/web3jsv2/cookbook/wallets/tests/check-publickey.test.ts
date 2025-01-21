import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateAddresses } from "../check-publickey";
import { isAddress, isProgramDerivedAddress } from "@solana/web3.js";

describe("checkPublickey", async () => {
  test("should validate different types of addresses correctly", async () => {
    const results = await validateAddresses();

    // Check on-curve address
    assert.ok(
      results.onCurveAddress.isValid,
      "On-curve address should be valid"
    );
    assert.ok(
      isAddress(results.onCurveAddress.address),
      "On-curve address should be a valid Solana address"
    );

    // Check off-curve address
    assert.ok(
      results.offCurveAddress.isPDA,
      "Off-curve address should be a valid PDA"
    );
    assert.ok(
      isAddress(results.offCurveAddress.address),
      "Off-curve address should still be a valid address"
    );

    // Check invalid address
    assert.ok(
      !results.invalidAddress.isValid,
      "Invalid address should be marked as invalid"
    );
    assert.ok(
      !isAddress(results.invalidAddress.address),
      "Invalid address should fail address validation"
    );
  });

  test("should return consistent address strings", async () => {
    const results = await validateAddresses();

    assert.equal(
      results.onCurveAddress.address,
      "5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY",
      "Should return correct on-curve address"
    );
    assert.equal(
      results.offCurveAddress.address,
      "FEbdEwuYGBvzyJTm7zzYREFLgC94NEVLhDRLJ4KzPvAb",
      "Should return correct off-curve address"
    );
    assert.equal(
      results.invalidAddress.address,
      "testPubkey",
      "Should return correct invalid address"
    );
  });
});
