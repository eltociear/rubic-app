import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { WalletConnectorService } from '@core/services/wallets/wallet-connector-service/wallet-connector.service';

@Component({
  selector: 'app-airdrop-address',
  templateUrl: './airdrop-address.component.html',
  styleUrls: ['./airdrop-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropAddressComponent {
  public readonly airdropForm = this.airdropService.airdropForm;

  public readonly loggedIn$ = this.walletConnectorService.addressChange$;

  public readonly claimedTokens$ = this.airdropService.claimedTokens$;

  constructor(
    private readonly airdropService: AirdropService,
    private readonly walletConnectorService: WalletConnectorService
  ) {}

  public pasteAddress(): void {
    this.airdropForm.controls.address.patchValue(this.walletConnectorService.address);
  }
}
