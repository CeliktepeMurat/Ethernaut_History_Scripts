import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import {
  getGasPrice,
  getImpersonatedSigner,
} from '../../utils/utils';
import { ethers } from 'ethers';
import { OWNER, PROXY_STAT } from '../../utils/constant';
import { saveGlobalNumbers, saveLevelsData, savePlayers } from '../writeScripts/00_exec_batch';
const fs = require('fs');

// saveGlobalNumber
// saveLevelsData
// savePlayers - batch
// updateAllPlayersGlobalData - batch
// updatePlayerStatsData - batch
// updateNoOfLevelsCompleted - batch

let impersonatedSigner:any, statistics:any, props:any;

async function runFunctions() { 
    if (!isFinished('saveGlobalNumber')) { 
        await saveGlobalNumbers(statistics, props);
        saveFinishedStatus('saveGlobalNumber');
    }

    if (!isFinished('saveLevelsData')) { 
        await saveLevelsData(statistics, props);
        saveFinishedStatus('saveLevelsData');
    }

    if (!isFinished('savePlayers')) { 
        const start = getStart('savePlayers');
        await runFunctionInBatches(savePlayers, "savePlayers", 1891, start, 100);
        saveFinishedStatus('savePlayers');
    }
}

const isFinished = (fnName:string) => { 
    const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
    if (!status[fnName].isFinished) { 
        console.log(`Running ${fnName}`)
    }
    return status[fnName].isFinished;
}

const saveFinishedStatus = (fnName: string) => {
    const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
    status[fnName].isFinished = true;
    fs.writeFileSync(`./data/status.json`, JSON.stringify(status, null, 2));
}

const saveStartStatus = (fnName:string, start:number) => { 
    const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
    status[fnName].start = start;
    fs.writeFileSync(`./data/status.json`, JSON.stringify(status, null, 2));
}

const getStart = (fnName: string) => { 
    const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
    return status[fnName].start;
}

const runFunctionInBatches = async (fn: Function, fnName:string, total: number, start:number, batchSize: number) => { 
    while (start < total) { 
        console.log(`Running from ${start} to ${start + batchSize}`);
        const end = start + batchSize;
        if (end > total) { 
            await fn(statistics, props, start, total);
            saveFinishedStatus(fnName);
            break;
        }
        await fn(statistics, props, start, end);
        saveStartStatus(fnName, end);
        start = end;
    }
}

const initiate = async () => { 
    impersonatedSigner = await getImpersonatedSigner(OWNER);

    statistics = new ethers.Contract(
        PROXY_STAT,
        STATISTICS_ABI,
        impersonatedSigner
    );

    props = {
        gasPrice: await getGasPrice(),
    };
}

async function run() { 
    await initiate();
    await runFunctions();
}

run()