// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

contract StakingToken is ERC20 {
    using EnumerableSet for EnumerableSet.AddressSet;

    uint256 public constant REWARD_BASE = 1e18; // Base reward rate (1 token = 1e18 base rate)
    uint256 public constant REWARD_DURATION = 1 days; // Duration for each reward tier

    uint256 public constant CONVERSION_RATE = 100;

    struct StakingInfo {
        uint256 amount;
        uint256 stakedTimestamp;
        uint256 lastRewardTimestamp;
    }

    mapping(address => StakingInfo) private stakingInfo;
    EnumerableSet.AddressSet private stakers;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance for staking");

        if (!stakers.contains(msg.sender)) {
            stakers.add(msg.sender);
        }

        _updateRewards(msg.sender);

        stakingInfo[msg.sender].amount += amount;
        stakingInfo[msg.sender].stakedTimestamp = block.timestamp;
        stakingInfo[msg.sender].lastRewardTimestamp = block.timestamp;

        _burn(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        require(stakingInfo[msg.sender].amount >= amount, "Insufficient staked amount");

        _updateRewards(msg.sender);

        stakingInfo[msg.sender].amount -= amount;

        if (stakingInfo[msg.sender].amount == 0) {
            stakers.remove(msg.sender);
        }

        _mint(msg.sender, amount);
    }

    function getStakedBalance(address account) public view returns (uint256) {
        return stakingInfo[account].amount;
    }

    function getStakedTimestamp(address account) public view returns (uint256) {
        return stakingInfo[account].stakedTimestamp;
    }

    function getRewards(address account) public view returns (uint256) {
        uint256 stakedTime = block.timestamp - stakingInfo[account].stakedTimestamp;
        uint256 rewardsPerDay = REWARD_BASE * (stakedTime / REWARD_DURATION);

        return rewardsPerDay * stakingInfo[account].amount;
    }

    function claimRewards() external {
        

        _updateRewards(msg.sender);

        uint256 rewards = getRewards(msg.sender);
        // require(rewards > 0, "No rewards to claim");

        _mint(msg.sender, rewards);
        stakingInfo[msg.sender].lastRewardTimestamp = block.timestamp;
    }

    function distributeRewards() external {
        require(stakers.length() > 0, "No stakers");

        // uint256 rewardsPerStaker = getRewardPool() / stakers.length();

        for (uint256 i = 0; i < stakers.length(); i++) {
            address staker = stakers.at(i);
            uint256 rewards = getRewards(staker) ;

            _mint(staker, rewards);
            stakingInfo[staker].lastRewardTimestamp = block.timestamp;
        }
    }

    function getRewardPool() public view returns (uint256) {
        uint256 totalRewardPool = REWARD_BASE * (block.timestamp / REWARD_DURATION);
        return totalRewardPool - totalSupply();
    }

    function _updateRewards(address account) private {
        if (!stakers.contains(account)) return;

        uint256 rewards = getRewards(account);
        // uint256 lastRewardTimestamp = stakingInfo[account].lastRewardTimestamp;

        if (rewards > 0) {
            _mint(account, rewards);
        }

        stakingInfo[account].lastRewardTimestamp = block.timestamp;
    }
    

   function convertEthToStakingToken() external payable {
    uint256 amount = msg.value;
    require(amount > 0, "Amount must be greater than zero");

    uint256 stakingTokens = amount * CONVERSION_RATE;

    _mint(msg.sender, stakingTokens);
}

    function validStaker(address account) external view returns(bool) {
        return stakers.contains(account);
    }
}
