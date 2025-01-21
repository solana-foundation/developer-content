import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import * as bip39 from "bip39";
import { mnemonic } from "../generate-mnemonic";

describe("Mnemonic Generation", async () => {
  it("should generate a valid mnemonic phrase", () => {
    assert.ok(
      bip39.validateMnemonic(mnemonic),
      "Generated mnemonic should be valid"
    );
  });

  it("should generate a 12-word mnemonic by default", () => {
    const words = mnemonic.split(" ");
    assert.equal(words.length, 12, "Mnemonic should contain exactly 12 words");
  });

  it("should use only valid BIP39 words", () => {
    const wordList = bip39.wordlists.english;
    const mnemonicWords = mnemonic.split(" ");

    mnemonicWords.forEach((word) => {
      assert.ok(
        wordList.includes(word),
        `Word "${word}" should be in the BIP39 wordlist`
      );
    });
  });

  it("should generate unique mnemonics on each call", () => {
    const anotherMnemonic = bip39.generateMnemonic();
    assert.notEqual(
      mnemonic,
      anotherMnemonic,
      "Generated mnemonics should be unique"
    );
  });

  it("should generate mnemonic with correct entropy", () => {
    // BIP39 mnemonics are generated from 128 bits of entropy for 12 words
    const entropy = bip39.mnemonicToEntropy(mnemonic);
    assert.equal(
      entropy.length,
      32, // 128 bits = 32 hex characters
      "Mnemonic should be generated from 128 bits of entropy"
    );
  });
});
