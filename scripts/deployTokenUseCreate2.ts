import { artifacts, ethers } from 'hardhat'
import { Create2Deployer, SampleToken } from '../typechain'

// mint test token usdc
async function main() {
    const factoryAddr = '0x7539A3AF6c019B6816eB367cc38eEC7D943aa545'
    const tokenByteCode = artifacts.readArtifactSync('SampleToken').bytecode
    const tokenByteCodeHash = ethers.utils.keccak256(artifacts.readArtifactSync('SampleToken').bytecode)
    const salt = 1216330
    const computeAddr = ethers.utils.getCreate2Address(
        factoryAddr,
        ethers.utils.hexZeroPad(ethers.utils.arrayify(salt), 32),
        tokenByteCodeHash
    )
    console.log(computeAddr)

    const deployer = <Create2Deployer>await ethers.getContractAt('Create2Deployer', factoryAddr)

    await deployer.deploy(
        0,
        ethers.utils.hexZeroPad(ethers.utils.arrayify(salt), 32),
        ethers.utils.arrayify(tokenByteCode)
    )

    const token = <SampleToken>await ethers.getContractAt('SampleToken', computeAddr)

    await token.initialize((await ethers.getSigners())[0].address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
