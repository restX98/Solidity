const { task } = require("hardhat/config");

// E' possibile definire dei custom task
task("block-number", "Prints the current block number").setAction(
  // il parametro hre (Hardhat Runtime Environment) è lo stesso che richiamiamo negli script
  // tramite require("hardhat"), ma in quel caso esportiamo lo specifico oggetto { ethers }
  async (taskArgs, hre) => {
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("The current block number is:", blockNumber);
  }
);
