import STATISTICS_ABI from '../../artifacts/contracts/Statistics_Fix.sol/Statistics_Fix.json';
import { getGasPrice, getImpersonatedSigner, getWeb3 } from '../../utils/utils';
import { ethers } from 'ethers';
import { OWNER, PROXY_STAT } from '../../utils/constants';
import fs from 'fs';
import { fixNoOfLevelsCompletedForPlayers } from '../writeScripts/03_completed_levels_fix';
const web3 = getWeb3();

let impersonatedSigner: any, statistics: any, props: any;

const TOTAL_NO_OF_PLAYERS = 1891;
const SMALL_BATCH = 10; 
const STATUS_DIRECTORY = './data/Goerli/status.json';

async function runFunctions() {
  if (!isFinished('fixNoOfLevelsCompletedForPlayers')) {
    const start = getStart('fixNoOfLevelsCompletedForPlayers');
    await runFunctionInBatches(
      fixNoOfLevelsCompletedForPlayers,
      'fixNoOfLevelsCompletedForPlayers',
      TOTAL_NO_OF_PLAYERS,
      start,
      SMALL_BATCH
    );
    saveFinishedStatus('fixNoOfLevelsCompletedForPlayers');
  }
}

const isFinished = (fnName: string) => {
  const status = JSON.parse(fs.readFileSync(STATUS_DIRECTORY).toString());
  if (!status[fnName].isFinished) {
    console.log(`Running ${fnName}`);
  }
  return status[fnName].isFinished;
};

const saveFinishedStatus = (fnName: string, txInfo?: any) => {
  const status = JSON.parse(fs.readFileSync(STATUS_DIRECTORY).toString());
  status[fnName].isFinished = true;
  status[fnName] = getUpdatedFnInfo(txInfo, status[fnName]);
  fs.writeFileSync(STATUS_DIRECTORY, JSON.stringify(status, null, 2));
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
  const status = JSON.parse(fs.readFileSync(STATUS_DIRECTORY).toString());
  status[fnName].start = start;
  status[fnName] = getUpdatedFnInfo(txData, status[fnName]);
  fs.writeFileSync(STATUS_DIRECTORY, JSON.stringify(status, null, 2));
};

const getStart = (fnName: string) => {
  const status = JSON.parse(fs.readFileSync(STATUS_DIRECTORY).toString());
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
      const tx = await fn(statistics, props, start, total);
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
    const tx = await fn(statistics, props, start, end);
    console.log(tx.hash);
    saveStartStatus(fnName, end, {
      start,
      end,
      txHash: tx.hash,
    });
    const receivedTxn= await tx.wait();
    console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
    console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
    console.log('');
    start = end;
  }
};

const initiate = async () => {
  impersonatedSigner = await getImpersonatedSigner(OWNER);

  statistics = new ethers.Contract(
    PROXY_STAT,
    STATISTICS_ABI.abi,
    impersonatedSigner
  );

  props = {
    gasPrice: await getGasPrice(web3),
  };
};

async function run() {
  await initiate();
  await runFunctions();
}

run();
