import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';
import { LocalToken } from 'src/app/shared/models/tokens/local-token';

export interface Store {
  /**
   * Current wallet provider selected by user.
   */
  provider: WALLET_NAME;

  /**
   * User application settings (It, Bridge, Cross-chain).
   */
  settings: unknown;

  /**
   * Current user theme.
   */
  theme: 'dark' | 'light';

  /**
   * Current wallet chain id.
   */
  chainId: number;

  /**
   * User favorite tokens.
   */
  favoriteTokens: LocalToken[];

  /**
   * Wallet target address.
   */
  targetAddress: string;

  /**
   * Count of unread trades by address.
   */
  unreadTrades: {
    [address: string]: number;
  };
}
