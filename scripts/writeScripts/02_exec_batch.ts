import dotenv from 'dotenv';
import { Contract, ethers } from 'ethers';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import {
  getGasPrice,
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

  const props = {
    gasPrice: await getGasPrice(),
  };

  fillPlayerStat(); // fill the arrays with data

  await updatePlayerStatsData(statistics, props);
  // await updateNoOfLevelsCompletedByPlayers(statistics, props);
};

const updatePlayerStatsData = async (
  statistics: Contract,
  props: { gasPrice: string }
) => {
  const players1 = players;
  const ALL_PLAYERS_PATH = `./data/all_player_list.json`;
  const players2 = loadFetchedData(ALL_PLAYERS_PATH).players;

  const players1ToWriteToFile = JSON.stringify(getIndexedArrayAsJSON(players1))
  const players2ToWriteToFile = JSON.stringify(getIndexedArrayAsJSON(players2))

  for (let i = 0; i < players2.length; i++) { 
    if (players1[i] !== players2[i]) { 
      console.log(i)
      console.log("players1[i] !== players2[i]", players1[i], players2[i])
      break;
    }
  }

  const fs = require('fs');
  fs.writeFileSync('./data/players1.json', players1ToWriteToFile);
  fs.writeFileSync('./data/players2.json', players2ToWriteToFile);

};

const getIndexedArrayAsJSON = (array: any[]) => { 
  const indexedArray:any = {};
  for (let i = 0; i < array.length; i++) {
    indexedArray[i] = array[i];
  }
  return indexedArray;
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

const updateNoOfLevelsCompletedByPlayers = async (
  statistics: Contract,
  props: { gasPrice: string }
) => {
  const allData = loadFetchedData(PLAYER_METRICS_PATH).player_metrics;
  const allPlayers = Object.keys(allData);
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

main();
