const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

if (!developmentChains.includes(network.name)) return;

describe("Lottery Unit Tests", function () {
  let lottery, VRFCoordinatorV2Mock, entranceFee, deployer, interval;

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    lottery = await ethers.getContract("Lottery", deployer);
    VRFCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock",
      deployer
    );
    entranceFee = await lottery.getEntranceFee();
    interval = await lottery.getInterval();
  });

  describe("constructor", function () {
    it("Init the Lottery correctly", async function () {
      const lotteryState = await lottery.getLotteryState();
      const interval = await lottery.getInterval();
      assert.equal(lotteryState.toString(), "0");
      assert.equal(
        interval.toString(),
        networkConfig[network.config.chainId].interval
      );
    });
  });

  describe("participateToLottery", function () {
    it("Revert if not sent enough", async function () {
      await expect(lottery.participateToLottery()).to.be.revertedWith(
        "Lottery__NotEnough()"
      );
    });

    it("Players recorded when they participate to lottery", async function () {
      await lottery.participateToLottery({ value: entranceFee });
      const playerFromContract = await lottery.getPlayer(0);
      assert.equal(deployer, playerFromContract);
    });

    it("Dont allow to participate when lottery is closed", async function () {
      await lottery.participateToLottery({ value: entranceFee });
    });

    it("Emit event on participate", async function () {
      await expect(
        lottery.participateToLottery({ value: entranceFee })
      ).to.be.emit(lottery, "ParticipateToLottery");
    });

    it("Doesnt allow participate when lottery is calculating", async function () {
      await lottery.participateToLottery({ value: entranceFee });
      /**
       * Esistono metodi implementati dalle blockchain JSON-RPC con cui è possibile interagire
       * inviando una transaction con come ed eventuali parametri. In reti locali come hardhat
       * o ganache è possibile "viaggiare nel tempo" e minare blocchi a nostro piacimento.
       */
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 1,
      ]);
      // await network.provider.request({
      //   method: "evm_increaseTime",
      //   params: [interval.toNumber() + 1],
      // });
      /**
       * Il metodo checkUpkeep() controlla il tempo trascorso tramite block.timestamp e se la EVM
       *  conriene solo un blocco il valore del timestamp sarà esattamente quello iniziale. Quindi
       *  sarà necessario minare un nuovo blocco per aggiornare il tempo passato.
       */
      // await network.provider.send("evm_mine", []);
      // await network.provider.request({ method: "evm_mine", params: [] });
      await lottery.performUpkeep([]);
      await expect(
        lottery.participateToLottery({ value: entranceFee })
      ).to.be.revertedWith("Lottery__Closed()");
    });
  });

  describe("checkUpkeep", function () {
    it("Return false if there are not participants and no balance", async function () {
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 10,
      ]);
      await network.provider.send("evm_mine", []);
      const { upkeepNeeded } = await lottery.checkUpkeep([]);
      assert(!upkeepNeeded);
    });

    it("Return false if time is not passed", async function () {
      await lottery.participateToLottery({ value: entranceFee });
      const { upkeepNeeded } = await lottery.checkUpkeep([]);
      assert(!upkeepNeeded);
    });

    it("Return false if the lottery is closed", async function () {
      await lottery.participateToLottery({ value: entranceFee });
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 10,
      ]);
      await network.provider.send("evm_mine", []);
      await lottery.performUpkeep([]);
      const { upkeepNeeded } = await lottery.checkUpkeep([]);
      assert(!upkeepNeeded);
    });

    it("Return true if need to be updated", async function () {
      await lottery.participateToLottery({ value: entranceFee });
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 10,
      ]);
      await network.provider.send("evm_mine", []);
      const { upkeepNeeded } = await lottery.checkUpkeep([]);
      assert(upkeepNeeded);
    });
  });

  describe("performUpkeep", function () {
    it("Run only if checkUpkeep is true", async function () {
      await lottery.participateToLottery({ value: entranceFee });
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 10,
      ]);
      await network.provider.send("evm_mine", []);
      const tx = await lottery.performUpkeep([]);
      assert(tx);
    });

    it("Revert if checkUpkeep is false", async function () {
      await expect(lottery.performUpkeep([])).to.be.revertedWith(
        "Lottery__UpkeepNotNeeded(0, 0, 0)"
      );
    });

    it("Update Lottery State and get the request ID", async function () {
      await lottery.participateToLottery({ value: entranceFee });
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 10,
      ]);
      await network.provider.send("evm_mine", []);
      const txResponse = await lottery.performUpkeep([]);
      const txReceipt = await txResponse.wait(1);
      const requestId = txReceipt.events[1].args[0];
      const lotteryState = await lottery.getLotteryState();
      console.log(requestId.toString());
      assert(requestId.toNumber() > 0);
      assert(lotteryState.toString(), "1");
    });
  });

  describe("fulfillRandomWords", function () {
    beforeEach(async () => {
      await lottery.participateToLottery({ value: entranceFee });
      await network.provider.send("evm_increaseTime", [
        interval.toNumber() + 1,
      ]);
      await network.provider.request({ method: "evm_mine", params: [] });
    });

    it("Can only be called after performupkeep", async () => {
      await expect(
        // Chiamiamo la fulfillRandomWords del VRF Coordinator perché di fatto non siamo
        // Noi a chiamare quella della Lottery la verrà chiamata da ChainLink
        VRFCoordinatorV2Mock.fulfillRandomWords(0, lottery.address) // reverts if not fulfilled
      ).to.be.revertedWith("nonexistent request");
    });

    it("Picks a winner, resets, and sends money", async () => {
      const startingAccountsIndex = 1;
      const numberOfParticipant = 3;
      const accounts = await ethers.getSigners();
      const playerStartingBalances = [await accounts[0].getBalance()];
      for (
        let i = startingAccountsIndex;
        i < startingAccountsIndex + numberOfParticipant;
        i++
      ) {
        const lotteryConnected = await lottery.connect(accounts[i]);
        await lotteryConnected.participateToLottery({ value: entranceFee });
        playerStartingBalances.push(await accounts[i].getBalance());
      }
      const startingTimeStamp = await lottery.getLastTimeStamp();

      await new Promise(async (resolve, reject) => {
        lottery.once("WinnerPicked", async () => {
          console.log("WinnerPicked event fired!");

          try {
            const recentWinner = await lottery.getLastWinner();
            const lotteryState = await lottery.getLotteryState();
            const endingTimeStamp = await lottery.getLastTimeStamp();

            let winnerId;
            accounts.forEach((el, id) => {
              if (el.address === recentWinner) {
                winnerId = id;
                return false;
              }
            });
            const winnerBalance = await accounts[winnerId].getBalance();
            await expect(lottery.getPlayer(0)).to.be.reverted;
            assert.equal(lotteryState, "0");

            assert.equal(
              winnerBalance.toString(),
              playerStartingBalances[winnerId]
                .add(entranceFee.mul(numberOfParticipant + 1))
                .toString()
            );
            assert(endingTimeStamp > startingTimeStamp);
            resolve();
          } catch (ex) {
            reject(ex);
          }
        });

        const txResponse = await lottery.performUpkeep([]);
        const txReceipt = await txResponse.wait(1);
        const requestId = txReceipt.events[1].args[0];
        await VRFCoordinatorV2Mock.fulfillRandomWords(
          requestId,
          lottery.address
        );
      });
    });
  });
});
