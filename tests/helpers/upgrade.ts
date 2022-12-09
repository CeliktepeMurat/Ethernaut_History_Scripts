import dotenv from 'dotenv';
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

export const upgradeProxy = async () => {
  const impersonatedProxyAdmin = await ethers.getImpersonatedSigner(
    PROXY_ADMIN
  );

  // Deploying Temporary Statistics Contract
  const STATISTICS = await deploy_temp_statistic();

  const proxyAdminContract = await getProxyAdminContract();

  // Upgrade proxy
  await proxyAdminContract
    .connect(impersonatedProxyAdmin)
    .upgrade(PROXY_STAT, STATISTICS);
};

const deploy_temp_statistic = async () => {
  const impersonatedSigner = await ethers.getImpersonatedSigner(OWNER);

  const contract = await ethers.getContractFactory(
    'Statistics_Temp',
    impersonatedSigner
  );

  const instance = await contract.deploy();

  await instance.deployed();

  return instance.address;
};

const getProxyAdminContract = async () => {
  const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin');
  const contract = ProxyAdmin.attach(PROXY_ADMIN_CONTRACT);
  return contract;
};
