import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import "dotenv/config";
import 'solidity-coverage'
import "hardhat-gas-reporter"

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      { version: "0.8.23" },
      { version: "0.8.20" },
      { version: "0.8.19" },
    ],
  },
  networks: {
    // hardhat: {
    //   forking: {
    //     url: process.env.MAINNET_SERVER!,
    //     blockNumber: Number(process.env.MAINNET_BLOCKID!),
    //   },
    // },
    sepolia: {
      url: process.env.RPC_SERVER!,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: Number(process.env.CHAIN_ID!),
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  etherscan: {
    apiKey: process.env.ETHER_SCAN_API!,
  },
  sourcify: {
    enabled: true,
  },
  mocha: {
    timeout: 200000,
  },
};

export default config;
