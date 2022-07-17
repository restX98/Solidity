// Layout Order
// 1. Pragma statements
// 2. Import statements
// 3. Interfaces
// 4. Libraries
// 5. Contracts

// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    // Contract Order
    // 1. Type declarations
    // 2. State variables
    // 3. Events
    // 4. Modifiers
    // 5. Functions
    using PriceConverter for uint256;

    uint constant MIN_USD = 50 * 1e18;

    address[] public founders;
    mapping(address => uint256) public addressToAmountFounded;

    address public immutable i_owner;
    AggregatorV3Interface public immutable priceFeed;

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
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= MIN_USD,
            "Not enougth"
        );
        founders.push(msg.sender);
        addressToAmountFounded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint i = 0; i < founders.length; i++) {
            addressToAmountFounded[founders[i]] = 0;
        }
        founders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call Failed!");
    }
}
