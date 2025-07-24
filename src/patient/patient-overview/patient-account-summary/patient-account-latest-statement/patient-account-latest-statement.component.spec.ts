import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountLatestStatementComponent } from './patient-account-latest-statement.component';

describe('PatientAccountLatestStatementComponent', () => {
  let component: PatientAccountLatestStatementComponent;
  let fixture: ComponentFixture<PatientAccountLatestStatementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAccountLatestStatementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountLatestStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
