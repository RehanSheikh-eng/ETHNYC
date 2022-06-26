pragma solidity >=0.7.0 <0.9.0;

interface IWMaticGateway {
  function depositETH(address lendingPool, address onBehalfOf, uint16 referralCode) external payable;
  function withdrawETH(address lendingPool, uint256 amount, address to) external;
}
