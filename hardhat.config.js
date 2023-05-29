require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

const GOERLI_RPC_URL =
    process.env.GOERLI_RPC_URL || "https://eth-goerli.alchemyapi.io/v2/GtncwYNb-onjlTYZgTH3j1hQtSYIQ0UE"

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x"
// optional


// Your API key for Etherscan, obtain one at https://etherscan.io/
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "XYZ8J8KWJTSIYVH1DXBV6DYMTJQS7ZM5SP"

const REPORT_GAS = process.env.REPORT_GAS || false

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
      hardhat: {
          chainId: 31337,
      },
      localhost: {
          chainId: 31337,
      },
      goerli: {
          url: GOERLI_RPC_URL,
          accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
         
          saveDeployments: true,
          chainId: 5,
      },
     
  },
  etherscan: {
     
      apiKey: {
          goerli: ETHERSCAN_API_KEY,
          
      },
      customChains: [
          {
              network: "goerli",
              chainId: 5,
              urls: {
                  apiURL: "https://api-goerli.etherscan.io/api",
                  browserURL: "https://goerli.etherscan.io",
              },
          },
      ],
  },
  gasReporter: {
      enabled: REPORT_GAS,
      currency: "USD",
      outputFile: "gas-report.txt",
      noColors: true,
     
  },
  contractSizer: {
      runOnCompile: false,
      only: ["Raffle"],
  },
  namedAccounts: {
      deployer: {
          default: 0, 
          1: 0, 
      },
      player: {
          default: 1,
      },
  },
  solidity: {
    compilers: [
        {
            version: "0.8.8",
        },
    ],
},
}
