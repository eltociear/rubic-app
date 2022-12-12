import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DifferentAddressesModalComponent } from './different-addresses-modal.component';

describe('DifferentAddressesModalComponent', () => {
  let component: DifferentAddressesModalComponent;
  let fixture: ComponentFixture<DifferentAddressesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DifferentAddressesModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DifferentAddressesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
