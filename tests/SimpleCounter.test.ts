import hre from "hardhat";
import { expect } from "chai";
import { IERC20, MakerTopUp, SimpleCounter } from "../typechain";
import { before } from "mocha";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  Web3FunctionUserArgs,
  Web3FunctionResultV2,
} from "@gelatonetwork/web3-functions-sdk";
import { Web3FunctionHardhat } from "@gelatonetwork/web3-functions-sdk/hardhat-plugin";
import { Contract } from "ethers";
const { ethers, deployments, w3f } = hre;



describe("SimpleCounter Tests", function () {


  let owner: SignerWithAddress;

  let makerTopUp: MakerTopUp
   let daiContract: IERC20

  before(async function () {
    await deployments.fixture();

    [owner] = await hre.ethers.getSigners();

    console.log(27777777)

    makerTopUp = await ethers.getContract(" MakerTopUp");



    //daiContract = new Contract("",,owner.address) as unknown as IERC20
    

    // simpleW3f = w3f.get("simple");

    // userArgs = {
    //   currency: "ethereum",
    //   oracle: oracle.address,
    // };
  });

  it("canExec: true - First execution", async () => {
    let dai = await makerTopUp.DAI()
    console.log(31,dai)

  });
});
