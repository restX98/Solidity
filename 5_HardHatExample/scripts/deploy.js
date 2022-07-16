const { ethers, run, network } = require("hardhat");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

async function main() {
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");

  console.log("Deploying contract...");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.deployed();

  console.log("Contract:", simpleStorage.address);

  // network contiene tutte le informazioni della rete a cui si è connessi
  if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
    await simpleStorage.deployTransaction.wait(6);
    await verify(simpleStorage.address, []);
  }
}

/**
 * E' possibile verificare programmaticamente il contratto appena deployato tramite
 * varie API servite dai vari scanner.
 * HardHat permette di installare dei plugin ed esiste quello di ether-scan
 * Il plugin ci permette di avere un nuovo task verify.
 * E' possibile lanciare un task tramite la funzione run(task).
 */
async function verify(contractAddress, args) {
  try {
    console.log("Verifying Contract...");
    let result = await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log(result);
  } catch (ex) {
    if (ex.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.error(ex);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
