import dotenv from 'dotenv';
import { FETCH_DATA } from '../utils/interface';
import { isCompleted, loadFetchedData, storeData } from '../utils/utils';
dotenv.config();

const ALL_DATA_PATH = `./data/all_data.json`;
const TOTAL_INSTANCE_NUMBERS_PATHS = `./data/total_instance_numbers.json`;
const old_numbers = loadFetchedData(TOTAL_INSTANCE_NUMBERS_PATHS);

const SLOT = 2;
const INDEX = 1;

const main = async () => {
  console.log('Calculating global stats...');

  const all_data: FETCH_DATA[] = loadFetchedData(ALL_DATA_PATH);

  let total_stats =
    old_numbers.total_stats !== undefined
      ? old_numbers.total_stats
      : {
          Total_Number_Of_Instances_Created: 0,
          Total_Number_Of_Instance_Solved: 0,
          Total_Number_Of_Instances_Failed: 0,
        };

  for (const data of all_data.slice(10000)) {
    console.log('Instance -> ', data.instance);

    try {
      if (data.event === 'create_instance') {
        let solved = await isCompleted(SLOT, INDEX, data.instance);
        if (!solved) {
          total_stats.Total_Number_Of_Instances_Failed++;
        }
        total_stats.Total_Number_Of_Instances_Created++;
      } else {
        total_stats.Total_Number_Of_Instance_Solved++;
      }
    } catch (err) {}
  }

  storeData(TOTAL_INSTANCE_NUMBERS_PATHS, { total_stats });
};

main();
