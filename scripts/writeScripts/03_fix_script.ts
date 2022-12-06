import dotenv from 'dotenv';
import { Contract } from 'ethers';
import {
  loadFetchedData,
} from '../../utils/utils';
dotenv.config();

const PLAYER_METRICS_PATH = `./data/player_metrics.json`;

// PARAMS
let allData:any;
let allPlayers:any;

const fillPlayerStat = () => {
  allData = loadFetchedData(PLAYER_METRICS_PATH).player_metrics;
  allPlayers = Object.keys(allData);
};

fillPlayerStat();
