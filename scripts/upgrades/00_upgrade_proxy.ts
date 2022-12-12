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

export const upgradeProxy = async () => {
  const impersonatedProxyAdmin = await getImpersonatedSigner(PROXY_ADMIN);
  console.log('Proxy Admin: ', PROXY_ADMIN);

  // Deploying Temporary Statistics Contract
  const STATISTICS = await deploy_temp_statistic();

  const proxyAdminContract = await getProxyAdminContract();

  // Upgrade proxy
  const res = await proxyAdminContract
    .connect(impersonatedProxyAdmin)
    .upgrade(PROXY_STAT, STATISTICS);

  console.log(colors.bgBlue(`Proxy Upgraded to Temporary Version!`));
  console.log(colors.green(`Txn Hash >>> ${res.hash}`));
};

const deploy_temp_statistic = async () => {
  console.log('Deploying Temporary Statistics Contract...');
  const impersonatedSigner = await getImpersonatedSigner(OWNER);

  const contract = await ethers.getContractFactory(
    'Statistics_Temp',
    impersonatedSigner
  );
  const instance = await contract.deploy();
  await instance.deployed();
  console.log(
    colors.green(`Temporary Statistics Contract >>> ${instance.address}`)
  );

  return instance.address;
};

const getProxyAdminContract = async () => {
  const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin');
  const contract = ProxyAdmin.attach(PROXY_ADMIN_CONTRACT);
  return contract;
};
