import {
  initializeSquiggle,
  getContractInfo,
  SQUIGGLE_CONTRACT_ADDRESS,
} from "./squiggle";
import { walletClient } from "./chain";

async function main() {
  try {
    console.log("=".repeat(50));
    console.log("Squiggle NFT Initialization Script");
    console.log("=".repeat(50));

    if (
      SQUIGGLE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000"
    ) {
      console.log(
        "❌ Please update SQUIGGLE_CONTRACT_ADDRESS in squiggle.ts with your deployed contract address"
      );
      process.exit(1);
    }

    console.log(`\n Contract Address: ${SQUIGGLE_CONTRACT_ADDRESS}`);
    console.log(` Initializing with wallet: ${walletClient.account.address}`);

    // Initialize the contract with mint price of 0.001 ETH
    await initializeSquiggle("0.001");

    // Verify initialization by reading contract info
    console.log("\n Verifying initialization...");
    const contractInfo = await getContractInfo();

    console.log("\n Squiggle NFT contract successfully initialized!");
    console.log("=".repeat(50));
    console.log(` Name: ${contractInfo.name}`);
    console.log(`  Symbol: ${contractInfo.symbol}`);
    console.log(` Mint Price: 0.001 ETH`);
    console.log("=".repeat(50));

    console.log(
      `\n🔗 View on Arbiscan: https://sepolia.arbiscan.io/address/${SQUIGGLE_CONTRACT_ADDRESS}`
    );
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);

    if (error.message === "Contract already initialized") {
      console.log(
        "\n📝 Contract is already initialized. Reading current info..."
      );
      const contractInfo = await getContractInfo();
      console.log(` Name: ${contractInfo.name}`);
      console.log(`  Symbol: ${contractInfo.symbol}`);
    }

    process.exit(1);
  }
}

main();
