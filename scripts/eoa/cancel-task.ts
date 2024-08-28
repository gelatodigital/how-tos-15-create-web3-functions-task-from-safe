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
import { providers } from "ethers";

const { ethers } = hre;

async function main() {

  const [deployer] = await ethers.getSigners(); 

  const privateKey = process.env.PK;
  const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC);
  const wallet = new ethers.Wallet(privateKey!, l1Provider);
  const chainId = (await l1Provider.getNetwork()).chainId;
  console.log(chainId)
  const automate = new AutomateSDK(chainId, wallet);
  const taskId1 = "0xb38d1ce797d8959b577052c2f74ef0f76d814371aa0afa899466d4943d6a2124"
  const { tx,taskId } = await automate.prepareCancelTask(taskId1)


  let txsent = await deployer.sendTransaction({
    to:tx.to,
    data:tx.data,
    value:0
  })
  let rec = await txsent.wait()
  console.log(rec.transactionHash)
  console.log(taskId)


}
main();
