import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import dotenv from 'dotenv';
import hre from 'hardhat';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { loadFetchedData } from '../../utils/utils';
import { PLAYER_METRICS } from '../../utils/interface';
dotenv.config();

const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

const PLAYER_METRICS_PATH = `./data/player_metrics.json`;
const playerMetrics: PLAYER_METRICS =
  loadFetchedData(PLAYER_METRICS_PATH).player_metrics;

const PROXY_STAT = '0x5D78E927D12cf3F46E5fB771bFA33aA22689AD3B';
const OWNER = '0x09902A56d04a9446601a0d451E07459dC5aF0820';

const main = async () => {
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [OWNER],
  });

  const statistics = new web3.eth.Contract(
    STATISTICS_ABI as AbiItem[],
    PROXY_STAT,
    {
      from: OWNER,
    }
  );

  let batch: any = new web3.BatchRequest();

  for (let player in playerMetrics) {
    for (const level in playerMetrics[player]) {
      let totalSubmission = [];
      let lastInstance = playerMetrics[player][level].at(-1);
      let firstInstance = playerMetrics[player][level].at(0);
      let levelFirstCompletedInstance = playerMetrics[player][level].find(
        (instance) => instance.isCompleted
      );
      for (const instance of playerMetrics[player][level]) {
        if (instance.isCompleted) {
          totalSubmission.push(instance.timeCompleted);
        }
      }
      const fn = statistics.methods.updatePlayerDataForALevel(
        player,
        level,
        lastInstance?.instance,
        lastInstance?.isCompleted,
        lastInstance?.isCompleted ? lastInstance?.timeCompleted : 0,
        lastInstance?.timeCreated,
        totalSubmission,
        levelFirstCompletedInstance?.timeCompleted,
        firstInstance?.timeCreated
      );
      const account = web3.eth.accounts.privateKeyToAccount(
        'ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      ); // hardhat 1. account
      const data = fn.encodeABI();
      const nonce = 3535;
      const payload = {
        nonce,
        data,
        gas: 1000000,
        from: OWNER,
        to: PROXY_STAT,
      };
      const signedTx = await account.signTransaction(payload);
      const { rawTransaction } = signedTx;
      let x = web3.eth.sendSignedTransaction as any;

      batch.add(x.request(rawTransaction!));
    }
  }
  batch.execute();
};

main();
