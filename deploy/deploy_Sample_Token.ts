import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments } = hre
    const { deploy } = deployments

    const deployer = (await hre.ethers.getSigners())[0].address

    // 1. deploy TestToken
    await deploy('SampleToken', {
        from: deployer,
        deterministicDeployment: '0x046c7a',
        log: true,
    })
}
export default func
func.tags = ['TestToken']
