import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";


import "./tasks/ACDMPlatform";

dotenv.config();

const config: HardhatUserConfig = {
  solidity:"0.8.4",
  defaultNetwork: "hardhat",
  networks: {

    hardhat: {
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10
      }
    },

    rinkeby: {
      url: process.env.RINKEBY_RPC_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10
      },
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 100000
    },

    ropsten: {
      url: process.env.ROPSTEN_RPC_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10
      },
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 100000
    },

    kovan: {
      url: process.env.KOVAN_RPC_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10
      },
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 100000
    },

    goerli: {
      url: process.env.GOERLI_RPC_URL || "",
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10
      },
      gas: 2100000,
      gasPrice: 8000000000,
      timeout: 100000
    },

    bsctest: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: {
        mnemonic: process.env.MNEMONIC,
        count: 10
      },
      gas: 2100000,
      gasPrice: 20000000000,
      timeout: 100000
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    gasPrice: 21,
    currency: "USD",
  },
  
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
    //apiKey: process.env.BSCSCAN_API_KEY,
  },
  
};

export default config;
