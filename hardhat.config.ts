import { HardhatUserConfig } from "hardhat/config";

// PLUGINS
import "@gelatonetwork/web3-functions-sdk/hardhat-plugin";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomiclabs/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";
import "@nomiclabs/hardhat-etherscan";


// Process Env Variables
import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

const PK = process.env.PK;


// HardhatUserConfig bug
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const config: HardhatUserConfig = {
  // web3 functions
  w3f: {
    rootDir: "./web3-functions",
    debug: false,
    networks: ["hardhat", "liskSepolia"], //(multiChainProvider) injects provider for these networks
  },
  // hardhat-deploy
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  defaultNetwork: "plasmaTestnet",

  networks: {
    hardhat: {
      forking: {
        url:  `https://rpc.reya-cronos.gelato.digital`,
      },
    },
    polygon: {
      accounts: PK ? [PK] : [],
      chainId: 137,
      url: "https://polygon-rpc.com",
    },
    geloptestnet: {
      accounts: PK ? [PK] : [],
      chainId: 42069,
      url: "https://rpc.op-testnet.gelato.digital",
    },
    reya: {
      accounts: PK ? [PK] : [],
      chainId: 1729,
      url: `https://rpc.reya.network`,
    },
    real: {
      accounts: PK ? [PK] : [],
      chainId: 111188,
      url: `https://real.drpc.org`,
    },
    eduTestnet: {
      accounts: PK ? [PK] : [],
      chainId: 656476,
      url: `https://rpc.open-campus-codex.gelato.digital`,
    },
    plasmaTestnet: {
      accounts: PK ? [PK] : [],
      chainId: 168587773,
      url: `https://sepolia.blast.io`,
    },
 
  },

  solidity: {
    compilers: [
      {
        version: "0.8.23",
        settings: {
          optimizer: { enabled: true, runs: 999999 },
          // Some networks don't support opcode PUSH0, we need to override evmVersion
          // See https://stackoverflow.com/questions/76328677/remix-returned-error-jsonrpc2-0-errorinvalid-opcode-push0-id24
          evmVersion: "paris",
        },
      },
    ],
  },

  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },

  // hardhat-deploy
  etherscan: {
    apiKey: {
      unreal: 'your API key',
      liskSepolia: 'your API KEY',
      reyaCronos: 'your API KEY',
      //mumbai: ETHERSCAN_API_KEY!
    },
    customChains: [
      {
        network: "unreal",
        chainId: 18231,
        urls: {
          apiURL: "https://unreal.blockscout.com/api",
          browserURL: "https://unreal.blockscout.com"
        }
      },
      {
        network: "reyaCronos",
        chainId: 89346161,
        urls: {
          apiURL: "https://reya-cronos.blockscout.com/api",
          browserURL: "https://reya-cronos.blockscout.com"
        }
      },
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      }
    ]
  },
};

export default config;
