//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.3;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";

contract SampleToken is ERC20Upgradeable {
    constructor () payable{
        
    }

    function initialize(address whom) public initializer {
        __ERC20_init("8888", "8888");
        _mint(whom, 21_000_000e18);
    }
}
