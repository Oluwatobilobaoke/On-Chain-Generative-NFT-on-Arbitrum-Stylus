# Squiggle - On-Chain Generative NFT on Arbitrum Stylus

Squiggle is an ERC721 NFT collection deployed on Arbitrum Stylus that generates unique, deterministic SVG art entirely on-chain. Each NFT features a unique "squiggle" pattern generated from a random seed at mint time.

## Overview

Squiggle demonstrates the power of Arbitrum Stylus by implementing complex on-chain SVG generation in Rust. Key features include:

- **On-chain SVG Generation**: Each NFT's artwork is generated entirely on-chain using deterministic algorithms
- **ERC721 Compliance**: Full ERC721 implementation using OpenZeppelin's Stylus contracts
- **Unique Artwork**: Each token has a unique seed that generates a distinctive squiggle pattern
- **Base64 Encoding**: Metadata and SVG are encoded on-chain for direct rendering
- **Payable Minting**: Users can mint NFTs by sending ETH to the contract

## Prerequisites

Before you begin, ensure you have the following installed:

- **Rust**: Version 1.87.0 (specified in `rust-toolchain.toml`)
- **Cargo Stylus**: Install with `cargo install cargo-stylus`
- **Node.js**: For running cast commands (if using Foundry)
- **Foundry**: For contract interaction (optional)

## Project Structure

```
squiggle/
├── src/
│   ├── lib.rs         # Main contract implementation
│   ├── generator.rs   # SVG generation logic
│   ├── base64.rs      # Base64 encoding utilities
│   └── main.rs        # Export ABI entry point
├── integration/       # TypeScript integration scripts
│   ├── package.json   # Bun package configuration
│   ├── tsconfig.json  # TypeScript configuration
│   ├── chain.ts       # Chain and wallet setup
│   ├── abis.ts        # Contract ABI definitions
│   ├── squiggle.ts    # Contract interaction helpers
│   ├── initialize.ts  # Contract initialization script
│   ├── mint.ts        # NFT minting script
│   ├── index.test.ts  # Test examples
│   └── node_modules/  # Dependencies
├── test_output/       # Generated SVG samples
├── Cargo.toml         # Project dependencies
├── rust-toolchain.toml # Rust version specification
└── .env              # Environment configuration
```

## Installation

1. **Install Rust and Stylus CLI**:
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Stylus CLI
cargo install --force cargo-stylus cargo-stylus-check

# Add WASM target
rustup target add wasm32-unknown-unknown
```

2. **Clone and setup the project**:
```bash
# Navigate to the squiggle directory
cd squiggle

# Install dependencies
cargo build
```

3. **Configure environment variables**:
```bash
# Create .env file from the existing one or edit it
# Edit .env with your configuration:
# RPC=http://localhost:8547           # Your RPC endpoint
# PRIVATE_KEY=0x...                   # Your private key (keep secure!)
# CONTRACT=0x...                      # Deployed contract address (after deployment)
source .env
```

## Building the Contract

### For Development

```bash
# Build the contract
cargo build --release --target wasm32-unknown-unknown

# Run tests
cargo test
```

### For Deployment

```bash
# Build optimized WASM binary
cargo build --release --target wasm32-unknown-unknown

# Check if contract is valid for Stylus
cargo stylus check

# Export the Solidity ABI
cargo stylus export-abi
```

## Deployment Process

### Important Note on Constructor Arguments

⚠️ **Known Issue**: The `cargo stylus deploy` command currently has a limitation with constructor arguments ([GitHub Issue #99](https://github.com/OffchainLabs/stylus-sdk-rs/issues/99)). Constructor arguments passed via `--constructor-args` are not properly recognized during deployment.

**Workaround**: Use an initialization pattern instead of a constructor. Deploy the contract first, then call an `initialize` function to set up the mint price.

### Step 1: Build and Deploy

```bash
# Export ABI
cargo stylus export-abi

# Build for release
cargo build --release --target wasm32-unknown-unknown

# Deploy to Arbitrum Sepolia (without constructor args)
cargo stylus deploy \
  --private-key $PRIVATE_KEY \
  --endpoint https://sepolia-rollup.arbitrum.io/rpc
```

### Step 2: Initialize the Contract

After deployment, initialize the contract using the integration scripts:

```bash
# Navigate to integration folder
cd integration

# Install dependencies (using Bun)
bun install

# Update the contract address in squiggle.ts
# Replace SQUIGGLE_CONTRACT_ADDRESS with your deployed address

