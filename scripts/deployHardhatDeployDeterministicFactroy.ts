import { ethers } from 'hardhat'

// mint test token usdc
async function main() {
    /*
    object "Proxy" {
	// deployment code
	code {
		let size := datasize("runtime")
		datacopy(0, dataoffset("runtime"), size)
		return(0, size)
	}
	object "runtime" {
		// deployed code
		code {
			calldatacopy(0, 32, sub(calldatasize(), 32))
			let result := create2(callvalue(), 0, sub(calldatasize(), 32), calldataload(0))
			if iszero(result) { revert(0, 0) }
			mstore(0, result)
			return(12, 20)
		}
	}
}
     * */
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
