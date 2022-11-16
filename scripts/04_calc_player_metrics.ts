import dotenv from 'dotenv';
import { FETCH_DATA, PLAYER_METRICS } from '../utils/interface';
import { loadFetchedData, storeData } from '../utils/utils';
dotenv.config();

const ALL_DATA_PATH = `./data/all_data.json`;
const PLAYER_METRICS_PATH = `./data/player_metrics.json`;

const main = () => {
  const all_data = loadFetchedData(ALL_DATA_PATH);

  let player_metrics: PLAYER_METRICS =
    loadFetchedData(PLAYER_METRICS_PATH).player_metrics !== undefined
      ? loadFetchedData(PLAYER_METRICS_PATH).player_metrics
      : {};

  all_data.forEach((data: FETCH_DATA) => {
    let player = data.player.toString();
    let level = data.level.toString();
    let instance = data.instance.toString();
    if (player_metrics[player] !== undefined) {
      if (player_metrics[player][level] !== undefined) {
        if (data.event === 'solve_instance') {
          player_metrics[player][level].isCompleted = true;
          player_metrics[player][level].timeCompleted = data.timeStamp;
        }
      } else {
        if (data.event === 'create_instance') {
          player_metrics[player][level] = {
            instance,
            isCompleted: false,
            timeCreated: data.timeStamp,
            timeCompleted: 0,
          };
        }
      }
    } else {
      if (data.event === 'create_instance') {
        player_metrics[player] = {};
        player_metrics[player][level] = {
          instance,
          isCompleted: false,
          timeCreated: data.timeStamp,
          timeCompleted: 0,
        };
      }
    }
  });

  storeData(PLAYER_METRICS_PATH, { player_metrics });
};

main();
