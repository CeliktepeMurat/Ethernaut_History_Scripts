import { loadFetchedData, web3 } from '../../utils/utils';
import dotenv from 'dotenv';
import fs from 'fs';
import { FETCH_DATA, EVENT_TYPE_SIG } from '../../utils/interface';
import * as constants from '../../utils/constants';
dotenv.config();

let ALL_DATA_PATH = `./data/${constants.ACTIVE_NETWORK.name}/all_data.json`;

const ETHERNAUT_CONTRACT = process.env.ETHERNAUT_CONTRACT as string;
let GAME_DATA: FETCH_DATA[] = [];

const getData = async () => {
  // The block interval should be max 10000 blocks - because of infura rate limit
  // For each time, script will fetch up to 10000 logs
  let logs = await web3.eth.getPastLogs({
    address: ETHERNAUT_CONTRACT,
    fromBlock: constants.ACTIVE_NETWORK.from,
    toBlock: constants.ACTIVE_NETWORK.to,
  });

  for (const log of logs) {
    try {
      console.log(`Fetching transaction -> ${log.transactionHash}`);

      let txn = await getTxn(log.transactionHash);
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
        instance:
          log.topics[0] === EVENT_TYPE_SIG.create_instance
            ? decodeParam('address', log.data).toString()
            : decodeParam('address', input_data).toString(),
        level:
          log.topics[0] === EVENT_TYPE_SIG.create_instance
            ? decodeParam('address', input_data).toString()
            : decodeParam('address', log.data).toString(),
      };
      GAME_DATA.push(data);
    } catch (error) {
      console.log(error);
    }

    if (GAME_DATA.length === 100) {
      storeData(ALL_DATA_PATH, GAME_DATA);
      GAME_DATA = [];
    }
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

const storeData = (path: string, new_data: FETCH_DATA[]) => {
  const old_data =
    loadFetchedData(ALL_DATA_PATH).length > 0
      ? loadFetchedData(ALL_DATA_PATH)
      : [];

  const json = [...old_data, ...new_data];

  fs.writeFileSync(path, JSON.stringify(json, null, 2));
};

getData();
