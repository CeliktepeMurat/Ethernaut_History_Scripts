import dotenv from 'dotenv';
import { ethers } from 'ethers';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import {
  getImpersonatedSigner,
  loadFetchedData,
  reportGas,
} from '../../utils/utils';
import { INSTANCE, PLAYER_METRICS } from '../../utils/interface';
import { OWNER, PROXY_STAT } from '../../utils/constant';
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

const main = async () => {
  const impersonatedSigner = await getImpersonatedSigner(OWNER);

  const statistics = new ethers.Contract(
    PROXY_STAT,
    STATISTICS_ABI,
    impersonatedSigner
  );

  fillPlayerStat(); // fill the arrays with data

  await updatePlayerStatsData(statistics);
  await updateNoOfLevelsCompletedByPlayers(statistics);
};

const updatePlayerStatsData = async (statistics: any) => {
  const start = 110;
  const end = 120;
  const txn = await statistics.updatePlayerStatsData(
    players.slice(start, end),
    levels.slice(start, end),
    instances.slice(start, end),
    isCompleted.slice(start, end),
    timeCompleted.slice(start, end),
    timeCreated.slice(start, end),
    totalSubmission.slice(start, end),
    levelFirstCompletedTime.slice(start, end),
    levelFirstInstanceCreationTime.slice(start, end)
  );
  let receivedTxn = await txn.wait();
  reportGas(receivedTxn);
};

const fillPlayerStat = () => {
  let player_metrics = Object.keys(playerMetrics);
  let level_metrics = Object.values(playerMetrics);

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

const updateNoOfLevelsCompletedByPlayers = async (statistics: any) => {
  const allData = loadFetchedData(PLAYER_METRICS_PATH).player_metrics;
  const allPlayers = Object.keys(allData);
  const levelsSolvedByPlayers = [];
  for (let player of allPlayers) {
    const levelsSolvedByPlayer = getLevelsSolvedByAPlayer(allData[player]);
    levelsSolvedByPlayers.push(levelsSolvedByPlayer);
  }
  const start = 50
  const end = 60
  const txn = await statistics.updateLevelsCompletedByPlayers(
    allPlayers.slice(start, end),
    levelsSolvedByPlayers.slice(start,end)
  );
  const receivedTxn = await txn.wait();
  reportGas(receivedTxn)
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

main();
