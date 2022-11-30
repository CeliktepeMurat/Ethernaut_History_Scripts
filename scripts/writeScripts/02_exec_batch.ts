import dotenv from 'dotenv';
import { Contract } from 'ethers';
import {
  loadFetchedData,
  reportGas,
} from '../../utils/utils';
import { INSTANCE, PLAYER_METRICS } from '../../utils/interface';
dotenv.config();

const PLAYER_METRICS_PATH = `./data/player_metrics.json`;
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
let allData:any;
let allPlayers:any;

export const updatePlayerStatsData = async (
  statistics: Contract,
  props: { gasPrice: string }
) => {
  const limit = 10;
  const txn = await statistics.updatePlayerStatsData(
    players.slice(0, limit),
    levels.slice(0, limit),
    instances.slice(0, limit),
    isCompleted.slice(0, limit),
    timeCompleted.slice(0, limit),
    timeCreated.slice(0, limit),
    totalSubmission.slice(0, limit),
    levelFirstCompletedTime.slice(0, limit),
    levelFirstInstanceCreationTime.slice(0, limit),
    props
  );
  let receivedTxn = await txn.wait();
  reportGas(receivedTxn);
};

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
};

export const updateNoOfLevelsCompletedByPlayers = async (
  statistics: Contract,
  props: { gasPrice: string }
) => {
  const levelsSolvedByPlayers = [];
  for (let player of allPlayers) {
    const levelsSolvedByPlayer = getLevelsSolvedByAPlayer(allData[player]);
    levelsSolvedByPlayers.push(levelsSolvedByPlayer);
  }
  const txn = await statistics.updateLevelsCompletedByPlayers(
    allPlayers.slice(0, 10),
    levelsSolvedByPlayers.slice(0, 10),
    props
  );
  await txn.wait();
};

const getLevelsSolvedByAPlayer = (levelsCreatedByPlayer: string[]) => {
  const levelAddresses = Object.keys(levelsCreatedByPlayer);
  const levelsSolvedByPlayer = [];
  let levelAddress: any;
  for (levelAddress of levelAddresses) {
    const instancesSolvedByPlayer = levelsCreatedByPlayer[levelAddress];
    if (isAnyInstanceSolvedByPlayer(instancesSolvedByPlayer)) {
      levelsSolvedByPlayer.push(levelAddress);
    }
  }
  return levelsSolvedByPlayer;
};

function isAnyInstanceSolvedByPlayer(instances: any) {
  for (const instance of instances) {
    if (instance.isCompleted) {
      return true;
    }
  }
  return false;
}

fillPlayerStat();
