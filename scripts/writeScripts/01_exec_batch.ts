import dotenv from 'dotenv';
import { getGasPrice, loadFetchedData } from '../../utils/utils';
import { Contract } from 'ethers';
import { PLAYER_STAT } from '../../utils/interface';
import Web3 from 'web3';
dotenv.config();

const PLAYER_STAT_PATH = `./data/player_stat.json`;

let players: string[] = [];
let noOfAdditionalInstancesCreatedByPlayer: number[] = [];
let noOfAdditionalInstancesCompletedByPlayer: number[] = [];

export const updateAllPlayersGlobalData = async (
  statistics: Contract,
  web3: Web3,
  start: number,
  end: number
) => {
  const props = {
    gasPrice: await getGasPrice(web3),
  };

  const tx = await statistics.updateAllPlayersGlobalData(
    players.slice(start, end),
    noOfAdditionalInstancesCreatedByPlayer.slice(start, end),
    noOfAdditionalInstancesCompletedByPlayer.slice(start, end),
    props
  );
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
