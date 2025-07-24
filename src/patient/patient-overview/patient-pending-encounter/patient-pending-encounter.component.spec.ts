import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPendingEncounterComponent } from './patient-pending-encounter.component';

describe('PatientPendingEncounterComponent', () => {
  let component: PatientPendingEncounterComponent;
  let fixture: ComponentFixture<PatientPendingEncounterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPendingEncounterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPendingEncounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
