import { assert, expect } from "chai";
import { describe, it } from "mocha";
import { developmentChains } from "../../helper-hardhat-config";
import { ethers, getNamedAccounts, network } from "hardhat";

developmentChains.includes(network.name)
  ? describe("BasicNFT Unit Tests", () => {
      let lottery, accounts: any;
      beforeEach(async () => {
        const { deployer } = await getNamedAccounts();
        lottery = await ethers.getContractAt("BasicNFT", deployer);
        console.log(lottery);
      });
      it("hai", () => {
        assert.equal(1, 1);
      });
    })
  : describe.skip;
