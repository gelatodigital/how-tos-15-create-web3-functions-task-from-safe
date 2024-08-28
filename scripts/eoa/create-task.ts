import hre from "hardhat";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import SafeApiKit from "@safe-global/api-kit";
import { AutomateSDK, TriggerType } from "@gelatonetwork/automate-sdk";
import { safeAddress } from "../safe/safe";
import { task } from "hardhat/config";

import counterJson from "../../artifacts/contracts/SimpleCounter.sol/SimpleCounter.json"
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

  let abi:any[] = counterJson.abi;
  let iface =  new ethers.utils.Interface(abi);
  let resolverData = iface.encodeFunctionData("checker", [8]);
  let conunterAddress = "0xc2E00Dea3cc483e057519D1df9d313EF2a52C1Ae"
  let execSelector = iface.getSighash("updatePrice") 


  const { taskId, tx } = await automate.prepareTask({
    name: "test",
    execSelector,
    execAddress:conunterAddress,
    resolverAddress:conunterAddress,
    resolverData,
    dedicatedMsgSender:true,
    trigger: {
      interval: 60 * 1000,
      type: TriggerType.TIME,
    },
  });



  console.log('- TaskId:', taskId)

  let txsent = await deployer.sendTransaction({
    to:tx.to,
    data:tx.data,
    value:0
  })
  let rec = await txsent.wait()
  console.log(rec.transactionHash)

}
main();

