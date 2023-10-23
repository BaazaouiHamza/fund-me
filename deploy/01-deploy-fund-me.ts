import verify from './../utils/verify';
import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from '../helper-hardhat-config'

const deployFundMe = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y
    // const ethUsdPriceFeedAddress = networkConfig[chainId!]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId!]["ethUsdPriceFeed"]
    }

    // if the contract doesnt exist, we deploy a minimal version of
    // for our local testing


    // well what happens when we want to change chains?
    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress]
    const FundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: networkConfig[chainId!].blockConfirmations || 1
    })

    if (!developmentChains.includes(network.name) && process.env.ETHER_SCAN_API_KEY) {
        await verify(FundMe.address, args)
    }
    log("------------------------------------------------------------------")
}

export default deployFundMe

deployFundMe.tags = ["all", "fundme"]