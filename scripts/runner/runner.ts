import STATISTICS_ABI from '../../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import { getImpersonatedSigner, getWeb3 } from '../../utils/utils';
import { ethers } from 'ethers';
import {
  saveGlobalNumbers,
  saveLevelsData,
  savePlayers,
} from '../writeScripts/00_exec_batch';
import { updateAllPlayersGlobalData } from '../writeScripts/01_exec_batch';
import {
  updatePlayerStatsData,
} from '../writeScripts/02_exec_batch';
import * as constants from '../../utils/constants';
import fs from 'fs';
import { ACTIVE_NETWORK } from '../../utils/constants';
import { loadFetchedData } from '../../utils/utils';

const web3 = getWeb3();
let impersonatedSigner: any, statistics: any;

const DATA_PATH = `./data/${ACTIVE_NETWORK.name}`
const ALL_PLAYERS_PATH = `${DATA_PATH}/all_player_list.json`;
const players = loadFetchedData(ALL_PLAYERS_PATH).players;
console.log(`Total no of players: ${players.length}`)
const TOTAL_NO_OF_PLAYERS = players.length;
const BIG_BATCH = 100;
const SMALL_BATCH = 10;
const STATUS_FILE_PATH = `${DATA_PATH}/status.json`

async function runFunctions() {
  if (!isFinished('updatePlayerStatsData')) {
    const start = getStart('updatePlayerStatsData');
    await runFunctionInBatches(
      updatePlayerStatsData,
      'updatePlayerStatsData',
      TOTAL_NO_OF_PLAYERS,
      start,
      SMALL_BATCH
    );
    saveFinishedStatus('updatePlayerStatsData');
  }
}

const isFinished = (fnName: string) => {
  const status = JSON.parse(fs.readFileSync(STATUS_FILE_PATH).toString());
  if (!status[fnName].isFinished) {
    console.log(`Running ${fnName}`);
  }
  return status[fnName].isFinished;
};

const saveFinishedStatus = (fnName: string, txInfo?: any) => {
  const status = JSON.parse(fs.readFileSync(STATUS_FILE_PATH).toString());
  status[fnName].isFinished = true;
  status[fnName] = getUpdatedFnInfo(txInfo, status[fnName]);
  fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(status, null, 2));
};

const getUpdatedFnInfo = (txInfo: any, fnStatus: any) => {
  if (txInfo) {
    if (typeof txInfo === 'string') {
      fnStatus.txInfo = txInfo;
    } else {
      const currentInfo = fnStatus.txInfo;
      currentInfo.push(txInfo);
    }
  }
  return fnStatus;
};

const saveStartStatus = (fnName: string, start: number, txData: any) => {
  const status = JSON.parse(fs.readFileSync(STATUS_FILE_PATH).toString());
  status[fnName].start = start;
  status[fnName] = getUpdatedFnInfo(txData, status[fnName]);
  fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(status, null, 2));
};

const getStart = (fnName: string) => {
  const status = JSON.parse(fs.readFileSync(STATUS_FILE_PATH).toString());
  return status[fnName].start;
};

const runFunctionInBatches = async (
  fn: Function,
  fnName: string,
  total: number,
  start: number,
  batchSize: number
) => {
  while (start < total) {
    const end = start + batchSize;
    if (end > total) {
      console.log(`Running from ${start} to ${total}`);
      const tx = await fn(statistics, web3, start, total);
      console.log(tx.hash);
      saveFinishedStatus(fnName, {
        start,
        total,
        txHash: tx.hash,
      });
      const receivedTxn = await tx.wait();
      console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
      console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
      return;
    }
    console.log(`Running from ${start} to ${end}`);
    const tx = await fn(statistics, web3, start, end);
    console.log(tx.hash);
    saveStartStatus(fnName, end, {
      start,
      end,
      txHash: tx.hash,
    });
    const receivedTxn = await tx.wait();
    console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
    console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
    start = end;
  }
};

const initiate = async () => {
  let from = constants.SIGNERS[constants.ACTIVE_NETWORK.name];
  if (!from) from = (await web3.eth.getAccounts())[0];
  impersonatedSigner = await getImpersonatedSigner(from);
  console.log('FROM: ', from);

  const PROXY = constants.PROXY_STATs[constants.ACTIVE_NETWORK.name];
  console.log('PROXY: ', PROXY);

  statistics = new ethers.Contract(
    PROXY,
    STATISTICS_ABI.abi,
    impersonatedSigner
  );
};

async function run() {
  await initiate();
  await runFunctions();
}

run();
