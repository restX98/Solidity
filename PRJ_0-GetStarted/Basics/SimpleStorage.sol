// SPDX-License-Identifier: MIT
pragma solidity 0.8.7; // Versione Specifica
// pragma solidity ^0.8.7; // Dalla 0.8.7 in su fino alla 0.9.0
// pragma solidity >=0.8.7 <0.9.0 ; // Analogo a ^0.8.7



contract SimpleStorage {
    // Tipi base:
    // bool hasValue = true;
    // uint unsignedValue = 10; // default uint256
    // uint8 unsigned8BitValue = 255; // uint 8 bit
    // int negativeValue = -10;
    // string strValue = "Ten";
    // address myAddress = 0xc59Ba755b0dA80361dD5B3aBd7f6591255db87Da;
    // bytes3 bytesValue = "Ten"; // default bytes32

    // default internal
    uint256 public myNumber; // Se non inizializzato vale 0

    function store(uint256 _myNumber) public {
        myNumber = _myNumber;
    }

    function retrive() public view returns(uint256){
        return myNumber;
    }

    // Le funzioni pure servono ad assicurarsi che non leggano o modificano
    // lo stato.
    function pureFunction() public pure returns(uint256){
        // return myNumber; // Error
        return (1 + 2);
    }

    /* Le funzioni view e pure non consumano gas a meno che non vengano
     * chiamate da un'altra funzione non view o pure del contratto
     */

    // Strutture, Array e Mapping
    People person = People({name: "Enrico", number: 7}); // Ordine non necessario
    People otherPerson = People(7, "Enrico");  // Meno prolisso ma in ordine

    struct People {
        uint256 number;
        string name;
    }
    
    People[] public people; // Array dinamico
    //People[3] public people; // Array statico

    mapping(string => uint256) public nameToNumber;

    function addPerson(string memory /*calldata*/ _name, uint256 _number) public {
        // _name = "Prova" // Se calldata allora Error
        people.push(People({name: _name, number: _number}));
        nameToNumber[_name] = _number;
    }

    /* Ci sono 6 livelli di accesso e storage delle informazioni, le 3 principali sono:
     * memory, calldata e storage.
     * Le variabili memory esistono solo all'interno della funzione.
     * Le variabili calldata esistono solo all'interno della funzione e non sono modificabili.
     * Le variabili storage esistono al di fuori delle funzioni e sono quelle che contengono
     * lo stato.
     * E' necessario specificare la Data Location (memory o calldata) per Array, Struct e Map.
     * Anche per le stringhe perché sono array di bytes.
     */
}
