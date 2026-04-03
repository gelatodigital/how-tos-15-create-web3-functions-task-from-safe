import hre from "hardhat";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const { ethers } = hre;

// Automate contract address on eduTestnet
const AUTOMATE_ADDRESS = "0x2A6C106ae13B558BB9E2Ec64Bd2f1f7BEFF3A5E0";

// cancelTask(bytes32) function selector: keccak256("cancelTask(bytes32)") = 0x813785e6
const CANCEL_TASK_ABI = ["function cancelTask(bytes32 _taskId)"];

async function main() {
  const [deployer] = await ethers.getSigners();

  const chainId = (await ethers.provider.getNetwork()).chainId;
  console.log("Chain ID:", chainId);

  const taskId =
    "0xd16a0d4ad0a1e53b5453c985f49d0adb1154e4d7fcd3df06a6dc648a196cabe7";

  // Encode calldata directly: 0x813785e6 + taskId (32 bytes)
  const iface = new ethers.utils.Interface(CANCEL_TASK_ABI);
  const calldata = iface.encodeFunctionData("cancelTask", [taskId]);

  console.log("Automate contract:", AUTOMATE_ADDRESS);
  console.log("Calldata:", calldata);

  const tx = await deployer.sendTransaction({
    to: AUTOMATE_ADDRESS,
    data: calldata,
  });

  const receipt = await tx.wait();
  console.log("- txHash:", receipt.transactionHash);
}

main();
