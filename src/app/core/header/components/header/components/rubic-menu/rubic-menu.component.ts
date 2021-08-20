import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Injector,
  OnDestroy,
  QueryList,
  TemplateRef,
  ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { TuiDialogService } from '@taiga-ui/core';
import { TranslateService } from '@ngx-translate/core';
import { UserInterface } from 'src/app/core/services/auth/models/user.interface';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { IBlockchain } from 'src/app/shared/models/blockchain/IBlockchain';
import { ProviderConnectorService } from 'src/app/core/services/blockchain/provider-connector/provider-connector.service';
import { NavigationItem } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-item';
import { NAVIGATION_LIST } from 'src/app/core/header/components/header/components/rubic-menu/models/navigation-list';
import { CounterNotificationsService } from 'src/app/core/services/counter-notifications/counter-notifications.service';
import { QueryParamsService } from 'src/app/core/services/query-params/query-params.service';
import { BLOCKCHAIN_NAME } from 'src/app/shared/models/blockchain/BLOCKCHAIN_NAME';
import { SwapFormService } from 'src/app/features/swaps/services/swaps-form-service/swap-form.service';
import { SwapFormInput } from 'src/app/features/swaps/models/SwapForm';
import { HeaderStore } from '../../../../services/header.store';

@Component({
  selector: 'app-rubic-menu',
  templateUrl: './rubic-menu.component.html',
  styleUrls: ['./rubic-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RubicMenuComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('dropdownOptionTemplate') dropdownOptionsTemplates: QueryList<TemplateRef<never>>;

  public isOpened = false;

  public $currentUser: Observable<UserInterface>;

  public $countUnread: Observable<number>;

  public currentBlockchain: IBlockchain;

  private _onNetworkChanges$: Subscription;

  private _onAddressChanges$: Subscription;

  public readonly navigationList: NavigationItem[];

  constructor(
    private router: Router,
    private headerStore: HeaderStore,
    private authService: AuthService,
    private readonly cdr: ChangeDetectorRef,
    private readonly providerConnectorService: ProviderConnectorService,
    private translateService: TranslateService,
    private readonly counterNotificationsService: CounterNotificationsService,
    private readonly queryParamsService: QueryParamsService,
    private readonly swapFormService: SwapFormService,
    @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
    @Inject(Injector) private injector: Injector
  ) {
    this.$currentUser = this.authService.getCurrentUser();
    this.$countUnread = this.counterNotificationsService.unread$;
    this.navigationList = NAVIGATION_LIST;
  }

  public ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this._onNetworkChanges$ = this.providerConnectorService.$networkChange.subscribe(network => {
      this.currentBlockchain = network;
      this.cdr.detectChanges();
    });
    this._onAddressChanges$ = this.providerConnectorService.$addressChange.subscribe(() =>
      this.cdr.detectChanges()
    );
  }

  public ngOnDestroy(): void {
    this._onNetworkChanges$.unsubscribe();
    this._onAddressChanges$.unsubscribe();
  }

  public getDropdownStatus(opened) {
    this.isOpened = opened;
  }

  public closeMenu() {
    this.isOpened = false;
  }

  public navigateToBridge(): void {
    const form = this.swapFormService.commonTrade.controls.input;
    const params = {
      fromBlockchain: BLOCKCHAIN_NAME.ETHEREUM,
      toBlockchain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      fromToken: null,
      toToken: null,
      fromAmount: null
    } as SwapFormInput;
    form.patchValue(params);
    this.queryParamsService.setQueryParams({
      fromChain: BLOCKCHAIN_NAME.ETHEREUM,
      toChain: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
      amount: undefined,
      from: undefined,
      to: undefined
    });
  }

  public logout(): void {
    this.authService.signOut().subscribe();
  }

  isLinkActive(url) {
    return window.location.pathname === url;
  }
}
