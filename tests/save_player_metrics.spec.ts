import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers, web3 } from 'hardhat';
import STATISTICS_TEMP_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import STATISTICS_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import { updatePlayerStatsData } from '../scripts/writeScripts/02_exec_batch';
import { updateAllPlayersGlobalData } from '../scripts/writeScripts/01_exec_batch';
import { ACTIVE_NETWORK, PROXY_STATs, SIGNERS } from '../utils/constants';
import { rollbackProxy } from './helpers/rollback';
import { upgradeProxy } from './helpers/upgrade';
import { PLAYER_METRICS } from '../utils/interface';
import { savePlayers } from '../scripts/writeScripts/00_exec_batch';

const PROXY: string = PROXY_STATs[ACTIVE_NETWORK.name];
const OWNER = SIGNERS[ACTIVE_NETWORK.name];

describe('Save Player Metrics', () => {
  let Statistics: Contract;
  let impersonatedSigner: Signer;

  let players = [
    ethers.utils.hexZeroPad('0x1', 20),
    ethers.utils.hexZeroPad('0x2', 20),
  ];
  let levels = [
    '0xBA97454449c10a0F04297022646E7750b8954EE8',
    '0x2754fA769d47ACdF1f6cDAa4B0A8Ca4eEba651eC',
    '0x0AA237C34532ED79676BCEa22111eA2D01c3d3e7',
    '0x4dF32584890A0026e56f7535d0f2C6486753624f',
  ];

  let instances = [
    ethers.utils.hexZeroPad('0x3', 20),
    ethers.utils.hexZeroPad('0x4', 20),
    ethers.utils.hexZeroPad('0x5', 20),
    ethers.utils.hexZeroPad('0x6', 20),
    ethers.utils.hexZeroPad('0x7', 20),
    ethers.utils.hexZeroPad('0x8', 20),
    ethers.utils.hexZeroPad('0x9', 20),
    ethers.utils.hexZeroPad('0xA', 20),
  ];

  let player_metrics: PLAYER_METRICS = {
    [players[0]]: {
      [levels[0]]: [
        {
          instance: instances[0],
          isCompleted: true,
          timeCreated: 1663757856,
          timeCompleted: 1663758132,
        },
      ],
    },
    [players[1]]: {
      [levels[0]]: [
        {
          instance: instances[1],
          isCompleted: true,
          timeCreated: 1665053244,
          timeCompleted: 1665053340,
        },
      ],
      [levels[1]]: [
        {
          instance: instances[2],
          isCompleted: true,
          timeCreated: 1665399084,
          timeCompleted: 1665399094,
        },
      ],
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

    await savePlayers(Statistics, 0, 2, players);
  });

  it('should return levels as completed', async () => {
    const prev_IsLevelCompleted = await Statistics.isLevelCompleted(
      players[0],
      levels[0]
    );

    expect(prev_IsLevelCompleted).to.equal(false);

    await updatePlayerStatsData(Statistics, 0, 4, player_metrics);

    expect(await Statistics.isLevelCompleted(players[0], levels[0])).to.equal(
      true
    );
  });

  it('should return timestamp of successfull instance submission', async () => {
    await updatePlayerStatsData(Statistics, 0, 2, player_metrics);
    let level_array = Object.values(player_metrics);
    let instances = Object.values(level_array[1]);
    const timeCompleted = instances[0][0].timeCompleted;

    expect(
      await Statistics.getSubmissionsForLevelByPlayer(players[1], levels[0], 0)
    ).to.equal(timeCompleted);
  });
});
