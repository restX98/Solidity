/**
 *   In solidity è possibile emettere degli eventi che vengono loggati su blockchain edmè possibile
 *   bindare questi eventi.
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventsExample {
    uint256 private s_myNumber;

    // gli attributi indexed sono più facili da ricercare, vengono storati in ordine.
    event storeNumber(
        uint256 indexed oldNumber,
        uint256 indexed newNumber,
        uint256 addedNumber,
        address sender
    );

    function store(uint256 myNumber) public {
        emit storeNumber(
            s_myNumber,
            myNumber,
            s_myNumber + myNumber,
            msg.sender
        );
        s_myNumber = myNumber;
    }

    function getNumber() public view returns (uint256) {
        return s_myNumber;
    }
}
