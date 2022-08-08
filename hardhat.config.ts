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

const deterministicDeploymentConfig = (network: string) => {
    return {
        factory: process.env.DETERMINFAC ? process.env.DETERMINFAC : '0xA375A26dbb09F5c57fB54264f393Ad6952d1d2de',
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
    deterministicDeployment: process.env.DETERMINFAC ? deterministicDeploymentConfig : undefined,
}

export default config
// curl https://http-testnet.cube.network/ \
//   -X POST \
//   -H "Content-Type: application/json" \
//   --data '{"method":"eth_blockNumber","params":[],"id":1,"jsonrpc":"2.0"}'
