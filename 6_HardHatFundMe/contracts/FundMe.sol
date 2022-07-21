// Layout Order
// 1. Pragma statements
// 2. Import statements
// 3. Interfaces
// 4. Libraries
// 5. Contracts

// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./PriceConverter.sol";
import "hardhat/console.sol";

error FundMe__NotOwner();
error FundMe__NotEnough();
error FundMe__CallFailed();

contract FundMe {
    // Contract Order
    // 1. Type declarations
    // 2. State variables
    // 3. Events
    // 4. Modifiers
    // 5. Functions

    using PriceConverter for uint256;

    /**
     *  Esiste una convenzione per la nomenclatura delle variabili per scindere tra:
     *  - storage:      s_var
     *  - immutable:    i_var
     *  - constant:     CONSTANT
     */

    AggregatorV3Interface private immutable i_priceFeed;
    uint public constant MIN_USD = 50 * 1e18;
    address private immutable i_owner;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFounded;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Function Order:
    //// 1. constructor
    //// 2. receive
    //// 3. fallback
    //// 4. external
    //// 5. public
    //// 6. internal
    //// 7. private
    //// 8. view / pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        if (msg.value.getConversionRate(i_priceFeed) < MIN_USD)
            revert FundMe__NotEnough();
        s_funders.push(msg.sender);
        s_addressToAmountFounded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        console.log(
            "E' possibile scrivere i console log direttamente negli smart contract",
            "Poi saranno visibili lanciando yarn hardhat test"
        );
        for (uint i = 0; i < s_funders.length; i++) {
            s_addressToAmountFounded[s_funders[i]] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) revert FundMe__CallFailed();
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (uint i = 0; i < funders.length; i++) {
            s_addressToAmountFounded[funders[i]] = 0;
        }
        s_funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) revert FundMe__CallFailed();
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFounded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFounded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }
}

/** Storage
 *  La sezione di memoria storage in solidy è rappresentabile come un array di bytes32
 *  chiamati slot. L'ordine è quello di istanziazione e vengono chiamate variabili di stato.
 *  Gli array e le mappe gli elementi vengono conservati usando funzioni di hashing
 *  sulla posizione all'interno dello storage (Es. dato un array conservato all'indice 2,
 *  la posizione dei suoi dati sarà all'indice kekkak256(2)) essendo di grandezza variabile.
 *  Tuttavia viene comunque utilizzato uno slot per conservare la lunghezza nel caso di array
 *  o uno slot vuoto nel caso di una mappa.
 *
 *  Le variabili constant e immutable fanno parte del BYTECODE stesso e per questo non consumano
 *  eccessivamente gas.
 *
 *  Tutte le variabili dichiarate all'interno di una funzione non vengono memorizzate nello
 *  storage ma vengono aggiunti al memory data structure dello scope.
 *  Quanto utiliziamo un array/stringa(array di byte32) o viene passato come parametro ad una funzione
 *  è necessario specificare a solidity se si tratta di una variabile storage o memory (o calldata)
 *  i mapping non possono stare nella memory;
 */
