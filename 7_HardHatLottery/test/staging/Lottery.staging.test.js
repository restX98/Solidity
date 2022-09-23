const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

if (developmentChains.includes(network.name)) return;

describe("Lottery Unit Tests", function () {
  let lottery, entranceFee, deployer;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    lottery = await ethers.getContract("Lottery", deployer);
    entranceFee = await lottery.getEntranceFee();
  });

  describe("fulfillRandomWords", function () {
    it("Works with live Chainlink keepers and VRF and get random winner", async function () {
      const startingTimeStamp = await lottery.getLastTimeStamp();
      const accounts = await ethers.getSigners();

      await new Promise(async (resolve, reject) => {
        lottery.once("WinnerPicked", async () => {
          console.log("Winner Picked!");
          try {
            const lastWinner = await lottery.getLastWinner();
            const lotteryState = await lottery.getLotteryState();
            const winnerEndingBalance = await accounts[0].getBalance();
            const endingTimeStamp = await lottery.getLastTimeStamp();

            await expect(lottery.getPlayer(0)).to.be.reverted;
            assert.equal(lastWinner.toString(), accounts[0].address);
            assert.equal(lotteryState, "0");
            assert.equal(
              winnerEndingBalance.toString(),
              winnerStartingBalance.add(entranceFee).toString()
            );
            assert(endingTimeStamp > startingTimeStamp);
            resolve();
          } catch (ex) {
            reject(ex);
          }
        });
        await lottery.participateToLottery({ value: entranceFee });
        await tx.wait(1);
        const winnerStartingBalance = await accounts[0].getBalance();
      });
    });
  });
});
