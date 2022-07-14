// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

contract SimpleStorage {
    uint256 public myNumber;

    function store(uint256 _myNumber) public {
        myNumber = _myNumber;
    }

    function retrieve() public view returns(uint256){
        return myNumber;
    }
    function pureFunction() public pure returns(uint256){
        return (1 + 2);
    }

    People person = People({name: "Enrico", number: 7}); // Ordine non necessario
    People otherPerson = People(7, "Enrico");  // Meno prolisso ma in ordine

    struct People {
        uint256 number;
        string name;
    }
    
    People[] public people;

    mapping(string => uint256) public nameToNumber;

    function addPerson(string memory /*calldata*/ _name, uint256 _number) public {
        people.push(People({name: _name, number: _number}));
        nameToNumber[_name] = _number;
    }
}
