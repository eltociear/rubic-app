import { Inject, Injectable, Injector, INJECTOR } from '@angular/core';
import { Observable } from 'rxjs';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { WalletsModalComponent } from 'src/app/core/wallets-modal/components/wallets-modal/wallets-modal.component';
import { TuiDialogService } from '@taiga-ui/core';

@Injectable()
export class WalletsModalService {
  constructor(
    @Inject(INJECTOR) private readonly injector: Injector,
    private readonly dialogService: TuiDialogService
  ) {}

  public open(): Observable<void> {
    const size = 's';
    return this.dialogService.open(
      new PolymorpheusComponent(WalletsModalComponent, this.injector),
      { size }
    );
  }

  public open$(): void {
    this.open().subscribe();
  }
}
