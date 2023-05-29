const { network,ethers} = require("hardhat")
const { developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    log("----------------------------------------------------")
    const arguments = ["StakingToken", "STK"]
    const stakingToken = await deploy("StakingToken", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(stakingToken.address, arguments)
    }
    log("----------------------------------------------------")

    const Token = await ethers.getContractFactory("StakingToken");
    staking = await Token.deploy("StakingToken", "STK");
        let owner,staker;
        // Get the deployer and another account as the staker
        [owner, staker] = await ethers.getSigners();
        const amount = ethers.utils.parseEther("10");
            await owner.sendTransaction({
              to: owner.address,
              value: amount,
            });
        
            // Transfer Ether to staker
            await owner.sendTransaction({
              to: staker.address,
              value: amount,
            });
        const ownerBalance = await staking.balanceOf(owner.address);
        console.log(ownerBalance.toString());
        const stakerBalance = await staking.balanceOf(staker.address);
        console.log(stakerBalance.toString());
        // console.log(balanceOf(staker));
}

module.exports.tags = ["all", "stakingToken"]