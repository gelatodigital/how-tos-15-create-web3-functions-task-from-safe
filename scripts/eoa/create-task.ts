import hre from "hardhat";

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
  
  const cid="QmSBdgzCUYcpwAWQPZc4oFn1zYwb4LovCXMPyrHUncBQ7S" 
  const { taskId, tx } = await automate.createBatchExecTask({
    name: "Heartbeat 30 sec",
    web3FunctionHash: cid,
    web3FunctionArgs: { 
    //   "arg1":"value",
    },
    trigger: {
      interval: 30 * 1000,
      type: TriggerType.TIME
    },
  });

  console.log('- TaskId:', taskId)

}
main();
