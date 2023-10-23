import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DECIMALS, INITIAL_ANSWER, developmentChains, networkConfig } from "../helper-hardhat-config"

const deployMocks = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying Mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        })
        log("Mocks deployed")
        log("-------------------------------------------------")
    }

}

export default deployMocks

deployMocks.tags = ["all", "mocks"]