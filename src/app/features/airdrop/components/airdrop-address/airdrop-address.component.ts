import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';

@Component({
  selector: 'app-airdrop-address',
  templateUrl: './airdrop-address.component.html',
  styleUrls: ['./airdrop-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropAddressComponent {
  public readonly airdropForm = this.airdropService.airdropForm;

  public readonly claimedTokens$ = this.airdropService.claimedTokens$;

  constructor(private readonly airdropService: AirdropService) {}
}
