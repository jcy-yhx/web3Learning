// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract FundMe{
    mapping(address => uint256) public fundersToAccount;

    // 转账最低值 10美元
    uint256 constant MINIUM_VALUE = 10 * 10 ** 18;  

     // 定义Chainlink的数据源
    AggregatorV3Interface internal dataFeed;

    //定义提取fund的值
    uint constant TARGET = 40 *10**18;

    //合约所有者
    address public owner;

    // 构造函数
    constructor(){
        //sepolia testnet ETH / USD
        dataFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);

        //赋值owner
        owner = msg.sender;
    }

    //支付函数
    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIUM_VALUE,"send more eth");
        fundersToAccount[msg.sender] += msg.value; 
    }

    //从datafeed中获取eth/usd的汇率
    function getChainlinkDataFeedLatestAnswer() public view returns (int256) {
        // prettier-ignore
        (
            /* uint80 roundId */
            ,
            int256 answer,
            /*uint256 startedAt*/
            ,
            /*uint256 updatedAt*/
            ,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    //将eth转换成美元
    function convertEthToUsd(uint256 ehtAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
        return ehtAmount * ethPrice / 10**8;  //usd
    }

    //owner转移
    function transferOwnerShip(address newOwner) public {
        require(msg.sender == owner,"this functiong can only called by owner");
        owner = newOwner;
    }

    //fund提取函数
    function getFund() external {
        require(msg.sender == owner,"this functiong can only called by owner");
        require(convertEthToUsd(address(this).balance) >= TARGET,"TARGET IS NOT REACHED");
        //transfer
        // payable(msg.sender).transfer(address(this).balance);

        //send
        // bool success = payable(msg.sender).send(address(this).balance);

        //call
        bool success;
        (success, ) = payable(msg.sender).call{value:address(this).balance}("");
        require(success,"transfer tx falled");

        //应该将所有人余额清零
        
    }

    //fund退款
    function reFund() external {
        require(convertEthToUsd(address(this).balance) <= TARGET,"TARGET IS REACHED");
        require(fundersToAccount[msg.sender] > 0,"there is no fund for you");
        bool success;
        (success, )= payable(msg.sender).call{value: fundersToAccount[msg.sender]}("");
        require(success,"transfer tx falled");
        fundersToAccount[msg.sender] = 0;
    }

}