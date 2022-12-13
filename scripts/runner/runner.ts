import STATISTICS_ABI from '../../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import { getImpersonatedSigner } from '../../utils/utils';
import { ethers } from 'ethers';
import * as constants from '../../utils/constants';
import fs from 'fs';
import { ACTIVE_NETWORK } from '../../utils/constants';
import { loadFetchedData } from '../../utils/utils';
import { upgradeProxy } from '../../tests/helpers/upgrade';
import { rollbackProxy } from '../../tests/helpers/rollback';
import { fixLevels } from '../writeScripts/03_fix_levels';

let impersonatedSigner: any, statistics: any;

const DATA_PATH = `./data/${ACTIVE_NETWORK.name}`;
const STATUS_FILE_PATH = `${DATA_PATH}/status.json`;

async function runFunctions() {
  // for hardhat and local network
  if (constants.ACTIVE_NETWORK.name === 'local' || constants.IsForked) {
    await upgradeProxy();
  }

  if (!isFinished('fixLevels')) {
    const tx = await fixLevels(statistics, [2,3])
    // await tx.wait();
    // console.log("Updated")
  }

  // for hardhat and local network
  if (constants.ACTIVE_NETWORK.name === 'local' || constants.IsForked) {
    await rollbackProxy();
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
      const tx = await fn(statistics, start, total);
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
    const tx = await fn(statistics, start, end);
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
  //if (!from) from = (await web3.eth.getAccounts())[0];
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
