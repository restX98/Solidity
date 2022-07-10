/* Si vuole creare uno Smart Contract in grado di:
 *  - ricevere dei fondi dagli utenti
 *  - Prelevare i fonti
 *  - importare un valore minimo della donazione
 */

// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    /* Funziona solo con le funzioni che ricevono un marametro.
     * msg.value.getVersion(); // Error
     * In caso di parametri multipli vengono inseriti nella chiamata a partire dal secondo
     * msg.value.someFunction(secondParam, thirdParam);
     */
    using PriceConverter for uint256;

    uint constant MIN_USD = 50 * 1e18;

    address[] public founders;
    mapping(address => uint256) public addressToAmountFounded;

    address public immutable i_owner; // Rende immutabile il valore dopo la prima assegnazione

    // immutable e costant rendono più efficiente la lettura dei valori delle variabili e ciò
    // permette di minimizzare il gas da utilizzare

    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        // require controlla se la condizione è verificata e fa procedere il flusso,
        // altrimenti lancia un errore ed esegue un revert (ritorna il gas non utilizzato).
        require(msg.value.getConversionRate() >= MIN_USD, "Not enougth");
        // msg è una variabile speciale
        // msg.value (uint): number of wei sent with the message
        // msg.sender (address): sender of the message (current call)
        founders.push(msg.sender);
        addressToAmountFounded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // Resetto la mappa e l'array di sostenitori
        for (uint i = 0; i < founders.length; i++) {
            addressToAmountFounded[founders[i]] = 0;
        }
        founders = new address[](0);

        // Esistono 3 modi per prelevare da uno smart contract:
        // payable è un tipo particolare di address
        // address payable myAddress = payable(msg.sender); // payable aggiunge delle funzionalità al tipo address
        // myAddress.transfer(address(this).balance); // 2300 gas, throws error

        // require(payable(msg.sender).send(address(this).balance), "Call Failed!"); //  2300 gas, returns bool

        // Methodo consigliato
        (
            bool callSuccess, /* lowerLevelFunctionReturns */

        ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call Failed!");
    }

    modifier onlyOwner() {
        // _; // Se messo prima lo fa prima, e si può mettere anche più volte?
        // require(msg.sender == i_owner, "Not Alowed!");
        if (msg.sender != i_owner) revert NotOwner(); // revert spende meno gas di require
        _; // Fa il resto del codice
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
