import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountBalanceComponent } from './patient-account-balance.component';

describe('PatientAccountBalanceComponent', () => {
  let component: PatientAccountBalanceComponent;
  let fixture: ComponentFixture<PatientAccountBalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAccountBalanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountBalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
