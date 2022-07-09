// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {

    address constant ETH_USD = 0x8A753747A1Fa494EC906cE90E9f37563A8AF630e;

    // Funzione per ottenere il prezzo di ETH tramite i Data Feed di chainlink
    function getPrice() public view returns(uint256){
        // Per utilizzare lo smart contract messo a disposizione da chainlink ho bisogno di:
        // ABI lo otteniamo tramite l'import, si tratta di una sorta di import da github o npm (Da capire come funziona)
        // Address lo troviamo nella documentazione di chainlink (https://docs.chain.link/docs/ethereum-addresses/)
        AggregatorV3Interface priceFeed = AggregatorV3Interface(ETH_USD);
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        
        return uint256(price * 1e10); // Type-casting
    }

    function getConversionRate(uint ethAmount) public view returns(uint256){
        return (getPrice() * ethAmount) / 1e18;
        // In soliditi conviene sempre lavorare con numeri interi per evitare problemi di perdita di informazioni e arrotondamenti strani
    }

    function getVersion() public view returns(uint256){
        AggregatorV3Interface priceFeed = AggregatorV3Interface(ETH_USD);
        return priceFeed.version();
    }
}
