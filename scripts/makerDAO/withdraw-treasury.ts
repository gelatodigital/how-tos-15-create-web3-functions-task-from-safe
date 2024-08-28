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

  
    await impersonateAccount(makerAddress);
    let makerSigner = await ethers.getSigner(makerAddress);
    let makerSignerBalance = await ethers.provider.getBalance(makerAddress)
    console.log(makerSignerBalance.toString())

    await setBalance(makerAddress,ethers.utils.parseEther("1000"))
    makerSignerBalance = await ethers.provider.getBalance(makerAddress)
    console.log(makerSignerBalance.toString())

    let treasuryABI = [
      "function withdrawFunds(address payable _receiver,address _token,uint256 _amount) public",
      "function getTotalCreditTokensByUser(address _user) public view returns (address[])",
      "function userTokenBalance(address _user, address _token)  public view returns (uint256)"
    ]
    const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const eth = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
    let treasuryContract = new Contract(treasury,treasuryABI,makerSigner);
    let tokens = await treasuryContract.getTotalCreditTokensByUser(makerAddress);

    console.log(tokens)

    let tokensAmount = await treasuryContract.userTokenBalance(makerAddress,dai);
    console.log((+tokensAmount.toString())/10**18)

    let tokensAmountEth = await treasuryContract.userTokenBalance(makerAddress,eth);
    console.log((+tokensAmountEth.toString())/10**18)

    makerSignerBalance = await ethers.provider.getBalance(makerAddress)
    console.log(makerSignerBalance.toString())

    //// WITHDRAW ETH PAYLOAD 
    let {to,data } = await treasuryContract.populateTransaction.withdrawFunds(makerAddress,eth,tokensAmountEth);
    let txsent = await makerSigner.sendTransaction({
      to:to,
      data:data,
      value:0
    })
    let rec = await txsent.wait()
    console.log(rec.transactionHash)


       //// WITHDRAW ETH PAYLOAD 
     let tx2 = await treasuryContract.populateTransaction.withdrawFunds(makerAddress,dai,tokensAmount);
    
     let txSent2 = await makerSigner.sendTransaction({
      to:tx2.to,
      data:tx2.data,
      value:0
    })
    let rec2 = await txSent2.wait()
    console.log(rec2.transactionHash)

    
    console.log(rec.transactionHash)
    tokensAmountEth = await treasuryContract.userTokenBalance(makerAddress,eth);
    console.log((+tokensAmountEth.toString())/10**18)

  makerSignerBalance = await ethers.provider.getBalance(makerAddress)
    console.log(makerSignerBalance.toString())

    tokensAmount = await treasuryContract.userTokenBalance(makerAddress,dai);
    console.log((+tokensAmount.toString())/10**18)

}
main();
