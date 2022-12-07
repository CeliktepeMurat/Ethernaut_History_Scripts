import dotenv from 'dotenv';
import colors from 'colors';
import { getImpersonatedSigner } from '../../utils/utils';
import { ethers } from 'hardhat';
import {
  OWNER,
  PROXY_ADMIN,
  PROXY_ADMIN_CONTRACT,
  PROXY_STAT,
} from '../../utils/constants';
dotenv.config();

const upgradeProxy = async () => {
  const impersonatedProxyAdmin = await getImpersonatedSigner(PROXY_ADMIN);

  // Deploying Temporary Statistics Contract
  const STATISTICS = await deploy_fix_statistic();

  const proxyAdmin = await getProxyAdmin();

  // Upgrade proxy
  const res = await proxyAdmin
    .connect(impersonatedProxyAdmin)
    .upgrade(PROXY_STAT, STATISTICS);

  console.log(colors.bgBlue(`Proxy Upgraded to Fix Version!`));
  console.log(colors.green(`Txn Hash >>> ${res.hash}`));
};

const deploy_fix_statistic = async () => {
  console.log('Deploying Fix Statistics Contract...');
  const impersonatedSigner = await getImpersonatedSigner(OWNER);

  const contract = await ethers.getContractFactory(
    'Statistics_Fix',
    impersonatedSigner
  );
  const instance = await contract.deploy();
  await instance.deployed();
  console.log(
    colors.green(`Fix Statistics Contract >>> ${instance.address}`)
  );

  return instance.address;
};

const getProxyAdmin = async () => {
  const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin');
  const contract = ProxyAdmin.attach(PROXY_ADMIN_CONTRACT);
  return contract;
};

upgradeProxy();
