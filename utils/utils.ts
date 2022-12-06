import fs from 'fs';
import Web3 from 'web3';
import colors from 'colors';
import dotenv from 'dotenv';
import hardhat from 'hardhat';
import HDWalletProvider from '@truffle/hdwallet-provider';
import * as constants from './constants';

const { ethers } = hardhat;
dotenv.config();

let provider;

if (constants.ACTIVE_NETWORK === constants.NETWORKS.LOCAL) {
  // @ts-ignore
  const providerUrl = `${constants.ACTIVE_NETWORK.url}:${constants.ACTIVE_NETWORK.port}`;
  console.log(colors.gray(`connecting web3 to '${providerUrl}'...`));
  provider = new Web3.providers.HttpProvider(providerUrl);
} else {
  console.log(
    colors.gray(`connecting web3 to '${constants.ACTIVE_NETWORK.name}'...`)
  );
  provider = new HDWalletProvider(
    constants.ACTIVE_NETWORK.privKey,
    constants.ACTIVE_NETWORK.url
  );
}
export const web3 = new Web3(provider);

const ETHERNAUT_CONTRACT = process.env.ETHERNAUT_CONTRACT as string;

export const loadFetchedData = (path: string) => {
  try {
    return JSON.parse(fs.readFileSync(path).toString());
  } catch (err) {
    return {};
  }
};

export const storeData = (path: string, data: {}) => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};

export const getGasPrice = async () => {
  const gasPrice = await web3.eth.getGasPrice();

  return gasPrice;
};

export const isCompleted = async (
  SLOT: number,
  INDEX: number,
  instance: string
): Promise<boolean> => {
  let newKey = web3.utils.hexToNumberString(
    web3.utils.keccak256(
      web3.eth.abi.encodeParameters(['address', 'uint256'], [instance, SLOT])
    )
  );
  let bigNumberFromKey = web3.utils.toBN(newKey).add(web3.utils.toBN(INDEX));
  let POSITION = web3.utils.toHex(bigNumberFromKey);

  let slot = await web3.eth.getStorageAt(ETHERNAUT_CONTRACT, POSITION);
  console.log(slot);

  let isCompleted = slot.slice(2, 26);
  //let level = '0x' + slot.slice(26, 66);

  return isCompleted.at(-1) === '1' ? true : false;
};

export const getImpersonatedSigner = async (address: string) => {
  if (constants.ACTIVE_NETWORK === constants.NETWORKS.LOCAL) {
    const impersonatedSigner = await ethers.getImpersonatedSigner(address);
    return impersonatedSigner;
  } else {
    const signer = new ethers.Wallet(
      process.env.PRIV_KEY as string,
      new ethers.providers.AlchemyProvider(
        constants.ACTIVE_NETWORK.name,
        process.env.ALCHEMY_API_KEY
      )
    );
    return signer;
  }
};

export const reportGas = (receivedTxn: any) => {
  console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
  console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
  console.log('');
};
