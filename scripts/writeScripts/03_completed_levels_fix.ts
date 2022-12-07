import dotenv from 'dotenv';
import { Contract } from 'ethers';
import {
  loadFetchedData,
} from '../../utils/utils';
dotenv.config();

const PLAYER_METRICS_PATH = `./data/Goerli/player_metrics.json`;

// PARAMS
let allData:any;
let allPlayers:any;

const fillPlayerStat = () => {
  allData = loadFetchedData(PLAYER_METRICS_PATH).player_metrics;
  allPlayers = Object.keys(allData);
};

export const fixNoOfLevelsCompletedForPlayers = async (
  statistics: Contract,
  props: { gasPrice: string },
  start: number,
  end:number
) => {
  const tx = await statistics.fixNoOfLevelsCompletedForPlayers(
    allPlayers.slice(start, end),
    props
  );
  return tx;
};


fillPlayerStat();
