import { assert } from "chai"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { deployments, ethers } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
describe("FundMe", async () => {
    let fundMe: FundMe
    let deployer: SignerWithAddress
    let mockV3Aggregator: MockV3Aggregator
    beforeEach(async () => {
        // deploy our fund me contract
        // using hardhat-deploy
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["all"])
        // there is no getContract function in ethers, so using getContractAt
        const FundMeDeployment = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt(FundMeDeployment.abi, FundMeDeployment.address, deployer) as unknown as FundMe
        const MockV3AggregatorDeployment = await deployments.get(
            "MockV3Aggregator",
        )
        mockV3Aggregator = await ethers.getContractAt(
            MockV3AggregatorDeployment.abi,
            MockV3AggregatorDeployment.address,
            deployer,
        ) as unknown as MockV3Aggregator
    })

    describe("constructor", async () => {
        it("sets the aggregator addresses correctly", async () => {
            const response = await fundMe.s_priceFeed()
            assert.equal(response, await mockV3Aggregator.getAddress())
        })
    })
})