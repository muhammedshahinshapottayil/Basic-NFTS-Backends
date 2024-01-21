import "dotenv/config";
import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";
const { PINATA_API_KEY, PINATA_SECRET_KEY } = process.env;
const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SECRET_KEY);
async function storeImages(imagesFilePath: string) {
  const fullImagesPath = path.resolve(imagesFilePath);

  // Filter the files in case the are a file that in not a .png
  const files = fs
    .readdirSync(fullImagesPath)
    .filter((file: any) => file.includes(".png"));

  let responses: any = [];
  console.log("Uploading to IPFS");

  for (const fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    try {
      await pinata
        .pinFileToIPFS(readableStreamForFile, options)
        .then((result: any) => {
          responses.push(result);
        })
        .catch((err: any) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata: any) {
  const options = {
    pinataMetadata: {
      name: metadata.name,
    },
  };
  try {
    const response = await pinata.pinJSONToIPFS(metadata, options);
    return response;
  } catch (error) {
    console.log(error);
  }
  return null;
}

export { storeImages, storeTokenUriMetadata };
