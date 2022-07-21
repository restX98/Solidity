const RINKEBY = 4;
const POLYGON = 137;

const networkConfig = {
  [RINKEBY]: {
    name: "rinkeby",
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
  },
  [POLYGON]: {
    name: "polygon",
    ethUsdPriceFeed: "0xf9680d99d6c9589e2a93a78a04a279e509205945",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 20000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
