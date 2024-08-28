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
import { automateOld, dedicatedMsgSender, makerAddress, safeAddress, treasury } from "../safe/safe";
import { task } from "hardhat/config";
import { Contract, providers } from "ethers";

const { ethers } = hre;

async function main() {

  const [deployer] = await ethers.getSigners(); 

  let abi:any[] =  [
    "function checker(address _sequencer,bytes32 _network, uint256 _startIndex, uint256 _endIndex ) external view returns (bool, bytes memory)",
    "function doJobs(address[] calldata _tos, bytes[] calldata _datas) external",
  ]

  let iface =  new ethers.utils.Interface(abi);
  let resolverData = iface.encodeFunctionData("checker",[
    "0x238b4E35dAed6100C6162fAE4510261f88996EC9",
    "0x47454c41544f0000000000000000000000000000000000000000000000000000",
    0,
    5]);
  let targetAddress = "0xA3E5DfE71aE3e6DeC4D98fa28821dF355d7244B3" //"0x698c77E5EEc653FcfA6D541CbfC0187B04f575B5"


    let oldTask = new Contract(targetAddress,abi,deployer);

    let result = await oldTask.checker("0x238b4E35dAed6100C6162fAE4510261f88996EC9",
      "0x47454c41544f0000000000000000000000000000000000000000000000000000",
      0,
      5)

      if (result[0] == false){
        console.log('reutrn')
        return
      }

      console.log(result[1])
      setBalance(dedicatedMsgSender,ethers.utils.parseEther("1000"))
      await impersonateAccount(dedicatedMsgSender);
      let dedicatedSigner = await ethers.getSigner(dedicatedMsgSender);

   let tx2 = await dedicatedSigner.sendTransaction({
    to:targetAddress,
    data:result[1],
    value:0
   }) 
   let rec = await tx2.wait()
   console.log(rec)
 

   throw("XXXXX")

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
