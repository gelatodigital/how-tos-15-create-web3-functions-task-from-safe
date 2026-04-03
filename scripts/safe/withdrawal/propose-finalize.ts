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

// ABI for withdraw
const GELATO_1BALANCE_ABI = [
  "function withdraw(address _token, uint256 _amount, uint256 _totalValidRequestedWithdrawAmount, bytes32[] calldata _merkleProof) external",
];

async function main() {
  // Amount to withdraw (must match the requestWithdrawal amount)
  const withdrawalAmount = "10000000"; // <-- Update this value

  console.log("\n--- Step 1: Checking settlement status ---\n");

  // Fetch _totalValidRequestedWithdrawAmount from API
  const sponsorResponse = await fetch(
    `https://api.gelato.digital/1balance/networks/mainnets/sponsors/${safeAddress}`
  );
  const sponsorData = await sponsorResponse.json();
  const totalValidRequestedWithdrawAmount =
    sponsorData._totalValidRequestedWithdrawAmount;

  console.log(
    "_totalValidRequestedWithdrawAmount:",
    totalValidRequestedWithdrawAmount
  );

  if (
    !totalValidRequestedWithdrawAmount ||
    totalValidRequestedWithdrawAmount === "0"
  ) {
    console.log(
      "\nSettlement not yet complete. Please wait and try again later."
    );
    console.log(
      "The settlement process can take several hours after the initiate withdrawal tx is confirmed."
    );
    return;
  }

  console.log("\n--- Step 2: Fetching Merkle Proof ---\n");

  // Fetch merkle proof from API
  const proofResponse = await fetch(
    `https://api.gelato.digital/1balance/networks/137/tokens/${USDC_ADDRESS}/sponsors/${safeAddress}/proof`
  );
  const proofData = await proofResponse.json();
  const merkleProof: string[] = proofData._merkleProof;

  console.log("Merkle proof:", merkleProof);

  console.log("\n--- Step 3: Proposing finalize withdrawal ---\n");

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

  // Encode the withdraw call
  const iface = new ethers.utils.Interface(GELATO_1BALANCE_ABI);
  const data = iface.encodeFunctionData("withdraw", [
    USDC_ADDRESS,
    withdrawalAmount,
    totalValidRequestedWithdrawAmount,
    merkleProof,
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

  console.log("\nProposed finalize withdrawal with Safe:", safeAddress);
  console.log("- safeTxHash:", safeTxHash);
  console.log("- Sender:", senderAddress);
  console.log("- Sender signature:", signature.data);
  console.log("- Token:", USDC_ADDRESS);
  console.log("- Withdrawal amount:", withdrawalAmount);
  console.log(
    "- Total valid requested withdraw amount:",
    totalValidRequestedWithdrawAmount
  );
}
main();
