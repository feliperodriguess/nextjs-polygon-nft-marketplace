require('@nomiclabs/hardhat-waffle')
const fs = require('fs')

const privateKey = fs.readFileSync('.secret').toString()
const projectId = '11787934e47944fb8b85677ce501760c'

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts: [projectKey],
    },
    mainnet: {
      url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
      accounts: [projectKey],
    },
  },
  solidity: '0.8.4',
}
