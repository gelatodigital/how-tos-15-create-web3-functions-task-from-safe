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

  let abi:any[] =  [
    "function canTopUp() external view returns (bool canTopUp, bytes memory payload)",
    "function topUp() external"
  ]
  let iface =  new ethers.utils.Interface(abi);
  let resolverData = iface.encodeFunctionData("canTopUp",[]);
  let targetAddress = "0xbfDC6b9944B7EFdb1e2Bc9D55ae9424a2a55b206"
  let execSelector = iface.getSighash("topUp") 


  const { taskId, tx } = await automate.prepareTask({
    name: "test",
    execSelector,
    execAddress:targetAddress,
    resolverAddress:targetAddress,
    resolverData,
    dedicatedMsgSender:true,
    trigger: {
      interval: 3600 * 1000,
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

