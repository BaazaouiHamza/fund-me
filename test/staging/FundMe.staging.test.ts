import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ethers, network } from "hardhat"
import { FundMe } from "../../typechain-types"
import { developmentChains } from "../../helper-hardhat-config"
import { assert } from "chai"

(developmentChains.includes(network.name)) ?
    describe.skip
    : describe("FundMe", async () => {
        let fundMe: FundMe
        let deployer: SignerWithAddress
        const sendValue = ethers.parseEther("1")
        beforeEach(async () => {
            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            fundMe = await ethers.getContractAt("FundMe", deployer)
        })

        it("allows people to fund and withdraw", async () => {
            await fundMe.fund({ value: sendValue })
            await fundMe.withdraw()
            const endingBalance = await ethers.provider.getBalance(await fundMe.getAddress())
            assert.equal(endingBalance.toString(), "0")
        })
    }) 