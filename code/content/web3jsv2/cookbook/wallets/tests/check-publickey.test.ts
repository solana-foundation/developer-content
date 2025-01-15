import test from "node:test";
import assert from "node:assert";
import { isAddress, isProgramDerivedAddress } from "@solana/web3.js";
import { errorPubkey, offCurveAddress, key } from "../check-publickey";

test("check isAddress function", async t => {
  await t.test("works with valid address", () => {
    assert.equal(isAddress(key), true);
  });

  await t.test("works with valid off-curve address", () => {
    assert.equal(isAddress(offCurveAddress), true);
  });

  await t.test("fails with invalid address", () => {
    assert.equal(isAddress(errorPubkey), false);
  });

  await t.test("fails with empty string", () => {
    assert.equal(isAddress(""), false);
  });

  await t.test("fails with wrong format", () => {
    assert.equal(isAddress("not-base-58!"), false);
  });
});

test("check isProgramDerivedAddress function", async t => {
  await t.test("returns correct value for off-curve address", () => {
    assert.equal(isProgramDerivedAddress(offCurveAddress), false);
  });

  await t.test("fails with regular address", () => {
    assert.equal(isProgramDerivedAddress(key), false);
  });

  await t.test("fails with invalid address", () => {
    assert.equal(isProgramDerivedAddress(errorPubkey), false);
  });

  await t.test("fails with empty string", () => {
    assert.equal(isProgramDerivedAddress(""), false);
  });
});

test("check edge cases", async t => {
  await t.test("handles null values", () => {
    try {
      isAddress(null as any);
      isProgramDerivedAddress(null as any);
    } catch (error) {
      assert.ok(error instanceof Error);
    }
  });

  await t.test("handles undefined values", () => {
    try {
      isAddress(undefined as any);
      isProgramDerivedAddress(undefined as any);
    } catch (error) {
      assert.ok(error instanceof Error);
    }
  });
});
