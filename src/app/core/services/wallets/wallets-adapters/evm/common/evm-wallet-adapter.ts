import { CommonWalletAdapter } from '@core/services/wallets/wallets-adapters/common-wallet-adapter';
import { BlockchainsInfo, CHAIN_TYPE, EvmBlockchainName } from 'rubic-sdk';
import { RubicAny } from '@shared/models/utility-types/rubic-any';
import { AddEvmChainParams } from '@core/services/wallets/models/add-evm-chain-params';
import { fromEvent } from 'rxjs';
import { BlockchainToken } from '@shared/models/tokens/blockchain-token';
import { WALLET_NAME } from '@core/wallets-modal/components/wallets-modal/models/wallet-name';

export abstract class EvmWalletAdapter<T = RubicAny> extends CommonWalletAdapter<T> {
  public readonly chainType = CHAIN_TYPE.EVM;

  protected selectedChain: EvmBlockchainName | null;

  /**
   * Subscribes on chain and account change events.
   */
  protected initSubscriptionsOnChanges(): void {
    this.onAddressChangesSub = fromEvent(this.wallet as RubicAny, 'accountsChanged').subscribe(
      (accounts: string[]) => {
        this.selectedAddress = accounts[0] || null;
        this.zone.run(() => {
          this.onAddressChanges$.next(this.selectedAddress);
        });
      }
    );

    this.onNetworkChangesSub = fromEvent(this.wallet as RubicAny, 'chainChanged').subscribe(
      (chainId: string) => {
        this.selectedChain =
          (BlockchainsInfo.getBlockchainNameById(chainId) as EvmBlockchainName) ?? null;
        this.zone.run(() => {
          this.onNetworkChanges$.next(this.selectedChain);
        });
      }
    );
  }

  public async addToken(
    token: Omit<BlockchainToken, 'blockchain'> & { image: string },
    isMobile = false
  ): Promise<void | never> {
    const eventName =
      this.walletName === WALLET_NAME.METAMASK && isMobile === false
        ? 'metamask_watchAsset'
        : 'wallet_watchAsset';
    return (this.wallet as RubicAny).request({
      method: eventName,
      params: {
        type: 'ERC20',
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.image
        }
      }
    });
  }

  public async switchChain(chainId: string): Promise<void | never> {
    return (this.wallet as RubicAny).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }]
    });
  }

  public async addChain(params: AddEvmChainParams): Promise<void | never> {
    return (this.wallet as RubicAny).request({
      method: 'wallet_addEthereumChain',
      params: [params]
    });
  }
}
