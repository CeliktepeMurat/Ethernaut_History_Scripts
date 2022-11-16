import dotenv from 'dotenv';
import { FETCH_DATA, LEVEL_FACTORY_STAT } from '../utils/interface';
import { loadFetchedData, storeData } from '../utils/utils';
dotenv.config();

const ALL_DATA_PATH = `./data/all_data.json`;
const LEVEL_STAT_PATH = `./data/level_stat.json`;
const ALL_LEVELS_PATH = `./data/all_level_list.json`;

const old_levels = loadFetchedData(LEVEL_STAT_PATH);
const New_Levels_Set: Set<string> =
  old_levels.levels !== undefined ? new Set(old_levels.levels) : new Set();

const main = () => {
  const all_data = loadFetchedData(ALL_DATA_PATH);

  let level_stat: LEVEL_FACTORY_STAT =
    loadFetchedData(LEVEL_STAT_PATH).level_stat !== undefined
      ? loadFetchedData(LEVEL_STAT_PATH).level_stat
      : {};

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

  storeData(LEVEL_STAT_PATH, {
    level_stat,
  });
  storeData(ALL_LEVELS_PATH, {
    total_number_of_levels: Array.from(New_Levels_Set).length,
    levels: Array.from(New_Levels_Set),
  });
};

main();
