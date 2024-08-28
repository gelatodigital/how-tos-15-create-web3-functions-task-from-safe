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

const ALCHEMY_ID = process.env.ALCHEMY_ID;
// const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

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
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
        blockNumber:20575065

      //url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_ID}`,
      },
     // chainId: 1337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 1337,
    },
    ethereum: {
      accounts: PK ? [PK] : [],
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_ID}`,
    },
    sepolia: {
      chainId: 11155111,
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_ID}`,
      accounts: PK ? [PK] : [],
    },
    mumbai: {
      accounts: PK ? [PK] : [],
      chainId: 80001,
      url: `https://polygon-mumbai.g.alchemy.com/v2/_HsuvYjrWX8zIZS6oAXPWU8OR1IyNYy-`,
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
    reyaCronos: {
      accounts: PK ? [PK] : [],
      chainId: 89346161,
      url: `https://rpc.reya-cronos.gelato.digital`,
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
      {
        version:"0.8.11"
      }
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
      sepolia:'VDCE9RBJ9EE8417IG1C51WRJXRITPQIBI3'
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
