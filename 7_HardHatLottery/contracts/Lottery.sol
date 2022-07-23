/** Lottery
 *  Creare uno smart contract che dia la possibilità di:
 *    - Partecipare alla lotteria pagando una quota
 *    - Scegliere randomicamente un vincitore ogni tot di tempo in modo automatico
 *
 *  Tramite uno smart contract non è possibile scegliere un numero randomicamente in quanto
 *  la blockchain è un sistema deterministico, quindi dando la possibilità ad un nodo di
 *  ritornare un numero randomico esso dovrebbe ritornare lo stesso numero da ogni nodo su cui
 *  viene eseguito.
 *  Inoltre non è possibile eseguire uno smart contract in modo automatico, deve essere triggerato
 *  da una funzione esterna
 */

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";

error Lottery__NotEnough();
error Lottery__TransferFailed();

contract Lottery is VRFConsumerBaseV2 {
    /* State Variables  */
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint256 private immutable i_entranceFee;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    address payable[] private s_players;
    address private s_lastWinner;

    /* Events */
    event PartecipateToLottery(address indexed players);
    event RequestedLotteryWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    // Con VRFConsumerBaseV2(vrfCoordinator) chiamiamo il costruttore del contratto padre
    constructor(
        address vrfCoordinator,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_entranceFee = entranceFee;
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function partecipateToLottery() public payable {
        if (msg.value < i_entranceFee) revert Lottery__NotEnough();
        s_players.push(payable(msg.sender));
        emit PartecipateToLottery(msg.sender);
    }

    function requestRandomWinner() external {
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // The gas lane key hash value, which is the maximum gas price you are willing to pay for a request in wei
            i_subscriptionId, //  The subscription ID that this contract uses for funding requests.
            REQUEST_CONFIRMATIONS, //How many confirmations the Chainlink node should wait before responding
            i_callbackGasLimit, // The limit for how much gas to use for the callback request to your contract's fulfillRandomWords() function. It must be less than the maxGasLimit limit on the coordinator contract.
            NUM_WORDS // How many random values to request.
        );
        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        s_lastWinner = s_players[randomWords[0] % s_players.length];
        (bool success, ) = s_lastWinner.call{value: address(this).balance}("");
        if (!success) revert Lottery__TransferFailed();
        emit WinnerPicked(s_lastWinner);
    }

    /* View / Pure Function */
    function getEntranceFee() public view returns (uint256) {}

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
}
