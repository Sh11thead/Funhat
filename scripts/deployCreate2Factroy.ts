import { ethers } from 'hardhat'

// mint test token usdc
async function main() {
    const factoryFactory = await ethers.getContractFactory('Create2Deployer')
    const factory = await factoryFactory.deploy()
    console.log(factory.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
