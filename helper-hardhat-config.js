const { ethers } = require("hardhat")
const networkConfig = {
    default: {
        name: "hardhat",
        interval: "30",
    },
    5 : {
        name : "goerli",
        gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 
        interval: "30",

    },
    31337 : {
        name : "localhost",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15", 
        interval: "30",
       
    },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
}