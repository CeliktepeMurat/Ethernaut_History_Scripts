import Web3 from 'web3';
import dotenv from 'dotenv';
import fs from 'fs';
import { FETCH_DATA, EVENT_TYPE_SIG } from '../utils/interface';
dotenv.config();

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://goerli.infura.io/v3/' + process.env.INFURA_API_KEY
  )
);
const ETHERNAUT_CONTRACT = '0x42E7014a9D1f6765e76fA2e69532d808F2fe27E3';
let instance = '0x47421Bc53bc81bB4d5201343578fc75905C308B5';

const main = async () => {
  let slot = 2;
  let index = 1;

  let newKey = web3.utils.hexToNumberString(
    web3.utils.keccak256(
      web3.eth.abi.encodeParameters(['address', 'uint256'], [instance, slot])
    )
  );

  let bigNumberFromKey = web3.utils.toBN(newKey).add(web3.utils.toBN(index));

  let storage = await web3.eth.getStorageAt(
    ETHERNAUT_CONTRACT,
    web3.utils.toHex(bigNumberFromKey)
  );
  console.log(storage);

  let isCompleted = storage.slice(2, 26);
  let level = '0x' + storage.slice(26, 66);

  console.log('Completed: ', isCompleted.at(-1) === '1' ? 'True' : 'False');
  console.log('Level: ', level);
};

main();
