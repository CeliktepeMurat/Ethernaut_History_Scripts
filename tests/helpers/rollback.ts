import dotenv from 'dotenv';
import colors from 'colors';
import { getImpersonatedSigner } from '../../utils/utils';
import { ethers } from 'hardhat';
import {
  SIGNERS,
  PROXY_STATs,
  PROXY_ADMINs,
  ACTIVE_NETWORK,
  PROXY_ADMIN_CONTRACTs,
} from '../../utils/constants';
dotenv.config();

let OWNER = SIGNERS[ACTIVE_NETWORK.name];
let PROXY_ADMIN = PROXY_ADMINs[ACTIVE_NETWORK.name];
let PROXY_STAT = PROXY_STATs[ACTIVE_NETWORK.name];
let PROXY_ADMIN_CONTRACT = PROXY_ADMIN_CONTRACTs[ACTIVE_NETWORK.name];

export const rollbackProxy = async () => {
  const impersonatedProxyAdmin = await ethers.getImpersonatedSigner(
    PROXY_ADMIN
  );

  // Deploying Exact Version of Statistics Contract
  const STATISTICS = await deploy_statistic();

  const proxyAdmin = await getProxyAdmin();

  // Upgrade proxy
  await proxyAdmin
    .connect(impersonatedProxyAdmin)
    .upgrade(PROXY_STAT, STATISTICS);

  console.log(`Proxy Upgraded to Exact Version!`);
};

const deploy_statistic = async () => {
  const impersonatedSigner = await ethers.getImpersonatedSigner(OWNER);

  const contract = await ethers.getContractFactory(
    'Statistics',
    impersonatedSigner
  );
  const instance = await contract.deploy();
  await instance.deployed();

  return instance.address;
};

const getProxyAdmin = async () => {
  const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin');
  const contract = ProxyAdmin.attach(PROXY_ADMIN_CONTRACT);
  return contract;
};
