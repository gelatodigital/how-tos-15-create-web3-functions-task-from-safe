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
import { safeAddress } from "../safe/safe";
import { task } from "hardhat/config";

const { ethers } = hre;

async function main() {

  const [deployer] = await ethers.getSigners(); 

  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log(chainId)
  const automate = new AutomateSDK(chainId, deployer);
  const taskId = "0xc35e11031c59558b2c4a9c35d9ab23fb4feae7f3e9f5fac689d95bdc9cb0d77d"
  const { tx } = await automate.cancelTask(taskId)


  let receipt=  await tx.wait()
  console.log('- txHash:', receipt.transactionHash)
 


}
main();
