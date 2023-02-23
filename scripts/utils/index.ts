import { ethers } from "ethers";

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function parseLog(receipt, abis: ethers.utils.Interface[]) {
    // eslint-disable-next-line array-callback-return
    receipt.logs.map((log) => {
        for (const abi of abis) {
            try {
                const desc = abi.parseLog(log)
                console.info(desc.name, desc.args)
            } catch (err) {}
        }
    })
}
