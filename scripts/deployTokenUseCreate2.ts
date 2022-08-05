import { artifacts, ethers } from 'hardhat'

// mint test token usdc
async function main() {
    const factoryAddr = '0x7539A3AF6c019B6816eB367cc38eEC7D943aa545'
    const tokenByteCode = artifacts.readArtifactSync('SampleToken').bytecode
    const tokenByteCodeHash = ethers.utils.keccak256(artifacts.readArtifactSync('SampleToken').bytecode)
    const salt = 1216331
    const computeAddr = ethers.utils.getCreate2Address(factoryAddr, ethers.utils.arrayify(salt), tokenByteCodeHash)
    console.log(computeAddr)

    const deployer = await ethers.getContractAt('Create2Deployer', factoryAddr)
    await deployer.deploy()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
