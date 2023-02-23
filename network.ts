import 'dotenv/config'
export function node_url(networkName: string): string {
    if (networkName) {
        const url = process.env['ETH_NODE_URL_' + networkName.toUpperCase()]
        if (url && url !== '') {
            return url
        }
    }

    let url = process.env.ETH_NODE_URL
    if (url) {
        url = url.replace('{{networkName}}', networkName)
    }
    if (!url || url === '') {
        if (networkName === 'localhost') {
            return 'http://localhost:8545'
        }
        return ''
    }
    if (url.indexOf('{{') >= 0) {
        throw new Error(`invalid uri or network not supported by nod eprovider : ${url}`)
    }
    return url
}

export function getMnemonic(networkName?: string): string {
    if (networkName) {
        const mnemonic = process.env['MNEMONIC_' + networkName.toUpperCase()]
        if (mnemonic && mnemonic !== '') {
            return mnemonic
        }
    }

    const mnemonic = process.env.MNEMONIC
    if (!mnemonic || mnemonic === '') {
        return 'test test test test test test test test test test test junk'
    }
    return mnemonic
}

export function accounts(networkName?: string): { mnemonic: string } {
    return { mnemonic: getMnemonic(networkName) }
}
