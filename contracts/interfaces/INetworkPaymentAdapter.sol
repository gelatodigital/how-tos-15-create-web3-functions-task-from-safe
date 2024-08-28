// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {INetworkTreasury} from "./INetworkTreasury.sol";

interface INetworkPaymentAdapter {
    function file(bytes32 what, address data) external;

    function file(bytes32 what, uint256 data) external;

    /**
     * @notice Top up the treasury with any outstanding DAI
     * @dev Only callable from treasury. Call canTopUp() to see if this will pass.
     */
    function topUp() external returns (uint256 daiSent);

    /**
     * @notice Check if we can call the topUp() function.
     */
    function canTopUp() external view returns (bool);

    function vestId() external view returns (uint256);

    function bufferMax() external view returns (uint256);

    function minimumPayment() external view returns (uint256);

    function treasury() external view returns (INetworkTreasury);

      function vest() external view returns (address);


}