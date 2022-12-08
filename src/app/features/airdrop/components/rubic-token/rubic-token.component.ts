import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';

@Component({
  selector: 'app-rubic-token',
  templateUrl: './rubic-token.component.html',
  styleUrls: ['./rubic-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicTokenComponent {
  constructor(
    private readonly walletConnectorService: WalletConnectorService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  public async addRubicToken(): Promise<void> {
    const newRubicToken = {
      decimals: 18,
      symbol: 'RBC',
      name: 'Rubic',
      image: `${this.window.location.origin}/assets/images/new-token.png`,
      address: '0x09f3bd68a90f10da92add1d14767340fbc1485eb'
    };
    await this.walletConnectorService.addToken(newRubicToken);
  }
}
