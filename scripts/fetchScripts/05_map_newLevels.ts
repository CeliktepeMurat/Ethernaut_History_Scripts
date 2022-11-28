import dotenv from 'dotenv';
import { PLAYER_METRICS } from '../utils/interface';
import { loadFetchedData, storeData } from '../utils/utils';

dotenv.config();

const LEVELS_STATS_PATH = `./data/level_stat.json`;
const ALL_LEVELS_PATH = `./data/all_level_list.json`;
const LEVEL_MAPPING = `./data/levelMapping.json`;
const PLAYER_METRICS_PATH = `./data/player_metrics.json`;

const main = () => {
  map_levels_and_level_stats();
  map_player_metrics();
};

const map_player_metrics = () => {
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
