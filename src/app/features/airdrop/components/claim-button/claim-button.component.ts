import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { combineLatestWith, map, startWith } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import { Observable } from 'rxjs';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';

type ButtonState = 'login' | 'emptyError' | 'wrongAddressError' | 'changeNetwork' | 'claim';

@Component({
  selector: 'app-claim-button',
  templateUrl: './claim-button.component.html',
  styleUrls: ['./claim-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimButtonComponent {
  public readonly buttonStateNameMap: Record<ButtonState, string> = {
    login: 'airdrop.button.login',
    claim: 'airdrop.button.claim',
    wrongAddressError: 'airdrop.button.wrongAddressError',
    emptyError: 'airdrop.button.emptyError',
    changeNetwork: 'airdrop.button.changeNetwork'
  };

  public buttonState$: Observable<ButtonState> = this.airdropService.isValid$.pipe(
    startWith(false),
    combineLatestWith(this.authService.currentUser$, this.walletConnectorService.networkChange$),
    map(([isValid, user, network]) => {
      if (!user?.address) {
        return 'login';
      }
      if (!network || network !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
        return 'changeNetwork';
      }
      if (isValid) {
        return 'claim';
      }
      return Boolean(this.airdropService.airdropForm.controls.address.value)
        ? 'wrongAddressError'
        : 'emptyError';
    })
  );

  public readonly loading$ = this.airdropService.claimLoading$;

  constructor(
    private readonly airdropService: AirdropService,
    private readonly authService: AuthService,
    private readonly walletConnectorService: WalletConnectorService,
    private readonly walletModalService: WalletsModalService
  ) {}

  public async handleClaim(): Promise<void> {
    await this.airdropService.claimTokens();
  }

  public async handleClick(state: ButtonState): Promise<void> {
    switch (state) {
      case 'changeNetwork':
        await this.airdropService.changeNetwork();
        break;
      case 'login':
        this.walletModalService.open$();
        break;
      case 'claim':
        await this.airdropService.claimTokens();
        break;
      default:
    }
  }
}
