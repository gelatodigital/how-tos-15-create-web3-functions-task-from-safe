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

import { task } from "hardhat/config";
import { makerAddress } from "../safe/safe";

const { ethers } = hre;

async function main() {

  const [deployer] = await ethers.getSigners(); 

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: deployer,
  });


  const protocolKit = await Safe.create({
    ethAdapter,
    safeAddress:makerAddress
  });

  const predictedSafeAddress =
    await protocolKit.getAddress();
  console.log({ predictedSafeAddress });

  const isSafeDeployed =
    await protocolKit.isSafeDeployed();
  console.log({ isSafeDeployed });


  const chainId = (await ethers.provider.getNetwork()).chainId;
  const automate = new AutomateSDK(chainId, deployer);

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
  },
  {},
  makerAddress // important to pass the safe address as task creator
);


  const txServiceUrl = 'https://safe-transaction-mainnet.safe.global';
  const service = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter })


  const safeTransactionData: MetaTransactionData = {
    to: tx.to!,
    data: tx.data!,
    value: "0",
    operation: OperationType.Call,
  };

    // Propose transaction to the service 
  const safeTransaction = await protocolKit.createTransaction({ safeTransactionData })
  const senderAddress = await deployer.getAddress()
  const safeTxHash = await protocolKit.getTransactionHash(safeTransaction)
  const signature = await protocolKit.signTransactionHash(safeTxHash)
  await service.proposeTransaction({
    safeAddress: makerAddress,
    safeTransactionData: safeTransaction.data,
    safeTxHash,
    senderAddress ,
    senderSignature: signature.data
  })

  
  console.log('Proposed a transaction with Safe:', makerAddress)
  console.log('- safeTxHash:', safeTxHash)
  console.log('- Sender:', senderAddress)
  console.log('- Sender signature:', signature.data)
  console.log('- TaskId:', taskId)

}
main();
