pragma solidity >=0.7.0 <0.9.0;

interface IStMatic {
    function approve(address _spender, uint256 _amount) external returns (bool);
    function submit(uint256 _amount) external returns (uint256);
    function requestWithdraw(uint256 _amount) external;
    function claimTokens(uint256 _tokenId) external;
}