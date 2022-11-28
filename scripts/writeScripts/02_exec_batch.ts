import dotenv from 'dotenv';
import { ethers } from 'ethers';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { getImpersonatedSigner, loadFetchedData, reportGas } from '../../utils/utils';
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
let noOfAdditionalLevelsCompletedByPlayer: number[] = [];

const main = async () => {
  const impersonatedSigner = await getImpersonatedSigner(OWNER);

  const statistics = new ethers.Contract(
    PROXY_STAT,
    STATISTICS_ABI,
    impersonatedSigner
  );

  fillPlayerStat(); // fill the arrays with data
  getNumberOfLevelsCompletedByPlayer()

  await updatePlayerStatsData(statistics);
  await updateNumberOfLevelsCompletedByPlayer(statistics);
};

const updatePlayerStatsData = async (statistics: any) => { 
    const limit = 10;
    const MAX = players.length;
    const txn = await statistics.updatePlayerStatsData(
    players.slice(0, limit),
    levels.slice(0, limit),
    instances.slice(0, limit),
    isCompleted.slice(0, limit),
    timeCompleted.slice(0, limit),
    timeCreated.slice(0, limit),
    totalSubmission.slice(0, limit),
    levelFirstCompletedTime.slice(0, limit),
    levelFirstInstanceCreationTime.slice(0, limit)
  );
  let receivedTxn = await txn.wait();
  reportGas(receivedTxn);
}

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

const updateNumberOfLevelsCompletedByPlayer = async (statistics: any) => { 
  const txn = await statistics.updateLevelsCompletedByPlayers(
    players,
    noOfAdditionalLevelsCompletedByPlayer
  )
  let receivedTxn = await txn.wait();
  reportGas(receivedTxn);
}

const getNumberOfLevelsCompletedByPlayer = () => {
  const player_metrics: PLAYER_METRICS =
    loadFetchedData(PLAYER_METRICS_PATH).player_metrics;

  for (let player in player_metrics) {
    let numberOfLevelsCompleted = 0;

    for (const level in player_metrics[player]) {
      for (const instance of player_metrics[player][level]) {
        if (instance.isCompleted) {
          numberOfLevelsCompleted++;
          break;
        }
      }
    }
    noOfAdditionalLevelsCompletedByPlayer.push(numberOfLevelsCompleted);
    players.push(player);
  }
};


main();
