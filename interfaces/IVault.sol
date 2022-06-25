// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IVault {
    function deposit(uint256 _amount) external returns (uint256);
    function withdraw(uint256 _amount) external returns (uint256);
    function pricePerShare() external view;
}