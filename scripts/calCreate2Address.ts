// mint test token usdc
import { artifacts, ethers } from 'hardhat'

async function main() {
    const factroyAddr = '0x7539a3af6c019b6816eb367cc38eec7d943aa545'
    const keccak256OfCode = ethers.utils.keccak256(artifacts.readArtifactSync('SampleToken').bytecode)
    let salt = 0
    let computeAddr = '0'
    while (true) {
        computeAddr = ethers.utils.getCreate2Address(
            factroyAddr,
            ethers.utils.hexZeroPad(ethers.utils.arrayify(salt), 32),
            keccak256OfCode
        )
        if (computeAddr.toLowerCase().startsWith('0x6666')) console.log(salt, computeAddr)
        salt++
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
