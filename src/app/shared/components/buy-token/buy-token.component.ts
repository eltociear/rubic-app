import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core';
import { BlockchainName } from 'rubic-sdk';
import { Router } from '@angular/router';
import { TuiAppearance } from '@taiga-ui/core';
import BigNumber from 'bignumber.js';
import { ThemeService } from '@core/services/theme/theme.service';
import { WINDOW } from '@ng-web-apis/common';
import { RubicWindow } from '@shared/utils/rubic-window';
import { map } from 'rxjs/operators';

export interface TokenInfo {
  blockchain: BlockchainName;
  address: string;
  symbol: string;
  amount?: BigNumber;
}

interface TokenPair {
  from: Required<TokenInfo>;
  to: TokenInfo;
}

@Component({
  selector: 'app-buy-token',
  templateUrl: './buy-token.component.html',
  styleUrls: ['./buy-token.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyTokenComponent {
  @Input() appearance: TuiAppearance = TuiAppearance.Outline;

  /**
   * Banner type. Component Renders different texts based on type.
   */
  @Input() tokensType: 'default' | 'custom';

  private readonly customTokens: TokenPair;

  private readonly defaultTokens: TokenPair;

  private readonly rubicIcon = {
    light: 'assets/images/icons/header/rubic.svg',
    dark: 'assets/images/icons/header/rubic-light.svg'
  };

  public readonly icon$ = this.themeService.theme$.pipe(map(theme => this.rubicIcon[theme]));

  constructor(
    private readonly router: Router,
    private readonly themeService: ThemeService,
    @Inject(WINDOW) private readonly window: RubicWindow
  ) {}

  /**
   * Navigates to swap page and fill in tokens form.
   */
  public buyToken(): void {
    this.window.location.href =
      'https://app.rubic.exchange?from=ETH&to=RBC&fromChain=ETH&toChain=ETH';
  }
}
