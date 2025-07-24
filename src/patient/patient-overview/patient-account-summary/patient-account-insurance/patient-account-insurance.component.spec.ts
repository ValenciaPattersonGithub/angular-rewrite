import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountInsuranceComponent } from './patient-account-insurance.component';

describe('PatientAccountInsuranceComponent', () => {
  let component: PatientAccountInsuranceComponent;
  let fixture: ComponentFixture<PatientAccountInsuranceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAccountInsuranceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
