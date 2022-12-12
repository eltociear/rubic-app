import { Injectable } from '@angular/core';
import {
  Configuration,
  CrossChainManager,
  CrossChainStatusManager,
  OnChainManager,
  OnChainStatusManager,
  SDK,
  WalletProvider,
  WalletProviderCore,
  CHAIN_TYPE,
  CrossChainSymbiosisManager
} from 'rubic-sdk';
import { rubicSdkDefaultConfig } from '@core/services/rubic-sdk-service/constants/rubic-sdk-default-config';
import { BehaviorSubject } from 'rxjs';
import { SdkHttpClient } from '@core/services/rubic-sdk-service/utils/sdk-http-client';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class RubicSdkService {
  private readonly _sdkLoading$ = new BehaviorSubject<boolean>(false);

  public readonly sdkLoading$ = this._sdkLoading$.asObservable();

  private _SDK: SDK | null;

  private get SDK(): SDK {
    if (!this._SDK) {
      throw new Error('Rubic SDK is not initiated.');
    }
    return this._SDK;
  }

  public get symbiosis(): CrossChainSymbiosisManager {
    return this.SDK.crossChainSymbiosisManager;
  }

  public get instantTrade(): OnChainManager {
    return this.SDK.onChainManager;
  }

  public get crossChain(): CrossChainManager {
    return this.SDK.crossChainManager;
  }

  public get onChainStatusManager(): OnChainStatusManager {
    return this.SDK.onChainStatusManager;
  }

  public get crossChainStatusManager(): CrossChainStatusManager {
    return this.SDK.crossChainStatusManager;
  }

  private set SDK(value: SDK) {
    this._SDK = value;
  }

  public readonly defaultConfig = {
    ...rubicSdkDefaultConfig,
    httpClient: new SdkHttpClient(this.angularHttpClient)
  };

  private currentConfig: Configuration;

  constructor(private readonly angularHttpClient: HttpClient) {
    this._SDK = null;
  }

  public async initSDK(providerAddress?: string): Promise<void> {
    this.currentConfig = {
      ...this.defaultConfig,
      providerAddress: {
        [CHAIN_TYPE.EVM]: providerAddress
      }
    };
    this.SDK = await SDK.createSDK(this.currentConfig);
  }

  public async patchConfig(config: Partial<Configuration>): Promise<void> {
    this._sdkLoading$.next(true);
    try {
      const newConfig = { ...this.currentConfig, ...config };
      await this.SDK.updateConfiguration(newConfig);
      this.currentConfig = newConfig;
    } catch (err) {
      console.debug('Failed to reload SDK configuration:', err);
    }
    this._sdkLoading$.next(false);
  }

  public updateWallet(
    chainType: keyof WalletProvider,
    walletProviderCore: WalletProviderCore
  ): void {
    this.SDK.updateWalletProviderCore(chainType, walletProviderCore);
  }
}