// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "./FullMath.sol";

library UniHelper {

    // given 'input' amount token0, cal how much token1 returned (return1)
    function calSwap(uint256 reserve0, uint256 reserve1, uint256 input0) internal pure returns (uint return1){
        return1 = ((input0 * 997 * reserve1)) / (reserve0 * 1000 + input0 * 997);
    }

    function calX(
        uint256 reserve0,
        uint256 reserve1,
        uint256 deep0,
        uint256 deep1
    ) internal pure returns (int256) {
        // product sq.roots
        int256 prA = int256(Math.sqrt(reserve0 * reserve1));
        int256 prB = int256(Math.sqrt(deep0 * deep1));

        // uint256 k = (prA + prB) / (prA - prB);

        // uint256 x1 = (k * (reserve1 * (1000 / 997) + deep1)) / 2 - (reserve1 * (1000 / 997) - deep1) / 2;
        // int256 x1 =
        //     ((((int256(reserve1) * 1000 + int256(deep1) * 997) * (prA + prB)) / (prA - prB)) -
        //         (int256(reserve1) * 1000 - int256(deep1) * 997)) /
        //         2 /
        //         997;
        // uint256 x2 = ((1 / k) * (reserve1 * (1000 / 997) + deep1)) / 2 - (reserve1 * (1000 / 997) - deep1) / 2;
        int256 x2 =
        ((((int256(reserve1) * 1000 + int256(deep1) * 997) * (prA - prB)) / (prA + prB)) -
        (int256(reserve1) * 1000 - int256(deep1) * 997)) /
        2 /
        997;
        return (x2);
    }

    // export function calProfit(x: number, reserve0: number, reserve1: number, deep0: number, deep1: number): number {
    //   return reserve0 - (reserve0 * reserve1) / (reserve1 + x) + (deep0 * deep1) / (x - deep1) + deep0;
    // }

    /// @dev this function calculates how many token1 takes to swap 2 pairs to balanced
    ///      usually we loan from 'deep' pair and made swap in 'reserve' pair
    /// need1 = amount token1 in
    /// swap0 = amount token0 out
    /// return0 = amount token1 return
    function cal(
        uint256 reserve0,
        uint256 reserve1,
        uint256 deep0,
        uint256 deep1
    )
    internal
    pure
    returns (
        uint256 need1,
        uint256 swap0,
        uint256 return0
    )
    {
        // (trades[0].x, trades[1].x) = calX(reserve0, reserve1, deep0, deep1);
        int256 _x = calX(reserve0, reserve1, deep0, deep1);
        if (_x <= 0) {
            return (0, 0, 0);
        }
        need1 = uint256(_x);
        // trades[0].y = (trades[0].x * 997 * int256(reserve0)) / (int256(reserve1) * 1000 + trades[0].x * 997);
        // trades[0].z = (((int256(deep0) * trades[0].x) / (int256(deep1) - trades[0].x)) * 1000) / 997;

        swap0 = ((need1 * 997 * reserve0)) / (reserve1 * 1000 + need1 * 997);
        return0 = ((((deep0 * need1) * 1000) / (deep1 - need1))) / 997;

        if (need1 >= deep1 || swap0 >= reserve0 || return0 < 0) {
            delete need1;
        }
    }


    // computes the direction and magnitude of the profit-maximizing trade
    function computeUniV2ProfitMaximizingTrade(
        uint256 truePriceTokenA, uint256 truePriceTokenB, uint256 reserveA, uint256 reserveB
    ) internal pure returns (bool aToB, uint256 amountIn) {
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