# Run initialization script
PRIVATE_KEY=$PRIVATE_KEY bun run initialize.ts
```

### Integration Setup

The `integration/` folder contains TypeScript scripts using Bun and Viem for interacting with the deployed contract:

```
integration/
├── package.json       # Bun package configuration  
├── tsconfig.json      # TypeScript configuration
├── chain.ts          # Chain and wallet configuration
├── abis.ts           # Contract ABI definitions
├── squiggle.ts       # Squiggle interaction helpers
├── initialize.ts     # Contract initialization script
├── mint.ts           # NFT minting script
└── index.test.ts     # Test examples
```

#### Key Integration Features:

1. **Bun Runtime**: Fast JavaScript runtime for quick script execution
2. **Viem Library**: Type-safe Ethereum interactions  
3. **Helper Functions**: Pre-built functions for common operations (initialize, mint, transfer)


## Interacting with the Contract

### Using Integration Scripts

After initialization, you can interact with the contract using the TypeScript helpers:

```bash
# Mint an NFT (sends 0.001 ETH)
PRIVATE_KEY=$PRIVATE_KEY bun run mint.ts

# Run tests (update contract address first)
bun test
```

### Using Foundry Cast (Alternative)

If you prefer using cast commands:

```bash
# Initialize contract (one-time setup)
cast send $CONTRACT \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC \
  "initialize(uint256)" 1000000000000000

# Mint by sending ETH (value should match or exceed mint_price)
cast send $CONTRACT \
  --private-key $PRIVATE_KEY \
  --value 1000000000000000 \
  --rpc-url $RPC \
  "mint()"
```

### Reading Token Metadata

```bash
# Get token URI (returns base64 encoded JSON with SVG)
cast call $CONTRACT \
  --rpc-url $RPC \
  "tokenURI(uint256)" 0

# Get token owner
cast call $CONTRACT \
  --rpc-url $RPC \
  "ownerOf(uint256)" 0

# Get NFT name
cast call $CONTRACT --rpc-url $RPC "name()"

# Get NFT symbol  
cast call $CONTRACT --rpc-url $RPC "symbol()"
```

### ERC721 Standard Functions

```bash
# Transfer NFT
cast send $CONTRACT \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC \
  "transferFrom(address,address,uint256)" \
  <from> <to> <tokenId>

# Approve spending
cast send $CONTRACT \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC \
  "approve(address,uint256)" \
  <spender> <tokenId>

# Check balance
cast call $CONTRACT \
  --rpc-url $RPC \
  "balanceOf(address)" <owner_address>
```

## How It Works

### Contract Architecture

1. **Storage Structure** (`lib.rs:25-35`):
   - Inherits ERC721 functionality from OpenZeppelin Stylus contracts
   - Stores mint price (cost to mint an NFT)
   - Tracks total supply of minted NFTs
   - Maps each token ID to a unique 32-byte seed for deterministic art generation

2. **Minting Process** (`lib.rs:110-133`):
   - User sends ETH equal to or greater than the configured mint_price
   - Contract generates a deterministic seed from:
     - Current block number
     - Message sender address
     - Chain ID
   - Token is minted to sender with unique seed stored on-chain
   - Total supply is incremented

3. **SVG Generation** (`generator.rs`):
   - Takes the stored seed as input for deterministic randomness
   - Generates squiggle parameters:
     - Number of oscillations (4-15)
     - Amplitude (100-600 pixels)
     - Stroke width (10-80 pixels)
     - Gradient colors
   - Creates an SVG path with smooth curves
   - Returns base64-encoded data URI containing the SVG

4. **Metadata Generation**:
   - When `tokenURI` is called, the contract:
     - Retrieves the seed for the given token ID
     - Generates the SVG artwork
     - Creates JSON metadata with name, description, and image
     - Base64 encodes everything
     - Returns a data URI that can be directly rendered by browsers and NFT platforms

### Example Usage with Rust Client

The project includes an example client in `examples/counter.rs` that demonstrates programmatic interaction:

```rust
cargo run --example counter --target=<YOUR_ARCHITECTURE>
```

Where `YOUR_ARCHITECTURE` is your system architecture (e.g., `aarch64-apple-darwin` for M1 Macs, `x86_64-unknown-linux-gnu` for Linux x86)

## Testing

Run the test suite to verify functionality:

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_squiggle

# Run with output
cargo test -- --nocapture
```

The test suite includes:
- Constructor initialization tests
- Minting with insufficient payment (should fail)
- Successful minting with correct payment
- Token URI generation verification
- Total supply tracking

## Key Features

### Deterministic Art Generation
- Same seed always produces the same artwork
- Seeds are generated from blockchain state for uniqueness
- Art parameters are derived deterministically from the seed

### Gas Optimization
The contract uses several optimization techniques in `Cargo.toml`:
- `codegen-units = 1`: Single compilation unit for better optimization
- `strip = true`: Remove debug symbols to reduce size
- `lto = true`: Link-time optimization for smaller binary
- `opt-level = "s"`: Optimize for size
- `mini-alloc`: Memory-efficient allocator for WASM

