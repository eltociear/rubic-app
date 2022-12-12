import { BLOCKCHAIN_NAME, EvmBlockchainName } from 'rubic-sdk';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';

type Token = Omit<BlockchainToken, 'blockchain'> & { blockchain: EvmBlockchainName };

export const newRubicToken: Token = {
  decimals: 18,
  symbol: 'RBC',
  name: 'Rubic',
  address: '0x09f3bd68a90f10da92add1d14767340fbc1485eb',
  blockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN
};
