const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
  const { deployer } = await getNamedAccounts();
  const fundMe = await ethers.getContract("FundMe", deployer);
  let sendValue = ethers.utils.parseEther("1");
  console.log("Fundind...");
  const transactionResponse = await fundMe.fund({
    value: sendValue,
  });
  await transactionResponse.wait(1);
  console.log("Amount funded");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
