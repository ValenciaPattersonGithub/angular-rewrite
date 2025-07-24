import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountSummaryComponent } from './patient-account-summary.component';

describe('PatientAccountSummaryComponent', () => {
  let component: PatientAccountSummaryComponent;
  let fixture: ComponentFixture<PatientAccountSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAccountSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
