import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers, web3 } from 'hardhat';
import STATISTICS_TEMP_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import STATISTICS_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import {
  saveLevelsData,
  savePlayers,
} from '../scripts/writeScripts/00_exec_batch';
import { updateAllPlayersGlobalData } from '../scripts/writeScripts/01_exec_batch';
import { ACTIVE_NETWORK, PROXY_STATs, SIGNERS } from '../utils/constants';
import { rollbackProxy } from './helpers/rollback';
import { upgradeProxy } from './helpers/upgrade';

const PROXY: string = PROXY_STATs[ACTIVE_NETWORK.name];
const OWNER = SIGNERS[ACTIVE_NETWORK.name];

describe('Save Player Stats', () => {
  let Statistics: Contract;
  let impersonatedSigner: Signer;

  let players = [ethers.utils.hexZeroPad('0x1', 20)];

  let player_stats = {
    player_stat: {
      [players[0]]: {
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

    await savePlayers(Statistics, 0, 1, players);
  });

  it("should save level's data", async () => {
    const values = Object.values(player_stats.player_stat);

    const players = Object.keys(player_stats.player_stat);
    const no_of_instances_created = values.map((v) => v.created_instances);
    const no_of_instances_solved = values.map((v) => v.solved_instances);

    const prev_Number_Of_Instances_Created =
      await Statistics.getTotalNoOfLevelInstancesCreatedByPlayer(players[0]);
    const prev_Number_Of_Instances_Completed =
      await Statistics.getTotalNoOfLevelInstancesCompletedByPlayer(players[0]);

    await updateAllPlayersGlobalData(Statistics, 0, 1, [
      players,
      no_of_instances_created,
      no_of_instances_solved,
    ]);

    expect(
      await Statistics.getTotalNoOfLevelInstancesCreatedByPlayer(players[0])
    ).to.equal(
      prev_Number_Of_Instances_Created.add(no_of_instances_created[0])
    );
    expect(
      await Statistics.getTotalNoOfLevelInstancesCompletedByPlayer(players[0])
    ).to.equal(
      prev_Number_Of_Instances_Completed.add(no_of_instances_solved[0])
    );
  });

  it('Should keep levels state after rollback', async () => {
    const values = Object.values(player_stats.player_stat);

    const players = Object.keys(player_stats.player_stat);
    const no_of_instances_created = values.map((v) => v.created_instances);
    const no_of_instances_solved = values.map((v) => v.solved_instances);

    const prev_Number_Of_Instances_Created =
      await Statistics.getTotalNoOfLevelInstancesCreatedByPlayer(players[0]);
    const prev_Number_Of_Instances_Completed =
      await Statistics.getTotalNoOfLevelInstancesCompletedByPlayer(players[0]);

    await updateAllPlayersGlobalData(Statistics, 0, 1, [
      players,
      no_of_instances_created,
      no_of_instances_solved,
    ]);

    await rollbackProxy();

    Statistics = await ethers.getContractAt(
      STATISTICS_ABI.abi,
      PROXY,
      impersonatedSigner
    );

    expect(
      await Statistics.getTotalNoOfLevelInstancesCreatedByPlayer(players[0])
    ).to.equal(
      prev_Number_Of_Instances_Created.add(no_of_instances_created[0])
    );
    expect(
      await Statistics.getTotalNoOfLevelInstancesCompletedByPlayer(players[0])
    ).to.equal(
      prev_Number_Of_Instances_Completed.add(no_of_instances_solved[0])
    );
  });
});
