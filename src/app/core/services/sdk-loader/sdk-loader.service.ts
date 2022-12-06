import { Inject, Injectable } from '@angular/core';
import { RubicSdkService } from '@app/core/services/rubic-sdk-service/rubic-sdk.service';
import { AuthService } from '@core/services/auth/auth.service';
import { filter, tap } from 'rxjs/operators';
import { CHAIN_TYPE, WalletProvider, WalletProviderCore } from 'rubic-sdk';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WINDOW } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root'
})
export class SdkLoaderService {
  constructor(
    private readonly sdkService: RubicSdkService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  public async initSdk(): Promise<void> {
    this.subscribeOnAddressChange();
    await this.sdkService.initSDK(
      new URLSearchParams(this.window.location.search).get('feeTarget')
    );
    this.loadUser();
  }

  private async loadUser(): Promise<void> {
    await this.authService.loadStorageUser();
  }

  private subscribeOnAddressChange(): void {
    this.walletConnectorService.addressChange$
      .pipe(
        filter(Boolean),
        tap(address => {
          const chainType = this.walletConnectorService.chainType as keyof WalletProvider;
          const provider = this.walletConnectorService.provider;
          const walletProviderCore: WalletProviderCore = {
            address,
            core: chainType === CHAIN_TYPE.EVM ? provider.wallet : provider.wallet.tronWeb
          };
          this.sdkService.updateWallet(chainType, walletProviderCore);
        })
      )
      .subscribe();
  }
}
