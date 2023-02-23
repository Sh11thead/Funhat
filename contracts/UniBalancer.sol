// SPDX-License-Identifier: GPL
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "./library/FullMath.sol";


interface IERC20 {
    function balanceOf(address) external view returns (uint);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

interface IUniswapV2Router {
    function factory() external pure returns (address);

    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);

    function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts);

    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
}

interface IUniswapV2Pair {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function swap(uint amount0Out, uint amount1Out, address to, bytes calldata data) external;

    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}


contract UniBalancer {

    function ROOT4146650865(address token0, address token1, address[] calldata routers) external {
        (address bossPair, bool[] memory aToB, uint[] memory amountIn) = computeHow(token0, token1, routers);
        bool rightPair = true;
        if (uint160(token0) < uint160(token1)) rightPair = false;

        for (uint i = 0; i < aToB.length; i ++) {
            if (amountIn[i] != 0) {
                if (aToB[i]) {
                    //aToB
                    if (rightPair) {
                        IUniswapV2Pair(bossPair).swap(
                            amountIn[i],
                            0,
                            address(this),
                            abi.encode(routers[i], token0, token1, amountIn[i])
                        );
                    } else {
                        IUniswapV2Pair(bossPair).swap(
                            0,
                            amountIn[i],
                            address(this),
                            abi.encode(routers[i], token0, token1, amountIn[i])
                        );
                    }

                } else if (!aToB[i]) {
                    //bToA
                    if (rightPair) {
                        IUniswapV2Pair(bossPair).swap(
                            0,
                            amountIn[i],
                            address(this),
                            abi.encode(routers[i], token1, token0, amountIn[i])
                        );
                    } else {
                        IUniswapV2Pair(bossPair).swap(
                            amountIn[i],
                            0,
                            address(this),
                            abi.encode(routers[i], token1, token0, amountIn[i])
                        );
                    }
                }
            }
        }
    }

    function uniswapV2Call(address _sender, uint256 _amount0, uint256 _amount1, bytes calldata _data) external {
        (address router, address token0, address token1, uint amount) = abi.decode(_data, (address, address, address, uint));
        address[] memory path = new address[](2);
        path[0] = token0;
        path[1] = token1;

        uint256 amountReceived = IUniswapV2Router(targetRouter).swapExactTokensForTokens(
            amountToken,
            amountRequired, // we already now what we need at least for payback; get less is a fail; slippage can be done via - ((amountRequired * 19) / 981) + 1,
            path,
            address(this), // its a foreign call; from router but we need contract address also equal to "_sender"
            block.timestamp + 60
        )[1];
    }

    function withdraw(address token) external {
        IERC20(token).transfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }

    function computeHow(
        address token0, address token1, address[] memory routers
    ) public view returns (address bossPair, bool[] memory aToB, uint[] memory amountIn){
        address[] memory pairs = new address[](routers.length);
        uint112 bossAmount0;
        uint112 bossAmount1;
        for (uint i = 0; i < routers.length; i++) {
            address fac = IUniswapV2Router(routers[i]).factory();
            pairs[i] = IUniswapV2Factory(fac).getPair(token0, token1);
            (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairs[i]).getReserves();
            if (reserve0 > bossAmount0) {
                bossAmount0 = reserve0;
                bossAmount1 = reserve1;
                bossPair = pairs[i];
            }
        }
        // we took 'boss' amount to make trades
        aToB = new bool[](routers.length);
        amountIn = new uint[](routers.length);

        for (uint i = 0; i < routers.length; i++) {
            (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairs[i]).getReserves();
            if (uint160(token0) < uint160(token1)) {
                (aToB[i], amountIn[i]) = computeUniV2ProfitMaximizingTrade(uint(bossAmount0), uint(bossAmount1), uint(reserve0), uint(reserve1));
            } else {
                (aToB[i], amountIn[i]) = computeUniV2ProfitMaximizingTrade(uint(bossAmount1), uint(bossAmount0), uint
                    (reserve1), uint(reserve0));
            }
        }
    }


    // computes the direction and magnitude of the profit-maximizing trade
    function computeUniV2ProfitMaximizingTrade(
        uint256 truePriceTokenA, uint256 truePriceTokenB, uint256 reserveA, uint256 reserveB
    ) private pure returns (bool aToB, uint256 amountIn) {
        aToB = FullMath.mulDiv(reserveA, truePriceTokenB, reserveB) < truePriceTokenA;

        uint256 invariant = reserveA * reserveB;

        uint256 leftSide = Math.sqrt(
            FullMath.mulDiv(
                invariant * 1000,
                aToB ? truePriceTokenA : truePriceTokenB,
                (aToB ? truePriceTokenB : truePriceTokenA) * 997
            )
        );
        uint256 rightSide = (aToB ? reserveA * (1000) : reserveB * (1000)) / 997;

        if (leftSide < rightSide) return (false, 0);

        // compute the amount that must be sent to move the price to the profit-maximizing price
        amountIn = leftSide - rightSide;
    }

}