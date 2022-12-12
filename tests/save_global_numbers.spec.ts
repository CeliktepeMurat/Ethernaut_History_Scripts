import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers, web3 } from 'hardhat';
import STATISTICS_TEMP_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import STATISTICS_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import { saveGlobalNumbers } from '../scripts/writeScripts/00_exec_batch';
import { ACTIVE_NETWORK, PROXY_STATs, SIGNERS } from '../utils/constants';
import { rollbackProxy } from './helpers/rollback';
import { upgradeProxy } from './helpers/upgrade';

const PROXY: string = PROXY_STATs[ACTIVE_NETWORK.name];
const OWNER = SIGNERS[ACTIVE_NETWORK.name];

describe('Save Global Numbers', () => {
  let Statistics: Contract;
  let impersonatedSigner: Signer;

  let global_numbers = [10, 5];

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

  it('Should save global numbers', async () => {
    const prev_total_Number_Of_Instances_Created =
      await Statistics.getTotalNoOfLevelInstancesCreated();
    const prev_total_Number_Of_Instances_Completed =
      await Statistics.getTotalNoOfLevelInstancesCompleted();

    await saveGlobalNumbers(Statistics, global_numbers);

    expect(await Statistics.getTotalNoOfLevelInstancesCreated()).to.equal(
      prev_total_Number_Of_Instances_Created.add(global_numbers[0])
    );
    expect(await Statistics.getTotalNoOfLevelInstancesCompleted()).to.equal(
      prev_total_Number_Of_Instances_Completed.add(global_numbers[1])
    );
  });

  it('Should keep global numbers after rollback', async () => {
    const prev_total_Number_Of_Instances_Created =
      await Statistics.getTotalNoOfLevelInstancesCreated();
    const prev_total_Number_Of_Instances_Completed =
      await Statistics.getTotalNoOfLevelInstancesCompleted();

    await saveGlobalNumbers(Statistics, global_numbers);

    await rollbackProxy();

    Statistics = await ethers.getContractAt(
      STATISTICS_ABI.abi,
      PROXY,
      impersonatedSigner
    );

    expect(await Statistics.getTotalNoOfLevelInstancesCreated()).to.equal(
      prev_total_Number_Of_Instances_Created.add(global_numbers[0])
    );
    expect(await Statistics.getTotalNoOfLevelInstancesCompleted()).to.equal(
      prev_total_Number_Of_Instances_Completed.add(global_numbers[1])
    );
  });
});
