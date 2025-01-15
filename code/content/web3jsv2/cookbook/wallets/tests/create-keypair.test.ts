import { describe, test } from "node:test";
import assert from "node:assert";
import { generateKeyPairSigner } from "../create-keypair";

describe("Keypair Generation", () => {
  test("should generate a valid keypair", async () => {
    const signer = await generateKeyPairSigner();
    assert.ok(signer.address);
    assert.ok(signer.keyPair);
  });
});
