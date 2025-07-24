import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAlertFlagsComponent } from './patient-alert-flags.component';

describe('PatientAlertFlagsComponent', () => {
  let component: PatientAlertFlagsComponent;
  let fixture: ComponentFixture<PatientAlertFlagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAlertFlagsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAlertFlagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
