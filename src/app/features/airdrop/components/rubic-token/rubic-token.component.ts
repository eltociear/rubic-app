import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { newRubicToken } from '@features/airdrop/constants/airdrop-token';
import { AirdropPopupService } from '@features/airdrop/services/airdrop-popup.service';

@Component({
  selector: 'app-rubic-token',
  templateUrl: './rubic-token.component.html',
  styleUrls: ['./rubic-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicTokenComponent {
  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    private readonly popupService: AirdropPopupService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  public async addRubicToken(): Promise<void> {
    const tokenWithImage = {
      ...newRubicToken,
      image: `${this.window.location.origin}/assets/images/new-token.png`
    };
    if (this.walletConnectorService.address) {
      await this.walletConnectorService.addToken(tokenWithImage);
    } else {
      this.popupService.showUnauthorizedUserNotification();
    }
  }
}
