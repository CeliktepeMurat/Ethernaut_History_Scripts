import dotenv from 'dotenv';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { loadFetchedData } from '../../utils/utils';
import { ethers } from 'ethers';
import { PLAYER_METRICS, PLAYER_STAT } from '../../utils/interface';
import _levelMapping from "../../data/levelMapping.json";

const levelMapping: any = _levelMapping;

dotenv.config();

const PLAYER_METRICS_PATH = `./data/player_metrics.json`;
const PLAYER_STAT_PATH = `./data/player_stat.json`;

const PROVIDER = ethers.providers.getDefaultProvider('http://localhost:8545');
const SIGNER = new ethers.Wallet(process.env.PRIV_KEY as string, PROVIDER);

const PROXY_STAT = '0x7ae0655F0Ee1e7752D7C62493CEa1E69A810e2ed';
const statistics = new ethers.Contract(PROXY_STAT, STATISTICS_ABI, SIGNER);

let players: string[] = [];
let noOfAdditionalInstancesCreatedByPlayer: number[] = [];
let noOfAdditionalInstancesCompletedByPlayer: number[] = [];
let noOfAdditionalLevelsCompletedByPlayer: number[] = [];

const main = async () => {
  updateNoOfLevelsCompletedByPlayers()
  return;
  getNumberOfLevelsCompletedByPlayer(); // Get the number of levels completed by each player
  getNumberOfInstances(); // Get the number of instances created and solved by each player

  const limit = 100;
  const MAX = players.length;

  const txn = await statistics.updateAllPlayerData(
    players.slice(0, limit),
    noOfAdditionalInstancesCreatedByPlayer.slice(0, limit),
    noOfAdditionalInstancesCompletedByPlayer.slice(0, limit),
    noOfAdditionalLevelsCompletedByPlayer.slice(0, limit)
  );

  console.log(await txn.wait());
  let receivedTxn = await txn.wait();
  console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
  console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
};

const getNumberOfInstances = () => {
  const player_stats: PLAYER_STAT =
    loadFetchedData(PLAYER_STAT_PATH).player_stat;

  for (const player in player_stats) {
    noOfAdditionalInstancesCreatedByPlayer.push(
      player_stats[player].created_instances
    );
    noOfAdditionalInstancesCompletedByPlayer.push(
      player_stats[player].solved_instances
    );
  }
};

const updateNoOfLevelsCompletedByPlayers = async () => { 
  const allData = loadFetchedData(PLAYER_METRICS_PATH).player_metrics
  const allPlayers = Object.keys(allData);
  const levelsSolvedByPlayers = []
  for (let player of allPlayers) {
    const levelsSolvedByPlayer = getLevelsSolvedByAPlayer(allData[player])
    levelsSolvedByPlayers.push(levelsSolvedByPlayer)
  }
  const txn = await statistics.updateLevelsCompletedByPlayers(
    allPlayers.slice(0,10),
    levelsSolvedByPlayers.slice(0,10)
  )
  await txn.wait()
  console.log("Finished")
}

const getLevelsSolvedByAPlayer = (levelsCreatedByPlayer:string[]) => { 
  const levelAddresses = Object.keys(levelsCreatedByPlayer)
  const levelsSolvedByPlayer = []
  let levelAddress: any;
  for (levelAddress of levelAddresses) { 
    const instancesSolvedByPlayer = levelsCreatedByPlayer[levelAddress]
    if (isAnyInstanceSolvedByPlayer(instancesSolvedByPlayer)) { 
      if (!levelMapping[levelAddress]) { 
        throw Error("Level address not found in levelMapping.json")
      }
      levelsSolvedByPlayer.push(levelMapping[levelAddress])
    }
  }
  return levelsSolvedByPlayer;
}

function isAnyInstanceSolvedByPlayer(instances: any) {
  for (const instance of instances) {
    if (instance.isCompleted) {
      return true;
    }
  }
  return false;
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
