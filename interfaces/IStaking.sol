pragma solidity >=0.7.0 <0.9.0;

interface IStaking {
    function fufillData() external returns (bytes32 requestId);
}