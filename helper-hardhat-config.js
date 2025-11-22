const DECIMAL = 8
const INITAL_ANSWER = 3000*1e8
const CONFIRMATIONS = 5
const developmentChains = ["hardhat", "local"]

const networkConfig = {
    11155111:{
        ethUsDataFeed:"0x694AA1769357215DE4FAC081bf1f309aDC325306"
    }
}
module.exports = {
    DECIMAL,
    INITAL_ANSWER,
    developmentChains,
    networkConfig,
    CONFIRMATIONS
}