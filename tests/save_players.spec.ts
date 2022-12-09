import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers, web3 } from 'hardhat';
import STATISTICS_TEMP_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import STATISTICS_ABI from '../artifacts/contracts/Statistics_Temp.sol/Statistics_Temp.json';
import { savePlayers } from '../scripts/writeScripts/00_exec_batch';
import { ACTIVE_NETWORK, PROXY_STATs, SIGNERS } from '../utils/constants';
import { rollbackProxy } from './helpers/rollback';
import { upgradeProxy } from './helpers/upgrade';

const PROXY: string = PROXY_STATs[ACTIVE_NETWORK.name];
const OWNER = SIGNERS[ACTIVE_NETWORK.name];

describe('Save Players', () => {
  let Statistics: Contract;
  let impersonatedSigner: Signer;

  let players = [
    ethers.utils.hexZeroPad('0x1', 20),
    ethers.utils.hexZeroPad('0x2', 20),
  ];

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

  it('Should save players', async () => {
    await savePlayers(Statistics, web3, 0, 2, players);

    const player1 = await Statistics.doesPlayerExist(players[0]);
    const player2 = await Statistics.doesPlayerExist(players[1]);
    expect(player1).to.be.true;
    expect(player2).to.be.true;
  });

  it('Should keep players after rollback', async () => {
    await savePlayers(Statistics, web3, 0, 2, players);

    await rollbackProxy();

    Statistics = await ethers.getContractAt(
      STATISTICS_ABI.abi,
      PROXY,
      impersonatedSigner
    );

    const player1 = await Statistics.doesPlayerExist(players[0]);
    const player2 = await Statistics.doesPlayerExist(players[1]);
    expect(player1).to.be.true;
    expect(player2).to.be.true;
  });
});
