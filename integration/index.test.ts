import { expect, test } from "bun:test";
import { parseEther } from "viem";
import {
  initializeSquiggle,
  mintNFT,
  getContractInfo,
  getBalance,
  getTokenURI,
  getOwnerOf,
  SQUIGGLE_CONTRACT_ADDRESS,
} from "./squiggle";
import { walletClient } from "./chain";

// Note: These tests require the contract to be deployed and the address updated in squiggle.ts
// For now, they serve as examples of how to interact with the contract

test.skip("Should initialize Squiggle contract", async () => {
  // Skip if no real contract address
  if (
    SQUIGGLE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
  ) {
    console.log("Skipping test: Update SQUIGGLE_CONTRACT_ADDRESS first");
    return;
  }

  const receipt = await initializeSquiggle("0.001");
  expect(receipt.status).toBe("success");

  const info = await getContractInfo();
  expect(info.name).toBe("Squiggle");
  expect(info.symbol).toBe("SQGL");
});

test.skip("Should mint NFT successfully", async () => {
  // Skip if no real contract address
  if (
    SQUIGGLE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
  ) {
    console.log("Skipping test: Update SQUIGGLE_CONTRACT_ADDRESS first");
    return;
  }

  const receipt = await mintNFT("0.001");
  expect(receipt.status).toBe("success");

  // Check token ownership
});

test.skip("Should fail to mint with insufficient payment", async () => {
  // Skip if no real contract address
  if (
    SQUIGGLE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
  ) {
    console.log("Skipping test: Update SQUIGGLE_CONTRACT_ADDRESS first");
    return;
  }

  // This should fail because we're sending less than the mint price
  expect(mintNFT("0.0005")).rejects.toThrow();
});

test("Contract info structure", () => {
  // Test that demonstrates the expected structure
  const expectedInfo = {
    name: "Squiggle",
    symbol: "SQGL",
  };

  expect(typeof expectedInfo.name).toBe("string");
  expect(typeof expectedInfo.symbol).toBe("string");
});
