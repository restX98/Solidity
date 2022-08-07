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
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

error Lottery__NotEnough();
error Lottery__TransferFailed();
error Lottery__Closed();
error Lottery__UpkeepNotNeeded(
    uint256 currentBalance,
    uint256 numPlayers,
    uint256 lotteryState
);

contract Lottery is VRFConsumerBaseV2, KeeperCompatible {
    /* Type declarations */
    enum LotteryState {
        OPEN, // = 0
        CALCULATING // = 1
    }

    /* State Variables  */
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint256 private immutable i_entranceFee;
    bytes32 private immutable i_gasLane;
    uint64 private immutable i_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint256 private immutable i_interval;
    address payable[] private s_players;
    address private s_lastWinner;
    LotteryState private s_lotteryState;
    uint256 private s_lastTimeStamp;

    /* Events */
    event ParticipateToLottery(address indexed players);
    event RequestedLotteryWinner(uint256 indexed requestId);
    event WinnerPicked(address indexed winner);

    // Con VRFConsumerBaseV2(vrfCoordinator) chiamiamo il costruttore del contratto padre
    constructor(
        address vrfCoordinator,
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinator) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinator);
        i_entranceFee = entranceFee;
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        i_interval = interval;
        s_lotteryState = LotteryState.OPEN; // Utiliziamo questa variabile di stato per bloccare l'inserimento
        // di nuovi partecipanti durante l'attesa del numero.
        s_lastTimeStamp = block.timestamp;
    }

    function participateToLottery() public payable {
        if (msg.value < i_entranceFee) revert Lottery__NotEnough();
        if (s_lotteryState != LotteryState.OPEN) revert Lottery__Closed();
        s_players.push(payable(msg.sender));
        emit ParticipateToLottery(msg.sender);
    }

    /**
     *  @dev Funzione chiamata dopo la requestRandomWords() per ottenere i numeri randomici generati
     */
    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        s_lastWinner = s_players[randomWords[0] % s_players.length];
        s_players = new address payable[](0);
        s_lotteryState = LotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = s_lastWinner.call{value: address(this).balance}("");
        if (!success) revert Lottery__TransferFailed();
        emit WinnerPicked(s_lastWinner);
    }

    /**
     * @dev Funzione chiamata dai nodi di Chainlink Keeper per sapere tramite l'attributo upkeepNeeded
     * se è il momento per chiamare la performUpkeep()
     * @dev La funzione è external ma la rendiamo public per poterla chiamare internamente ed essere
     * sicuri che la performUpkeep non venga chiamata in qualunque momento.
     */
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        bool isOpen = (LotteryState.OPEN == s_lotteryState);
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = (s_players.length > 0);
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
    }

    /**
     *  @dev Funzione chiamata tramite Chainlink Keepers
     */
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded)
            // Qualcosa non è andato perché di fatto la performUpkeep viene chiamata solo quanto
            // upkeepNeeded è true, quindi qualcuno ha runnato manualmente la funzione.
            revert Lottery__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_lotteryState)
            );
        s_lotteryState = LotteryState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane, // The gas lane key hash value, which is the maximum gas price you are willing to pay for a request in wei
            i_subscriptionId, //  The subscription ID that this contract uses for funding requests.
            REQUEST_CONFIRMATIONS, //How many confirmations the Chainlink node should wait before responding
            i_callbackGasLimit, // The limit for how much gas to use for the callback request to your contract's fulfillRandomWords() function. It must be less than the maxGasLimit limit on the coordinator contract.
            NUM_WORDS // How many random values to request.
        );
        emit RequestedLotteryWinner(requestId);
    }

    /* View / Pure Function */
    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getNumberOfPlayer() public view returns (uint256) {
        return s_players.length;
    }

    function getLastWinner() public view returns (address) {
        return s_lastWinner;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getLotteryState() public view returns (LotteryState) {
        return s_lotteryState;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getVRFCoordinator()
        public
        view
        returns (VRFCoordinatorV2Interface)
    {
        return i_vrfCoordinator;
    }

    function getGasLane() public view returns (bytes32) {
        return i_gasLane;
    }

    function getSubscriptionId() public view returns (uint64) {
        return i_subscriptionId;
    }

    /**
     * @dev Di fatto la funzione è pura in quanto non legge lo stato della blockchain ma legge
     * dal bytecode.
     */
    function getNumWords() public pure returns (uint64) {
        return NUM_WORDS;
    }

    function getRequestConfirmation() public pure returns (uint16) {
        return REQUEST_CONFIRMATIONS;
    }
}
