import { ethers } from 'hardhat'
import { stripZeros } from '@ethersproject/bytes'

// mint test token usdc
async function main() {
    const userAddr = '0xB6c13Ef5d4Ea4C938768949d2Ef8eab3271688b9'
    const nonce = 0

    const RLPPacked = ethers.utils.RLP.encode([
        ethers.utils.arrayify(userAddr),
        stripZeros(ethers.utils.arrayify(nonce)),
    ])
    const computed = ethers.utils.solidityKeccak256(['bytes'], [RLPPacked])
    const targetAddr = ethers.utils.hexDataSlice(computed, 12)

    console.log(targetAddr)
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
