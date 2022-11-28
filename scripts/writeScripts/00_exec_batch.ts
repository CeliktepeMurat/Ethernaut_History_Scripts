import dotenv from 'dotenv';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { getImpersonatedSigner, loadFetchedData, reportGas } from '../../utils/utils';
import { Contract, ethers } from 'ethers';
import { TOTAL_NUMBERS_STAT } from '../../utils/interface';
import { OWNER, PROXY_STAT } from '../../utils/constant';

dotenv.config();

const main = async () => {
  const impersonatedSigner = await getImpersonatedSigner(OWNER);

  const statistics = new ethers.Contract(
    PROXY_STAT,
    STATISTICS_ABI,
    impersonatedSigner
  );

  await savePlayers(statistics);
  await saveGlobalNumbers(statistics);
  await saveLevelsData(statistics);
};

const saveGlobalNumbers = async (statistics: Contract) => {
  const TOTAL_NUMBERS_PATH = `./data/total_instance_numbers.json`;
  const total_numbers: TOTAL_NUMBERS_STAT =
    loadFetchedData(TOTAL_NUMBERS_PATH).total_stats;

  const txn = await statistics.updateGlobalData(
    total_numbers.Total_Number_Of_Instances_Created,
    total_numbers.Total_Number_Of_Instance_Solved
  );
  let receivedTxn = await txn.wait();
  console.log(receivedTxn);
  console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
  console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
};

const savePlayers = async (statistics: Contract) => {
  const ALL_PLAYERS_PATH = `./data/all_player_list.json`;
  const players = loadFetchedData(ALL_PLAYERS_PATH).players;

  const txn = await statistics.updatePlayers(players.slice(0, 500));
  let receivedTxn = await txn.wait();
  reportGas(receivedTxn);
};

const saveLevelsData = async (statistics: Contract) => {
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

  const txn = await statistics.updateAllLevelData(
    levelAddressesNew,
    noOfCreatedInstances,
    noOfSolvedInstances
  );
  const receivedTxn = await txn.wait();
  reportGas(receivedTxn);
};

main();
