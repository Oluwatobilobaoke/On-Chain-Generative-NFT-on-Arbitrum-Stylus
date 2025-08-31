import {
  mintNFT,
  getContractInfo,
  getTokenURI,
  getOwnerOf,
  SQUIGGLE_CONTRACT_ADDRESS,
} from "./squiggle";
import { walletClient } from "./chain";

async function main() {
  try {
    console.log("=".repeat(50));
    console.log("Squiggle NFT Minting Script");
    console.log("=".repeat(50));

    if (
      SQUIGGLE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
    ) {
      console.log(
        "❌ Please update SQUIGGLE_CONTRACT_ADDRESS in squiggle.ts with your deployed contract address"
      );
      process.exit(1);
    }

    console.log(`\n📍 Contract Address: ${SQUIGGLE_CONTRACT_ADDRESS}`);
    console.log(`👤 Minting with wallet: ${walletClient.account.address}`);

    // Get current contract info
    console.log("\n📊 Current contract info:");
    const contractInfo = await getContractInfo();
    console.log(` Name: ${contractInfo.name}`);
    console.log(`  Symbol: ${contractInfo.symbol}`);

    // Mint NFT with 0.001 ETH
    await mintNFT("0.001");

    console.log(
      `\n🔗 View on Arbiscan: https://sepolia.arbiscan.io/address/${SQUIGGLE_CONTRACT_ADDRESS}`
    );
    console.log(
      `\n💡 To view the SVG art, decode the base64 data URI from the tokenURI`
    );
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);

    if (error.message?.includes("InsufficientPayment")) {
      console.log(
        "💸 Make sure you're sending enough ETH to cover the mint price"
      );
    }

    process.exit(1);
  }
}

main();
