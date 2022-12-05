import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AirdropPageComponent } from './airdrop-page.component';

describe('AirdropPageComponent', () => {
  let component: AirdropPageComponent;
  let fixture: ComponentFixture<AirdropPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AirdropPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AirdropPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
