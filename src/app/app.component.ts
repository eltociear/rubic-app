import { Component, Inject, isDevMode } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { DOCUMENT } from '@angular/common';
import { PlatformConfigurationService } from '@app/core/services/backend/platform-configuration/platform-configuration.service';
import { QueryParams } from '@core/services/query-params/models/query-params';
import { isSupportedLanguage } from '@shared/models/languages/supported-languages';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public isBackendAvailable: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private readonly translateService: TranslateService,
    private readonly cookieService: CookieService,
    private readonly platformConfigurationService: PlatformConfigurationService
  ) {
    this.printTimestamp();
    this.setupLanguage();
    this.loadPlatformConfig();
  }

  /**
   * Removes live chat in iframe mode.
   */
  private removeLiveChatInIframe(): void {
    const observer = new MutationObserver(() => {
      const liveChat = this.document.getElementById('chat-widget-container');
      if (liveChat) {
        liveChat.remove();
        observer.disconnect();
      }
    });
    observer.observe(this.document.body, {
      attributes: false,
      childList: true,
      characterData: false,
      subtree: false
    });
  }

  /**
   * Setups list of languages and current language.
   */
  private setupLanguage(): void {
    let userRegionLanguage = navigator.language?.split('-')[0];
    userRegionLanguage = isSupportedLanguage(userRegionLanguage) ? userRegionLanguage : 'en';
    const lng = this.cookieService.get('lng') || userRegionLanguage;
    this.translateService.setDefaultLang(lng);
    this.translateService.use(lng);
  }

  /**
   * Log current dev build timestamp.
   * @private
   */
  private printTimestamp(): void {
    if (isDevMode()) {
      // @ts-ignore
      import('@app/timestamp')
        .then(data => console.debug(`It's a development build, timestamp: ${data.timestamp}`))
        .catch(() => {
          console.debug('timestamp file is not found');
        });
    }
  }

  /**
   * Loads platform config and checks is server active.
   */
  private loadPlatformConfig(): void {
    this.platformConfigurationService.loadPlatformConfig().subscribe(isAvailable => {
      this.isBackendAvailable = isAvailable;
      document.getElementById('loader')?.classList.add('disabled');
      setTimeout(() => document.getElementById('loader')?.remove(), 400); /* ios safari */
    });
  }

  private setupUISettings(queryParams: QueryParams): void {
    const hideUI = queryParams.hideUnusedUI === 'true';

    if (hideUI) {
      this.document.body.classList.add('hide-unused-ui');
      this.removeLiveChatInIframe();
    }
  }
}
