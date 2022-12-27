import dotenv from 'dotenv';
import { Contract } from 'ethers';
import { getGasPrice } from '../../utils/utils';

dotenv.config();

export const updateAverageTime = async (
  statistics: Contract,
  start: number,
  end: number,
) => {
  const props = {
    gasPrice: await getGasPrice(),
  };
  const tx = await statistics.updateAverageTimeForPlayers(
    start,
    end,
    props
  );
  return tx;
};

export const getTotalNoOfPlayers = async (
    statistics: Contract
) => {
    const len = (await statistics.getPlayersLength()).toNumber()
    return len
}