import dotenv from 'dotenv';
import colors from 'colors';
import { FETCH_DATA, PLAYER_STAT } from '../../utils/interface';
import { loadFetchedData, storeData } from '../../utils/utils';
import * as constants from '../../utils/constants';
dotenv.config();

let ALL_DATA_PATH = `./data/${constants.ACTIVE_NETWORK.name}/all_data.json`;
const PLAYER_STAT_PATH = `./data/${constants.ACTIVE_NETWORK.name}/player_stat.json`;
const ALL_PLAYERS_PATH = `./data/${constants.ACTIVE_NETWORK.name}/all_player_list.json`;

const old_players = loadFetchedData(ALL_PLAYERS_PATH);
const New_Player_Set: Set<string> =
  old_players.players !== undefined ? new Set(old_players.players) : new Set();

const main = () => {
  const all_data = loadFetchedData(ALL_DATA_PATH);
  let player_stat: PLAYER_STAT =
    loadFetchedData(PLAYER_STAT_PATH).player_stat !== undefined
      ? loadFetchedData(PLAYER_STAT_PATH).player_stat
      : {};

  console.log(colors.gray(`Calculating Player Stats...`));
  all_data.forEach((data: FETCH_DATA) => {
    let player = data.player.toString();
    if (player_stat[player] !== undefined) {
      data.event === 'create_instance'
        ? player_stat[player].created_instances++
        : player_stat[player].solved_instances++;
    } else {
      data.event === 'create_instance'
        ? (player_stat[player] = { created_instances: 1, solved_instances: 0 })
        : (player_stat[player] = { created_instances: 0, solved_instances: 1 });
    }
    New_Player_Set.add(player);
  });

  console.log(colors.green(`Saving Player Stats to ${PLAYER_STAT_PATH}`));
  storeData(PLAYER_STAT_PATH, {
    player_stat,
  });

  console.log(colors.green(`Saving All Players to ${ALL_PLAYERS_PATH}`));
  storeData(ALL_PLAYERS_PATH, {
    total_number_of_players: Array.from(New_Player_Set).length,
    players: Array.from(New_Player_Set),
  });

  console.log('Done');
  process.exit();
};

main();
