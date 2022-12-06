import dotenv from 'dotenv';
import colors from 'colors';
import { FETCH_DATA, LEVEL_FACTORY_STAT } from '../../utils/interface';
import { loadFetchedData, storeData } from '../../utils/utils';
import * as constants from '../../utils/constants';
dotenv.config();

let ALL_DATA_PATH = `./data/${constants.ACTIVE_NETWORK.name}/all_data.json`;
const LEVEL_STAT_PATH = `./data/${constants.ACTIVE_NETWORK.name}/level_stat.json`;
const ALL_LEVELS_PATH = `./data/${constants.ACTIVE_NETWORK.name}/all_level_list.json`;

const old_levels = loadFetchedData(LEVEL_STAT_PATH);
const New_Levels_Set: Set<string> =
  old_levels.levels !== undefined ? new Set(old_levels.levels) : new Set();

const main = () => {
  const all_data = loadFetchedData(ALL_DATA_PATH);

  let level_stat: LEVEL_FACTORY_STAT =
    loadFetchedData(LEVEL_STAT_PATH).level_stat !== undefined
      ? loadFetchedData(LEVEL_STAT_PATH).level_stat
      : {};

  console.log(colors.gray(`Calculating Level Stats...`));
  all_data.forEach((data: FETCH_DATA) => {
    let level = data.level.toString();
    if (level_stat[level] !== undefined) {
      data.event === 'create_instance'
        ? level_stat[level].created_instances++
        : level_stat[level].solved_instances++;
    } else {
      data.event === 'create_instance'
        ? (level_stat[level] = { created_instances: 1, solved_instances: 0 })
        : (level_stat[level] = { created_instances: 0, solved_instances: 1 });
    }
    New_Levels_Set.add(level);
  });

  console.log(colors.green(`Saving Level Stats to ${LEVEL_STAT_PATH}`));
  storeData(LEVEL_STAT_PATH, {
    level_stat,
  });

  console.log(colors.green(`Saving All Levels to ${ALL_LEVELS_PATH}`));
  storeData(ALL_LEVELS_PATH, {
    total_number_of_levels: Array.from(New_Levels_Set).length,
    levels: Array.from(New_Levels_Set),
  });

  console.log('Done');
  process.exit();
};

main();