### No External Dependencies
- All SVG generation happens entirely on-chain
- No IPFS or external storage required
- Metadata and images are self-contained in the contract

## Security Considerations

- **Private Keys**: Never commit private keys to version control. Use environment variables or secure key management
- **Mint Price**: Set an appropriate mint price to prevent spam and ensure fair distribution
- **Seed Generation**: Uses block number, sender address, and chain ID for randomness (suitable for NFT generation, not for high-stakes randomness)
- **Overflow Protection**: Uses U256 arithmetic which prevents integer overflows

## Troubleshooting

### Common Issues

#### 1. Constructor Arguments Not Working

**Problem**: Getting error "mismatch number of constructor arguments (want 1; got 0)"

**Cause**: Known limitation in cargo-stylus tool ([Issue #99](https://github.com/OffchainLabs/stylus-sdk-rs/issues/99))

**Solution**: Use the initialization pattern as described in this README:
1. Deploy without constructor arguments
2. Call `initialize()` function after deployment with the mint price

#### 2. "Contract already initialized" Error

**Problem**: Getting "InvalidSender" error when calling initialize

**Cause**: Contract has already been initialized (can only be done once)

**Solution**: Check contract info to confirm current state:

```typescript
import { getContractInfo } from "./integration/squiggle";
const info = await getContractInfo();
console.log("Current contract:", info);
```

#### 3. Private Key Format Issues

**Problem**: "invalid private key" error in integration scripts

**Solution**: Ensure private key is properly formatted with 0x prefix:

```bash
# Correct format
PRIVATE_KEY=0x1234567890abcdef...

# Run script
PRIVATE_KEY=$PRIVATE_KEY bun run initialize.ts
```

#### 4. "InsufficientPayment" Error

**Problem**: Minting fails with insufficient payment error

**Cause**: The ETH sent is less than the configured mint_price

**Solution**: Ensure you send at least the mint price (default 0.001 ETH):

```bash
# Check mint price first, then send correct amount
PRIVATE_KEY=$PRIVATE_KEY bun run mint.ts
```

#### 5. Contract Address Not Set

**Problem**: "Please update SQUIGGLE_CONTRACT_ADDRESS" error

**Solution**: Update the contract address in `integration/squiggle.ts`:

```typescript
export const SQUIGGLE_CONTRACT_ADDRESS = "0xYourContractAddressHere";
```

#### 6. Build fails with "no_std" errors

- Ensure you're targeting `wasm32-unknown-unknown`: `cargo build --target wasm32-unknown-unknown`
- Check that `rust-toolchain.toml` specifies the correct Rust version

#### 7. Deployment fails

- Verify your RPC endpoint is accessible and correct
- Ensure your account has sufficient ETH for gas fees
- Run `cargo stylus check` to validate the contract before deployment

#### 8. "Compressed WASM too large" error

- Adjust optimization settings in `Cargo.toml`
- Consider using `opt-level = "z"` for maximum size optimization

## Advanced Usage

### Exporting the ABI

To generate a Solidity interface for the contract:

```bash
cargo stylus export-abi
```

This will output an interface that includes all the ERC721 standard functions plus the custom Squiggle functions:
- `mint()` - Payable function to mint new NFTs
- `tokenURI(uint256)` - Returns base64-encoded metadata with SVG
- Standard ERC721 functions (transfer, approve, etc.)

### Viewing Generated Art

The `test_output/` directory contains sample SVG files generated during testing. You can open these in any browser to see examples of the generative art.

### Customizing Parameters

To modify the art generation parameters, edit `src/generator.rs`:
- `MIN_OSCILLATIONS` / `MAX_OSCILLATIONS`: Control complexity of the squiggle
- `MIN_AMPLITUDE` / `MAX_AMPLITUDE`: Control the height of waves
- `MIN_STROKE_WIDTH` / `MAX_STROKE_WIDTH`: Control line thickness
- `MIN_PERIOD` / `MAX_PERIOD`: Control the frequency of oscillations

## Resources

- [Arbitrum Stylus Documentation](https://docs.arbitrum.io/stylus/stylus-gentle-introduction)
- [OpenZeppelin Stylus Contracts](https://github.com/OpenZeppelin/rust-contracts-stylus)
- [Stylus SDK](https://github.com/OffchainLabs/stylus-sdk-rs)
- [ERC721 Standard](https://eips.ethereum.org/EIPS/eip-721)
- [Arbitrum Sepolia Testnet Faucet](https://docs.arbitrum.io/stylus/reference/testnet-information)

## License

This project is dual-licensed under Apache-2.0 or MIT license. See the `licenses/` directory for full license texts.
