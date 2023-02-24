import { ERC20__factory, UniBalancer__factory, UniswapV2Pair__factory } from '../../typechain'
import { ethers } from 'hardhat'
import { parseLog } from '../utils'

// mint test token usdc
async function main() {
    const signers = await ethers.getSigners()
    const deployer = signers[0]
    const uniBalancer = await UniBalancer__factory.connect('0xDD597f90B58889b6dac963587211641DE846f045', deployer)

    const goerliUSDC = '0xA375A26dbb09F5c57fB54264f393Ad6952d1d2de'
    const goerliMATIC = '0xbf3b5CF32066650Ea0b28277e621Ee3d0b41905A'

    // maybe give some money
    const dataMint = new ethers.utils.Interface(['function mint() external'])
    await deployer.sendTransaction({ to: goerliUSDC, data: dataMint.encodeFunctionData('mint') })
    await deployer.sendTransaction({ to: goerliMATIC, data: dataMint.encodeFunctionData('mint') })

    let token = await ERC20__factory.connect(goerliUSDC, deployer)
    await token.transfer(uniBalancer.address, ethers.utils.parseUnits('10000', 6))
    token = await ERC20__factory.connect(goerliMATIC, deployer)
    await token.transfer(uniBalancer.address, ethers.utils.parseUnits('10000', 18))

    const tx = await uniBalancer.ROOT4146650864(
        goerliUSDC,
        goerliMATIC,
        [
            '0xDB45aeED5d75581ce137f074721804D8b43E9Ce9',
            '0x8566B648A411940EF0777f5b6469a2d97856C0f4',
            '0x743e84b4C77e98d7BaFC44893F830613298A2613',
        ],
        ethers.utils.parseUnits('1.5', 6),
        ethers.utils.parseEther('1')
    )
    console.log('sending swap tx...', tx.hash)
    const recepit = await tx.wait()
    await parseLog(recepit, [UniswapV2Pair__factory.createInterface()])
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
