import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import "dotenv/config";
import { developmentChains } from "../helper-hardhat-config";
import { frontendUpdate, verify } from "../utils";

const deployLottery: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Started Deploying");

  const {
    WAIT_CONFIRMATION,
    UPDATE_FRONTEND,
    VERIFY_CONTRACT,
    ETHER_SCAN_API,
  } = process.env;

  const args: string[] = [];
  const deployedContract = await deploy("RandomIPFSNFT", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: Number(WAIT_CONFIRMATION),
  });

  if (
    !developmentChains.includes(network.name) &&
    VERIFY_CONTRACT &&
    ETHER_SCAN_API
  )
    await verify(deployedContract.address, args);

  if (UPDATE_FRONTEND) await frontendUpdate(deployedContract);

  log("Successfully Completed Deploying");
};

export default deployLottery;
deployLottery.tags = ["all", "RandomIPFSNFT"];
