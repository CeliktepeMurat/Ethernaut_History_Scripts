import dotenv from 'dotenv';
import { getGasPrice, loadFetchedData } from '../../utils/utils';
import { Contract } from 'ethers';
import { LEVEL_FACTORY_STAT, TOTAL_NUMBERS_STAT } from '../../utils/interface';
import Web3 from 'web3';
import { ACTIVE_NETWORK } from '../../utils/constants';

dotenv.config();

const DATA_PATH = `data/${ACTIVE_NETWORK.name}`;

export const saveGlobalNumbers = async (
  statistics: Contract,
  numbers?: number[]
) => {
  const TOTAL_NUMBERS_PATH = `${DATA_PATH}/total_instance_numbers.json`;
  const total_numbers: TOTAL_NUMBERS_STAT =
    loadFetchedData(TOTAL_NUMBERS_PATH).total_stats;
  let txn;

  const props = {
    gasPrice: await getGasPrice(),
  };

  txn = numbers
    ? await statistics.updateGlobalData(...numbers, props)
    : await statistics.updateGlobalData(
        total_numbers.Total_Number_Of_Instances_Created,
        total_numbers.Total_Number_Of_Instance_Solved,
        props
      );
  return txn;
};

export const savePlayers = async (
  statistics: Contract,
  start: number,
  end: number,
  player_list?: string[]
) => {
  const ALL_PLAYERS_PATH = `${DATA_PATH}/all_player_list.json`;
  const players = loadFetchedData(ALL_PLAYERS_PATH).players;
  let txn;
  const props = {
    gasPrice: await getGasPrice(),
  };

  txn = player_list
    ? await statistics.updatePlayers(player_list, props)
    : await statistics.updatePlayers(players.slice(start, end), props);
  return txn;
};

export const saveLevelsData = async (
  statistics: Contract,
  level_stat_opt?: any
) => {
  const LEVEL_STATS_PATH = `${DATA_PATH}/level_stat.json`;

  let txn;

  const props = {
    gasPrice: await getGasPrice(),
  };

  const level_stats = level_stat_opt
    ? level_stat_opt.level_stats
    : loadFetchedData(LEVEL_STATS_PATH).level_stat;

  const levelAddresses = Object.keys(level_stats);

  const levelAddressesNew = [];
  const noOfCreatedInstances = [];
  const noOfSolvedInstances = [];

  for (let i = 0; i < levelAddresses.length; i++) {
    levelAddressesNew.push(levelAddresses[i]);
    noOfCreatedInstances.push(level_stats[levelAddresses[i]].created_instances);
    noOfSolvedInstances.push(level_stats[levelAddresses[i]].solved_instances);
  }

  txn = await statistics.updateAllLevelData(
    levelAddressesNew,
    noOfCreatedInstances,
    noOfSolvedInstances,
    props
  );

  return txn;
};
