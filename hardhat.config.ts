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
        url: 'https://eth-goerli.g.alchemy.com/v2/' + process.env.API_KEY,
      },
    },
    localhost: {
      timeout: 60 * 60 * 1000, // 60 minutes
    }
  },
};

export default config;
