// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract FallbackExample {
    uint public result; // defualt = 0;

    /*
     * receive e fallback sono due funzioni speciali come constructor che
     * vengono triggerate quando qualcuno prova ad interagire con lo smart
     * contract direttamente senza passare dalla funzioni messe a disposizione
     */

    receive() external payable {
        result = 1;
    }

    fallback() external payable {
        result = 2;
    }
}

// Which function is called, fallback() or receive()?
//
//                  send Ether
//                      |
//              msg.data is empty?
//                 /         \
//               yes          no
//               /             \
//     receive() exists?    fallback()
//           /     \
//          yes     no
//          /        \
//    receive()     fallback()
