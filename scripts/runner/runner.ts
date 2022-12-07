import STATISTICS_ABI from '../../artifacts/contracts/Statistics.sol/Statistics.json';
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
  updateNoOfLevelsCompletedByPlayers,
} from '../writeScripts/02_exec_batch';
import * as constants from '../../utils/constants';
import fs from 'fs';

const web3 = getWeb3();

let impersonatedSigner: any, statistics: any;

const TOTAL_NO_OF_PLAYERS = 1891;
const BIG_BATCH = 100;
const SMALL_BATCH = 10;

async function runFunctions() {
  if (!isFinished('saveGlobalNumber')) {
    const tx = await saveGlobalNumbers(statistics, web3);
    console.log(tx.hash);
    console.log('');
    saveFinishedStatus('saveGlobalNumber', tx.hash);
    await tx.wait();
  }

  if (!isFinished('saveLevelsData')) {
    const tx = await saveLevelsData(statistics, web3);
    console.log(tx.hash);
    console.log('');
    saveFinishedStatus('saveLevelsData', tx.hash);
    await tx.wait();
  }

  if (!isFinished('savePlayers')) {
    const start = getStart('savePlayers');
    await runFunctionInBatches(
      savePlayers,
      'savePlayers',
      TOTAL_NO_OF_PLAYERS,
      start,
      BIG_BATCH
    );
    saveFinishedStatus('savePlayers');
  }

  if (!isFinished('updateAllPlayersGlobalData')) {
    const start = getStart('updateAllPlayersGlobalData');
    await runFunctionInBatches(
      updateAllPlayersGlobalData,
      'updateAllPlayersGlobalData',
      TOTAL_NO_OF_PLAYERS,
      start,
      BIG_BATCH
    );
    saveFinishedStatus('updateAllPlayersGlobalData');
  }

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

  if (!isFinished('updateNoOfLevelsCompletedByPlayers')) {
    const start = getStart('updateNoOfLevelsCompletedByPlayers');
    await runFunctionInBatches(
      updateNoOfLevelsCompletedByPlayers,
      'updateNoOfLevelsCompletedByPlayers',
      TOTAL_NO_OF_PLAYERS,
      start,
      SMALL_BATCH
    );
    saveFinishedStatus('updateNoOfLevelsCompletedByPlayers');
  }
}

const isFinished = (fnName: string) => {
  const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
  if (!status[fnName].isFinished) {
    console.log(`Running ${fnName}`);
  }
  return status[fnName].isFinished;
};

const saveFinishedStatus = (fnName: string, txInfo?: any) => {
  const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
  status[fnName].isFinished = true;
  status[fnName] = getUpdatedFnInfo(txInfo, status[fnName]);
  fs.writeFileSync(`./data/status.json`, JSON.stringify(status, null, 2));
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
  const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
  status[fnName].start = start;
  status[fnName] = getUpdatedFnInfo(txData, status[fnName]);
  fs.writeFileSync(`./data/status.json`, JSON.stringify(status, null, 2));
};

const getStart = (fnName: string) => {
  const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
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
      console.log('');
      saveFinishedStatus(fnName, {
        start,
        total,
        txHash: tx.hash,
      });
      await tx.wait();
      return;
    }
    console.log(`Running from ${start} to ${end}`);
    const tx = await fn(statistics, web3, start, end);
    console.log(tx.hash);
    console.log('');
    saveStartStatus(fnName, end, {
      start,
      end,
      txHash: tx.hash,
    });
    await tx.wait();
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
