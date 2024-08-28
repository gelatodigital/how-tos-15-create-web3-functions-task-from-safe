import hre from "hardhat";

import Safe, {
  EthersAdapter,
} from "@safe-global/protocol-kit";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";
import {
  setBalance,
  impersonateAccount,
  time,
} from "@nomicfoundation/hardhat-network-helpers";


import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import SafeApiKit from "@safe-global/api-kit";
import { AutomateSDK, TriggerType } from "@gelatonetwork/automate-sdk";
import { automateOld, makerAddress, safeAddress, treasury } from "../safe/safe";
import { task } from "hardhat/config";
import { Contract, providers } from "ethers";

const { ethers } = hre;

async function main() {

  const [deployer] = await ethers.getSigners(); 

  let oldAutomateabi = [
    "function cancelTask(bytes32 _taskId) external",
    "function getTaskIdsByUser(address _taskCreator) external view returns (bytes32[] memory)"]
  
    await impersonateAccount(makerAddress);
    let makerSigner = await ethers.getSigner(makerAddress);
    let makerSignerBalance = await ethers.provider.getBalance(makerAddress)
    console.log(makerSignerBalance.toString())

    await setBalance(makerAddress,ethers.utils.parseEther("1000"))
    makerSignerBalance = await ethers.provider.getBalance(makerAddress)
    console.log(makerSignerBalance.toString())

    let task1 = "0xf23802c070ea93ccb291e5d8e08f554b4545e9c15e9b815248aac2970e3519a1"
    let task2 = "0xdd0c42d886a69d83995d5434ad99621c047187538e8f0c2f68f0de076ee5f4bc"
  let automatecontract = new Contract(automateOld,oldAutomateabi,deployer)

  let tasks = await automatecontract.getTaskIdsByUser(makerAddress)
  console.log(tasks)
    let tx = await automatecontract.connect(makerSigner).cancelTask(task2)
    await tx.wait()
    tasks = await automatecontract.getTaskIdsByUser(makerAddress)
    console.log(tasks)
 
  // const privateKey = process.env.PK;
  // const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC);
  // const wallet = new ethers.Wallet(privateKey!, l1Provider);
  // const chainId = (await l1Provider.getNetwork()).chainId;
  // console.log(chainId)
  // const automate = new AutomateSDK(chainId, wallet);
  // const taskId1 = "0xb38d1ce797d8959b577052c2f74ef0f76d814371aa0afa899466d4943d6a2124"
  // const { tx,taskId } = await automate.prepareCancelTask(taskId1)


  // let txsent = await deployer.sendTransaction({
  //   to:tx.to,
  //   data:tx.data,
  //   value:0
  // })
  // let rec = await txsent.wait()
  // console.log(rec.transactionHash)
  // console.log(taskId)


}
main();
