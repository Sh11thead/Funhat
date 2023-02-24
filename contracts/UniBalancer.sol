// SPDX-License-Identifier: GPL
pragma solidity ^0.8.0;

import "./library/UniHelper.sol";


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

    struct Advise {
        address deepPair;
        address swapPair;
        bool loanFrom0;
        uint loanAmount;
        uint exceptOut;
        uint returnOut;
    }

    // swap any pairs to target price
    function ROOT4146650864(address token0, address token1, address[] calldata factories, uint tureToken0Amount, uint tureToken1Amount) external {
        require(uint160(token0) < uint160(token1), 'CM');

        for (uint i = 0; i < factories.length; i ++) {
            address pair = IUniswapV2Factory(factories[i]).getPair(token0, token1);
            (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pair).getReserves();
            (bool _0To1, uint256 amountIn) = UniHelper.computeUniV2ProfitMaximizingTrade(tureToken0Amount,
                tureToken1Amount, uint(reserve0), uint(reserve1));
            if (amountIn == 0) continue;
            if (_0To1) {
                uint amountOut = UniHelper.calSwap(reserve0, reserve1, amountIn);
                IERC20(token0).transfer(pair, amountIn);
                IUniswapV2Pair(pair).swap(0, amountOut, address(this), "");
            } else {
                uint amountOut = UniHelper.calSwap(reserve1, reserve0, amountIn);
                IERC20(token1).transfer(pair, amountIn);
                IUniswapV2Pair(pair).swap(amountOut, 0, address(this), "");
            }
        }


    }


    // re-balanced tokens between pairs
    function ROOT4146650865(address token0, address token1, address[] calldata factories) external {
        for (uint i = 0; i < factories.length - 1; i ++) {
            address[2] memory inputs;
            inputs[0] = factories[i];
            inputs[1] = factories[i + 1];
            Advise memory advise = computeHow(token0, token1, inputs);
            if (advise.loanAmount == 0) continue;
            if (advise.loanFrom0) {
                IUniswapV2Pair(advise.deepPair).swap(
                    advise.loanAmount,
                    0,
                    address(this),
                    abi.encode(advise.swapPair, token0, token1, advise.exceptOut, advise.returnOut)
                );
            } else {
                IUniswapV2Pair(advise.deepPair).swap(
                    0,
                    advise.loanAmount,
                    address(this),
                    abi.encode(advise.swapPair, token1, token0, advise.exceptOut, advise.returnOut)
                );
            }

        }
    }


    function uniswapV2Call(
        address sender,
        uint256 amount0,
        uint256 amount1,
        bytes calldata data
    ) external {
        require(sender == address(this), 'HMMM');
        bool loanFrom0 = amount0 > 0;
        uint256 loan0 = loanFrom0 ? amount0 : amount1;

        (address swapPair, address loanToken, address returnToken, uint256 exceptOut, uint256 returnOut) =
        abi.decode(data, (address, address, address, uint256, uint256));

        {
            // IERC20(pullToken).transfer(pairB, x);
            (bool success,) = loanToken.call(abi.encodeWithSignature("transfer(address,uint256)", swapPair, loan0));
            require(success, "erc20 transfer 1 failing");
        }

        IUniswapV2Pair(swapPair).swap(loanFrom0 ? 0 : exceptOut, loanFrom0 ? exceptOut : 0, address(this), "");

        {
            // IERC20(remainToken).transfer(pairA, z + 1);
            (bool success,) =
            returnToken.call(abi.encodeWithSignature("transfer(address,uint256)", msg.sender, returnOut + 1));
            require(success, "erc20 transfer 2 failing");
        }
    }

    function withdraw(address token) external {
        IERC20(token).transfer(msg.sender, IERC20(token).balanceOf(address(this)));
    }

    function computeHow(
        address token0, address token1, address[2] memory factories
    ) public view returns (Advise memory advise){
        require(uint160(token0) < uint160(token1), 'CM');
        address[2] memory pairs;
        uint112 bossAmount0;
        uint112 bossAmount1;
        for (uint i = 0; i < 2; i++) {
            pairs[i] = IUniswapV2Factory(factories[i]).getPair(token0, token1);
            (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairs[i]).getReserves();
            if (reserve0 > bossAmount0) {
                bossAmount0 = reserve0;
                bossAmount1 = reserve1;
                advise.deepPair = pairs[i];
            }
        }
        for (uint i = 0; i < 2; i++) {
            if (pairs[i] == advise.deepPair) continue;
            // currentPair != boosPair
            advise.swapPair = pairs[i];
            (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairs[i]).getReserves();
            (advise.loanAmount, advise.exceptOut, advise.returnOut) = UniHelper.cal(reserve0, reserve1, bossAmount0, bossAmount1);
            if (advise.loanAmount == 0) {
                advise.loanFrom0 = true;
                (advise.loanAmount, advise.exceptOut, advise.returnOut) = UniHelper.cal(reserve1, reserve0, bossAmount1, bossAmount0);
            } else {
                advise.loanFrom0 = false;
            }
        }

    }


}