import dotenv from 'dotenv';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { loadFetchedData } from '../../utils/utils';
import { ethers } from 'ethers';
import { TOTAL_NUMBERS_STAT } from '../../utils/interface';
dotenv.config();

const PROVIDER = ethers.providers.getDefaultProvider('http://localhost:8545');
const SIGNER = new ethers.Wallet(process.env.PRIV_KEY as string, PROVIDER);

const PROXY_STAT = '0xf19e93c0B2B43e69b9b95F833161580480882a42';
const statistics = new ethers.Contract(PROXY_STAT, STATISTICS_ABI, SIGNER);

const main = async () => {
  await savePlayers();
  //await saveGlobalNumbers();
};

const saveGlobalNumbers = async () => {
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

const savePlayers = async () => {
  const ALL_PLAYERS_PATH = `./data/all_player_list.json`;
  const players = loadFetchedData(ALL_PLAYERS_PATH).players;

  const txn = await statistics.updatePlayers(players.slice(0, 500));
  console.log(await txn.wait());
  let receivedTxn = await txn.wait();
  console.log('Gas Used -> ', receivedTxn.gasUsed.toString());
  console.log('Gas price -> ', receivedTxn.effectiveGasPrice.toString());
};

main();
