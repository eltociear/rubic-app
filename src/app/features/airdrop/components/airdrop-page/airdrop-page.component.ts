import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-airdrop-page',
  templateUrl: './airdrop-page.component.html',
  styleUrls: ['./airdrop-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AirdropPageComponent {
  public readonly isUserLoggedIn$ = this.authService.currentUser$.pipe(
    map(user => Boolean(user?.address))
  );

  constructor(private readonly authService: AuthService) {}
}
