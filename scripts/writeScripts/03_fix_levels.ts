import dotenv from 'dotenv';
import { getGasPrice } from '../../utils/utils';
import { Contract } from 'ethers';

dotenv.config();


export const fixLevels = async (
  statistics: Contract,
  wrongIndices: number[]
) => {
  const props = {
    gasPrice: await getGasPrice(),
  };
    const txn = await statistics.fixLevels(wrongIndices, props)
    const currentLevels = await statistics.getAllLevels()
    console.log(currentLevels)
    return txn;
};
