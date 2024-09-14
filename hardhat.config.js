require("@nomicfoundation/hardhat-toolbox");
require("hardhat-contract-sizer");
const dotenv = require('dotenv');
const path = require('path');
const { vars } = require("hardhat/config");
require("@openzeppelin/hardhat-upgrades");
require("./task/base")

const loadEnv = (network) => {
  const envPath = path.resolve(__dirname, `.env.${network}`);
  dotenv.config({ path: envPath });
};

const getNetworkAccounts = (network) => { 
  loadEnv(network);
  const privateKeys = [];
  const envKey = ["PROXY_ADMIN_OWNER_KEY", "FACTORY_WONER_KEY", "USER_KEY_1", "USER_KEY_2"]
  envKey.forEach(key => {
    const envValue = process.env[key];
    if (envValue) {
      privateKeys.push(envValue);
    }
  });
  return privateKeys;
};

const defaultNetwork = "localhost"
const networkArgIndex = process.argv.indexOf('--network')
let network = defaultNetwork;
if (networkArgIndex !== -1 && networkArgIndex + 1 < process.argv.length) {
  network = process.argv[networkArgIndex+1]
}

const accounts = getNetworkAccounts(network)

const INFURA_API_KEY = vars.get("INFURA_API_KEY");


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  defaultNetwork: network,
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      chainId: 1,
      accounts
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      chainId: 11155111,
      accounts
    }
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["LabelFactory", "LabelNFT"],
    except: []
  }
};
