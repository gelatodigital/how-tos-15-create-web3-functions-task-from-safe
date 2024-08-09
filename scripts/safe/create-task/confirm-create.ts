import hre from "hardhat";

import Safe, {
  EthersAdapter,
} from "@safe-global/protocol-kit";

import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

import SafeApiKit from "@safe-global/api-kit";
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

  const safeTxHash = "0x72fd3bf3cc4f1040daace6f2c5c2990e0aedaaa6aef9f4dbdd55aad64ecff875"


  const txServiceUrl = 'https://safe-transaction-sepolia.safe.global' 
  const service = new SafeApiKit({ txServiceUrl, ethAdapter: ethAdapter })

  const senderAddress = await deployer.getAddress()

  const signature = await protocolKit.signTransactionHash(safeTxHash)
  const response = await service.confirmTransaction(safeTxHash, signature.data)

  console.log('Confirmed a transaction with Safe:', safeAddress)
  console.log('- safeTxHash:', safeTxHash)
  console.log('- Sender:', senderAddress)
  console.log('- Sender signature:', signature.data)

}
main();
