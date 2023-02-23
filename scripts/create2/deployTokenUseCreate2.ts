import { artifacts, ethers } from 'hardhat'
import { Create2Deployer, SampleToken } from '../../typechain'

// mint test token usdc
async function main() {
    const factoryAddr = '0x8566B648A411940EF0777f5b6469a2d97856C0f4'
    const tokenByteCode = artifacts.readArtifactSync('SampleToken').bytecode
    const tokenByteCodeHash = ethers.utils.keccak256(artifacts.readArtifactSync('SampleToken').bytecode)
    const salt = 210821
    const computeAddr = ethers.utils.getCreate2Address(
        factoryAddr,
        ethers.utils.hexZeroPad(ethers.utils.arrayify(salt), 32),
        tokenByteCodeHash
    )
    console.log(computeAddr)

    const deployer = <Create2Deployer>await ethers.getContractAt('Create2Deployer', factoryAddr)

    const tx = await deployer.deploy(
        ethers.utils.parseEther('0.0001'),
        ethers.utils.hexZeroPad(ethers.utils.arrayify(salt), 32),
        ethers.utils.arrayify(tokenByteCode),
        { value: ethers.utils.parseEther('0.0001') }
    )
    await tx.wait()

    const token = <SampleToken>await ethers.getContractAt('SampleToken', computeAddr)
    await token.initialize((await ethers.getSigners())[0].address)
    await tx.wait()
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
