const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const Web3 = require('web3');
const { utils } = require("ethers");
const web3 = new Web3('https://goerli.infura.io/v3/PROJECT_ID'); // Replace with your Infura project ID or use a different Ethereum provider
const stakingTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa'; // Replace with the actual address of the staking token
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("ERC20 Mint test", function () {
        let owner;
        let staker;
        let accounts;
        beforeEach(async function () {
            // Deploy the StakingToken contract
            const StakingToken = await ethers.getContractFactory("StakingToken");
            stakingToken = await StakingToken.deploy("StakingToken", "STK");
        
            // Get the deployer and another account as the staker
            accounts = await ethers.getSigners();
            staker = accounts[0];
            owner = accounts[1];
            
             
          });
          
        describe("Stake Function", function () {
            it("should require amount greater than zero", async function () {
              await stakingToken.connect(staker).convertEthToStakingToken({ value: 100 });
                const zeroAmount = 0;
                await expect(stakingToken.connect(staker).stake(zeroAmount)).to.be.revertedWith(
                  "Amount must be greater than zero"
                );
              });
            it("should require sufficient balance for staking", async function () {
              await stakingToken.connect(staker).convertEthToStakingToken({ value: 100 });
                const initialBalance = 100; // Assuming the staker has 100 tokens
                
                const amountGreaterThanBalance = initialBalance + 1;
                await expect(stakingToken.connect(owner).stake(amountGreaterThanBalance)).to.be.revertedWith(
                  "Insufficient balance for staking"
                );
              });
          it("should allow staking ", async function () {
            await stakingToken.connect(staker).convertEthToStakingToken({ value: 100 });
                // Approve the stakingToken contract to spend staker's tokens
                await stakingToken.connect(staker).approve(stakingToken.address, 1000);
                // const initialTimestamp = (await web3.eth.getBlock('latest')).timestamp.toNumber();
                // Stake 100 tokens from the staker account
                await stakingToken.connect(staker).stake(100);
                // const afterTimeStamp = (await stakingToken.getStakedTimestamp(staker)).toNumber();
                // assert.equal(afterTimeStamp,initialTimestamp);
                expect(await stakingToken.getStakedBalance(staker.address)).to.equal(100);

                //Valid Stakers 
                expect(await stakingToken.connect(staker).validStaker(staker.address)).to.equal(true);
                
                });
           })

        describe("Unstake tokens", function () {
            it("should require amount greater than zero", async function () {
              await stakingToken.connect(staker).convertEthToStakingToken({ value: 100 });
              const zeroAmount = 0;
              await expect(stakingToken.connect(staker).stake(zeroAmount)).to.be.revertedWith(
                "Amount must be greater than zero"
              );
            });
          it("should require sufficient staked balance for unstaking", async function () {
            await stakingToken.connect(staker).convertEthToStakingToken({ value: 100 });
              const stakedBalance = 100; // Assuming the staker has 100 tokens
              await stakingToken.connect(staker).approve(stakingToken.address, 1000);
              await stakingToken.connect(staker).stake(stakedBalance);
              const amountGreaterThanBalance = stakedBalance + 1;
              await expect(stakingToken.connect(staker).unstake(amountGreaterThanBalance)).to.be.revertedWith(
                "Insufficient staked amount"
              );
            });
          it("unstaking all the token staking by the staker", async function () {
            await stakingToken.connect(staker).convertEthToStakingToken({ value: 100 });
              const stakedBalance = 100; // Assuming the staker has 100 tokens
              await stakingToken.connect(staker).approve(stakingToken.address, 1000);
              await stakingToken.connect(staker).stake(stakedBalance);
              
              // unsatking all the staked amount
              await stakingToken.connect(staker).unstake(stakedBalance);
              
              //after unstaking the amount should be zero
              expect(await stakingToken.getStakedBalance(staker.address)).to.equal(0);
              
              // so no longer stacker account remain stacker
              expect(await stakingToken.connect(staker).validStaker(staker.address)).to.equal(false);
            });
           })
        describe("Claim rewards",function () {
          it('should allow staker to claim rewards', async function () {
            await stakingToken.connect(staker).convertEthToStakingToken({ value: 100 });
            const stakedBalance = 100; // Assuming the staker has 100 tokens
            await stakingToken.connect(staker).approve(stakingToken.address, 1000);
            const staked = await stakingToken.connect(staker).stake(stakedBalance);
            const beforeClaim = await stakingToken.balanceOf(staker.address);
            await staked.wait(1);
            const rewards = await stakingToken.getRewards(staker.address);
            // Claim rewards
            await stakingToken.connect(staker).claimRewards();
            
            // Check the staker's balance after claiming rewards
            const afterClaim = await stakingToken.balanceOf(staker.address);
            
            // Check that the staker's balance increased by the rewards amount
            assert.equal(afterClaim.toNumber(), (beforeClaim.toNumber()+rewards.toNumber()), 'Incorrect staker balance after claiming rewards');
          });
        })
        describe("distribute rewards", function () {
          it('should distribute rewards to stakers', async () => {
            const staker1 = accounts[2];
            const staker2 = accounts[3];
            const staker3 = accounts[4];
            const staker4 = accounts[5];
        
            // Convert ETH to token for staking
            await stakingToken.connect(staker1).convertEthToStakingToken({ value: 1000 });
            await stakingToken.connect(staker2).convertEthToStakingToken({ value: 1000 });
            await stakingToken.connect(staker3).convertEthToStakingToken({ value: 1000 });
            await stakingToken.connect(staker4).convertEthToStakingToken({ value: 1000 });

            const stakedBalance = 100;
            // Stake some tokens for the stakers
            await stakingToken.connect(staker1).approve(stakingToken.address, 1000);
            await stakingToken.connect(staker1).stake(stakedBalance);
            await stakingToken.connect(staker2).approve(stakingToken.address, 1000);
            await stakingToken.connect(staker2).stake(stakedBalance);
            await stakingToken.connect(staker3).approve(stakingToken.address, 1000);
            await stakingToken.connect(staker3).stake(stakedBalance);
            await stakingToken.connect(staker4).approve(stakingToken.address, 1000);
            await stakingToken.connect(staker4).stake(stakedBalance);
        
            // Calculate the expected rewards per staker
            let totalRewardPool = await stakingToken.getRewardPool();
           
             
        
            let staker1BalanceB = await stakingToken.balanceOf(staker1.address);
            let staker2BalanceB = await stakingToken.balanceOf(staker2.address);
            let staker3BalanceB = await stakingToken.balanceOf(staker3.address);
            let staker4BalanceB = await stakingToken.balanceOf(staker4.address);
            // Distribute rewards
            await stakingToken.distributeRewards();
            
            // get rewards for stakers
            let rewards1 = await stakingToken.getRewards(staker1.address);
            let rewards2 = await stakingToken.getRewards(staker2.address);
            let rewards3 = await stakingToken.getRewards(staker3.address);
            let rewards4 = await stakingToken.getRewards(staker4.address);

            // Check staker balances after rewards distribution
            let staker1BalanceA = await stakingToken.balanceOf(staker1.address);
            let staker2BalanceA = await stakingToken.balanceOf(staker2.address);
            let staker3BalanceA = await stakingToken.balanceOf(staker3.address);
            let staker4BalanceA = await stakingToken.balanceOf(staker4.address);

            // final 
            let final1 = rewards1 + staker1BalanceB;
            let final2 = rewards2 + staker2BalanceB;
            let final3 = rewards3+ staker3BalanceB;
            let final4 = rewards4 + staker4BalanceB;

        
            // Check that each staker's balance increased by the expected rewards
            assert.equal(staker1BalanceA.toNumber(),final1, 'Incorrect balance for staker 1');
            assert.equal(staker2BalanceA.toNumber(), final2, 'Incorrect balance for staker 2');

            assert.equal(staker3BalanceA.toNumber(), final3, 'Incorrect balance for staker 3');
            assert.equal(staker4BalanceA.toNumber(), final4, 'Incorrect balance for staker 4');
          });
        });
  })