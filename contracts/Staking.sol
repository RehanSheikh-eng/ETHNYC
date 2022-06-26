// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./interfaces/IAPIConsumer.sol";
import "./interfaces/IWMaticGateway.sol";
import "./interfaces/ILendingPool.sol";
import "./Testable.sol";


/**
 * @title Stake money for your objectives
 * @dev This allows you to stake money for your objectives
 */
contract Staking is Ownable{
    using SafeMath for uint256;
    uint256 MAX_INT = 2**256 - 1;

    // Contract Interfaces
    ERC20 dai; 
    ERC20 aDai;
    IAPIConsumer internal apiConsumer;
    ILendingPool lendingPool;

    // UINT to track aDai in pool
    uint256 public communityPool;

    //
    uint256 stakedPlusInterests;

    struct userInformation {
        uint256 deadline;
        uint256 lentAmount;
        uint256 aShares;
    }

    // Average C02
    uint256 averageC02 = 100000;

    // Mapping from user wallet address to submitted information
    mapping(address => userInformation) private addressToInfo;
    
    // Keep track of API requests
    mapping(bytes32 => address) private addressToRequestID;

    // Keeps track of previous C02 data
    mapping(address => uint256) private addressToC02;

    event fundsStaked(uint amount);

    modifier onlyAPIConsumer(){

        require(
            msg.sender == address(apiConsumer)
        ); // dev: Only VRFConsuemr contract can call this function

        _;
    }

    constructor(address _daiAddress, address _aDaiAddress, address _lendingPoolAddress) {
        dai = ERC20(_daiAddress);
        aDai = ERC20(_aDaiAddress);
        lendingPool = ILendingPool(_lendingPoolAddress);
    }

    function initialize(address _APIConsumer) public onlyOwner(){

        require(_APIConsumer != address(0x0)); // dev: APIConsumer address must be defined

        // Create APIConsumer contract instance
        apiConsumer = IAPIConsumer(_APIConsumer);
    }

    function stake(uint256 _amount) public {

        // Mandatory checks of input data
        require(_amount >= 0, "Need to transfer at least 0");
        require(addressToInfo[msg.sender].lentAmount == 0, "User already has set up a plan");

        // Transfer dai from the message sender to this contract
        dai.transferFrom(msg.sender, address(this), _amount);

        // Approve the staking contract's use of this contracts dai
        dai.approve(address(lendingPool), MAX_INT);

        // Lend dai with AAVE
        lendingPool.deposit(address(dai), _amount, msg.sender, 0);

        uint256 aShare = aDai.balanceOf(msg.sender);

        // Calculate deadline date
        uint256 deadline = block.timestamp + 52 weeks;

        // append info to mapping
        addressToInfo[msg.sender] = userInformation(deadline, _amount, aShare);

        // Incerement pool amount
        communityPool += _amount;

        emit fundsStaked(aShare);
    }

    function initWithdraw(string memory _vehicleRegistration) public {

        require(addressToInfo[msg.sender].lentAmount > 0, "User doesn't have a plan");
        require(block.timestamp > addressToInfo[msg.sender].deadline, "Deadline hasn't been achieved");

        // Reqeust CO2 data from API
        bytes32 requestId = apiConsumer.requestLatestC02Data(_vehicleRegistration);

        // Save request ID to users address in mapping
        addressToRequestID[requestId] = msg.sender;
    }

    function fufillData(uint256 _C02, bytes32 _requestId) external onlyAPIConsumer(){

        address userAddress = addressToRequestID[_requestId];

        uint256 lentAmount = addressToInfo[userAddress].lentAmount;
        uint256 aShares = addressToInfo[userAddress].aShares;

        // Calculate how much Interst is required

        if (_C02 > averageC02) {
            uint256 difference = _C02.sub(averageC02);
            uint256 percentageChange = difference.div(averageC02);
            stakedPlusInterests = addressToInfo[userAddress].aShares.mul(100 - percentageChange).div(100);
        }
        
        else if (_C02 <= averageC02) {
            uint256 difference = averageC02.sub(_C02);
            uint256 percentageChange = difference.mul(100).div(averageC02);
            stakedPlusInterests = addressToInfo[userAddress].aShares.mul(100 + percentageChange).div(100); 
        }
        
        uint256 withdrawn = lendingPool.withdraw(address(dai), stakedPlusInterests, userAddress);

        // Decrement commuinty pool
        communityPool -= withdrawn;
    }
}
