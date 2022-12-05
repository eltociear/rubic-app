import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AirdropService } from '@features/airdrop/services/airdrop.service';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-claim-button',
  templateUrl: './claim-button.component.html',
  styleUrls: ['./claim-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClaimButtonComponent {
  public readonly addressState$ = this.airdropService.isValid$.pipe(
    startWith(false),
    map(isValid => {
      return {
        valid: isValid,
        value: Boolean(this.airdropService?.airdropForm?.controls?.address?.value)
      };
    })
  );

  public readonly loading$ = this.airdropService.claimLoading$;

  constructor(private readonly airdropService: AirdropService) {}

  public async handleClaim(): Promise<void> {
    await this.airdropService.claimTokens();
  }
}
