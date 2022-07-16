require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */

/**
 * Di default hardhat crea una rete locale(coome ganache), ma è possibile definire altre reti ed
 * utilizzarli tramite il parametro "--network rinkeby":
 * yarn|npx hardhat run scripts/deploy.js --network rinkeby
 */

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/**
 * Verify Contract:
 * npx|yarn hardhat verify --network NETWORK DEPLOYED_CONTRACT_ADDRESS "Constructor argument 1"
 */

module.exports = {
  defaultNetwork: "hardhat", // Optional
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
    },
  },
  solidity: "0.8.7",
  etherscan: {
    //Per installare un plugin bisogna aggiungerlo nell'oggetto di configurazione
    apiKey: {
      rinkeby: ETHERSCAN_API_KEY,
    },
  },
};
