const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  // E' il premium cost in LINK per ottenere il numero randomico. Quando richiediamo un pricefeed
  // non dobbiamo pagarlo perché la transazione viene pagata da degli sponsor di chainlink.
  const BASE_FEE = ethers.utils.parseEther("0.25");
  const GAS_PRICE_LINK = 1e9; // Nel vero contratto viene calcolato in base al prezzo del gas della chain.

  /**
   * @dev E' chainlink ad eseguire chiamate sulla blockchain, quindi è chainlink a pagare le fee.
   * Pagherà le fee tramite i fondi (in LINK) inviati alla Subscription, analogo per keeper.
   * Il costo della transazione verrà calcolato come:
   * (Gas price * (Verification gas + Callback gas)) = total gas cost [ETH]
   * Il total gas cost verrà convertito in LINK e al totale si andrà ad aggiungere il premium cost:
   * (total gas cost [LINK] + LINK premium) = total request cost [LINK]
   */

  if (developmentChains.includes(network.name)) {
    log("Local netword detected! Deploying VRFCoordinatorV2Mock...");
    const args = [BASE_FEE, GAS_PRICE_LINK];
    await deploy("VRFCoordinatorV2Mock", {
      contract: "VRFCoordinatorV2Mock",
      from: deployer,
      args: args,
      log: true,
    });
    log("VRFCoordinatorV2Mock deployed!");
    log("---------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
