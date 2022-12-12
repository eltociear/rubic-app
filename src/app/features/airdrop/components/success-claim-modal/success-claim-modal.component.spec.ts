import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SuccessClaimModalComponent } from '@features/airdrop/components/success-claim-modal/success-claim-modal.component';

describe('DifferentAddressesModalComponent', () => {
  let component: SuccessClaimModalComponent;
  let fixture: ComponentFixture<SuccessClaimModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuccessClaimModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessClaimModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
