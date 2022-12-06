import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  Self,
  ViewChild
} from '@angular/core';
import { TokenAmount } from '@shared/models/tokens/token-amount';
import { QueryParamsService } from '@core/services/query-params/query-params.service';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { debounceTime, filter, switchMap, takeUntil } from 'rxjs/operators';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PaginatedPage } from '@shared/models/tokens/paginated-tokens';
import { BehaviorSubject, Observable } from 'rxjs';
import { IframeService } from '@core/services/iframe/iframe.service';
import { AuthService } from '@core/services/auth/auth.service';
import { WalletsModalService } from '@core/wallets-modal/services/wallets-modal.service';
import { UserInterface } from '@core/services/auth/models/user.interface';
import { RubicWindow } from '@shared/utils/rubic-window';
import { WINDOW } from '@ng-web-apis/common';
import { TokensListType } from '@features/swaps/shared/components/tokens-selector/models/tokens-list-type';
import { LIST_ANIMATION } from '@features/onramper-exchange/components/onramper-exchanger/components/exchanger-form/components/tokens-selector/components/tokens-list/animations/list-animation';

@Component({
  selector: 'app-tokens-list',
  templateUrl: './tokens-list.component.html',
  styleUrls: ['./tokens-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDestroyService],
  animations: [LIST_ANIMATION]
})
export class TokensListComponent implements AfterViewInit {
  /**
   * Defines whether default or favorite tokens are shown.
   */
  @Input() public listType: TokensListType;

  /**
   * True if search query string isn't empty.
   */
  @Input() public hasSearchQuery: boolean;

  /**
   * Backend-api state of tokens in currently selected blockchain.
   */
  @Input() public tokensNetworkState: PaginatedPage;

  /**
   * True if new tokens are being loaded.
   */
  @Input() public loading: boolean;

  /**
   * Token, currently selected in main form.
   */
  @Input() public selectedToken: TokenAmount;

  /**
   * Sets list of tokens to show.
   */
  @Input() public set tokens(tokens: TokenAmount[]) {
    this.startAnimation(tokens);
    this._tokens = tokens;
    this.hintsShown = Array(this._tokens.length).fill(false);
  }

  public get tokens(): TokenAmount[] {
    return this._tokens;
  }

  /**
   * Emits event when token is selected.
   */
  @Output() public tokenSelect = new EventEmitter<TokenAmount>();

  /**
   * Emits event when new tokens page should be loaded.
   */
  @Output() public pageUpdate = new EventEmitter<number>();

  /**
   * Emits event when tokens list type is changed.
   */
  @Output() public listTypeChange = new EventEmitter<TokensListType>();

  /**
   * Sets {@link CdkVirtualScrollViewport}
   */
  @ViewChild(CdkVirtualScrollViewport) set virtualScroll(scroll: CdkVirtualScrollViewport) {
    if (scroll) {
      this.scrollSubject$.next(scroll);
    }
  }

  private _tokens: TokenAmount[];

  /**
   * Defines whether hint is shown or not for each token.
   */
  public hintsShown: boolean[];

  /**
   * Controls animation of tokens list.
   */
  public listAnimationState: 'hidden' | 'shown';

  // eslint-disable-next-line rxjs/no-exposed-subjects
  public readonly scrollSubject$: BehaviorSubject<CdkVirtualScrollViewport>;

  public readonly rubicDomain = 'app.rubic.exchange';

  public get noFrameLink(): string {
    return `https://${this.rubicDomain}${this.queryParamsService.noFrameLink}`;
  }

  public readonly iframeRubicLink = this.iframeService.rubicLink;

  get user$(): Observable<UserInterface> {
    return this.authService.currentUser$;
  }

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly queryParamsService: QueryParamsService,
    @Self() private readonly destroy$: TuiDestroyService,
    private readonly iframeService: IframeService,
    private readonly authService: AuthService,
    private readonly walletsModalService: WalletsModalService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {
    this.loading = false;
    this.pageUpdate = new EventEmitter();
    this.scrollSubject$ = new BehaviorSubject(undefined);
  }

  ngAfterViewInit(): void {
    this.observeScroll();
  }

  /**
   * Function to track list element by unique key: token blockchain and address.
   * @param _index Index of list element.
   * @param tokenListElement List element.
   * @return string Unique key for element.
   */
  public trackByFn(_index: number, tokenListElement: TokenAmount): string {
    return `${tokenListElement.blockchain}_${tokenListElement.address}`;
  }

  /**
   * Observes list scroll and fetches new tokens if needed.
   */
  private observeScroll(): void {
    this.scrollSubject$
      .pipe(
        filter(value => Boolean(value)),
        switchMap(scroll =>
          scroll.renderedRangeStream.pipe(
            debounceTime(200),
            filter(renderedRange => {
              const bigVirtualElementsAmount = 10;
              const smallVirtualElementsAmount = 5;
              if (
                this.loading ||
                this.hasSearchQuery ||
                this.listType === 'favorite' ||
                !this.tokensNetworkState ||
                this.tokensNetworkState.maxPage === this.tokensNetworkState.page ||
                this.iframeService.isIframe
              ) {
                return false;
              }
              return this.tokens.length > bigVirtualElementsAmount
                ? renderedRange.end > this.tokens.length - bigVirtualElementsAmount
                : renderedRange.end > this.tokens.length - smallVirtualElementsAmount;
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.pageUpdate.emit();
      });
  }

  /**
   * Starts smooth animation when tokens list is distinctly changed.
   * @param tokens New tokens list.
   */
  private startAnimation(tokens: TokenAmount[]): void {
    let shouldAnimate = false;
    if (this._tokens?.length && tokens.length) {
      const prevToken = this._tokens[0];
      const newToken = tokens[0];
      shouldAnimate = prevToken.blockchain !== newToken.blockchain;

      const arePrevTokensFavourite = this._tokens.every(t => t.favorite);
      const areNewTokensFavourite = tokens.every(t => t.favorite);
      shouldAnimate ||= arePrevTokensFavourite !== areNewTokensFavourite;
    }

    if (shouldAnimate) {
      this.listAnimationState = 'hidden';
      setTimeout(() => {
        this.listAnimationState = 'shown';
        this.cdr.markForCheck();
      });
    }
  }

  /**
   * Selects token.
   * @param token Selected token.
   */
  public onTokenSelect(token: TokenAmount): void {
    this.tokenSelect.emit(token);
  }

  public openAuthModal(): void {
    this.walletsModalService.open$();
  }
}
