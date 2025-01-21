import { describe, test } from "node:test";
import assert from "node:assert";
import { createKeypairSigner, createKeypair } from "../create-keypair";

describe("Create Keypair", () => {
  test("should generate a valid keypair", async () => {
    const signer = await createKeypairSigner();
    const address = await createKeypair();

    assert.ok(signer.address);
    assert.ok(address);
  });
});
