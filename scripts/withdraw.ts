import { ethers, getNamedAccounts } from "hardhat"

async function main() {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContractAt("FundMe", deployer)
    console.log("Funding Contract...")
    const txResponse = await fundMe.withdraw()
    await txResponse.wait(1)
    console.log("Got it back!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })