const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");

describe("FundMe", async function () {
  let fundMe, deployer, mockV3Aggregator;
  let sendValue = ethers.utils.parseEther("1"); // 1000000000000000000 WEI = 1 ETH

  beforeEach(async function () {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]); // execute deployment as fixture for test
    fundMe = await ethers.getContract("FundMe", deployer); // Get the last contract deployed with that name
    mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("constructor", async function () {
    it("Sets the aggregator addresses correctly", async function () {
      const response = await fundMe.priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });

  describe("fund", async function () {
    it("Fails if you don't send enough ETH", async function () {
      // await fundMe.fund(); // Questa riga andrà in errore perché questa
      // funzione richiede una quantità minima di eth da mandare
      // Il nostro test sarà proprio questo e dobbiamo verificare che la
      // funzione fund sia stata revertata
      await expect(fundMe.fund()).to.be.revertedWith("Not enougth");
    });

    it("Update the amount of data structure", async function () {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.addressToAmountFounded(deployer);
      assert.equal(response.toString(), sendValue);
    });

    it("Adds funder to array of funders", async function () {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.funders(0);
      assert.equal(funder, deployer);
    });
  });

  describe("withdraw", async function () {
    beforeEach(async function () {
      // Per prelevare bisogna prima aggiungere i fondi allo Smart Contract
      await fundMe.fund({ value: sendValue });
    });

    it("Withdraw ETH from a single founder", async function () {
      // Arrange: Conserviamo i dati iniziali prima dell'esecuzione della funzione withdraw
      const startingFundMeBalance = await fundMe.provider.getBalance(
        // Potremmo utilizzare anche ethers.provider.getBalance
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );
      // Act: Runniamo la funzione withdraw dello Smart Contract
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);

      // gasUsed: Quantità di gas utilizzata
      // effectiveGasPrice: Prezzo per unità di gas
      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      // Assert: Verifichiamo i valori
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingDeployerBalance.add(startingFundMeBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
        // Aggiungiamo il costo del gas speso al bilancio finale del deployer,
        // potremmo anche sottrarlo all bilancio iniziale più il bilancio dello Smart Contract
      );
    });

    it("Withdraw ETH from multiple founder", async function () {
      // Arrange
      const accounts = await ethers.getSigners();
      // Partiamo dal secondo elemento, il primo è il deployer
      for (let i = 1; i < 6; i++) {
        // L'istanza fundMe è so il contratto ma è connesso all'account deployer
        // per eseguire fund() da un'altro indirizzo dobbiamo connetterci ad esso.
        let fundMeConnected = await fundMe.connect(accounts[i]);
        await fundMeConnected.fund({ value: sendValue });
      }
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployer
      );

      // Act
      const transactionResponse = await fundMe.withdraw();
      const transactionReceipt = await transactionResponse.wait(1);

      const { gasUsed, effectiveGasPrice } = transactionReceipt;
      gasCost = gasUsed.mul(effectiveGasPrice);
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(deployer);

      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingDeployerBalance.add(startingFundMeBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      // Controlliamo se l'arrei di funders è stato resettato.
      // Per farlo verifichiamo se viene sollevata un'eccezione.
      await expect(fundMe.funders(0)).to.reverted;
      for (i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.addressToAmountFounded(accounts[i].address),
          0
        );
      }
    });

    it("Only allows owner to withdraw", async function () {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner"); // Non funziona altrimenti!
      attacker.sendTransaction;
    });
  });

  describe("receive", async function () {
    let owner;
    beforeEach(async function () {
      owner = (await ethers.getSigners(0))[0];
    });
    it("receive:Fails if you don't send enough ETH", async function () {
      await expect(
        owner.sendTransaction({ to: fundMe.address })
      ).to.be.revertedWith("Not enougth");
    });

    it("receive:Update the amount of data structure", async function () {
      await owner.sendTransaction({
        to: fundMe.address,
        value: sendValue,
      });
      const response = await fundMe.addressToAmountFounded(owner.address);
      assert.equal(response.toString(), sendValue);
    });

    it("receive:Adds funder to array of funders", async function () {
      await owner.sendTransaction({
        to: fundMe.address,
        value: sendValue,
      });
      const funder = await fundMe.funders(0);
      assert.equal(funder, owner.address);
    });
  });
  // Come si testa la fallback?
});
