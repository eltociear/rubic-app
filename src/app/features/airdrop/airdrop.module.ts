import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AirdropPageComponent } from './components/airdrop-page/airdrop-page.component';
import { AirdropRoutingModule } from '@features/airdrop/airdrop-routing.module';
import { TuiInputModule } from '@taiga-ui/kit';
import { AirdropAddressComponent } from './components/airdrop-address/airdrop-address.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ClaimButtonComponent } from './components/claim-button/claim-button.component';
import { RubicTokenComponent } from './components/rubic-token/rubic-token.component';

@NgModule({
  declarations: [
    AirdropPageComponent,
    AirdropAddressComponent,
    ClaimButtonComponent,
    RubicTokenComponent
  ],
  imports: [CommonModule, AirdropRoutingModule, TuiInputModule, ReactiveFormsModule, SharedModule]
})
export class AirdropModule {}
