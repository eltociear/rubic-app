import { BLOCKCHAIN_NAME } from '../../models/blockchain/BLOCKCHAIN_NAME';

export const FROM_BACKEND_BLOCKCHAINS = {
  ethereum: BLOCKCHAIN_NAME.ETHEREUM,
  'binance-smart-chain': BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
  polygon: BLOCKCHAIN_NAME.POLYGON,
  harmony: BLOCKCHAIN_NAME.HARMONY,
  avalanche: BLOCKCHAIN_NAME.AVALANCHE,
  'tron-mainnet': BLOCKCHAIN_NAME.TRON,
  xdai: BLOCKCHAIN_NAME.XDAI,
  'ethereum-test': BLOCKCHAIN_NAME.ETHEREUM_TESTNET
};

export const TO_BACKEND_BLOCKCHAINS = {
  [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
  [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
  [BLOCKCHAIN_NAME.POLYGON]: 'polygon',
  [BLOCKCHAIN_NAME.HARMONY]: 'harmony',
  [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
  [BLOCKCHAIN_NAME.TRON]: 'tron-mainnet',
  [BLOCKCHAIN_NAME.XDAI]: 'xdai',
  [BLOCKCHAIN_NAME.ETHEREUM_TESTNET]: 'ethereum-test'
};

export type ToBackendBlockchain = keyof typeof TO_BACKEND_BLOCKCHAINS;
export type FromBackendBlockchain = keyof typeof FROM_BACKEND_BLOCKCHAINS;
