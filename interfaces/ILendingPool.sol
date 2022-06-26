// SPDX-License-Identifier: agpl-3.0
pragma solidity >=0.7.0 <0.9.0;

interface ILendingPool {
  
  function deposit(
    address asset,
    uint256 amount,
    address onBehalfOf,
    uint16 referralCode
  ) external;

  function withdraw(
    address asset,
    uint256 amount,
    address to
  ) external returns (uint256);
}