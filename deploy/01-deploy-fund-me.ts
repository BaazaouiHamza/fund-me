import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { devolpmentChains, networkConfig } from '../helper-hardhat-config'

const deployFundMe = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // const ethUsdPriceFeedAddress = networkConfig[chainId!]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (devolpmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId!]["ethUsdPriceFeed"]
    }

    // if the contract doesnt exist, we deploy a minimal version of
    // for our local testing


    // well what happens when we want to change chains?
    // when going for localhost or hardhat network we want to use a mock
    const FundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],// put price feed address,
        log: true
    })
    log("------------------------------------------------------------------")
}

export default deployFundMe

deployFundMe.tags = ["all","fundme"]