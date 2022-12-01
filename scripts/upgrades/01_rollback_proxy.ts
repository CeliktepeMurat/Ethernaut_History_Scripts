import dotenv from 'dotenv';
import colors from 'colors';
import { getImpersonatedSigner } from '../../utils/utils';
import { ethers } from 'hardhat';
import {
  OWNER,
  PROXY_ADMIN,
  PROXY_ADMIN_CONTRACT,
  PROXY_STAT,
} from '../../utils/constant';
dotenv.config();

const upgradeProxy = async () => {
  const impersonatedProxyAdmin = await getImpersonatedSigner(PROXY_ADMIN);

  // Deploying Exact Version of Statistics Contract
  const STATISTICS = await deploy_statistic();

  const proxyAdmin = await getProxyAdmin();

  // Upgrade proxy
  const res = await proxyAdmin
    .connect(impersonatedProxyAdmin)
    .upgrade(PROXY_STAT, STATISTICS);

  console.log(colors.bgBlue(`Proxy Upgraded to Exact Version!`));
  console.log(colors.green(`Txn Hash >>> ${res.hash}`));
};

const deploy_statistic = async () => {
  console.log('Deploying Statistics Contract...');
  const impersonatedSigner = await getImpersonatedSigner(OWNER);

  const contract = await ethers.getContractFactory(
    'Statistics',
    impersonatedSigner
  );
  const instance = await contract.deploy();
  await instance.deployed();
  console.log(colors.green(`Statistics Contract >>> ${instance.address}`));

  return instance.address;
};

const getProxyAdmin = async () => {
  const ProxyAdmin = await ethers.getContractFactory('ProxyAdmin');
  const contract = ProxyAdmin.attach(PROXY_ADMIN_CONTRACT);
  return contract;
};

upgradeProxy();
