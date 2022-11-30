import dotenv from 'dotenv';
import {
  loadFetchedData,
} from '../../utils/utils';
import { Contract } from 'ethers';
import { TOTAL_NUMBERS_STAT } from '../../utils/interface';

dotenv.config();

export const saveGlobalNumbers = async (
  statistics: Contract,
  props: { gasPrice: string }
) => {
  const TOTAL_NUMBERS_PATH = `./data/total_instance_numbers.json`;
  const total_numbers: TOTAL_NUMBERS_STAT =
  loadFetchedData(TOTAL_NUMBERS_PATH).total_stats;
  let txn;
  txn = await statistics.updateGlobalData(
    total_numbers.Total_Number_Of_Instances_Created,
    total_numbers.Total_Number_Of_Instance_Solved,
    props
  );
  return txn;
};

export const savePlayers = async (
  statistics: Contract,
  props: { gasPrice: string },
  start:number,
  end:number
) => {
  const ALL_PLAYERS_PATH = `./data/all_player_list.json`;
  const players = loadFetchedData(ALL_PLAYERS_PATH).players;
  let txn;
  txn = await statistics.updatePlayers(players.slice(start, end), props);
  return txn;
};

export const saveLevelsData = async (
  statistics: Contract,
  props: { gasPrice: string }
) => {
  const LEVEL_STATS_PATH = `./data/level_stat.json`;
  const level_stats = loadFetchedData(LEVEL_STATS_PATH).level_stat;

  const levelAddresses = Object.keys(level_stats);

  const levelAddressesNew = [];
  const noOfCreatedInstances = [];
  const noOfSolvedInstances = [];

  for (let i = 0; i < levelAddresses.length; i++) {
    levelAddressesNew.push(levelAddresses[i]);
    noOfCreatedInstances.push(level_stats[levelAddresses[i]].created_instances);
    noOfSolvedInstances.push(level_stats[levelAddresses[i]].solved_instances);
  }
  let txn;
  txn = await statistics.updateAllLevelData(
    levelAddressesNew,
    noOfCreatedInstances,
    noOfSolvedInstances,
    props
  );
  return txn;
};


