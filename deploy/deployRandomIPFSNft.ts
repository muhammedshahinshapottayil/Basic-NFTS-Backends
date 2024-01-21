import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { network } from "hardhat";
import "dotenv/config";
import { developmentChains } from "../helper-hardhat-config";
import {
  frontendUpdate,
  storeImages,
  storeTokenUriMetadata,
  verify,
} from "../utils";
const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};
const deployLottery: DeployFunction = async ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log("Started Deploying");

  const {
    PRICE_FEED_ADDRESS,
    NFT_PRICE,
    VRF_CONSUMER_BASE_ADDRESS,
    SUBSCRIPTION_ID,
    SEPOLIA_HASH_KEY,
    WAIT_CONFIRMATION,
    CB_GASLIMIT,
    UPDATE_FRONTEND,
    VERIFY_CONTRACT,
    ETHER_SCAN_API,
    UPLOAD_TOKEN_URI,
    IMAGE_LOCATION,
  } = process.env;
  let URI_ARR: string[] = [];
  if (UPLOAD_TOKEN_URI == "true") URI_ARR = await handleURIupload();
  const args = [
    PRICE_FEED_ADDRESS,
    NFT_PRICE,
    VRF_CONSUMER_BASE_ADDRESS,
    SUBSCRIPTION_ID,
    SEPOLIA_HASH_KEY,
    WAIT_CONFIRMATION,
    CB_GASLIMIT,
    URI_ARR,
  ];

  const deployedContract = await deploy("RandomIPFSNFT", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: Number(WAIT_CONFIRMATION),
  });

  if (
    !developmentChains.includes(network.name) &&
    VERIFY_CONTRACT == "true" &&
    ETHER_SCAN_API
  )
    await verify(deployedContract.address, args);

  if (UPDATE_FRONTEND == "true") await frontendUpdate(deployedContract);

  log("Successfully Completed Deploying");

  // Handle URI upload

  async function handleURIupload() {
    let uriArr: string[] = [];
    const { responses: imageUploadResponses, files } = await storeImages(
      IMAGE_LOCATION!
    );
    for (let imageUploadResponseIndex in imageUploadResponses) {
      let tokenUriMetadata = { ...metadataTemplate };
      tokenUriMetadata.name = files[Number(imageUploadResponseIndex)].replace(
        ".png",
        ""
      );
      tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
      tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
      console.log(`Uploading ${tokenUriMetadata.name}...`);
      const metadataUploadResponse = await storeTokenUriMetadata(
        tokenUriMetadata
      );
      uriArr.push(`ipfs://${metadataUploadResponse?.IpfsHash}`);
    }
    console.log("Token URIs uploaded! They are:");
    console.log(uriArr);
    return uriArr;
  }
};

export default deployLottery;
deployLottery.tags = ["all", "RandomIPFSNFT"];
