// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAutomate {
 
    function getFeeDetails() external view returns (uint256, address);

    function gelato() external view returns (address payable);

}