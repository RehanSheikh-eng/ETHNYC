// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../interfaces/IStMatic.sol";
import "../interfaces/IAPIConsumer.sol";
import "../interfaces/IStMatic.sol";
import "./Testable.sol";


/**
 * @title Stake money for your objectives
 * @dev This allows you to stake money for your objectives
 */
contract Staking is Ownable{


    address payable owner;
    uint256 MAX_INT = 2**256 - 1;

    // Contract Interfaces
    IStMatic stMatic;
    ERC20 matic;
    IAPIConsumer internal apiConsumer;

    // UINT to track stMatic in pool
    uint256 public communityPool;

    struct userInformation {
        string vehicleRegistration;
        uint256 deadline;
        uint256 stakedAmount;
        uint256 shares;
        uint256 carbonTax;
    }


    // Mapping from user wallet address to submitted information
    mapping(address => userInformation) private addressToInfo;
    
    // Keep track of API requests
    mapping(bytes32 => address) private addressToRequestID;

    modifier onlyAPIConsumer(){

        require(
            msg.sender == address(apiConsumer)
        ); // dev: Only VRFConsuemr contract can call this function

        _;
    }

    constructor(address _maticAddress, address _stMaticAddress, address _IAPIConsumer) {
        owner = payable(msg.sender);
        matic = ERC20(_maticAddress);
        stMatic = IStMatic(_stMaticAddress);
        apiConsumer = IAPIConsumer(_IAPIConsumer);
    }

    function initialize(address _APIConsumer) public onlyOwner(){

        require(_APIConsumer != address(0x0)); // dev: APIConsumer address must be defined

        // Create APIConsumer contract instance
        apiConsumer = IAPIConsumer(_APIConsumer);
    }

    function stake(uint256 _amount) public {

        // Mandatory checks of input data
        require(amount >= 1, "Need to transfer at least 1");
        require(userGoals[msg.sender].stakedAmount == 0, "User already has set up a plan");
        require(block.timestamp < deadline, "Deadline must be set in the future");

        // Transfer matic from the message sender to this contract
        matic.transferFrom(msg.sender, address(this), amount);

        // Approve the staking contract's use of this contracts matic
        matic.approve(address(stMatic), MAX_INT);

        // Stake matic with LIDO
        uint256 deposited = stMatic.submit(_amount);

        // Calculate deadline date
        uint256 deadline = block.timestamp + 52 weeks;

        // append info to mapping
        addressToInfo[msg.sender] = userInformation(0, deadline, _amount, deposited, 0);

        // Incerement pool amount
        communityPool += amount;
    }

    function initWithdraw(string _vehicleRegistration) public {

        require(addressToInfo[msg.sender].stakedAmount > 0, "User doesn't have a plan");
        require(block.timestamp > addressToInfo[msg.sender].deadline, "Deadline hasn't been achieved");

        // Reqeust CO2 data from API
        bytes32 requestId = apiConsumer.requestLatestC02Data(_vehicleRegistration);

        // Save request ID to users address in mapping
        addressToRequestID[requestId] = msg.sender;

        uint stakedAmount = userGoals[target].stakedAmount;
        uint shares = userGoals[target].shares;

        uint256 stakedPlusInterests = yDai.withdraw(shares);

        communityPool -= stakedAmount ;
        userGoals[target] = UserGoals(0, 0, 0);
        matic.transfer(msg.sender, stakedPlusInterests);
    }

    function fufillData(uint256 _C02, bytes32 _requestId) external onlyAPIConsumer(){

    }
}
