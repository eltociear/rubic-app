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
import { InlineSVGModule } from 'ng-inline-svg-2';
import { TuiTextfieldControllerModule } from '@taiga-ui/core';
import { DifferentAddressesModalComponent } from './components/different-addresses-modal/different-addresses-modal.component';
import { SuccessClaimModalComponent } from '@features/airdrop/components/success-claim-modal/success-claim-modal.component';
import { AirdropPopupService } from '@features/airdrop/services/airdrop-popup.service';
import { AirdropWeb3Service } from '@features/airdrop/services/airdrop-web3.service';
import { AirdropMerkleService } from '@features/airdrop/services/airdrop-merkle.service';
import { AirdropFacadeService } from '@features/airdrop/services/airdrop-facade.service';

@NgModule({
  declarations: [
    AirdropPageComponent,
    AirdropAddressComponent,
    ClaimButtonComponent,
    RubicTokenComponent,
    DifferentAddressesModalComponent,
    SuccessClaimModalComponent
  ],
  imports: [
    CommonModule,
    AirdropRoutingModule,
    TuiInputModule,
    ReactiveFormsModule,
    SharedModule,
    InlineSVGModule,
    TuiTextfieldControllerModule
  ],
  providers: [AirdropFacadeService, AirdropPopupService, AirdropWeb3Service, AirdropMerkleService]
})
export class AirdropModule {}
