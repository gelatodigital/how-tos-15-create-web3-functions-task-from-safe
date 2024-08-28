// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface VestLike {
    function vest(uint256) external;
    function unpaid(uint256) external view returns (uint256);
}