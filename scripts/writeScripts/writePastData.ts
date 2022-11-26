import dotenv from 'dotenv';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { getImpersonatedSigner, loadFetchedData } from '../../utils/utils';
import { Contract, ethers } from 'ethers';
import { TOTAL_NUMBERS_STAT } from '../../utils/interface';
import levelMapping from '../../data/levelMapping.json';

dotenv.config();

const PROXY_STAT = '0x90bf78BC9276D8e0820F3545e3Fa3Ba3147B8735';
const OWNER = '0x09902A56d04a9446601a0d451E07459dC5aF0820';

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
  console.log(await txn.wait());
  let receivedTxn = await txn.wait();
  console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
  console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
};

const savePlayers = async (statistics: Contract) => {
  const ALL_PLAYERS_PATH = `./data/all_player_list.json`;
  const players = loadFetchedData(ALL_PLAYERS_PATH).players;

  const txn = await statistics.updatePlayers(players.slice(0, 500));
  console.log(await txn.wait());
  let receivedTxn = await txn.wait();
  console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
  console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
};

const saveLevelsData = async (statistics: Contract) => {
  const ALL_LEVELS_PATH = `./data/level_stat.json`;
  const levels = loadFetchedData(ALL_LEVELS_PATH).level_stat;
  const levelAddressesOld = Object.keys(levels);
  const levelAddressesNew = [];
  const noOfCreatedInstances = [];
  const noOfSolvedInstances = [];
  for (let i = 0; i < levelAddressesOld.length; i++) {
    //@ts-ignore
    levelAddressesNew.push(levelMapping[levelAddressesOld[i]]);
    noOfCreatedInstances.push(levels[levelAddressesOld[i]].created_instances);
    noOfSolvedInstances.push(levels[levelAddressesOld[i]].solved_instances);
  }

  const txn = await statistics.updateAllLevelData(
    levelAddressesNew,
    noOfCreatedInstances,
    noOfSolvedInstances
  );
  const receivedTxn = await txn.wait();
  console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
  console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
};

main();
