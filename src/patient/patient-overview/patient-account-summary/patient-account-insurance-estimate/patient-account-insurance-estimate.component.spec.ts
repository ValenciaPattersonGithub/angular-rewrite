import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountInsuranceEstimateComponent } from './patient-account-insurance-estimate.component';

describe('PatientAccountInsuranceEstimateComponent', () => {
  let component: PatientAccountInsuranceEstimateComponent;
  let fixture: ComponentFixture<PatientAccountInsuranceEstimateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAccountInsuranceEstimateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountInsuranceEstimateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
