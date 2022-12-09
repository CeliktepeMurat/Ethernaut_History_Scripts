import { expect } from 'chai';
import { Contract, Signer } from 'ethers';
import { ethers, network } from 'hardhat';
import STATISTICS_ABI from '../artifacts/contracts/Statistics.sol/Statistics.json';
import {
  ACTIVE_NETWORK,
  PROXY_STATs,
  SIGNERS,
  ETHERNAUT_CONTRACT,
} from '../utils/constants';
import { getImpersonatedSigner } from '../utils/utils';

const PROXY: string = PROXY_STATs[ACTIVE_NETWORK.name];
const OWNER = SIGNERS[ACTIVE_NETWORK.name];

describe('Save Players', () => {
  let Statistics: Contract;
  let ETHERNAUT_CONTRACT: string;
  let SIGNER: Signer;

  before(async () => {
    SIGNER = await getImpersonatedSigner(OWNER);

    Statistics = await ethers.getContractAt(STATISTICS_ABI.abi, PROXY, SIGNER);
  });

  it('Should save players', async () => {
    console.log('Fetching players...');

    const x = await Statistics.getTotalNoOfLevelInstancesCreated();

    console.log(x.toString());
  });
});
