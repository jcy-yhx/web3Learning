//inport ethers.js
const { ethers } = require("hardhat")
require("@chainlink/env-enc").config()
//mainfunction

async function main(){
    //create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("contract deploying")

    //deploy contract from factory
    const fundMe= await fundMeFactory.deploy()
    await fundMe.waitForDeployment()
    console.log("contract has been deployed successfully,contract address is "+fundMe.target)
    console.log("the chainId is "+hre.network.config.chainId)

    //veify fundme
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        //wait 5 blocks
        console.log("waiting for 5 blocks")
        const tx = fundMe.deploymentTransaction()
        await tx.wait(5)

        await hre.run("verify:verify", {
            address: fundMe.target,
            // constructorArguments: [],
        });
    }else{
        console.log("verification skipped..")
    }

    //init 2 accounts
    const [firstAccount,secondAccount] = await ethers.getSigners()

    //fund contract with firstAccount
    const fundTx = await fundMe.fund({value:ethers.parseEther("0.01")}) //payable need index
    await fundTx.wait()

    //check balance of contract
    const balanceOfContract = await ethers.provider.getBalance(fundMe.target)
    console.log(`balance of contract is ${balanceOfContract}`)

    //fund contract with secondAccount
    const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({value:ethers.parseEther("0.01")}) //payable need index
    await fundTxWithSecondAccount.wait()

    //check balance of contract
    const balanceOfContractAfterSecondAccount = await ethers.provider.getBalance(fundMe.target)
    console.log(`balance of contract is ${balanceOfContractAfterSecondAccount}`)

    //check mapping
    const firstAccountBalanceInFundMe = await fundMe.fundersToAccount(firstAccount.address)
    const secondAccountBalanceInFundMe = await fundMe.fundersToAccount(secondAccount.address)
    console.log(`balance of firstAccount ${firstAccount.address} is ${firstAccountBalanceInFundMe}`)
    console.log(`balance of secondAccount ${secondAccount.address} is ${secondAccountBalanceInFundMe}`)

}

main().then().catch((error) => {
    console.error(error)
    process.exit(1)
})