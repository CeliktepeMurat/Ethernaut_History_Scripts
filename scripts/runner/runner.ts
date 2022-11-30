import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import {
  getGasPrice,
  getImpersonatedSigner,
} from '../../utils/utils';
import { ethers } from 'ethers';
import { OWNER, PROXY_STAT } from '../../utils/constant';
import { saveGlobalNumbers, saveLevelsData } from '../writeScripts/00_exec_batch';
const fs = require('fs');

// saveGlobalNumber
// saveLevelsData
// savePlayers - batch
// updateAllPlayersGlobalData - batch
// updatePlayerStatsData - batch
// updateNoOfLevelsCompleted - batch

async function run() { 
    const impersonatedSigner = await getImpersonatedSigner(OWNER);

    const statistics = new ethers.Contract(
        PROXY_STAT,
        STATISTICS_ABI,
        impersonatedSigner
    );

    const props = {
        gasPrice: await getGasPrice(),
    };

    if (!isFinished('saveGlobalNumber')) { 
        try {
            console.log("Running saveGlobalNumber");
            await saveGlobalNumbers(statistics, props);
            saveFinishedStatus('saveGlobalNumber');
        } catch(err) {  
            console.log("Error in saveGlobalNumber");
        }
    }

    if (!isFinished('saveLevelsData')) { 
        try {
            console.log("Running saveLevelsData");
            await saveLevelsData(statistics, props);
            saveFinishedStatus('saveLevelsData');
        } catch(err) {  
            console.log("Error in saveLevelsData");
        }
    }
}

const isFinished = (fnName:string) => { 
    const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
    return status[fnName].isFinished;
}

const saveFinishedStatus = (fnName: string) => { 
    const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
    status[fnName].isFinished = true;
    fs.writeFileSync(`./data/status.json`, JSON.stringify(status, null, 2));
}

const getStart = (fnName: string) => { 
    const status = JSON.parse(fs.readFileSync(`./data/status.json`).toString());
    return status[fnName].start;
}
 
run()