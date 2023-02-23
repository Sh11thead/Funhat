import * as dotenv from 'dotenv'

import { task } from 'hardhat/config'
import { HardhatUserConfig } from 'hardhat/types'
import '@nomiclabs/hardhat-etherscan'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
// eslint-disable-next-line camelcase
import { accounts, node_url } from './network'

dotenv.config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

const deterministicDeploymentConfig = (network: string) => {
    return {
        factory: '',
        deployer: '',
        funding: '',
        signedTx: '',
    }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: '0.8.17',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    networks: {
        hardhat: {
            chainId: 1337,
            allowUnlimitedContractSize: true,
        },
        goerli: {
            url: node_url('goerli'),
            accounts: accounts('goerli'),
            gas: 'auto',
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: 'USD',
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    mocha: {
        timeout: 1000000,
    },
    deterministicDeployment: deterministicDeploymentConfig,
    typechain: {
        externalArtifacts: [
            'node_modules/@openzeppelin/contracts/build/contracts/ERC1155.json',
            'node_modules/@uniswap/v2-periphery/build/UniswapV2Router02.json ',
            'node_modules/@uniswap/v2-core/build/UniswapV2Pair.json ',
            'node_modules/@uniswap/swap-router-contracts/artifacts/contracts/SwapRouter02.sol/SwapRouter02.json',
        ],
    },
}

export default config
