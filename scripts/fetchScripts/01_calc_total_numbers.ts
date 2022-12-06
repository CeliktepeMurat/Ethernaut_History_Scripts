import dotenv from 'dotenv';
import { FETCH_DATA } from '../../utils/interface';
import { loadFetchedData, storeData } from '../../utils/utils';
import * as constants from '../../utils/constants';
dotenv.config();

let ALL_DATA_PATH = `./data/${constants.ACTIVE_NETWORK.name}/all_data.json`;
const TOTAL_INSTANCE_NUMBERS_PATHS = `./data/${constants.ACTIVE_NETWORK.name}/total_instance_numbers.json`;
const old_numbers = loadFetchedData(TOTAL_INSTANCE_NUMBERS_PATHS);

const main = () => {
  const all_data: FETCH_DATA[] = loadFetchedData(ALL_DATA_PATH);

  let total_stats =
    old_numbers.total_stats !== undefined
      ? old_numbers.total_stats
      : {
          Total_Number_Of_Instances_Created: 0,
          Total_Number_Of_Instance_Solved: 0,
        };

  for (const data of all_data) {
    if (data.event === 'create_instance') {
      total_stats.Total_Number_Of_Instances_Created++;
    } else {
      total_stats.Total_Number_Of_Instance_Solved++;
    }
  }

  storeData(TOTAL_INSTANCE_NUMBERS_PATHS, {
    total_stats,
  });
};

main();
