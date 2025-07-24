import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountInsuranceAdjustedEstimateComponent } from './patient-account-insurance-adjusted-estimate.component';

describe('PatientAccountInsuranceAdjustedEstimateComponent', () => {
  let component: PatientAccountInsuranceAdjustedEstimateComponent;
  let fixture: ComponentFixture<PatientAccountInsuranceAdjustedEstimateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAccountInsuranceAdjustedEstimateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountInsuranceAdjustedEstimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
