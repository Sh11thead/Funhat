// mint test token usdc
import { artifacts, ethers } from 'hardhat'

async function main() {
    const factroyAddr = '0xF193b47F0D08d82e4CCdCbbaFEaA1Aaf4BcF5484'
    const keccak256OfCode = ethers.utils.keccak256(artifacts.readArtifactSync('SampleToken').bytecode)
    let salt = 0
    let computeAddr = '0'
    let totalNum = 0
    while (true) {
        computeAddr = ethers.utils.getCreate2Address(
            factroyAddr,
            ethers.utils.hexZeroPad(ethers.utils.arrayify(salt), 32),
            keccak256OfCode
        )
        if (computeAddr.toLowerCase().startsWith('0x6666')) {
            console.log(salt, computeAddr)
            totalNum++
        }
        if (totalNum > 10) {
            break
        }
        salt++
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
