import dotenv from 'dotenv';
import STATISTICS_ABI from '../../utils/ABIs/statistics_abi.json';
import { loadFetchedData } from '../../utils/utils';
import { ethers } from 'ethers';
import { TOTAL_NUMBERS_STAT } from '../../utils/interface';
dotenv.config();

const PROVIDER = ethers.providers.getDefaultProvider('http://localhost:8545');
const SIGNER = new ethers.Wallet(process.env.PRIV_KEY as string, PROVIDER);

const PROXY_STAT = '0x1e011a7Fe24AA92b2623eB6efEE51E640A109236';
const statistics = new ethers.Contract(PROXY_STAT, STATISTICS_ABI, SIGNER);

const main = async () => {};

/* function updateAllPlayerData(
    address[] memory _players,
    uint256[] memory _noOfAdditionalInstancesCreatedByPlayer,
    uint256[] memory _noOfAdditionalInstancesCompletedByPlayer,
    uint256[] memory _noOfAdditionalLevelsCompletedByPlayer
) public {
    for (uint256 i = 0; i < _players.length; i++) {
        updateSinglePlayerData(
            _players[i],
            _noOfAdditionalInstancesCreatedByPlayer[i],
            _noOfAdditionalInstancesCompletedByPlayer[i],
            _noOfAdditionalLevelsCompletedByPlayer[i]
        );
    }
} */
