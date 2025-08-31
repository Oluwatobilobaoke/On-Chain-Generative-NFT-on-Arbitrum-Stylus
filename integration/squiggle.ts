import { getContract, parseEther, formatEther } from "viem";
import { walletClient } from "./chain";
import { squiggleAbi } from "./abis";

// Your deployed contract address (will be set after deployment)
export const SQUIGGLE_CONTRACT_ADDRESS =
  "0x7f916543a53e08b8cbd4a066a1079021d1c91572"; // Replace with actual address

// Create contract instance
export const squiggleContract = getContract({
  address: SQUIGGLE_CONTRACT_ADDRESS as `0x${string}`,
  abi: squiggleAbi,
  client: walletClient,
});

// Helper functions for interacting with the contract
export async function initializeSquiggle(mintPriceEth: string) {
  try {
    const mintPriceWei = parseEther(mintPriceEth);

    console.log(
      `\n Initializing Squiggle NFT contract with mint price: ${mintPriceEth} ETH`
    );

    const hash = await squiggleContract.write.initialize([mintPriceWei]);
    console.log(` Transaction hash: ${hash}`);

    console.log(" Waiting for transaction confirmation...");
    const receipt = await walletClient.waitForTransactionReceipt({ hash });
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);

    return receipt;
  } catch (error: any) {
    if (error.message?.includes("InvalidSender")) {
      throw new Error("Contract already initialized");
    }
    throw error;
  }
}

export async function getContractInfo() {
  const [name, symbol] = await Promise.all([
    squiggleContract.read.name(),
    squiggleContract.read.symbol(),
  ]);

  return {
    name,
    symbol,
  };
}

export async function getBalance(address: `0x${string}`) {
  return squiggleContract.read.balanceOf([address]);
}

export async function mintNFT(valueEth: string) {
  const valueWei = parseEther(valueEth);

  console.log(`\n Minting Squiggle NFT for ${valueEth} ETH...`);

  const hash = await squiggleContract.write.mint({
    value: valueWei,
  });

  console.log(` Transaction hash: ${hash}`);

  const receipt = await walletClient.waitForTransactionReceipt({ hash });
  console.log(`✅ NFT minted! Block: ${receipt.blockNumber}`);

  return receipt;
}

export async function getTokenURI(tokenId: bigint) {
  return squiggleContract.read.tokenURI([tokenId]);
}

export async function getOwnerOf(tokenId: bigint) {
  return squiggleContract.read.ownerOf([tokenId]);
}

export async function transferNFT(
  from: `0x${string}`,
  to: `0x${string}`,
  tokenId: bigint
) {
  const hash = await squiggleContract.write.transferFrom([from, to, tokenId]);
  const receipt = await walletClient.waitForTransactionReceipt({ hash });
  return receipt;
}

export async function approveNFT(to: `0x${string}`, tokenId: bigint) {
  const hash = await squiggleContract.write.approve([to, tokenId]);
  const receipt = await walletClient.waitForTransactionReceipt({ hash });
  return receipt;
}

export async function setApprovalForAll(
  operator: `0x${string}`,
  approved: boolean
) {
  const hash = await squiggleContract.write.setApprovalForAll([
    operator,
    approved,
  ]);
  const receipt = await walletClient.waitForTransactionReceipt({ hash });
  return receipt;
}
