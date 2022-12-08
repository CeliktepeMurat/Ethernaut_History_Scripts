// Networks for operations
export const NETWORKS = {
  UNDEFINED: undefined,
  LOCAL: {
    name: 'sepolia',
    id: '1337',
    url: 'http://127.0.0.1',
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
    from: 1888074,
    to: 2750524,
  },
  ARBITRUM_GOERLI: {
    name: 'goerli-arbitrum',
    id: '421613',
    url: `${process.env.ARBITRUM_GOERLI_HOST}`,
    privKey: `${process.env.PRIV_KEY}`,
    from: 635119,
    to: 1375826,
  },
};

export const ETHERNAUT_CONTRACT = {
  [NETWORKS.LOCAL.name]: '0xa3e7317E591D5A0F1c605be1b3aC4D2ae56104d6',
  [NETWORKS.MUMBAI.name]: '0x73379d8B82Fda494ee59555f333DF7D44483fD58',
  [NETWORKS.GOERLI.name]: '0xD2e5e0102E55a5234379DD796b8c641cd5996Efd',
  [NETWORKS.SEPOLIA.name]: '0xa3e7317E591D5A0F1c605be1b3aC4D2ae56104d6',
  [NETWORKS.OPTIMISM_GOERLI.name]: '0xB4802b28895ec64406e45dB504149bfE79A38A57',
  [NETWORKS.ARBITRUM_GOERLI.name]: '0xa3e7317E591D5A0F1c605be1b3aC4D2ae56104d6',
};

export const SIGNERS = {
  [NETWORKS.LOCAL.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.MUMBAI.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.GOERLI.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.SEPOLIA.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.OPTIMISM_GOERLI.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.ARBITRUM_GOERLI.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
};

export const PROXY_ADMINs = {
  [NETWORKS.LOCAL.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.MUMBAI.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.GOERLI.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.SEPOLIA.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.OPTIMISM_GOERLI.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
  [NETWORKS.ARBITRUM_GOERLI.name]: '0x09902A56d04a9446601a0d451E07459dC5aF0820',
};

export const PROXY_STATs = {
  [NETWORKS.LOCAL.name]: '0x57d122d0355973dA78acF5138aE664548bB2CA2b',
  [NETWORKS.MUMBAI.name]: '0x96f08DD768b09cb6cD90591fED6A768F40C48a49',
  [NETWORKS.GOERLI.name]: '0x7ae0655F0Ee1e7752D7C62493CEa1E69A810e2ed',
  [NETWORKS.SEPOLIA.name]: '0x57d122d0355973dA78acF5138aE664548bB2CA2b',
  [NETWORKS.OPTIMISM_GOERLI.name]: '0x33eD4F045d2Fe3A69E614043cAe47d9114b77FaD',
  [NETWORKS.ARBITRUM_GOERLI.name]: '0x57d122d0355973dA78acF5138aE664548bB2CA2b',
};

export const PROXY_ADMIN_CONTRACTs = {
  [NETWORKS.LOCAL.name]: '0x545d848827bD9e0E30794a9E53f5ab04EA71d78a',
  [NETWORKS.MUMBAI.name]: '0xAe7b9fb081eD0b8CA687C9117C294E6d17e88F8f',
  [NETWORKS.GOERLI.name]: '0xd131307baB6f8998EC14579ea7A3594D20b511B5',
  [NETWORKS.SEPOLIA.name]: '0x545d848827bD9e0E30794a9E53f5ab04EA71d78a',
  [NETWORKS.OPTIMISM_GOERLI.name]: '0x79d4b54f260f74542F120f4034b9226179AfF925',
  [NETWORKS.ARBITRUM_GOERLI.name]: '0x545d848827bD9e0E30794a9E53f5ab04EA71d78a',
};

// export const ACTIVE_NETWORK = NETWORKS.SEPOLIA;
// export const ACTIVE_NETWORK = NETWORKS.GOERLI
// export const ACTIVE_NETWORK = NETWORKS.MUMBAI;
// export const ACTIVE_NETWORK = NETWORKS.OPTIMISM_GOERLI;
// export const ACTIVE_NETWORK = NETWORKS.ARBITRUM_GOERLI;
export const ACTIVE_NETWORK = NETWORKS.LOCAL;
