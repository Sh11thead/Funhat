import { ethers } from 'hardhat'

// mint test token usdc
async function main() {
    const determinsticFactoryBytecode =
        '0x604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf3'
    const factoryFactory = await ethers.getContractFactory([], determinsticFactoryBytecode)

    const determinsticFactory = await factoryFactory.deploy()
    console.log(determinsticFactory.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
