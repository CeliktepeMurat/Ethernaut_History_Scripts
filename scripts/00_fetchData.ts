import Web3 from 'web3';
import dotenv from 'dotenv';
import fs from 'fs';
import { FETCH_DATA, EVENT_TYPE_SIG } from '../utils/interface';
dotenv.config();

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://goerli.infura.io/v3/' + process.env.INFURA_KEY
  )
);
const ALL_DATA_PATH = `./data/all_data.json`;

const ETHERNAUT_CONTRACT = '0x42E7014a9D1f6765e76fA2e69532d808F2fe27E3';
let GAME_DATA: FETCH_DATA[] = [];

const getData = async () => {
  let logs = await web3.eth.getPastLogs({
    address: ETHERNAUT_CONTRACT,
    fromBlock: 7722692,
    toBlock: 7822692,
  });

  for (const log of logs.slice(0, 100)) {
    console.log(`Fetching transaction -> ${log.transactionHash}`);

    let txn = await getTxn(log.transactionHash);
    let txnReceipt = await getTransactionReceipt(log.transactionHash);
    let block = await getBlock(txn.blockNumber as number);

    let input_data = '0x' + txn.input.slice(10); // remove method signature

    let data = {
      event:
        log.topics[0] === EVENT_TYPE_SIG.create_instance
          ? 'create_instance'
          : 'solve_instance',
      transactionHash: String(txn.hash),
      blockNumber: Number(txn.blockNumber),
      timeStamp: Number(block.timestamp),
      player: String(txn.from),
      instance: decodeParam('address', log.data).toString(),
      level: decodeParam('address', input_data).toString(),
      status: txnReceipt.status,
    };
    GAME_DATA.push(data);
  }
  storeData(ALL_DATA_PATH, GAME_DATA);
};

const decodeParam = (type: string, param: string) => {
  return web3.eth.abi.decodeParameter(type, param);
};

const getBlock = async (blockNumber: number) => {
  let block = await web3.eth.getBlock(blockNumber);
  return block;
};

const getTxn = async (txnHash: string) => {
  let txn = await web3.eth.getTransaction(txnHash);
  return txn;
};

const getTransactionReceipt = async (txnHash: string) => {
  let txnReceipt = await web3.eth.getTransactionReceipt(txnHash);
  return txnReceipt;
};

const storeData = (path: string, data: FETCH_DATA[]) => {
  let old_data = fs.readFileSync(path);

  let json = JSON.parse(old_data.toString());
  json = [...json, ...data];

  fs.writeFileSync(path, JSON.stringify(json, null, 2));
};

getData();
