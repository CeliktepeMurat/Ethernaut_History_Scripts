import dotenv from 'dotenv';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { getImpersonatedSigner, loadFetchedData } from '../../utils/utils';
import { ethers } from 'ethers';
import { PLAYER_METRICS, PLAYER_STAT } from '../../utils/interface';
import { OWNER, PROXY_STAT } from '../../utils/constant';
dotenv.config();

const PLAYER_METRICS_PATH = `./data/player_metrics.json`;
const PLAYER_STAT_PATH = `./data/player_stat.json`;

let players: string[] = [];
let noOfAdditionalInstancesCreatedByPlayer: number[] = [];
let noOfAdditionalInstancesCompletedByPlayer: number[] = [];
let noOfAdditionalLevelsCompletedByPlayer: number[] = [];

const main = async () => {
  const impersonatedSigner = await getImpersonatedSigner(OWNER);

  const statistics = new ethers.Contract(
    PROXY_STAT,
    STATISTICS_ABI,
    impersonatedSigner
  );

  getNumberOfLevelsCompletedByPlayer(); // Get the number of levels completed by each player
  getNumberOfInstances(); // Get the number of instances created and solved by each player

  const limit = 500;
  const MAX = players.length;

  const txn = await statistics.updateAllPlayerData(
    players.slice(0, limit),
    noOfAdditionalInstancesCreatedByPlayer.slice(0, limit),
    noOfAdditionalInstancesCompletedByPlayer.slice(0, limit)
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
