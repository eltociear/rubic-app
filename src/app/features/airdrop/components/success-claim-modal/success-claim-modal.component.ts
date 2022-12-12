import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';
import { BLOCKCHAIN_NAME } from 'rubic-sdk';
import ADDRESS_TYPE from '@app/shared/models/blockchain/address-type';

@Component({
  selector: 'app-success-claim-modal',
  templateUrl: './success-claim-modal.component.html',
  styleUrls: ['./success-claim-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessClaimModalComponent {
  public readonly hash = this.context.data.hash;

  public readonly blockchain = BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN;

  public readonly addressType = ADDRESS_TYPE.TRANSACTION;

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<boolean, { hash: string }>
  ) {}

  public handleConfirm(): void {
    this.context.completeWith(true);
  }

  public handleCancel(): void {
    this.context.completeWith(false);
  }
}
