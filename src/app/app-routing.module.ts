import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EXTERNAL_LINKS, ROUTE_PATH } from '@shared/constants/common/links';

const routes: Routes = [
  {
    path: ROUTE_PATH.BYT_CRYPTO,
    redirectTo: `https://app.rubic.exchane/${ROUTE_PATH.BYT_CRYPTO}`
  },
  {
    path: ROUTE_PATH.ABOUT,
    redirectTo: EXTERNAL_LINKS.LANDING
  },
  {
    path: ROUTE_PATH.FAQ,
    redirectTo: `https://app.rubic.exchane/${ROUTE_PATH.FAQ}`
  },
  {
    path: ROUTE_PATH.STAKING,
    redirectTo: `https://app.rubic.exchane/${ROUTE_PATH.STAKING}`
  },
  {
    path: ROUTE_PATH.PROMOTION,
    redirectTo: `https://app.rubic.exchane/${ROUTE_PATH.PROMOTION}`
  },
  {
    path: ROUTE_PATH.NONE,
    loadChildren: () => import('./features/airdrop/airdrop.module').then(m => m.AirdropModule)
  },
  {
    path: ROUTE_PATH.REST,
    redirectTo: '/'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      onSameUrlNavigation: 'reload',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
