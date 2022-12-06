import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CrossChainTradeType } from 'rubic-sdk';
import { BehaviorSubject } from 'rxjs';
import { TokensService } from 'src/app/core/services/tokens/tokens.service';
import { ThemeService } from 'src/app/core/services/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { QueryParams, QuerySlippage } from './models/query-params';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';
import { BlockchainName } from 'rubic-sdk';
import { HeaderStore } from '@core/header/services/header.store';
import { WINDOW } from '@ng-web-apis/common';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  public currentQueryParams: QueryParams;

  private readonly _tokensSelectionDisabled$ = new BehaviorSubject<[boolean, boolean]>([
    false,
    false
  ]);

  public tokensSelectionDisabled$ = this._tokensSelectionDisabled$.asObservable();

  public slippage: QuerySlippage;

  public get noFrameLink(): string {
    const urlTree = this.router.parseUrl(this.router.url);
    delete urlTree.queryParams.iframe;
    return urlTree.toString();
  }

  public hideUnusedUI: boolean;

  public disabledProviders: CrossChainTradeType[] | undefined;

  public enabledProviders: CrossChainTradeType[] | undefined;

  public enabledBlockchains: BlockchainName[];

  public screenWidth: number;

  public backgroundColor: string;

  constructor(
    private readonly headerStore: HeaderStore,
    private readonly tokensService: TokensService,
    @Inject(DOCUMENT) private document: Document,
    private readonly router: Router,
    private readonly themeService: ThemeService,
    private readonly translateService: TranslateService,
    @Inject(WINDOW) private readonly window: Window
  ) {}

  private navigate(): void {
    this.router.navigate([], {
      queryParams: this.currentQueryParams,
      queryParamsHandling: 'merge'
    });
  }

  private setBackgroundStatus(queryParams: QueryParams): void {
    const { background } = queryParams;
    if (this.isBackgroundValid(background)) {
      this.backgroundColor = background;
      return;
    }
    this.document.body.classList.add('default-iframe-background');
  }

  private setHideSelectionStatus(queryParams: QueryParams): void {
    const tokensSelectionDisabled: [boolean, boolean] = [
      queryParams.hideSelectionFrom === 'true',
      queryParams.hideSelectionTo === 'true'
    ];

    if (tokensSelectionDisabled.includes(true)) {
      this._tokensSelectionDisabled$.next(tokensSelectionDisabled);
    }
  }

  private setLanguage(queryParams: QueryParams): void {
    const language = isSupportedLanguage(queryParams.language) ? queryParams.language : 'en';
    this.translateService.use(language);
  }

  private isBackgroundValid(stringToTest: string): boolean {
    if (stringToTest === '') {
      return false;
    }
    if (stringToTest === 'inherit') {
      return false;
    }
    if (stringToTest === 'transparent') {
      return false;
    }

    const image = document.createElement('img');
    image.style.background = 'rgb(0, 0, 0)';
    image.style.background = stringToTest;
    if (image.style.background !== 'rgb(0, 0, 0)') {
      return true;
    }
    image.style.background = 'rgb(255, 255, 255)';
    image.style.background = stringToTest;
    return image.style.background !== 'rgb(255, 255, 255)';
  }

  public getUrlSearchParam(key: string): string {
    return new URLSearchParams(this.window.location.search).get(key) || undefined;
  }
}
