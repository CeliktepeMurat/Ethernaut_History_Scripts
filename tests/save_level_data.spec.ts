import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers, web3 } from 'hardhat';
import STATISTICS_TEMP_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import STATISTICS_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import { saveLevelsData } from '../scripts/writeScripts/00_exec_batch';
import { ACTIVE_NETWORK, PROXY_STATs, SIGNERS } from '../utils/constants';
import { rollbackProxy } from './helpers/rollback';
import { upgradeProxy } from './helpers/upgrade';

const PROXY: string = PROXY_STATs[ACTIVE_NETWORK.name];
const OWNER = SIGNERS[ACTIVE_NETWORK.name];

describe('Save Levels Data', () => {
  let Statistics: Contract;
  let impersonatedSigner: Signer;

  let level_stat = {
    level_stats: {
      '0xBA97454449c10a0F04297022646E7750b8954EE8': {
        created_instances: 10,
        solved_instances: 5,
      },
    },
  };

  before(async () => {
    impersonatedSigner = await ethers.getImpersonatedSigner(OWNER);

    // upgrade proxy
    await upgradeProxy();

    Statistics = await ethers.getContractAt(
      STATISTICS_TEMP_ABI.abi,
      PROXY,
      impersonatedSigner
    );
  });

  it("should save level's data", async () => {
    const level = Object.keys(level_stat.level_stats)[0];
    const values = Object.values(level_stat.level_stats)[0];

    const prev_Number_Of_Instances_Created =
      await Statistics.getNoOfInstancesForLevel(level);
    const prev_Number_Of_Instances_Completed =
      await Statistics.getNoOfCompletedSubmissionsForLevel(level);

    await saveLevelsData(Statistics, web3, level_stat);

    expect(await Statistics.getNoOfInstancesForLevel(level)).to.equal(
      prev_Number_Of_Instances_Created.add(values.created_instances)
    );
    expect(
      await Statistics.getNoOfCompletedSubmissionsForLevel(level)
    ).to.equal(prev_Number_Of_Instances_Completed.add(values.solved_instances));
  });

  it('Should keep levels state after rollback', async () => {
    const level = Object.keys(level_stat.level_stats)[0];
    const values = Object.values(level_stat.level_stats)[0];

    const prev_Number_Of_Instances_Created =
      await Statistics.getNoOfInstancesForLevel(level);
    const prev_Number_Of_Instances_Completed =
      await Statistics.getNoOfCompletedSubmissionsForLevel(level);

    await saveLevelsData(Statistics, web3, level_stat);

    await rollbackProxy();

    Statistics = await ethers.getContractAt(
      STATISTICS_ABI.abi,
      PROXY,
      impersonatedSigner
    );

    expect(await Statistics.getNoOfInstancesForLevel(level)).to.equal(
      prev_Number_Of_Instances_Created.add(values.created_instances)
    );
    expect(
      await Statistics.getNoOfCompletedSubmissionsForLevel(level)
    ).to.equal(prev_Number_Of_Instances_Completed.add(values.solved_instances));
  });
});
