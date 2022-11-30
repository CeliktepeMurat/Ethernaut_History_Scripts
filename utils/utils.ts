import fs from 'fs';
import Web3 from 'web3';
import dotenv from 'dotenv';
import hardhat from 'hardhat';

const { ethers } = hardhat;
dotenv.config();

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://goerli.infura.io/v3/' + process.env.API_KEY
  )
);

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
  const impersonatedSigner = await ethers.getImpersonatedSigner(address);
  return impersonatedSigner;
};

export const reportGas = (receivedTxn: any) => {
  // console.log(receivedTxn);
  console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
  console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
  console.log('');
};
