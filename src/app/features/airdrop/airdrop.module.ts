import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirdropPageComponent } from './components/airdrop-page/airdrop-page.component';
import { AirdropRoutingModule } from '@features/airdrop/airdrop-routing.module';
import { SwapButtonContainerModule } from '@features/swaps/shared/components/swap-button-container/swap-button-container.module';
import { TuiInputModule } from '@taiga-ui/kit';
import { AirdropAddressComponent } from './components/airdrop-address/airdrop-address.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ClaimButtonComponent } from './components/claim-button/claim-button.component';

@NgModule({
  declarations: [AirdropPageComponent, AirdropAddressComponent, ClaimButtonComponent],
  imports: [
    CommonModule,
    AirdropRoutingModule,
    SwapButtonContainerModule,
    TuiInputModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class AirdropModule {}
