const { run } = require("hardhat");

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

module.exports = { verify };
