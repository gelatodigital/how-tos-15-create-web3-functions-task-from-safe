// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.11;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {INetworkTreasury} from "./interfaces/INetworkTreasury.sol";
import {INetworkPaymentAdapter} from "./interfaces/INetworkPaymentAdapter.sol";
import {VestLike} from "./interfaces/VestLike.sol";
import {IAutomate} from "./interfaces/IAutomate.sol";
import {IGelato} from "./interfaces/IGelato.sol";
import {IRouter} from "./interfaces/IRouter.sol";

contract MakerTopUp is Ownable, INetworkTreasury {
    IERC20 public constant DAI =
        IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);

    INetworkPaymentAdapter public constant PAYMENT_ADAPTER =
        INetworkPaymentAdapter(0x0B5a34D084b6A5ae4361de033d1e6255623b41eD);

    IAutomate public constant AUTOMATE =
        IAutomate(0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0);

    IRouter public constant ROUTER = IRouter(0xEfF92A263d31888d860bD50809A8D171709b7b1c);

    address public fundsOwner;
    address public gelatoMakerJob;
    address private immutable feeCollector;

    constructor(
        address _fundsOwner,
        address _newOwner,
        address _gelatoMakerJob
    ) {
        fundsOwner = _fundsOwner;
        gelatoMakerJob = _gelatoMakerJob;
        IGelato gelato = IGelato(AUTOMATE.gelato());
        feeCollector = gelato.feeCollector();

        if (_newOwner != address(0)) transferOwnership(_newOwner);
    }

    modifier onlyGelatoMakerJob() {
        require(msg.sender == gelatoMakerJob, "not GelatoMakerJob");
        _;
    }

    function topUp() external {
        PAYMENT_ADAPTER.topUp();
    }

    function setFundsOwner(address _newFundsOwner) external onlyOwner {
        require(fundsOwner != _newFundsOwner, "already fundsOwner");

        fundsOwner = _newFundsOwner;
    }

    function setGelatoMakerJob(address _newGelatoMakerJob) external onlyOwner {
        require(gelatoMakerJob != _newGelatoMakerJob, "already GelatoMakerJob");

        gelatoMakerJob = _newGelatoMakerJob;
    }

    function transferDaiToFundsOwner() external onlyOwner {
        uint256 availableBalance = DAI.balanceOf(address(this));
        DAI.transfer(fundsOwner, availableBalance);
    }

    function canTopUp()
        external
        view
        returns (bool canTopUp, bytes memory payload)
    {
        canTopUp = PAYMENT_ADAPTER.canTopUp();

        payload = canTopUp
            ? abi.encodeWithSelector(this.topUp.selector)
            : bytes("!canTopUp");
    }

    function getBufferSize() external view override returns (uint256) {
        return DAI.balanceOf(address(this));
    }

    function payDoJobs() external onlyGelatoMakerJob {
    (uint256 fee,) = _getFeeDetails();
    
     
     _transfer(fee);

    }

    function _transfer(uint256 _fee) internal {
        (bool success, ) = feeCollector.call{value: _fee}("");
        require(success, "_transfer: ETH transfer failed");
    }

    function _getFeeDetails()
        internal
        view
        returns (uint256 fee, address feeToken)
    {
        (fee, feeToken) = AUTOMATE.getFeeDetails();
        fee = 100;
    }

        function _swap(
        uint256 fee,
        uint256 deadline
    ) internal {
        address WETH = ROUTER.WETH();

        address[] memory path = new address[](2);
        path[0] = address(DAI);
        path[1] = WETH;

        DAI.approve(address(ROUTER), fee);

        ROUTER.swapTokensForExactETH(
            fee,
            fee,
            path,
            address(this),
            deadline
        );

    }
}
