const { network } = require("hardhat")
const { developmentChains,networkConfig,CONFIRMATIONS } = require("../helper-hardhat-config")

module.exports = async({getNamedAccounts,deployments})=>{
    const { firstAccount } = await getNamedAccounts()
    const { deploy } = deployments

    let dataFeedAddr
    if(developmentChains.includes(network.name)){
        const MockV3Aggregator = await deployments.get("MockV3Aggregator")
        dataFeedAddr = MockV3Aggregator.address
    }else{
        dataFeedAddr = networkConfig[network.config.chainId].ethUsDataFeed
    }
    console.log("this is dataFeedAddr " + dataFeedAddr)
    const fundMe = await deploy("FundMe",{
        from: firstAccount,
        args: [dataFeedAddr],
        log: true,
        //wait 5 blocks 1 ,but when test,it will bug
        // waitConfirmations: CONFIRMATIONS
    })
    console.log("this is fundMe address "+ fundMe.address)
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        //wait 5 blocks 2
        console.log("Waiting for 5 block confirmations...")

        const txHash = fundMe.receipt.transactionHash
        const tx = await hre.ethers.provider.getTransaction(txHash)
        await tx.wait(CONFIRMATIONS)

        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [dataFeedAddr],
        });
    }else{
        console.log("network is not sepolia, verification skipped")
    }
}

module.exports.tags = ["all","fundme"]