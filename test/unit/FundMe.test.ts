import { assert, expect } from "chai"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { deployments, ethers, network } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { developmentChains } from "../../helper-hardhat-config"

!developmentChains.includes(network.name) ?
    describe.skip
    : describe("FundMe", async () => {
        let fundMe: FundMe
        let deployer: SignerWithAddress
        let mockV3Aggregator: MockV3Aggregator
        const sendValue = ethers.parseEther("1") //1 ETH
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
                const response = await fundMe.getPriceFeed()
                assert.equal(response, await mockV3Aggregator.getAddress())
            })
        })
        describe("fund", async () => {
            it("fails if you dont sent enough ETH", async () => {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
            })
            it("updates the amount funded data structure", async () => {
                await fundMe.fund({ value: sendValue })
                const resp = await fundMe.getAddressToAmountFunded(deployer.address)
                assert.equal(resp.toString(), sendValue.toString())
            })
            it("adds funder to array of funders", async () => {
                await fundMe.fund({ value: sendValue })
                const funder = await fundMe.getFunder(0)
                assert.equal(funder, deployer.address)
            })

        })
        describe("withdraw", async () => {
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue })
            })
            it("can withdraw ETH from a single founder", async () => {
                // Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress())
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                // Act
                const txResponse = await fundMe.withdraw()
                const txReceipt = await txResponse.wait(1)
                // gasCost
                // const gasCost = txReceipt?.gasPrice! * txReceipt?.gasPrice!

                const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress())
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)


                // Assert
                assert.equal(endingFundMeBalance, 0n)
                assert.equal(startingFundMeBalance + startingDeployerBalance, endingDeployerBalance + txReceipt?.fee!)

            })
            it("allows us to withdraw with multiple funders", async () => {
                // Arrange
                const accounts = await ethers.getSigners()
                for (let i = 0; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress())
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                // Act
                const txResponse = await fundMe.withdraw()
                const txReceipt = await txResponse.wait(1)

                const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress())
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)

                assert.equal(startingFundMeBalance + startingDeployerBalance, endingDeployerBalance + txReceipt?.fee!)

                // Make sure that the funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0n)
                }

            })

            it("only allows the owner to withdraw", async () => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedContract.withdraw()).to.be.reverted
            })
        })

        describe("cheaper withdraw", async () => {
            beforeEach(async () => {
                await fundMe.fund({ value: sendValue })
            })
            it("can withdraw ETH from a single founder", async () => {
                // Arrange
                const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress())
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                // Act
                const txResponse = await fundMe.cheaperWithdraw()
                const txReceipt = await txResponse.wait(1)
                // gasCost
                // const gasCost = txReceipt?.gasPrice! * txReceipt?.gasPrice!

                const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress())
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)


                // Assert
                assert.equal(endingFundMeBalance, 0n)
                assert.equal(startingFundMeBalance + startingDeployerBalance, endingDeployerBalance + txReceipt?.fee!)

            })
            it("allows us to withdraw with multiple funders", async () => {
                // Arrange
                const accounts = await ethers.getSigners()
                for (let i = 0; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress())
                const startingDeployerBalance = await ethers.provider.getBalance(deployer)
                // Act
                const txResponse = await fundMe.cheaperWithdraw()
                const txReceipt = await txResponse.wait(1)

                const endingFundMeBalance = await ethers.provider.getBalance(await fundMe.getAddress())
                const endingDeployerBalance = await ethers.provider.getBalance(deployer)

                assert.equal(startingFundMeBalance + startingDeployerBalance, endingDeployerBalance + txReceipt?.fee!)

                // Make sure that the funders are reset properly
                await expect(fundMe.getFunder(0)).to.be.reverted

                for (let i = 1; i < 6; i++) {
                    assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0n)
                }

            })

            it("only allows the owner to withdraw", async () => {
                const accounts = await ethers.getSigners()
                const attacker = accounts[1]
                const attackerConnectedContract = await fundMe.connect(attacker)
                await expect(attackerConnectedContract.cheaperWithdraw()).to.be.reverted
            })
        })
    })