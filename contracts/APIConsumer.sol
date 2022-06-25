// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract APIConsumer is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    uint256 public cpi;
    bytes32 internal reqId;
    uint internal id;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    event cpiChanged(uint256 cpi, uint256 timestamp);


    constructor(address _oracle, bytes32 _jobId, uint256 _fee, address _link) {
        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }
        oracle = _oracle;
        jobId = _jobId;
        fee = _fee;

    }

    /**
     * Create a Chainlink request to retrieve API response, find the target
     */
    function requestLatestCPIData() public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        request.add("get", "https://tranquil-falls-64056.herokuapp.com/cpi/peg_price/2018-01");

        request.add("path", "pegPrice");
        
        int timesAmount = 10**18;
        request.addInt("times", timesAmount);
        
        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    /**
     * Receive the response in the form of uint256
     */ 
    function fulfill(bytes32 _requestId, uint256 _cpi) public recordChainlinkFulfillment(_requestId)
    {
        cpi = _cpi;
        emit cpiChanged(cpi, block.timestamp);
    }
}
