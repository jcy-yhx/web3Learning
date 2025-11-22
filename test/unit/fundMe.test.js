const { ethers, deployments, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
describe("test fundMe contract", async function(){
    let firstAccount
    let secondAccount
    let fundMe
    let fundMeSecond
    let mockV3Aggregator    
    this.beforeEach(async function () {
        await deployments.fixture(["all"])
        firstAccount = (await getNamedAccounts()).firstAccount
        const accounts = await ethers.getSigners()
        secondAccount = accounts[1]
        //await deployments.get()得到的是合约信息
        const fundMeDeployment = await deployments.get("FundMe")
        mockV3Aggregator = await deployments.get("MockV3Aggregator")
        //await ethers.getContractAt（）得到的是真正能与链上交互的合约对象，包含可调用函数
        fundMe = await ethers.getContractAt("FundMe",fundMeDeployment.address)
        fundMeSecond = await ethers.getContractAt("FundMe", fundMeDeployment.address, secondAccount)
        await fundMe.waitForDeployment()
    })

    //unit test for fund

    it("test if the owner is msg.sender", async function(){
        // const fundeMeFactory = await ethers.getContractFactory("FundMe")
        // const fundMe = await fundeMeFactory.deploy()
        // const [firstAccount] = await ethers.getSigners()
        assert.equal((await fundMe.owner()),firstAccount)
    })

    it("test if the detafeed is assigned correctly", async function (){
        assert.equal((await fundMe.dataFeed()),mockV3Aggregator.address )
    })

    it("value is less than the minimum,fund failed",async function(){
        await expect(fundMe.fund({value: ethers.parseEther("0.01")}))
            .to.be.revertedWith("send more eth")
    })

    it("test value than the minimum,fund seuucess",async function (){
        await fundMe.fund({value: ethers.parseEther("0.02")})
        const balance = await fundMe.fundersToAccount(firstAccount)
        expect(balance).to.equal(ethers.parseEther("0.02"))
    })

    //unit test for getfund
    it("not owner ,target reached, getfund failed",async function (){
        await fundMe.fund({value: ethers.parseEther("0.1")})
        await expect(fundMeSecond.getFund())
            .to.be.revertedWith("this functiong can only called by owner")
    })
    
    it("target not reach , getfund failed",async function () {
        await fundMe.fund({value: ethers.parseEther("0.02")})  
        await expect(fundMe.getFund())
            .to.be.revertedWith("TARGET IS NOT REACHED")
    })

    it("target reached, getfund success",async function () {
        await fundMe.fund({value: ethers.parseEther("0.1")})  
        await expect(fundMe.getFund())
            .to.emit(fundMe,"FundWithdrawByOwner")
            .withArgs(ethers.parseEther("0.1"))
    })

    // 剩下的不写了

})