pragma solidity >=0.7.0 <0.9.0;

interface IAPIConsumer {
    function requestLatestC02Data(string memory _vehicleRegistration) external returns (bytes32 requestId);
}