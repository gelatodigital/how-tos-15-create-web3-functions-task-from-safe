import hre from "hardhat";

import Safe, {
  EthersAdapter,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import SafeApiKit from "@safe-global/api-kit";
import { safeAddress } from "../safe";

const { ethers } = hre;

// Gelato 1Balance contract on Polygon
const GELATO_1BALANCE = "0x7506C12a824d73D9b08564d5Afc22c949434755e";

// USDC on Polygon
const USDC_ADDRESS = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";

// ABI for requestWithdrawal
const GELATO_1BALANCE_ABI = [
  "function requestWithdrawal(address _token, uint256 _withdrawalAmount) external",
];

async function main() {
  // Amount to withdraw (USDC has 6 decimals)
  // e.g. 10 USDC = 10_000_000
  const withdrawalAmount = "10000000"; // <-- Update this value

  const [deployer] = await ethers.getSigners();

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: deployer,
  });

  const protocolKit = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  const predictedSafeAddress = await protocolKit.getAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed = await protocolKit.isSafeDeployed();
  console.log({ isSafeDeployed });

  // Encode the requestWithdrawal call
  const iface = new ethers.utils.Interface(GELATO_1BALANCE_ABI);
  const data = iface.encodeFunctionData("requestWithdrawal", [
    USDC_ADDRESS,
    withdrawalAmount,
  ]);

  const txServiceUrl = "https://safe-transaction-polygon.safe.global";
  const service = new SafeApiKit({ txServiceUrl, ethAdapter });

  const safeTransactionData: MetaTransactionData = {
    to: GELATO_1BALANCE,
    data,
    value: "0",
    operation: OperationType.Call,
  };

  // Propose transaction to the service
  const safeTransaction = await protocolKit.createTransaction({
    safeTransactionData,
  });
  const senderAddress = await deployer.getAddress();
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction);
  const signature = await protocolKit.signTransactionHash(safeTxHash);
  await service.proposeTransaction({
    safeAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress,
    senderSignature: signature.data,
  });

  console.log("Proposed initiate withdrawal with Safe:", safeAddress);
  console.log("- safeTxHash:", safeTxHash);
  console.log("- Sender:", senderAddress);
  console.log("- Sender signature:", signature.data);
  console.log("- Token:", USDC_ADDRESS);
  console.log("- Withdrawal amount:", withdrawalAmount);
}
main();
