import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      forking: {
        url:
          'https://eth-goerli.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY,
      },
    },
    localhost: {
      timeout: 10000000,
    },
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/' + process.env.ALCHEMY_API_KEY,
      accounts: [process.env.PRIV_KEY as string],
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/' + process.env.INFURA_API_KEY,
      accounts: [process.env.PRIV_KEY as string],
    },
  },
};

export default config;
