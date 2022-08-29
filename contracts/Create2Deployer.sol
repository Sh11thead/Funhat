// SPDX-License-Identifier: MIT
// Further information: https://eips.ethereum.org/EIPS/eip-1014

pragma solidity ^0.8.3;

import "@openzeppelin/contracts/utils/Create2.sol";


contract Create2Deployer {

    function deploy(
        uint256 value,
        bytes32 salt,
        bytes memory code
    ) public payable {
        Create2.deploy(value, salt, code);
    }

    function computeAddress(bytes32 salt, bytes32 codeHash) public view returns (address) {
        return Create2.computeAddress(salt, codeHash);
    }

}