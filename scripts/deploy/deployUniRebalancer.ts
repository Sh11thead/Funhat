import { UniBalancer__factory } from '../../typechain'
import { ethers } from 'hardhat'

// mint test token usdc
async function main() {
    const signers = await ethers.getSigners()
    const deployer = signers[0]
    const factory: UniBalancer__factory = new UniBalancer__factory(deployer)
    const uniBalancer = await factory.deploy()

    console.log('balancer Deployed to', uniBalancer.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
