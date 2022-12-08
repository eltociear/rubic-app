import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RubicTokenComponent } from './rubic-token.component';

describe('RubicTokenComponent', () => {
  let component: RubicTokenComponent;
  let fixture: ComponentFixture<RubicTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RubicTokenComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RubicTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
