import dotenv from 'dotenv';
import colors from 'colors';
import { PLAYER_METRICS } from '../../utils/interface';
import { loadFetchedData, storeData } from '../../utils/utils';
import * as constants from '../../utils/constants';

dotenv.config();

const LEVELS_STATS_PATH = `./data/${constants.ACTIVE_NETWORK.name}/level_stat.json`;
const ALL_LEVELS_PATH = `./data/${constants.ACTIVE_NETWORK.name}/all_level_list.json`;
const LEVEL_MAPPING = `./data/${constants.ACTIVE_NETWORK.name}/levelMapping.json`;
const PLAYER_METRICS_PATH = `./data/${constants.ACTIVE_NETWORK.name}/player_metrics.json`;

const main = () => {
  map_levels_and_level_stats();
  map_player_metrics();

  console.log('Done');
  process.exit();
};

const map_player_metrics = () => {
  console.log(colors.green(`Mapping Levels for Player Metrics...`));
  const player_metrics: PLAYER_METRICS =
    loadFetchedData(PLAYER_METRICS_PATH).player_metrics;
  const level_mapping: { [old_address: string]: string } =
    loadFetchedData(LEVEL_MAPPING);

  for (const player in player_metrics) {
    const playerData = player_metrics[player];
    for (const level in playerData) {
      if (level_mapping[level] !== undefined) {
        const new_address = level_mapping[level];
        playerData[new_address] = playerData[level];
        delete playerData[level];
      }
    }
  }

  storeData(PLAYER_METRICS_PATH, { player_metrics });
};

const map_levels_and_level_stats = () => {
  console.log(colors.green(`Mapping Levels for Level Stats...`));

  const level_stats = loadFetchedData(LEVELS_STATS_PATH).level_stat;
  const all_levels = loadFetchedData(ALL_LEVELS_PATH).levels;

  const level_mapping: { [old_address: string]: string } =
    loadFetchedData(LEVEL_MAPPING);

  for (let i = 0; i < all_levels.length; i++) {
    const old_address = all_levels[i];
    if (level_mapping[old_address] !== undefined) {
      const new_address = level_mapping[old_address];
      all_levels[i] = new_address;

      level_stats[new_address] = level_stats[old_address];
      delete level_stats[old_address];
    }
  }

  storeData(LEVELS_STATS_PATH, { level_stat: level_stats });
  storeData(ALL_LEVELS_PATH, {
    total_number_of_levels: all_levels.length,
    levels: all_levels,
  });
};

main();
