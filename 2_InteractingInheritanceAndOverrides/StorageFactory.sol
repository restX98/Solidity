// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "./SimpleStorage.sol";

contract StorageFactory {
    SimpleStorage[] public simpleStorageArray;

    // address[] public simpleStorageAddressArray;

    function createSimpleStorageContract() public {
        // new permette di creare e deployare  un nuovo contratto.
        simpleStorageArray.push(new SimpleStorage());
    }

    function sfStore(uint256 _simpleStorageIndex, uint256 _simpleStorageNumber)
        public
    {
        SimpleStorage simpleStorage = simpleStorageArray[_simpleStorageIndex];
        simpleStorage.store(_simpleStorageNumber);
        // Dato che l'array è di SimpleStorage posso ottenere direttamente l'istanza dall'indice.
        // Se avessi avuto un array di address avrei potuto ottenere l'istanza così:
        // SimpleStorage simpleStorage = SimpleStorage(simpleStorageAddressArray[_simpleStorageIndex]);
    }

    function sfGet(uint256 _simpleStorageIndex) public view returns (uint256) {
        return simpleStorageArray[_simpleStorageIndex].retrieve();
    }
}
