import dotenv from 'dotenv';
import { getGasPrice, loadFetchedData } from '../../utils/utils';
import { Contract } from 'ethers';
import { PLAYER_STAT } from '../../utils/interface';
import Web3 from 'web3';
import { ACTIVE_NETWORK } from '../../utils/constants';

dotenv.config();

const DATA_PATH = `data/${ACTIVE_NETWORK.name}`;
const PLAYER_STAT_PATH = `${DATA_PATH}/player_stat.json`;

let players: string[] = [];
let noOfAdditionalInstancesCreatedByPlayer: number[] = [];
let noOfAdditionalInstancesCompletedByPlayer: number[] = [];

export const updateAllPlayersGlobalData = async (
  statistics: Contract,
  web3: Web3,
  start: number,
  end: number,
  player_stats_opt?: any
) => {
  let tx;

  const props = {
    gasPrice: await getGasPrice(web3),
  };

  player_stats_opt // for testing purpose
    ? (tx = await statistics.updateAllPlayersGlobalData(
        player_stats_opt[0],
        player_stats_opt[1],
        player_stats_opt[2],
        props
      ))
    : (tx = await statistics.updateAllPlayersGlobalData(
        players.slice(start, end),
        noOfAdditionalInstancesCreatedByPlayer.slice(start, end),
        noOfAdditionalInstancesCompletedByPlayer.slice(start, end),
        props
      ));

  return tx;
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

getNumberOfInstances();
