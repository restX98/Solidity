// Per utilizzare questa feature bisogna sostituire hardhat-ethers con hardhat-deploy-ethers

const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

// function deployFunc(hre) {
//   console.log("Hello World");
// }

// module.exports.default = deployFunc;

// module.exports = async (hre) => {
//   const { getNamedAccounts, deployments } = hre;
//   // const getNamedAccounts = hre.getNamedAccounts;
//   // const deployments = hre.deployments;
// };

// In JS esiste la Syntactic Sugar che ci permette di specificare in delle cariabili
// le parti dell'oggetto che ci interessano

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  /**
   * E' stato modificato lo smart contract per poter prendere come parametro dinamicamente
   * l'indirizzo del corretto smart contract da utilizzare in base alla rete su cui si sta
   * effettuando il rilascio.
   * Per effettuare un test su un nodo locale è necessario mockare la risposta dello smart
   * contract in quanto non esiste su una rete locale appena creata e per farlo è necessario
   * deployare una versione minimale dello smart contract che vogliamo utilizzare (00-deploy-mocks.js)
   */

  // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUdsAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUdsAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  log("Deploying Fund Me Contract...");

  log(ethUsdPriceFeedAddress);
  const args = [ethUsdPriceFeedAddress];
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmation: network.config.blockConfirmation || 1,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args);
  }

  log("---------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
