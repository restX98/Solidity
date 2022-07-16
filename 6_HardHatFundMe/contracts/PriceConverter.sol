// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    address constant ETH_USD = 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e;

    function getPrice(AggregatorV3Interface priceFeed)
        private
        view
        returns (uint256)
    {
        (, int price, , , ) = priceFeed.latestRoundData();

        return uint256(price * 1e10);
    }

    function getConversionRate(uint ethAmount, AggregatorV3Interface priceFeed)
        internal
        view
        returns (uint256)
    {
        return (getPrice(priceFeed) * ethAmount) / 1e18;
    }
}
