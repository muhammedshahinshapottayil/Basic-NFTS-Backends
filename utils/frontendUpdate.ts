import { readFileSync, writeFileSync } from "fs";
import { network } from "hardhat";
import { DeployResult } from "hardhat-deploy/types";
const CONTRACT_ABI_FILE_LOCATION = "../Lottery/frontend/app/constants/abi.json";
const CONTRACT_ADDRESS_FILE_LOCATION =
  "../Lottery/frontend/app/constants/contract.json";

const frontendUpdate = async (deployedContract: DeployResult) => {
  const chainId = network.config.chainId!;
  const currentAddresses = JSON.parse(
    readFileSync(CONTRACT_ADDRESS_FILE_LOCATION, "utf8")
  );
  if (chainId in currentAddresses)
    currentAddresses[chainId].push(deployedContract.address);
  else currentAddresses[chainId] = [deployedContract.address];

  writeFileSync(
    CONTRACT_ADDRESS_FILE_LOCATION,
    JSON.stringify(currentAddresses)
  );

  writeFileSync(
    CONTRACT_ABI_FILE_LOCATION,
    JSON.stringify(deployedContract.abi)
  );
  return;
};
export default frontendUpdate;
