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

describe('Save Levels Data', () => {
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
});
