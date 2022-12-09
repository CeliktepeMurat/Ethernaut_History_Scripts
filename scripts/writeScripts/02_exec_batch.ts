import dotenv from 'dotenv';
import { Contract } from 'ethers';
import { getGasPrice, loadFetchedData } from '../../utils/utils';
import { INSTANCE, PLAYER_METRICS } from '../../utils/interface';
import Web3 from 'web3';
import { ACTIVE_NETWORK } from "../../utils/constants"
dotenv.config();

const DATA_PATH = `data/${ACTIVE_NETWORK.name}`
const PLAYER_METRICS_PATH = `${DATA_PATH}/player_metrics.json`;
const playerMetrics: PLAYER_METRICS =
  loadFetchedData(PLAYER_METRICS_PATH).player_metrics;

// PARAMS
let players: string[] = [];
let levels: string[][] = [];
let instances: any[][] = [];
let isCompleted: boolean[][] = [];
let timeCompleted: number[][] = [];
let timeCreated: number[][] = [];
let totalSubmission: number[][][] = [];
let levelFirstCompletedTime: number[][] = [];
let levelFirstInstanceCreationTime: number[][] = [];
let allData: any;
let allPlayers: any;

export const updatePlayerStatsData = async (
  statistics: Contract,
  web3: Web3,
  start: number,
  end: number
) => {
  const props = {
    gasPrice: await getGasPrice(web3),
  };
  // console.log(`players`)
  // console.log(players.slice(start, end))
  // console.log('levels')
  // console.log(levels.slice(start, end))
  let dataFromContract = await statistics.getSubmittedTimeForAllPlayersAndLevels(
    players.slice(start, end),
    levels.slice(start, end)
  )
  // console.log("From contract")
  // console.log(dataFromContract)
  const correctedData = parseData(dataFromContract, totalSubmission.slice(start, end))
  // console.log("From data")
  // console.log(totalSubmission.slice(start, end))
  // console.log("Corrected")
  // console.log(correctedData)
  const tx = await statistics.updatePlayerStatsData(
    players.slice(start, end),
    levels.slice(start, end),
    correctedData,
    props
  );
  return tx;
};

const parseData = (dataFromContract: any, historicalData:any) => { 
  for (let i = 0; i < dataFromContract.length; i++) { 
    for (let j = 0; j < dataFromContract[i].length; j++) { 
      historicalData[i][j] = combine(
        dataFromContract[i][j],
        historicalData[i][j]
      )
    }
  }
  return historicalData
}

const combine = (dataFromContract: any, historicalData: any) => { 
  const dataFromContractConverted = dataFromContract.map((i: any) => i.toNumber()).filter(Boolean)
  const combinedData = new Set([...historicalData, ...dataFromContractConverted]) 
  console.log("Historical")
  console.log(historicalData)
  console.log("From contract")
  console.log(dataFromContractConverted)
  console.log("Combined")
  console.log(combinedData)
  return Array.from(combinedData).sort()
}

const fillPlayerStat = () => {
  let player_metrics = Object.keys(playerMetrics);
  let level_metrics = Object.values(playerMetrics);
  allData = loadFetchedData(PLAYER_METRICS_PATH).player_metrics;
  allPlayers = Object.keys(allData);

  for (let i = 0; i < player_metrics.length; i++) {
    players.push(player_metrics[i]);
    for (let j = 0; j < level_metrics.length; j++) {
      let levelArray = Object.keys(level_metrics[j]);
      let instanceArray = Object.values(level_metrics[j]);
      levels[j] = levelArray;

      for (let k = 0; k < instanceArray.length; k++) {
        let count = 0;
        levelFirstCompletedTime[j] = levelFirstCompletedTime[j] || [];
        levelFirstInstanceCreationTime[j] =
          levelFirstInstanceCreationTime[j] || [];

        instanceArray[k].forEach((instance: INSTANCE) => {
          instances[j] = instances[j] || [];
          isCompleted[j] = isCompleted[j] || [];
          timeCompleted[j] = timeCompleted[j] || [];
          timeCreated[j] = timeCreated[j] || [];
          totalSubmission[j] = totalSubmission[j] || [];
          totalSubmission[j][k] = totalSubmission[j][k] || [];

          instances[j][k] = instance.instance;
          isCompleted[j][k] = instance.isCompleted;
          timeCompleted[j][k] = instance.timeCompleted;
          timeCreated[j][k] = instance.timeCreated;
          totalSubmission[j][k][count] = instance.timeCompleted;
          count++;
        });

        instanceArray[k].find((instance: INSTANCE) => {
          if (instance.isCompleted) {
            levelFirstCompletedTime[j][k] = instance.timeCompleted;
            return true;
          } else levelFirstCompletedTime[j][k] = 0;
        });

        levelFirstInstanceCreationTime[j][k] = instanceArray[k][0].timeCreated;
      }
    }
  }
  totalSubmission = totalSubmission.map(a=>a.map(b=>b.filter(c=>c!=0)))
};

fillPlayerStat();
