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
import { AutomateSDK, TriggerType } from "@gelatonetwork/automate-sdk";
import { safeAddress } from "../safe";

const { ethers } = hre;

async function main() {


  const [deployer] = await ethers.getSigners(); 

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: deployer,
  });


  const protocolKit = await Safe.create({
    ethAdapter,
    safeAddress,
  });

  const predictedSafeAddress =
    await protocolKit.getAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed =
    await protocolKit.isSafeDeployed();
  console.log({ isSafeDeployed });


  const txServiceUrl = 'https://safe-transaction-sepolia.safe.global' 
  const service = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter })

  const senderAddress = await deployer.getAddress()
  const safeTxHash = "0xac004b20813baf6648fee6e19783439b7d8c90dbdb562eabf4d14dd8902034fa" 
  const signature = await protocolKit.signTransactionHash(safeTxHash)
  const response = await service.confirmTransaction(safeTxHash, signature.data)
  console.log('Confirmed a transaction with Safe:', safeAddress)
  console.log('- safeTxHash:', safeTxHash)
  console.log('- Sender:', senderAddress)
  console.log('- Sender signature:', signature.data)


}
main();
