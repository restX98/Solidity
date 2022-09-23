const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  console.log(deployer);
  const eventsExample = await ethers.getContract("EventsExample", deployer);

  console.log("Storing number...");
  const transactionResponse = await eventsExample.store("40");
  await transactionResponse.wait(1);
  console.log("Number stored");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
