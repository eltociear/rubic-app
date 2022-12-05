import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirdropAddressComponent } from './airdrop-address.component';

describe('AirdropAddressComponent', () => {
  let component: AirdropAddressComponent;
  let fixture: ComponentFixture<AirdropAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AirdropAddressComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AirdropAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
