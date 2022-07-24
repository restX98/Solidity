const { ethers } = require("hardhat");

const RINKEBY = 4;
const POLYGON = 137;
const HARDHAT = 31337;

const networkConfig = {
  [RINKEBY]: {
    name: "rinkeby",
    vrfCoordinator: "	0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    entranceFee: ethers.utils.parseEther("0.1").toString(),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subscriptionId: "9047",
    callbackGasLimit: "500000",
    interval: "30",
  },
  [HARDHAT]: {
    name: "hardhat",
    entranceFee: ethers.utils.parseEther("0.1").toString(),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    // ne devo mettere uno a caso se no va in errore
    subscriptionId: "9047",
    callbackGasLimit: "500000",
    interval: "3060",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
