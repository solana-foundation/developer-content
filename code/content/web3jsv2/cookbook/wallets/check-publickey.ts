import {
  isAddress,
  isProgramDerivedAddress,
  Address,
  createAddressWithSeed,
} from "@solana/web3.js";

export type AddressValidationResult = {
  onCurveAddress: {
    address: string;
    isValid: boolean;
  };
  offCurveAddress: {
    address: string;
    isPDA: boolean;
    seed: string;
  };
  invalidAddress: {
    address: string;
    isValid: boolean;
  };
};

export async function validateAddresses(): Promise<AddressValidationResult> {
  // Valid public key that lies on the ed25519 curve (suitable for users)
  const key = "5oNDL3swdJJF1g9DzJiZ4ynHXgszjAEpUkxVYejchzrY" as Address<string>;

  // Valid public key that's off curve (suitable for programs)
  const seed = "21";
  const offCurveAddress = await createAddressWithSeed({
    baseAddress: key,
    programAddress: "11111111111111111111111111111111" as Address,
    seed,
  });

  // Invalid public key for testing
  const errorPubkey = "testPubkey";

  return {
    onCurveAddress: {
      address: key,
      isValid: isAddress(key),
    },
    offCurveAddress: {
      address: offCurveAddress,
      isPDA: isProgramDerivedAddress([offCurveAddress, 21]),
      seed,
    },
    invalidAddress: {
      address: errorPubkey,
      isValid: isAddress(errorPubkey),
    },
  };
}
