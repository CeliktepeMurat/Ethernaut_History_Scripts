export const OWNER = '0x09902A56d04a9446601a0d451E07459dC5aF0820';

export const PROXY_ADMIN_CONTRACT =
  '0xd131307baB6f8998EC14579ea7A3594D20b511B5';

export const PROXY_ADMIN = '0x09902A56d04a9446601a0d451E07459dC5aF0820';

export const PROXY_STAT = '0x7ae0655F0Ee1e7752D7C62493CEa1E69A810e2ed';

// Networks for operations
export const NETWORKS = {
  UNDEFINED: undefined,
  LOCAL: {
    name: 'local',
    id: '1337',
    url: 'http://localhost',
    port: 8545,
    privKey: '0x' + '0'.repeat(64),
    from: 0,
    to: 0,
  },
  GOERLI: {
    name: 'goerli',
    id: '5',
    url: `${process.env.GOERLI_HOST}`,
    privKey: `${process.env.PRIV_KEY}`,
    from: 7632928,
    to: 7978269,
  },
  MUMBAI: {
    name: 'mumbai-polygon',
    id: '80001',
    url: `${process.env.MUMBAI_HOST}`,
    privKey: `${process.env.PRIV_KEY}`,
    from: 28218131,
    to: 29198563,
  },
  SEPOLIA: {
    name: 'sepolia',
    id: '11155111',
    url: `${process.env.SEPOLIA_HOST}`,
    privKey: `${process.env.PRIV_KEY}`,
    from: 2033550,
    to: 2306395,
  },
  OPTIMISM_GOERLI: {
    name: 'goerli-optimism',
    id: '420',
    url: `${process.env.OPTIMISM_GOERLI_HOST}`,
    privKey: `${process.env.PRIV_KEY}`,
    from: 0,
    to: 0,
  },
  ARBITRUM_GOERLI: {
    name: 'goerli-arbitrum',
    id: '421613',
    url: `${process.env.ARBITRUM_GOERLI_HOST}`,
    privKey: `${process.env.PRIV_KEY}`,
    from: 0,
    to: 0,
  },
};

export const ACTIVE_NETWORK = NETWORKS.SEPOLIA;
// export const ACTIVE_NETWORK = NETWORKS.GOERLI
//export const ACTIVE_NETWORK = NETWORKS.MUMBAI;
// export const ACTIVE_NETWORK = NETWORKS.OPTIMISM_GOERLI
// export const ACTIVE_NETWORK = NETWORKS.ARBITRUM_GOERLI
//export const ACTIVE_NETWORK = NETWORKS.LOCAL;
