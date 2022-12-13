import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-web3';
import dotenv from 'dotenv';
dotenv.config();

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      forking: {
        url:
          'https://sepolia.infura.io/v3/866cd7f20d8846169cecdd5aa0142df1',
      },
    },
    localhost: {
      timeout: 10000000,
      url: 'http://127.0.0.1:8545',
      accounts: [process.env.PRIV_KEY as string],
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
  paths: {
    tests: './tests',
    artifacts: './artifacts',
  },
};

export default config;
