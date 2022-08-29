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

dotenv.config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

/* const deterministicDeploymentConfig = (network: string) => {
    return {
        factory: '0x5e3a23F59625E21170C0E6e3B6b4305294495d94',
        deployer: '0x0ECC4a43Be8880c21Db0c7a821a051944F13Bbe5',
        funding: '10000000000000000',
        signedTx:
            '0xf8a68085174876e800830186a08080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf381e5a06122efa0bf79487fc37ddd5f594283d551c2f2cc5caeb3747a893133b54c9b7ea03dc515047a2e7de0c6ccc307ca19cdf6b29791bf8905eee2a908dc43ac3193d6',
    }
} */

const deterministicDeploymentConfig = (network: string) => {
    return {
        factory: '0xAdB7A1db521853BE0E97aEdd43455Fb7d220e8E5',
        deployer: '',
        funding: '',
        signedTx: '',
    }
}

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.3',
        settings: {
            optimizer: {
                enabled: true,
                runs: 180,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 1337,
            allowUnlimitedContractSize: true,
        },
        bsctest: {
            url: 'https://bsctestapi.terminet.io/rpc',
            accounts: {
                mnemonic: process.env.MNEMONIC,
            },
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
        externalArtifacts: ['node_modules/@openzeppelin/contracts/build/contracts/ERC1155.json'],
    },
}

export default config
