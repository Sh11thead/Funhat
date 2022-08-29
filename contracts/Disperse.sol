// SPDX-License-Identifier: GPL

pragma solidity ^0.8.3;

interface IERC1155 {
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes calldata data) external;
}

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);

    function transferFrom(address from, address to, uint256 value) external returns (bool);

    function balanceOf(address account) external view returns (uint);
}

contract Disperse {
    function disperseNativeToken(address[] calldata recipients, uint[] calldata values) external payable {
        for (uint i = 0; i < recipients.length; i++) {
            payable(recipients[i]).transfer(values[i]);
        }

        uint balance = address(this).balance;
        if (balance > 0) {
            payable(msg.sender).transfer(balance);
        }
    }

    function disperseToken(IERC20 token, address[] calldata recipients, uint[] calldata values) external {
        uint total = 0;
        for (uint i = 0; i < recipients.length; i++) {
            total += values[i];
        }

        require(token.transferFrom(msg.sender, address(this), total));

        for (uint i = 0; i < recipients.length; i++) {
            require(token.transfer(recipients[i], values[i]));
        }
    }

    function disperseERC1155Token(
        IERC1155 token, address[] calldata recipients, uint256[] calldata tokenIds,
        uint256[] calldata amounts
    ) public {
        require(recipients.length == tokenIds.length &&
            tokenIds.length == amounts.length, "invalid parameters");
        for (uint i = 0; i < recipients.length; i++) {
            token.safeTransferFrom(msg.sender, recipients[i], tokenIds[i], amounts[i], '');
        }
    }

    function getAddressBalances(address target, address[] calldata tokens) public view returns (uint[] memory) {
        uint[] memory balances = new uint[](tokens.length);

        for (uint i = 0; i < tokens.length; i++) {
            balances[i] = tokens[i] == address(0) ? target.balance : IERC20(tokens[i]).balanceOf(target);
        }

        return balances;
    }

    function getTokenBalances(address token, address[] calldata targets) public view returns (uint[] memory) {
        uint[] memory balances = new uint[](targets.length);

        for (uint i = 0; i < targets.length; i++) {
            balances[i] = token == address(0) ? targets[i].balance : IERC20(token).balanceOf(targets[i]);
        }

        return balances;
    }

    struct BalancesForAddr {
        uint[] balances;
    }

    function getAddrsBalancesForTokens(
        address[] calldata targets, address[] calldata tokens
    ) public view returns (BalancesForAddr[] memory tokensBalances) {
        tokensBalances = new BalancesForAddr[](targets.length);
        for (uint i = 0; i < targets.length; i++) {
            tokensBalances[i] = BalancesForAddr(getAddressBalances(targets[i], tokens));
        }
    }
}