import dotenv from 'dotenv';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { getImpersonatedSigner, loadFetchedData, reportGas } from '../../utils/utils';
import { ethers } from 'ethers';
import { PLAYER_METRICS, PLAYER_STAT } from '../../utils/interface';
import { OWNER, PROXY_STAT } from '../../utils/constant';
import { batchAndRun } from '../runner/batchAndRun';
dotenv.config();

const PLAYER_METRICS_PATH = `./data/player_metrics.json`;
const PLAYER_STAT_PATH = `./data/player_stat.json`;

let players: string[] = [];
let noOfAdditionalInstancesCreatedByPlayer: number[] = [];
let noOfAdditionalInstancesCompletedByPlayer: number[] = [];

const main = async () => {
  const impersonatedSigner = await getImpersonatedSigner(OWNER);

  const statistics = new ethers.Contract(
    PROXY_STAT,
    STATISTICS_ABI,
    impersonatedSigner
  );

  // 1891
  getNumberOfInstances(); // Get the number of instances created and solved by each player
  await batchAndRun(updateAllPlayersGlobalData(statistics), 200, 1891);
};

const updateAllPlayersGlobalData = (statistics: any) => async (start: number, end: number) => { 
  console.log('start', start);
  console.log('end', end);
  const txn = await statistics.updateAllPlayersGlobalData(
    players.slice(start, end),
    noOfAdditionalInstancesCreatedByPlayer.slice(start, end),
    noOfAdditionalInstancesCompletedByPlayer.slice(start, end)
  );
  let receivedTxn = await txn.wait();
  reportGas(receivedTxn)
}

const getNumberOfInstances = () => {
  const player_stats: PLAYER_STAT =
    loadFetchedData(PLAYER_STAT_PATH).player_stat;
  players = Object.keys(player_stats);
  for (const player in player_stats) {
    noOfAdditionalInstancesCreatedByPlayer.push(
      player_stats[player].created_instances
    );
    noOfAdditionalInstancesCompletedByPlayer.push(
      player_stats[player].solved_instances
    );
  }
};

main();
