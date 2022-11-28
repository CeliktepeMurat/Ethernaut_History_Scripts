import dotenv from 'dotenv';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import {
  getImpersonatedSigner,
  loadFetchedData,
  reportGas,
} from '../../utils/utils';
import { ethers } from 'ethers';
import { PLAYER_STAT } from '../../utils/interface';
import { OWNER, PROXY_STAT } from '../../utils/constant';
dotenv.config();

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

  getNumberOfInstances(); // Get the number of instances created and solved by each player

  await updateAllPlayersGlobalData(statistics);
};

const updateAllPlayersGlobalData = async (statistics: any) => {
  const limit = 500;
  const MAX = players.length;

  const txn = await statistics.updateAllPlayersGlobalData(
    players.slice(0, limit),
    noOfAdditionalInstancesCreatedByPlayer.slice(0, limit),
    noOfAdditionalInstancesCompletedByPlayer.slice(0, limit)
  );
  let receivedTxn = await txn.wait();
  reportGas(receivedTxn);
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
    players.push(player);
  }
};

main();
