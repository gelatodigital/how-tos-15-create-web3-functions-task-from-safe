import hre, { deployments, getNamedAccounts } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { dedicatedMsgSender } from "../scripts/safe/safe";

const ROUTER = "0xEfF92A263d31888d860bD50809A8D171709b7b1c"

const isHardhat = hre.network.name === "hardhat";

const func: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!isHardhat) {
    console.log(
      `\nDeploying GelatoMakerJob  to ${hre.network.name}. Hit ctrl + c to abort`
    );
  
  }

 let gelatoMakerJob =  await deploy("GelatoMakerJob", {
    from: deployer,
    log: !isHardhat,
    // proxy: {
    //   proxyContract: "EIP173Proxy",
    // },
    args:[dedicatedMsgSender]
  });



let topUpJob =  await deploy("MakerTopUp", {
  from: deployer,
  log: !isHardhat,
  // proxy: {
  //   proxyContract: "EIP173Proxy",
  // },
  args:[deployer, deployer,gelatoMakerJob.address ]
});


console.log(`TOP UP deployed on ${topUpJob.address}`)



};

func.tags = ["GelatoMakerJob"];

export default func;
