pragma solidity >=0.7.0 <0.9.0;

interface IAPIConsumer {
    function requestLatestC02Data() public returns (bytes32 requestId);
}