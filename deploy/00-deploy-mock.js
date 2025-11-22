const { INITAL_ANSWER,DECIMAL,developmentChains } = require("../helper-hardhat-config")

module.exports = async ({getNamedAccounts,deployments}) =>{

    if(developmentChains.includes(network.name)){
        const firstAccount = (await getNamedAccounts()).firstAccount
        const { deploy } = deployments

        await deploy("MockV3Aggregator",{
            from: firstAccount,
            args: [DECIMAL,INITAL_ANSWER],
            log: true
        })
    }else{
        console.log("environment is no local,mock contract is skipped")
    }

}
module.exports.tags = ["all","mock"]