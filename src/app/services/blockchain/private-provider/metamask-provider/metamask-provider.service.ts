import { Injectable } from '@angular/core';
import { MetamaskError } from '../../../../errors/bridge/MetamaskError';
import Web3 from 'web3';
import { AccountError } from '../../../../errors/bridge/AccountError';
import { RubicError } from '../../../../errors/RubicError';
import { ethers } from 'ethers';
import { BLOCKCHAIN_NAMES } from '../../../../pages/main-page/trades-form/types';
import { PrivateProvider } from '../private-provider';
import { BLOCKCHAIN_NAME, BLOCKCHAINS, IBlockchain } from '../../types/Blockchain';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetamaskProviderService extends PrivateProvider {
  private readonly _metaMask: any;
  public readonly web3: Web3;

  public readonly onAddressChanges = new Subject<string>();

  public readonly onNetworkChanges = new Subject<IBlockchain>();

  get isInstalled(): boolean {
    return !!this._metaMask;
  }

  get isActive(): boolean {
    return !!this._metaMask?.selectedAddress;
  }

  constructor() {
    super();

    const ethereum = window.ethereum;
    if (!ethereum) {
      console.error('No Metamask installed.');
      return;
    }
    const web3 = new Web3(this._metaMask);
    // @ts-ignore
    if (web3.currentProvider && web3.currentProvider.isMetaMask) {
      this._metaMask = ethereum;
      this.web3 = web3;

      this._metaMask.on('chainChanged', (chain: string) => {
        const chainId = parseInt(chain);
        this.onNetworkChanges.next(BLOCKCHAINS.getBlockchainById(chain));
        console.info('Chain changed', chain);
        window.location.reload();
      });

      this._metaMask.on('accountsChanged', (accounts: string[]) => {
        this.onAddressChanges.next(accounts[0]);
        console.info('Selected account changed to', accounts[0]);
      });
    } else {
      console.error('Selected other provider.');
    }
  }

  protected getAddress(): string {
    return this._metaMask?.selectedAddress();
  }

  protected getNetwork(): IBlockchain {
    const networkId = this._metaMask?.networkVersion;
    return networkId ? BLOCKCHAINS.getBlockchainById(networkId) : undefined;
  }

  public async activate(): Promise<void> {
    return this._metaMask?.request({ method: 'eth_requestAccounts' });
  }
}
