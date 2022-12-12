import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { combineLatestWith, map, startWith } from 'rxjs/operators';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { BLOCKCHAIN_NAME, BlockchainName, EvmWeb3Pure } from 'rubic-sdk';
import { Observable } from 'rxjs';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { UserInterface } from '@core/services/auth/models/user.interface';

type ButtonLabel =
  | 'login'
  | 'emptyError'
  | 'wrongAddressError'
  | 'changeNetwork'
  | 'claim'
  | 'incorrectAddressError';

@Component({
  selector: 'app-claim-button',
  templateUrl: './claim-button.component.html',
  styleUrls: ['./claim-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimButtonComponent {
  public readonly buttonStateNameMap: Record<ButtonLabel, string> = {
    login: 'airdrop.button.login',
    claim: 'airdrop.button.claim',
    wrongAddressError: 'airdrop.button.wrongAddressError',
    emptyError: 'airdrop.button.emptyError',
    changeNetwork: 'airdrop.button.changeNetwork',
    incorrectAddressError: 'airdrop.button.incorrectAddressError'
  };

  public buttonState$: Observable<{ label: ButtonLabel; isError: boolean }> =
    this.airdropService.isValid$.pipe(
      combineLatestWith(this.authService.currentUser$, this.walletConnectorService.networkChange$),
      map(([isValid, user, network]) => this.getButtonKey([isValid, user, network])),
      map(buttonLabel => ({ label: buttonLabel, isError: this.getErrorState(buttonLabel) })),
      startWith({ label: 'emptyError' as ButtonLabel, isError: true })
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

  public async handleClick(state: ButtonLabel): Promise<void> {
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

  private getButtonKey([isValid, user, network]: [
    boolean,
    UserInterface,
    BlockchainName
  ]): ButtonLabel {
    if (!user?.address) {
      return 'login';
    }
    if (!network || network !== BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN) {
      return 'changeNetwork';
    }
    if (isValid) {
      return 'claim';
    }

    const address = this.airdropService.airdropForm.controls.address.value;
    if (!Boolean(address)) {
      return 'emptyError';
    }

    const isEthAddress = EvmWeb3Pure.isAddressCorrect(address);
    return isEthAddress ? 'wrongAddressError' : 'incorrectAddressError';
  }

  private getErrorState(buttonLabel: ButtonLabel): boolean {
    return (
      buttonLabel === 'wrongAddressError' ||
      buttonLabel === 'emptyError' ||
      buttonLabel === 'incorrectAddressError'
    );
  }
}
