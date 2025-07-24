import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPreventiveCareComponent } from './patient-preventive-care.component';

describe('PatientPreventiveCareComponent', () => {
  let component: PatientPreventiveCareComponent;
  let fixture: ComponentFixture<PatientPreventiveCareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPreventiveCareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPreventiveCareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
