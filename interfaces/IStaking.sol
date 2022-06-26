pragma solidity >=0.7.0 <0.9.0;

interface IStaking {
    function fufillData(uint256 _C02, bytes32 _requestId) external;
}